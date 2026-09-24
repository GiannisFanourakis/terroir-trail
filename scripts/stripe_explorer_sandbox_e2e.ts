import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Stripe from 'stripe';

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
      'Stripe CLI config was not found. Create or select a Stripe sandbox first.'
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
if (
  !/^(?:sk|rkcs)_test_/.test(secretKey) ||
  /^(?:sk|rk)_live_/.test(secretKey)
) {
  throw new Error(
    'Refusing to run Explorer E2E without a Stripe test/sandbox key.'
  );
}

const stripe = new Stripe(secretKey);
const runId = 'explorer-e2e-' + Date.now().toString(36);
const userId = 'sandbox-traveler-' + runId;
let productId: string | null = null;
let holidayPriceId: string | null = null;
let annualPriceId: string | null = null;
let holidaySessionId: string | null = null;
let annualSessionId: string | null = null;
let customerId: string | null = null;
let paymentMethodId: string | null = null;
let subscriptionId: string | null = null;

async function main() {
  const product = await stripe.products.create({
    name: 'TerroirTrail Explorer Pass E2E',
    tax_code: 'txcd_10701401',
    metadata: { purpose: 'explorer_pass_e2e', runId },
  });
  productId = product.id;

  const holidayPrice = await stripe.prices.create({
    product: product.id,
    currency: 'eur',
    unit_amount: 999,
    tax_behavior: 'inclusive',
    metadata: { purpose: 'explorer_pass_e2e', plan: 'holiday', runId },
  });
  holidayPriceId = holidayPrice.id;

  const annualPrice = await stripe.prices.create({
    product: product.id,
    currency: 'eur',
    unit_amount: 2499,
    tax_behavior: 'inclusive',
    recurring: { interval: 'year' },
    metadata: { purpose: 'explorer_pass_e2e', plan: 'annual', runId },
  });
  annualPriceId = annualPrice.id;

  process.env.STRIPE_SECRET_KEY = secretKey;
  process.env.STRIPE_HOLIDAY_PRICE_ID = holidayPrice.id;
  process.env.STRIPE_ANNUAL_PRICE_ID = annualPrice.id;
  process.env.EXPLORER_PASS_CHECKOUT_ENABLED = 'true';
  process.env.APP_URL = 'https://terroir-trail.web.app';

  const { createPassCheckout } = await import('../server/services/passService');
  const { validateAnnualSubscription } =
    await import('../server/services/passPolicy');

  const captured: Stripe.Checkout.SessionCreateParams[] = [];
  const checkoutClient = {
    checkout: {
      sessions: {
        create: async (args: Stripe.Checkout.SessionCreateParams) => {
          captured.push(args);
          const sandboxArgs: any = { ...args };
          delete sandboxArgs.automatic_tax;
          return stripe.checkout.sessions.create(sandboxArgs);
        },
      },
    },
  } as unknown as Stripe;

  const consumerConsent = {
    ageConfirmed: true,
    termsAccepted: true,
    immediatePerformanceRequested: true,
  };

  const holidayResult = await createPassCheckout(
    userId,
    'Explorer E2E',
    'holiday',
    'explorer-e2e@example.invalid',
    consumerConsent,
    checkoutClient
  );
  assert.match(holidayResult.url, /^https:\/\/checkout\.stripe\.com\//);
  let sessions = await stripe.checkout.sessions.list({ limit: 20 });
  const holidaySession = sessions.data.find(
    (session) =>
      session.client_reference_id === userId && session.mode === 'payment'
  );
  assert(holidaySession);
  holidaySessionId = holidaySession.id;
  const holidayRetrieved = await stripe.checkout.sessions.retrieve(
    holidaySession.id,
    {
      expand: ['line_items.data.price'],
    }
  );
  assert.equal(holidayRetrieved.amount_total, 999);
  assert.equal(
    holidayRetrieved.line_items?.data[0]?.price?.id,
    holidayPrice.id
  );

  const annualResult = await createPassCheckout(
    userId,
    'Explorer E2E',
    'annual',
    'explorer-e2e@example.invalid',
    consumerConsent,
    checkoutClient
  );
  assert.match(annualResult.url, /^https:\/\/checkout\.stripe\.com\//);
  sessions = await stripe.checkout.sessions.list({ limit: 20 });
  const annualSession = sessions.data.find(
    (session) =>
      session.client_reference_id === userId && session.mode === 'subscription'
  );
  assert(annualSession);
  annualSessionId = annualSession.id;
  const annualRetrieved = await stripe.checkout.sessions.retrieve(
    annualSession.id,
    {
      expand: ['line_items.data.price'],
    }
  );
  assert.equal(annualRetrieved.amount_total, 2499);
  assert.equal(annualRetrieved.line_items?.data[0]?.price?.id, annualPrice.id);

  assert.equal(captured.length, 2);
  assert.deepEqual(captured[0].automatic_tax, { enabled: true });
  assert.equal(captured[0].billing_address_collection, 'required');
  assert.equal(captured[0].mode, 'payment');
  assert.deepEqual(captured[1].automatic_tax, { enabled: true });
  assert.equal(captured[1].billing_address_collection, 'required');
  assert.equal(captured[1].mode, 'subscription');
  assert.equal(
    captured[1].subscription_data?.metadata?.purpose,
    'explorer_pass'
  );

  const customer = await stripe.customers.create({
    email: 'explorer-e2e@example.invalid',
    metadata: { runId },
  });
  customerId = customer.id;
  const paymentMethod = await stripe.paymentMethods.create({
    type: 'card',
    card: { token: 'tok_visa' },
  } as any);
  paymentMethodId = paymentMethod.id;
  await stripe.paymentMethods.attach(paymentMethod.id, {
    customer: customer.id,
  });
  await stripe.customers.update(customer.id, {
    invoice_settings: { default_payment_method: paymentMethod.id },
  });

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: annualPrice.id }],
    default_payment_method: paymentMethod.id,
    metadata: {
      purpose: 'explorer_pass',
      userId,
      plan: 'annual',
    },
    expand: ['items.data.price'],
  });
  subscriptionId = subscription.id;
  assert.equal(subscription.status, 'active');
  const active = validateAnnualSubscription(subscription, userId);
  assert.equal(active.customerId, customer.id);
  assert(Date.parse(active.expiresAt) > Date.now());

  const scheduled = await stripe.subscriptions.update(subscription.id, {
    cancel_at_period_end: true,
    expand: ['items.data.price'],
  });
  validateAnnualSubscription(scheduled, userId);
  assert.equal(scheduled.cancel_at_period_end, true);

  await stripe.subscriptions.cancel(subscription.id);
  subscriptionId = null;
  const cancelled = await stripe.subscriptions.retrieve(subscription.id, {
    expand: ['items.data.price'],
  });
  assert.throws(() => validateAnnualSubscription(cancelled, userId));

  console.log('[Explorer sandbox E2E] Holiday hosted Checkout contract ✓');
  console.log('[Explorer sandbox E2E] Annual hosted Checkout contract ✓');
  console.log(
    '[Explorer sandbox E2E] Annual active → cancel-at-period-end → canceled ✓'
  );
  console.log('[Explorer sandbox E2E] PASS');
}

async function cleanup() {
  if (subscriptionId) {
    await stripe.subscriptions.cancel(subscriptionId).catch(() => undefined);
  }
  for (const sessionId of [holidaySessionId, annualSessionId]) {
    if (sessionId) {
      await stripe.checkout.sessions.expire(sessionId).catch(() => undefined);
    }
  }
  if (paymentMethodId) {
    await stripe.paymentMethods.detach(paymentMethodId).catch(() => undefined);
  }
  if (customerId) {
    await stripe.customers.del(customerId).catch(() => undefined);
  }
  for (const priceId of [holidayPriceId, annualPriceId]) {
    if (priceId) {
      await stripe.prices
        .update(priceId, { active: false })
        .catch(() => undefined);
    }
  }
  if (productId) {
    await stripe.products
      .update(productId, { active: false })
      .catch(() => undefined);
  }
}

main()
  .catch((error) => {
    console.error(
      '[Explorer sandbox E2E] FAIL:',
      error instanceof Error ? error.message : error
    );
    process.exitCode = 1;
  })
  .finally(cleanup);
