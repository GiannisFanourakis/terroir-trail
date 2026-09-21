import type { SupabaseClient } from '@supabase/supabase-js';
import { adminDb } from '../firebaseAdmin';
import {
  AdminIntentMetricsError,
  getAdminIntentMetrics,
  type AdminIntentBaseline,
} from './adminIntentMetricsService';
import { getSupabaseAdmin } from './analyticsIngestionService';

export const REGIONAL_FRESHNESS_DAYS = 90;
export const REGIONAL_DEMAND_MINIMUM_VIEWS = 100;
export const REGIONAL_AFFILIATE_MINIMUM_IMPRESSIONS = 100;

interface ProducerRegionalSource {
  id: string;
  category: string;
  destination: string;
  country_code: string | null;
  location_status: string | null;
  visit_status: string | null;
  road_access_status: string | null;
  visit_booking_requirement: string | null;
  parking_status: string | null;
  visitor_hours: unknown;
  visitor_languages: string[] | null;
  visitability_reviewed_at: string | null;
  phone: string | null;
  website: string | null;
}

interface GapReviewSource {
  producer_id: string;
  value_json: unknown;
  expires_at: string | null;
}

export interface AdminRegionalIntelligence {
  generated_at: string;
  start_date: string;
  end_date: string;
  aggregate_data_through: string | null;
  freshness_days: number;
  demand_minimum_views: number;
  affiliate_minimum_impressions: number;
  coverage_note: string;
  regions: Array<{
    destination: string;
    country_code: string | null;
    audited_producer_count: number;
    category_count: number;
    verified_location_count: number;
    public_visits_count: number;
    seasonal_public_count: number;
    appointment_only_count: number;
    not_publicly_confirmed_count: number;
    current_access_uncertain_count: number;
    booking_policy_count: number;
    visitor_hours_count: number;
    road_access_review_count: number;
    parking_evidence_count: number;
    visitor_language_evidence_count: number;
    fresh_review_count: number;
    reviewed_unknown_count: number;
    direct_contact_count: number;
    demand_sample_sufficient: boolean;
    affiliate_sample_sufficient: boolean;
    demand: {
      region_opens: number;
      region_producers_views: number;
      producer_views: number;
      saves: number;
      trip_additions: number;
      direct_producer_actions: number;
      directions_clicks: number;
    };
    affiliates: {
      impressions: number;
      clicks: number;
      ctr: number | null;
    };
    categories: Array<{
      category: string;
      producer_count: number;
      producer_views: number;
      saves: number;
      trip_additions: number;
      direct_producer_actions: number;
      directions_clicks: number;
    }>;
  }>;
}

const hasText = (value: string | null | undefined) => Boolean(value?.trim());

const hasVisitorHours = (value: unknown): boolean => {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === 'object') return Object.keys(value as Record<string, unknown>).length > 0;
  return false;
};

const isCurrentReviewedUnknown = (row: GapReviewSource, now: Date): boolean => {
  if (row.expires_at && new Date(row.expires_at).getTime() < now.getTime()) return false;
  if (!row.value_json || typeof row.value_json !== 'object' || Array.isArray(row.value_json)) return false;
  return (row.value_json as Record<string, unknown>).outcome === 'no_sufficient_current_evidence';
};

const emptyDemand = () => ({
  region_opens: 0,
  region_producers_views: 0,
  producer_views: 0,
  saves: 0,
  trip_additions: 0,
  direct_producer_actions: 0,
  directions_clicks: 0,
});

