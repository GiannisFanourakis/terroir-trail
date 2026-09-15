import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { createApp } from '../app';
import { AdminAuthorityError } from '../services/adminAuthorityService';

test('account capabilities require authentication and resolve only the authenticated uid', async () => {
  const capabilityLookups: string[] = [];
  const expectedCapabilities = {
    uid: 'owner-user',
    roles: ['traveler', 'admin'] as const,
    primaryRole: 'admin' as const,
    isAdmin: true,
    adminLevel: 'owner' as const,
    isPlatformOwner: true,
    producerIds: [],
    canManageOwnedListings: false,
    canReviewProducerClaims: true,
    canAssignProducerOwnership: true,
    canModerateProducerContent: true,
    canManageUserAccounts: true,
    canManageAdmins: true,
  };

  const server = createApp({
    verifyToken: async token => {
      if (token === 'invalid') throw new Error('invalid token');
      return { uid: token } as any;
    },
    getTrustedAccountCapabilities: async uid => {
      capabilityLookups.push(uid);
      if (uid === 'lookup-failure') throw new Error('firestore unavailable');
      return { ...expectedCapabilities, uid } as any;
    },
  }).listen(0, '127.0.0.1');

  await new Promise<void>(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const getCapabilities = (token?: string) => fetch(`${base}/api/account/capabilities`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  try {
    assert.equal((await getCapabilities()).status, 401);
    assert.equal((await getCapabilities('invalid')).status, 401);
    assert.deepEqual(capabilityLookups, []);

    const authenticated = await getCapabilities('owner-user');
    assert.equal(authenticated.status, 200);
    assert.equal(authenticated.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await authenticated.json(), { capabilities: expectedCapabilities });
    assert.deepEqual(capabilityLookups, ['owner-user']);

    const unavailable = await getCapabilities('lookup-failure');
    assert.equal(unavailable.status, 503);
    assert.deepEqual(await unavailable.json(), {
      error: 'Account permissions are temporarily unavailable.',
    });
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close(error => error ? reject(error) : resolve())
    );
  }
});

test('admin authority endpoint uses authenticated actor identity and maps authorization failures safely', async () => {
  const calls: unknown[][] = [];
  const server = createApp({
    verifyToken: async token => {
      if (token === 'invalid') throw new Error('invalid token');
      return { uid: token } as any;
    },
    changeAdminAuthority: async (actorUid, action, target) => {
      calls.push([actorUid, action, target]);
      if (actorUid === 'ordinary-admin') {
        throw new AdminAuthorityError('forbidden', 'Platform Owner authority is required to manage admins.');
      }
      return {
        action,
        actorUid,
        targetUid: 'target-uid',
        level: 'admin' as const,
        status: action === 'grant' ? 'active' as const : 'revoked' as const,
        occurredAt: '2026-09-15T00:00:00.000Z',
      };
    },
  }).listen(0, '127.0.0.1');

  await new Promise<void>(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const post = (token: string | undefined, body: object) => fetch(`${base}/api/admin/authority`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  try {
    assert.equal((await post(undefined, { action: 'grant', email: 'person@example.com' })).status, 401);
    assert.equal((await post('invalid', { action: 'grant', email: 'person@example.com' })).status, 401);
    assert.deepEqual(calls, []);

    const denied = await post('ordinary-admin', { action: 'grant', email: 'person@example.com' });
    assert.equal(denied.status, 403);
    assert.deepEqual(await denied.json(), {
      error: 'Platform Owner authority is required to manage admins.',
    });

    const granted = await post('owner-uid', { action: 'grant', email: 'person@example.com' });
    assert.equal(granted.status, 200);
    assert.deepEqual(calls[1], [
      'owner-uid',
      'grant',
      { userId: undefined, email: 'person@example.com' },
    ]);
    assert.equal((await granted.json()).authority.status, 'active');
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close(error => error ? reject(error) : resolve())
    );
  }
});
