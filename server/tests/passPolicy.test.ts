import { test } from 'node:test';
import assert from 'node:assert/strict';
import type Stripe from 'stripe';
import {
  getPassPlan,
  isPassActive,
  publicPass,
  validateAnnualSubscription,
  validatePassPayment,
  type PassRecord,
} from '../services/passPolicy';

process.env.STRIPE_HOLIDAY_PRICE_ID = 'price_holiday';
process.env.STRIPE_ANNUAL_PRICE_ID = 'price_annual';

function paidSession(): Stripe.Checkout.Session {
  return {
    id: 'cs_test_valid',
    created: 1789257600,
    mode: 'payment',
    status: 'complete',
    payment_status: 'paid',
    currency: 'eur',
    amount_total: 999,
    metadata: { purpose: 'explorer_pass', userId: 'alice', plan: 'holiday' },
    client_reference_id: 'alice',
    line_items: {
      has_more: false,
      data: [{ price: { id: 'price_holiday' }, quantity: 1 }],
    },
    payment_intent: {
      latest_charge: {
        paid: true,
        refunded: false,
        amount_refunded: 0,
        disputed: false,
      },
    },
  } as unknown as Stripe.Checkout.Session;
}

test('a paid allowlisted EUR checkout grants the purchased duration to its owner', () => {
  assert.equal(validatePassPayment(paidSession(), 'alice').days, 14);
  const annual = paidSession();
  annual.metadata!.plan = 'annual';
  annual.mode = 'subscription';
  annual.amount_total = 2499;
  annual.line_items!.data[0].price!.id = 'price_annual';
  annual.payment_intent = null;
  annual.subscription = 'sub_annual';
  const annualConfig = validatePassPayment(annual, 'alice');
  assert.equal(annualConfig.days, 365);
  assert.equal(annualConfig.checkoutMode, 'subscription');
});

test('unpaid, discounted, substituted, refunded and disputed payments fail closed', () => {
  const cases: Array<(s: any) => void> = [
    (s) => (s.payment_status = 'unpaid'),
    (s) => (s.status = 'open'),
    (s) => (s.mode = 'subscription'),
    (s) => (s.amount_total = 1),
    (s) => (s.currency = 'usd'),
    (s) => (s.metadata.purpose = 'other'),
    (s) => (s.metadata.plan = 'invented'),
    (s) => (s.client_reference_id = 'bob'),
    (s) => (s.line_items.data[0].price.id = 'price_cheap'),
    (s) => (s.line_items.data[0].quantity = 2),
    (s) => (s.line_items.has_more = true),
    (s) => s.line_items.data.push(s.line_items.data[0]),
    (s) => (s.payment_intent.latest_charge.refunded = true),
    (s) => (s.payment_intent.latest_charge.amount_refunded = 1),
    (s) => (s.payment_intent.latest_charge.disputed = true),
    (s) => (s.payment_intent = null),
  ];
  for (const mutate of cases) {
    const session = paidSession();
    mutate(session);
    assert.throws(() => validatePassPayment(session, 'alice'));
  }
  assert.throws(() => validatePassPayment(paidSession(), 'bob'));
});

test('missing price configuration cannot fall back to a demo purchase', () => {
  const saved = process.env.STRIPE_HOLIDAY_PRICE_ID;
  delete process.env.STRIPE_HOLIDAY_PRICE_ID;
  assert.throws(() => getPassPlan('holiday'));
  process.env.STRIPE_HOLIDAY_PRICE_ID = saved;
});

test('expired and malformed passes are invalid; public data excludes account and checkout IDs', () => {
  const pass: PassRecord = {
    passId: 'opaque',
    sessionId: 'cs_test_valid',
    userId: 'alice',
    name: 'Alice',
    plan: 'holiday',
    expiresAt: '2026-10-01T00:00:00Z',
  };
  assert.equal(isPassActive(pass, Date.parse('2026-09-30')), true);
  assert.equal(isPassActive(pass, Date.parse(pass.expiresAt)), false);
  assert.equal(isPassActive({ ...pass, expiresAt: 'invalid' }), false);
  assert.equal('sessionId' in publicPass(pass), false);
  assert.equal('userId' in publicPass(pass), false);
});

test('annual subscription authority requires active owner metadata and configured price', () => {
  const subscription = {
    id: 'sub_annual',
    status: 'active',
    customer: 'cus_alice',
    metadata: { purpose: 'explorer_pass', userId: 'alice', plan: 'annual' },
    items: {
      data: [
        {
          price: { id: 'price_annual' },
          current_period_end: 4070908800,
        },
      ],
    },
  } as unknown as Stripe.Subscription;

  const active = validateAnnualSubscription(subscription, 'alice');
  assert.equal(active.customerId, 'cus_alice');
  assert.equal(active.expiresAt, '2099-01-01T00:00:00.000Z');

  assert.throws(() => validateAnnualSubscription(subscription, 'bob'));
  assert.throws(() =>
    validateAnnualSubscription(
      { ...subscription, status: 'canceled' } as Stripe.Subscription,
      'alice'
    )
  );
});
