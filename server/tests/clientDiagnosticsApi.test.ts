import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { createApp } from '../app';

test('client diagnostics accepts sanitized anonymous build telemetry without auth', async () => {
  const originalError = console.error;
  const logged: unknown[][] = [];
  console.error = (...args: unknown[]) => {
    logged.push(args);
  };

  const server = createApp().listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  try {
    const response = await fetch(`${base}/api/client-errors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scope: 'Window',
        event: 'unhandled_error',
        buildId: 'abc123-456',
        path: '/producers/example',
        deviceClass: 'tablet',
        standalone: true,
        online: true,
        error: {
          name: 'Error',
          message: 'Failed for traveler@example.com Bearer abc.def.ghi',
        },
        metadata: {
          email: 'traveler@example.com',
          component: 'ProducerDrawer',
        },
      }),
    });

    assert.equal(response.status, 202);
    assert.deepEqual(await response.json(), { accepted: true });
    const output = JSON.stringify(logged);
    assert.match(output, /ClientDiagnostics/);
    assert.match(output, /abc123-456/);
    assert.doesNotMatch(output, /traveler@example\.com/);
    assert.doesNotMatch(output, /Bearer abc\.def\.ghi/);
    assert.match(output, /\[REDACTED_EMAIL\]/);
  } finally {
    console.error = originalError;
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))
    );
  }
});
