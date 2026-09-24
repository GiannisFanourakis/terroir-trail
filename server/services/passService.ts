import { randomUUID } from 'node:crypto';
import type Stripe from 'stripe';
import { adminDb } from '../firebaseAdmin';
import { stripe } from '../stripeClient';
import {
  getPassPlan,
  isPassActive,
  publicPass,
  validateAnnualSubscription,
  validatePassPayment,
  type PassRecord,
} from './passPolicy';

const passes = () => adminDb().collection('explorerPasses');

export const EXPLORER_CONSUMER_TERMS_VERSION = '2026-09-24';

export interface ExplorerPassConsumerConsent {
  ageConfirmed: boolean;
  termsAccepted: boolean;
  immediatePerformanceRequested: boolean;
}

function requireConsumerConsent(
  consent: ExplorerPassConsumerConsent | undefined
): ExplorerPassConsumerConsent {
  if (
    !consent ||
    consent.ageConfirmed !== true ||
    consent.termsAccepted !== true ||
    consent.immediatePerformanceRequested !== true
  ) {
    throw new Error(
      'Explorer Pass checkout requires age, Terms, and immediate-activation confirmation.'
    );
  }
  return consent;
}

function explorerPassCheckoutEnabled() {
  return process.env.EXPLORER_PASS_CHECKOUT_ENABLED === 'true';
}

function appUrl() {
  const url = new URL(process.env.APP_URL || 'http://localhost:5173');
  if (
    url.protocol !== 'https:' &&
    !(url.protocol === 'http:' && url.hostname === 'localhost')
  ) {
    throw new Error('APP_URL must use HTTPS (except localhost).');
  }
  url.search = '';
  url.hash = '';
  return url;
}
const stripeStringId = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim()) return value;
  if (
    value &&
    typeof value === 'object' &&
    typeof (value as any).id === 'string'
  ) {
    return (value as any).id;
  }
  return null;
};

const invalidPayment = (error: unknown) =>
  error instanceof Error &&
  error.message === 'Payment is pending, invalid, refunded, or disputed.';

export async function createPassCheckout(
  userId: string,
  name: string,
  requestedPlan: unknown,
  email?: string | null,
  consumerConsent?: ExplorerPassConsumerConsent,
  stripeClient: Stripe = stripe
) {
  if (!explorerPassCheckoutEnabled()) {
    throw new Error('Explorer Pass checkout is disabled.');
  }

  const consent = requireConsumerConsent(consumerConsent);
  const config = getPassPlan(requestedPlan);
  const consentAt = new Date().toISOString();
  const success = appUrl();
  success.search = '?explorerCheckout=success';
  const cancel = appUrl();
  cancel.search = '?explorerCheckout=cancelled';
  const metadata = {
    purpose: 'explorer_pass',
    userId,
    name: name.slice(0, 100),
    plan: config.plan,
    consumerTermsVersion: EXPLORER_CONSUMER_TERMS_VERSION,
    consumerConsentAt: consentAt,
    consumerAge18Plus: String(consent.ageConfirmed),
    consumerTermsAccepted: String(consent.termsAccepted),
    consumerImmediatePerformance: String(
      consent.immediatePerformanceRequested
    ),
  };
  const session = await stripeClient.checkout.sessions.create({
    mode: config.checkoutMode,
    line_items: [{ price: config.priceId, quantity: 1 }],
    client_reference_id: userId,
    metadata,
    ...(config.plan === 'annual'
      ? {
          subscription_data: {
            metadata,
            description: 'TerroirTrail Annual Explorer Pass',
          },
        }
      : {}),
    automatic_tax: { enabled: true },
    billing_address_collection: 'required',
    ...(email ? { customer_email: email } : {}),
    success_url: success.toString(),
    cancel_url: cancel.toString(),
  });

  if (!session.url) throw new Error('Checkout is unavailable.');
  return { url: session.url };
}

async function retrieveSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['items.data.price'],
  });
}

async function paidSession(sessionId: string, expectedUserId?: string) {
  if (!/^cs_[a-zA-Z0-9_]+$/.test(sessionId) || sessionId.length > 255) {
    throw new Error('Invalid checkout session.');
  }
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: [
      'line_items.data.price',
      'payment_intent.latest_charge',
      'subscription',
      'subscription.items.data.price',
    ],
  });
  const config = validatePassPayment(session, expectedUserId);

  if (config.plan === 'annual') {
    const subscriptionId = stripeStringId(session.subscription);
    if (!subscriptionId) {
      throw new Error('Payment is pending, invalid, refunded, or disputed.');
    }
    const subscription =
      session.subscription && typeof session.subscription !== 'string'
        ? session.subscription
        : await retrieveSubscription(subscriptionId);
    const annual = validateAnnualSubscription(subscription, expectedUserId);
    return { session, config, subscriptionId, annual };
  }

  return { session, config, subscriptionId: null, annual: null };
}

