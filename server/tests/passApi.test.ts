import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { createApp } from '../app';
import { stripe } from '../stripeClient';
import { handleWebhookEvent } from '../services/webhookService';

test('pass API authenticates identity and ignores client prices', async () => {
  let checkoutArgs: unknown[] = [];
  let confirmArgs: unknown[] = [];
  let portalArgs: unknown[] = [];
  const server = createApp({
    verifyToken: async (token) => {
      if (token !== 'valid') throw new Error('invalid token');
      return {
        uid: 'alice',
        name: 'Alice',
        email: 'alice@example.test',
      } as any;
    },
    createPassCheckout: async (...args) => {
      checkoutArgs = args;
      return { url: 'https://checkout.stripe.com/test' };
    },
    createPassBillingPortal: async (...args) => {
      portalArgs = args;
      return { url: 'https://billing.stripe.com/test' };
    },
    fulfillPass: async (...args) => {
      confirmArgs = args;
      throw new Error('unpaid');
    },
    getExplorerPass: async () => null,
    isActiveProducerOwner: async () => false,
    verifyExplorerPass: async () => null,
    handleWebhookEvent,
  }).listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const post = (path: string, body: object, token?: string) =>
    fetch(base + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
  try {
    assert.equal(
      (await post('/api/passes/checkout', { plan: 'holiday' })).status,
      401
    );
    assert.equal(
      (await post('/api/passes/checkout', { plan: 'holiday' }, 'forged'))
        .status,
      401
    );
    assert.equal(
      (await post('/api/passes/checkout', { plan: 'fake' }, 'valid')).status,
      400
    );
    assert.equal(
      (
        await post(
          '/api/passes/checkout',
          {
            plan: 'holiday',
            userId: 'bob',
            priceId: 'cheap',
            successUrl: 'https://evil.test',
          },
          'valid'
        )
      ).status,
      200
    );
    assert.deepEqual(checkoutArgs, [
      'alice',
      'Alice',
      'holiday',
      'alice@example.test',
    ]);
    assert.equal((await post('/api/passes/portal', {}, 'valid')).status, 200);
    assert.deepEqual(portalArgs, ['alice']);
    assert.equal(
      (
        await post(
          '/api/passes/confirm',
          { sessionId: 'cs_test_other', userId: 'bob' },
          'valid'
        )
      ).status,
      409
    );
    assert.deepEqual(confirmArgs, ['cs_test_other', 'alice']);
    assert.equal(
      (await post('/api/webhook', { type: 'checkout.session.completed' }))
        .status,
      400
    );
    assert.equal((await post('/api/create-product', {}, 'valid')).status, 404);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))
    );
  }
});

