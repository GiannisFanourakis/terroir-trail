import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { createApp } from '../app';
import { registerAnalyticsRoutes } from '../analyticsRoutes';
import type { IngestIntentEventParams } from '../services/analyticsIngestionService';

const VALID_CLIENT_EVENT_ID = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
const VALID_SESSION_ID = 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e';
const TEST_HMAC_SECRET = 'test-analytics-secret-key-32-chars-long';

test('analytics API accepts anonymous producer view, pseudonyms session, and derives destination', async () => {
  const calls: IngestIntentEventParams[] = [];
  const app = createApp();
  registerAnalyticsRoutes(app, {
    getHmacSecret: () => TEST_HMAC_SECRET,
    verifyToken: async () => { throw new Error('should not be called for anonymous'); },
    lookupProducer: async (id: string) => {
      if (id === 'prod-1') {
        return { id: 'prod-1', destination: 'peloponnese', country: 'greece', category: 'winery' };
      }
      return null;
    },
    ingestEvent: async (params) => {
      calls.push(params);
      return { success: true };
    },
  });

  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  try {
    const res = await fetch(`${base}/api/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schemaVersion: 1,
        event: 'producer_view',
        clientEventId: VALID_CLIENT_EVENT_ID,
        sessionId: VALID_SESSION_ID,
        producerId: 'prod-1',
        sourceSurface: 'map_quick_card',
      }),
    });

    assert.equal(res.status, 200);
    const body = await res.json() as any;
    assert.equal(body.accepted, true);
    assert.equal(body.clientEventId, VALID_CLIENT_EVENT_ID);

    assert.equal(calls.length, 1);
    const recorded = calls[0];
    assert.equal(recorded.clientEventId, VALID_CLIENT_EVENT_ID);
    assert.equal(recorded.eventName, 'producer_view');
    assert.equal(recorded.actorScope, 'anonymous');
    assert.equal(recorded.actorKey, null);
    assert.ok(recorded.sessionKey && recorded.sessionKey.length > 20);
    assert.equal(recorded.producerId, 'prod-1');
    assert.equal(recorded.destination, 'peloponnese');
    assert.equal(recorded.countryCode, 'GR');
    assert.equal(recorded.category, 'winery');
    assert.equal(recorded.sourceSurface, 'map_quick_card');
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close(err => err ? reject(err) : resolve())
    );
  }
});

test('analytics API accepts authenticated save, pseudonyms traveler UID, and resolves canonical metadata', async () => {
  const calls: IngestIntentEventParams[] = [];
  const app = createApp();
  registerAnalyticsRoutes(app, {
    getHmacSecret: () => TEST_HMAC_SECRET,
    verifyToken: async (token) => {
      if (token === 'valid-user-token') return { uid: 'raw-firebase-traveler-uid-123' } as any;
      throw new Error('invalid token');
    },
    lookupProducer: async (id: string) => {
      if (id === 'prod-1') {
        return { id: 'prod-1', destination: 'crete', country: 'greece', category: 'olive_mill' };
      }
      return null;
    },
    ingestEvent: async (params) => {
      calls.push(params);
      return { success: true };
    },
  });

  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  try {
    const res = await fetch(`${base}/api/analytics/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-user-token',
      },
      body: JSON.stringify({
        schemaVersion: 1,
        event: 'producer_save',
        clientEventId: VALID_CLIENT_EVENT_ID,
        sessionId: VALID_SESSION_ID,
        producerId: 'prod-1',
        sourceSurface: 'producer_drawer',
      }),
    });

    assert.equal(res.status, 200);
    assert.equal(calls.length, 1);
    const call = calls[0];
    assert.equal(call.eventName, 'producer_save');
    assert.equal(call.actorScope, 'authenticated');
    assert.ok(call.actorKey !== null);
    assert.ok(call.actorKey.startsWith('v1:'));
    assert.equal(call.actorKey.includes('raw-firebase-traveler-uid-123'), false, 'Raw UID must never appear in actor_key');
    assert.equal(call.destination, 'crete');
    assert.equal(call.countryCode, 'GR');
    assert.equal(call.category, 'olive_mill');
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close(err => err ? reject(err) : resolve())
    );
  }
});

