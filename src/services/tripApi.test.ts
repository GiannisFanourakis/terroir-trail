import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getIdToken: vi.fn(async () => 'firebase-token'),
  trackIntent: vi.fn(async () => ({ success: true, clientEventId: 'event-id' })),
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
  createTrip,
  getTripProducerStates,
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

