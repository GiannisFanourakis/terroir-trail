import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { createApp } from '../app';
import { registerAdminListingChangeRoutes } from '../adminListingChangeRoutes';
import { ProducerListingChangeError } from '../services/producerListingChangeService';

test('admin listing change API authenticates queue, approval and rejection', async () => {
  const calls: Array<{ type: string; args: unknown[] }> = [];
  const pending = {
    id: 'request-1',
    producerId: 'producer-a',
    producerName: 'Producer A',
    requesterUid: 'host',
    status: 'pending_review' as const,
    changes: { story: 'Updated family story' },
    submittedAt: '2026-09-16T05:30:00.000Z',
  };

  const app = createApp({ verifyToken: async token => ({ uid: token }) as any });
  registerAdminListingChangeRoutes(app, {
    verifyToken: async token => {
      if (token === 'invalid') throw new Error('invalid');
      return { uid: token } as any;
    },
    listPendingProducerListingChanges: async uid => {
      calls.push({ type: 'list', args: [uid] });
      if (uid === 'traveler') throw new ProducerListingChangeError('forbidden', 'Admin required.');
      return [pending];
    },
    reviewProducerListingChange: async (uid, requestId, decision, reason) => {
      calls.push({ type: decision, args: [uid, requestId, reason] });
      if (decision === 'reject' && !reason) throw new ProducerListingChangeError('bad_request', 'Reason required.');
      return {
        requestId,
        producerId: 'producer-a',
        status: decision === 'approve' ? 'approved' as const : 'rejected' as const,
        occurredAt: 'now',
      };
    },
  });

  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const headers = (token?: string): Record<string, string> => token ? { Authorization: `Bearer ${token}` } : {};
  const post = (path: string, token: string, body?: object) => fetch(base + path, {
    method: 'POST',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });

  try {
    assert.equal((await fetch(`${base}/api/admin/listing-changes`)).status, 401);
    assert.equal((await fetch(`${base}/api/admin/listing-changes`, { headers: headers('traveler') })).status, 403);

    const listed = await fetch(`${base}/api/admin/listing-changes`, { headers: headers('admin') });
    assert.equal(listed.status, 200);
    assert.deepEqual(await listed.json(), { requests: [pending] });

    const approved = await post('/api/admin/listing-changes/request-1/approve', 'admin');
    assert.equal(approved.status, 200);

    const badReject = await post('/api/admin/listing-changes/request-2/reject', 'admin');
    assert.equal(badReject.status, 400);

    const rejected = await post('/api/admin/listing-changes/request-2/reject', 'admin', { reason: 'Needs supporting detail.' });
    assert.equal(rejected.status, 200);

    assert.deepEqual(calls, [
      { type: 'list', args: ['traveler'] },
      { type: 'list', args: ['admin'] },
      { type: 'approve', args: ['admin', 'request-1', ''] },
      { type: 'reject', args: ['admin', 'request-2', ''] },
      { type: 'reject', args: ['admin', 'request-2', 'Needs supporting detail.'] },
    ]);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});