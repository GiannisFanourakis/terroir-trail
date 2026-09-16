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

const AUDITED_GOOGLE_PLACE_PRODUCERS = [
  ...CRETAN_PRODUCERS,
  ...SANTORINI_PRODUCERS,
  ...PHASE10B_PRODUCERS,
];

/**
 * Phase 13 dairies with independently matched, persistent Google Place IDs in
 * live Supabase. These entries extend the same explicit media trust gate used
 * by the bundled regional catalogues; they do not assert public access or road
 * conditions.
 */
const PHASE13_DAIRY_GOOGLE_PLACE_ITEMS: readonly GooglePlacesAllowlistEntry[] =
  Object.freeze([
    {
      producerId: 'stamatogiorgis-dairy-smari',
      name: 'Stamatogiorgis Dairy',
      category: 'cheese_dairy',
      coordinates: [35.237247, 25.3152673],
    },
    {
      producerId: 'elatos-kapetanou-schinochori',
      name: 'ELATOS / Kapetanou Bros',
      category: 'cheese_dairy',
      coordinates: [37.6787461, 22.6540322],
    },
    {
      producerId: 'arvanitis-dairy-neochorouda',
      name: 'Arvanitis Dairy',
      category: 'cheese_dairy',
      coordinates: [40.7091636, 22.8796043],
    },
    {
      producerId: 'baladinos-dairy-varipetro',
      name: 'Baladinos & Sons',
      category: 'cheese_dairy',
      coordinates: [35.5133795, 24.0162928],
    },
    {
      producerId: 'christakis-patria-feta-proastio',
      name: 'Christakis / Patria Feta',
      category: 'cheese_dairy',
      coordinates: [40.783506, 22.060069],
    },
    {
      producerId: 'psiloritis-cheese-dairy-livadia',
      name: 'Psiloritis Cheese Dairy',
      category: 'cheese_dairy',
      coordinates: [35.3038706, 24.8093411],
    },
  ]);

/**
 * Eligibility comes only from manually audited producer records.
 * A verified persistent Google Place ID and verified TT location are required.
 * The regional snapshots supply the established catalogue; Phase 13 dairies
 * are added above only after their Place identity is independently matched and
 * persisted in Supabase.
 *
 * A producer-owned shop can be an eligible public point only when the underlying
 * catalogue entity is itself a qualified producer; generic retailers are never
 * added to this list merely because they sell local products.
 */
export const GOOGLE_PLACES_PROTOTYPE_ITEMS: readonly GooglePlacesAllowlistEntry[] =
  Object.freeze([
    ...AUDITED_GOOGLE_PLACE_PRODUCERS.filter(
      (producer) =>
        Boolean(producer.googlePlaceId?.trim()) &&
        (producer.locationStatus === 'verified_location' ||
          producer.locationStatus === 'verified_entrance')
    ).map((producer) => ({
      producerId: producer.id,
      name: producer.name,
      category: producer.category,
      coordinates: producer.coordinates,
    })),
    ...PHASE13_DAIRY_GOOGLE_PLACE_ITEMS,
  ]);

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
