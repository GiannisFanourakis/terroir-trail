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

export interface AdminIntentBaseline {
  generated_at: string;
  start_date: string;
  end_date: string;
  aggregate_data_through: string | null;
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

  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const { data, error } = await supabase.rpc('get_intent_baseline_v1', {
    p_start_date: isoDate(start),
    p_end_date: isoDate(end),
  });

  if (error || !data || typeof data !== 'object' || Array.isArray(data)) {
    throw new AdminIntentMetricsError(
      'service_unavailable',
      error?.message || 'Intent analytics report is unavailable.'
    );
  }

  return data as AdminIntentBaseline;
}
