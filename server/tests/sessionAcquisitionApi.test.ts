import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { createApp } from '../app';
import { registerSessionAcquisitionRoutes } from '../sessionAcquisitionRoutes';
import type { IngestSessionAcquisitionParams } from '../services/sessionAcquisitionService';

const TEST_HMAC_SECRET = '0123456789abcdef0123456789abcdef';
const VALID_SESSION_ID = '123e4567-e89b-42d3-a456-426614174000';

test('session acquisition API accepts bounded Instagram attribution and pseudonymizes the session', async () => {
  const calls: IngestSessionAcquisitionParams[] = [];
  const app = createApp();

  registerSessionAcquisitionRoutes(app, {
    getHmacSecret: () => TEST_HMAC_SECRET,
    deriveSessionKey: (sessionId, secret) =>
      'v1:' + Buffer.from(sessionId + secret).toString('hex').slice(0, 64).padEnd(64, '0'),
    ingestAcquisition: async (params) => {
      calls.push(params);
      return { success: true, inserted: true };
    },
  });

  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const base = 'http://127.0.0.1:' + (server.address() as AddressInfo).port;

  try {
    const response = await fetch(base + '/api/analytics/session-acquisition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schemaVersion: 1,
        sessionId: VALID_SESSION_ID,
        source: 'instagram',
        channel: 'social',
        campaign: 'profile',
        attributionMethod: 'utm',
      }),
    });

    assert.equal(response.status, 200);
    const body = (await response.json()) as any;
    assert.equal(body.accepted, true);
    assert.equal(body.inserted, true);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].source, 'instagram');
    assert.equal(calls[0].channel, 'social');
    assert.equal(calls[0].campaign, 'profile');
    assert.equal(calls[0].attributionMethod, 'utm');
    assert.match(calls[0].sessionKey, /^v1:[0-9a-f]{64}$/);
    assert.equal(calls[0].sessionKey.includes(VALID_SESSION_ID), false);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))
    );
  }
});

test('session acquisition API rejects raw or inconsistent attribution metadata', async () => {
  const app = createApp();

  registerSessionAcquisitionRoutes(app, {
    getHmacSecret: () => TEST_HMAC_SECRET,
    ingestAcquisition: async () => ({ success: true, inserted: true }),
  });

  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const base = 'http://127.0.0.1:' + (server.address() as AddressInfo).port;

  try {
    const withRawReferrer = await fetch(
      base + '/api/analytics/session-acquisition',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schemaVersion: 1,
          sessionId: VALID_SESSION_ID,
          source: 'instagram',
          channel: 'social',
          campaign: 'profile',
          attributionMethod: 'utm',
          referrer: 'https://instagram.com/private/path',
        }),
      }
    );
    assert.equal(withRawReferrer.status, 400);

    const invalidCampaign = await fetch(
      base + '/api/analytics/session-acquisition',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schemaVersion: 1,
          sessionId: VALID_SESSION_ID,
          source: 'instagram',
          channel: 'social',
          campaign: 'John Smith@example.com',
          attributionMethod: 'utm',
        }),
      }
    );
    assert.equal(invalidCampaign.status, 400);

    const inconsistentDirect = await fetch(
      base + '/api/analytics/session-acquisition',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schemaVersion: 1,
          sessionId: VALID_SESSION_ID,
          source: 'instagram',
          channel: 'direct',
          campaign: null,
          attributionMethod: 'direct',
        }),
      }
    );
    assert.equal(inconsistentDirect.status, 400);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))
    );
  }
});
