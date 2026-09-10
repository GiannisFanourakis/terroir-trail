import { DayTripLoop, Producer } from '../types/terroir';

export const CURATED_ROUTES: DayTripLoop[] = [
  {
    id: 'chania-craft-beer-olive-trail',
    title: 'Chania Craft Beer, Stone Mills & Mountain Romeiko',
    greekTitle: 'Μικροζυθοποιία, Ελαιόλαδο & Ρωμαίικο Χανίων',
    subtitle: 'Unpasteurized Fresh Draft, 3,000-Yr Olive Tree & Orange Groves',
    destination: 'crete',
    region: 'Chania',
    totalDuration: '5.5 hours',
    drivingDistance: '46 km (All paved roads)',
    stops: [
      {
        producerId: 'biolea-estate',
        suggestedTime: '10:30 AM - 12:00 PM',
        activity: 'Watch granite millstones crush organic Koroneiki olives with bread tasting on the terrace.'
      },
      {
        producerId: 'monumental-olive-tree-vouves',
        suggestedTime: '12:30 PM - 1:30 PM',
        activity: 'Stand beside a 3,000-year-old living tree and visit the historic cooperative mill.'
      },
      {
        producerId: 'cretan-brewery-charma',
        suggestedTime: '2:00 PM - 4:00 PM',
        activity: 'Fresh unpasteurized Charma draft flight & smoked Cretan sausages in the olive grove taproom.'
      }
    ],
    description: 'A perfect western Crete day route combining historic liquid gold and modern craft beer innovation in the lush foothills of the White Mountains.',
    highlightPointers: [
      'Gorge of Roka panoramic views',
      'The world’s oldest documented olive tree',
      'Fresh unfiltered draft beer straight from the conditioning tank'
    ],
    isVipOnly: false,
  },
  {
    id: 'heraklion-terroir-circuit',
    title: 'The Heraklion Wine & Ancient Press Circuit',
    greekTitle: 'Οινική Διαδρομή & Αρχαία Πατητήρια Ηρακλείου',
    subtitle: 'From Amphora Vidiano to Wood-Fired Kazani Meze',
    destination: 'crete',
    region: 'Heraklion',
    totalDuration: '5.5 hours',
    drivingDistance: '48 km (Paved roads)',
    stops: [
      {
        producerId: 'douloufakis-winery',
        suggestedTime: '11:00 AM - 12:30 PM',
        activity: 'Tasting of single-vineyard Vidiano and clay amphora whites in Dafnes.'
      },
      {
        producerId: 'lyrarakis-winery',
        suggestedTime: '1:00 PM - 2:30 PM',
        activity: 'Walk through surviving plots of rescued Dafni & Plyto with local cheese board.'
      },
      {
        producerId: 'kazani-stilianou',
        suggestedTime: '3:00 PM - 4:30 PM',
        activity: 'Wood-fired copper pot Tsikoudia demonstration with village grilled mezedes.'
      }
    ],
    description: 'This circuit takes you through the rolling vineyard hills of Heraklion, the heart of Minoan and contemporary Cretan winemaking. Experience indigenous grapes preserved nowhere else on earth, followed by an authentic village kazani feast.',
    highlightPointers: [
      'Stunning view of Mount Juktas (the sleeping face of Zeus)',
      'Taste wines made in authentic terracotta amphorae',
      'Warm wood-fired hospitality with local raki'
    ],
    isVipOnly: true,
  },
  {
    id: 'santorini-volcanic-terroir',
    title: 'Santorini Volcanic Caldera & Donkey Beer Trail',
    greekTitle: 'Ηφαιστειακό Terroir & Μπίρα Donkey Σαντορίνης',
    subtitle: '150-Yr Ungrafted Kouloura Vines to Volcanic Microbrews',
    destination: 'santorini',
    region: 'Santorini',
    totalDuration: '4.5 hours',
    drivingDistance: '22 km (Paved roads)',
    stops: [
      {
        producerId: 'estate-argyros-santorini',
        suggestedTime: '11:00 AM - 1:00 PM',
        activity: 'Explore 150-year-old ungrafted bush vines and taste mineral-rich volcanic Assyrtiko.'
      },
      {
        producerId: 'santorini-brewing-company',
        suggestedTime: '1:30 PM - 3:30 PM',
        activity: 'Taste Yellow, Red, and Crazy Donkey unpasteurized craft ales with local volcanic tomato fritters.'
      }
    ],
    description: 'Experience the extreme volcanic terroir of Santorini—from dry mineral wines that taste of pumice and sea spray to the island’s famous Donkey craft ales.',
    highlightPointers: [
      'Woven basket vines (kouloura) unique to Santorini',
      'The famous Yellow & Crazy Donkey microbrews',
      'Epic volcanic Aegean light'
    ],
    isVipOnly: true,
  },
  {
    id: 'peloponnese-mythic-trail',
    title: 'Peloponnese Mythic Terroir: Blood of Hercules & Arcadia Moschofilero',
    greekTitle: 'Μυθικό Terroir Πελοποννήσου: Αιγιωργίτικο & Μοσχοφίλερο',
    subtitle: 'Nemea Grand Cru Slopes (650m) to High Arcadia Champagne-Method Sparkling',
    destination: 'peloponnese',
    region: 'Nemea & Mantinia',
    totalDuration: '6.0 hours',
    drivingDistance: '64 km (Scenic paved mountain pass)',
    stops: [
      {
        producerId: 'gaia-wines-nemea',
        suggestedTime: '10:30 AM - 12:30 PM',
        activity: 'Gravity-flow cellar tour in Koutsi and tasting velvety reserve Agiorgitiko with local cheeses.'
      },
      {
        producerId: 'skouras-winery-nemea',
        suggestedTime: '1:00 PM - 2:30 PM',
        activity: 'Tasting of the mythical "Megas Oenos" (Agiorgitiko & Cabernet) in contemporary art tasting galleries.'
      },
      {
        producerId: 'ktima-tselepos',
        suggestedTime: '3:30 PM - 5:00 PM',
        activity: 'Cold continental Mantinia plateau tasting of traditional method Amalia Brut sparkling and wild Moschofilero.'
      }
    ],
    description: 'A journey through mythical Greece. Experience Nemea, where Hercules slew the lion, through velvety deep reds, before crossing the mountain pass to the chilly Arcadia plateau for aromatic floral whites.',
    highlightPointers: [
      'Nemea ancient stadium and limestone hills',
      'The legendary "Megas Oenos" vertical library',
      'Champagne-method sparkling wine at 750m elevation'
    ],
    isVipOnly: true,
  },
  {
    id: 'northern-greece-royal-trail',
    title: 'Kingdom of Macedonia: Epanomi Malagousia & Naoussa Royal Xinomavro',
    greekTitle: 'Μακεδονία: Μαλαγουζιά Επανομής & Βασιλικό Ξινόμαυρο',
    subtitle: 'From Thermaic Gulf Sea-Breeze Whites to Mount Vermio Old Vines',
    destination: 'northern_greece',
    region: 'Thessaloniki & Naoussa',
    totalDuration: '6.5 hours',
    drivingDistance: '85 km (Highway & wine slopes)',
    stops: [
      {
        producerId: 'ktima-gerovassiliou',
        suggestedTime: '10:00 AM - 12:30 PM',
        activity: 'Tour the world-renowned corkscrew museum and taste the revived Malagousia facing Mount Olympus.'
      },
      {
        producerId: 'thymiopoulos-naoussa',
        suggestedTime: '2:00 PM - 4:00 PM',
        activity: 'Biodynamic vineyard walk and tasting of "Earth and Sky" natural Xinomavro straight from old oak casks.'
      }
    ],
    description: 'Northern Greece is the land of Alexander the Great and Dionysian mystery. This route pairs the world’s benchmark aromatic Malagousia with the legendary structured Xinomavro of Naoussa.',
    highlightPointers: [
      'The world’s premier private corkscrew museum (2,600+ pieces)',
      'Mount Olympus panoramic sea-view terraces',
      'Biodynamic century-old Xinomavro vines'
    ],
    isVipOnly: false,
  },
  {
    id: 'santorini-caldera-sunset-trail',
    title: 'Santorini Sunset Caldera & Saffron Distillation Trail',
    greekTitle: 'Διαδρομή Καλντέρας & Αποστάγματα Σαφράν Σαντορίνης',
    subtitle: 'Cliffside Gravity Winery, Volcanic Black Beach & Saffron Tsikoudia',
    destination: 'santorini',
    region: 'Santorini',
    totalDuration: '5.0 hours',
    drivingDistance: '28 km (Paved caldera roads)',
    stops: [
      {
        producerId: 'gaia-wines-santorini',
        suggestedTime: '11:00 AM - 1:00 PM',
        activity: 'Beachfront industrial canava tasting of sea-submerged Thalassitis right by crashing volcanic surf.'
      },
      {
        producerId: 'canava-santorini-distillery',
        suggestedTime: '1:30 PM - 3:00 PM',
        activity: 'Explore 19th-century copper stills and sample Assyrtiko Tsikoudia infused with Greek red saffron.'
      },
      {
        producerId: 'venetsanos-winery-santorini',
        suggestedTime: '4:00 PM - 6:00 PM (Sunset)',
        activity: 'Cliffside gravity cellars walk and sunset Nykteri tasting on the sheer edge of the Caldera.'
      }
    ],
    description: 'The definitive luxury circuit on Santorini: from volcanic beach surf to centuries-old saffron copper stills, culminating in a front-row sunset seat on the edge of the Caldera cliffs.',
    highlightPointers: [
      'Wines submerged 25m under the Aegean Sea',
      'Handcrafted saffron & fig tsikoudia',
      'Front-row cliffside sunset over the sunken volcano'
    ],
    isVipOnly: true,
  }
];

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
