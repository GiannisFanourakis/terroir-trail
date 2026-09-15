import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { createApp } from '../app';
import { AdminMetricsError } from '../services/adminMetricsService';

test('admin metrics endpoint authenticates the actor and maps admin authorization safely', async () => {
  const metrics = {
    generatedAt: '2026-09-15T12:00:00Z',
    requests: {
      pending: 1,
      oldestPendingAt: '2026-09-12T12:00:00Z',
      oldestPendingAgeDays: 3,
      approved30d: 2,
      rejected30d: 1,
      averageReviewHours30d: 18,
    },
    accounts: {
      total: 10,
      new30d: 3,
      disabled: 0,
      activeProducerHosts: 2,
      activeAdmins: 1,
    },
    audit: { recent: [] },
  };

  const server = createApp({
    verifyToken: async token => {
      if (token === 'invalid') throw new Error('invalid token');
      return { uid: token } as any;
    },
    getAdminDashboardMetrics: async uid => {
      if (uid === 'traveler') {
        throw new AdminMetricsError('forbidden', 'Admin authority is required to view operational metrics.');
      }
      return metrics;
    },
  }).listen(0, '127.0.0.1');

  await new Promise<void>(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const headers = (token?: string): Record<string, string> => token ? { Authorization: `Bearer ${token}` } : {};

  try {
    assert.equal((await fetch(`${base}/api/admin/metrics`)).status, 401);
    assert.equal((await fetch(`${base}/api/admin/metrics`, { headers: headers('invalid') })).status, 401);
    assert.equal((await fetch(`${base}/api/admin/metrics`, { headers: headers('traveler') })).status, 403);

    const response = await fetch(`${base}/api/admin/metrics`, { headers: headers('admin') });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { metrics });
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close(error => error ? reject(error) : resolve())
    );
  }
});
