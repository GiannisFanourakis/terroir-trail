import { describe, expect, it } from 'vitest';
import { CURATED_ROUTES } from './loops';
import { PHASE10B_DISCOVERY_GUIDES } from './phase10bGuides';
import { PHASE10B_PRODUCERS } from './phase10bProducers';
import { evaluateRouteNavigation } from '../utils/routeSafety';

const PUBLISHABLE_VISIT_STATES = new Set([
  'public_visits',
  'seasonal_public',
  'appointment_only',
]);

const LEGACY_PHASE10B_ROUTE_IDS = [
  'peloponnese-mythic-trail',
  'northern-greece-royal-trail',
  'tuscany-chianti-classico-trail',
];

describe('Phase 10B discovery guides', () => {
  it('publishes one audited discovery guide for each Phase 10B destination', () => {
    expect(PHASE10B_DISCOVERY_GUIDES).toHaveLength(3);
    expect(PHASE10B_DISCOVERY_GUIDES.map((guide) => guide.destination)).toEqual([
      'peloponnese',
      'northern_greece',
      'tuscany',
    ]);
    expect(
      PHASE10B_DISCOVERY_GUIDES.every(
        (guide) => guide.verificationStatus === 'verified_stops'
      )
    ).toBe(true);
  });

  it('uses only verified locations with current publishable visitor states', () => {
    const producerMap = new Map(
      PHASE10B_PRODUCERS.map((producer) => [producer.id, producer])
    );

    for (const guide of PHASE10B_DISCOVERY_GUIDES) {
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

  it('keeps multi-stop navigation fail-closed for every Phase 10B guide', () => {
    for (const guide of PHASE10B_DISCOVERY_GUIDES) {
      const evaluation = evaluateRouteNavigation(guide, PHASE10B_PRODUCERS);
      expect(evaluation.isSafe).toBe(false);
      expect(evaluation.url).toBeUndefined();
      expect(evaluation.issues.length).toBeGreaterThan(0);
    }
  });

  it('keeps the Tuscany scope honest as one audited discovery stop', () => {
    const tuscany = PHASE10B_DISCOVERY_GUIDES.find(
      (guide) => guide.destination === 'tuscany'
    );
    expect(tuscany?.stops.map((stop) => stop.producerId)).toEqual([
      'monteraponi-tuscany',
    ]);
    expect(tuscany?.drivingDistance).toContain('no multi-stop route');

    const monteraponi = PHASE10B_PRODUCERS.find(
      (producer) => producer.id === 'monteraponi-tuscany'
    );
    expect(monteraponi?.roadAccessStatus).toBe('verified');
    expect(monteraponi?.roadAccess).toBe('unpaved_passable');
  });

  it('does not publish producers whose ordinary visitor access is unconfirmed', () => {
    const publishedStopIds = new Set(
      PHASE10B_DISCOVERY_GUIDES.flatMap((guide) =>
        guide.stops.map((stop) => stop.producerId)
      )
    );

    for (const producerId of [
      'domaine-karanika',
      'thymiopoulos-naoussa',
      'propator-sknipa-brewery',
      'liokareas-olive-estate',
      'skouras-winery-nemea',
    ]) {
      expect(publishedStopIds.has(producerId), producerId).toBe(false);
    }
  });

  it('removes the three pre-audit Phase 10B marketing routes entirely', () => {
    for (const legacyId of LEGACY_PHASE10B_ROUTE_IDS) {
      expect(CURATED_ROUTES.some((guide) => guide.id === legacyId)).toBe(false);
    }

    const publishablePhase10b = CURATED_ROUTES.filter(
      (guide) =>
        ['peloponnese', 'northern_greece', 'tuscany'].includes(guide.destination) &&
        (guide.verificationStatus === 'verified_stops' ||
          guide.verificationStatus === 'verified')
    );

    expect(publishablePhase10b.map((guide) => guide.id)).toEqual(
      PHASE10B_DISCOVERY_GUIDES.map((guide) => guide.id)
    );
  });
});
