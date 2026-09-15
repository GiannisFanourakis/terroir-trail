import { describe, expect, it } from 'vitest';
import { CURATED_ROUTES } from './loops';
import { SANTORINI_DISCOVERY_GUIDES } from './santoriniGuides';
import { SANTORINI_PRODUCERS } from './santoriniProducers';
import { evaluateRouteNavigation } from '../utils/routeSafety';

const PUBLISHABLE_VISIT_STATES = new Set([
  'public_visits',
  'seasonal_public',
  'appointment_only',
]);

describe('Phase 10A — Santorini discovery guides', () => {
  it('publishes exactly three audited Santorini guides', () => {
    expect(SANTORINI_DISCOVERY_GUIDES).toHaveLength(3);
    expect(
      SANTORINI_DISCOVERY_GUIDES.every(
        (guide) =>
          guide.destination === 'santorini' &&
          guide.verificationStatus === 'verified_stops'
      )
    ).toBe(true);
  });

  it('uses only verified producer locations with publishable visitor states', () => {
    const producerMap = new Map(
      SANTORINI_PRODUCERS.map((producer) => [producer.id, producer])
    );

    for (const guide of SANTORINI_DISCOVERY_GUIDES) {
      for (const stop of guide.stops) {
        const producer = producerMap.get(stop.producerId);
        expect(producer, `${guide.id}:${stop.producerId}`).toBeDefined();
        expect(
          producer?.locationStatus === 'verified_location' ||
            producer?.locationStatus === 'verified_entrance',
          `${guide.id}:${stop.producerId}:location`
        ).toBe(true);
        expect(
          PUBLISHABLE_VISIT_STATES.has(producer?.visitStatus || ''),
          `${guide.id}:${stop.producerId}:visit`
        ).toBe(true);
      }
    }
  });

  it('keeps Canava out of published guides while visitor access is not publicly confirmed', () => {
    const publishedStopIds = new Set(
      SANTORINI_DISCOVERY_GUIDES.flatMap((guide) =>
        guide.stops.map((stop) => stop.producerId)
      )
    );

    expect(publishedStopIds.has('canava-santorini-distillery')).toBe(false);

    const canava = SANTORINI_PRODUCERS.find(
      (producer) => producer.id === 'canava-santorini-distillery'
    );
    expect(canava?.visitStatus).toBe('not_publicly_confirmed');
  });

  it('keeps road access unknown and multi-stop navigation fail-closed for every Santorini guide', () => {
    for (const producer of SANTORINI_PRODUCERS) {
      expect(producer.roadAccess).toBeUndefined();
      expect(producer.roadAccessStatus).toBe('not_publicly_confirmed');
    }

    for (const guide of SANTORINI_DISCOVERY_GUIDES) {
      expect(guide.drivingDistance).toBe('Driving distance pending access audit');
      const evaluation = evaluateRouteNavigation(guide, SANTORINI_PRODUCERS);
      expect(evaluation.isSafe).toBe(false);
      expect(evaluation.url).toBeUndefined();
      expect(evaluation.issues.length).toBeGreaterThan(0);
    }
  });

  it('removes the legacy pre-audit Santorini marketing route entirely', () => {
    expect(
      CURATED_ROUTES.some(
        (guide) => guide.id === 'santorini-volcanic-terroir'
      )
    ).toBe(false);

    const publishableSantorini = CURATED_ROUTES.filter(
      (guide) =>
        guide.destination === 'santorini' &&
        (guide.verificationStatus === 'verified_stops' ||
          guide.verificationStatus === 'verified')
    );

    expect(publishableSantorini.map((guide) => guide.id)).toEqual(
      SANTORINI_DISCOVERY_GUIDES.map((guide) => guide.id)
    );
  });
});
