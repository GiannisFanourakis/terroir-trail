import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getIdToken: vi.fn(async () => 'firebase-token'),
  mocks.trackIntent: vi.fn(async () => ({ success: true, clientEventId: 'event-id' })),
}));

vi.mock('./firebase', () => ({
  auth: {
    currentUser: {
      getIdToken: mocks.getIdToken,
    },
  },
}));

vi.mock('./intentAnalytics', () => ({
  mocks.trackIntent: mocks.trackIntent,
}));

vi.mock('./apiOrigin', () => ({
  resolveApiBaseUrl: () => 'https://api.example.test',
}));

import {
  addProducerToTrip,
  createTrip,
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
});
