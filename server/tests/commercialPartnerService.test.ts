import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CommercialPartnerError,
  createCommercialPartnerCampaign,
  getOwnedCommercialState,
  setCommercialPartnerStatus,
  transitionCommercialPartnerCampaign,
  updateCommercialPartnerCampaign,
} from '../services/commercialPartnerService';

const makeDb = (options?: {
  admin?: boolean;
  ownerships?: Array<{ id: string; ownerUid: string; status: string; producerId?: string }>;
}) => ({
  collection: (name: string) => {
    if (name === 'admin_users') {
      return {
        doc: (uid: string) => ({
          get: async () => ({
            exists: Boolean(options?.admin),
            data: () => options?.admin
              ? { userId: uid, level: 'admin', status: 'active' }
              : undefined,
          }),
        }),
      };
    }
    if (name === 'producer_owners') {
      return {
        where: (_field: string, _operator: string, uid: string) => ({
          get: async () => ({
            docs: (options?.ownerships || [])
              .filter((row) => row.ownerUid === uid)
              .map((row) => ({ id: row.id, data: () => row })),
          }),
        }),
      };
    }
    throw new Error(`Unexpected collection: ${name}`);
  },
});

test('non-admin cannot mutate commercial Partner state', async () => {
  let rpcCalled = false;
  const supabase = {
    rpc: async () => {
      rpcCalled = true;
      return { data: null, error: null };
    },
  };

  await assert.rejects(
    setCommercialPartnerStatus(
      'host-uid',
      'producer-1',
      { status: 'active' },
      makeDb({
        ownerships: [{ id: 'producer-1', ownerUid: 'host-uid', status: 'active' }],
      }) as any,
      supabase as any
    ),
    (error: unknown) =>
      error instanceof CommercialPartnerError && error.code === 'forbidden'
  );

  assert.equal(rpcCalled, false);
});

test('admin Partner status changes use the trusted RPC and audit-capable authority path', async () => {
  const calls: Array<{ name: string; args: Record<string, unknown> }> = [];
  const supabase = {
    rpc: async (name: string, args: Record<string, unknown>) => {
      calls.push({ name, args });
      return {
        data: {
          producer_id: 'producer-1',
          status: 'active',
          activation_source: 'admin_pilot',
          created_by_uid: 'admin-uid',
          updated_by_uid: 'admin-uid',
          activated_at: '2026-09-23T06:00:00Z',
          ended_at: null,
          created_at: '2026-09-23T06:00:00Z',
          updated_at: '2026-09-23T06:00:00Z',
        },
        error: null,
      };
    },
  };

  const result = await setCommercialPartnerStatus(
    'admin-uid',
    'producer-1',
    {
      status: 'active',
      activationSource: 'admin_pilot',
      reason: 'Internal production pilot',
    },
    makeDb({ admin: true }) as any,
    supabase as any
  );

  assert.equal(result.status, 'active');
  assert.deepEqual(calls, [{
    name: 'set_commercial_partner_status_v1',
    args: {
      p_producer_id: 'producer-1',
      p_status: 'active',
      p_actor_uid: 'admin-uid',
      p_reason: 'Internal production pilot',
      p_activation_source: 'admin_pilot',
      p_actor_type: 'admin',
    },
  }]);
});

test('campaign creation is constrained to the producer canonical destination/category', async () => {
  const rpcCalls: Array<{ name: string; args: Record<string, unknown> }> = [];
  const supabase = {
    from: (table: string) => {
      assert.equal(table, 'producers');
      return {
        select: () => ({
          eq: (field: string, value: unknown) => ({
            eq: (field2: string, value2: unknown) => ({
              maybeSingle: async () => {
                assert.equal(field, 'id');
                assert.equal(value, 'producer-1');
                assert.equal(field2, 'is_active');
                assert.equal(value2, true);
                return {
                  data: { destination: 'crete', category: 'winery' },
                  error: null,
                };
              },
            }),
          }),
        }),
      };
    },
    rpc: async (name: string, args: Record<string, unknown>) => {
      rpcCalls.push({ name, args });
      return {
        data: {
          campaign: {
            id: '78e94884-f021-4d06-ae92-1c593c7fe45f',
            producer_id: 'producer-1',
            campaign_type: 'regional_featured',
            status: 'draft',
            destination: 'crete',
            category: 'winery',
            headline: 'Harvest visits',
          },
          placements: ['region_discovery'],
        },
        error: null,
      };
    },
  };

  const created = await createCommercialPartnerCampaign(
    'admin-uid',
    {
      producerId: 'producer-1',
      campaignType: 'regional_featured',
      headline: 'Harvest visits',
      placements: ['region_discovery'],
    },
    makeDb({ admin: true }) as any,
    supabase as any
  );

  assert.equal(created.campaign.destination, 'crete');
  assert.equal(rpcCalls[0].args.p_destination, 'crete');
  assert.equal(rpcCalls[0].args.p_category, 'winery');

  await assert.rejects(
    createCommercialPartnerCampaign(
      'admin-uid',
      {
        producerId: 'producer-1',
        campaignType: 'regional_featured',
        headline: 'Wrong destination',
        destination: 'tuscany',
        placements: ['region_discovery'],
      },
      makeDb({ admin: true }) as any,
      supabase as any
    ),
    (error: unknown) =>
      error instanceof CommercialPartnerError && error.code === 'bad_request'
  );
});

