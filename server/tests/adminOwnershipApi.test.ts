import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { createApp } from '../app';
import { AdminOwnershipError } from '../services/adminOwnershipService';

test('producer ownership API authenticates admins and supports list/revoke/reassign', async () => {
  const calls: Array<{ type: string; args: unknown[] }> = [];
  const ownership = {
    producerId: 'producer-a',
    producerName: 'Producer A',
    ownerUid: 'owner-a',
    ownerEmail: 'owner@example.com',
  };

  const server = createApp({
    verifyToken: async token => {
      if (token === 'invalid') throw new Error('invalid token');
      return { uid: token } as any;
    },
    listActiveProducerOwnerships: async uid => {
      calls.push({ type: 'list', args: [uid] });
      if (uid === 'traveler') {
        throw new AdminOwnershipError('forbidden', 'Admin authority is required to manage producer ownership.');
      }
      return [ownership];
    },
    revokeProducerOwnership: async (uid, producerId, reason) => {
      calls.push({ type: 'revoke', args: [uid, producerId, reason] });
      if (!reason) throw new AdminOwnershipError('bad_request', 'Provide a reason between 3 and 500 characters.');
      return { producerId, previousOwnerUid: 'owner-a', status: 'revoked' as const, occurredAt: 'now' };
    },
    reassignProducerOwnership: async (uid, producerId, email, reason) => {
      calls.push({ type: 'reassign', args: [uid, producerId, email, reason] });
      if (!email) throw new AdminOwnershipError('bad_request', 'Enter the email address of an existing TerroirTrail account.');
      return {
        producerId,
        previousOwnerUid: 'owner-a',
        ownerUid: 'owner-b',
        ownerEmail: email,
        status: 'active' as const,
        occurredAt: 'now',
      };
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
    assert.equal((await fetch(`${base}/api/admin/ownerships`)).status, 401);
    assert.equal((await fetch(`${base}/api/admin/ownerships`, { headers: headers('invalid') })).status, 401);

    const denied = await fetch(`${base}/api/admin/ownerships`, { headers: headers('traveler') });
    assert.equal(denied.status, 403);

    const listed = await fetch(`${base}/api/admin/ownerships`, { headers: headers('admin') });
    assert.equal(listed.status, 200);
    assert.deepEqual(await listed.json(), { ownerships: [ownership] });

    const badRevoke = await post('/api/admin/ownerships/producer-a/revoke', 'admin');
    assert.equal(badRevoke.status, 400);

    const revoked = await post('/api/admin/ownerships/producer-a/revoke', 'admin', {
      reason: 'Ownership evidence changed.',
    });
    assert.equal(revoked.status, 200);

    const badReassign = await post('/api/admin/ownerships/producer-a/reassign', 'admin', {
      reason: 'Representative changed.',
    });
    assert.equal(badReassign.status, 400);

    const reassigned = await post('/api/admin/ownerships/producer-a/reassign', 'admin', {
      email: 'new-owner@example.com',
      reason: 'Representative changed.',
    });
    assert.equal(reassigned.status, 200);

    assert.deepEqual(calls, [
      { type: 'list', args: ['traveler'] },
      { type: 'list', args: ['admin'] },
      { type: 'revoke', args: ['admin', 'producer-a', ''] },
      { type: 'revoke', args: ['admin', 'producer-a', 'Ownership evidence changed.'] },
      { type: 'reassign', args: ['admin', 'producer-a', '', 'Representative changed.'] },
      { type: 'reassign', args: ['admin', 'producer-a', 'new-owner@example.com', 'Representative changed.'] },
    ]);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close(error => error ? reject(error) : resolve())
    );
  }
});
