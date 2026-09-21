import { adminDb } from '../firebaseAdmin';
import { lookupCanonicalProducer, type ProducerLookupRow } from './analyticsIngestionService';

export const MAX_TRIPS_PER_ACCOUNT = 25;
export const MAX_TRIP_ITEMS = 50;
export const MAX_TRIP_TITLE_LENGTH = 80;
export const MAX_TRIP_DAYS = 365;

export type TripServiceErrorCode =
  | 'bad_request'
  | 'not_found'
  | 'conflict'
  | 'service_unavailable';

export class TripServiceError extends Error {
  constructor(
    public readonly code: TripServiceErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'TripServiceError';
  }
}

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

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const PRODUCER_ID_RE = /^[a-z0-9][a-z0-9-]{0,127}$/;
const TRIP_ID_RE = /^[A-Za-z0-9]{1,64}$/;

const cleanTitle = (value: unknown): string => {
  if (typeof value !== 'string') {
    throw new TripServiceError('bad_request', 'Trip title is required.');
  }
  const title = value.trim();
  if (!title || title.length > MAX_TRIP_TITLE_LENGTH) {
    throw new TripServiceError(
      'bad_request',
      `Trip title must be between 1 and ${MAX_TRIP_TITLE_LENGTH} characters.`
    );
  }
  return title;
};

const parseDateOnly = (value: unknown, field: string): string | null => {
  if (value == null || value === '') return null;
  if (typeof value !== 'string' || !DATE_RE.test(value)) {
    throw new TripServiceError('bad_request', `${field} must use YYYY-MM-DD.`);
  }
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new TripServiceError('bad_request', `${field} is not a valid calendar date.`);
  }
  return value;
};

const dateSpanDays = (startDate: string, endDate: string): number => {
  const start = Date.parse(startDate + 'T00:00:00Z');
  const end = Date.parse(endDate + 'T00:00:00Z');
  return Math.floor((end - start) / 86400000) + 1;
};

const validateDates = (startInput: unknown, endInput: unknown) => {
  const startDate = parseDateOnly(startInput, 'startDate');
  const endDate = parseDateOnly(endInput, 'endDate');
  if (endDate && !startDate) {
    throw new TripServiceError('bad_request', 'endDate requires startDate.');
  }
  if (startDate && endDate) {
    const days = dateSpanDays(startDate, endDate);
    if (days < 1) {
      throw new TripServiceError('bad_request', 'endDate cannot be before startDate.');
    }
    if (days > MAX_TRIP_DAYS) {
      throw new TripServiceError('bad_request', `Trip date range cannot exceed ${MAX_TRIP_DAYS} days.`);
    }
  }
  return { startDate, endDate };
};

const requireExpectedRevision = (value: unknown): number => {
  if (!Number.isInteger(value) || Number(value) < 1) {
    throw new TripServiceError('bad_request', 'expectedRevision must be a positive integer.');
  }
  return Number(value);
};

const validateTripId = (value: unknown): string => {
  if (typeof value !== 'string' || !TRIP_ID_RE.test(value)) {
    throw new TripServiceError('bad_request', 'Trip ID is invalid.');
  }
  return value;
};

const validateProducerId = (value: unknown): string => {
  if (typeof value !== 'string') {
    throw new TripServiceError('bad_request', 'producerId is required.');
  }
  const producerId = value.trim();
  if (!PRODUCER_ID_RE.test(producerId)) {
    throw new TripServiceError('bad_request', 'producerId is invalid.');
  }
  return producerId;
};

const validateDayNumber = (value: unknown, trip: TripRecordV1): number | null => {
  if (value == null) return null;
  if (!Number.isInteger(value) || Number(value) < 1 || Number(value) > MAX_TRIP_DAYS) {
    throw new TripServiceError('bad_request', `dayNumber must be an integer from 1 to ${MAX_TRIP_DAYS}.`);
  }
  const dayNumber = Number(value);
  if (trip.startDate && trip.endDate && dayNumber > dateSpanDays(trip.startDate, trip.endDate)) {
    throw new TripServiceError('bad_request', 'dayNumber exceeds this trip date range.');
  }
  return dayNumber;
};

const mapTrip = (doc: any): TripRecordV1 => {
  const data = doc.data() || {};
  return {
    id: String(data.id || doc.id),
    ownerUid: String(data.ownerUid || ''),
    title: String(data.title || ''),
    startDate: typeof data.startDate === 'string' ? data.startDate : null,
    endDate: typeof data.endDate === 'string' ? data.endDate : null,
    itemCount: Number(data.itemCount || 0),
    revision: Number(data.revision || 1),
    schemaVersion: 1,
    createdAt: String(data.createdAt || ''),
    updatedAt: String(data.updatedAt || ''),
  };
};

