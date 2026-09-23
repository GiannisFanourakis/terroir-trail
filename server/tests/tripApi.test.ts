import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { createApp } from '../app';
import { registerTripRoutes } from '../tripRoutes';
import { TripOptimizationServiceError } from '../services/tripOptimizationService';
import { TripServiceError } from '../services/tripService';

test('My Trips API requires Firebase auth and passes only authenticated uid to services', async () => {
  const calls: unknown[][] = [];
  const app = createApp();
  registerTripRoutes(app, {
    verifyToken: async (token) => {
      if (token === 'bad') throw new Error('invalid');
      return { uid: token } as any;
    },
    listTrips: async (uid) => {
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
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const base = 'http://127.0.0.1:' + (server.address() as AddressInfo).port;

  try {
    assert.equal((await fetch(base + '/api/trips')).status, 401);
    assert.equal(
      (
        await fetch(base + '/api/trips', {
          headers: { Authorization: 'Bearer bad' },
        })
      ).status,
      401
    );
    assert.deepEqual(calls, []);

    const list = await fetch(base + '/api/trips', {
      headers: { Authorization: 'Bearer traveler-1' },
    });
    assert.equal(list.status, 200);
    assert.deepEqual(calls[0], ['list', 'traveler-1']);

    const get = await fetch(base + '/api/trips/trip-123', {
      headers: { Authorization: 'Bearer traveler-1' },
    });
    assert.equal(get.status, 200);
    assert.deepEqual(calls[1], ['get', 'traveler-1', 'trip-123']);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))
    );
  }
});

test('My Trips API maps stale revision conflicts without leaking internal errors', async () => {
  const app = createApp();
  registerTripRoutes(app, {
    verifyToken: async (token) => ({ uid: token }) as any,
    updateTrip: async () => {
      throw new TripServiceError(
        'conflict',
        'This trip changed on another device or tab. Reload it before trying again.'
      );
    },
  });

  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
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
    const body = (await response.json()) as any;
    assert.equal(body.code, 'conflict');
    assert.equal(body.error.includes('another device or tab'), true);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))
    );
  }
});

test('My Trips API rejects caller-supplied ownership and server-managed fields', async () => {
  const inputs: any[] = [];
  const app = createApp();
  registerTripRoutes(app, {
    verifyToken: async (token) => ({ uid: token }) as any,
    createTrip: async (uid, input) => {
      inputs.push({ uid, input });
      return {
        id: 'trip123',
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
  await new Promise<void>((resolve) => server.once('listening', resolve));
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
    assert.equal(response.status, 400);
    assert.equal(((await response.json()) as any).code, 'bad_request');
    assert.deepEqual(inputs, []);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))
    );
  }
});

test('My Trips producer-states endpoint requires auth and exposes safe mapping', async () => {
  const calls: unknown[][] = [];
  const app = createApp();
  registerTripRoutes(app, {
    verifyToken: async (token) => {
      if (token === 'bad') throw new Error('invalid');
      return { uid: token } as any;
    },
    getTripProducerStates: async (uid, tripId) => {
      calls.push([uid, tripId]);
      if (tripId === 'trip-missing') {
        throw new TripServiceError('not_found', 'Trip not found.');
      }
      if (tripId === 'trip-broken') {
        throw new TripServiceError(
          'service_unavailable',
          'Producer state resolution is temporarily unavailable.'
        );
      }
      return {
        'prod-1': 'active',
        'prod-2': 'unavailable',
        'prod-3': 'no_longer_listed',
      };
    },
  });

  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const base = 'http://127.0.0.1:' + (server.address() as AddressInfo).port;

  try {
    // 1. Unauthenticated => 401
    const unauth = await fetch(base + '/api/trips/trip-1/producer-states');
    assert.equal(unauth.status, 401);

    // 2. Bad token => 401
    const badToken = await fetch(base + '/api/trips/trip-1/producer-states', {
      headers: { Authorization: 'Bearer bad' },
    });
    assert.equal(badToken.status, 401);

    // 3. Authenticated valid trip => 200 with safe states
    const success = await fetch(base + '/api/trips/trip-1/producer-states', {
      headers: { Authorization: 'Bearer traveler-1' },
    });
    assert.equal(success.status, 200);
    const body = (await success.json()) as any;
    assert.deepEqual(body, {
      producerStates: {
        'prod-1': 'active',
        'prod-2': 'unavailable',
        'prod-3': 'no_longer_listed',
      },
    });
    // Ensure no leaked internal keys
    assert.equal((body as any).reason, undefined);
    assert.equal((body as any).tombstone_type, undefined);

    // 4. Missing/unowned trip => 404
    const notFound = await fetch(
      base + '/api/trips/trip-missing/producer-states',
      {
        headers: { Authorization: 'Bearer traveler-1' },
      }
    );
    assert.equal(notFound.status, 404);

    // 5. Dependency failure => 503
    const depFail = await fetch(
      base + '/api/trips/trip-broken/producer-states',
      {
        headers: { Authorization: 'Bearer traveler-1' },
      }
    );
    assert.equal(depFail.status, 503);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))
    );
  }
});

