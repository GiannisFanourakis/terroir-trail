import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  TripServiceError,
  addProducerToTrip,
  assignTripItemDay,
  createTrip,
  deleteTrip,
  getTrip,
  removeProducerFromTrip,
  reorderTripItems,
  updateTrip,
} from '../services/tripService';

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

  async set(data: Stored) {
    this.db.store.set(this.path, structuredClone(data));
  }

  async update(data: Stored) {
    const current = this.db.store.get(this.path);
    if (!current) throw new Error('missing doc');
    this.db.store.set(this.path, { ...current, ...structuredClone(data) });
  }

  async delete() {
    this.db.store.delete(this.path);
  }
}

class FakeCollection {
  constructor(
    private readonly db: FakeDb,
    public readonly path: string
  ) {}

  doc(id?: string) {
    const resolved = id || `trip${++this.db.counter}`;
    return new FakeDocRef(this.db, `${this.path}/${resolved}`, resolved);
  }

  async get() {
    const prefix = this.path + '/';
    const docs = Array.from(this.db.store.keys())
      .filter(path => path.startsWith(prefix) && !path.slice(prefix.length).includes('/'))
      .map(path => {
        const id = path.slice(prefix.length);
        return this.db.snapshot(new FakeDocRef(this.db, path, id));
      });
    return { docs };
  }
}

class FakeDb {
  store = new Map<string, Stored>();
  counter = 0;

  collection(name: string) {
    return new FakeCollection(this, name);
  }

  snapshot(ref: FakeDocRef) {
    const data = this.store.get(ref.path);
    return {
      id: ref.id,
      ref,
      exists: Boolean(data),
      data: () => data ? structuredClone(data) : undefined,
    };
  }

  async runTransaction<T>(handler: (tx: any) => Promise<T>): Promise<T> {
    const tx = {
      get: async (target: FakeDocRef | FakeCollection) =>
        target instanceof FakeCollection ? target.get() : this.snapshot(target),
      set: (ref: FakeDocRef, data: Stored) => {
        this.store.set(ref.path, structuredClone(data));
      },
      update: (ref: FakeDocRef, data: Stored) => {
        const current = this.store.get(ref.path);
        if (!current) throw new Error('missing doc');
        this.store.set(ref.path, { ...current, ...structuredClone(data) });
      },
      delete: (ref: FakeDocRef) => {
        this.store.delete(ref.path);
      },
    };
    return handler(tx);
  }
}

const activeProducer = async (id: string) => ({
  id,
  destination: 'crete',
  country: 'Greece',
  country_code: 'GR',
  category: 'winery',
});

const expectTripError = async (
  promise: Promise<unknown>,
  code: TripServiceError['code']
) => {
  await assert.rejects(
    promise,
    (error: unknown) => error instanceof TripServiceError && error.code === code
  );
};

test('My Trips creates private structural records without copying producer facts', async () => {
  const db = new FakeDb();
  const trip = await createTrip(
    'traveler-1',
    { title: '  Crete harvest  ', startDate: '2026-10-03', endDate: '2026-10-05' },
    db as any,
    new Date('2026-09-21T06:00:00Z')
  );

  assert.equal(trip.title, 'Crete harvest');
  assert.equal(trip.revision, 1);
  assert.equal(trip.itemCount, 0);

  const withProducer = await addProducerToTrip(
    'traveler-1',
    trip.id,
    { producerId: 'producer-one', expectedRevision: 1 },
    db as any,
    activeProducer,
    new Date('2026-09-21T06:01:00Z')
  );

  assert.equal(withProducer.revision, 2);
  assert.deepEqual(withProducer.items.map(item => item.producerId), ['producer-one']);
  const stored = db.store.get(`users/traveler-1/trips/${trip.id}/items/producer-one`)!;
  assert.deepEqual(Object.keys(stored).sort(), [
    'createdAt',
    'dayNumber',
    'position',
    'producerId',
    'updatedAt',
  ]);
  assert.equal('producerName' in stored, false);
  assert.equal('website' in stored, false);
  assert.equal('coordinates' in stored, false);
});

test('My Trips rejects duplicate, unverifiable and stale producer additions', async () => {
  const db = new FakeDb();
  const trip = await createTrip('traveler-1', { title: 'Trip' }, db as any);

  await addProducerToTrip(
    'traveler-1',
    trip.id,
    { producerId: 'producer-one', expectedRevision: 1 },
    db as any,
    activeProducer
  );

  await expectTripError(
    addProducerToTrip(
      'traveler-1',
      trip.id,
      { producerId: 'producer-one', expectedRevision: 2 },
      db as any,
      activeProducer
    ),
    'conflict'
  );

  await expectTripError(
    addProducerToTrip(
      'traveler-1',
      trip.id,
      { producerId: 'missing-producer', expectedRevision: 2 },
      db as any,
      async () => null
    ),
    'service_unavailable'
  );

  await expectTripError(
    addProducerToTrip(
      'traveler-1',
      trip.id,
      { producerId: 'producer-two', expectedRevision: 1 },
      db as any,
      activeProducer
    ),
    'conflict'
  );
});

