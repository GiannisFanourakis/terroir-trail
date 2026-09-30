import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getTravelerFeatureAccess } from '../services/travelerFeatureAccess';

test('admin authority grants QA access without pass lookup', async () => {
  let passLookups = 0;
  const access = await getTravelerFeatureAccess('admin-1', {
    isActiveAdmin: (async () => true) as any,
    getExplorerPass: (async () => {
      passLookups += 1;
      return null;
    }) as any,
  });

  assert.equal(access.granted, true);
  assert.equal(access.source, 'admin_qa');
  assert.equal(access.pass, null);
  assert.equal(passLookups, 0);
});

test('paid traveler retains paid-pass access', async () => {
  const pass = {
    passId: 'pass-1',
    name: 'Explorer',
    plan: 'holiday' as const,
    expiresAt: '2099-01-01T00:00:00Z',
  };
  const access = await getTravelerFeatureAccess('traveler-1', {
    isActiveAdmin: (async () => false) as any,
    getExplorerPass: (async () => pass) as any,
  });

  assert.equal(access.granted, true);
  assert.equal(access.source, 'paid_pass');
  assert.deepEqual(access.pass, pass);
});

test('ordinary traveler remains gated without an active pass', async () => {
  const access = await getTravelerFeatureAccess('traveler-1', {
    isActiveAdmin: (async () => false) as any,
    getExplorerPass: (async () => null) as any,
  });

  assert.deepEqual(access, {
    granted: false,
    source: 'none',
    pass: null,
  });
});