test('Trip Pack export is authenticated and requires an active Explorer Pass', async () => {
  let activePass = false;
  const exportCalls: unknown[][] = [];
  const app = createApp();

  registerTripRoutes(app, {
    verifyToken: async (token) => ({ uid: token }) as any,
    getExplorerPass: async (_uid) =>
      activePass
        ? {
            passId: 'pass-active',
            name: 'Explorer',
            plan: 'holiday' as const,
            expiresAt: '2099-01-01T00:00:00Z',
          }
        : null,
    createTripPack: async (uid, tripId, format) => {
      exportCalls.push([uid, tripId, format]);
      return {
        body:
          format === 'ics'
            ? 'BEGIN:VCALENDAR\r\nEND:VCALENDAR\r\n'
            : '<!doctype html><title>Trip Pack</title>',
        contentType:
          format === 'ics'
            ? 'text/calendar; charset=utf-8'
            : 'text/html; charset=utf-8',
        filename:
          format === 'ics'
            ? 'terroirtrail-trip-calendar.ics'
            : 'terroirtrail-trip-pack.html',
      };
    },
  });

  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const base = 'http://127.0.0.1:' + (server.address() as AddressInfo).port;

  try {
    assert.equal(
      (await fetch(base + '/api/trips/trip-1/export?format=html')).status,
      401
    );

    const free = await fetch(base + '/api/trips/trip-1/export?format=html', {
      headers: { Authorization: 'Bearer traveler-1' },
    });
    assert.equal(free.status, 403);
    assert.equal(((await free.json()) as any).code, 'explorer_pass_required');
    assert.deepEqual(exportCalls, []);

    activePass = true;
    const badFormat = await fetch(
      base + '/api/trips/trip-1/export?format=pdf',
      {
        headers: { Authorization: 'Bearer traveler-1' },
      }
    );
    assert.equal(badFormat.status, 400);
    assert.deepEqual(exportCalls, []);

    const html = await fetch(base + '/api/trips/trip-1/export?format=html', {
      headers: { Authorization: 'Bearer traveler-1' },
    });
    assert.equal(html.status, 200);
    assert.match(html.headers.get('content-type') || '', /text\/html/);
    assert.match(
      html.headers.get('content-disposition') || '',
      /trip-pack\.html/
    );
    assert.match(await html.text(), /Trip Pack/);

    const ics = await fetch(base + '/api/trips/trip-1/export?format=ics', {
      headers: { Authorization: 'Bearer traveler-1' },
    });
    assert.equal(ics.status, 200);
    assert.match(ics.headers.get('content-type') || '', /text\/calendar/);
    assert.deepEqual(exportCalls, [
      ['traveler-1', 'trip-1', 'html'],
      ['traveler-1', 'trip-1', 'ics'],
    ]);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))
    );
  }
});

