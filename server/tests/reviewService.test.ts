import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  listProducerReviews,
  ProducerReviewError,
  upsertHostReviewReply,
  upsertTravelerReview,
} from '../services/reviewService';

type Stored = Record<string, Record<string, any>>;

const makeDb = (seed: Stored = {}) => {
  const store: Stored = Object.fromEntries(
    Object.entries(seed).map(([collection, docs]) => [
      collection,
      Object.fromEntries(Object.entries(docs).map(([id, value]) => [id, { ...value }])),
    ])
  );

  const collection = (name: string) => {
    store[name] ||= {};
    return {
      doc: (id: string) => ({
        id,
        get: async () => ({
          exists: Boolean(store[name][id]),
          data: () => store[name][id] ? { ...store[name][id] } : undefined,
        }),
        set: async (value: any, options?: { merge?: boolean }) => {
          store[name][id] = options?.merge
            ? { ...(store[name][id] || {}), ...value }
            : { ...value };
        },
        delete: async () => {
          delete store[name][id];
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
                data: () => ({ ...value }),
              })),
          }),
        };
      },
    };
  };

  return { db: { collection }, store };
};

const authClient = (uid: string, displayName = 'Traveler One') => ({
  getUser: async (requestedUid: string) => {
    assert.equal(requestedUid, uid);
    return {
      uid,
      displayName,
      email: `${uid}@example.com`,
    };
  },
});

test('traveler review derives identity and verified visit without exposing account IDs publicly', async () => {
  const { db, store } = makeDb({
    users: {
      'traveler-a': { name: 'Maria Traveler' },
    },
    bookings: {
      'booking-1': { userId: 'traveler-a', producerId: 'producer-a', status: 'completed' },
    },
  });

  const saved = await upsertTravelerReview(
    'traveler-a',
    'producer-a',
    5,
    'A warm family visit with excellent local products.',
    db as any,
    authClient('traveler-a') as any
  );

  assert.equal(saved.travelerName, 'Maria Traveler');
  assert.equal(saved.verifiedVisit, true);
  assert.equal(saved.rating, 5);
  assert.equal(saved.isOwnReview, true);
  assert.equal((saved as any).travelerUid, undefined);

  const stored = Object.values(store.producer_reviews)[0];
  assert.equal(stored.travelerUid, 'traveler-a');
  assert.equal(stored.verifiedVisit, true);

  const publicList = await listProducerReviews('producer-a', undefined, db as any);
  assert.equal(publicList.length, 1);
  assert.equal(publicList[0].isOwnReview, false);
  assert.equal((publicList[0] as any).travelerUid, undefined);
});

test('verified Host cannot rate a producer listing they manage', async () => {
  const { db } = makeDb({
    producer_owners: {
      'producer-a': { producerId: 'producer-a', ownerUid: 'host-a', status: 'active' },
    },
  });

  await assert.rejects(
    upsertTravelerReview(
      'host-a',
      'producer-a',
      5,
      'Self-rating attempt',
      db as any,
      authClient('host-a', 'Host A') as any
    ),
    (error: unknown) =>
      error instanceof ProducerReviewError &&
      error.code === 'forbidden' &&
      /cannot rate/.test(error.message)
  );
});

test('verified unfrozen Host may reply only to reviews on an owned listing', async () => {
  const { db, store } = makeDb({
    producer_owners: {
      'producer-a': { producerId: 'producer-a', ownerUid: 'host-a', status: 'active' },
    },
    producer_reviews: {
      'review-a': {
        producerId: 'producer-a',
        travelerUid: 'traveler-a',
        travelerName: 'Traveler A',
        rating: 4,
        comment: 'Lovely visit.',
        verifiedVisit: false,
        status: 'published',
        createdAt: '2026-09-16T00:00:00.000Z',
        updatedAt: '2026-09-16T00:00:00.000Z',
      },
      'review-b': {
        producerId: 'producer-b',
        travelerUid: 'traveler-b',
        travelerName: 'Traveler B',
        rating: 3,
        comment: 'Useful notes.',
        verifiedVisit: false,
        status: 'published',
        createdAt: '2026-09-16T00:00:00.000Z',
        updatedAt: '2026-09-16T00:00:00.000Z',
      },
    },
  });

  const replied = await upsertHostReviewReply(
    'host-a',
    'review-a',
    'Thank you for visiting our family estate.',
    db as any
  );
  assert.equal(replied.hostReply?.comment, 'Thank you for visiting our family estate.');
  assert.equal((replied.hostReply as any)?.hostUid, undefined);
  assert.equal(store.producer_reviews['review-a'].hostReply.hostUid, 'host-a');

  await assert.rejects(
    upsertHostReviewReply('host-a', 'review-b', 'Foreign listing reply', db as any),
    (error: unknown) => error instanceof ProducerReviewError && error.code === 'forbidden'
  );
});

test('dispute-frozen Host cannot publish or edit an official review reply', async () => {
  const { db } = makeDb({
    producer_owners: {
      'producer-a': { producerId: 'producer-a', ownerUid: 'host-a', status: 'active' },
    },
    account_controls: {
      'host-a': { hostEditingFrozen: true },
    },
    producer_reviews: {
      'review-a': {
        producerId: 'producer-a',
        travelerUid: 'traveler-a',
        travelerName: 'Traveler A',
        rating: 4,
        comment: 'Lovely visit.',
        verifiedVisit: false,
        status: 'published',
        createdAt: '2026-09-16T00:00:00.000Z',
        updatedAt: '2026-09-16T00:00:00.000Z',
      },
    },
  });

  await assert.rejects(
    upsertHostReviewReply('host-a', 'review-a', 'Reply while frozen', db as any),
    (error: unknown) =>
      error instanceof ProducerReviewError &&
      error.code === 'forbidden' &&
      /temporarily unavailable/.test(error.message)
  );
});
