import { randomBytes } from 'node:crypto';
import type Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import { adminDb } from '../firebaseAdmin';
import { stripe } from '../stripeClient';
import { getTrustedAccountCapabilities } from './accountAuthorization';
import { getSupabaseAdmin } from './analyticsIngestionService';

export type PartnerBillingStatus = 'pending' | 'active' | 'past_due' | 'grace' | 'cancelled' | 'expired';

export class PartnerBillingError extends Error {
  constructor(
    public readonly code: 'bad_request' | 'forbidden' | 'conflict' | 'service_unavailable',
    message: string
  ) {
    super(message);
    this.name = 'PartnerBillingError';
  }
}

const PLAN_CODE = 'partner_annual_v1';
const PURPOSE = 'producer_partner';
const MAX_GRACE_DAYS = 30;

const requireSupabase = (client: SupabaseClient | null): SupabaseClient => {
  if (!client) {
    throw new PartnerBillingError('service_unavailable', 'Partner billing is temporarily unavailable.');
  }
  return client;
};

const publicAppUrl = () => {
  const url = new URL(process.env.APP_URL || 'http://localhost:5173');
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && url.hostname === 'localhost')) {
    throw new PartnerBillingError('service_unavailable', 'Partner billing return URL is not configured safely.');
  }
  url.search = '';
  url.hash = '';
  return url;
};

const configuredPriceId = () => {
  const priceId = process.env.STRIPE_PARTNER_ANNUAL_PRICE_ID?.trim() || '';
  if (!/^price_[A-Za-z0-9_]+$/.test(priceId)) {
    throw new PartnerBillingError('service_unavailable', 'Partner annual billing is not configured.');
  }
  return priceId;
};

export const getPartnerBillingAvailability = () => {
  const priceId = process.env.STRIPE_PARTNER_ANNUAL_PRICE_ID?.trim() || '';
  const enabled = process.env.STRIPE_PARTNER_BILLING_ENABLED === 'true';
  const configured = /^price_[A-Za-z0-9_]+$/.test(priceId);
  return {
    checkoutEnabled: enabled && configured,
    portalEnabled: enabled,
    planCode: PLAN_CODE as const,
  };
};

const requireBillingEnabled = () => {
  const availability = getPartnerBillingAvailability();
  if (!availability.checkoutEnabled) {
    throw new PartnerBillingError('service_unavailable', 'Partner Checkout is not enabled yet.');
  }
  return configuredPriceId();
};

const requireOwnedProducer = async (actorUid: string, producerId: string, db: any) => {
  const cleanProducerId = producerId.trim();
  if (!cleanProducerId) {
    throw new PartnerBillingError('bad_request', 'Producer ID is required.');
  }

  const capabilities = await getTrustedAccountCapabilities(actorUid, db);
  if (!capabilities.producerIds.includes(cleanProducerId)) {
    throw new PartnerBillingError('forbidden', 'Verified Host ownership is required for Partner billing.');
  }

  return cleanProducerId;
};

const stripeStringId = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim()) return value;
  if (value && typeof value === 'object' && typeof (value as any).id === 'string') {
    return (value as any).id;
  }
  return null;
};

const timestampIso = (value: unknown): string | null => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null;
  return new Date(value * 1000).toISOString();
};

const subscriptionPeriod = (subscription: Stripe.Subscription) => {
  const raw = subscription as any;
  let start = typeof raw.current_period_start === 'number' ? raw.current_period_start : null;
  let end = typeof raw.current_period_end === 'number' ? raw.current_period_end : null;

  const items = Array.isArray(raw.items?.data) ? raw.items.data : [];
  for (const item of items) {
    if (start === null && typeof item?.current_period_start === 'number') {
      start = item.current_period_start;
    }
    if (end === null && typeof item?.current_period_end === 'number') {
      end = item.current_period_end;
    }
  }

  return {
    currentPeriodStart: timestampIso(start),
    currentPeriodEnd: timestampIso(end),
  };
};

const subscriptionContainsPrice = (subscription: Stripe.Subscription, expectedPriceId: string) =>
  (subscription.items?.data || []).some((item: any) => stripeStringId(item?.price) === expectedPriceId);

const graceUntil = (now = Date.now()) => {
  const parsed = Number(process.env.PARTNER_BILLING_GRACE_DAYS || '7');
  const days = Number.isFinite(parsed) ? Math.min(Math.max(Math.floor(parsed), 1), MAX_GRACE_DAYS) : 7;
  return new Date(now + days * 24 * 60 * 60 * 1000).toISOString();
};