test('analytics API rejects unauthenticated save or passport events with 401', async () => {
  const app = createApp();
  registerAnalyticsRoutes(app, {
    getHmacSecret: () => TEST_HMAC_SECRET,
    lookupProducer: async () => ({ id: 'prod-1', destination: 'crete', country: 'greece', category: 'winery' }),
    ingestEvent: async () => ({ success: true }),
  });

  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  try {
    const resSave = await fetch(`${base}/api/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schemaVersion: 1,
        event: 'producer_save',
        clientEventId: VALID_CLIENT_EVENT_ID,
        sessionId: VALID_SESSION_ID,
        producerId: 'prod-1',
        sourceSurface: 'producer_drawer',
      }),
    });
    assert.equal(resSave.status, 401);

    const resPassport = await fetch(`${base}/api/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schemaVersion: 1,
        event: 'passport_stamp_added',
        clientEventId: VALID_CLIENT_EVENT_ID,
        sessionId: VALID_SESSION_ID,
        producerId: 'prod-1',
        sourceSurface: 'producer_drawer',
      }),
    });
    assert.equal(resPassport.status, 401);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close(err => err ? reject(err) : resolve())
    );
  }
});

test('analytics API rejects unrecognized JSON property, invalid schema, and forbidden combinations with 400', async () => {
  const app = createApp();
  registerAnalyticsRoutes(app, {
    getHmacSecret: () => TEST_HMAC_SECRET,
    lookupProducer: async (id: string) => {
      if (id === 'prod-1') {
        return { id: 'prod-1', destination: 'crete', country: 'greece', category: 'winery' };
      }
      return null;
    },
    ingestEvent: async () => ({ success: true }),
  });

  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  try {
    // 1. Unrecognized property
    const resUnknown = await fetch(`${base}/api/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schemaVersion: 1,
        event: 'producer_view',
        clientEventId: VALID_CLIENT_EVENT_ID,
        sessionId: VALID_SESSION_ID,
        producerId: 'prod-1',
        sourceSurface: 'map_quick_card',
        unexpectedField: 'forbidden',
      }),
    });
    assert.equal(resUnknown.status, 400);
    assert.ok(((await resUnknown.json()) as any).error.includes('Unrecognized property'));

    // 2. Unsupported schema version
    const resVersion = await fetch(`${base}/api/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schemaVersion: 2,
        event: 'producer_view',
        clientEventId: VALID_CLIENT_EVENT_ID,
        sessionId: VALID_SESSION_ID,
        producerId: 'prod-1',
        sourceSurface: 'map_quick_card',
      }),
    });
    assert.equal(resVersion.status, 400);

    // 3. Unknown event name (e.g. trip_view is not allowed)
    const resTrip = await fetch(`${base}/api/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schemaVersion: 1,
        event: 'trip_create',
        clientEventId: VALID_CLIENT_EVENT_ID,
        sessionId: VALID_SESSION_ID,
        sourceSurface: 'my_trips',
      }),
    });
    assert.equal(resTrip.status, 400);

    // 4. Illegal event/sourceSurface combination
    const resCombo = await fetch(`${base}/api/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schemaVersion: 1,
        event: 'producer_view',
        clientEventId: VALID_CLIENT_EVENT_ID,
        sessionId: VALID_SESSION_ID,
        producerId: 'prod-1',
        sourceSurface: 'map_affiliate_banner', // illegal for producer_view
      }),
    });
    assert.equal(resCombo.status, 400);

    // 5. Malformed UUID for clientEventId
    const resUuid = await fetch(`${base}/api/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schemaVersion: 1,
        event: 'producer_view',
        clientEventId: 'not-a-valid-uuid',
        sessionId: VALID_SESSION_ID,
        producerId: 'prod-1',
        sourceSurface: 'map_quick_card',
      }),
    });
    assert.equal(resUuid.status, 400);

    // 6. Unknown producerId
    const resProd = await fetch(`${base}/api/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schemaVersion: 1,
        event: 'producer_view',
        clientEventId: VALID_CLIENT_EVENT_ID,
        sessionId: VALID_SESSION_ID,
        producerId: 'non-existent-producer',
        sourceSurface: 'map_quick_card',
      }),
    });
    assert.equal(resProd.status, 400);
    assert.ok(((await resProd.json()) as any).error.includes('not found in canonical catalogue'));
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close(err => err ? reject(err) : resolve())
    );
  }
});

