import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { createApp } from '../app';
import { registerAdminReviewRoutes } from '../adminReviewRoutes';
import { AdminReviewModerationError } from '../services/adminReviewModerationService';

test('Admin review moderation API authenticates queue and resolution actions', async () => {
  const calls: Array<{ type: string; args: unknown[] }> = [];
  const report = {
    reportId: 'report-1',
    reviewId: 'review-1',
    producerId: 'producer-a',
    reason: 'privacy',
    reportedAt: '2026-09-16T09:00:00.000Z',
    review: {
      travelerName: 'Traveler A',
      rating: 4,
      comment: 'Reported review text',
      verifiedVisit: true,
      status: 'published' as const,
    },
  };

  const app = createApp({
    verifyToken: async token => ({ uid: token }) as any,
  });
  registerAdminReviewRoutes(app, {
    verifyToken: async token => {
      if (token === 'invalid') throw new Error('invalid token');
      return { uid: token } as any;
    },
    listPendingReviewReports: async uid => {
      calls.push({ type: 'list', args: [uid] });
      if (uid === 'traveler') {
        throw new AdminReviewModerationError('forbidden', 'Admin authority is required.');
      }
      return [report];
    },
    moderateProducerReview: async (uid, reviewId, action, reason) => {
      const typedReviewId = String(reviewId);
      calls.push({ type: 'moderate', args: [uid, typedReviewId, action, reason] });
      return {
        reviewId: typedReviewId,
        producerId: 'producer-a',
        status: action === 'hide' ? 'hidden' as const : 'published' as const,
        occurredAt: 'now',
      };
    },
    dismissReviewReport: async (uid, reportId, reason) => {
      const typedReportId = String(reportId);
      calls.push({ type: 'dismiss', args: [uid, typedReportId, reason] });
      return { reportId: typedReportId, status: 'resolved' as const, occurredAt: 'now' };
    },
  });

  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const headers = (token?: string): Record<string, string> => token
    ? { Authorization: `Bearer ${token}` }
    : {};
  const post = (path: string, token: string, body: object) => fetch(base + path, {
    method: 'POST',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  try {
    assert.equal((await fetch(`${base}/api/admin/review-reports`)).status, 401);
    assert.equal((await fetch(`${base}/api/admin/review-reports`, { headers: headers('invalid') })).status, 401);
    assert.equal((await fetch(`${base}/api/admin/review-reports`, { headers: headers('traveler') })).status, 403);

    const listed = await fetch(`${base}/api/admin/review-reports`, { headers: headers('admin') });
    assert.equal(listed.status, 200);
    assert.deepEqual(await listed.json(), { reports: [report] });

    const hidden = await post('/api/admin/reviews/review-1/moderation', 'admin', {
      action: 'hide',
      reason: 'Contains private information',
    });
    assert.equal(hidden.status, 200);
    assert.deepEqual(await hidden.json(), {
      review: {
        reviewId: 'review-1',
        producerId: 'producer-a',
        status: 'hidden',
        occurredAt: 'now',
      },
    });

    const dismissed = await post('/api/admin/review-reports/report-1/dismiss', 'admin', {
      reason: 'Report does not breach policy',
    });
    assert.equal(dismissed.status, 200);
    assert.deepEqual(await dismissed.json(), {
      report: { reportId: 'report-1', status: 'resolved', occurredAt: 'now' },
    });

    assert.deepEqual(calls, [
      { type: 'list', args: ['traveler'] },
      { type: 'list', args: ['admin'] },
      { type: 'moderate', args: ['admin', 'review-1', 'hide', 'Contains private information'] },
      { type: 'dismiss', args: ['admin', 'report-1', 'Report does not breach policy'] },
    ]);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close(error => error ? reject(error) : resolve())
    );
  }
});
