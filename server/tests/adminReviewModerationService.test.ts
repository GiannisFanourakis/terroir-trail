import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  AdminReviewModerationError,
  listPendingReviewReports,
  moderateProducerReview,
} from '../services/adminReviewModerationService';

type Store = Record<string, Record<string, any>>;

const makeDb = (seed: Store) => {
  const store: Store = Object.fromEntries(
    Object.entries(seed).map(([name, docs]) => [
      name,
      Object.fromEntries(Object.entries(docs).map(([id, value]) => [id, { ...value }])),
    ])
  );
  const audits: any[] = [];

  const refFor = (collectionName: string, id: string) => ({ collectionName, id });
  const collection = (name: string) => {
    store[name] ||= {};
    return {
      doc: (id: string) => ({
        id,
        ref: refFor(name, id),
        get: async () => ({
          exists: Boolean(store[name][id]),
          data: () => store[name][id] ? { ...store[name][id] } : undefined,
        }),
        set: async (value: any, options?: { merge?: boolean }) => {
          store[name][id] = options?.merge
            ? { ...(store[name][id] || {}), ...value }
            : { ...value };
        },
      }),
      where: (field: string, op: string, expected: any) => {
        assert.equal(op, '==');
        return {
          get: async () => ({
            docs: Object.entries(store[name])
              .filter(([, value]) => value[field] === expected)
              .map(([id, value]) => ({
                id,
                ref: refFor(name, id),
                data: () => ({ ...value }),
              })),
          }),
        };
      },
      add: async (value: any) => {
        audits.push(value);
        return { id: `audit-${audits.length}` };
      },
    };
  };

  const batch = () => {
    const updates: Array<{ ref: any; value: any }> = [];
    return {
      update: (ref: any, value: any) => updates.push({ ref, value }),
      commit: async () => {
        for (const update of updates) {
          store[update.ref.collectionName][update.ref.id] = {
            ...store[update.ref.collectionName][update.ref.id],
            ...update.value,
          };
        }
      },
    };
  };

  return { db: { collection, batch }, store, audits };
};

const adminSeed = {
  admin_users: {
    admin: { userId: 'admin', status: 'active', level: 'admin' },
  },
  account_controls: {},
  producer_owners: {},
};

test('Admin review queue exposes public review content but not reporter or author UIDs', async () => {
  const { db } = makeDb({
    ...adminSeed,
    review_reports: {
      'report-1': {
        reviewId: 'review-1',
        producerId: 'producer-a',
        reporterUid: 'private-reporter',
        reason: 'privacy',
        status: 'pending',
        createdAt: '2026-09-16T09:00:00.000Z',
      },
    },
    producer_reviews: {
      'review-1': {
        producerId: 'producer-a',
        travelerUid: 'private-author',
        travelerName: 'Public Traveler',
        rating: 4,
        comment: 'Public review text',
        verifiedVisit: true,
        status: 'published',
      },
    },
  });

  const reports = await listPendingReviewReports('admin', db as any);
  assert.equal(reports.length, 1);
  assert.equal(reports[0].review.travelerName, 'Public Traveler');
  assert.equal(reports[0].reason, 'privacy');
  assert.equal((reports[0] as any).reporterUid, undefined);
  assert.equal((reports[0].review as any).travelerUid, undefined);
});

test('Admin can hide a reported review, resolve pending reports and create an audit event', async () => {
  const { db, store, audits } = makeDb({
    ...adminSeed,
    review_reports: {
      'report-1': {
        reviewId: 'review-1',
        producerId: 'producer-a',
        reporterUid: 'traveler-b',
        reason: 'abuse',
        status: 'pending',
      },
    },
    producer_reviews: {
      'review-1': {
        producerId: 'producer-a',
        travelerUid: 'traveler-a',
        travelerName: 'Traveler A',
        rating: 2,
        comment: 'Reported review',
        status: 'published',
      },
    },
    admin_audit: {},
  });

  const result = await moderateProducerReview(
    'admin',
    'review-1',
    'hide',
    'Contains personal information',
    db as any
  );

  assert.equal(result.status, 'hidden');
  assert.equal(store.producer_reviews['review-1'].status, 'hidden');
  assert.equal(store.review_reports['report-1'].status, 'resolved');
  assert.equal(store.review_reports['report-1'].resolution, 'review_hidden');
  assert.equal(audits[0].eventType, 'community_review_hidden');
  assert.equal(audits[0].reason, 'Contains personal information');
});

test('ordinary traveler cannot access trusted review moderation', async () => {
  const { db } = makeDb({
    admin_users: {},
    account_controls: {},
    producer_owners: {},
    review_reports: {},
  });

  await assert.rejects(
    listPendingReviewReports('traveler-a', db as any),
    (error: unknown) =>
      error instanceof AdminReviewModerationError && error.code === 'forbidden'
  );
});
