import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { createApp } from '../app';

test('welcome email API requires auth and derives the target uid from the verified session', async () => {
  const calls: any[] = [];
  const server = createApp({
    verifyToken: async (token) => {
      if (token === 'bad') throw new Error('bad token');
      return { uid: token } as any;
    },
    sendTravelerWelcomeEmail: async (input) => {
      calls.push(input);
      return { status: 'sent' as const, occurredAt: 'now', messageId: 'welcome-1' };
    },
  }).listen(0, '127.0.0.1');

  await new Promise<void>((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  try {
    const anonymous = await fetch(`${base}/api/account/welcome-email`, { method: 'POST' });
    assert.equal(anonymous.status, 401);

    const response = await fetch(`${base}/api/account/welcome-email`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer traveler-uid',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Nikos Traveler',
        email: 'attacker-controlled@example.com',
        uid: 'attacker-controlled-uid',
      }),
    });

    assert.equal(response.status, 200);
    assert.deepEqual(calls, [{ uid: 'traveler-uid', preferredName: 'Nikos Traveler' }]);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))
    );
  }
});