test('analytics API handles region and affiliate events properly', async () => {
  const calls: IngestIntentEventParams[] = [];
  const app = createApp();
  registerAnalyticsRoutes(app, {
    getHmacSecret: () => TEST_HMAC_SECRET,
    ingestEvent: async (params) => {
      calls.push(params);
      return { success: true };
    },
  });

  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  try {
    // 1. Valid region_open
    const resRegion = await fetch(`${base}/api/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schemaVersion: 1,
        event: 'region_open',
        clientEventId: VALID_CLIENT_EVENT_ID,
        sessionId: VALID_SESSION_ID,
        destination: 'crete',
        sourceSurface: 'map_canvas',
      }),
    });
    assert.equal(resRegion.status, 200);
    assert.equal(calls[0].eventName, 'region_open');
    assert.equal(calls[0].destination, 'crete');
    assert.equal(calls[0].countryCode, 'GR');

    // 2. Region event with producerId forbidden
    const resRegionWithProd = await fetch(`${base}/api/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schemaVersion: 1,
        event: 'region_open',
        clientEventId: VALID_CLIENT_EVENT_ID,
        sessionId: VALID_SESSION_ID,
        destination: 'crete',
        producerId: 'some-prod',
        sourceSurface: 'map_canvas',
      }),
    });
    assert.equal(resRegionWithProd.status, 400);

    // 3. Valid affiliate_click
    const resAffiliate = await fetch(`${base}/api/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schemaVersion: 1,
        event: 'affiliate_click',
        clientEventId: 'b1c2d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d5e',
        sessionId: VALID_SESSION_ID,
        affiliateCampaignId: 'localrent-cars',
        sourceSurface: 'map_affiliate_banner',
      }),
    });
    assert.equal(resAffiliate.status, 200);
    assert.equal(calls[1].eventName, 'affiliate_click');
    assert.equal(calls[1].affiliateCampaign, 'localrent-cars');

    // 4. Invalid affiliate campaign
    const resInvalidAffiliate = await fetch(`${base}/api/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schemaVersion: 1,
        event: 'affiliate_click',
        clientEventId: 'b1c2d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d5e',
        sessionId: VALID_SESSION_ID,
        affiliateCampaignId: 'unapproved_sponsor',
        sourceSurface: 'map_affiliate_banner',
      }),
    });
    assert.equal(resInvalidAffiliate.status, 400);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close(err => err ? reject(err) : resolve())
    );
  }
});

