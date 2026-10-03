import { describe, expect, it } from 'vitest';
import {
  buildIntentEvidenceMarkdown,
  buildRegionalEvidenceMarkdown,
} from './adminEvidenceExport';
import type {
  AdminIntentMetrics,
  AdminRegionalIntelligence,
} from '../services/adminApi';

describe('admin evidence export', () => {
  it('creates an auditable intent snapshot without turning intent into bookings', () => {
    const metrics = {
      generated_at: '2026-10-03T08:00:00Z',
      start_date: '2026-09-03',
      end_date: '2026-10-03',
      aggregate_data_through: '2026-10-02',
      comparison_policy: {
        minimum_active_producers: 3,
        minimum_producer_views: 20,
        previous_window_days: 30,
      },
      totals: {
        producer_views: 12, saves: 2, trip_additions: 1,
        website_clicks: 3, phone_clicks: 1, email_clicks: 0,
        direct_producer_actions: 4, directions_clicks: 2,
        passport_stamps_added: 1, affiliate_impressions: 0, affiliate_clicks: 0,
      },
      producers: [], regions: [], categories: [], affiliates: [],
    } satisfies AdminIntentMetrics;

    const markdown = buildIntentEvidenceMarkdown(metrics);
    expect(markdown).toContain('Producer views | 12');
    expect(markdown).toContain('not bookings, visits or purchases');
  });
  it('creates a regional readiness snapshot with the non-exhaustive coverage warning', () => {
    const report = {
      generated_at: '2026-10-03T08:00:00Z',
      start_date: '2026-09-03',
      end_date: '2026-10-03',
      aggregate_data_through: '2026-10-02',
      freshness_days: 180,
      demand_minimum_views: 20,
      affiliate_minimum_impressions: 50,
      coverage_note: 'Curated and non-exhaustive coverage.',
      regions: [],
    } satisfies AdminRegionalIntelligence;

    const markdown = buildRegionalEvidenceMarkdown(report);
    expect(markdown).toContain('Curated and non-exhaustive coverage.');
    expect(markdown).toContain('Curated, non-exhaustive coverage.');
  });
});
