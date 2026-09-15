import { DayTripLoop } from '../types/terroir';

/**
 * Phase 10B discovery guides for Peloponnese, Northern Greece and Tuscany.
 *
 * These are verified-stop discovery collections, not road-safety guarantees.
 * Only producers with a verified public location and current, publishable
 * visitor evidence are included. Multi-stop driving navigation remains
 * fail-closed unless an entire guide later passes the stricter route-safety gate.
 */
export const PHASE10B_DISCOVERY_GUIDES: DayTripLoop[] = [
  {
    id: 'peloponnese-nemea-producer-discovery',
    title: 'Nemea: Two Verified Winery Visits',
    greekTitle: 'Νεμέα: Δύο Επαληθευμένες Επισκέψεις σε Οινοποιεία',
    subtitle: 'Koutsi, Nemea',
    destination: 'peloponnese',
    region: 'Nemea',
    totalDuration: 'Flexible — arrange each visit independently',
    drivingDistance: 'No verified multi-stop driving route',
    stops: [
      {
        producerId: 'gaia-wines-nemea',
        suggestedTime: 'Check current availability',
        activity:
          'GAIA Wines publishes a year-round visitor programme at its Nemea winery. Check the producer page for current opening details and booking availability before travelling.',
      },
      {
        producerId: 'semeli-estate-nemea',
        suggestedTime: 'Booking required',
        activity:
          'Semeli Estate publishes wine-tourism visits with advance booking required. Confirm the current operating day and reserve directly with the estate before travelling.',
      },
    ],
    description:
      'A Nemea discovery guide using two verified winery locations with current producer-controlled visitor information. The stops may be planned independently; TerroirTrail does not publish a combined driving route because suitable road-access evidence is not verified for the full sequence.',
    highlightPointers: [
      'Two verified producer locations in the Nemea area',
      'Current first-party visitor programmes at both estates',
      'Booking and opening details remain producer-controlled',
      'No road-surface or rental-car suitability claim',
    ],
    isVipOnly: false,
    verificationStatus: 'verified_stops',
  },
  {
    id: 'northern-greece-verified-winery-planner',
    title: 'Northern Greece: Verified Winery Visit Planner',
    greekTitle: 'Βόρεια Ελλάδα: Οδηγός Επαληθευμένων Επισκέψεων σε Οινοποιεία',
    subtitle: 'Epanomi · Naoussa · Amyndeon · Kokkinochori · Drama',
    destination: 'northern_greece',
    region: 'Northern Greece',
    totalDuration: 'Choose individual visits',
    drivingDistance: 'No regional driving route published',
    stops: [
      {
        producerId: 'ktima-gerovassiliou',
        suggestedTime: 'Choose independently',
        activity:
          'Ktima Gerovassiliou publishes public opening times for the estate and Wine Museum. Check the current schedule before travel; groups and school visits require advance booking.',
      },
      {
        producerId: 'kir-yianni-naoussa',
        suggestedTime: 'Reservation required',
        activity:
          'Kir-Yianni publishes a Naoussa visitor programme with reservations required. Confirm the current opening schedule and reserve directly with the estate.',
      },
      {
        producerId: 'alpha-estate',
        suggestedTime: 'Arrange in advance',
        activity:
          'Alpha Estate publishes visits upon request. Contact the estate or use its reservation channel before travelling to the Amyndeon property.',
      },
      {
        producerId: 'domaine-biblia-chora',
        suggestedTime: 'Arrange in advance',
        activity:
          'Domaine Biblia Chora publishes estate visits upon request on its current visitor page. Confirm the operating day and arrange the visit directly with the winery.',
      },
      {
        producerId: 'ktima-pavlidis',
        suggestedTime: 'Contact before travel',
        activity:
          'Ktima Pavlidis publishes visiting hours and asks visitors to communicate with the estate in advance. Confirm availability before travelling to the Drama property.',
      },
    ],
    description:
      'A regional planning collection of five Northern Greece wineries with verified locations and current first-party visitor evidence. This is deliberately not a same-day driving itinerary: choose stops independently, confirm each visit with the producer, and plan travel separately because TerroirTrail does not have sufficient verified road evidence for a combined regional route.',
    highlightPointers: [
      'Five verified producer locations with current visitor evidence',
      'Public and appointment-based visits are labelled separately',
      'Designed as a regional planner, not a same-day route',
      'Multi-stop driving navigation intentionally withheld',
    ],
    isVipOnly: false,
    verificationStatus: 'verified_stops',
  },
  {
    id: 'tuscany-monteraponi-discovery',
    title: 'Radda in Chianti: Monteraponi Discovery Stop',
    greekTitle: 'Radda in Chianti: Στάση Ανακάλυψης στο Monteraponi',
    subtitle: 'Radda in Chianti, Tuscany',
    destination: 'tuscany',
    region: 'Tuscany',
    totalDuration: 'Single producer visit — book ahead',
    drivingDistance: 'Single verified stop — no multi-stop route',
    stops: [
      {
        producerId: 'monteraponi-tuscany',
        suggestedTime: 'Advance booking required',
        activity:
          'Monteraponi publishes winery visits and tastings by advance booking. Confirm the current weekday schedule directly with the estate before travelling.',
      },
    ],
    description:
      'The current audited Tuscany catalogue contains one producer, so TerroirTrail presents Monteraponi as a single verified discovery stop rather than inventing a multi-stop Tuscany route. The approach is classified as passable unpaved access; that classification does not imply rental-car suitability, so check current conditions and your rental terms before driving.',
    highlightPointers: [
      'One audited Tuscany producer rather than an invented regional route',
      'Verified producer location and current appointment-based visitor programme',
      'Passable unpaved access does not imply rental-car suitability',
      'Future Tuscany guides require additional audited producers',
    ],
    isVipOnly: false,
    verificationStatus: 'verified_stops',
  },
];
