import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getTrustedAccountCapabilities,
  isActiveAdmin,
  isPlatformOwner,
} from '../services/accountAuthorization';

const makeDb = (options?: {
  adminStatus?: 'active' | 'revoked';
  adminLevel?: 'owner' | 'admin';
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
                    level: options.adminLevel,
                  }
                : undefined,
          }),
        }),
      };
    }

    if (name === 'producer_owners') {
      return {
        where: (_field: string, _operator: string, _uid: string) => ({
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
  assert.equal(capabilities.adminLevel, null);
  assert.equal(capabilities.isPlatformOwner, false);
  assert.deepEqual(capabilities.producerIds, []);
  assert.equal(capabilities.canManageOwnedListings, false);
  assert.equal(capabilities.canReviewProducerClaims, false);
  assert.equal(capabilities.canAssignProducerOwnership, false);
  assert.equal(capabilities.canModerateProducerContent, false);
  assert.equal(capabilities.canManageUserAccounts, false);
  assert.equal(capabilities.canManageAdmins, false);
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
  assert.equal(capabilities.canManageAdmins, false);
});

test('ordinary admin gets admin capabilities but cannot create or revoke admins', async () => {
  const db = makeDb({
    adminStatus: 'active',
    adminLevel: 'admin',
    adminUserId: 'admin-uid',
  });

  const capabilities = await getTrustedAccountCapabilities('admin-uid', db as any);

  assert.deepEqual(capabilities.roles, ['traveler', 'admin']);
  assert.equal(capabilities.primaryRole, 'admin');
  assert.equal(capabilities.isAdmin, true);
  assert.equal(capabilities.adminLevel, 'admin');
  assert.equal(capabilities.isPlatformOwner, false);
  assert.equal(capabilities.canReviewProducerClaims, true);
  assert.equal(capabilities.canAssignProducerOwnership, true);
  assert.equal(capabilities.canModerateProducerContent, true);
  assert.equal(capabilities.canManageUserAccounts, true);
  assert.equal(capabilities.canManageAdmins, false);
  assert.equal(await isActiveAdmin('admin-uid', db as any), true);
  assert.equal(await isPlatformOwner('admin-uid', db as any), false);
});

test('platform owner is an admin and is the only account allowed to manage admins', async () => {
  const db = makeDb({
    adminStatus: 'active',
    adminLevel: 'owner',
    adminUserId: 'owner-uid',
  });

  const capabilities = await getTrustedAccountCapabilities('owner-uid', db as any);

  assert.deepEqual(capabilities.roles, ['traveler', 'admin']);
  assert.equal(capabilities.primaryRole, 'admin');
  assert.equal(capabilities.isAdmin, true);
  assert.equal(capabilities.adminLevel, 'owner');
  assert.equal(capabilities.isPlatformOwner, true);
  assert.equal(capabilities.canManageAdmins, true);
  assert.equal(await isPlatformOwner('owner-uid', db as any), true);
});

test('revoked, mismatched or malformed admin record cannot grant admin authority', async () => {
  const revoked = makeDb({ adminStatus: 'revoked', adminLevel: 'admin', adminUserId: 'admin-uid' });
  const mismatched = makeDb({ adminStatus: 'active', adminLevel: 'admin', adminUserId: 'someone-else' });
  const missingLevel = makeDb({ adminStatus: 'active', adminUserId: 'admin-uid' });

  assert.equal(await isActiveAdmin('admin-uid', revoked as any), false);
  assert.equal(await isActiveAdmin('admin-uid', mismatched as any), false);
  assert.equal(await isActiveAdmin('admin-uid', missingLevel as any), false);
});

test('authority lookup fails closed when the trusted store is unavailable', async () => {
  const failingDb = {
    collection: (name: string) => {
      if (name === 'admin_users') {
        return {
          doc: () => ({ get: async () => { throw new Error('firestore unavailable'); } }),
        };
      }
      if (name === 'producer_owners') {
        return {
          where: () => ({ get: async () => ({ docs: [] }) }),
        };
      }
      throw new Error(`Unexpected collection: ${name}`);
    },
  };

  await assert.rejects(
    getTrustedAccountCapabilities('user-uid', failingDb as any),
    /firestore unavailable/
  );
});
