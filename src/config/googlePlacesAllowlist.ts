import { Category } from '../types/terroir';
import { CRETAN_PRODUCERS } from '../data/producers';

export interface GooglePlacesAllowlistEntry {
  producerId: string;
  name: string;
  category: Category;
  coordinates: [number, number];
}

/**
 * Eligibility comes from the manually audited Crete catalogue.
 * A verified persistent Google Place ID and verified TT location are required.
 */
export const GOOGLE_PLACES_PROTOTYPE_ITEMS: readonly GooglePlacesAllowlistEntry[] =
  Object.freeze(
    CRETAN_PRODUCERS.filter(
      (producer) =>
        Boolean(producer.googlePlaceId?.trim()) &&
        (producer.locationStatus === 'verified_location' ||
          producer.locationStatus === 'verified_entrance')
    ).map((producer) => ({
      producerId: producer.id,
      name: producer.name,
      category: producer.category,
      coordinates: producer.coordinates,
    }))
  );

export const GOOGLE_PLACES_PROTOTYPE_ALLOWLIST = Object.freeze(
  GOOGLE_PLACES_PROTOTYPE_ITEMS.map((item) => item.producerId)
);

export type GooglePlacesAllowedProducerId =
  (typeof GOOGLE_PLACES_PROTOTYPE_ALLOWLIST)[number];

export function isGooglePlacesEligible(producerId: string): boolean {
  return (GOOGLE_PLACES_PROTOTYPE_ALLOWLIST as readonly string[]).includes(
    producerId
  );
}

export function getGooglePlacesPrototypeEntry(
  producerId: string
): GooglePlacesAllowlistEntry | undefined {
  return GOOGLE_PLACES_PROTOTYPE_ITEMS.find(
    (item) => item.producerId === producerId
  );
}
