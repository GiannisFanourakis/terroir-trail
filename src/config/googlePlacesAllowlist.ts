import { Category } from '../types/terroir';
import { CRETAN_PRODUCERS } from '../data/producers';
import { SANTORINI_PRODUCERS } from '../data/santoriniProducers';
import { PHASE10B_PRODUCERS } from '../data/phase10bProducers';

export interface GooglePlacesAllowlistEntry {
  producerId: string;
  name: string;
  category: Category;
  coordinates: [number, number];
}

export interface GooglePlacesEligibilityCandidate {
  id: string;
  googlePlaceId?: string | null;
  locationStatus?: string | null;
}

const AUDITED_GOOGLE_PLACE_PRODUCERS = [
  ...CRETAN_PRODUCERS,
  ...SANTORINI_PRODUCERS,
  ...PHASE10B_PRODUCERS,
];

/**
 * The static catalogue remains the compatibility allowlist for bundled producer
 * records. Live Supabase producers can also be eligible when the persisted
 * producer record itself carries both a manually audited persistent Google Place
 * ID and a verified TerroirTrail location status.
 *
 * Coordinates are never used as a fallback lookup. A producer-owned shop can be
 * an eligible public point only when the underlying producer record has already
 * passed the location/entity audit; generic retailers are never made eligible
 * merely because they sell local products.
 */
export const GOOGLE_PLACES_PROTOTYPE_ITEMS: readonly GooglePlacesAllowlistEntry[] =
  Object.freeze(
    AUDITED_GOOGLE_PLACE_PRODUCERS.filter(
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

export function isGooglePlacesEligible(
  candidate: string | GooglePlacesEligibilityCandidate
): boolean {
  if (typeof candidate === 'string') {
    return (GOOGLE_PLACES_PROTOTYPE_ALLOWLIST as readonly string[]).includes(
      candidate
    );
  }

  const hasPersistentPlaceId = Boolean(candidate.googlePlaceId?.trim());
  const hasVerifiedLocation =
    candidate.locationStatus === 'verified_location' ||
    candidate.locationStatus === 'verified_entrance';

  return hasPersistentPlaceId && hasVerifiedLocation;
}

export function getGooglePlacesPrototypeEntry(
  producerId: string
): GooglePlacesAllowlistEntry | undefined {
  return GOOGLE_PLACES_PROTOTYPE_ITEMS.find(
    (item) => item.producerId === producerId
  );
}
