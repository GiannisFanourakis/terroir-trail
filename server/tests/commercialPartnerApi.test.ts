import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { createApp } from '../app';
import { registerCommercialPartnerRoutes } from '../commercialPartnerRoutes';
import { CommercialPartnerError } from '../services/commercialPartnerService';

test('commercial Partner API separates Host read access from Admin mutation routes', async () => {
  const calls: Array<{ type: string; args: unknown[] }> = [];
  const emptyState = {
    producerIds: ['producer-1'],
    partners: [],
    subscriptions: [],
    campaigns: [],
    placements: [],
    campaignResults: [],
  };
  const adminState = {
    partners: [],
    subscriptions: [],
    campaigns: [],
    placements: [],
    audit: [],
  };

  const app = createApp({ verifyToken: async token => ({ uid: token }) as any });
  registerCommercialPartnerRoutes(app, {
    verifyToken: async token => {
      if (token === 'invalid') throw new Error('invalid');
      return { uid: token, email: `${token}@example.com` } as any;
    },
    getOwnedCommercialState: async uid => {
      calls.push({ type: 'host-read', args: [uid] });
      if (uid !== 'host') throw new CommercialPartnerError('forbidden', 'Host required.');
      return emptyState as any;
    },
    getAdminCommercialState: async uid => {
      calls.push({ type: 'admin-read', args: [uid] });
      if (uid !== 'admin') throw new CommercialPartnerError('forbidden', 'Admin required.');
      return adminState as any;
    },
    setCommercialPartnerStatus: async (uid, producerId, input) => {
      calls.push({ type: 'partner-status', args: [uid, producerId, input] });
      if (uid !== 'admin') throw new CommercialPartnerError('forbidden', 'Admin required.');
      if (input.status !== 'active') throw new CommercialPartnerError('bad_request', 'Invalid status.');
      return {
        producer_id: producerId,
        status: 'active',
        activation_source: 'admin_pilot',
        created_by_uid: uid,
        updated_by_uid: uid,
        activated_at: '2026-09-23T06:00:00Z',
        ended_at: null,
        created_at: '2026-09-23T06:00:00Z',
        updated_at: '2026-09-23T06:00:00Z',
      };
    },
    createCommercialPartnerCampaign: async (uid, input) => {
      calls.push({ type: 'campaign-create', args: [uid, input] });
      if (uid !== 'admin') throw new CommercialPartnerError('forbidden', 'Admin required.');
      return {
        campaign: {
          id: '78e94884-f021-4d06-ae92-1c593c7fe45f',
          producer_id: input.producerId,
          campaign_type: 'regional_featured',
          status: 'draft',
          destination: 'crete',
          category: 'winery',
          headline: input.headline,
          message: null,
          starts_at: null,
          ends_at: null,
          created_by_uid: uid,
          reviewed_by_uid: null,
          review_note: null,
          approved_at: null,
          paused_at: null,
          completed_at: null,
          created_at: '2026-09-23T06:00:00Z',
          updated_at: '2026-09-23T06:00:00Z',
        },
        placements: ['region_discovery'],
      };
    },
    updateCommercialPartnerCampaign: async (uid, campaignId, input) => {
      calls.push({ type: 'campaign-update', args: [uid, campaignId, input] });
      if (uid !== 'admin') throw new CommercialPartnerError('forbidden', 'Admin required.');
      return {
        campaign: {
          id: campaignId,
          producer_id: 'producer-1',
          campaign_type: 'regional_featured',
          status: 'draft',
          destination: 'crete',
          category: 'winery',
          headline: input.headline,
          message: input.message || null,
          starts_at: input.startsAt || null,
          ends_at: input.endsAt || null,
          created_by_uid: uid,
          reviewed_by_uid: null,
          review_note: null,
          approved_at: null,
          paused_at: null,
          completed_at: null,
          created_at: '2026-09-23T06:00:00Z',
          updated_at: '2026-09-23T06:01:00Z',
        },
        placements: input.placements as any,
      };
    },
    getPartnerBillingAvailability: () => ({
      checkoutEnabled: false,
      portalEnabled: false,
      planCode: 'partner_annual_v1' as const,
    }),
    createPartnerCheckout: async (uid, email, producerId) => {
      calls.push({ type: 'partner-checkout', args: [uid, email, producerId] });
      if (uid !== 'host') throw new CommercialPartnerError('forbidden', 'Host required.');
      return { url: 'https://checkout.stripe.com/test_partner' };
    },
    createPartnerBillingPortal: async (uid, producerId) => {
      calls.push({ type: 'partner-portal', args: [uid, producerId] });
      if (uid !== 'host') throw new CommercialPartnerError('forbidden', 'Host required.');
      return { url: 'https://billing.stripe.com/test_partner' };
    },
    transitionCommercialPartnerCampaign: async (uid, campaignId, input) => {
      calls.push({ type: 'campaign-status', args: [uid, campaignId, input] });
      if (uid !== 'admin') throw new CommercialPartnerError('forbidden', 'Admin required.');
      return {
        campaign: {
          id: campaignId,
          producer_id: 'producer-1',
          campaign_type: 'regional_featured',
          status: input.status as any,
          destination: 'crete',
          category: 'winery',
          headline: 'Harvest visits',
          message: null,
          starts_at: null,
          ends_at: null,
          created_by_uid: uid,
          reviewed_by_uid: uid,
          review_note: null,
          approved_at: null,
          paused_at: null,
          completed_at: null,
          created_at: '2026-09-23T06:00:00Z',
          updated_at: '2026-09-23T06:01:00Z',
        },
        placements: ['region_discovery'],
      };
    },
  });

  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const headers = (token?: string): Record<string, string> =>
    token ? { Authorization: `Bearer ${token}` } : {};
  const post = (path: string, token: string, body: object) => fetch(base + path, {
    method: 'POST',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  try {
    assert.equal((await fetch(`${base}/api/producer/commercial`)).status, 401);

    const host = await fetch(`${base}/api/producer/commercial`, { headers: headers('host') });
    assert.equal(host.status, 200);
    assert.deepEqual(await host.json(), {
      state: emptyState,
      billing: {
        checkoutEnabled: false,
        portalEnabled: false,
        planCode: 'partner_annual_v1',
      },
    });

    const checkout = await post(
      '/api/producer/commercial/producer-1/checkout',
      'host',
      {}
    );
    assert.equal(checkout.status, 200);
    assert.deepEqual(await checkout.json(), { url: 'https://checkout.stripe.com/test_partner' });

    const portal = await post(
      '/api/producer/commercial/producer-1/billing-portal',
      'host',
      {}
    );
    assert.equal(portal.status, 200);
    assert.deepEqual(await portal.json(), { url: 'https://billing.stripe.com/test_partner' });

    const deniedAdmin = await fetch(`${base}/api/admin/commercial`, { headers: headers('host') });
    assert.equal(deniedAdmin.status, 403);

    const admin = await fetch(`${base}/api/admin/commercial`, { headers: headers('admin') });
    assert.equal(admin.status, 200);
    assert.deepEqual(await admin.json(), { state: adminState });

    const activated = await post(
      '/api/admin/commercial/partners/producer-1/status',
      'admin',
      { status: 'active', activationSource: 'admin_pilot', reason: 'Pilot' }
    );
    assert.equal(activated.status, 200);

    const badStatus = await post(
      '/api/admin/commercial/partners/producer-1/status',
      'admin',
      { status: 'unknown' }
    );
    assert.equal(badStatus.status, 400);

    const campaign = await post(
      '/api/admin/commercial/campaigns',
      'admin',
      {
        producerId: 'producer-1',
        campaignType: 'regional_featured',
        headline: 'Harvest visits',
        placements: ['region_discovery'],
      }
    );
    assert.equal(campaign.status, 201);

    const deniedEdit = await fetch(
      base + '/api/admin/commercial/campaigns/78e94884-f021-4d06-ae92-1c593c7fe45f',
      {
        method: 'PATCH',
        headers: { ...headers('host'), 'Content-Type': 'application/json' },
        body: JSON.stringify({ headline: 'Nope', placements: ['region_discovery'] }),
      }
    );
    assert.equal(deniedEdit.status, 403);

    const edited = await fetch(
      base + '/api/admin/commercial/campaigns/78e94884-f021-4d06-ae92-1c593c7fe45f',
      {
        method: 'PATCH',
        headers: { ...headers('admin'), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline: 'Updated harvest visits',
          placements: ['region_discovery'],
        }),
      }
    );
    assert.equal(edited.status, 200);

    const transitioned = await post(
      '/api/admin/commercial/campaigns/78e94884-f021-4d06-ae92-1c593c7fe45f/status',
      'admin',
      { status: 'awaiting_review' }
    );
    assert.equal(transitioned.status, 200);

    assert.deepEqual(calls.map(call => call.type), [
      'host-read',
      'partner-checkout',
      'partner-portal',
      'admin-read',
      'admin-read',
      'partner-status',
      'partner-status',
      'campaign-create',
      'campaign-update',
      'campaign-update',
      'campaign-status',
    ]);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close(error => error ? reject(error) : resolve())
    );
  }
});
