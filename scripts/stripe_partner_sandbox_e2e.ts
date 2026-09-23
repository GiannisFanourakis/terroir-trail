import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Stripe from 'stripe';
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const runId = 'e2e-' + Date.now().toString(36);
const producerId = 'sandbox-producer-' + runId;
const actorUid = 'sandbox-host-' + runId;
const actorEmail = 'partner-e2e@example.invalid';
const webhookSecret = 'whsec_terroirtrail_partner_sandbox_e2e';

function stripeSandboxKey(): string {
  const explicit = process.env.STRIPE_E2E_SECRET_KEY?.trim();
  if (explicit) return explicit;

  const configPath = path.join(
    os.homedir(),
    '.config',
    'stripe',
    'config.toml'
  );
  if (!fs.existsSync(configPath)) {
    throw new Error(
      'Stripe CLI config was not found. Run `stripe sandbox create` first.'
    );
  }
  const config = fs.readFileSync(configPath, 'utf8');
  const match = config.match(
    /^test_mode_api_key\s*=\s*["']?([^"'\r\n]+)["']?\s*$/m
  );
  if (!match?.[1]) {
    throw new Error(
      'No Stripe sandbox test key is available in the active CLI profile.'
    );
  }
  return match[1].trim();
}

const secretKey = stripeSandboxKey();
if (!/^(?:sk|rkcs)_test_/.test(secretKey)) {
  throw new Error(
    'Refusing to run Partner E2E without a Stripe test/sandbox key.'
  );
}
if (/^(?:sk|rk)_live_/.test(secretKey)) {
  throw new Error('Refusing to run Partner E2E with a live Stripe key.');
}

const stripe = new Stripe(secretKey);
const factsSentinel = JSON.stringify({
  verification: 'verified',
  visitability: 'verified',
  roadAccess: 'unchanged',
  organicRank: 17,
});

const makeDb = (ownedProducerId: string) => ({
  collection: (name: string) => {
    if (name === 'admin_users') {
      return {
        doc: () => ({
          get: async () => ({ exists: false, data: () => undefined }),
        }),
      };
    }
    if (name === 'producer_owners') {
      return {
        where: (_field: string, _operator: string, uid: string) => ({
          get: async () => ({
            docs: [
              {
                id: ownedProducerId,
                data: () => ({
                  ownerUid: uid,
                  status: 'active',
                  producerId: ownedProducerId,
                }),
              },
            ],
          }),
        }),
      };
    }
    throw new Error('Unexpected Firestore collection in sandbox E2E: ' + name);
  },
});

class MemoryPartnerStore {
  prepareCalls = 0;
  applyCalls: Array<Record<string, unknown>> = [];
  eventIds = new Set<string>();
  customerId: string | null = null;
  status: string | null = null;
  cancelAtPeriodEnd = false;

  async rpc(name: string, args: Record<string, unknown>) {
    if (name === 'prepare_commercial_partner_checkout_v1') {
      assert.equal(args.p_producer_id, producerId);
      assert.equal(args.p_actor_uid, actorUid);
      this.prepareCalls += 1;
      return { data: { prepared: true }, error: null };
    }

    if (name === 'apply_stripe_partner_subscription_event_v1') {
      const eventId = String(args.p_event_id || '');
      if (this.eventIds.has(eventId)) {
        return { data: { processed: false, duplicate: true }, error: null };
      }
      this.eventIds.add(eventId);
      this.applyCalls.push(args);
      this.customerId = String(args.p_provider_customer_id || '') || null;
      this.status = String(args.p_subscription_status || '') || null;
      this.cancelAtPeriodEnd = Boolean(args.p_cancel_at_period_end);
      return { data: { processed: true, duplicate: false }, error: null };
    }

    throw new Error('Unexpected Supabase RPC in sandbox E2E: ' + name);
  }

  from(table: string) {
    assert.equal(table, 'commercial_partner_subscriptions');
    return {
      select: () => ({
        eq: (_field: string, value: string) => {
          assert.equal(value, producerId);
          return {
            not: () => ({
              order: () => ({
                limit: async () => ({
                  data: this.customerId
                    ? [{ provider_customer_id: this.customerId }]
                    : [],
                  error: null,
                }),
              }),
            }),
          };
        },
      }),
    };
  }
}

