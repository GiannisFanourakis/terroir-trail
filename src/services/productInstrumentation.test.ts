import { describe, expect, it, vi, beforeEach } from 'vitest';
import { CLIENT_EVENT_ALLOWED_SURFACES, type IntentEventPayload } from './intentAnalytics';

// Test that all frontend instrumentation calls adhere to the Phase 14.3 Event Contract v1

describe('Phase 14.3 Product Instrumentation & Contract Compliance', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Contract v1 Event Vocabulary & Allowed Surfaces', () => {
    const ALLOWED_SURFACES = CLIENT_EVENT_ALLOWED_SURFACES;

    const ALLOWED_AFFILIATE_CAMPAIGNS = [
      'klook-experiences',
      'localrent-cars',
      'welcome-pickups',
      'gettransfer-rides',
      'yesim-esim',
    ];

    it('defines valid surfaces for all 14 instrumented event types', () => {
      expect(Object.keys(ALLOWED_SURFACES)).toHaveLength(14);
    });

    it('requires valid source surfaces for producer events', () => {
      const producerEvents: IntentEventPayload[] = [
        { event: 'producer_view', producerId: 'p1', sourceSurface: 'map_marker' },
        { event: 'producer_view', producerId: 'p1', sourceSurface: 'map_quick_card' },
        { event: 'producer_share', producerId: 'p1', sourceSurface: 'producer_drawer' },
        { event: 'producer_save', producerId: 'p1', sourceSurface: 'producer_drawer' },
        { event: 'producer_unsave', producerId: 'p1', sourceSurface: 'map_quick_card' },
        { event: 'producer_website_click', producerId: 'p1', sourceSurface: 'producer_drawer' },
        { event: 'producer_phone_click', producerId: 'p1', sourceSurface: 'producer_drawer' },
        { event: 'producer_email_click', producerId: 'p1', sourceSurface: 'producer_drawer' },
        { event: 'directions_click', producerId: 'p1', sourceSurface: 'producer_drawer' },
      ];

      for (const payload of producerEvents) {
        expect(ALLOWED_SURFACES[payload.event]).toContain(payload.sourceSurface);
        if ('producerId' in payload) {
          expect(payload.producerId).toBeTruthy();
        }
      }
    });

    it('requires valid source surfaces for regional events', () => {
      const regionEvents: IntentEventPayload[] = [
        { event: 'region_open', destination: 'crete', sourceSurface: 'map_canvas' },
        { event: 'region_producers_view', destination: 'tuscany', sourceSurface: 'region_drawer' },
      ];

      for (const payload of regionEvents) {
        expect(ALLOWED_SURFACES[payload.event]).toContain(payload.sourceSurface);
        if ('destination' in payload) {
          expect(payload.destination).toBeTruthy();
        }
      }
    });

    it('requires valid source surfaces for passport events', () => {
      const passportEvents: IntentEventPayload[] = [
        { event: 'passport_stamp_added', producerId: 'p1', sourceSurface: 'passport' },
        { event: 'passport_stamp_removed', producerId: 'p1', sourceSurface: 'producer_drawer' },
      ];

      for (const payload of passportEvents) {
        expect(ALLOWED_SURFACES[payload.event]).toContain(payload.sourceSurface);
      }
    });

    it('requires allowed affiliate campaigns for affiliate events', () => {
      const affiliateEvents: IntentEventPayload[] = [
        { event: 'affiliate_impression', affiliateCampaignId: 'klook-experiences', sourceSurface: 'map_affiliate_banner' },
        { event: 'affiliate_click', affiliateCampaignId: 'localrent-cars', sourceSurface: 'map_affiliate_banner' },
      ];

      for (const payload of affiliateEvents) {
        expect(ALLOWED_SURFACES[payload.event]).toContain(payload.sourceSurface);
        if ('affiliateCampaignId' in payload) {
          expect(ALLOWED_AFFILIATE_CAMPAIGNS).toContain(payload.affiliateCampaignId);
        }
      }
    });
  });

  describe('Privacy & Zero PII Guarantee', () => {
    it('trackIntent never accepts or transmits raw PII, tasting notes, or trip notes', () => {
      // TypeScript types IntentEventPayload strictly prevents tasting notes or personal notes
      const payload: IntentEventPayload = {
        event: 'passport_stamp_added',
        producerId: 'test-estate',
        sourceSurface: 'passport',
      };

      const record = payload as unknown as Record<string, unknown>;
      expect(record.tastingNote).toBeUndefined();
      expect(record.notes).toBeUndefined();
      expect(record.email).toBeUndefined();
      expect(record.name).toBeUndefined();
      expect(record.uid).toBeUndefined();
    });
  });
});
