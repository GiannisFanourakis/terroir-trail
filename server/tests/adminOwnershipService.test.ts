import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  AdminOwnershipError,
  listActiveProducerOwnerships,
  reassignProducerOwnership,
  revokeProducerOwnership,
} from '../services/adminOwnershipService';

const makeHarness = () => {
  const collections = new Map<string, Map<string, Record<string, any>>>();
  let generated = 0;
  const getCollection = (name: string) => {
    if (!collections.has(name)) collections.set(name, new Map());
    return collections.get(name)!;
  };

  const makeDocRef = (collectionName: string, id: string) => ({ collectionName, id });
  const makeQuery = (
    collectionName: string,
    filters: Array<{ field: string; value: unknown }>
  ) => ({ collectionName, filters });

  const readDoc = (ref: any) => {
    const data = getCollection(ref.collectionName).get(ref.id);
    return { exists: Boolean(data), id: ref.id, data: () => data };
  };
  const readQuery = (query: any) => ({
    docs: [...getCollection(query.collectionName).entries()]
      .filter(([, data]) => query.filters.every((f: any) => data[f.field] === f.value))
      .map(([id, data]) => ({ id, data: () => data })),
  });

  const db = {
    collection: (name: string) => ({
      doc: (id?: string) => {
        const ref = makeDocRef(name, id || `generated-${++generated}`);
        return { ...ref, get: async () => readDoc(ref) };
      },
      where: (field: string, _operator: string, value: unknown) => {
        const filters = [{ field, value }];
        const chain: any = {
          where: (nextField: string, _nextOperator: string, nextValue: unknown) => {
            filters.push({ field: nextField, value: nextValue });
            return chain;
          },
          get: async () => readQuery(makeQuery(name, filters)),
          collectionName: name,
          filters,
        };
        return chain;
      },
    }),
    runTransaction: async (callback: (transaction: any) => Promise<any>) => {
      const transaction = {
        get: async (target: any) => target.filters ? readQuery(target) : readDoc(target),
        set: (ref: any, data: Record<string, any>) => {
          getCollection(ref.collectionName).set(ref.id, { ...data });
        },
        update: (ref: any, data: Record<string, any>) => {
          const current = getCollection(ref.collectionName).get(ref.id) || {};
          getCollection(ref.collectionName).set(ref.id, { ...current, ...data });
        },
      };
      return callback(transaction);
    },
  };

  const users = new Map<string, { uid: string; email: string; displayName?: string }>();
  const auth = {
    getUser: async (uid: string) => {
      const user = users.get(uid);
      if (!user) throw new Error('not found');
      return user;
    },
    getUserByEmail: async (email: string) => {
      const user = [...users.values()].find(item => item.email.toLowerCase() === email.toLowerCase());
      if (!user) throw new Error('not found');
      return user;
    },
  };

  const seedAdmin = (uid: string) => {
    getCollection('admin_users').set(uid, { userId: uid, level: 'admin', status: 'active' });
  };
  const seedUser = (uid: string, email: string, displayName?: string) => {
    users.set(uid, { uid, email, displayName });
  };

  return { db, auth, getCollection, seedAdmin, seedUser };
};

test('admin can list active producer ownership records', async () => {
  const { db, auth, getCollection, seedAdmin, seedUser } = makeHarness();
  seedAdmin('admin-uid');
  seedUser('owner-uid', 'owner@example.com', 'Owner Name');
  getCollection('producer_owners').set('producer-a', {
    producerId: 'producer-a',
    ownerUid: 'owner-uid',
    status: 'active',
    approvedAt: '2026-09-15T12:00:00Z',
  });
  getCollection('producer_registrations').set('producer-a', {
    producerId: 'producer-a',
    tradeBrandName: 'Producer A',
  });

  const ownerships = await listActiveProducerOwnerships('admin-uid', db as any, auth as any);
  assert.equal(ownerships.length, 1);
  assert.equal(ownerships[0].producerName, 'Producer A');
  assert.equal(ownerships[0].ownerEmail, 'owner@example.com');
});