test('pass verification authenticates and authorizes active producer ownership before pass lookup', async () => {
  const validPass = {
    passId: '78e4a766-e771-4f50-9f7b-b367e027f507',
    name: 'Verified Explorer',
    plan: 'holiday' as const,
    expiresAt: '2099-01-01T00:00:00Z',
  };
  const ownerships = new Map<string, 'inactive' | 'active'>([
    ['inactive-host', 'inactive'],
    ['active-host', 'active'],
  ]);
  const ownershipChecks: string[] = [];
  const verificationCalls: string[] = [];
  const server = createApp({
    verifyToken: async (token) => {
      if (token === 'invalid') throw new Error('invalid token');
      return { uid: token } as any;
    },
    isActiveProducerOwner: async (uid) => {
      ownershipChecks.push(uid);
      if (uid === 'ownership-failure') throw new Error('firestore unavailable');
      return ownerships.get(uid) === 'active';
    },
    createPassCheckout: async () => ({
      url: 'https://checkout.stripe.com/test',
    }),
    fulfillPass: async () => null,
    getExplorerPass: async () => null,
    verifyExplorerPass: async (passId) => {
      verificationCalls.push(passId);
      return passId === validPass.passId ? validPass : null;
    },
    handleWebhookEvent,
  }).listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const verify = (passId: string, token?: string) =>
    fetch(`${base}/api/passes/verify/${passId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

  try {
    const unauthenticated = await verify(validPass.passId);
    assert.equal(unauthenticated.status, 401);
    assert.equal(unauthenticated.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await unauthenticated.json(), {
      error: 'Sign in to manage your Explorer pass.',
    });
    assert.deepEqual(ownershipChecks, []);
    assert.deepEqual(verificationCalls, []);

    const invalidToken = await verify(validPass.passId, 'invalid');
    assert.equal(invalidToken.status, 401);
    assert.deepEqual(await invalidToken.json(), {
      error: 'Your session has expired. Please sign in again.',
    });
    assert.deepEqual(ownershipChecks, []);
    assert.deepEqual(verificationCalls, []);

    const traveler = await verify(validPass.passId, 'traveler');
    assert.equal(traveler.status, 403);
    assert.deepEqual(await traveler.json(), {
      error: 'Verified producer access is required to verify Explorer passes.',
    });
    assert.deepEqual(ownershipChecks, ['traveler']);
    assert.deepEqual(verificationCalls, []);

    const inactiveHost = await verify(validPass.passId, 'inactive-host');
    assert.equal(inactiveHost.status, 403);
    assert.deepEqual(await inactiveHost.json(), {
      error: 'Verified producer access is required to verify Explorer passes.',
    });
    assert.deepEqual(ownershipChecks, ['traveler', 'inactive-host']);
    assert.deepEqual(verificationCalls, []);

    const unavailable = await verify(validPass.passId, 'ownership-failure');
    assert.equal(unavailable.status, 503);
    assert.deepEqual(await unavailable.json(), {
      error: 'Pass verification is temporarily unavailable.',
    });
    assert.deepEqual(verificationCalls, []);

    const invalidPass = await verify('expired-pass', 'active-host');
    assert.equal(invalidPass.status, 404);
    assert.deepEqual(verificationCalls, ['expired-pass']);

    const verified = await verify(validPass.passId, 'active-host');
    assert.equal(verified.status, 200);
    assert.equal(verified.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await verified.json(), { pass: validPass });
    assert.deepEqual(verificationCalls, ['expired-pass', validPass.passId]);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))
    );
  }
});

test('webhooks require valid signatures and process paid sessions only', async () => {
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_unit_test_only';
  const payload = JSON.stringify({
    id: 'evt_test',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_valid',
        metadata: { purpose: 'explorer_pass' },
        payment_status: 'paid',
      },
    },
  });
  let calls = 0;
  const fulfill = async () => {
    calls++;
    return null;
  };
  await assert.rejects(handleWebhookEvent(payload, undefined, fulfill));
  await assert.rejects(handleWebhookEvent(payload, 'forged', fulfill));
  const header = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: process.env.STRIPE_WEBHOOK_SECRET,
  });
  assert.equal(
    (await handleWebhookEvent(payload, header, fulfill)).processed,
    true
  );
  assert.equal(calls, 1);
  const unpaid = payload.replace('"paid"', '"unpaid"');
  const unpaidHeader = stripe.webhooks.generateTestHeaderString({
    payload: unpaid,
    secret: process.env.STRIPE_WEBHOOK_SECRET,
  });
  assert.equal(
    (await handleWebhookEvent(unpaid, unpaidHeader, fulfill)).processed,
    false
  );
  assert.equal(calls, 1);

  const partnerPayload = JSON.stringify({
    id: 'evt_partner',
    type: 'customer.subscription.updated',
    data: { object: { id: 'sub_partner' } },
  });
  const partnerHeader = stripe.webhooks.generateTestHeaderString({
    payload: partnerPayload,
    secret: process.env.STRIPE_WEBHOOK_SECRET,
  });
  let partnerCalls = 0;
  const processPartner = async (event: any) => {
    partnerCalls += 1;
    assert.equal(event.id, 'evt_partner');
    return { processed: true, eventType: event.type };
  };
  const partnerResult = await handleWebhookEvent(
    partnerPayload,
    partnerHeader,
    fulfill,
    processPartner as any
  );
  assert.equal(partnerResult.processed, true);
  assert.equal(partnerCalls, 1);
  assert.equal(calls, 1);

  delete process.env.STRIPE_WEBHOOK_SECRET;
  await assert.rejects(handleWebhookEvent(payload, header, fulfill));
});