export function buildRegionalIntelligence(
  producers: ProducerRegionalSource[],
  gapReviews: GapReviewSource[],
  intent: AdminIntentBaseline,
  now = new Date()
): AdminRegionalIntelligence {
  const freshnessCutoff = now.getTime() - (REGIONAL_FRESHNESS_DAYS * 24 * 60 * 60 * 1000);
  const reviewedUnknownIds = new Set(
    gapReviews
      .filter((row) => isCurrentReviewedUnknown(row, now))
      .map((row) => row.producer_id)
  );

  const regionDemand = new Map(intent.regions.map((row) => [row.destination, row]));
  const affiliateDemand = new Map<string, { impressions: number; clicks: number }>();
  for (const row of intent.affiliates) {
    if (!row.destination) continue;
    const current = affiliateDemand.get(row.destination) || { impressions: 0, clicks: 0 };
    current.impressions += row.impressions;
    current.clicks += row.clicks;
    affiliateDemand.set(row.destination, current);
  }

  const producerDemandByRegionCategory = new Map<string, Map<string, {
    producer_views: number;
    saves: number;
    trip_additions: number;
    direct_producer_actions: number;
    directions_clicks: number;
  }>>();

  for (const row of intent.producers) {
    if (!producerDemandByRegionCategory.has(row.destination)) {
      producerDemandByRegionCategory.set(row.destination, new Map());
    }
    const categories = producerDemandByRegionCategory.get(row.destination)!;
    const current = categories.get(row.category) || {
      producer_views: 0,
      saves: 0,
      trip_additions: 0,
      direct_producer_actions: 0,
      directions_clicks: 0,
    };
    current.producer_views += row.producer_views;
    current.saves += row.saves;
    current.trip_additions += row.trip_additions;
    current.direct_producer_actions += row.direct_producer_actions;
    current.directions_clicks += row.directions_clicks;
    categories.set(row.category, current);
  }

  const grouped = new Map<string, ProducerRegionalSource[]>();
  for (const producer of producers) {
    const destination = producer.destination?.trim();
    if (!destination) continue;
    if (!grouped.has(destination)) grouped.set(destination, []);
    grouped.get(destination)!.push(producer);
  }

  const regions = [...grouped.entries()].map(([destination, rows]) => {
    const categories = new Map<string, number>();
    for (const row of rows) {
      categories.set(row.category, (categories.get(row.category) || 0) + 1);
    }

    const demand = regionDemand.get(destination);
    const demandSummary = demand ? {
      region_opens: demand.region_opens,
      region_producers_views: demand.region_producers_views,
      producer_views: demand.producer_views,
      saves: demand.saves,
      trip_additions: demand.trip_additions,
      direct_producer_actions: demand.direct_producer_actions,
      directions_clicks: demand.directions_clicks,
    } : emptyDemand();

    const affiliate = affiliateDemand.get(destination) || { impressions: 0, clicks: 0 };
    const affiliateCtr = affiliate.impressions > 0
      ? Number(((affiliate.clicks / affiliate.impressions) * 100).toFixed(2))
      : null;

    const demandCategories = producerDemandByRegionCategory.get(destination) || new Map();
    const categoryRows = [...categories.entries()].map(([category, producerCount]) => {
      const categoryDemand = demandCategories.get(category);
      return {
        category,
        producer_count: producerCount,
        producer_views: categoryDemand?.producer_views || 0,
        saves: categoryDemand?.saves || 0,
        trip_additions: categoryDemand?.trip_additions || 0,
        direct_producer_actions: categoryDemand?.direct_producer_actions || 0,
        directions_clicks: categoryDemand?.directions_clicks || 0,
      };
    }).sort((a, b) =>
      b.producer_count - a.producer_count ||
      b.producer_views - a.producer_views ||
      a.category.localeCompare(b.category)
    );

    return {
      destination,
      country_code: rows.find((row) => hasText(row.country_code))?.country_code || null,
      audited_producer_count: rows.length,
      category_count: categories.size,
      verified_location_count: rows.filter((row) =>
        row.location_status === 'verified_location' || row.location_status === 'verified_entrance'
      ).length,
      public_visits_count: rows.filter((row) => row.visit_status === 'public_visits').length,
      seasonal_public_count: rows.filter((row) => row.visit_status === 'seasonal_public').length,
      appointment_only_count: rows.filter((row) => row.visit_status === 'appointment_only').length,
      not_publicly_confirmed_count: rows.filter((row) => row.visit_status === 'not_publicly_confirmed').length,
      current_access_uncertain_count: rows.filter((row) => row.visit_status === 'current_access_uncertain').length,
      booking_policy_count: rows.filter((row) => hasText(row.visit_booking_requirement)).length,
      visitor_hours_count: rows.filter((row) => hasVisitorHours(row.visitor_hours)).length,
      road_access_review_count: rows.filter((row) =>
        hasText(row.road_access_status) && row.road_access_status !== 'unreviewed'
      ).length,
      parking_evidence_count: rows.filter((row) => hasText(row.parking_status)).length,
      visitor_language_evidence_count: rows.filter((row) => (row.visitor_languages?.length || 0) > 0).length,
      fresh_review_count: rows.filter((row) =>
        row.visitability_reviewed_at
          ? new Date(row.visitability_reviewed_at).getTime() >= freshnessCutoff
          : false
      ).length,
      reviewed_unknown_count: rows.filter((row) => reviewedUnknownIds.has(row.id)).length,
      direct_contact_count: rows.filter((row) => hasText(row.phone) || hasText(row.website)).length,
      demand_sample_sufficient: demandSummary.producer_views >= REGIONAL_DEMAND_MINIMUM_VIEWS,
      affiliate_sample_sufficient: affiliate.impressions >= REGIONAL_AFFILIATE_MINIMUM_IMPRESSIONS,
      demand: demandSummary,
      affiliates: {
        impressions: affiliate.impressions,
        clicks: affiliate.clicks,
        ctr: affiliateCtr,
      },
      categories: categoryRows,
    };
  }).sort((a, b) =>
    b.audited_producer_count - a.audited_producer_count ||
    a.destination.localeCompare(b.destination)
  );

  return {
    generated_at: new Date().toISOString(),
    start_date: intent.start_date,
    end_date: intent.end_date,
    aggregate_data_through: intent.aggregate_data_through,
    freshness_days: REGIONAL_FRESHNESS_DAYS,
    demand_minimum_views: REGIONAL_DEMAND_MINIMUM_VIEWS,
    affiliate_minimum_impressions: REGIONAL_AFFILIATE_MINIMUM_IMPRESSIONS,
    coverage_note: 'TerroirTrail is a curated catalogue. Regional counts describe current audited catalogue coverage and are not claims of exhaustive regional supply.',
    regions,
  };
}

