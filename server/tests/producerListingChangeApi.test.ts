import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { createApp } from '../app';
import { registerProducerListingChangeRoutes } from '../producerListingChangeRoutes';
import { ProducerListingChangeError } from '../services/producerListingChangeService';

test('producer listing change API requires auth and preserves trusted service authorization', async () => {
  const calls: Array<{ type: string; args: unknown[] }> = [];
  const pending = {
    id: 'request-1',
    producerId: 'producer-a',
    producerName: 'Producer A',
    requesterUid: 'host',
    requesterEmail: 'host@example.com',
    status: 'pending_review' as const,
    changes: { tagLine: 'A reviewed tagline' },
    submittedAt: '2026-09-16T05:30:00.000Z',
  };

  const app = createApp({ verifyToken: async token => ({ uid: token }) as any });
  registerProducerListingChangeRoutes(app, {
    verifyToken: async token => {
      if (token === 'invalid') throw new Error('invalid');
      return { uid: token, email: `${token}@example.com` } as any;
    },
    getLatestProducerListingChange: async (uid, producerId) => {
      calls.push({ type: 'get', args: [uid, producerId] });
      if (uid === 'traveler') throw new ProducerListingChangeError('forbidden', 'Not an owner.');
      return pending;
    },
    submitProducerListingChanges: async (uid, email, producerId, changes) => {
      calls.push({ type: 'submit', args: [uid, email, producerId, changes] });
      if (uid === 'traveler') throw new ProducerListingChangeError('forbidden', 'Not an owner.');
      return pending;
    },
  });

  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const headers = (token?: string): Record<string, string> => token ? { Authorization: `Bearer ${token}` } : {};

  try {
    assert.equal((await fetch(`${base}/api/producer/listing-changes/producer-a`)).status, 401);
    assert.equal((await fetch(`${base}/api/producer/listing-changes/producer-a`, { headers: headers('invalid') })).status, 401);
    assert.equal((await fetch(`${base}/api/producer/listing-changes/producer-a`, { headers: headers('traveler') })).status, 403);

    const listed = await fetch(`${base}/api/producer/listing-changes/producer-a`, { headers: headers('host') });
    assert.equal(listed.status, 200);
    assert.deepEqual(await listed.json(), { request: pending });

    const submitted = await fetch(`${base}/api/producer/listing-changes/producer-a`, {
      method: 'POST',
      headers: { ...headers('host'), 'Content-Type': 'application/json' },
      body: JSON.stringify({ changes: { tagLine: 'A reviewed tagline' } }),
    });
    assert.equal(submitted.status, 201);
    assert.deepEqual(await submitted.json(), { request: pending });
    assert.deepEqual(calls, [
      { type: 'get', args: ['traveler', 'producer-a'] },
      { type: 'get', args: ['host', 'producer-a'] },
      { type: 'submit', args: ['host', 'host@example.com', 'producer-a', { tagLine: 'A reviewed tagline' }] },
    ]);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});