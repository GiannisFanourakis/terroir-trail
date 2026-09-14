/**
 * Explicit prototype allow-list for Google Places UI Kit media exploration.
 *
 * Cost & Governance Rules:
 * - Only verified producers with authoritative coordinates are included.
 * - Discovery-only: Google imagery is NEVER downloaded, stored, or copied to TerroirTrail.
 * - This allow-list prevents unbounded Google Places API queries across the full catalogue.
 */
import { Category } from '../types/terroir';

export interface GooglePlacesAllowlistEntry {
  producerId: string;
  name: string;
  category: Category;
  coordinates: [number, number];
}

export const GOOGLE_PLACES_PROTOTYPE_ITEMS: readonly GooglePlacesAllowlistEntry[] =
  Object.freeze([
    {
      producerId: 'lyrarakis-winery',
      name: 'Lyrarakis Winery',
      category: 'winery' as const,
      coordinates: [35.183416, 25.176466] as [number, number],
    },
    {
      producerId: 'peskesi-farm-kazani',
      name: 'Peskesi Organic Farm',
      category: 'farm' as const,
      coordinates: [35.2751612, 25.2996351] as [number, number],
    },
    {
      producerId: 'cretan-brewery-charma',
      name: 'Cretan Brewery (Charma Beer)',
      category: 'brewery' as const,
      coordinates: [35.498877, 23.829094] as [number, number],
    },
    {
      producerId: 'biolea-estate',
      name: 'Biolea Estate',
      category: 'olive_mill' as const,
      coordinates: [35.474662, 23.771239] as [number, number],
    },
    {
      producerId: 'stathakis-honey-park',
      name: 'Stathakis Family Honey Park',
      category: 'apiary' as const,
      coordinates: [35.49502, 23.67018] as [number, number],
    },
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