export async function getAdminRegionalIntelligence(
  actorUid: string,
  days: number,
  db = adminDb(),
  supabase: SupabaseClient | null = getSupabaseAdmin(),
  now = new Date()
): Promise<AdminRegionalIntelligence> {
  if (!supabase) {
    throw new AdminIntentMetricsError('service_unavailable', 'Regional intelligence is temporarily unavailable.');
  }

  const intent = await getAdminIntentMetrics(actorUid, days, db, supabase, now);

  const [producerResult, evidenceResult] = await Promise.all([
    supabase
      .from('producers')
      .select('id,category,destination,country_code,location_status,visit_status,road_access_status,visit_booking_requirement,parking_status,visitor_hours,visitor_languages,visitability_reviewed_at,phone,website')
      .eq('is_active', true),
    supabase
      .from('producer_fact_evidence')
      .select('producer_id,value_json,expires_at')
      .eq('field_key', 'visitability_v2_gap_review'),
  ]);

  if (producerResult.error || evidenceResult.error) {
    throw new AdminIntentMetricsError(
      'service_unavailable',
      producerResult.error?.message ||
      evidenceResult.error?.message ||
      'Regional intelligence report is unavailable.'
    );
  }

  return buildRegionalIntelligence(
    (producerResult.data || []) as ProducerRegionalSource[],
    (evidenceResult.data || []) as GapReviewSource[],
    intent,
    now
  );
}
