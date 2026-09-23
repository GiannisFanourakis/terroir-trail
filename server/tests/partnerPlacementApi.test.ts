import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { createApp } from '../app';
import { registerCommercialPartnerRoutes } from '../commercialPartnerRoutes';

test('public Partner placement endpoint requires no login and returns only public campaign fields', async () => {
  const app = createApp();
  registerCommercialPartnerRoutes(app, {
    getActivePartnerPlacements: async input => {
      assert.equal(input.placement, 'region_discovery');
      assert.equal(input.destination, 'crete');
      return [{
        campaignId: '11111111-1111-4111-8111-111111111111',
        producerId: 'producer-1',
        campaignType: 'regional_featured',
        placement: 'region_discovery',
        destination: 'crete',
        category: 'winery',
        headline: 'Harvest visits',
        message: null,
        startsAt: null,
        endsAt: null,
      }];
    },
  });

  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const base = 'http://127.0.0.1:' + (server.address() as AddressInfo).port;

  try {
    const response = await fetch(
      base + '/api/commercial/placements?placement=region_discovery&destination=crete'
    );
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const body = await response.json() as any;
    assert.equal(body.placements.length, 1);
    assert.equal(body.placements[0].campaignId, '11111111-1111-4111-8111-111111111111');
    assert.equal('created_by_uid' in body.placements[0], false);
    assert.equal('provider_subscription_id' in body.placements[0], false);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close(error => error ? reject(error) : resolve())
    );
  }
});