test('Optimize My Day proposal is authenticated, Explorer-gated, and strict about input authority', async () => {
  let activePass = false;
  const calls: unknown[][] = [];
  const app = createApp();

  registerTripRoutes(app, {
    verifyToken: async (token) => {
      if (token === 'bad') throw new Error('invalid');
      return { uid: token } as any;
    },
    getExplorerPass: async () =>
      activePass
        ? ({
            passId: 'pass-active',
            name: 'Explorer',
            plan: 'holiday',
            expiresAt: '2099-01-01T00:00:00Z',
          } as any)
        : null,
    createTripOptimizationProposal: async (uid, tripId, body) => {
      calls.push([uid, tripId, body]);
      return {
        contractVersion: 1,
        proposalId: 'proposal-1',
        tripId,
        dayNumber: 2,
        basedOnRevision: 7,
        originalOrder: ['a', 'b', 'c'],
        proposedOrder: ['c', 'b', 'a'],
        estimatedDriveMinutesBefore: 40,
        estimatedDriveMinutesAfter: 25,
        estimatedMinutesSaved: 15,
        estimatedDistanceKmBefore: 30,
        estimatedDistanceKmAfter: 20,
        warnings: [],
        unresolvedConstraints: [],
        routingProvider: 'mapbox',
        engineVersion: 'ts-v1',
        generatedAt: '2026-09-23T18:30:00Z',
      };
    },
  });

  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const base = 'http://127.0.0.1:' + (server.address() as AddressInfo).port;
  const body = {
    contractVersion: 1,
    dayNumber: 2,
    expectedRevision: 7,
    constraints: [{ producerId: 'b', locked: true }],
  };

  try {
    const unauth = await fetch(base + '/api/trips/trip-1/optimize-day', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    assert.equal(unauth.status, 401);

    const badToken = await fetch(base + '/api/trips/trip-1/optimize-day', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer bad',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    assert.equal(badToken.status, 401);
    assert.deepEqual(calls, []);

    const free = await fetch(base + '/api/trips/trip-1/optimize-day', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer traveler-1',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    assert.equal(free.status, 403);
    assert.equal(((await free.json()) as any).code, 'explorer_pass_required');
    assert.deepEqual(calls, []);

    const forged = await fetch(base + '/api/trips/trip-1/optimize-day', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer traveler-1',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...body,
        coordinates: [25.1, 35.1],
        proposedOrder: ['c', 'b', 'a'],
      }),
    });
    assert.equal(forged.status, 400);
    assert.equal(((await forged.json()) as any).code, 'bad_request');
    assert.deepEqual(calls, []);

    activePass = true;
    const success = await fetch(base + '/api/trips/trip-1/optimize-day', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer traveler-1',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    assert.equal(success.status, 200);
    const payload = (await success.json()) as any;
    assert.equal(payload.proposal.proposalId, 'proposal-1');
    assert.equal(payload.proposal.engineVersion, 'ts-v1');
    assert.deepEqual(calls, [['traveler-1', 'trip-1', body]]);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))
    );
  }
});

test('Optimize My Day maps fail-closed proposal errors without leaking internals', async () => {
  let mode: 'route' | 'service' = 'route';
  const app = createApp();

  registerTripRoutes(app, {
    verifyToken: async (token) => ({ uid: token }) as any,
    getExplorerPass: async () =>
      ({
        passId: 'pass-active',
        name: 'Explorer',
        plan: 'holiday',
        expiresAt: '2099-01-01T00:00:00Z',
      }) as any,
    createTripOptimizationProposal: async () => {
      if (mode === 'route') {
        throw new TripOptimizationServiceError(
          'route_unavailable',
          "We couldn't reliably calculate this day's route."
        );
      }
      throw new TripOptimizationServiceError(
        'service_unavailable',
        'Route calculation is temporarily unavailable.'
      );
    },
  });

  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const base = 'http://127.0.0.1:' + (server.address() as AddressInfo).port;
  const request = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer traveler-1',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contractVersion: 1,
      dayNumber: 2,
      expectedRevision: 7,
      constraints: [],
    }),
  };

  try {
    const route = await fetch(base + '/api/trips/trip-1/optimize-day', request);
    assert.equal(route.status, 409);
    assert.equal(((await route.json()) as any).code, 'route_unavailable');

    mode = 'service';
    const unavailable = await fetch(
      base + '/api/trips/trip-1/optimize-day',
      request
    );
    assert.equal(unavailable.status, 503);
    const body = (await unavailable.json()) as any;
    assert.equal(body.code, 'service_unavailable');
    assert.equal(body.error.includes('temporarily unavailable'), true);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))
    );
  }
});