test('verified Host can read only the commercial state attached to owned producer IDs', async () => {
  const selectedColumns: Record<string, string> = {};
  const supabase = {
    from: (table: string) => ({
      select: (columns: string) => {
        selectedColumns[table] = columns;
        return {
          in: async (_field: string, ids: string[]) => {
            assert.deepEqual(ids, ['producer-owned']);
            if (table === 'commercial_partner_accounts') {
              return {
                data: [{
                  producer_id: 'producer-owned',
                  status: 'active',
                  activation_source: 'admin_pilot',
                }],
                error: null,
              };
            }
            return { data: [], error: null };
          },
        };
      },
    }),
    rpc: async (name: string, args: Record<string, unknown>) => {
      assert.equal(name, 'get_partner_campaign_report_v1');
      assert.deepEqual(args, { p_producer_ids: ['producer-owned'] });
      return {
        data: {
          campaigns: [{
            campaign_id: 'campaign-1',
            producer_id: 'producer-owned',
            qualified_impressions: 12,
            opens: 3,
            saves: 1,
            trip_additions: 1,
            website_clicks: 1,
            phone_clicks: 0,
            email_clicks: 0,
            directions_clicks: 1,
            first_activity_day: '2026-09-20',
            last_activity_day: '2026-09-23',
          }],
        },
        error: null,
      };
    },
  };

  const state = await getOwnedCommercialState(
    'host-uid',
    makeDb({
      ownerships: [
        { id: 'producer-owned', ownerUid: 'host-uid', status: 'active' },
        { id: 'producer-inactive', ownerUid: 'host-uid', status: 'inactive' },
      ],
    }) as any,
    supabase as any
  );

  assert.deepEqual(state.producerIds, ['producer-owned']);
  assert.equal(state.partners.length, 1);
  assert.equal(state.campaignMetrics[0].qualified_impressions, 12);
  assert.match(selectedColumns.commercial_partner_subscriptions, /plan_code/);
  assert.doesNotMatch(selectedColumns.commercial_partner_subscriptions, /provider_customer_id/);
  assert.doesNotMatch(selectedColumns.commercial_partner_subscriptions, /provider_subscription_id/);
});

test('campaign transition validation fails before RPC for malformed IDs', async () => {
  const supabase = { rpc: async () => ({ data: {}, error: null }) };

  await assert.rejects(
    transitionCommercialPartnerCampaign(
      'admin-uid',
      'not-a-uuid',
      { status: 'active' },
      makeDb({ admin: true }) as any,
      supabase as any
    ),
    (error: unknown) =>
      error instanceof CommercialPartnerError && error.code === 'bad_request'
  );
});


test('admin can edit only draft/rejected campaign content through the trusted RPC', async () => {
  const calls: Array<{ name: string; args: Record<string, unknown> }> = [];
  const supabase = {
    rpc: async (name: string, args: Record<string, unknown>) => {
      calls.push({ name, args });
      return {
        data: {
          campaign: {
            id: '78e94884-f021-4d06-ae92-1c593c7fe45f',
            producer_id: 'producer-1',
            campaign_type: 'regional_featured',
            status: 'draft',
            destination: 'crete',
            category: 'winery',
            headline: 'Edited harvest visits',
          },
          placements: ['region_discovery', 'trip_preparation'],
        },
        error: null,
      };
    },
  };

  const result = await updateCommercialPartnerCampaign(
    'admin-uid',
    '78e94884-f021-4d06-ae92-1c593c7fe45f',
    {
      headline: 'Edited harvest visits',
      message: 'Factual seasonal update.',
      startsAt: '2026-09-24T09:00:00Z',
      endsAt: '2026-09-30T17:00:00Z',
      placements: ['region_discovery', 'trip_preparation'],
    },
    makeDb({ admin: true }) as any,
    supabase as any
  );

  assert.equal(result.campaign.headline, 'Edited harvest visits');
  assert.deepEqual(calls, [{
    name: 'update_commercial_partner_campaign_v1',
    args: {
      p_campaign_id: '78e94884-f021-4d06-ae92-1c593c7fe45f',
      p_headline: 'Edited harvest visits',
      p_message: 'Factual seasonal update.',
      p_starts_at: '2026-09-24T09:00:00.000Z',
      p_ends_at: '2026-09-30T17:00:00.000Z',
      p_placements: ['region_discovery', 'trip_preparation'],
      p_actor_uid: 'admin-uid',
    },
  }]);
});
