import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getTrustedAccountCapabilities,
  isActiveAdmin,
} from '../services/accountAuthorization';

const makeDb = (options?: {
  adminStatus?: 'active' | 'revoked';
  adminUserId?: string;
  ownerships?: Array<{ id: string; ownerUid: string; status: string; producerId?: string }>;
}) => ({
  collection: (name: string) => {
    if (name === 'admin_users') {
      return {
        doc: (uid: string) => ({
          get: async () => ({
            exists: Boolean(options?.adminStatus),
            data: () =>
              options?.adminStatus
                ? {
                    userId: options.adminUserId || uid,
                    status: options.adminStatus,
                  }
                : undefined,
          }),
        }),
      };
    }

    if (name === 'producer_owners') {
      return {
        where: (_field: string, _operator: string, uid: string) => ({
          get: async () => ({
            docs: (options?.ownerships || []).map((ownership) => ({
              id: ownership.id,
              data: () => ownership,
            })),
          }),
        }),
      };
    }

    throw new Error(`Unexpected collection: ${name}`);
  },
});

test('traveler has no privileged capabilities without trusted authority records', async () => {
  const capabilities = await getTrustedAccountCapabilities('traveler-uid', makeDb() as any);

  assert.deepEqual(capabilities.roles, ['traveler']);
  assert.equal(capabilities.primaryRole, 'traveler');
  assert.equal(capabilities.isAdmin, false);
  assert.deepEqual(capabilities.producerIds, []);
  assert.equal(capabilities.canManageOwnedListings, false);
  assert.equal(capabilities.canReviewProducerClaims, false);
  assert.equal(capabilities.canAssignProducerOwnership, false);
  assert.equal(capabilities.canModerateProducerContent, false);
});

test('active producer ownership grants only owned-listing host capability', async () => {
  const db = makeDb({
    ownerships: [
      { id: 'producer-a', ownerUid: 'host-uid', status: 'active', producerId: 'producer-a' },
      { id: 'producer-b', ownerUid: 'host-uid', status: 'inactive', producerId: 'producer-b' },
      { id: 'producer-c', ownerUid: 'another-user', status: 'active', producerId: 'producer-c' },
    ],
  });

  const capabilities = await getTrustedAccountCapabilities('host-uid', db as any);

  assert.deepEqual(capabilities.roles, ['traveler', 'producer_host']);
  assert.equal(capabilities.primaryRole, 'producer_host');
  assert.deepEqual(capabilities.producerIds, ['producer-a']);
  assert.equal(capabilities.canManageOwnedListings, true);
  assert.equal(capabilities.isAdmin, false);
  assert.equal(capabilities.canReviewProducerClaims, false);
});

test('active admin record grants admin capabilities independently of host ownership', async () => {
  const db = makeDb({
    adminStatus: 'active',
    adminUserId: 'admin-uid',
  });

  const capabilities = await getTrustedAccountCapabilities('admin-uid', db as any);

  assert.deepEqual(capabilities.roles, ['traveler', 'admin']);
  assert.equal(capabilities.primaryRole, 'admin');
  assert.equal(capabilities.isAdmin, true);
  assert.equal(capabilities.canReviewProducerClaims, true);
  assert.equal(capabilities.canAssignProducerOwnership, true);
  assert.equal(capabilities.canModerateProducerContent, true);
  assert.equal(capabilities.canManageOwnedListings, false);
  assert.equal(await isActiveAdmin('admin-uid', db as any), true);
});

test('revoked or mismatched admin record cannot grant admin authority', async () => {
  const revoked = makeDb({ adminStatus: 'revoked', adminUserId: 'admin-uid' });
  const mismatched = makeDb({ adminStatus: 'active', adminUserId: 'someone-else' });

  assert.equal(await isActiveAdmin('admin-uid', revoked as any), false);
  assert.equal(await isActiveAdmin('admin-uid', mismatched as any), false);
});

test('authority lookup fails closed when the trusted store is unavailable', async () => {
  const failingDb = {
    collection: (name: string) => {
      if (name === 'admin_users') {
        return {
          doc: () => ({ get: async () => { throw new Error('firestore unavailable'); } }),
        };
      }
      return {
        where: () => ({ get: async () => ({ docs: [] }) }),
      };
    },
  };

  await assert.rejects(
    getTrustedAccountCapabilities('user-uid', failingDb as any),
    /firestore unavailable/
  );
});
