import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createTripOptimizationProposal,
  TripOptimizationServiceError,
  type OptimizationProducerRowV1,
} from '../services/tripOptimizationService';
import { TsV1DayOptimizationEngine } from '../services/dayOptimizationEngine';
import type {
  RouteMatrixProvider,
  RouteMatrixRequestV1,
  RouteMatrixV1,
} from '../services/routeMatrix';
import type { TripWithItems } from '../services/tripService';

const trip: TripWithItems = {
  id: 'trip-1',
  ownerUid: 'traveler-1',
  title: 'Crete',
  startDate: null,
  endDate: null,
  itemCount: 4,
  revision: 7,
  schemaVersion: 1,
  createdAt: '2026-09-23T00:00:00Z',
  updatedAt: '2026-09-23T00:00:00Z',
  items: [
    {
      producerId: 'a',
      position: 0,
      dayNumber: 2,
      createdAt: 'x',
      updatedAt: 'x',
    },
    {
      producerId: 'outside-day',
      position: 1,
      dayNumber: 1,
      createdAt: 'x',
      updatedAt: 'x',
    },
    {
      producerId: 'b',
      position: 2,
      dayNumber: 2,
      createdAt: 'x',
      updatedAt: 'x',
    },
    {
      producerId: 'c',
      position: 3,
      dayNumber: 2,
      createdAt: 'x',
      updatedAt: 'x',
    },
  ],
};

const rows: OptimizationProducerRowV1[] = [
  {
    id: 'a',
    lat: 35.1,
    lng: 25.1,
    location_status: 'verified',
    road_access_status: 'verified',
  },
  {
    id: 'b',
    lat: 35.2,
    lng: 25.2,
    location_status: 'verified',
    visit_booking_requirement: 'required',
    road_access_status: 'verified',
  },
  {
    id: 'c',
    lat: 35.3,
    lng: 25.3,
    location_status: 'verified',
    road_access_status: 'unreviewed',
  },
];

class FakeProvider implements RouteMatrixProvider {
  request: RouteMatrixRequestV1 | null = null;

  async getMatrix(input: RouteMatrixRequestV1): Promise<RouteMatrixV1> {
    this.request = input;
    return {
      pointIds: ['a', 'b', 'c'],
      durationsSeconds: [
        [0, 600, 1000],
        [100, 0, 600],
        [1000, 100, 0],
      ],
      distancesMeters: [
        [0, 6000, 10000],
        [1000, 0, 6000],
        [10000, 1000, 0],
      ],
      provider: 'fake',
      profile: 'driving',
      generatedAt: '2026-09-23T18:00:00Z',
    };
  }
}

const request = {
  contractVersion: 1 as const,
  dayNumber: 2,
  expectedRevision: 7,
  constraints: [{ producerId: 'b', locked: true as const }],
};
test('proposal resolves current-day authoritative coordinates and derives locked slot', async () => {
  const provider = new FakeProvider();
  const engine = new TsV1DayOptimizationEngine({
    now: () => new Date('2026-09-23T18:30:00Z'),
    proposalId: () => 'proposal-1',
  });

  const proposal = await createTripOptimizationProposal(
    'traveler-1',
    'trip-1',
    request,
    {
      loadTrip: async () => trip,
      loadProducers: async (producerIds) => {
        assert.deepEqual(producerIds, ['a', 'b', 'c']);
        return rows;
      },
      routeMatrixProvider: provider,
      optimizationEngine: engine,
    }
  );

  assert.deepEqual(provider.request, {
    points: [
      { id: 'a', longitude: 25.1, latitude: 35.1 },
      { id: 'b', longitude: 25.2, latitude: 35.2 },
      { id: 'c', longitude: 25.3, latitude: 35.3 },
    ],
  });
  assert.equal(proposal.basedOnRevision, 7);
  assert.equal(proposal.dayNumber, 2);
  assert.equal(proposal.proposedOrder[1], 'b');
  assert.equal(
    proposal.warnings.some(
      (warning) =>
        warning.code === 'booking_required' && warning.producerId === 'b'
    ),
    true
  );
  assert.equal(
    proposal.warnings.some(
      (warning) =>
        warning.code === 'road_access_unverified' && warning.producerId === 'c'
    ),
    true
  );
});

