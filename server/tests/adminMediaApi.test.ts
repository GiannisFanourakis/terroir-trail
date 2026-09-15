import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { createApp } from '../app';
import { registerAdminMediaRoutes } from '../adminMediaRoutes';
import { AdminMediaError } from '../services/adminMediaService';

test('admin media API authenticates list, approve and reject flows', async () => {
  const calls: Array<{ type: string; args: unknown[] }> = [];
  const pendingMedia = {
    producerId: 'producer-a',
    producerName: 'Producer A',
    imageId: 'image-1',
    url: 'https://example.com/image.jpg',
    type: 'cover' as const,
    uploadedAt: '2026-09-15T18:30:00.000Z',
    rightsConfirmed: true,
  };

  const app = createApp({
    verifyToken: async token => ({ uid: token }) as any,
  });
  registerAdminMediaRoutes(app, {
    verifyToken: async token => {
      if (token === 'invalid') throw new Error('invalid token');
      return { uid: token } as any;
    },
    listPendingProducerMedia: async uid => {
      calls.push({ type: 'list', args: [uid] });
      if (uid === 'traveler') {
        throw new AdminMediaError('forbidden', 'Admin authority is required to review producer photos.');
      }
      return [pendingMedia];
    },
    moderateProducerMedia: async (uid, producerId, imageId, decision, reason) => {
      calls.push({ type: decision, args: [uid, producerId, imageId, reason] });
      if (decision === 'reject' && !reason) {
        throw new AdminMediaError('bad_request', 'Provide a rejection reason between 3 and 500 characters.');
      }
      return {
        producerId,
        imageId,
        status: decision === 'approve' ? 'approved' as const : 'rejected' as const,
        occurredAt: 'now',
      };
    },
  });

  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const headers = (token?: string): Record<string, string> =>
    token ? { Authorization: `Bearer ${token}` } : {};
  const post = (path: string, token: string, body?: object) => fetch(base + path, {
    method: 'POST',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });

  try {
    assert.equal((await fetch(`${base}/api/admin/media`)).status, 401);
    assert.equal((await fetch(`${base}/api/admin/media`, { headers: headers('invalid') })).status, 401);

    const denied = await fetch(`${base}/api/admin/media`, { headers: headers('traveler') });
    assert.equal(denied.status, 403);

    const listed = await fetch(`${base}/api/admin/media`, { headers: headers('admin') });
    assert.equal(listed.status, 200);
    assert.deepEqual(await listed.json(), { media: [pendingMedia] });

    const approved = await post('/api/admin/media/producer-a/image-1/approve', 'admin');
    assert.equal(approved.status, 200);
    assert.deepEqual(await approved.json(), {
      media: { producerId: 'producer-a', imageId: 'image-1', status: 'approved', occurredAt: 'now' },
    });

    const badReject = await post('/api/admin/media/producer-a/image-2/reject', 'admin');
    assert.equal(badReject.status, 400);

    const rejected = await post(
      '/api/admin/media/producer-a/image-2/reject',
      'admin',
      { reason: 'The image is unrelated to the listing.' }
    );
    assert.equal(rejected.status, 200);

    assert.deepEqual(calls, [
      { type: 'list', args: ['traveler'] },
      { type: 'list', args: ['admin'] },
      { type: 'approve', args: ['admin', 'producer-a', 'image-1', ''] },
      { type: 'reject', args: ['admin', 'producer-a', 'image-2', ''] },
      { type: 'reject', args: ['admin', 'producer-a', 'image-2', 'The image is unrelated to the listing.'] },
    ]);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close(error => error ? reject(error) : resolve())
    );
  }
});
