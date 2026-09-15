import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  AdminClaimError,
  approveProducerClaim,
  listPendingProducerClaims,
  rejectProducerClaim,
} from '../services/adminClaimsService';

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
      doc: (id?: string) => makeDocRef(name, id || `generated-${++generated}`),
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
        get: async (target: any) =>
          target.filters ? readQuery(target) : readDoc(target),
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

  const seedAdmin = (uid: string, level: 'owner' | 'admin' = 'admin') => {
    getCollection('admin_users').set(uid, {
      userId: uid,
      level,
      status: 'active',
    });
  };

  return { db, getCollection, seedAdmin };
};

test('admin can list pending producer requests without exposing registration banking data', async () => {
  const { db, getCollection, seedAdmin } = makeHarness();
  seedAdmin('admin-uid');
  getCollection('producer_registrations').set('producer-a', {
    producerId: 'producer-a',
    tradeBrandName: 'Producer A',
    officialEmail: 'a@example.com',
    status: 'pending_verification',
    submittedAt: '2026-09-15T12:00:00Z',
    banking: { iban: 'SECRET' },
  });
  getCollection('producer_registrations').set('producer-b', {
    producerId: 'producer-b',
    tradeBrandName: 'Producer B',
    officialEmail: 'b@example.com',
    status: 'verified_active',
  });

  const claims = await listPendingProducerClaims('admin-uid', db as any);
  assert.equal(claims.length, 1);
  assert.equal(claims[0].producerId, 'producer-a');
  assert.equal((claims[0] as any).banking, undefined);
});

test('traveler cannot list or decide producer requests', async () => {
  const { db } = makeHarness();

  await assert.rejects(
    listPendingProducerClaims('traveler-uid', db as any),
    (error: unknown) => error instanceof AdminClaimError && error.code === 'forbidden'
  );
  await assert.rejects(
    approveProducerClaim('traveler-uid', 'producer-a', db as any),
    (error: unknown) => error instanceof AdminClaimError && error.code === 'forbidden'
  );
});

test('admin approval creates trusted ownership and audit trail', async () => {
  const { db, getCollection, seedAdmin } = makeHarness();
  seedAdmin('admin-uid');
  getCollection('producer_registrations').set('producer-a', {
    producerId: 'producer-a',
    userId: 'applicant-uid',
    tradeBrandName: 'Producer A',
    officialEmail: 'a@example.com',
    status: 'pending_verification',
  });

  const result = await approveProducerClaim('admin-uid', 'producer-a', db as any);
  assert.equal(result.status, 'verified_active');
  assert.equal(getCollection('producer_owners').get('producer-a')?.ownerUid, 'applicant-uid');
  assert.equal(getCollection('producer_registrations').get('producer-a')?.approvedBy, 'admin-uid');
  assert.equal(getCollection('admin_audit').size, 1);
});

test('admin rejection records reason and does not grant ownership', async () => {
  const { db, getCollection, seedAdmin } = makeHarness();
  seedAdmin('admin-uid');
  getCollection('producer_registrations').set('producer-a', {
    producerId: 'producer-a',
    userId: 'applicant-uid',
    status: 'pending_verification',
  });

  const result = await rejectProducerClaim(
    'admin-uid',
    'producer-a',
    'Ownership evidence is insufficient.',
    db as any
  );

  assert.equal(result.status, 'rejected');
  assert.equal(getCollection('producer_registrations').get('producer-a')?.status, 'rejected');
  assert.equal(getCollection('producer_owners').has('producer-a'), false);
  assert.equal(getCollection('admin_audit').size, 1);
});
