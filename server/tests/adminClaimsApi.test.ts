import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { createApp } from '../app';
import { AdminClaimError } from '../services/adminClaimsService';

test('admin claim API authenticates the actor and supports list/approve/reject flows', async () => {
  const calls: Array<{ type: string; args: unknown[] }> = [];
  const pendingClaim = {
    producerId: 'producer-a',
    tradeBrandName: 'Producer A',
    officialEmail: 'a@example.com',
  };

  const server = createApp({
    verifyToken: async token => {
      if (token === 'invalid') throw new Error('invalid token');
      return { uid: token } as any;
    },
    listPendingProducerClaims: async uid => {
      calls.push({ type: 'list', args: [uid] });
      if (uid === 'traveler') {
        throw new AdminClaimError('forbidden', 'Admin authority is required to review producer requests.');
      }
      return [pendingClaim];
    },
    approveProducerClaim: async (uid, producerId) => {
      calls.push({ type: 'approve', args: [uid, producerId] });
      return { producerId, ownerUid: 'applicant', status: 'verified_active' as const, occurredAt: 'now' };
    },
    rejectProducerClaim: async (uid, producerId, reason) => {
      calls.push({ type: 'reject', args: [uid, producerId, reason] });
      if (!reason) throw new AdminClaimError('bad_request', 'Provide a rejection reason between 3 and 500 characters.');
      return { producerId, status: 'rejected' as const, occurredAt: 'now' };
    },
  }).listen(0, '127.0.0.1');

  await new Promise<void>(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const headers = (token?: string): Record<string, string> =>
    token ? { Authorization: `Bearer ${token}` } : {};
  const post = (path: string, token: string, body?: object) => fetch(base + path, {
    method: 'POST',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });

  try {
    assert.equal((await fetch(`${base}/api/admin/claims`)).status, 401);
    assert.equal((await fetch(`${base}/api/admin/claims`, { headers: headers('invalid') })).status, 401);

    const denied = await fetch(`${base}/api/admin/claims`, { headers: headers('traveler') });
    assert.equal(denied.status, 403);

    const listed = await fetch(`${base}/api/admin/claims`, { headers: headers('admin') });
    assert.equal(listed.status, 200);
    assert.deepEqual(await listed.json(), { claims: [pendingClaim] });

    const approved = await post('/api/admin/claims/producer-a/approve', 'admin');
    assert.equal(approved.status, 200);

    const badReject = await post('/api/admin/claims/producer-b/reject', 'admin');
    assert.equal(badReject.status, 400);

    const rejected = await post('/api/admin/claims/producer-b/reject', 'admin', { reason: 'Insufficient ownership evidence.' });
    assert.equal(rejected.status, 200);

    assert.deepEqual(calls, [
      { type: 'list', args: ['traveler'] },
      { type: 'list', args: ['admin'] },
      { type: 'approve', args: ['admin', 'producer-a'] },
      { type: 'reject', args: ['admin', 'producer-b', ''] },
      { type: 'reject', args: ['admin', 'producer-b', 'Insufficient ownership evidence.'] },
    ]);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close(error => error ? reject(error) : resolve())
    );
  }
});
