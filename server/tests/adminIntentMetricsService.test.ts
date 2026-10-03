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
      if (name === 'get_analytics_reliability_v1') {
        return {
          data: {
            checked_at: '2026-09-21T00:10:00Z',
            start_date: '2026-08-22',
            end_date: '2026-09-20',
            status: 'healthy',
            closed_day_reporting: true,
            raw_event_count: 20,
            aggregates_match: true,
            integrity_clean: true,
            checks: [],
            integrity: {
              duplicate_client_event_ids: 0,
              missing_session_key: 0,
              authenticated_missing_actor_key: 0,
              anonymous_with_actor_key: 0,
              producer_event_missing_dimensions: 0,
              unexpected_event_name: 0,
            },
            note: 'closed day audit',
          },
          error: null,
        };
      }
      return {
        data: {
          generated_at: '2026-09-21T00:00:00Z',
          start_date: '2026-08-22',
          end_date: '2026-09-20',
          aggregate_data_through: '2026-09-20',
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
  assert.deepEqual(result.reporting_policy, {
    basis: 'completed_utc_days',
    timezone: 'UTC',
    current_day_excluded: true,
    expected_data_through: '2026-09-20',
    aggregate_watermark_current: true,
  });
  assert.equal(result.reliability.status, 'healthy');
  assert.equal(result.reliability.aggregates_match, true);
  assert.deepEqual(calls, [
    {
      name: 'get_intent_baseline_v1',
      args: {
        p_start_date: '2026-08-22',
        p_end_date: '2026-09-20',
      },
    },
    {
      name: 'get_analytics_reliability_v1',
      args: {
        p_start_date: '2026-08-22',
        p_end_date: '2026-09-20',
      },
    },
  ]);
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
