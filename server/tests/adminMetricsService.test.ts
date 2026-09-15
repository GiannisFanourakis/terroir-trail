import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AdminMetricsError, getAdminDashboardMetrics } from '../services/adminMetricsService';

const makeHarness = () => {
  const collections = new Map<string, Map<string, Record<string, any>>>();
  const getCollection = (name: string) => {
    if (!collections.has(name)) collections.set(name, new Map());
    return collections.get(name)!;
  };

  const db = {
    collection: (name: string) => ({
      doc: (id: string) => ({
        id,
        get: async () => {
          const data = getCollection(name).get(id);
          return { exists: Boolean(data), id, data: () => data };
        },
      }),
      where: (field: string, _operator: string, value: unknown) => ({
        get: async () => ({
          docs: [...getCollection(name).entries()]
            .filter(([, data]) => data[field] === value)
            .map(([id, data]) => ({ id, data: () => data })),
        }),
      }),
      get: async () => ({
        docs: [...getCollection(name).entries()].map(([id, data]) => ({ id, data: () => data })),
      }),
    }),
  };

  const users = [
    { uid: 'owner-uid', disabled: false, metadata: { creationTime: '2026-09-01T00:00:00Z' } },
    { uid: 'host-uid', disabled: false, metadata: { creationTime: '2026-08-01T00:00:00Z' } },
    { uid: 'new-user', disabled: false, metadata: { creationTime: '2026-09-10T00:00:00Z' } },
    { uid: 'disabled-user', disabled: true, metadata: { creationTime: '2026-07-01T00:00:00Z' } },
  ];
  const auth = {
    listUsers: async () => ({ users }),
  };

  return { db, auth, getCollection };
};

test('admin dashboard metrics report request, account, host and audit health without guessing', async () => {
  const { db, auth, getCollection } = makeHarness();
  getCollection('admin_users').set('owner-uid', {
    userId: 'owner-uid',
    level: 'owner',
    status: 'active',
  });
  getCollection('producer_owners').set('producer-a', {
    producerId: 'producer-a',
    ownerUid: 'host-uid',
    status: 'active',
  });
  getCollection('producer_registrations').set('pending-a', {
    status: 'pending_verification',
    submittedAt: '2026-09-12T12:00:00Z',
  });
  getCollection('producer_registrations').set('approved-a', {
    status: 'verified_active',
    submittedAt: '2026-09-10T12:00:00Z',
    approvedAt: '2026-09-11T12:00:00Z',
  });
  getCollection('producer_registrations').set('rejected-a', {
    status: 'rejected',
    submittedAt: '2026-09-13T00:00:00Z',
    rejectedAt: '2026-09-13T12:00:00Z',
  });
  getCollection('admin_audit').set('event-a', {
    eventType: 'producer_claim_approved',
    actorUid: 'owner-uid',
    producerId: 'approved-a',
    occurredAt: '2026-09-11T12:00:00Z',
  });

  const metrics = await getAdminDashboardMetrics(
    'owner-uid',
    db as any,
    auth as any,
    new Date('2026-09-15T12:00:00Z')
  );

  assert.equal(metrics.requests.pending, 1);
  assert.equal(metrics.requests.oldestPendingAgeDays, 3);
  assert.equal(metrics.requests.approved30d, 1);
  assert.equal(metrics.requests.rejected30d, 1);
  assert.equal(metrics.requests.averageReviewHours30d, 18);
  assert.equal(metrics.accounts.total, 4);
  assert.equal(metrics.accounts.new30d, 2);
  assert.equal(metrics.accounts.disabled, 1);
  assert.equal(metrics.accounts.activeProducerHosts, 1);
  assert.equal(metrics.accounts.activeAdmins, 1);
  assert.equal(metrics.audit.recent[0].eventType, 'producer_claim_approved');
});

test('non-admin accounts cannot read operational metrics', async () => {
  const { db, auth } = makeHarness();

  await assert.rejects(
    getAdminDashboardMetrics('traveler-uid', db as any, auth as any),
    (error: unknown) => error instanceof AdminMetricsError && error.code === 'forbidden'
  );
});