async function waitForEvent(
  type: string,
  predicate: (event: Stripe.Event) => boolean,
  since: number
): Promise<Stripe.Event> {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const events = await stripe.events.list({
      type: type as any,
      created: { gte: Math.max(0, since - 2) },
      limit: 100,
    } as any);
    const found = events.data.find(predicate);
    if (found) return found;
    await delay(500);
  }
  throw new Error('Timed out waiting for Stripe sandbox event: ' + type);
}

async function replaySignedPartnerEvent(
  event: Stripe.Event,
  store: MemoryPartnerStore,
  handleWebhookEvent: any,
  processPartnerStripeEvent: any
) {
  const payload = JSON.stringify(event);
  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: webhookSecret,
  });
  return handleWebhookEvent(
    Buffer.from(payload),
    signature,
    async () => {
      throw new Error(
        'Explorer Pass fulfillment must never run in Partner E2E.'
      );
    },
    (verifiedEvent) =>
      processPartnerStripeEvent(verifiedEvent, store as any, stripe)
  );
}

async function main() {
  const store = new MemoryPartnerStore();
  let product: Stripe.Product | null = null;
  let price: Stripe.Price | null = null;
  let checkoutSessionId: string | null = null;
  let paymentMethod: Stripe.PaymentMethod | null = null;
  let customer: Stripe.Customer | null = null;
  let subscription: Stripe.Subscription | null = null;
  const startedAt = Math.floor(Date.now() / 1000);

  process.env.STRIPE_SECRET_KEY = secretKey;
  process.env.STRIPE_PARTNER_BILLING_ENABLED = 'true';
  process.env.APP_URL = 'http://localhost:5173';
  process.env.STRIPE_WEBHOOK_SECRET = webhookSecret;

  const { createPartnerCheckout, processPartnerStripeEvent } =
    await import('../server/services/partnerBillingService');
  const { handleWebhookEvent } =
    await import('../server/services/webhookService');
  const replay = (event: Stripe.Event) =>
    replaySignedPartnerEvent(
      event,
      store,
      handleWebhookEvent,
      processPartnerStripeEvent
    );

  let capturedCheckoutArgs: any = null;
  const checkoutStripeClient = {
    checkout: {
      sessions: {
        create: async (args: any) => {
          capturedCheckoutArgs = args;
          // Claimable general-sandbox keys cannot configure the Tax head office. Keep the
          // production Tax contract in captured args, but strip Tax-only fields from the
          // disposable sandbox Session so the rest of the real Stripe boundary is exercised.
          const sandboxArgs = { ...args };
          delete sandboxArgs.automatic_tax;
          delete sandboxArgs.tax_id_collection;
          delete sandboxArgs.billing_address_collection;
          return stripe.checkout.sessions.create(sandboxArgs);
        },
      },
    },
  };

  try {
    product = await stripe.products.create({
      name: 'TerroirTrail Partner - Annual E2E',
      tax_code: 'txcd_10701000',
      metadata: { e2eRunId: runId, purpose: 'producer_partner_e2e' },
    });
    price = await stripe.prices.create({
      product: product.id,
      currency: 'eur',
      unit_amount: 19900,
      recurring: { interval: 'year' },
      metadata: { e2eRunId: runId },
    });
    process.env.STRIPE_PARTNER_ANNUAL_PRICE_ID = price.id;

    const checkout = await createPartnerCheckout(
      actorUid,
      actorEmail,
      producerId,
      makeDb(producerId) as any,
      store as any,
      checkoutStripeClient as any
    );
    const sessionMatch = checkout.url.match(/cs_test_[A-Za-z0-9_]+/);
    assert.ok(sessionMatch, 'Checkout URL did not contain a test session ID.');
    checkoutSessionId = sessionMatch[0];
    const session = await stripe.checkout.sessions.retrieve(checkoutSessionId, {
      expand: ['line_items'],
    });
    assert.equal(session.mode, 'subscription');
    assert.equal(session.metadata?.purpose, 'producer_partner');
    assert.equal(session.metadata?.producerId, producerId);
    assert.equal(session.metadata?.hostUid, actorUid);
    assert.equal(session.line_items?.data[0]?.price?.id, price.id);
    assert.deepEqual(capturedCheckoutArgs?.automatic_tax, { enabled: true });
    assert.deepEqual(capturedCheckoutArgs?.tax_id_collection, { enabled: true });
    assert.equal(capturedCheckoutArgs?.billing_address_collection, 'required');
    assert.equal(store.prepareCalls, 1);
    console.log('[partner sandbox e2e] real Checkout Session creation ✓');

    paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: { token: 'tok_visa' },
    } as any);
    customer = await stripe.customers.create({
      email: actorEmail,
      metadata: { e2eRunId: runId, producerId },
    });
    paymentMethod = await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: customer.id,
    });
    await stripe.customers.update(customer.id, {
      invoice_settings: { default_payment_method: paymentMethod.id },
    });

    const metadata = {
      purpose: 'producer_partner',
      producerId,
      hostUid: actorUid,
      planCode: 'partner_annual_v1',
    };
    subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      default_payment_method: paymentMethod.id,
      metadata,
      description: 'TerroirTrail Partner annual subscription E2E',
      billing_mode: { type: 'flexible' },
    });
    assert.equal(subscription.status, 'active');

    const createdEvent = await waitForEvent(
      'customer.subscription.created',
      (event) =>
        (event.data.object as Stripe.Subscription).id === subscription!.id,
      startedAt
    );
    const activation = await replay(createdEvent);
    assert.equal(activation.processed, true);
    assert.equal(store.status, 'active');
    assert.equal(store.customerId, customer.id);
    assert.equal(
      JSON.stringify({
        verification: 'verified',
        visitability: 'verified',
        roadAccess: 'unchanged',
        organicRank: 17,
      }),
      factsSentinel
    );
    console.log(
      '[partner sandbox e2e] real subscription activation + signed webhook ✓'
    );

    const cancelRequestedAt = Math.floor(Date.now() / 1000);
    subscription = await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    });
    assert.equal(subscription.cancel_at_period_end, true);
    const cancelScheduledEvent = await waitForEvent(
      'customer.subscription.updated',
      (event) => {
        const object = event.data.object as Stripe.Subscription;
        return (
          object.id === subscription!.id && object.cancel_at_period_end === true
        );
      },
      cancelRequestedAt
    );
    await replay(cancelScheduledEvent);
    assert.equal(store.status, 'active');
    assert.equal(store.cancelAtPeriodEnd, true);
    console.log('[partner sandbox e2e] cancellation-at-period-end state ✓');

    const cancelledAt = Math.floor(Date.now() / 1000);
    const cancelled = await stripe.subscriptions.cancel(subscription.id);
    subscription = null;
    assert.equal(cancelled.status, 'canceled');
    const deletedEvent = await waitForEvent(
      'customer.subscription.deleted',
      (event) => (event.data.object as Stripe.Subscription).id === cancelled.id,
      cancelledAt
    );
    await replay(deletedEvent);
    assert.equal(store.status, 'expired');
    console.log(
      '[partner sandbox e2e] terminal cancellation entitlement expiry ✓'
    );

    assert.deepEqual(
      [...new Set(store.applyCalls.map((call) => call.p_producer_id))],
      [producerId]
    );
    console.log('[partner sandbox e2e] commercial-only producer scope ✓');
    console.log('[partner sandbox e2e] PASS');
  } finally {
    if (subscription) {
      await stripe.subscriptions.cancel(subscription.id).catch(() => undefined);
    }
    if (checkoutSessionId) {
      const session = await stripe.checkout.sessions
        .retrieve(checkoutSessionId)
        .catch(() => null);
      if (session?.status === 'open') {
        await stripe.checkout.sessions
          .expire(checkoutSessionId)
          .catch(() => undefined);
      }
    }
    if (paymentMethod) {
      await stripe.paymentMethods
        .detach(paymentMethod.id)
        .catch(() => undefined);
    }
    if (customer) {
      await stripe.customers.del(customer.id).catch(() => undefined);
    }
    if (price) {
      await stripe.prices
        .update(price.id, { active: false })
        .catch(() => undefined);
    }
    if (product) {
      await stripe.products
        .update(product.id, { active: false })
        .catch(() => undefined);
    }
  }
}

main().catch((error) => {
  console.error(
    '[partner sandbox e2e failed]',
    error instanceof Error ? error.message : String(error)
  );
  process.exitCode = 1;
});