export async function fulfillPass(sessionId: string, expectedUserId?: string) {
  const verified = await paidSession(sessionId, expectedUserId);
  const { session, config } = verified;
  const ref = passes().doc(session.id);

  const pass = await adminDb().runTransaction(async (transaction) => {
    const existing = await transaction.get(ref);
    if (existing.exists) return existing.data() as PassRecord;
    const expiresAt =
      config.plan === 'annual' && verified.annual
        ? verified.annual.expiresAt
        : new Date(
            (session.created + config.days * 86400) * 1000
          ).toISOString();

    const record: PassRecord = {
      passId: randomUUID(),
      sessionId: session.id,
      ...(verified.subscriptionId
        ? { subscriptionId: verified.subscriptionId }
        : {}),
      ...(verified.annual?.customerId
        ? { customerId: verified.annual.customerId }
        : {}),
      userId: session.metadata!.userId,
      name: session.metadata!.name || 'Explorer',
      plan: config.plan,
      expiresAt,
      ...(session.metadata?.consumerConsentAt
        ? { consumerConsentAt: session.metadata.consumerConsentAt }
        : {}),
      ...(session.metadata?.consumerTermsVersion
        ? { consumerTermsVersion: session.metadata.consumerTermsVersion }
        : {}),
    };
    transaction.create(ref, record);
    return record;
  });

  const resolved = await resolvePassRecord(pass, pass.userId);
  return resolved ? publicPass(resolved) : null;
}

async function resolvePassRecord(
  pass: PassRecord,
  expectedUserId: string
): Promise<PassRecord | null> {
  if (pass.userId !== expectedUserId) return null;

  try {
    if (pass.plan === 'annual') {
      if (!pass.subscriptionId) return null;
      const subscription = await retrieveSubscription(pass.subscriptionId);
      const annual = validateAnnualSubscription(subscription, expectedUserId);
      return {
        ...pass,
        customerId: annual.customerId,
        expiresAt: annual.expiresAt,
      };
    }
    if (!isPassActive(pass)) return null;
    await paidSession(pass.sessionId, expectedUserId);
    return pass;
  } catch (error) {
    if (invalidPayment(error)) return null;
    throw error;
  }
}

async function activePassRecords(userId: string): Promise<PassRecord[]> {
  const snapshot = await passes().where('userId', '==', userId).get();
  const resolved = await Promise.all(
    snapshot.docs.map((doc) =>
      resolvePassRecord(doc.data() as PassRecord, userId)
    )
  );
  return resolved
    .filter((pass): pass is PassRecord => Boolean(pass))
    .sort((a, b) => Date.parse(b.expiresAt) - Date.parse(a.expiresAt));
}

export async function getExplorerPass(userId: string) {
  const active = await activePassRecords(userId);
  return active[0] ? publicPass(active[0]) : null;
}

export async function verifyExplorerPass(passId: string) {
  if (!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(passId)) {
    return null;
  }
  const snapshot = await passes().where('passId', '==', passId).limit(1).get();
  if (snapshot.empty) return null;
  const pass = snapshot.docs[0].data() as PassRecord;
  const resolved = await resolvePassRecord(pass, pass.userId);
  return resolved ? publicPass(resolved) : null;
}
export async function createPassBillingPortal(userId: string) {
  const active = await activePassRecords(userId);
  const annual = active.find(
    (pass) => pass.plan === 'annual' && Boolean(pass.customerId)
  );
  if (!annual?.customerId) {
    throw new Error(
      'No active annual Explorer subscription is available to manage.'
    );
  }

  const configuration =
    process.env.STRIPE_EXPLORER_PORTAL_CONFIGURATION_ID?.trim() || '';
  if (!/^bpc_[A-Za-z0-9_]+$/.test(configuration)) {
    throw new Error('Explorer billing management is not configured.');
  }

  const returnUrl = appUrl();
  returnUrl.search = '?explorerBilling=return';
  const portal = await stripe.billingPortal.sessions.create({
    customer: annual.customerId,
    configuration,
    return_url: returnUrl.toString(),
  });
  if (!portal.url) {
    throw new Error('Explorer billing management is temporarily unavailable.');
  }
  return { url: portal.url };
}
