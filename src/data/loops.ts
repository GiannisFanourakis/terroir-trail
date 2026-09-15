import { DayTripLoop, Producer } from '../types/terroir';
import { SANTORINI_DISCOVERY_GUIDES } from './santoriniGuides';
import { PHASE10B_DISCOVERY_GUIDES } from './phase10bGuides';

export const CURATED_ROUTES: DayTripLoop[] = [
  {
    id: 'heraklion-grand-terroir-trail',
    title: 'Heraklion Wine Country: Peza, Alagni & Kounavoi',
    greekTitle: 'Οινοποιεία Ηρακλείου: Πεζά, Αλάγνι & Κουνάβοι',
    subtitle: 'Melesses · Alagni · Kounavoi',
    destination: 'crete',
    region: 'Heraklion Wine Country',
    totalDuration: 'Flexible half-day',
    drivingDistance: 'Driving distance pending access audit',
    stops: [
      {
        producerId: 'domaine-paterianakis',
        suggestedTime: 'Morning',
        activity: 'Visit Domaine Paterianakis in Melesses during its published visitor season. Check current hours directly with the estate, especially outside the main season.'
      },
      {
        producerId: 'lyrarakis-winery',
        suggestedTime: 'Midday',
        activity: 'Visit the Lyrarakis tasting site in Alagni during its published seasonal hours. Outside the main season, arrange the visit directly with the winery.'
      },
      {
        producerId: 'kazani-stilianou',
        suggestedTime: 'Afternoon',
        activity: 'Visit Stilianou Winery in Kounavoi during its current published visiting hours. Winter visits require booking; check the producer page before travelling.'
      }
    ],
    description: 'A self-guided Heraklion wine-country sequence using three current TerroirTrail producers with verified locations. Use each producer page for current visiting details and direct contact. Multi-stop driving directions remain withheld because road-access classifications have not yet been independently verified.',
    highlightPointers: [
      'Three current producer locations verified by TerroirTrail sources',
      'Family-run wineries across Melesses, Alagni and Kounavoi',
      'Current visitor information and direct producer contact',
      'Multi-stop driving navigation withheld pending road-access verification'
    ],
    isVipOnly: false,
    verificationStatus: 'verified_stops',
  },
  {
    id: 'heraklion-west-slopes-trail',
    title: 'Dafnes & Siva: Two Family Wineries',
    greekTitle: 'Δαφνές & Σίβα: Δύο Οικογενειακά Οινοποιεία',
    subtitle: 'Dafnes · Siva',
    destination: 'crete',
    region: 'Heraklion West',
    totalDuration: 'Flexible half-day',
    drivingDistance: 'Driving distance pending access audit',
    stops: [
      {
        producerId: 'douloufakis-winery',
        suggestedTime: 'First stop',
        activity: 'Visit Douloufakis Winery in Dafnes for a pre-booked winery visit or tasting. Advance booking is required for visitor programs.'
      },
      {
        producerId: 'silva-daskalaki-winery',
        suggestedTime: 'Second stop',
        activity: 'Continue to Silva Daskalaki Winery in Siva. Winery visits and tastings require arrangements in advance; confirm your visit directly with the producer.'
      }
    ],
    description: 'A compact self-guided introduction to two family wineries west of Heraklion. Both producer locations are verified, but visits require advance arrangements and TerroirTrail does not yet classify the connecting road access for multi-stop driving navigation.',
    highlightPointers: [
      'Two current family wineries with verified locations',
      'Producer-managed visits that require advance arrangements',
      'Direct contact and current visit details on each producer page',
      'No implied road-surface or rental-car suitability claim'
    ],
    isVipOnly: false,
    verificationStatus: 'verified_stops',
  },
  {
    id: 'chania-craft-beer-olive-trail',
    title: 'Western Chania: Olive Oil, Craft Beer & Wine',
    greekTitle: 'Δυτικά Χανιά: Ελαιόλαδο, Μπίρα & Κρασί',
    subtitle: 'Astrikas · Zounaki · Vatolakkos',
    destination: 'crete',
    region: 'Western Chania',
    totalDuration: 'Flexible half-day',
    drivingDistance: 'Driving distance pending access audit',
    stops: [
      {
        producerId: 'biolea-estate',
        suggestedTime: 'Morning',
        activity: 'Explore the Biolea Astrikas Estate. Guided olive-oil visits are offered by the producer; check current hours and booking availability before travel.'
      },
      {
        producerId: 'cretan-brewery-charma',
        suggestedTime: 'Afternoon',
        activity: 'Visit Cretan Brewery in Zounaki during its published visitor season. Check the brewery directly for current tour, tasting and restaurant hours.'
      },
      {
        producerId: 'manousakis-winery',
        suggestedTime: 'Late afternoon',
        activity: 'Visit Manousakis Winery in Vatolakkos for a booked tasting or tour. Confirm the current seasonal schedule and availability directly with the winery.'
      }
    ],
    description: 'A self-guided western Chania sequence using three current TerroirTrail stops with verified locations. Use each producer page for current visiting details and direct contact. Multi-stop driving directions remain withheld because road-access classifications for these stops are not yet independently verified.',
    highlightPointers: [
      'Three current catalogue stops with verified location or entrance points',
      'Olive oil, independent craft beer and wine in one western Chania guide',
      'Direct producer information for current hours and booking',
      'Multi-stop driving navigation intentionally withheld pending road-access verification'
    ],
    isVipOnly: false,
    verificationStatus: 'verified_stops',
  },
  {
    id: 'rethymno-melidoni-olive-oil-discovery',
    title: 'Rethymno: Melidoni Olive Oil Discovery',
    greekTitle: 'Ρέθυμνο: Ανακάλυψη Ελαιολάδου στο Μελιδόνι',
    subtitle: 'Melidoni',
    destination: 'crete',
    region: 'Rethymno',
    totalDuration: 'Flexible single stop',
    drivingDistance: 'Single-stop discovery — no multi-stop route',
    stops: [
      {
        producerId: 'parasiris-olive-mill',
        suggestedTime: 'Plan around current opening hours',
        activity: 'Visit the Paraschakis family olive oil factory in Melidoni, which publishes visitor access. Check current opening information directly with the producer before a special trip.'
      }
    ],
    description: 'A single-stop Rethymno discovery guide built from current verified evidence. The Paraschakis family olive-oil factory in Melidoni has a verified location and publishes visitor access. Tzourmpakis Dairy remains in the catalogue with a verified location, but is excluded from this guide because current ordinary visitor access is uncertain. No multi-stop route, road-surface claim or rental-car suitability claim is published.',
    highlightPointers: [
      'Verified Paraschakis family olive-oil factory location in Melidoni',
      'Current producer-published visitor access',
      'Tzourmpakis Dairy excluded until ordinary visitor access is clearly confirmed',
      'No multi-stop navigation or road-suitability claim'
    ],
    isVipOnly: false,
    verificationStatus: 'verified_stops',
  },
];

