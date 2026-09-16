import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { createApp } from '../app';
import { registerReviewRoutes } from '../reviewRoutes';

test('review API exposes public sanitized reads and authenticates all community mutations', async () => {
  const calls: Array<{ type: string; args: unknown[] }> = [];
  const review = {
    id: 'review-1',
    producerId: 'producer-a',
    travelerName: 'Traveler A',
    rating: 5,
    comment: 'Wonderful family visit.',
    verifiedVisit: false,
    createdAt: '2026-09-16T00:00:00.000Z',
    updatedAt: '2026-09-16T00:00:00.000Z',
    isOwnReview: false,
  };

  const app = createApp({
    verifyToken: async token => ({ uid: token }) as any,
  });
  registerReviewRoutes(app, {
    verifyToken: async token => {
      if (token === 'invalid') throw new Error('invalid token');
      return { uid: token } as any;
    },
    listProducerReviews: async (producerId, viewerUid) => {
      calls.push({ type: 'list', args: [producerId, viewerUid] });
      return [{ ...review, isOwnReview: viewerUid === 'traveler-a' }];
    },
    upsertTravelerReview: async (uid, producerId, rating, comment) => {
      calls.push({ type: 'save', args: [uid, producerId, rating, comment] });
      return { ...review, rating: Number(rating), comment: String(comment), isOwnReview: true };
    },
    deleteTravelerReview: async (uid, producerId) => {
      calls.push({ type: 'delete', args: [uid, producerId] });
      return { deleted: true as const, reviewId: 'review-1' };
    },
    upsertHostReviewReply: async (uid, reviewId, comment) => {
      calls.push({ type: 'reply', args: [uid, reviewId, comment] });
      return {
        ...review,
        id: reviewId,
        hostReply: {
          comment: String(comment),
          createdAt: 'now',
          updatedAt: 'now',
        },
      };
    },
    reportProducerReview: async (uid, reviewId, reason) => {
      calls.push({ type: 'report', args: [uid, reviewId, reason] });
      return { reported: true as const, reviewId };
    },
  });

  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const authHeaders = (token?: string): Record<string, string> =>
    token ? { Authorization: `Bearer ${token}` } : {};
  const jsonHeaders = (token?: string) => ({
    ...authHeaders(token),
    'Content-Type': 'application/json',
  });

  try {
    const publicList = await fetch(`${base}/api/producers/producer-a/reviews`);
    assert.equal(publicList.status, 200);
    assert.deepEqual(await publicList.json(), {
      reviews: [review],
    });

    const ownList = await fetch(`${base}/api/producers/producer-a/reviews`, {
      headers: authHeaders('traveler-a'),
    });
    assert.equal(ownList.status, 200);
    const ownPayload = await ownList.json() as any;
    assert.equal(ownPayload.reviews[0].isOwnReview, true);

    const invalidRead = await fetch(`${base}/api/producers/producer-a/reviews`, {
      headers: authHeaders('invalid'),
    });
    assert.equal(invalidRead.status, 401);

    const unsignedSave = await fetch(`${base}/api/producers/producer-a/reviews/me`, {
      method: 'PUT',
      headers: jsonHeaders(),
      body: JSON.stringify({ rating: 5, comment: 'Unsigned' }),
    });
    assert.equal(unsignedSave.status, 401);

    const saved = await fetch(`${base}/api/producers/producer-a/reviews/me`, {
      method: 'PUT',
      headers: jsonHeaders('traveler-a'),
      body: JSON.stringify({ rating: 4, comment: 'Useful independent visit notes.' }),
    });
    assert.equal(saved.status, 200);
    assert.equal(((await saved.json()) as any).review.isOwnReview, true);

    const replied = await fetch(`${base}/api/reviews/review-1/host-reply`, {
      method: 'PUT',
      headers: jsonHeaders('host-a'),
      body: JSON.stringify({ comment: 'Thank you for visiting.' }),
    });
    assert.equal(replied.status, 200);

    const reported = await fetch(`${base}/api/reviews/review-1/report`, {
      method: 'POST',
      headers: jsonHeaders('traveler-b'),
      body: JSON.stringify({ reason: 'privacy' }),
    });
    assert.equal(reported.status, 201);

    const deleted = await fetch(`${base}/api/producers/producer-a/reviews/me`, {
      method: 'DELETE',
      headers: authHeaders('traveler-a'),
    });
    assert.equal(deleted.status, 200);

    assert.deepEqual(calls, [
      { type: 'list', args: ['producer-a', undefined] },
      { type: 'list', args: ['producer-a', 'traveler-a'] },
      { type: 'save', args: ['traveler-a', 'producer-a', 4, 'Useful independent visit notes.'] },
      { type: 'reply', args: ['host-a', 'review-1', 'Thank you for visiting.'] },
      { type: 'report', args: ['traveler-b', 'review-1', 'privacy'] },
      { type: 'delete', args: ['traveler-a', 'producer-a'] },
    ]);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close(error => error ? reject(error) : resolve())
    );
  }
});