const mapItem = (doc: any): TripItemRecordV1 => {
  const data = doc.data() || {};
  return {
    producerId: String(data.producerId || doc.id),
    position: Number(data.position || 0),
    dayNumber: Number.isInteger(data.dayNumber) ? Number(data.dayNumber) : null,
    createdAt: String(data.createdAt || ''),
    updatedAt: String(data.updatedAt || ''),
  };
};

const requireOwnedTrip = (doc: any, uid: string): TripRecordV1 => {
  if (!doc.exists) throw new TripServiceError('not_found', 'Trip not found.');
  const trip = mapTrip(doc);
  if (trip.ownerUid !== uid) throw new TripServiceError('not_found', 'Trip not found.');
  return trip;
};

const assertRevision = (trip: TripRecordV1, expectedRevision: number) => {
  if (trip.revision !== expectedRevision) {
    throw new TripServiceError(
      'conflict',
      'This trip changed on another device or tab. Reload it before trying again.'
    );
  }
};

const tripsCollection = (db: any, uid: string) =>
  db.collection('users').doc(uid).collection('trips');

export async function listTrips(uid: string, db: any = adminDb()): Promise<TripRecordV1[]> {
  if (!uid) throw new TripServiceError('bad_request', 'Authenticated user ID is required.');
  const snapshot = await tripsCollection(db, uid).get();
  return snapshot.docs
    .map((doc: any) => mapTrip(doc))
    .filter((trip: TripRecordV1) => trip.ownerUid === uid)
    .sort((a: TripRecordV1, b: TripRecordV1) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getTrip(uid: string, tripId: string, db: any = adminDb()): Promise<TripWithItems> {
  if (!uid) throw new TripServiceError('bad_request', 'Authenticated user ID is required.');
  const safeTripId = validateTripId(tripId);
  const ref = tripsCollection(db, uid).doc(safeTripId);
  const [tripDoc, itemsSnapshot] = await Promise.all([
    ref.get(),
    ref.collection('items').get(),
  ]);
  const trip = requireOwnedTrip(tripDoc, uid);
  const items = itemsSnapshot.docs
    .map((doc: any) => mapItem(doc))
    .sort((a: TripItemRecordV1, b: TripItemRecordV1) => a.position - b.position);
  if (items.length !== trip.itemCount) {
    throw new TripServiceError('service_unavailable', 'Trip item integrity check failed.');
  }
  return { ...trip, items };
}

export async function createTrip(
  uid: string,
  input: { title: unknown; startDate?: unknown; endDate?: unknown },
  db: any = adminDb(),
  now = new Date()
): Promise<TripRecordV1> {
  if (!uid) throw new TripServiceError('bad_request', 'Authenticated user ID is required.');
  const title = cleanTitle(input.title);
  const { startDate, endDate } = validateDates(input.startDate, input.endDate);
  const collection = tripsCollection(db, uid);
  const ref = collection.doc();
  const occurredAt = now.toISOString();
  const trip: TripRecordV1 = {
    id: ref.id,
    ownerUid: uid,
    title,
    startDate,
    endDate,
    itemCount: 0,
    revision: 1,
    schemaVersion: 1,
    createdAt: occurredAt,
    updatedAt: occurredAt,
  };

  await db.runTransaction(async (transaction: any) => {
    const existing = await transaction.get(collection);
    if (existing.docs.length >= MAX_TRIPS_PER_ACCOUNT) {
      throw new TripServiceError('conflict', `An account can have up to ${MAX_TRIPS_PER_ACCOUNT} trips.`);
    }
    transaction.set(ref, trip);
  });

  return trip;
}

export async function updateTrip(
  uid: string,
  tripId: string,
  input: {
    expectedRevision: unknown;
    title?: unknown;
    startDate?: unknown;
    endDate?: unknown;
  },
  db: any = adminDb(),
  now = new Date()
): Promise<TripRecordV1> {
  const safeTripId = validateTripId(tripId);
  const expectedRevision = requireExpectedRevision(input.expectedRevision);
  const ref = tripsCollection(db, uid).doc(safeTripId);
  const itemsSnapshot = await ref.collection('items').get();

  return db.runTransaction(async (transaction: any) => {
    const trip = requireOwnedTrip(await transaction.get(ref), uid);
    assertRevision(trip, expectedRevision);

    const title = input.title === undefined ? trip.title : cleanTitle(input.title);
    const dates = validateDates(
      input.startDate === undefined ? trip.startDate : input.startDate,
      input.endDate === undefined ? trip.endDate : input.endDate
    );

    if (dates.startDate && dates.endDate) {
      const duration = dateSpanDays(dates.startDate, dates.endDate);
      const invalidDay = itemsSnapshot.docs
        .map((doc: any) => mapItem(doc).dayNumber)
        .some((day: number | null) => day != null && day > duration);
      if (invalidDay) {
        throw new TripServiceError(
          'conflict',
          'Move or clear day assignments before shortening this trip date range.'
        );
      }
    }

    if (
      title === trip.title &&
      dates.startDate === trip.startDate &&
      dates.endDate === trip.endDate
    ) {
      return trip;
    }

    const updated: TripRecordV1 = {
      ...trip,
      title,
      startDate: dates.startDate,
      endDate: dates.endDate,
      revision: trip.revision + 1,
      updatedAt: now.toISOString(),
    };
    transaction.set(ref, updated);
    return updated;
  });
}

export async function addProducerToTrip(
  uid: string,
  tripId: string,
  input: { producerId: unknown; expectedRevision: unknown },
  db: any = adminDb(),
  lookupProducer: (producerId: string) => Promise<ProducerLookupRow | null> = lookupCanonicalProducer,
  now = new Date()
): Promise<TripWithItems> {
  const safeTripId = validateTripId(tripId);
  const producerId = validateProducerId(input.producerId);
  const expectedRevision = requireExpectedRevision(input.expectedRevision);
  const producer = await lookupProducer(producerId);
  if (!producer) {
    throw new TripServiceError(
      'service_unavailable',
      'This producer cannot currently be verified as an active TerroirTrail listing.'
    );
  }

  const tripRef = tripsCollection(db, uid).doc(safeTripId);
  const itemRef = tripRef.collection('items').doc(producerId);
  const occurredAt = now.toISOString();

  await db.runTransaction(async (transaction: any) => {
    const [tripDoc, itemDoc] = await Promise.all([
      transaction.get(tripRef),
      transaction.get(itemRef),
    ]);
    const trip = requireOwnedTrip(tripDoc, uid);
    assertRevision(trip, expectedRevision);
    if (itemDoc.exists) {
      throw new TripServiceError('conflict', 'This producer is already in the trip.');
    }
    if (trip.itemCount >= MAX_TRIP_ITEMS) {
      throw new TripServiceError('conflict', `A trip can contain up to ${MAX_TRIP_ITEMS} producers.`);
    }

    transaction.set(itemRef, {
      producerId,
      position: trip.itemCount,
      dayNumber: null,
      createdAt: occurredAt,
      updatedAt: occurredAt,
    } satisfies TripItemRecordV1);
    transaction.update(tripRef, {
      itemCount: trip.itemCount + 1,
      revision: trip.revision + 1,
      updatedAt: occurredAt,
    });
  });

  return getTrip(uid, safeTripId, db);
}

export async function removeProducerFromTrip(
  uid: string,
  tripId: string,
  producerIdInput: unknown,
  expectedRevisionInput: unknown,
  db: any = adminDb(),
  now = new Date()
): Promise<TripWithItems> {
  const safeTripId = validateTripId(tripId);
  const producerId = validateProducerId(producerIdInput);
  const expectedRevision = requireExpectedRevision(expectedRevisionInput);
  const tripRef = tripsCollection(db, uid).doc(safeTripId);
  const itemsSnapshot = await tripRef.collection('items').get();
  const items = itemsSnapshot.docs
    .map((doc: any) => ({ ref: doc.ref, item: mapItem(doc) }))
    .sort((a: any, b: any) => a.item.position - b.item.position);
  const target = items.find((entry: any) => entry.item.producerId === producerId);
  if (!target) throw new TripServiceError('not_found', 'Trip item not found.');

  await db.runTransaction(async (transaction: any) => {
    const trip = requireOwnedTrip(await transaction.get(tripRef), uid);
    assertRevision(trip, expectedRevision);
    if (trip.itemCount !== items.length) {
      throw new TripServiceError('service_unavailable', 'Trip item integrity check failed.');
    }

    transaction.delete(target.ref);
    let position = 0;
    for (const entry of items) {
      if (entry.item.producerId === producerId) continue;
      transaction.update(entry.ref, { position, updatedAt: now.toISOString() });
      position += 1;
    }
    transaction.update(tripRef, {
      itemCount: trip.itemCount - 1,
      revision: trip.revision + 1,
      updatedAt: now.toISOString(),
    });
  });

  return getTrip(uid, safeTripId, db);
}

export async function reorderTripItems(
  uid: string,
  tripId: string,
  producerIdsInput: unknown,
  expectedRevisionInput: unknown,
  db: any = adminDb(),
  now = new Date()
): Promise<TripWithItems> {
  const safeTripId = validateTripId(tripId);
  const expectedRevision = requireExpectedRevision(expectedRevisionInput);
  if (!Array.isArray(producerIdsInput) || producerIdsInput.length > MAX_TRIP_ITEMS) {
    throw new TripServiceError('bad_request', 'producerIds must be the complete current trip order.');
  }
  const producerIds = producerIdsInput.map(validateProducerId);
  if (new Set(producerIds).size !== producerIds.length) {
    throw new TripServiceError('bad_request', 'producerIds cannot contain duplicates.');
  }

  const tripRef = tripsCollection(db, uid).doc(safeTripId);
  const snapshot = await tripRef.collection('items').get();
  const current = new Map(snapshot.docs.map((doc: any) => [doc.id, doc.ref]));
  if (
    current.size !== producerIds.length ||
    producerIds.some((producerId) => !current.has(producerId))
  ) {
    throw new TripServiceError('conflict', 'Reload the trip before reordering its producers.');
  }

  await db.runTransaction(async (transaction: any) => {
    const trip = requireOwnedTrip(await transaction.get(tripRef), uid);
    assertRevision(trip, expectedRevision);
    if (trip.itemCount !== producerIds.length) {
      throw new TripServiceError('service_unavailable', 'Trip item integrity check failed.');
    }
    producerIds.forEach((producerId, position) => {
      transaction.update(current.get(producerId), {
        position,
        updatedAt: now.toISOString(),
      });
    });
    transaction.update(tripRef, {
      revision: trip.revision + 1,
      updatedAt: now.toISOString(),
    });
  });

  return getTrip(uid, safeTripId, db);
}

export async function assignTripItemDay(
  uid: string,
  tripId: string,
  producerIdInput: unknown,
  dayNumberInput: unknown,
  expectedRevisionInput: unknown,
  db: any = adminDb(),
  now = new Date()
): Promise<TripWithItems> {
  const safeTripId = validateTripId(tripId);
  const producerId = validateProducerId(producerIdInput);
  const expectedRevision = requireExpectedRevision(expectedRevisionInput);
  const tripRef = tripsCollection(db, uid).doc(safeTripId);
  const itemRef = tripRef.collection('items').doc(producerId);

  await db.runTransaction(async (transaction: any) => {
    const [tripDoc, itemDoc] = await Promise.all([
      transaction.get(tripRef),
      transaction.get(itemRef),
    ]);
    const trip = requireOwnedTrip(tripDoc, uid);
    assertRevision(trip, expectedRevision);
    if (!itemDoc.exists) throw new TripServiceError('not_found', 'Trip item not found.');

    transaction.update(itemRef, {
      dayNumber: validateDayNumber(dayNumberInput, trip),
      updatedAt: now.toISOString(),
    });
    transaction.update(tripRef, {
      revision: trip.revision + 1,
      updatedAt: now.toISOString(),
    });
  });

  return getTrip(uid, safeTripId, db);
}

export async function deleteTrip(
  uid: string,
  tripId: string,
  expectedRevisionInput: unknown,
  db: any = adminDb()
): Promise<{ deleted: true; tripId: string }> {
  const safeTripId = validateTripId(tripId);
  const expectedRevision = requireExpectedRevision(expectedRevisionInput);
  const tripRef = tripsCollection(db, uid).doc(safeTripId);
  const snapshot = await tripRef.collection('items').get();

  await db.runTransaction(async (transaction: any) => {
    const trip = requireOwnedTrip(await transaction.get(tripRef), uid);
    assertRevision(trip, expectedRevision);
    if (trip.itemCount !== snapshot.docs.length) {
      throw new TripServiceError('service_unavailable', 'Trip item integrity check failed.');
    }
    for (const item of snapshot.docs) transaction.delete(item.ref);
    transaction.delete(tripRef);
  });

  return { deleted: true, tripId: safeTripId };
}
