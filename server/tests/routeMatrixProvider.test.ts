import test from 'node:test';
import assert from 'node:assert/strict';
import { MapboxRouteMatrixProvider } from '../services/mapboxRouteMatrixProvider';
import { RouteMatrixProviderError } from '../services/routeMatrix';

const points = [
  { id: 'a', latitude: 35.3387, longitude: 25.1442 },
  { id: 'b', latitude: 35.2401, longitude: 24.8093 },
  { id: 'c', latitude: 35.1918, longitude: 25.0981 },
];

const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

test('Mapbox adapter normalizes duration and distance matrices', async () => {
  let requestedUrl = '';
  const provider = new MapboxRouteMatrixProvider({
    accessToken: 'test-token',
    now: () => new Date('2026-09-23T18:00:00Z'),
    fetchImpl: async (input) => {
      requestedUrl = String(input);
      return response({
        code: 'Ok',
        durations: [
          [0, 120, 240],
          [125, 0, 90],
          [235, 95, 0],
        ],
        distances: [
          [0, 1000, 2100],
          [1050, 0, 800],
          [2050, 820, 0],
        ],
      });
    },
  });

  const matrix = await provider.getMatrix({ points });

  assert.deepEqual(matrix.pointIds, ['a', 'b', 'c']);
  assert.equal(matrix.provider, 'mapbox');
  assert.equal(matrix.profile, 'driving');
  assert.equal(matrix.generatedAt, '2026-09-23T18:00:00.000Z');
  assert.equal(matrix.durationsSeconds[0][1], 120);
  assert.equal(matrix.distancesMeters[2][1], 820);

  const url = new URL(requestedUrl);
  assert.equal(url.searchParams.get('annotations'), 'duration,distance');
  assert.equal(url.searchParams.get('access_token'), 'test-token');
  assert.match(
    url.pathname,
    /25\.1442,35\.3387;24\.8093,35\.2401;25\.0981,35\.1918$/
  );
});

test('Mapbox adapter preserves unreachable legs as null', async () => {
  const provider = new MapboxRouteMatrixProvider({
    accessToken: 'test-token',
    fetchImpl: async () =>
      response({
        code: 'Ok',
        durations: [
          [0, null],
          [null, 0],
        ],
        distances: [
          [0, null],
          [null, 0],
        ],
      }),
  });

  const matrix = await provider.getMatrix({ points: points.slice(0, 2) });
  assert.equal(matrix.durationsSeconds[0][1], null);
  assert.equal(matrix.distancesMeters[1][0], null);
});

test('Mapbox adapter rejects malformed matrix responses', async () => {
  const provider = new MapboxRouteMatrixProvider({
    accessToken: 'test-token',
    fetchImpl: async () =>
      response({
        code: 'Ok',
        durations: [[0, 10]],
        distances: [
          [0, 10],
          [10, 0],
        ],
      }),
  });

  await assert.rejects(
    () => provider.getMatrix({ points: points.slice(0, 2) }),
    (error: unknown) =>
      error instanceof RouteMatrixProviderError &&
      error.code === 'invalid_response'
  );
});
test('Mapbox adapter rejects missing configuration before network access', async () => {
  let called = false;
  const provider = new MapboxRouteMatrixProvider({
    accessToken: '',
    fetchImpl: async () => {
      called = true;
      return response({ code: 'Ok' });
    },
  });

  await assert.rejects(
    () => provider.getMatrix({ points: points.slice(0, 2) }),
    (error: unknown) =>
      error instanceof RouteMatrixProviderError &&
      error.code === 'not_configured'
  );
  assert.equal(called, false);
});

test('Mapbox adapter validates coordinate bounds', async () => {
  const provider = new MapboxRouteMatrixProvider({
    accessToken: 'test-token',
    fetchImpl: async () => response({ code: 'Ok' }),
  });

  await assert.rejects(
    () =>
      provider.getMatrix({
        points: [points[0], { id: 'bad', latitude: 100, longitude: 25 }],
      }),
    (error: unknown) =>
      error instanceof RouteMatrixProviderError &&
      error.code === 'invalid_input'
  );
});
test('Mapbox provider errors never expose the access token', async () => {
  const secret = 'super-secret-mapbox-token';
  const provider = new MapboxRouteMatrixProvider({
    accessToken: secret,
    fetchImpl: async () => response({ message: secret }, 500),
  });

  await assert.rejects(
    () => provider.getMatrix({ points: points.slice(0, 2) }),
    (error: unknown) => {
      assert.ok(error instanceof RouteMatrixProviderError);
      assert.equal(error.code, 'provider_unavailable');
      assert.doesNotMatch(error.message, new RegExp(secret));
      return true;
    }
  );
});
