import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import {
  ContextualAffiliateSection,
  CONTEXTUAL_AFFILIATE_CAMPAIGNS,
  recordAffiliateClick,
  recordAffiliateImpression,
  withSubId,
} from './ContextualAffiliateSection';

const mocks = vi.hoisted(() => ({
  trackIntent: vi.fn(async () => ({ success: true, clientEventId: 'evt-1' })),
}));

vi.mock('../../services/intentAnalytics', () => ({
  trackIntent: mocks.trackIntent,
}));

describe('ContextualAffiliateSection - Phase 14.7 Pilot', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_ENABLE_TRAVEL_AFFILIATES', 'true');
    mocks.trackIntent.mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  describe('Campaign Catalogue Integrity', () => {
    it('contains only the 4 allowed pilot campaigns and excludes Klook', () => {
      const campaignIds = CONTEXTUAL_AFFILIATE_CAMPAIGNS.map((c) => c.id);
      expect(campaignIds).toEqual([
        'localrent-cars',
        'welcome-pickups',
        'gettransfer-rides',
        'yesim-esim',
      ]);
      expect(campaignIds).not.toContain('klook-experiences');
    });

    it('generates URLs preserving placement subIDs and query parameters', () => {
      expect(withSubId('https://localrent.tpx.lv/tgiqwQZQ', 'terroir_banner_localrent')).toBe(
        'https://localrent.tpx.lv/tgiqwQZQ?sub_id=terroir_banner_localrent'
      );
      expect(withSubId('https://example.com?foo=bar', 'test_sub')).toBe(
        'https://example.com?foo=bar&sub_id=test_sub'
      );
    });
  });

  describe('Trip Preparation Surface', () => {
    it('renders compact non-rotating utility with disclosure for trip_preparation', () => {
      const html = renderToString(
        <ContextualAffiliateSection sourceSurface="trip_preparation" hasExplorerPass={false} />
      );

      // Section header and label
      expect(html).toContain('Affiliate · Travel Utility');
      expect(html).toContain('Trip Logistics &amp; Connectivity');
      expect(html).toContain('4 services');

      // Disclosure and ranking independence disclaimer
      expect(html).toContain('TerroirTrail may earn a partner commission');
      expect(
        html
      ).toContain(
        'Affiliate links never affect producer selection, visit facts, road ratings, or ranking'
      );

      // All 4 allowed campaigns present simultaneously (non-rotating)
      expect(html).toContain('Localrent');
      expect(html).toContain('localrent.tpx.lv');
      expect(html).toContain('sub_id=terroir_banner_localrent');

      expect(html).toContain('Welcome Pickups');
      expect(html).toContain('tpx.lv/75XqHdHY');
      expect(html).toContain('sub_id=terroir_banner_welcome');

      expect(html).toContain('GetTransfer');
      expect(html).toContain('gettransfer.tpx.lv');
      expect(html).toContain('sub_id=terroir_banner_gettransfer');

      expect(html).toContain('Yesim');
      expect(html).toContain('yesim.tpx.lv');
      expect(html).toContain('sub_id=terroir_banner_yesim');

      // Attributes
      expect(html).toContain('rel="sponsored noopener noreferrer"');
      expect(html).toContain('target="_blank"');

      // Excluded campaign check
      expect(html).not.toContain('klook-experiences');
      expect(html).not.toContain('klook.tpx.lv');
    });
  });

  describe('Region Planning Surface', () => {
    it('renders compact utility for region_planning with destination context', () => {
      const html = renderToString(
        <ContextualAffiliateSection
          sourceSurface="region_planning"
          hasExplorerPass={false}
          destination="crete"
        />
      );

      expect(html).toContain('Affiliate · Travel Utility');
      expect(html).toContain('Regional Travel Logistics');
      expect(html).toContain('Localrent');
      expect(html).toContain('Welcome Pickups');
      expect(html).toContain('GetTransfer');
      expect(html).toContain('Yesim');
    });
  });

  describe('Gate & Suppression', () => {
    it('fails closed and renders nothing when VITE_ENABLE_TRAVEL_AFFILIATES is false', () => {
      vi.stubEnv('VITE_ENABLE_TRAVEL_AFFILIATES', 'false');

      const html = renderToString(
        <ContextualAffiliateSection sourceSurface="trip_preparation" hasExplorerPass={false} />
      );

      expect(html).toBe('');
    });

    it('suppresses affiliate section completely for Explorer Pass holders', () => {
      const html = renderToString(
        <ContextualAffiliateSection sourceSurface="trip_preparation" hasExplorerPass={true} />
      );

      expect(html).toBe('');
    });
  });

  describe('Analytics & Intent Tracking', () => {
    it('tracks affiliate_click with trip_preparation sourceSurface', async () => {
      await recordAffiliateClick('localrent-cars', 'trip_preparation');

      expect(mocks.trackIntent).toHaveBeenCalledWith({
        event: 'affiliate_click',
        sourceSurface: 'trip_preparation',
        affiliateCampaignId: 'localrent-cars',
        destination: undefined,
      });
    });

    it('tracks affiliate_click with region_planning sourceSurface and destination', async () => {
      await recordAffiliateClick('yesim-esim', 'region_planning', 'crete');

      expect(mocks.trackIntent).toHaveBeenCalledWith({
        event: 'affiliate_click',
        sourceSurface: 'region_planning',
        affiliateCampaignId: 'yesim-esim',
        destination: 'crete',
      });
    });

    it('tracks affiliate_impression with trip_preparation sourceSurface', async () => {
      await recordAffiliateImpression('welcome-pickups', 'trip_preparation');

      expect(mocks.trackIntent).toHaveBeenCalledWith({
        event: 'affiliate_impression',
        sourceSurface: 'trip_preparation',
        affiliateCampaignId: 'welcome-pickups',
        destination: undefined,
      });
    });

    it('tracks affiliate_impression with region_planning sourceSurface and destination', async () => {
      await recordAffiliateImpression('gettransfer-rides', 'region_planning', 'peloponnese');

      expect(mocks.trackIntent).toHaveBeenCalledWith({
        event: 'affiliate_impression',
        sourceSurface: 'region_planning',
        affiliateCampaignId: 'gettransfer-rides',
        destination: 'peloponnese',
      });
    });
  });
});
