import { DayTripLoop, Producer } from '../types/terroir';
import { SANTORINI_DISCOVERY_GUIDES } from './santoriniGuides';

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
    id: 'rethymno-mountain-cheese-mill-trail',
    title: 'Rethymno Producer Discovery: Olive Oil & Dairy',
    greekTitle: 'Ρέθυμνο: Ελαιόλαδο & Τυροκομία — Οδηγός Ανακάλυψης',
    subtitle: 'Melidoni · Mixorrouma',
    destination: 'crete',
    region: 'Rethymno',
    totalDuration: 'Planning guide — unpublished',
    drivingDistance: 'Driving distance pending access audit',
    stops: [
      {
        producerId: 'parasiris-olive-mill',
        suggestedTime: 'Verified public visitor stop',
        activity: 'The Paraschakis family olive oil factory in Melidoni publishes visitor access. Check the producer page for current opening information before travelling.'
      },
      {
        producerId: 'tzourmpakis-dairy-amari',
        suggestedTime: 'Location reference — confirm first',
        activity: 'The Tzourmpakis Dairy location in Mixorrouma is verified, but current visitor access is not clear enough to recommend a normal walk-in visit. Contact the producer directly before planning to go.'
      }
    ],
    description: 'A deliberately unpublished Rethymno discovery draft linking the public Paraschakis olive-oil factory in Melidoni with the verified Tzourmpakis Dairy location in Mixorrouma. Paraschakis publishes visitor access; Tzourmpakis does not currently publish clear enough walk-in access to recommend it as a normal visit. The draft remains hidden until that second stop gains sufficient visit evidence or is replaced by another verified Rethymno stop. Multi-stop driving navigation remains disabled independently because road access is not confirmed.',
    highlightPointers: [
      'Two current Rethymno catalogue locations with verified identities',
      'Public visitor information available for the Melidoni olive-oil stop',
      'Tzourmpakis Dairy retained only as a verified location reference until visitor access is clearer',
      'No multi-stop navigation, road-surface or rental-car suitability claim'
    ],
    isVipOnly: false,
    verificationStatus: 'draft',
  },
  {
    id: 'santorini-volcanic-terroir',
    title: 'Santorini Complete Volcanic Caldera & Donkey Beer Trail',
    greekTitle: 'Ηφαιστειακό Terroir, Αποστάγματα & Μπίρα Donkey Σαντορίνης',
    subtitle: '150-Yr Kouloura Vines, Volcanic Ales & Sunset Caldera Cellars',
    destination: 'santorini',
    region: 'Santorini',
    totalDuration: '5.0 hours',
    drivingDistance: '24 km (Paved island roads)',
    stops: [
      {
        producerId: 'domaine-sigalas-santorini',
        suggestedTime: '10:30 AM - 12:00 PM',
        activity: 'Walk through ungrafted basket vines (kouloura) on the Oia plains and taste bone-dry volcanic Assyrtiko.'
      },
      {
        producerId: 'vassaltis-vineyards',
        suggestedTime: '12:30 PM - 1:45 PM',
        activity: 'Contemporary architecture winery tasting mineral-rich Nassitis and barrel-aged Assyrtiko in Vourvoulos.'
      },
      {
        producerId: 'santorini-brewing-company',
        suggestedTime: '2:15 PM - 3:30 PM',
        activity: 'Taste Yellow, Red, and Crazy Donkey unpasteurized craft ales with local volcanic tomato fritters.'
      },
      {
        producerId: 'canava-santorini-distillery',
        suggestedTime: '3:45 PM - 4:45 PM',
        activity: 'Historic copper stills tour with saffron-infused Tsikoudia and traditional volcanic ouzo.'
      },
      {
        producerId: 'venetsanos-winery-santorini',
        suggestedTime: '5:00 PM - 6:30 PM (Sunset)',
        activity: 'Cliffside gravity cellars walk and sunset Nykteri tasting on the sheer edge of the Caldera.'
      }
    ],
    description: 'The definitive volcanic circuit across Santorini: from ungrafted basket vines in Oia to the famous Donkey craft ales, saffron distillates, and a front-row sunset tasting over the submerged volcano.',
    highlightPointers: [
      'Ancient basket vines (kouloura) unique to Santorini',
      'Fresh unpasteurized Donkey craft microbrews',
      'Handcrafted saffron-infused Tsikoudia in copper stills',
      'Unmatched panoramic sunset seat over the Caldera cliffs'
    ],
    isVipOnly: false,
  },
  {
    id: 'peloponnese-mythic-trail',
    title: 'Peloponnese Mythic Terroir: Blood of Hercules & High Arcadia',
    greekTitle: 'Μυθικό Terroir Πελοποννήσου: Αγιωργίτικο & Μοσχοφίλερο',
    subtitle: 'Nemea Limestone Hills (650m) to High Arcadia Sparkling',
    destination: 'peloponnese',
    region: 'Peloponnese',
    totalDuration: '6.0 hours',
    drivingDistance: '64 km (Scenic paved mountain pass)',
    stops: [
      {
        producerId: 'gaia-wines-nemea',
        suggestedTime: '10:30 AM - 12:00 PM',
        activity: 'Gravity-flow cellar tour in Koutsi and tasting velvety reserve Agiorgitiko with local cheeses.'
      },
      {
        producerId: 'skouras-winery-nemea',
        suggestedTime: '12:30 PM - 2:00 PM',
        activity: 'Tasting of the mythical "Megas Oenos" (Agiorgitiko & Cabernet) in contemporary art tasting galleries.'
      },
      {
        producerId: 'semeli-estate-nemea',
        suggestedTime: '2:30 PM - 3:45 PM',
        activity: 'High-altitude panoramic tasting (650m) overlooking the entire Nemean valley.'
      },
      {
        producerId: 'ktima-tselepos',
        suggestedTime: '4:15 PM - 5:30 PM',
        activity: 'Cold continental Mantinia plateau tasting of traditional method Amalia Brut sparkling and wild Moschofilero.'
      }
    ],
    description: 'A journey through mythical Greece. Experience Nemea, where Hercules slew the lion, through velvety deep reds, before crossing the mountain pass to the chilly Arcadia plateau for aromatic floral whites.',
    highlightPointers: [
      'Nemea ancient stadium and limestone hills',
      'The legendary "Megas Oenos" vertical library',
      'Champagne-method sparkling wine at 750m elevation'
    ],
    isVipOnly: false,
  },
  {
    id: 'northern-greece-royal-trail',
    title: 'Kingdom of Macedonia: Epanomi Malagousia & Naoussa Royal Xinomavro',
    greekTitle: 'Μακεδονία: Μαλαγουζιά Επανομής & Βασιλικό Ξινόμαυρο',
    subtitle: 'Sea-Breeze Revived Whites, Fresh Craft Brews & Mount Vermio Old Vines',
    destination: 'northern_greece',
    region: 'Macedonia',
    totalDuration: '6.0 hours',
    drivingDistance: '75 km (Highway & wine slopes)',
    stops: [
      {
        producerId: 'ktima-gerovassiliou',
        suggestedTime: '10:00 AM - 12:30 PM',
        activity: 'Tour the world-renowned corkscrew museum (2,600+ pieces) and taste the revived Malagousia facing Mount Olympus.'
      },
      {
        producerId: 'propator-sknipa-brewery',
        suggestedTime: '1:00 PM - 2:30 PM',
        activity: 'Sample unpasteurized, unfiltered Sknipa craft beers fresh from the tanks in Thermi.'
      },
      {
        producerId: 'thymiopoulos-naoussa',
        suggestedTime: '3:30 PM - 5:00 PM',
        activity: 'Biodynamic vineyard walk and tasting of "Earth and Sky" natural Xinomavro straight from old oak casks.'
      },
      {
        producerId: 'kir-yianni-naoussa',
        suggestedTime: '5:15 PM - 6:30 PM',
        activity: 'High-elevation vineyard stroll facing Mount Vermio tasting legendary single-vineyard Ramnista.'
      }
    ],
    description: 'Northern Greece is the land of Alexander the Great and Dionysian mystery. This route pairs the world’s benchmark aromatic Malagousia and craft brews with the legendary structured Xinomavro of Naoussa.',
    highlightPointers: [
      'The world’s premier private corkscrew museum (2,600+ pieces)',
      'Mount Olympus panoramic sea-view terraces',
      'Biodynamic century-old Xinomavro vines in Naoussa'
    ],
    isVipOnly: false,
  },
  {
    id: 'tuscany-chianti-classico-trail',
    title: 'Tuscany Chianti Classico: Cypress Hills & Organic Sangiovese',
    greekTitle: 'Κλασικό Κιάντι Τοσκάνης: Βιολογικό Sangiovese',
    subtitle: '10th-Century Stone Watchtower & High-Altitude Terraced Vineyards',
    destination: 'tuscany',
    region: 'Tuscany',
    totalDuration: '4.5 hours',
    drivingDistance: '25 km (Scenic Tuscan hills)',
    stops: [
      {
        producerId: 'monteraponi-tuscany',
        suggestedTime: '11:00 AM - 2:00 PM',
        activity: 'Tour a medieval 10th-century hamlet, ancient stone cellars, and taste organic Chianti Classico paired with local pecorino and olive oil.'
      }
    ],
    description: 'An idyllic journey through the heart of Chianti Classico. Experience high-altitude organic Sangiovese farmed on limestone terraces surrounding a historic stone watchtower.',
    highlightPointers: [
      '10th-century medieval watchtower and stone cellars',
      'Organic high-altitude Sangiovese and Chianti Classico Riserva',
      'Panoramic cypress-lined views of the Tuscan hills'
    ],
    isVipOnly: false,
  }
];

// Phase 10A: append only the audited Santorini discovery guides. The legacy
// Santorini marketing route above remains unpublished because it has no
// verificationStatus and contains pre-audit claims that must not surface.
CURATED_ROUTES.push(...SANTORINI_DISCOVERY_GUIDES);

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
