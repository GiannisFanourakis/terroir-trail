import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { createApp } from '../app';
import { registerAdminAccountRoutes } from '../adminAccountRoutes';
import { AdminAccountError } from '../services/adminAccountService';

test('admin account API authenticates search and login access flows', async () => {
  const calls: Array<{ type: string; args: unknown[] }> = [];
  const summary = {
    uid: 'host-uid',
    email: 'host@example.com',
    disabled: false,
    emailVerified: true,
    roles: ['traveler', 'producer_host'] as const,
    adminLevel: null,
    isPlatformOwner: false,
    producerIds: ['producer-a'],
    canDisable: true,
  };

  const app = createApp({
    verifyToken: async token => ({ uid: token }) as any,
  });
  registerAdminAccountRoutes(app, {
    verifyToken: async token => {
      if (token === 'invalid') throw new Error('invalid token');
      return { uid: token } as any;
    },
    searchAdminAccounts: async (uid, query) => {
      calls.push({ type: 'search', args: [uid, query] });
      if (uid === 'traveler') {
        throw new AdminAccountError('forbidden', 'Admin authority is required to search accounts.');
      }
      return [summary as any];
    },
    setAccountDisabled: async (uid, targetUid, disabled, reason) => {
      calls.push({ type: 'access', args: [uid, targetUid, disabled, reason] });
      if (!reason) throw new AdminAccountError('bad_request', 'Add a short reason for this account action.');
      return { targetUid, disabled, occurredAt: 'now' };
    },
  });

  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const headers = (token?: string): Record<string, string> => token ? { Authorization: `Bearer ${token}` } : {};
  const post = (path: string, token: string, body: object) => fetch(base + path, {
    method: 'POST',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  try {
    assert.equal((await fetch(`${base}/api/admin/accounts?q=host`)).status, 401);
    assert.equal((await fetch(`${base}/api/admin/accounts?q=host`, { headers: headers('invalid') })).status, 401);
    assert.equal((await fetch(`${base}/api/admin/accounts?q=host`, { headers: headers('traveler') })).status, 403);

    const listed = await fetch(`${base}/api/admin/accounts?q=host`, { headers: headers('admin') });
    assert.equal(listed.status, 200);
    assert.deepEqual(await listed.json(), { accounts: [summary] });

    const missingState = await post('/api/admin/accounts/host-uid/access', 'admin', { reason: 'test' });
    assert.equal(missingState.status, 400);

    const missingReason = await post('/api/admin/accounts/host-uid/access', 'admin', { disabled: true });
    assert.equal(missingReason.status, 400);

    const disabled = await post('/api/admin/accounts/host-uid/access', 'admin', {
      disabled: true,
      reason: 'Security review',
    });
    assert.equal(disabled.status, 200);
    assert.deepEqual(await disabled.json(), {
      account: { targetUid: 'host-uid', disabled: true, occurredAt: 'now' },
    });

    assert.deepEqual(calls, [
      { type: 'search', args: ['traveler', 'host'] },
      { type: 'search', args: ['admin', 'host'] },
      { type: 'access', args: ['admin', 'host-uid', true, ''] },
      { type: 'access', args: ['admin', 'host-uid', true, 'Security review'] },
    ]);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close(error => error ? reject(error) : resolve())
    );
  }
});