const mapSubscriptionStatus = (
  status: Stripe.Subscription.Status | string,
  force?: 'paid' | 'failed' | 'deleted'
): { status: PartnerBillingStatus; graceUntil: string | null } => {
  if (force === 'paid') return { status: 'active', graceUntil: null };
  if (force === 'failed') return { status: 'grace', graceUntil: graceUntil() };
  if (force === 'deleted') return { status: 'expired', graceUntil: null };

  switch (status) {
    case 'active':
      return { status: 'active', graceUntil: null };
    case 'past_due':
      return { status: 'grace', graceUntil: graceUntil() };
    case 'canceled':
    case 'unpaid':
    case 'incomplete_expired':
      return { status: 'expired', graceUntil: null };
    case 'incomplete':
    case 'paused':
    case 'trialing':
    default:
      return { status: 'pending', graceUntil: null };
  }
};

async function latestStripeCustomerId(
  producerId: string,
  client: SupabaseClient
): Promise<string | null> {
  const { data, error } = await client
    .from('commercial_partner_subscriptions')
    .select('provider_customer_id')
    .eq('producer_id', producerId)
    .not('provider_customer_id', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(1);

  if (error) {
    throw new PartnerBillingError('service_unavailable', 'Partner billing history is temporarily unavailable.');
  }

  const value = Array.isArray(data) ? (data[0] as any)?.provider_customer_id : null;
  return typeof value === 'string' && value ? value : null;
}

export async function createPartnerCheckout(
  actorUid: string,
  actorEmail: string | null | undefined,
  producerId: string,
  db = adminDb(),
  client: SupabaseClient | null = getSupabaseAdmin(),
  stripeClient = stripe
): Promise<{ url: string }> {
  const priceId = requireBillingEnabled();
  const ownedProducerId = await requireOwnedProducer(actorUid, producerId, db);
  const supabase = requireSupabase(client);

  const { error: prepareError } = await supabase.rpc('prepare_commercial_partner_checkout_v1', {
    p_producer_id: ownedProducerId,
    p_actor_uid: actorUid,
  });
  if (prepareError) {
    const message = String(prepareError.message || '');
    if (message.includes('partner_already_active') || message.includes('admin_pilot_active')) {
      throw new PartnerBillingError('conflict', 'This producer already has an active Partner relationship.');
    }
    throw new PartnerBillingError('service_unavailable', 'Partner checkout could not be prepared.');
  }

  const existingCustomerId = await latestStripeCustomerId(ownedProducerId, supabase);
  const appUrl = publicAppUrl();
  const success = new URL(appUrl);
  success.searchParams.set('partnerCheckout', 'success');
  success.searchParams.set('producer', ownedProducerId);
  const cancel = new URL(appUrl);
  cancel.searchParams.set('partnerCheckout', 'cancelled');
  cancel.searchParams.set('producer', ownedProducerId);

  const metadata = {
    purpose: PURPOSE,
    producerId: ownedProducerId,
    hostUid: actorUid,
    planCode: PLAN_CODE,
  };

  const suffix = randomBytes(8)
    .toString('base64url')
    .replace(/[^A-Za-z]/g, '')
    .slice(0, 8)
    .padEnd(8, 'x');

  const session = await stripeClient.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: actorUid,
    metadata,
    subscription_data: {
      metadata,
      description: 'TerroirTrail Partner annual subscription',
      billing_mode: { type: 'flexible' },
    },
    ...(existingCustomerId
      ? { customer: existingCustomerId }
      : actorEmail
        ? { customer_email: actorEmail }
        : {}),
    success_url: success.toString(),
    cancel_url: cancel.toString(),
    integration_identifier: `terroirtrail_partner_${suffix}`,
  });

  if (!session.url) {
    throw new PartnerBillingError('service_unavailable', 'Stripe Checkout did not return a usable URL.');
  }

  return { url: session.url };
}

