import { randomBytes } from 'node:crypto';
import { adminDb } from '../firebaseAdmin';
import { getSupabaseAdmin } from './analyticsIngestionService';
import {
  TripServiceError,
  getTrip,
  type TripItemRecordV1,
} from './tripService';

const SHARE_ID_RE = /^[A-Za-z0-9_-]{20,48}$/;

export interface TripShareStateV1 {
  enabled: boolean;
  shareId: string | null;
  sharedAt: string | null;
}

export interface PublicTripShareItemV1 {
  producerId: string | null;
  producerName?: string | null;
  category?: string | null;
  destination?: string | null;
  position: number;
  dayNumber: number | null;
  state: 'active' | 'unavailable';
}

export interface PublicTripShareV1 {
  shareId: string;
  title: string;
  startDate: string | null;
  endDate: string | null;
  itemCount: number;
  updatedAt: string;
  items: PublicTripShareItemV1[];
}

const makeShareId = () => randomBytes(18).toString('base64url');

const tripRef = (db: any, uid: string, tripId: string) =>
  db.collection('users').doc(uid).collection('trips').doc(tripId);

const readShareState = (data: Record<string, unknown>): TripShareStateV1 => {
  const shareId =
    typeof data.publicShareId === 'string' &&
    SHARE_ID_RE.test(data.publicShareId)
      ? data.publicShareId
      : null;
  const enabled = data.publicShareEnabled === true && Boolean(shareId);
  return {
    enabled,
    shareId: enabled ? shareId : null,
    sharedAt:
      enabled && typeof data.publicSharedAt === 'string'
        ? data.publicSharedAt
        : null,
  };
};

export async function getTripShareState(
  uid: string,
  tripId: string,
  db: any = adminDb()
): Promise<TripShareStateV1> {
  await getTrip(uid, tripId, db);
  const snapshot = await tripRef(db, uid, tripId).get();
  return readShareState(snapshot.data() || {});
}

export async function enableTripShare(
  uid: string,
  tripId: string,
  db: any = adminDb(),
  now = new Date(),
  shareIdFactory: () => string = makeShareId
): Promise<TripShareStateV1> {
  await getTrip(uid, tripId, db);
  const ref = tripRef(db, uid, tripId);
  const occurredAt = now.toISOString();

  return db.runTransaction(async (transaction: any) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists || snapshot.data()?.ownerUid !== uid) {
      throw new TripServiceError('not_found', 'Trip not found.');
    }

    const current = readShareState(snapshot.data() || {});
    if (current.enabled) return current;

    const shareId = shareIdFactory();
    if (!SHARE_ID_RE.test(shareId)) {
      throw new TripServiceError(
        'service_unavailable',
        'Unable to create a secure trip link.'
      );
    }

    transaction.update(ref, {
      publicShareId: shareId,
      publicShareEnabled: true,
      publicSharedAt: occurredAt,
    });

    return {
      enabled: true,
      shareId,
      sharedAt: occurredAt,
    };
  });
}

export async function disableTripShare(
  uid: string,
  tripId: string,
  db: any = adminDb()
): Promise<TripShareStateV1> {
  await getTrip(uid, tripId, db);
  const ref = tripRef(db, uid, tripId);

  await db.runTransaction(async (transaction: any) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists || snapshot.data()?.ownerUid !== uid) {
      throw new TripServiceError('not_found', 'Trip not found.');
    }
    transaction.update(ref, {
      publicShareId: null,
      publicShareEnabled: false,
      publicSharedAt: null,
    });
  });

  return { enabled: false, shareId: null, sharedAt: null };
}

interface PublicProducerFact {
  id: string;
  name: string;
  category: string | null;
  destination: string | null;
}

const normalizePublicItems = (
  items: TripItemRecordV1[],
  states: Record<string, string>,
  facts: Map<string, PublicProducerFact>
): PublicTripShareItemV1[] =>
  items.map((item) => {
    const producer = facts.get(item.producerId);
    const active = states[item.producerId] === 'active' && Boolean(producer);
    return {
      producerId: active ? item.producerId : null,
      producerName: active ? producer?.name || null : null,
      category: active ? producer?.category || null : null,
      destination: active ? producer?.destination || null : null,
      position: item.position,
      dayNumber: item.dayNumber,
      state: active ? 'active' : 'unavailable',
    };
  });

