import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  AdminIntentMetricsError,
  getAdminIntentMetrics,
} from '../services/adminIntentMetricsService';

const makeDb = (isAdmin: boolean) => ({
  collection: (name: string) => ({
    doc: (_id: string) => ({
      get: async () => ({
        exists: name === 'admin_users' && isAdmin,
        data: () => isAdmin ? { userId: 'admin-uid', level: 'admin', status: 'active' } : undefined,
      }),
    }),
    where: () => ({
      get: async () => ({ docs: [] }),
    }),
  }),
});

test('admin intent metrics use the aggregate reporting RPC with the selected window', async () => {
  const calls: Array<{ name: string; args: Record<string, unknown> }> = [];
  const supabase = {
    rpc: async (name: string, args: Record<string, unknown>) => {
      calls.push({ name, args });
      return {
        data: {
          generated_at: '2026-09-21T00:00:00Z',
          start_date: '2026-08-23',
          end_date: '2026-09-21',
          aggregate_data_through: '2026-09-21',
          comparison_policy: {
            minimum_active_producers: 5,
            minimum_producer_views: 100,
            previous_window_days: 30,
          },
          totals: {
            producer_views: 12,
            saves: 2,
            trip_additions: 0,
            website_clicks: 1,
            phone_clicks: 0,
            email_clicks: 0,
            direct_producer_actions: 1,
            directions_clicks: 1,
            passport_stamps_added: 1,
            affiliate_impressions: 20,
            affiliate_clicks: 1,
          },
          producers: [{
            producer_id: 'producer-1',
            producer_name: 'Producer One',
            destination: 'crete',
            country_code: 'GR',
            category: 'winery',
            producer_views: 12,
            saves: 2,
            trip_additions: 0,
            website_clicks: 1,
            phone_clicks: 0,
            email_clicks: 0,
            direct_producer_actions: 1,
            directions_clicks: 1,
            passport_stamps_added: 1,
            previous: {
              producer_views: 5,
              saves: 1,
              trip_additions: 0,
              website_clicks: 0,
              phone_clicks: 0,
              email_clicks: 0,
              directions_clicks: 0,
            },
          }],
          regions: [],
          categories: [],
          affiliates: [],
        },
        error: null,
      };
    },
  };

  const result = await getAdminIntentMetrics(
    'admin-uid',
    30,
    makeDb(true) as any,
    supabase as any,
    new Date('2026-09-21T12:00:00Z')
  );

  assert.equal(result.totals.producer_views, 12);
  assert.equal(result.totals.website_clicks, 1);
  assert.equal(result.producers[0].previous.producer_views, 5);
  assert.equal(result.comparison_policy.minimum_producer_views, 100);
  assert.deepEqual(calls, [{
    name: 'get_intent_baseline_v1',
    args: {
      p_start_date: '2026-08-23',
      p_end_date: '2026-09-21',
    },
  }]);
});

test('non-admin accounts cannot read intent metrics', async () => {
  const supabase = { rpc: async () => ({ data: {}, error: null }) };
  await assert.rejects(
    getAdminIntentMetrics('traveler-uid', 30, makeDb(false) as any, supabase as any),
    (error: unknown) => error instanceof AdminIntentMetricsError && error.code === 'forbidden'
  );
});

test('unsupported reporting windows fail closed', async () => {
  await assert.rejects(
    getAdminIntentMetrics('admin-uid', 365, makeDb(true) as any, {} as any),
    (error: unknown) => error instanceof AdminIntentMetricsError && error.code === 'bad_request'
  );
});
