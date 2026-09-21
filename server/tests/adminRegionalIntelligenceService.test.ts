import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildRegionalIntelligence,
  REGIONAL_AFFILIATE_MINIMUM_IMPRESSIONS,
  REGIONAL_DEMAND_MINIMUM_VIEWS,
} from '../services/adminRegionalIntelligenceService';
import type { AdminIntentBaseline } from '../services/adminIntentMetricsService';

const intent: AdminIntentBaseline = {
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
    producer_views: 120,
    saves: 5,
    trip_additions: 2,
    website_clicks: 2,
    phone_clicks: 1,
    email_clicks: 0,
    direct_producer_actions: 3,
    directions_clicks: 4,
    passport_stamps_added: 0,
    affiliate_impressions: 120,
    affiliate_clicks: 3,
  },
  producers: [
    {
      producer_id: 'p1',
      producer_name: 'One',
      destination: 'crete',
      country_code: 'GR',
      category: 'winery',
      producer_views: 80,
      saves: 3,
      trip_additions: 1,
      website_clicks: 1,
      phone_clicks: 0,
      email_clicks: 0,
      direct_producer_actions: 1,
      directions_clicks: 2,
      passport_stamps_added: 0,
      previous: { producer_views: 0, saves: 0, trip_additions: 0, website_clicks: 0, phone_clicks: 0, email_clicks: 0, directions_clicks: 0 },
    },
    {
      producer_id: 'p2',
      producer_name: 'Two',
      destination: 'crete',
      country_code: 'GR',
      category: 'olive_mill',
      producer_views: 40,
      saves: 2,
      trip_additions: 1,
      website_clicks: 1,
      phone_clicks: 1,
      email_clicks: 0,
      direct_producer_actions: 2,
      directions_clicks: 2,
      passport_stamps_added: 0,
      previous: { producer_views: 0, saves: 0, trip_additions: 0, website_clicks: 0, phone_clicks: 0, email_clicks: 0, directions_clicks: 0 },
    },
  ],
  regions: [{
    destination: 'crete',
    country_code: 'GR',
    producer_count: 2,
    region_opens: 10,
    region_producers_views: 8,
    producer_views: 120,
    saves: 5,
    trip_additions: 2,
    direct_producer_actions: 3,
    directions_clicks: 4,
    passport_stamps_added: 0,
  }],
  categories: [],
  affiliates: [{
    affiliate_campaign: 'localrent-cars',
    campaign_label: 'Localrent Cars',
    source_surface: 'region_planning',
    destination: 'crete',
    impressions: 120,
    clicks: 3,
    ctr: 2.5,
  }],
};

test('regional intelligence keeps readiness components auditable and demand sample-gated', () => {
  const now = new Date('2026-09-21T12:00:00Z');
  const report = buildRegionalIntelligence(
    [
      {
        id: 'p1',
        category: 'winery',
        destination: 'crete',
        country_code: 'GR',
        location_status: 'verified_location',
        visit_status: 'public_visits',
        road_access_status: 'verified',
        visit_booking_requirement: 'required',
        parking_status: 'available',
        visitor_hours: { monday: ['09:00-17:00'] },
        visitor_languages: ['en'],
        visitability_reviewed_at: '2026-09-20T00:00:00Z',
        phone: '+30 1',
        website: null,
      },
      {
        id: 'p2',
        category: 'olive_mill',
        destination: 'crete',
        country_code: 'GR',
        location_status: 'verified_entrance',
        visit_status: 'appointment_only',
        road_access_status: 'not_publicly_confirmed',
        visit_booking_requirement: null,
        parking_status: null,
        visitor_hours: null,
        visitor_languages: null,
        visitability_reviewed_at: '2026-09-20T00:00:00Z',
        phone: null,
        website: 'https://example.test',
      },
    ],
    [{
      producer_id: 'p2',
      value_json: { outcome: 'no_sufficient_current_evidence' },
      expires_at: '2026-12-19T00:00:00Z',
    }],
    intent,
    now
  );

  const crete = report.regions[0];
  assert.equal(crete.audited_producer_count, 2);
  assert.equal(crete.category_count, 2);
  assert.equal(crete.verified_location_count, 2);
  assert.equal(crete.public_visits_count, 1);
  assert.equal(crete.appointment_only_count, 1);
  assert.equal(crete.booking_policy_count, 1);
  assert.equal(crete.visitor_hours_count, 1);
  assert.equal(crete.road_access_review_count, 2);
  assert.equal(crete.parking_evidence_count, 1);
  assert.equal(crete.visitor_language_evidence_count, 1);
  assert.equal(crete.fresh_review_count, 2);
  assert.equal(crete.reviewed_unknown_count, 1);
  assert.equal(crete.direct_contact_count, 2);
  assert.equal(crete.demand_sample_sufficient, true);
  assert.equal(crete.affiliate_sample_sufficient, true);
  assert.equal(crete.affiliates.ctr, 2.5);
  assert.equal(REGIONAL_DEMAND_MINIMUM_VIEWS, 100);
  assert.equal(REGIONAL_AFFILIATE_MINIMUM_IMPRESSIONS, 100);
  assert.deepEqual(crete.categories.map((row) => row.category).sort(), ['olive_mill', 'winery']);
});

test('expired reviewed-unknown evidence is not counted', () => {
  const report = buildRegionalIntelligence(
    [{
      id: 'p1',
      category: 'winery',
      destination: 'crete',
      country_code: 'GR',
      location_status: 'verified_location',
      visit_status: 'not_publicly_confirmed',
      road_access_status: 'not_publicly_confirmed',
      visit_booking_requirement: null,
      parking_status: null,
      visitor_hours: null,
      visitor_languages: null,
      visitability_reviewed_at: '2026-09-20T00:00:00Z',
      phone: null,
      website: 'https://example.test',
    }],
    [{
      producer_id: 'p1',
      value_json: { outcome: 'no_sufficient_current_evidence' },
      expires_at: '2026-09-20T00:00:00Z',
    }],
    { ...intent, regions: [], producers: [], affiliates: [] },
    new Date('2026-09-21T12:00:00Z')
  );

  assert.equal(report.regions[0].reviewed_unknown_count, 0);
  assert.equal(report.regions[0].demand_sample_sufficient, false);
});
