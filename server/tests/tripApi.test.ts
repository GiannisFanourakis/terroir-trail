import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { createApp } from '../app';
import { registerTripRoutes } from '../tripRoutes';
import { TripServiceError } from '../services/tripService';

test('My Trips API requires Firebase auth and passes only authenticated uid to services', async () => {
  const calls: unknown[][] = [];
  const app = createApp();
  registerTripRoutes(app, {
    verifyToken: async token => {
      if (token === 'bad') throw new Error('invalid');
      return { uid: token } as any;
    },
    listTrips: async uid => {
      calls.push(['list', uid]);
      return [];
    },
    getTrip: async (uid, tripId) => {
      calls.push(['get', uid, tripId]);
      return {
        id: tripId,
        ownerUid: uid,
        title: 'Trip',
        startDate: null,
        endDate: null,
        itemCount: 0,
        revision: 1,
        schemaVersion: 1 as const,
        createdAt: '2026-09-21T00:00:00Z',
        updatedAt: '2026-09-21T00:00:00Z',
        items: [],
      };
    },
  });

  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const base = 'http://127.0.0.1:' + (server.address() as AddressInfo).port;

  try {
    assert.equal((await fetch(base + '/api/trips')).status, 401);
    assert.equal((await fetch(base + '/api/trips', { headers: { Authorization: 'Bearer bad' } })).status, 401);
    assert.deepEqual(calls, []);

    const list = await fetch(base + '/api/trips', { headers: { Authorization: 'Bearer traveler-1' } });
    assert.equal(list.status, 200);
    assert.deepEqual(calls[0], ['list', 'traveler-1']);

    const get = await fetch(base + '/api/trips/trip-123', { headers: { Authorization: 'Bearer traveler-1' } });
    assert.equal(get.status, 200);
    assert.deepEqual(calls[1], ['get', 'traveler-1', 'trip-123']);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close(error => error ? reject(error) : resolve())
    );
  }
});

test('My Trips API maps stale revision conflicts without leaking internal errors', async () => {
  const app = createApp();
  registerTripRoutes(app, {
    verifyToken: async token => ({ uid: token } as any),
    updateTrip: async () => {
      throw new TripServiceError(
        'conflict',
        'This trip changed on another device or tab. Reload it before trying again.'
      );
    },
  });

  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const base = 'http://127.0.0.1:' + (server.address() as AddressInfo).port;

  try {
    const response = await fetch(base + '/api/trips/trip-1', {
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer traveler-1',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ expectedRevision: 1, title: 'Updated' }),
    });

    assert.equal(response.status, 409);
    const body = await response.json() as any;
    assert.equal(body.code, 'conflict');
    assert.equal(body.error.includes('another device or tab'), true);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close(error => error ? reject(error) : resolve())
    );
  }
});

test('My Trips API never accepts caller-supplied ownership or timestamps', async () => {
  const inputs: any[] = [];
  const app = createApp();
  registerTripRoutes(app, {
    verifyToken: async token => ({ uid: token } as any),
    createTrip: async (uid, input) => {
      inputs.push({ uid, input });
      return {
        id: 'trip-1',
        ownerUid: uid,
        title: String(input.title),
        startDate: null,
        endDate: null,
        itemCount: 0,
        revision: 1,
        schemaVersion: 1 as const,
        createdAt: 'server-time',
        updatedAt: 'server-time',
      };
    },
  });

  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const base = 'http://127.0.0.1:' + (server.address() as AddressInfo).port;

  try {
    const response = await fetch(base + '/api/trips', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer traveler-1',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Trip',
        ownerUid: 'victim',
        revision: 999,
        createdAt: 'forged',
        itemCount: 999,
      }),
    });
    assert.equal(response.status, 200);
    assert.deepEqual(inputs, [{
      uid: 'traveler-1',
      input: { title: 'Trip', startDate: undefined, endDate: undefined },
    }]);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close(error => error ? reject(error) : resolve())
    );
  }
});