test('My Trips reorder requires exact membership and current revision', async () => {
  const db = new FakeDb();
  const trip = await createTrip('traveler-1', { title: 'Trip' }, db as any);
  let current = await addProducerToTrip(
    'traveler-1',
    trip.id,
    { producerId: 'producer-one', expectedRevision: 1 },
    db as any,
    activeProducer
  );
  current = await addProducerToTrip(
    'traveler-1',
    trip.id,
    { producerId: 'producer-two', expectedRevision: current.revision },
    db as any,
    activeProducer
  );

  await expectTripError(
    reorderTripItems(
      'traveler-1',
      trip.id,
      ['producer-one'],
      current.revision,
      db as any
    ),
    'conflict'
  );

  const reordered = await reorderTripItems(
    'traveler-1',
    trip.id,
    ['producer-two', 'producer-one'],
    current.revision,
    db as any
  );
  assert.deepEqual(reordered.items.map(item => item.producerId), ['producer-two', 'producer-one']);

  await expectTripError(
    reorderTripItems(
      'traveler-1',
      trip.id,
      ['producer-one', 'producer-two'],
      current.revision,
      db as any
    ),
    'conflict'
  );
});

test('My Trips date shortening fails while an assigned day would become invalid', async () => {
  const db = new FakeDb();
  const trip = await createTrip(
    'traveler-1',
    { title: 'Trip', startDate: '2026-10-01', endDate: '2026-10-05' },
    db as any
  );
  let current = await addProducerToTrip(
    'traveler-1',
    trip.id,
    { producerId: 'producer-one', expectedRevision: 1 },
    db as any,
    activeProducer
  );
  current = await assignTripItemDay(
    'traveler-1',
    trip.id,
    'producer-one',
    5,
    current.revision,
    db as any
  );

  await expectTripError(
    updateTrip(
      'traveler-1',
      trip.id,
      {
        expectedRevision: current.revision,
        startDate: '2026-10-01',
        endDate: '2026-10-03',
      },
      db as any
    ),
    'conflict'
  );

  current = await assignTripItemDay(
    'traveler-1',
    trip.id,
    'producer-one',
    null,
    current.revision,
    db as any
  );
  const shortened = await updateTrip(
    'traveler-1',
    trip.id,
    {
      expectedRevision: current.revision,
      startDate: '2026-10-01',
      endDate: '2026-10-03',
    },
    db as any
  );
  assert.equal(shortened.endDate, '2026-10-03');
});

test('My Trips removal reindexes items and deletion removes the complete bounded tree', async () => {
  const db = new FakeDb();
  const trip = await createTrip('traveler-1', { title: 'Trip' }, db as any);
  let current = await addProducerToTrip(
    'traveler-1',
    trip.id,
    { producerId: 'producer-one', expectedRevision: 1 },
    db as any,
    activeProducer
  );
  current = await addProducerToTrip(
    'traveler-1',
    trip.id,
    { producerId: 'producer-two', expectedRevision: current.revision },
    db as any,
    activeProducer
  );

  current = await removeProducerFromTrip(
    'traveler-1',
    trip.id,
    'producer-one',
    current.revision,
    db as any
  );
  assert.equal(current.itemCount, 1);
  assert.equal(current.items[0].producerId, 'producer-two');
  assert.equal(current.items[0].position, 0);

  const result = await deleteTrip(
    'traveler-1',
    trip.id,
    current.revision,
    db as any
  );
  assert.deepEqual(result, { deleted: true, tripId: trip.id });
  await expectTripError(getTrip('traveler-1', trip.id, db as any), 'not_found');
});



test('My Trips enforces trip quota transactionally and avoids no-op revision churn', async () => {
  const db = new FakeDb();
  for (let i = 0; i < 25; i += 1) {
    db.store.set('users/traveler-1/trips/existing' + i, {
      id: 'existing' + i,
      ownerUid: 'traveler-1',
      title: 'Trip ' + i,
      startDate: null,
      endDate: null,
      itemCount: 0,
      revision: 1,
      schemaVersion: 1,
      createdAt: '2026-09-21T00:00:00Z',
      updatedAt: '2026-09-21T00:00:00Z',
    });
  }

  await expectTripError(
    createTrip('traveler-1', { title: 'Too many' }, db as any),
    'conflict'
  );

  const db2 = new FakeDb();
  const trip = await createTrip('traveler-1', { title: 'Crete' }, db2 as any);
  const unchanged = await updateTrip(
    'traveler-1',
    trip.id,
    { expectedRevision: 1, title: 'Crete' },
    db2 as any
  );
  assert.equal(unchanged.revision, 1);
});
