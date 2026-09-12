import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { createApp } from '../app';
import { stripe } from '../stripeClient';
import { handleWebhookEvent } from '../services/webhookService';

test('pass API authenticates identity, ignores client prices and fails closed on invalid passes', async () => {
  let checkoutArgs: unknown[] = [];
  let confirmArgs: unknown[] = [];
  const server = createApp({
    verifyToken: async token => { if (token !== 'valid') throw new Error('invalid token'); return { uid: 'alice', name: 'Alice' } as any; },
    createPassCheckout: async (...args) => { checkoutArgs = args; return { url: 'https://checkout.stripe.com/test' }; },
    fulfillPass: async (...args) => { confirmArgs = args; throw new Error('unpaid'); },
    getExplorerPass: async () => null,
    verifyExplorerPass: async () => null,
    handleWebhookEvent,
  }).listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const post = (path: string, body: object, token?: string) => fetch(base + path, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body),
  });
  try {
    assert.equal((await post('/api/passes/checkout', { plan: 'holiday' })).status, 401);
    assert.equal((await post('/api/passes/checkout', { plan: 'holiday' }, 'forged')).status, 401);
    assert.equal((await post('/api/passes/checkout', { plan: 'fake' }, 'valid')).status, 400);
    assert.equal((await post('/api/passes/checkout', { plan: 'holiday', userId: 'bob', priceId: 'cheap', successUrl: 'https://evil.test' }, 'valid')).status, 200);
    assert.deepEqual(checkoutArgs, ['alice', 'Alice', 'holiday']);
    assert.equal((await post('/api/passes/confirm', { sessionId: 'cs_test_other', userId: 'bob' }, 'valid')).status, 409);
    assert.deepEqual(confirmArgs, ['cs_test_other', 'alice']);
    const invalid = await fetch(base + '/api/passes/verify/forged?name=Fake&tier=annual');
    assert.equal(invalid.status, 404);
    assert.equal(invalid.headers.get('cache-control'), 'no-store');
    assert.equal((await post('/api/webhook', { type: 'checkout.session.completed' })).status, 400);
    assert.equal((await post('/api/create-product', {}, 'valid')).status, 404);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});

test('webhooks require valid signatures and process paid sessions only', async () => {
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_unit_test_only';
  const payload = JSON.stringify({ id: 'evt_test', type: 'checkout.session.completed', data: { object: { id: 'cs_test_valid', metadata: { purpose: 'explorer_pass' }, payment_status: 'paid' } } });
  let calls = 0;
  const fulfill = async () => { calls++; return null; };
  await assert.rejects(handleWebhookEvent(payload, undefined, fulfill));
  await assert.rejects(handleWebhookEvent(payload, 'forged', fulfill));
  const header = stripe.webhooks.generateTestHeaderString({ payload, secret: process.env.STRIPE_WEBHOOK_SECRET });
  assert.equal((await handleWebhookEvent(payload, header, fulfill)).processed, true);
  assert.equal(calls, 1);
  const unpaid = payload.replace('"paid"', '"unpaid"');
  const unpaidHeader = stripe.webhooks.generateTestHeaderString({ payload: unpaid, secret: process.env.STRIPE_WEBHOOK_SECRET });
  assert.equal((await handleWebhookEvent(unpaid, unpaidHeader, fulfill)).processed, false);
  assert.equal(calls, 1);
  delete process.env.STRIPE_WEBHOOK_SECRET;
  await assert.rejects(handleWebhookEvent(payload, header, fulfill));
});
