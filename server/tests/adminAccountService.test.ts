import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  AdminAccountError,
  searchAdminAccounts,
  setAccountDisabled,
} from '../services/adminAccountService';

const makeHarness = () => {
  const collections = new Map<string, Map<string, Record<string, any>>>();
  const users = new Map<string, Record<string, any>>();
  const revoked = new Set<string>();
  let generated = 0;

  const getCollection = (name: string) => {
    if (!collections.has(name)) collections.set(name, new Map());
    return collections.get(name)!;
  };

  const refFor = (name: string, id?: string) => {
    const actualId = id || `generated-${++generated}`;
    return {
      id: actualId,
      collectionName: name,
      get: async () => {
        const data = getCollection(name).get(actualId);
        return { exists: Boolean(data), data: () => data };
      },
      set: async (data: Record<string, any>, options?: { merge?: boolean }) => {
        const collection = getCollection(name);
        const previous = collection.get(actualId) || {};
        collection.set(actualId, options?.merge ? { ...previous, ...data } : { ...data });
      },
    };
  };

  const db = {
    collection: (name: string) => ({
      doc: (id?: string) => refFor(name, id),
      where: (field: string, _operator: string, value: unknown) => ({
        get: async () => ({
          docs: [...getCollection(name).entries()]
            .filter(([, data]) => data[field] === value)
            .map(([id, data]) => ({ id, data: () => data })),
        }),
      }),
    }),
  };

  const auth = {
    listUsers: async () => ({ users: [...users.values()], pageToken: undefined }),
    getUser: async (uid: string) => {
      const user = users.get(uid);
      if (!user) throw new Error('not found');
      return user;
    },
    updateUser: async (uid: string, patch: Record<string, any>) => {
      const user = users.get(uid);
      if (!user) throw new Error('not found');
      const updated = { ...user, ...patch };
      users.set(uid, updated);
      return updated;
    },
    revokeRefreshTokens: async (uid: string) => {
      revoked.add(uid);
    },
  };

  return { db, auth, users, revoked, getCollection };
};

const seedAdmin = (getCollection: ReturnType<typeof makeHarness>['getCollection'], uid: string, level: 'admin' | 'owner' = 'admin') => {
  getCollection('admin_users').set(uid, {
    userId: uid,
    level,
    status: 'active',
  });
};

test('admin account search returns only operational status and trusted authority summary', async () => {
  const { db, auth, users, getCollection } = makeHarness();
  seedAdmin(getCollection, 'admin-uid');
  users.set('admin-uid', { uid: 'admin-uid', email: 'admin@example.com', disabled: false, emailVerified: true });
  users.set('host-uid', { uid: 'host-uid', email: 'olive.host@example.com', displayName: 'Olive Host', disabled: false, emailVerified: true });
  getCollection('producer_owners').set('producer-a', {
    producerId: 'producer-a',
    ownerUid: 'host-uid',
    status: 'active',
  });

  const results = await searchAdminAccounts('admin-uid', 'olive', db as any, auth as any);

  assert.equal(results.length, 1);
  assert.equal(results[0].uid, 'host-uid');
  assert.deepEqual(results[0].roles, ['traveler', 'producer_host']);
  assert.deepEqual(results[0].producerIds, ['producer-a']);
  assert.equal(results[0].canDisable, true);
  assert.equal('favorites' in results[0], false);
  assert.equal('passportNotes' in results[0], false);
});

test('ordinary admin can disable a Host with an audit reason', async () => {
  const { db, auth, users, revoked, getCollection } = makeHarness();
  seedAdmin(getCollection, 'admin-uid');
  users.set('admin-uid', { uid: 'admin-uid', email: 'admin@example.com', disabled: false });
  users.set('host-uid', { uid: 'host-uid', email: 'host@example.com', disabled: false });
  getCollection('producer_owners').set('producer-a', {
    producerId: 'producer-a',
    ownerUid: 'host-uid',
    status: 'active',
  });

  await setAccountDisabled('admin-uid', 'host-uid', true, 'Repeated impersonation report', db as any, auth as any);
  assert.equal(users.get('host-uid')?.disabled, true);
  assert.equal(revoked.has('host-uid'), true);

  const events = [...getCollection('admin_audit').values()].map(event => event.eventType);
  assert.ok(events.includes('account_disabled'));
});

test('ordinary admin cannot act against another active Admin', async () => {
  const { db, auth, users, getCollection } = makeHarness();
  seedAdmin(getCollection, 'admin-a');
  seedAdmin(getCollection, 'admin-b');
  users.set('admin-a', { uid: 'admin-a', email: 'a@example.com', disabled: false });
  users.set('admin-b', { uid: 'admin-b', email: 'b@example.com', disabled: false });

  await assert.rejects(
    setAccountDisabled('admin-a', 'admin-b', true, 'Security review', db as any, auth as any),
    (error: unknown) => error instanceof AdminAccountError && error.code === 'forbidden'
  );
  assert.equal(users.get('admin-b')?.disabled, false);
});

test('Platform Owner may act against an ordinary Admin but owner account itself is protected', async () => {
  const { db, auth, users, getCollection } = makeHarness();
  seedAdmin(getCollection, 'owner-uid', 'owner');
  seedAdmin(getCollection, 'admin-uid');
  users.set('owner-uid', { uid: 'owner-uid', email: 'owner@example.com', disabled: false });
  users.set('admin-uid', { uid: 'admin-uid', email: 'admin@example.com', disabled: false });

  await setAccountDisabled('owner-uid', 'admin-uid', true, 'Owner-authorized access suspension', db as any, auth as any);
  assert.equal(users.get('admin-uid')?.disabled, true);

  await assert.rejects(
    setAccountDisabled('admin-uid', 'owner-uid', true, 'Attempted restriction', db as any, auth as any),
    (error: unknown) => error instanceof AdminAccountError && (error.code === 'conflict' || error.code === 'forbidden')
  );
  assert.equal(users.get('owner-uid')?.disabled, false);
});
