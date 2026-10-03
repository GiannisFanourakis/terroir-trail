import type { SupabaseClient } from '@supabase/supabase-js';
import { adminDb } from '../firebaseAdmin';
import { getTrustedAccountCapabilities } from './accountAuthorization';
import { getSupabaseAdmin } from './analyticsIngestionService';

export const INTENT_REPORT_WINDOWS = [7, 30, 90, 180] as const;
export type IntentReportWindow = (typeof INTENT_REPORT_WINDOWS)[number];

export class AdminIntentMetricsError extends Error {
  constructor(
    public readonly code: 'bad_request' | 'forbidden' | 'service_unavailable',
    message: string
  ) {
    super(message);
    this.name = 'AdminIntentMetricsError';
  }
}

export interface AdminAnalyticsReliability {
  checked_at: string;
  start_date: string;
  end_date: string;
  status: 'healthy' | 'attention';
  closed_day_reporting: boolean;
  raw_event_count: number;
  aggregates_match: boolean;
  integrity_clean: boolean;
  checks: Array<{
    metric: string;
    raw: number;
    aggregate: number;
    matches: boolean;
  }>;
  integrity: {
    duplicate_client_event_ids: number;
    missing_session_key: number;
    authenticated_missing_actor_key: number;
    anonymous_with_actor_key: number;
    producer_event_missing_dimensions: number;
    unexpected_event_name: number;
  };
  note: string;
}

export interface AdminIntentBaseline {
  generated_at: string;
  start_date: string;
  end_date: string;
  aggregate_data_through: string | null;
  reliability: AdminAnalyticsReliability;
  reporting_policy: {
    basis: 'completed_utc_days';
    timezone: 'UTC';
    current_day_excluded: true;
    expected_data_through: string;
    aggregate_watermark_current: boolean;
  };
  comparison_policy: {
    minimum_active_producers: number;
    minimum_producer_views: number;
    previous_window_days: number;
  };
  totals: {
    producer_views: number;
    saves: number;
    trip_additions: number;
    website_clicks: number;
    phone_clicks: number;
    email_clicks: number;
    direct_producer_actions: number;
    directions_clicks: number;
    passport_stamps_added: number;
    affiliate_impressions: number;
    affiliate_clicks: number;
  };
  producers: Array<{
    producer_id: string;
    producer_name: string;
    destination: string;
    country_code: string | null;
    category: string;
    producer_views: number;
    saves: number;
    trip_additions: number;
    website_clicks: number;
    phone_clicks: number;
    email_clicks: number;
    direct_producer_actions: number;
    directions_clicks: number;
    passport_stamps_added: number;
    previous: {
      producer_views: number;
      saves: number;
      trip_additions: number;
      website_clicks: number;
      phone_clicks: number;
      email_clicks: number;
      directions_clicks: number;
    };
  }>;
  regions: Array<{
    destination: string;
    country_code: string | null;
    producer_count: number;
    region_opens: number;
    region_producers_views: number;
    producer_views: number;
    saves: number;
    trip_additions: number;
    direct_producer_actions: number;
    directions_clicks: number;
    passport_stamps_added: number;
  }>;
  categories: Array<{
    category: string;
    producer_count: number;
    producer_views: number;
    saves: number;
    trip_additions: number;
    direct_producer_actions: number;
    directions_clicks: number;
  }>;
  affiliates: Array<{
    affiliate_campaign: string;
    campaign_label: string | null;
    source_surface: string;
    destination: string | null;
    impressions: number;
    clicks: number;
    ctr: number | null;
  }>;
}

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export async function getAdminIntentMetrics(
  actorUid: string,
  days: number,
  db = adminDb(),
  supabase: SupabaseClient | null = getSupabaseAdmin(),
  now = new Date()
): Promise<AdminIntentBaseline> {
  if (!INTENT_REPORT_WINDOWS.includes(days as IntentReportWindow)) {
    throw new AdminIntentMetricsError('bad_request', 'Choose a 7, 30, 90 or 180 day reporting window.');
  }

  const capabilities = await getTrustedAccountCapabilities(actorUid, db);
  if (!capabilities.isAdmin) {
    throw new AdminIntentMetricsError('forbidden', 'Admin authority is required to view intent metrics.');
  }
  if (!supabase) {
    throw new AdminIntentMetricsError('service_unavailable', 'Intent analytics are temporarily unavailable.');
  }

  // Evidence/reporting windows use completed UTC days only. Including the
  // current partial day made same-day exports drift as hourly aggregates refreshed.
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  end.setUTCDate(end.getUTCDate() - 1);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const range = {
    p_start_date: isoDate(start),
    p_end_date: isoDate(end),
  };
  const [baselineResult, reliabilityResult] = await Promise.all([
    supabase.rpc('get_intent_baseline_v1', range),
    supabase.rpc('get_analytics_reliability_v1', range),
  ]);

  const data = baselineResult.data;
  const reliability = reliabilityResult.data;
  if (
    baselineResult.error || reliabilityResult.error ||
    !data || typeof data !== 'object' || Array.isArray(data) ||
    !reliability || typeof reliability !== 'object' || Array.isArray(reliability)
  ) {
    throw new AdminIntentMetricsError(
      'service_unavailable',
      baselineResult.error?.message || reliabilityResult.error?.message ||
      'Intent analytics report is unavailable.'
    );
  }

  const report = data as Omit<AdminIntentBaseline, 'reporting_policy' | 'reliability'>;
  const expectedDataThrough = isoDate(end);
  return {
    ...report,
    reliability: reliability as AdminAnalyticsReliability,
    reporting_policy: {
      basis: 'completed_utc_days',
      timezone: 'UTC',
      current_day_excluded: true,
      expected_data_through: expectedDataThrough,
      aggregate_watermark_current:
        typeof report.aggregate_data_through === 'string' &&
        report.aggregate_data_through >= expectedDataThrough,
    },
  };
}
