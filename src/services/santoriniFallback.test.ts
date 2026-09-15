import { describe, expect, it } from 'vitest';
import { SANTORINI_PRODUCERS } from '../data/santoriniProducers';
import {
  GOOGLE_PLACES_PROTOTYPE_ALLOWLIST,
  isGooglePlacesEligible,
} from '../config/googlePlacesAllowlist';

const EXPECTED_PLACE_IDS: Record<string, string> = {
  'canava-santorini-distillery': 'ChIJ5YMrxW_OmRQRk0po0X3EDuM',
  'domaine-sigalas-santorini': 'ChIJu7u3b4DLmRQRpxve6-VHUd0',
  'estate-argyros-santorini': 'ChIJD8Ll3xfOmRQRDhaOcljaawQ',
  'gaia-wines-santorini': 'ChIJxwtdmPDRmRQRvv2sLef21bU',
  'gavalas-winery-santorini': 'ChIJtTl4tVbOmRQR3jJOJZ5Hrac',
  'santo-wines-santorini': 'ChIJFbhZ3F7OmRQReOlBpwauSzg',
  'santorini-brewing-company': 'ChIJ30mo9xjOmRQRSFZDLJsvVy4',
  'vassaltis-vineyards': 'ChIJVX4lYq_NmRQR1_VKq8vhjd8',
  'venetsanos-winery-santorini': 'ChIJTy6LeFnOmRQRkX31v9sqMWo',
};

describe('Phase 10A Santorini fallback integrity', () => {
  it('contains exactly the nine audited Santorini records', () => {
    expect(SANTORINI_PRODUCERS).toHaveLength(9);
    expect(
      SANTORINI_PRODUCERS.every(
        (producer) => producer.destination === 'santorini'
      )
    ).toBe(true);
  });

  it('does not resurrect legacy synthetic trust or commercial fields', () => {
    for (const producer of SANTORINI_PRODUCERS) {
      expect(producer.coverImage, producer.id).toBe('');
      expect(producer.gallery, producer.id).toEqual([]);
      expect(producer.rating, producer.id).toBeUndefined();
      expect(producer.reviewCount, producer.id).toBeUndefined();
      expect(producer.priceLevel, producer.id).toBeUndefined();
      expect(producer.foodOption, producer.id).toBeUndefined();
      expect(producer.dogFriendly, producer.id).toBeUndefined();
      expect(producer.kidFriendly, producer.id).toBeUndefined();
      expect(producer.walkInFriendly, producer.id).toBeUndefined();
      expect(producer.campervanFriendly, producer.id).toBeUndefined();
      expect(producer.vipPerks, producer.id).toBeUndefined();
      expect(producer.tastingHighlights, producer.id).toEqual([]);
    }
  });

  it('keeps road access fail-closed for every Santorini record', () => {
    for (const producer of SANTORINI_PRODUCERS) {
      expect(producer.roadAccess, producer.id).toBeUndefined();
      expect(producer.roadAccessStatus, producer.id).toBe(
        'not_publicly_confirmed'
      );
    }
  });

  it('preserves all manually verified Google Place IDs and imagery eligibility', () => {
    for (const [producerId, placeId] of Object.entries(EXPECTED_PLACE_IDS)) {
      const producer = SANTORINI_PRODUCERS.find(
        (item) => item.id === producerId
      );
      expect(producer, producerId).toBeDefined();
      expect(producer?.googlePlaceId, producerId).toBe(placeId);
      expect(producer?.locationStatus, producerId).toBe('verified_location');
      expect(isGooglePlacesEligible(producerId), producerId).toBe(true);
      expect(GOOGLE_PLACES_PROTOTYPE_ALLOWLIST, producerId).toContain(
        producerId
      );
    }
  });

  it('keeps visitability conservative and distinct from location verification', () => {
    expect(
      SANTORINI_PRODUCERS.find(
        (producer) => producer.id === 'canava-santorini-distillery'
      )?.visitStatus
    ).toBe('not_publicly_confirmed');

    expect(
      SANTORINI_PRODUCERS.find(
        (producer) => producer.id === 'domaine-sigalas-santorini'
      )?.visitStatus
    ).toBe('appointment_only');

    expect(
      SANTORINI_PRODUCERS.find(
        (producer) => producer.id === 'gaia-wines-santorini'
      )?.visitStatus
    ).toBe('seasonal_public');
  });
});
