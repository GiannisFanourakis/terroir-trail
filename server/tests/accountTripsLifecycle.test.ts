import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deleteOwnAccount, exportAccountData } from '../services/accountSelfService';

type Data = Record<string, any>;

class Ref {
  constructor(private db: FakeDb, public path: string, public id: string) {}
  collection(name: string) { return new Col(this.db, this.path + '/' + name); }
  async get() { return this.db.snap(this); }
  async delete() { this.db.store.delete(this.path); }
}

class Col {
  constructor(private db: FakeDb, public path: string) {}
  doc(id: string) { return new Ref(this.db, this.path + '/' + id, id); }
  async get() { return this.db.collectionSnapshot(this.path); }
  where(field: string, _op: string, value: unknown) {
    return {
      get: async () => {
        const snap = this.db.collectionSnapshot(this.path);
        return {
          docs: snap.docs.filter((doc: any) => doc.data()?.[field] === value),
        };
      },
    };
  }
  async add(data: Data) {
    const id = 'audit-' + (++this.db.counter);
    this.db.store.set(this.path + '/' + id, structuredClone(data));
    return this.doc(id);
  }
}

class FakeBatch {
  private ops: Array<() => void> = [];
  constructor(private db: FakeDb) {}
  delete(ref: Ref) { this.ops.push(() => this.db.store.delete(ref.path)); }
  update(ref: Ref, data: Data) {
    this.ops.push(() => {
      const current = this.db.store.get(ref.path) || {};
      this.db.store.set(ref.path, { ...current, ...structuredClone(data) });
    });
  }
  set(ref: Ref, data: Data) { this.ops.push(() => this.db.store.set(ref.path, structuredClone(data))); }
  async commit() { this.ops.forEach(op => op()); }
}

class FakeDb {
  store = new Map<string, Data>();
  counter = 0;
  collection(name: string) { return new Col(this, name); }
  batch() { return new FakeBatch(this); }
  snap(ref: Ref) {
    const data = this.store.get(ref.path);
    return {
      id: ref.id,
      ref,
      exists: Boolean(data),
      data: () => data ? structuredClone(data) : undefined,
    };
  }
  collectionSnapshot(path: string) {
    const prefix = path + '/';
    const docs = Array.from(this.store.keys())
      .filter(key => key.startsWith(prefix) && !key.slice(prefix.length).includes('/'))
      .map(key => {
        const id = key.slice(prefix.length);
        return this.snap(new Ref(this, key, id));
      });
    return { docs };
  }
}

const seedTrip = (db: FakeDb) => {
  db.store.set('users/traveler-1', { name: 'Traveler' });
  db.store.set('users/traveler-1/trips/trip-1', {
    id: 'trip-1',
    ownerUid: 'traveler-1',
    title: 'Crete',
    startDate: '2026-10-01',
    endDate: '2026-10-03',
    itemCount: 1,
    revision: 2,
    schemaVersion: 1,
    createdAt: '2026-09-21T00:00:00Z',
    updatedAt: '2026-09-21T00:01:00Z',
  });
  db.store.set('users/traveler-1/trips/trip-1/items/producer-a', {
    producerId: 'producer-a',
    position: 0,
    dayNumber: 2,
    createdAt: '2026-09-21T00:01:00Z',
    updatedAt: '2026-09-21T00:01:00Z',
  });
};

const fakeAuth = () => {
  const deleted: string[] = [];
  return {
    deleted,
    client: {
      getUser: async (uid: string) => ({
        uid,
        email: 'traveler@example.com',
        displayName: 'Traveler',
        disabled: false,
        metadata: { creationTime: 'created', lastSignInTime: 'last' },
        providerData: [{ providerId: 'password' }],
      }),
      deleteUser: async (uid: string) => { deleted.push(uid); },
    },
  };
};

test('account privacy export includes nested My Trips structure', async () => {
  const db = new FakeDb();
  seedTrip(db);
  const auth = fakeAuth();

  const exported = await exportAccountData(
    'traveler-1',
    db as any,
    auth.client as any,
    async () => []
  );

  assert.equal(exported.trips.length, 1);
  assert.equal(exported.trips[0].title, 'Crete');
  assert.deepEqual(exported.trips[0].items, [{
    id: 'producer-a',
    producerId: 'producer-a',
    position: 0,
    dayNumber: 2,
    createdAt: '2026-09-21T00:01:00Z',
    updatedAt: '2026-09-21T00:01:00Z',
  }]);
});

test('account deletion removes My Trips parent and item documents before auth deletion', async () => {
  const db = new FakeDb();
  seedTrip(db);
  const auth = fakeAuth();

  const result = await deleteOwnAccount(
    'traveler-1',
    db as any,
    auth.client as any,
    async () => 3
  );

  assert.equal(result.deleted, true);
  assert.equal(result.deletedTrips, 1);
  assert.equal(result.deletedTripItems, 1);
  assert.equal(db.store.has('users/traveler-1/trips/trip-1'), false);
  assert.equal(db.store.has('users/traveler-1/trips/trip-1/items/producer-a'), false);
  assert.equal(db.store.has('users/traveler-1'), false);
  assert.deepEqual(auth.deleted, ['traveler-1']);
});