export async function createPartnerBillingPortal(
  actorUid: string,
  producerId: string,
  db = adminDb(),
  client: SupabaseClient | null = getSupabaseAdmin(),
  stripeClient = stripe
): Promise<{ url: string }> {
  if (!getPartnerBillingAvailability().portalEnabled) {
    throw new PartnerBillingError('service_unavailable', 'Partner billing management is not enabled yet.');
  }

  const ownedProducerId = await requireOwnedProducer(actorUid, producerId, db);
  const supabase = requireSupabase(client);
  const customerId = await latestStripeCustomerId(ownedProducerId, supabase);
  if (!customerId) {
    throw new PartnerBillingError('conflict', 'No Stripe billing profile exists for this producer yet.');
  }

  const returnUrl = publicAppUrl();
  returnUrl.searchParams.set('partnerBilling', 'return');
  returnUrl.searchParams.set('producer', ownedProducerId);

  const portal = await stripeClient.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl.toString(),
  });

  if (!portal.url) {
    throw new PartnerBillingError('service_unavailable', 'Stripe billing management is temporarily unavailable.');
  }

  return { url: portal.url };
}

async function applySubscriptionEvent(
  event: Stripe.Event,
  subscription: Stripe.Subscription,
  force: 'paid' | 'failed' | 'deleted' | undefined,
  client: SupabaseClient
) {
  const expectedPriceId = configuredPriceId();
  const metadata = subscription.metadata || {};
  if (metadata.purpose !== PURPOSE || metadata.planCode !== PLAN_CODE) {
    return { processed: false, eventType: event.type, reason: 'not_partner_subscription' };
  }

  const producerId = metadata.producerId?.trim();
  if (!producerId) {
    throw new PartnerBillingError('bad_request', 'Partner subscription metadata is missing producerId.');
  }
  if (!subscriptionContainsPrice(subscription, expectedPriceId)) {
    throw new PartnerBillingError('bad_request', 'Partner subscription does not contain the configured annual price.');
  }

  const customerId = stripeStringId(subscription.customer);
  if (!customerId) {
    throw new PartnerBillingError('bad_request', 'Partner subscription is missing its Stripe customer.');
  }

  const { status, graceUntil: nextGraceUntil } = mapSubscriptionStatus(subscription.status, force);
  const period = subscriptionPeriod(subscription);
  const { data, error } = await client.rpc('apply_stripe_partner_subscription_event_v1', {
    p_event_id: event.id,
    p_event_type: event.type,
    p_provider_created_at: timestampIso(event.created),
    p_producer_id: producerId,
    p_provider_customer_id: customerId,
    p_provider_subscription_id: subscription.id,
    p_subscription_status: status,
    p_current_period_start: period.currentPeriodStart,
    p_current_period_end: period.currentPeriodEnd,
    p_grace_until: nextGraceUntil,
    p_cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
  });

  if (error) {
    throw new PartnerBillingError('service_unavailable', 'Partner subscription state could not be persisted.');
  }

  return {
    processed: Boolean((data as any)?.processed),
    duplicate: Boolean((data as any)?.duplicate),
    eventType: event.type,
    producerId,
    subscriptionStatus: status,
  };
}

const invoiceSubscriptionId = (invoice: Stripe.Invoice): string | null => {
  const raw = invoice as any;
  return (
    stripeStringId(raw.parent?.subscription_details?.subscription) ||
    stripeStringId(raw.subscription) ||
    null
  );
};

export async function processPartnerStripeEvent(
  event: Stripe.Event,
  client: SupabaseClient | null = getSupabaseAdmin(),
  stripeClient = stripe
): Promise<{
  processed: boolean;
  eventType: string;
  reason?: string;
  duplicate?: boolean;
  producerId?: string;
  subscriptionStatus?: PartnerBillingStatus;
}> {
  const supabase = requireSupabase(client);

  if (
    event.type === 'customer.subscription.created' ||
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.deleted'
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    return applySubscriptionEvent(
      event,
      subscription,
      event.type === 'customer.subscription.deleted' ? 'deleted' : undefined,
      supabase
    );
  }

  if (event.type === 'invoice.paid' || event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId = invoiceSubscriptionId(invoice);
    if (!subscriptionId) {
      return { processed: false, eventType: event.type, reason: 'invoice_without_subscription' };
    }
    const subscription = await stripeClient.subscriptions.retrieve(subscriptionId);
    return applySubscriptionEvent(
      event,
      subscription,
      event.type === 'invoice.paid' ? 'paid' : 'failed',
      supabase
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.metadata?.purpose !== PURPOSE) {
      return { processed: false, eventType: event.type, reason: 'not_partner_checkout' };
    }
    return { processed: false, eventType: event.type, reason: 'subscription_webhook_is_authoritative' };
  }

  return { processed: false, eventType: event.type, reason: 'unhandled_event' };
}
