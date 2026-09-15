import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  AdminAuthorityError,
  changeAdminAuthority,
} from '../services/adminAuthorityService';

const makeHarness = () => {
  const collections = new Map<string, Map<string, Record<string, any>>>();
  let generated = 0;
  const getCollection = (name: string) => {
    if (!collections.has(name)) collections.set(name, new Map());
    return collections.get(name)!;
  };

  const db = {
    collection: (name: string) => ({
      doc: (id?: string) => {
        const actualId = id || `generated-${++generated}`;
        return {
          id: actualId,
          collectionName: name,
          get: async () => {
            const data = getCollection(name).get(actualId);
            return { exists: Boolean(data), data: () => data };
          },
        };
      },
      where: (field: string, _operator: string, value: string) => ({
        get: async () => ({
          docs: [...getCollection(name).entries()]
            .filter(([, data]) => data[field] === value)
            .map(([id, data]) => ({ id, data: () => data })),
        }),
      }),
    }),
    batch: () => {
      const writes: Array<{ ref: any; data: Record<string, any>; merge?: boolean }> = [];
      return {
        set: (ref: any, data: Record<string, any>, options?: { merge?: boolean }) => {
          writes.push({ ref, data, merge: options?.merge });
        },
        commit: async () => {
          for (const write of writes) {
            const col = getCollection(write.ref.collectionName);
            const previous = col.get(write.ref.id) || {};
            col.set(write.ref.id, write.merge ? { ...previous, ...write.data } : { ...write.data });
          }
        },
      };
    },
  };

  const users = new Map([
    ['owner@example.com', { uid: 'owner-uid', email: 'owner@example.com' }],
    ['admin@example.com', { uid: 'admin-uid', email: 'admin@example.com' }],
    ['other@example.com', { uid: 'other-uid', email: 'other@example.com' }],
  ]);
  const auth = {
    getUser: async (uid: string) => {
      const user = [...users.values()].find((candidate) => candidate.uid === uid);
      if (!user) throw new Error('not found');
      return user;
    },
    getUserByEmail: async (email: string) => {
      const user = users.get(email);
      if (!user) throw new Error('not found');
      return user;
    },
  };

  return { db, auth, getCollection };
};

test('platform owner can grant and revoke ordinary admin authority with audit events', async () => {
  const { db, auth, getCollection } = makeHarness();
  getCollection('admin_users').set('owner-uid', {
    userId: 'owner-uid',
    level: 'owner',
    status: 'active',
  });

  const granted = await changeAdminAuthority(
    'owner-uid',
    'grant',
    { email: 'admin@example.com' },
    db as any,
    auth as any
  );

  assert.equal(granted.targetUid, 'admin-uid');
  assert.equal(granted.status, 'active');
  const grantedRecord = getCollection('admin_users').get('admin-uid');
  assert.equal(grantedRecord?.userId, 'admin-uid');
  assert.equal(grantedRecord?.level, 'admin');
  assert.equal(grantedRecord?.status, 'active');
  assert.equal(grantedRecord?.grantedBy, 'owner-uid');
  assert.equal(getCollection('admin_audit').size, 1);

  const revoked = await changeAdminAuthority(
    'owner-uid',
    'revoke',
    { userId: 'admin-uid' },
    db as any,
    auth as any
  );
  assert.equal(revoked.status, 'revoked');
  assert.equal(getCollection('admin_users').get('admin-uid')?.status, 'revoked');
  assert.equal(getCollection('admin_audit').size, 2);
});

test('ordinary admin cannot grant another admin', async () => {
  const { db, auth, getCollection } = makeHarness();
  getCollection('admin_users').set('admin-uid', {
    userId: 'admin-uid',
    level: 'admin',
    status: 'active',
  });

  await assert.rejects(
    changeAdminAuthority(
      'admin-uid',
      'grant',
      { email: 'other@example.com' },
      db as any,
      auth as any
    ),
    (error: unknown) =>
      error instanceof AdminAuthorityError && error.code === 'forbidden'
  );
  assert.equal(getCollection('admin_users').has('other-uid'), false);
});

test('platform owner cannot revoke or replace their own owner authority from the admin flow', async () => {
  const { db, auth, getCollection } = makeHarness();
  getCollection('admin_users').set('owner-uid', {
    userId: 'owner-uid',
    level: 'owner',
    status: 'active',
  });

  await assert.rejects(
    changeAdminAuthority(
      'owner-uid',
      'revoke',
      { userId: 'owner-uid' },
      db as any,
      auth as any
    ),
    (error: unknown) =>
      error instanceof AdminAuthorityError && error.code === 'conflict'
  );
});
