import { Producer } from '../types/terroir';
import { CRETAN_PRODUCERS } from './producers';
import { SANTORINI_PRODUCERS } from './santoriniProducers';
import { PHASE10B_PRODUCERS } from './phase10bProducers';
import { PHASE13_DAIRY_PRODUCERS } from './phase13DairyProducers';
import { enrichPhase13DairyProducer } from './phase13DairyContentOverrides';

/**
 * Keep post-import, independently audited Google identity fixes in parity with
 * live Supabase without weakening the Google Places eligibility rules.
 */
function syncAuditedPhase13Media(producer: Producer): Producer {
  const enriched = enrichPhase13DairyProducer(producer);

  if (enriched.id === 'argogal-koromichi-kefalari') {
    const googlePlaceId = 'ChIJA4BioIz8nxQRZCVKZG8kO3I';
    const coordinates: [number, number] = [37.5904969, 22.7115766];
    const googleMapsUrl =
      `https://www.google.com/maps/search/?api=1&query=ARGOGAL%20Kefalari%20Argos&query_place_id=${googlePlaceId}`;

    return {
      ...enriched,
      coordinates,
      googlePlaceId,
      googleMapsUrl,
      locationSourceUrl: 'https://www.argogal.gr/en/contact',
      locationNotes:
        'Producer-controlled ARGOGAL contact page links directly to the Google Maps business point for Andrea Koromichi Sons / ARGOGAL in Kefalari, Argos. The linked Google feature resolves to the persistent Place ID ChIJA4BioIz8nxQRZCVKZG8kO3I at 37.5904969, 22.7115766. This verifies the production-business location, not a specific visitor entrance.',
    };
  }

  if (enriched.id === 'psiloritis-cheese-dairy-livadia') {
    const googlePlaceId = 'ChIJIZTR0koHmxQRQqWZvFNSOGU';
    const googleMapsUrl =
      `https://www.google.com/maps/search/?api=1&query=35.3038706%2C24.8093411&query_place_id=${googlePlaceId}`;

    return {
      ...enriched,
      googlePlaceId,
      googleMapsUrl,
      locationSourceUrl: googleMapsUrl,
    };
  }

  return enriched;
}

/**
 * Canonical bundled fallback / static-generation catalogue.
 *
 * Live Supabase remains authoritative at runtime when configured. This bundle is
 * kept in parity for offline fallback, SEO/AEO generation and deterministic CI.
 */
export const AUDITED_PRODUCERS: Producer[] = [
  ...CRETAN_PRODUCERS,
  ...SANTORINI_PRODUCERS,
  ...PHASE10B_PRODUCERS,
  ...PHASE13_DAIRY_PRODUCERS.map(syncAuditedPhase13Media),
];