test('analytics API returns 503 when HMAC secret missing or ingestion fails without leaking credentials', async () => {
  // Missing secret
  const appNoSecret = createApp();
  registerAnalyticsRoutes(appNoSecret, {
    getHmacSecret: () => '',
    lookupProducer: async () => ({ id: 'prod-1', destination: 'crete', country: 'greece', category: 'winery' }),
    ingestEvent: async () => ({ success: true }),
  });

  const server1 = appNoSecret.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server1.once('listening', resolve));
  const base1 = `http://127.0.0.1:${(server1.address() as AddressInfo).port}`;

  try {
    const res = await fetch(`${base1}/api/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schemaVersion: 1,
        event: 'producer_view',
        clientEventId: VALID_CLIENT_EVENT_ID,
        sessionId: VALID_SESSION_ID,
        producerId: 'prod-1',
        sourceSurface: 'map_quick_card',
      }),
    });
    assert.equal(res.status, 503);
    const body = await res.json() as any;
    assert.equal(body.error, 'Analytics service is temporarily unavailable.');
  } finally {
    await new Promise<void>((resolve, reject) =>
      server1.close(err => err ? reject(err) : resolve())
    );
  }

  // Database ingestion failure
  const appFail = createApp();
  registerAnalyticsRoutes(appFail, {
    getHmacSecret: () => TEST_HMAC_SECRET,
    lookupProducer: async () => ({ id: 'prod-1', destination: 'crete', country: 'greece', category: 'winery' }),
    ingestEvent: async () => ({ success: false, error: 'Supabase RPC connection refused with secret xyz' }),
  });

  const server2 = appFail.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server2.once('listening', resolve));
  const base2 = `http://127.0.0.1:${(server2.address() as AddressInfo).port}`;

  try {
    const res = await fetch(`${base2}/api/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schemaVersion: 1,
        event: 'producer_view',
        clientEventId: VALID_CLIENT_EVENT_ID,
        sessionId: VALID_SESSION_ID,
        producerId: 'prod-1',
        sourceSurface: 'map_quick_card',
      }),
    });
    assert.equal(res.status, 503);
    const body = await res.json() as any;
    assert.equal(body.error, 'Analytics warehouse is temporarily unavailable.');
    assert.equal(JSON.stringify(body).includes('secret xyz'), false);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server2.close(err => err ? reject(err) : resolve())
    );
  }
});


test('analytics API enforces authenticated and context-free My Trips events', async () => {
  const calls: IngestIntentEventParams[] = [];
  const app = createApp();
  registerAnalyticsRoutes(app, {
    getHmacSecret: () => TEST_HMAC_SECRET,
    verifyToken: async token => {
      if (token === 'valid-trip-user') return { uid: 'trip-user-1' } as any;
      throw new Error('invalid token');
    },
    lookupProducer: async id => ({
      id,
      destination: 'crete',
      country: 'greece',
      category: 'winery',
    }),
    ingestEvent: async params => {
      calls.push(params);
      return { success: true };
    },
  });

  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const base = 'http://127.0.0.1:' + (server.address() as AddressInfo).port;

  try {
    const unauthenticated = await fetch(base + '/api/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schemaVersion: 1,
        event: 'trip_created',
        clientEventId: VALID_CLIENT_EVENT_ID,
        sessionId: VALID_SESSION_ID,
        sourceSurface: 'my_trips',
      }),
    });
    assert.equal(unauthenticated.status, 401);

    const privateContext = await fetch(base + '/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid-trip-user',
      },
      body: JSON.stringify({
        schemaVersion: 1,
        event: 'trip_opened',
        clientEventId: VALID_CLIENT_EVENT_ID,
        sessionId: VALID_SESSION_ID,
        sourceSurface: 'my_trips',
        destination: 'crete',
      }),
    });
    assert.equal(privateContext.status, 400);

    const validCreated = await fetch(base + '/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid-trip-user',
      },
      body: JSON.stringify({
        schemaVersion: 1,
        event: 'trip_created',
        clientEventId: VALID_CLIENT_EVENT_ID,
        sessionId: VALID_SESSION_ID,
        sourceSurface: 'my_trips',
      }),
    });
    assert.equal(validCreated.status, 200);
    assert.equal(calls[0].eventName, 'trip_created');
    assert.equal(calls[0].producerId, null);
    assert.equal(calls[0].destination, null);

    const validAdd = await fetch(base + '/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid-trip-user',
      },
      body: JSON.stringify({
        schemaVersion: 1,
        event: 'trip_producer_added',
        clientEventId: 'c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f',
        sessionId: VALID_SESSION_ID,
        sourceSurface: 'trip_add_flow',
        producerId: 'prod-trip-1',
      }),
    });
    assert.equal(validAdd.status, 200);
    assert.equal(calls[1].eventName, 'trip_producer_added');
    assert.equal(calls[1].producerId, 'prod-trip-1');
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close(error => error ? reject(error) : resolve())
    );
  }
});
