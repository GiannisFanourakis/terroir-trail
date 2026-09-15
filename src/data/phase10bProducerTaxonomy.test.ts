import { describe, expect, it } from 'vitest';
import { PHASE10B_PRODUCERS } from './phase10bProducers';
import { isGooglePlacesEligible } from '../config/googlePlacesAllowlist';

describe('Phase 10B producer taxonomy', () => {
  it('keeps the merged regional fallback at the audited 19-record inventory', () => {
    expect(PHASE10B_PRODUCERS).toHaveLength(19);
    expect(PHASE10B_PRODUCERS.filter((p) => p.destination === 'peloponnese')).toHaveLength(9);
    expect(PHASE10B_PRODUCERS.filter((p) => p.destination === 'northern_greece')).toHaveLength(9);
    expect(PHASE10B_PRODUCERS.filter((p) => p.destination === 'tuscany')).toHaveLength(1);
  });

  it('models Liokareas as a producer with a producer-owned shop public point', () => {
    const liokareas = PHASE10B_PRODUCERS.find((p) => p.id === 'liokareas-olive-estate');

    expect(liokareas).toBeDefined();
    expect(liokareas?.name).toBe('Liokareas');
    expect(liokareas?.category).toBe('olive_oil_producer');
    expect(liokareas?.publicPointType).toBe('producer_shop');
    expect(liokareas?.locationStatus).toBe('verified_location');
    expect(liokareas?.visitStatus).toBe('not_publicly_confirmed');
    expect(liokareas?.roadAccessStatus).toBe('not_publicly_confirmed');
    expect(liokareas?.roadAccess).toBeUndefined();
    expect(liokareas?.googlePlaceId).toBe('ChIJhUj2fKPpYRMRLPwSoXMbgBM');
    expect(liokareas?.coordinates).toEqual([36.7821875, 22.3396875]);
    expect(isGooglePlacesEligible('liokareas-olive-estate')).toBe(true);
  });

  it('persists the audited Phase 10B Google Place identities', () => {
    const expected = new Map([
      ['monemvasia-winery', 'ChIJwU0GkC4-nhQRlcJGAJ6fbWk'],
      ['propator-sknipa-brewery', 'ChIJHSyH3VFAqBQRdF-4PVdW8f8'],
      ['alpha-estate', 'ChIJq_TNZHdzVxMRrY3Giv0bikM'],
      ['ktima-pavlidis', 'ChIJiVyvYCBYqRQRgo04TZknytU'],
      ['siris-craft-brewery', 'ChIJb5JrTlRRqRQRk35ZlaAr9Yo'],
      ['thymiopoulos-naoussa', 'ChIJS3in-tOTVxMRPLSA3w4amOQ'],
      ['domaine-biblia-chora', 'ChIJh9l_wOcwqRQRtzn_AKprzo8'],
      ['domaine-karanika', 'ChIJX9l0oa5xVxMRglPJ5KpuwkU'],
      ['gaia-wines-nemea', 'ChIJ2a11wv8GoBQR1Nhkz3BBHp8'],
    ]);

    for (const [producerId, placeId] of expected) {
      const producer = PHASE10B_PRODUCERS.find((item) => item.id === producerId);
      expect(producer?.googlePlaceId).toBe(placeId);
      expect(['verified_location', 'verified_entrance']).toContain(
        producer?.locationStatus
      );
      expect(isGooglePlacesEligible(producerId)).toBe(true);
    }
  });

  it('does not turn producer-owned shop points into shop catalogue categories', () => {
    const shopPoints = PHASE10B_PRODUCERS.filter(
      (producer) => producer.publicPointType === 'producer_shop'
    );

    expect(shopPoints).toHaveLength(1);
    expect(shopPoints[0]?.category).toBe('olive_oil_producer');
    expect(shopPoints[0]?.visitStatus).not.toBe('public_visits');
  });

  it('exposes only independently verified Phase 10B road classifications', () => {
    const expectedVerifiedRoads = new Map<string, string>([
      ['tetramythos-winery', 'narrow_paved'],
      ['ktima-tselepos', 'paved'],
      ['siris-craft-brewery', 'paved'],
      ['monemvasia-winery', 'paved'],
      ['propator-sknipa-brewery', 'paved'],
      ['monteraponi-tuscany', 'unpaved_passable'],
    ]);

    const verified = PHASE10B_PRODUCERS.filter(
      (producer) => producer.roadAccessStatus === 'verified'
    );
    expect(verified).toHaveLength(6);

    const reviewedUnknown = PHASE10B_PRODUCERS.filter(
      (producer) => producer.roadAccessStatus === 'not_publicly_confirmed'
    );
    expect(reviewedUnknown).toHaveLength(13);

    for (const producer of PHASE10B_PRODUCERS) {
      const expectedRoad = expectedVerifiedRoads.get(producer.id);
      if (expectedRoad) {
        expect(producer.roadAccess).toBe(expectedRoad);
        expect(producer.roadAccessStatus).toBe('verified');
        expect(producer.roadAccessSourceUrl).toBeTruthy();
        expect(producer.roadAccessNotes).toBeTruthy();
      } else {
        expect(producer.roadAccess).toBeUndefined();
        expect(producer.roadAccessStatus).toBe('not_publicly_confirmed');
        expect(producer.roadAccessNotes).toBeTruthy();
      }
    }

    expect(
      PHASE10B_PRODUCERS.find((producer) => producer.id === 'liokareas-olive-estate')
        ?.roadAccessStatus
    ).toBe('not_publicly_confirmed');
  });
});
