import { DayTripLoop } from '../types/terroir';

/**
 * Phase 10A Santorini discovery guides.
 *
 * These are discovery collections, not road-safety promises. Every published stop
 * has a manually verified Google business location and a reviewed visitor status.
 * Multi-stop driving navigation remains fail-closed until every stop has an
 * independently verified road-access classification.
 *
 * Canava Santorini Distillery is intentionally excluded while current visitor
 * access remains not publicly confirmed from a sufficiently current
 * producer-controlled visitor source.
 */
export const SANTORINI_DISCOVERY_GUIDES: DayTripLoop[] = [
  {
    id: 'santorini-north-wine-country',
    title: 'Oia & Vourvoulos: Northern Santorini Wine Country',
    greekTitle: 'Οία & Βουρβούλος: Οινοποιεία Βόρειας Σαντορίνης',
    subtitle: 'Baxes, Oia · Vourvoulos',
    destination: 'santorini',
    region: 'Santorini North',
    totalDuration: 'Flexible half-day',
    drivingDistance: 'Driving distance pending access audit',
    stops: [
      {
        producerId: 'domaine-sigalas-santorini',
        suggestedTime: 'Book first',
        activity:
          'Domaine Sigalas in Baxes, Oia requires advance booking for every visit. Use the producer page to confirm the current seasonal timetable and reserve directly with the estate.',
      },
      {
        producerId: 'vassaltis-vineyards',
        suggestedTime: 'Second stop',
        activity:
          'Vassaltis Vineyards in Vourvoulos publishes wine experiences and an online reservation flow. Check current availability before travelling rather than assuming unrestricted walk-in space.',
      },
    ],
    description:
      'A northern Santorini discovery guide linking two verified winery locations with current producer-managed visitor programs. It is a stop collection rather than a guaranteed driving route: each visit should be arranged independently and multi-stop navigation remains withheld while road-access classifications are unconfirmed.',
    highlightPointers: [
      'Two manually verified producer locations in northern Santorini',
      'Advance booking required at Domaine Sigalas',
      'Producer-managed reservation options at Vassaltis Vineyards',
      'No implied road-surface or rental-car suitability claim',
    ],
    isVipOnly: false,
    verificationStatus: 'verified_stops',
  },
  {
    id: 'santorini-east-producer-discovery',
    title: 'Episkopi & East Coast: Estate Wine, Craft Beer & Seaside Assyrtiko',
    greekTitle: 'Επισκοπή & Ανατολική Σαντορίνη: Κρασί, Μπίρα & Ασύρτικο',
    subtitle: 'Episkopi Gonia · Mesa Gonia · Vrachies, Exo Gonia',
    destination: 'santorini',
    region: 'Santorini East',
    totalDuration: 'Flexible half-day',
    drivingDistance: 'Driving distance pending access audit',
    stops: [
      {
        producerId: 'estate-argyros-santorini',
        suggestedTime: 'First stop',
        activity:
          'Estate Argyros welcomes visitors year-round except national holidays. Reservations are recommended because tour schedules vary by day and season; check the producer booking system before travel.',
      },
      {
        producerId: 'santorini-brewing-company',
        suggestedTime: 'Craft-beer stop',
        activity:
          'Santorini Brewing Company welcomes visitors to its Mesa Gonia tasting area. Check current opening hours before arrival; the brewery asks larger groups to arrange their visit in advance.',
      },
      {
        producerId: 'gaia-wines-santorini',
        suggestedTime: 'Seasonal stop',
        activity:
          'GAIA Wines operates its Santorini visitor program seasonally at Vrachies of Exo Gonia. For 2026 it publishes daily visiting from 29 April through 31 October and recommends advance online booking.',
      },
    ],
    description:
      'A mixed-producer discovery guide across Santorini’s central-eastern side using three verified locations with current visitor information: a historic wine estate, the island microbrewery and GAIA’s seasonal seaside winery. Stop order is for discovery only; multi-stop driving guidance remains disabled pending independent road-access verification.',
    highlightPointers: [
      'Wine and independent craft beer in one verified producer guide',
      'Year-round visitor service at Estate Argyros, subject to tour availability',
      'Seasonal visitor program at GAIA Wines',
      'Multi-stop driving navigation intentionally withheld',
    ],
    isVipOnly: false,
    verificationStatus: 'verified_stops',
  },
  {
    id: 'santorini-caldera-wine-discovery',
    title: 'Megalochori & Pyrgos: Family Cellars and Caldera Wine',
    greekTitle: 'Μεγαλοχώρι & Πύργος: Οικογενειακά Οινοποιεία & Καλντέρα',
    subtitle: 'Megalochori · Pyrgos · Caldera Megalochori',
    destination: 'santorini',
    region: 'Santorini Caldera',
    totalDuration: 'Flexible half-day',
    drivingDistance: 'Driving distance pending access audit',
    stops: [
      {
        producerId: 'gavalas-winery-santorini',
        suggestedTime: 'Seasonal stop',
        activity:
          'Gavalas Winery in Megalochori publishes winery tours and tastings from April through October. Confirm current availability directly with the winery before planning the visit.',
      },
      {
        producerId: 'santo-wines-santorini',
        suggestedTime: 'Year-round stop',
        activity:
          'Santo Wines operates its Wine Tourism Center in Pyrgos year-round, with winery tours, tastings and other visitor services. Check the official site for current service hours and booking requirements.',
      },
      {
        producerId: 'venetsanos-winery-santorini',
        suggestedTime: 'Caldera stop',
        activity:
          'Venetsanos Winery operates public tours and tastings above Athinios. The winery recommends reservations because it is often fully booked; consult its current opening hours before travel.',
      },
    ],
    description:
      'A south-caldera discovery guide connecting three verified winery locations with current public visitor programs in Megalochori and Pyrgos. The guide highlights producer history and visiting options without treating the sequence as a road-safety recommendation; multi-stop navigation remains withheld until access evidence is sufficient.',
    highlightPointers: [
      'Traditional family winery visit in Megalochori',
      'Year-round cooperative Wine Tourism Center in Pyrgos',
      'Historic gravity-designed Venetsanos winery above Athinios',
      'Road conditions remain explicitly unclassified',
    ],
    isVipOnly: false,
    verificationStatus: 'verified_stops',
  },
];
