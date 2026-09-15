import { describe, expect, it } from 'vitest';
import { CURATED_ROUTES } from './loops';
import { CRETAN_PRODUCERS } from './producers';
import { evaluateRouteNavigation } from '../utils/routeSafety';

const PUBLISHABLE_VISIT_STATES = new Set([
  'public_visits',
  'seasonal_public',
  'appointment_only',
]);

const CRETE_GUIDE_IDS = [
  'heraklion-grand-terroir-trail',
  'heraklion-west-slopes-trail',
  'chania-craft-beer-olive-trail',
  'rethymno-melidoni-olive-oil-discovery',
];

describe('Crete discovery guides', () => {
  const publishedCreteGuides = CURATED_ROUTES.filter(
    (guide) =>
      guide.destination === 'crete' && guide.verificationStatus === 'verified_stops'
  );

  it('publishes the four audited Crete discovery guides', () => {
    expect(publishedCreteGuides.map((guide) => guide.id)).toEqual(CRETE_GUIDE_IDS);
  });

  it('uses only verified locations with current publishable visitor states', () => {
    const producerMap = new Map(
      CRETAN_PRODUCERS.map((producer) => [producer.id, producer])
    );

    for (const guide of publishedCreteGuides) {
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

  it('keeps Crete multi-stop navigation fail-closed', () => {
    for (const guide of publishedCreteGuides) {
      const evaluation = evaluateRouteNavigation(guide, CRETAN_PRODUCERS);
      expect(evaluation.isSafe, guide.id).toBe(false);
      expect(evaluation.url, guide.id).toBeUndefined();
      expect(evaluation.issues.length, guide.id).toBeGreaterThan(0);
    }
  });

  it('publishes Rethymno honestly as one confirmed visitor stop', () => {
    const rethymno = publishedCreteGuides.find(
      (guide) => guide.id === 'rethymno-melidoni-olive-oil-discovery'
    );

    expect(rethymno?.stops.map((stop) => stop.producerId)).toEqual([
      'parasiris-olive-mill',
    ]);
    expect(rethymno?.drivingDistance).toContain('no multi-stop route');

    const paraschakis = CRETAN_PRODUCERS.find(
      (producer) => producer.id === 'parasiris-olive-mill'
    );
    expect(paraschakis?.locationStatus).toBe('verified_location');
    expect(paraschakis?.visitStatus).toBe('public_visits');
    expect(paraschakis?.roadAccessStatus).toBe('not_publicly_confirmed');
  });

  it('does not promote Tzourmpakis while ordinary visitor access is uncertain', () => {
    const publishedStopIds = new Set(
      publishedCreteGuides.flatMap((guide) =>
        guide.stops.map((stop) => stop.producerId)
      )
    );

    expect(publishedStopIds.has('tzourmpakis-dairy-amari')).toBe(false);

    const tzourmpakis = CRETAN_PRODUCERS.find(
      (producer) => producer.id === 'tzourmpakis-dairy-amari'
    );
    expect(tzourmpakis?.locationStatus).toBe('verified_location');
    expect(tzourmpakis?.visitStatus).toBe('current_access_uncertain');
  });
});