test('traveler cannot list, revoke, or reassign producer ownership', async () => {
  const { db, auth } = makeHarness();

  await assert.rejects(
    listActiveProducerOwnerships('traveler', db as any, auth as any),
    (error: unknown) => error instanceof AdminOwnershipError && error.code === 'forbidden'
  );
  await assert.rejects(
    revokeProducerOwnership('traveler', 'producer-a', 'Ownership is disputed.', db as any),
    (error: unknown) => error instanceof AdminOwnershipError && error.code === 'forbidden'
  );
  await assert.rejects(
    reassignProducerOwnership('traveler', 'producer-a', 'next@example.com', 'Ownership changed.', db as any, auth as any),
    (error: unknown) => error instanceof AdminOwnershipError && error.code === 'forbidden'
  );
});

test('admin revoke removes active authority, marks registration unassigned, and audits the change', async () => {
  const { db, getCollection, seedAdmin } = makeHarness();
  seedAdmin('admin-uid');
  getCollection('producer_owners').set('producer-a', {
    producerId: 'producer-a',
    ownerUid: 'owner-uid',
    status: 'active',
  });
  getCollection('producer_registrations').set('producer-a', {
    producerId: 'producer-a',
    status: 'verified_active',
    assignedOwnerUid: 'owner-uid',
  });

  const result = await revokeProducerOwnership(
    'admin-uid',
    'producer-a',
    'The listing is under an ownership dispute.',
    db as any
  );

  assert.equal(result.status, 'revoked');
  assert.equal(getCollection('producer_owners').get('producer-a')?.status, 'revoked');
  assert.equal(getCollection('producer_registrations').get('producer-a')?.status, 'verified_unassigned');
  assert.equal(getCollection('producer_registrations').get('producer-a')?.assignedOwnerUid, null);
  const audit = [...getCollection('admin_audit').values()][0];
  assert.equal(audit.eventType, 'producer_ownership_revoked');
  assert.equal(audit.targetUid, 'owner-uid');
});

test('admin can reassign ownership to an existing account', async () => {
  const { db, auth, getCollection, seedAdmin, seedUser } = makeHarness();
  seedAdmin('admin-uid');
  seedUser('old-owner', 'old@example.com');
  seedUser('new-owner', 'new@example.com', 'New Owner');
  getCollection('producer_owners').set('producer-a', {
    producerId: 'producer-a',
    ownerUid: 'old-owner',
    status: 'active',
  });
  getCollection('producer_registrations').set('producer-a', {
    producerId: 'producer-a',
    status: 'verified_active',
    assignedOwnerUid: 'old-owner',
  });

  const result = await reassignProducerOwnership(
    'admin-uid',
    'producer-a',
    'new@example.com',
    'The verified business representative changed.',
    db as any,
    auth as any
  );

  assert.equal(result.ownerUid, 'new-owner');
  assert.equal(getCollection('producer_owners').get('producer-a')?.ownerUid, 'new-owner');
  assert.equal(getCollection('producer_owners').get('producer-a')?.previousOwnerUid, 'old-owner');
  assert.equal(getCollection('producer_registrations').get('producer-a')?.assignedOwnerUid, 'new-owner');
  const audit = [...getCollection('admin_audit').values()][0];
  assert.equal(audit.eventType, 'producer_ownership_reassigned');
  assert.equal(audit.previousOwnerUid, 'old-owner');
});

test('reassign rejects an account that already owns another active producer listing', async () => {
  const { db, auth, getCollection, seedAdmin, seedUser } = makeHarness();
  seedAdmin('admin-uid');
  seedUser('new-owner', 'new@example.com');
  getCollection('producer_owners').set('producer-a', {
    producerId: 'producer-a',
    ownerUid: 'old-owner',
    status: 'active',
  });
  getCollection('producer_owners').set('producer-b', {
    producerId: 'producer-b',
    ownerUid: 'new-owner',
    status: 'active',
  });

  await assert.rejects(
    reassignProducerOwnership(
      'admin-uid',
      'producer-a',
      'new@example.com',
      'Ownership changed.',
      db as any,
      auth as any
    ),
    (error: unknown) => error instanceof AdminOwnershipError && error.code === 'conflict'
  );
});