test('stale revision fails before producer lookup or routing', async () => {
  let producerLookup = false;
  let providerCalled = false;

  await assert.rejects(
    () =>
      createTripOptimizationProposal(
        'traveler-1',
        'trip-1',
        { ...request, expectedRevision: 6 },
        {
          loadTrip: async () => trip,
          loadProducers: async () => {
            producerLookup = true;
            return rows;
          },
          routeMatrixProvider: {
            async getMatrix() {
              providerCalled = true;
              throw new Error('should not run');
            },
          },
        }
      ),
    (error: unknown) =>
      error instanceof TripOptimizationServiceError && error.code === 'conflict'
  );

  assert.equal(producerLookup, false);
  assert.equal(providerCalled, false);
});
test('constraints cannot lock a producer outside the selected day', async () => {
  await assert.rejects(
    () =>
      createTripOptimizationProposal(
        'traveler-1',
        'trip-1',
        {
          ...request,
          constraints: [{ producerId: 'outside-day', locked: true }],
        },
        {
          loadTrip: async () => trip,
          loadProducers: async () => rows,
          routeMatrixProvider: new FakeProvider(),
        }
      ),
    (error: unknown) =>
      error instanceof TripOptimizationServiceError &&
      error.code === 'bad_request'
  );
});

test('missing active producer fails closed before routing', async () => {
  let providerCalled = false;

  await assert.rejects(
    () =>
      createTripOptimizationProposal('traveler-1', 'trip-1', request, {
        loadTrip: async () => trip,
        loadProducers: async () => rows.slice(0, 2),
        routeMatrixProvider: {
          async getMatrix() {
            providerCalled = true;
            throw new Error('should not run');
          },
        },
      }),
    (error: unknown) =>
      error instanceof TripOptimizationServiceError &&
      error.code === 'producer_unavailable'
  );

  assert.equal(providerCalled, false);
});

test('unresolved producer location fails closed before routing', async () => {
  let providerCalled = false;
  const unresolved = rows.map((row) =>
    row.id === 'b' ? { ...row, location_status: 'unresolved' } : row
  );

  await assert.rejects(
    () =>
      createTripOptimizationProposal('traveler-1', 'trip-1', request, {
        loadTrip: async () => trip,
        loadProducers: async () => unresolved,
        routeMatrixProvider: {
          async getMatrix() {
            providerCalled = true;
            throw new Error('should not run');
          },
        },
      }),
    (error: unknown) =>
      error instanceof TripOptimizationServiceError &&
      error.code === 'location_unverified'
  );

  assert.equal(providerCalled, false);
});
test('one-stop selected days are rejected without routing', async () => {
  let providerCalled = false;
  const oneStopTrip: TripWithItems = {
    ...trip,
    itemCount: 2,
    items: [
      trip.items[0],
      {
        producerId: 'outside-day',
        position: 1,
        dayNumber: 1,
        createdAt: 'x',
        updatedAt: 'x',
      },
    ],
  } as TripWithItems;

  await assert.rejects(
    () =>
      createTripOptimizationProposal('traveler-1', 'trip-1', request, {
        loadTrip: async () => oneStopTrip,
        loadProducers: async () => rows,
        routeMatrixProvider: {
          async getMatrix() {
            providerCalled = true;
            throw new Error('should not run');
          },
        },
      }),
    (error: unknown) =>
      error instanceof TripOptimizationServiceError &&
      error.code === 'insufficient_stops'
  );

  assert.equal(providerCalled, false);
});

test('request parser rejects duplicate or malformed locks', async () => {
  await assert.rejects(
    () =>
      createTripOptimizationProposal(
        'traveler-1',
        'trip-1',
        {
          contractVersion: 1,
          dayNumber: 2,
          expectedRevision: 7,
          constraints: [
            { producerId: 'a', locked: true },
            { producerId: 'a', locked: true },
          ],
        },
        { loadTrip: async () => trip }
      ),
    (error: unknown) =>
      error instanceof TripOptimizationServiceError &&
      error.code === 'bad_request'
  );
});
