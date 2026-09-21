import { auth } from './firebase';
import { resolveApiBaseUrl } from './apiOrigin';
import { trackIntent } from './intentAnalytics';

export interface TripRecordV1 {
  id: string;
  ownerUid: string;
  title: string;
  startDate: string | null;
  endDate: string | null;
  itemCount: number;
  revision: number;
  schemaVersion: 1;
  createdAt: string;
  updatedAt: string;
}

export interface TripItemRecordV1 {
  producerId: string;
  position: number;
  dayNumber: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface TripWithItems extends TripRecordV1 {
  items: TripItemRecordV1[];
}

export class TripApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string | null,
    message: string
  ) {
    super(message);
    this.name = 'TripApiError';
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const user = auth?.currentUser;
  if (!user) throw new TripApiError(401, 'unauthorized', 'Sign in to use My Trips.');

  const token = await user.getIdToken();
  const response = await fetch(resolveApiBaseUrl() + '/api' + path, {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
      ...(init.headers || {}),
    },
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new TripApiError(
      response.status,
      typeof body?.code === 'string' ? body.code : null,
      typeof body?.error === 'string' ? body.error : 'My Trips request failed.'
    );
  }
  return body as T;
}

export const listTrips = async (): Promise<TripRecordV1[]> =>
  (await request<{ trips: TripRecordV1[] }>('/trips')).trips;

export const getTrip = async (tripId: string): Promise<TripWithItems> =>
  (await request<{ trip: TripWithItems }>('/trips/' + encodeURIComponent(tripId))).trip;

export async function createTrip(
  input: { title: string; startDate?: string | null; endDate?: string | null },
  sourceSurface: 'trip_add_flow' | 'my_trips' | 'profile_menu'
): Promise<TripRecordV1> {
  const trip = (await request<{ trip: TripRecordV1 }>('/trips', {
    method: 'POST',
    body: JSON.stringify(input),
  })).trip;
  void trackIntent({ event: 'trip_created', sourceSurface });
  return trip;
}

export async function updateTrip(
  tripId: string,
  input: {
    expectedRevision: number;
    title?: string;
    startDate?: string | null;
    endDate?: string | null;
  }
): Promise<TripRecordV1> {
  const trip = (await request<{ trip: TripRecordV1 }>('/trips/' + encodeURIComponent(tripId), {
    method: 'PATCH',
    body: JSON.stringify(input),
  })).trip;
  if (input.title !== undefined) {
    void trackIntent({ event: 'trip_renamed', sourceSurface: 'trip_workspace' });
  }
  return trip;
}

export async function deleteTrip(tripId: string, expectedRevision: number) {
  return request<{ deleted: true; tripId: string }>('/trips/' + encodeURIComponent(tripId), {
    method: 'DELETE',
    body: JSON.stringify({ expectedRevision }),
  });
}

export async function addProducerToTrip(
  tripId: string,
  producerId: string,
  expectedRevision: number,
  sourceSurface: 'trip_add_flow' | 'producer_drawer' | 'trip_workspace'
): Promise<TripWithItems> {
  const trip = (await request<{ trip: TripWithItems }>(
    '/trips/' + encodeURIComponent(tripId) + '/items',
    {
      method: 'POST',
      body: JSON.stringify({ producerId, expectedRevision }),
    }
  )).trip;
  void trackIntent({
    event: 'trip_producer_added',
    sourceSurface,
    producerId,
  });
  return trip;
}

export async function removeProducerFromTrip(
  tripId: string,
  producerId: string,
  expectedRevision: number
): Promise<TripWithItems> {
  const trip = (await request<{ trip: TripWithItems }>(
    '/trips/' + encodeURIComponent(tripId) + '/items/' + encodeURIComponent(producerId),
    {
      method: 'DELETE',
      body: JSON.stringify({ expectedRevision }),
    }
  )).trip;
  void trackIntent({
    event: 'trip_producer_removed',
    sourceSurface: 'trip_workspace',
    producerId,
  });
  return trip;
}

export async function reorderTripItems(
  tripId: string,
  producerIds: string[],
  expectedRevision: number
): Promise<TripWithItems> {
  const trip = (await request<{ trip: TripWithItems }>(
    '/trips/' + encodeURIComponent(tripId) + '/reorder',
    {
      method: 'POST',
      body: JSON.stringify({ producerIds, expectedRevision }),
    }
  )).trip;
  void trackIntent({ event: 'trip_item_reordered', sourceSurface: 'trip_workspace' });
  return trip;
}

export async function assignTripItemDay(
  tripId: string,
  producerId: string,
  dayNumber: number | null,
  expectedRevision: number
): Promise<TripWithItems> {
  const trip = (await request<{ trip: TripWithItems }>(
    '/trips/' + encodeURIComponent(tripId) + '/items/' + encodeURIComponent(producerId) + '/day',
    {
      method: 'PATCH',
      body: JSON.stringify({ dayNumber, expectedRevision }),
    }
  )).trip;
  void trackIntent({ event: 'trip_day_assigned', sourceSurface: 'trip_workspace' });
  return trip;
}

export const trackTripOpened = (sourceSurface: 'my_trips' | 'profile_menu') =>
  trackIntent({ event: 'trip_opened', sourceSurface });
