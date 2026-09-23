import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getIdToken: vi.fn(async () => 'firebase-token'),
  trackIntent: vi.fn(async () => ({
    success: true,
    clientEventId: 'event-id',
  })),
}));

vi.mock('./firebase', () => ({
  auth: {
    currentUser: {
      getIdToken: mocks.getIdToken,
    },
  },
}));

vi.mock('./intentAnalytics', () => ({
  trackIntent: mocks.trackIntent,
}));

vi.mock('./apiOrigin', () => ({
  resolveApiBaseUrl: () => 'https://api.example.test',
}));

import {
  addProducerToTrip,
  applyOptimizedTripDay,
  createTrip,
  getTripProducerStates,
  optimizeTripDay,
  TripApiError,
} from './tripApi';

describe('tripApi analytics ordering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('emits trip_created only after the trusted API confirms persistence', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        trip: {
          id: 'trip123',
          ownerUid: 'traveler-1',
          title: 'Crete',
          startDate: null,
          endDate: null,
          itemCount: 0,
          revision: 1,
          schemaVersion: 1,
          createdAt: '2026-09-21T00:00:00Z',
          updatedAt: '2026-09-21T00:00:00Z',
        },
      }),
    } as Response);

    const trip = await createTrip({ title: 'Crete' }, 'my_trips');

    expect(trip.id).toBe('trip123');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(mocks.trackIntent).toHaveBeenCalledWith({
      event: 'trip_created',
      sourceSurface: 'my_trips',
    });

    fetchMock.mockRestore();
  });

  it('does not emit producer-added analytics when persistence fails', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({
        code: 'conflict',
        error: 'This trip changed on another device or tab.',
      }),
    } as Response);

    await expect(
      addProducerToTrip('trip123', 'producer-one', 2, 'trip_add_flow')
    ).rejects.toBeInstanceOf(TripApiError);

    expect(mocks.trackIntent).not.toHaveBeenCalled();
    fetchMock.mockRestore();
  });

  it('fetches producer states with auth and returns safe mapping', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        producerStates: {
          'p-active': 'active',
          'p-closed': 'unavailable',
          'p-delisted': 'no_longer_listed',
        },
      }),
    } as Response);

    const states = await getTripProducerStates('trip123');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.test/api/trips/trip123/producer-states',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer firebase-token',
        }),
      })
    );
    expect(states).toEqual({
      'p-active': 'active',
      'p-closed': 'unavailable',
      'p-delisted': 'no_longer_listed',
    });

    fetchMock.mockRestore();
  });

  it('throws TripApiError on 503 resolver failure', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({
        code: 'service_unavailable',
        error: 'Producer state resolution is temporarily unavailable.',
      }),
    } as Response);

    await expect(getTripProducerStates('trip123')).rejects.toThrow(
      'Producer state resolution is temporarily unavailable.'
    );

    fetchMock.mockRestore();
  });
});

describe('tripApi Optimize My Day client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requests a proposal with only day, revision, and locked producer IDs', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        proposal: {
          contractVersion: 1,
          proposalId: 'proposal-1',
          tripId: 'trip123',
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
        },
      }),
    } as Response);

    const proposal = await optimizeTripDay('trip123', 2, 7, ['b']);

    expect(proposal.proposalId).toBe('proposal-1');
    expect(proposal.proposedOrder).toEqual(['c', 'b', 'a']);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.test/api/trips/trip123/optimize-day',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer firebase-token',
        }),
        body: JSON.stringify({
          contractVersion: 1,
          dayNumber: 2,
          expectedRevision: 7,
          constraints: [{ producerId: 'b', locked: true }],
        }),
      })
    );
    expect(mocks.trackIntent).not.toHaveBeenCalled();

    fetchMock.mockRestore();
  });

  it('surfaces Explorer entitlement failures with the trusted status and code', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({
        code: 'explorer_pass_required',
        error: 'An active Explorer Pass is required to optimize a trip day.',
      }),
    } as Response);

    let error: unknown;
    try {
      await optimizeTripDay('trip123', 2, 7, []);
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(TripApiError);
    expect((error as TripApiError).status).toBe(403);
    expect((error as TripApiError).code).toBe('explorer_pass_required');
    expect((error as TripApiError).message).toContain('Explorer Pass');

    fetchMock.mockRestore();
  });

  it('applies only the reviewed day order and returns the revised trip', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        trip: {
          id: 'trip123',
          ownerUid: 'traveler-1',
          title: 'Crete',
          startDate: null,
          endDate: null,
          itemCount: 3,
          revision: 8,
          schemaVersion: 1,
          createdAt: '2026-09-23T00:00:00Z',
          updatedAt: '2026-09-23T19:00:00Z',
          items: [
            {
              producerId: 'c',
              position: 0,
              dayNumber: 2,
              createdAt: 'x',
              updatedAt: 'y',
            },
            {
              producerId: 'b',
              position: 1,
              dayNumber: 2,
              createdAt: 'x',
              updatedAt: 'y',
            },
            {
              producerId: 'a',
              position: 2,
              dayNumber: 2,
              createdAt: 'x',
              updatedAt: 'y',
            },
          ],
        },
      }),
    } as Response);

    const trip = await applyOptimizedTripDay('trip123', 2, 7, ['c', 'b', 'a']);

    expect(trip.revision).toBe(8);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.test/api/trips/trip123/optimize-day/apply',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer firebase-token',
        }),
        body: JSON.stringify({
          contractVersion: 1,
          dayNumber: 2,
          expectedRevision: 7,
          producerIds: ['c', 'b', 'a'],
        }),
      })
    );
    expect(mocks.trackIntent).not.toHaveBeenCalled();

    fetchMock.mockRestore();
  });
});