// Only audited guide collections are appended here. Legacy pre-audit marketing
// routes for Santorini and Phase 10B were removed rather than upgraded in place,
// so stale timing, tasting, distance and road claims cannot resurface.
CURATED_ROUTES.push(...SANTORINI_DISCOVERY_GUIDES);
CURATED_ROUTES.push(...PHASE10B_DISCOVERY_GUIDES);

// Backwards compatibility alias
export const CRETAN_DAY_TRIP_LOOPS = CURATED_ROUTES;

/**
 * Generates an official Google Maps universal multi-stop driving navigation URL.
 * Automatically opens turn-by-turn driving mode with all waypoints sequentially loaded
 * in the native Google Maps app (Android & iOS) or in browser tabs (desktop).
 *
 * @param loop The curated day trip route
 * @param producers All available producers to resolve coordinates from
 * @returns Google Maps directions URL string
 */
export function getGoogleMapsRouteUrl(loop: DayTripLoop, producers: Producer[]): string {
  const producerMap = new Map(producers.map((p) => [p.id, p]));
  const coordsList: string[] = [];

  for (const stop of loop.stops) {
    const producer = producerMap.get(stop.producerId);
    if (producer && producer.coordinates && producer.coordinates.length === 2) {
      const [lat, lng] = producer.coordinates;
      if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
        coordsList.push(`${lat},${lng}`);
      }
    }
  }

  if (coordsList.length === 0) return '';
  if (coordsList.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${coordsList[0]}`;
  }

  const origin = coordsList[0];
  const destination = coordsList[coordsList.length - 1];
  const waypoints = coordsList.slice(1, -1).join('|');

  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
  if (waypoints) {
    url += `&waypoints=${waypoints}`;
  }
  return url;
}