async function resolveProducerStates(
  producerIds: string[],
  supabaseFactory: typeof getSupabaseAdmin = getSupabaseAdmin
): Promise<Record<string, string>> {
  if (producerIds.length === 0) return {};
  const supabase = supabaseFactory();
  if (!supabase) {
    throw new TripServiceError(
      'service_unavailable',
      'Shared trip details are temporarily unavailable.'
    );
  }

  try {
    const { data, error } = await supabase.rpc(
      'resolve_trip_producer_states_v1',
      { p_producer_ids: producerIds }
    );

    if (error || !Array.isArray(data)) {
      throw new TripServiceError(
        'service_unavailable',
        'Shared trip details are temporarily unavailable.'
      );
    }

    const states: Record<string, string> = {};
    for (const row of data as Array<Record<string, unknown>>) {
      if (
        typeof row.producer_id === 'string' &&
        typeof row.state === 'string'
      ) {
        states[row.producer_id] = row.state;
      }
    }
    return states;
  } catch (error) {
    if (error instanceof TripServiceError) throw error;
    throw new TripServiceError(
      'service_unavailable',
      'Shared trip details are temporarily unavailable.'
    );
  }
}

async function resolvePublicProducerFacts(
  producerIds: string[],
  supabaseFactory: typeof getSupabaseAdmin = getSupabaseAdmin
): Promise<Map<string, PublicProducerFact>> {
  if (producerIds.length === 0) return new Map();

  const supabase = supabaseFactory();
  if (!supabase) {
    throw new TripServiceError(
      'service_unavailable',
      'Shared trip details are temporarily unavailable.'
    );
  }

  try {
    const { data, error } = await supabase
      .from('producers')
      .select('id, name, category, destination')
      .in('id', producerIds)
      .eq('is_active', true);

    if (error || !Array.isArray(data)) {
      throw new TripServiceError(
        'service_unavailable',
        'Shared trip details are temporarily unavailable.'
      );
    }

    return new Map(
      (data as PublicProducerFact[])
        .filter((row) => typeof row.id === 'string' && typeof row.name === 'string')
        .map((row) => [row.id, row])
    );
  } catch (error) {
    if (error instanceof TripServiceError) throw error;
    throw new TripServiceError(
      'service_unavailable',
      'Shared trip details are temporarily unavailable.'
    );
  }
}

export async function getPublicTripShare(
  shareIdInput: string,
  db: any = adminDb(),
  supabaseFactory: typeof getSupabaseAdmin = getSupabaseAdmin
): Promise<PublicTripShareV1> {
  const shareId = String(shareIdInput || '').trim();
  if (!SHARE_ID_RE.test(shareId)) {
    throw new TripServiceError('not_found', 'Shared trip not found.');
  }

  const matches = await db
    .collectionGroup('trips')
    .where('publicShareId', '==', shareId)
    .limit(1)
    .get();

  const snapshot = matches.docs?.[0];
  if (!snapshot?.exists) {
    throw new TripServiceError('not_found', 'Shared trip not found.');
  }

  const data = snapshot.data() || {};
  if (data.publicShareEnabled !== true || data.publicShareId !== shareId) {
    throw new TripServiceError('not_found', 'Shared trip not found.');
  }

  const ownerUid = typeof data.ownerUid === 'string' ? data.ownerUid : '';
  const tripId = typeof data.id === 'string' ? data.id : snapshot.id;
  if (!ownerUid || !tripId) {
    throw new TripServiceError('not_found', 'Shared trip not found.');
  }

  const trip = await getTrip(ownerUid, tripId, db);
  const producerIds = trip.items.map((item) => item.producerId);
  const [states, facts] = await Promise.all([
    resolveProducerStates(producerIds, supabaseFactory),
    resolvePublicProducerFacts(producerIds, supabaseFactory),
  ]);
  const items = normalizePublicItems(trip.items, states, facts);

  return {
    shareId,
    title: trip.title,
    startDate: trip.startDate,
    endDate: trip.endDate,
    itemCount: items.length,
    updatedAt: trip.updatedAt,
    items,
  };
}
