import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  disableTripShare,
  enableTripShare,
  getPublicTripShare,
  getTripShareState,
} from '../services/tripShareService';
import { TripServiceError } from '../services/tripService';

type Stored = Record<string, any>;

class FakeDocRef {
  constructor(
    private readonly db: FakeDb,
    public readonly path: string,
    public readonly id: string
  ) {}

  collection(name: string) {
    return new FakeCollection(this.db, `${this.path}/${name}`);
  }

  async get() {
    return this.db.snapshot(this);
  }
}
class FakeCollection {
  constructor(
    private readonly db: FakeDb,
    public readonly path: string
  ) {}

  doc(id: string) {
    return new FakeDocRef(this.db, `${this.path}/${id}`, id);
  }

  async get() {
    const prefix = this.path + '/';
    const docs = Array.from(this.db.store.keys())
      .filter(
        (path) =>
          path.startsWith(prefix) && !path.slice(prefix.length).includes('/')
      )
      .map((path) => {
        const id = path.slice(prefix.length);
        return this.db.snapshot(new FakeDocRef(this.db, path, id));
      });
    return { docs };
  }
}

class FakeQuery {
  private field = '';
  private value: unknown;
  private max = Infinity;

  constructor(private readonly db: FakeDb) {}
  where(field: string, op: string, value: unknown) {
    assert.equal(op, '==');
    this.field = field;
    this.value = value;
    return this;
  }

  limit(max: number) {
    this.max = max;
    return this;
  }

  async get() {
    const docs = Array.from(this.db.store.keys())
      .filter((path) => {
        const parts = path.split('/');
        if (parts.length < 2 || parts.at(-2) !== 'trips') return false;
        return this.db.store.get(path)?.[this.field] === this.value;
      })
      .slice(0, this.max)
      .map((path) => {
        const id = path.split('/').at(-1)!;
        return this.db.snapshot(new FakeDocRef(this.db, path, id));
      });
    return { docs };
  }
}

class FakeDb {
  store = new Map<string, Stored>();

  collection(name: string) {
    return new FakeCollection(this, name);
  }
  collectionGroup(name: string) {
    assert.equal(name, 'trips');
    return new FakeQuery(this);
  }

  snapshot(ref: FakeDocRef) {
    const data = this.store.get(ref.path);
    return {
      id: ref.id,
      ref,
      exists: Boolean(data),
      data: () => (data ? structuredClone(data) : undefined),
    };
  }

  async runTransaction<T>(handler: (tx: any) => Promise<T>): Promise<T> {
    return handler({
      get: async (ref: FakeDocRef) => this.snapshot(ref),
      update: (ref: FakeDocRef, data: Stored) => {
        const current = this.store.get(ref.path);
        if (!current) throw new Error('missing doc');
        this.store.set(ref.path, { ...current, ...structuredClone(data) });
      },
    });
  }
}

const seedTrip = (db: FakeDb) => {
  db.store.set('users/traveler-1/trips/trip123', {
    id: 'trip123',
    ownerUid: 'traveler-1',
    title: 'Crete harvest',
    startDate: '2026-10-04',
    endDate: '2026-10-05',
    itemCount: 2,
    revision: 3,
    schemaVersion: 1,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-01T11:00:00Z',
  });
  db.store.set('users/traveler-1/trips/trip123/items/producer-one', {
    producerId: 'producer-one',
    position: 0,
    dayNumber: 1,
    createdAt: 'x',
    updatedAt: 'x',
  });
  db.store.set('users/traveler-1/trips/trip123/items/producer-two', {
    producerId: 'producer-two',
    position: 1,
    dayNumber: 2,
    createdAt: 'x',
    updatedAt: 'x',
  });
};

test('trip sharing is opt-in, revocable, and filters non-public producer identity', async () => {
  const db = new FakeDb();
  seedTrip(db);
  const shareId = 'abcdefghijklmnopqrstuvwx';
  assert.deepEqual(
    await getTripShareState('traveler-1', 'trip123', db as any),
    { enabled: false, shareId: null, sharedAt: null }
  );

  const enabled = await enableTripShare(
    'traveler-1',
    'trip123',
    db as any,
    new Date('2026-10-01T12:00:00Z'),
    () => shareId
  );
  assert.equal(enabled.shareId, shareId);

  const fakeSupabase = {
    rpc: async () => ({
      data: [
        { producer_id: 'producer-one', state: 'active' },
        { producer_id: 'producer-two', state: 'no_longer_listed' },
      ],
      error: null,
    }),
    from: () => ({
      select: () => ({
        in: () => ({
          eq: async () => ({
            data: [
              {
                id: 'producer-one',
                name: 'Producer One',
                category: 'winery',
                destination: 'crete',
              },
            ],
            error: null,
          }),
        }),
      }),
    }),
  };

  const publicTrip = await getPublicTripShare(
    shareId,
    db as any,
    () => fakeSupabase as any
  );
  assert.equal(publicTrip.title, 'Crete harvest');
  assert.equal(publicTrip.items[0].producerId, 'producer-one');
  assert.equal(publicTrip.items[0].producerName, 'Producer One');
  assert.equal(publicTrip.items[1].producerId, null);
  assert.equal(publicTrip.items[1].producerName, null);
  assert.equal('ownerUid' in (publicTrip as any), false);
  await disableTripShare('traveler-1', 'trip123', db as any);

  await assert.rejects(
    getPublicTripShare(shareId, db as any, () => fakeSupabase as any),
    (error: unknown) =>
      error instanceof TripServiceError && error.code === 'not_found'
  );
});
