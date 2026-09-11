import { DayTripLoop, Producer } from '../types/terroir';

export const CURATED_ROUTES: DayTripLoop[] = [
  {
    id: 'heraklion-grand-terroir-trail',
    title: 'The Heraklion Grand Artisan & Terroir Trail',
    greekTitle: 'Ηρακλειώτικη Διαδρομή Τερουάρ & Χειροποίητης Παράδοσης',
    subtitle: 'Cold-Pressed Koroneiki EVOO, Mountain Thyme Honey, Ancient Grapes & Copper Rakokazano',
    destination: 'crete',
    region: 'Heraklion East',
    totalDuration: '5.0 hours',
    drivingDistance: '36 km (All paved scenic village roads)',
    stops: [
      {
        producerId: 'peza-artisanal-olive-mill',
        suggestedTime: '10:00 AM - 11:15 AM',
        activity: 'Cold-pressed early-harvest Koroneiki EVOO tasting with warm village sourdough bread, oregano, and mountain sea salt.'
      },
      {
        producerId: 'meligyris-apiary',
        suggestedTime: '11:45 AM - 1:00 PM',
        activity: 'Meet 3rd-generation nomadic beekeepers, view live observation hives, and taste rare raw mountain thyme & pine honey.'
      },
      {
        producerId: 'lyrarakis-winery',
        suggestedTime: '1:30 PM - 3:00 PM',
        activity: 'Walk through plots of rescued ancient Cretan grapes (Vidiano, Dafni, Plyto) and enjoy a vineyard terrace wine tasting.'
      },
      {
        producerId: 'kazani-stilianou',
        suggestedTime: '3:30 PM - 5:00 PM',
        activity: 'Experience traditional wood-fired copper pot Tsikoudia distillation, wild thyme rakomelo, and authentic grilled village mezedes.'
      }
    ],
    description: 'The definitive Cretan culinary & agritourism day loop just 20 minutes from Heraklion and Knossos. Connect single-estate liquid gold olive oil, raw mountain thyme honey, ancient indigenous wines, and wood-fired copper still raki into one seamless, scenic countryside loop.',
    highlightPointers: [
      'Four distinct Cretan artisan disciplines in one compact 36km loop',
      'Taste fresh unfiltered Koroneiki green olive oil with warm sourdough',
      'Ancient indigenous grapes (Vidiano, Dafni, Plyto) facing Mount Juktas',
      'Soulful wood-fired copper pot distillation & warm village hospitality'
    ],
    isVipOnly: false,
  },
  {
    id: 'heraklion-west-slopes-trail',
    title: 'Heraklion Mountain Slopes: Dafnes Amphora & Malevizi Raki',
    greekTitle: 'Δυτικό Ηράκλειο: Αμφορείς Δαφνών & Ρακοκάζανο Πρινιά',
    subtitle: 'Single-Vineyard Vidiano, Amphora Aging & Mountain Rakokazano',
    destination: 'crete',
    region: 'Heraklion West',
    totalDuration: '5.0 hours',
    drivingDistance: '42 km (Paved mountain route)',
    stops: [
      {
        producerId: 'douloufakis-winery',
        suggestedTime: '11:00 AM - 12:30 PM',
        activity: 'Tasting of single-vineyard Vidiano and clay amphora fermented whites in historic Dafnes.'
      },
      {
        producerId: 'silva-daskalaki-winery',
        suggestedTime: '1:00 PM - 2:30 PM',
        activity: 'Biodynamic and organic high-altitude vineyard walk in Siva village with aged Liatiko tasting.'
      },
      {
        producerId: 'kazani-kokolakis',
        suggestedTime: '3:00 PM - 4:30 PM',
        activity: 'Visit an authentic mountain rakokazano in Prinias with wood smoke, copper stills, and rustic meze.'
      }
    ],
    description: 'Explore the western mountain foothills of Heraklion. From clay amphora wines in Dafnes to biodynamic plots in Siva and a wild mountain distillery in Prinias.',
    highlightPointers: [
      'Clay amphora-fermented Vidiano whites',
      'Biodynamic vineyards in the shadow of Mount Psiloritis',
      'Authentic mountain village hospitality and wood-fired raki'
    ],
    isVipOnly: false,
  },
  {
    id: 'chania-craft-beer-olive-trail',
    title: 'Chania Heritage Oil, Orange Groves & Fresh Craft Beer',
    greekTitle: 'Ελαιόλαδο, Πορτοκαλεώνες & Μπίρα Χανίων',
    subtitle: 'Granite Millstones, 3,000-Yr Olive Tree & Fresh Draft in Groves',
    destination: 'crete',
    region: 'Chania',
    totalDuration: '5.5 hours',
    drivingDistance: '44 km (All paved roads)',
    stops: [
      {
        producerId: 'biolea-estate',
        suggestedTime: '10:30 AM - 12:00 PM',
        activity: 'Watch granite millstones crush organic Koroneiki olives with bread tasting on the scenic stone terrace.'
      },
      {
        producerId: 'monumental-olive-tree-vouves',
        suggestedTime: '12:30 PM - 1:30 PM',
        activity: 'Stand beside a 3,000-year-old living tree and visit the historic cooperative mill museum.'
      },
      {
        producerId: 'cretan-brewery-charma',
        suggestedTime: '2:00 PM - 3:30 PM',
        activity: 'Fresh unpasteurized Charma draft flight & smoked Cretan sausages in the olive grove taproom.'
      },
      {
        producerId: 'manousakis-winery',
        suggestedTime: '4:00 PM - 5:30 PM',
        activity: 'Organic Romeiko wine tasting and farm-to-table vineyard snacks in the orange grove garden of Vatolakkos.'
      }
    ],
    description: 'A perfect western Crete day route combining historic liquid gold olive oil, monumental heritage, and modern craft brewing in the lush foothills of the White Mountains.',
    highlightPointers: [
      'Panoramic views across the foothills of the White Mountains',
      'The world’s oldest documented living olive tree',
      'Fresh unfiltered draft beer straight from the conditioning tank',
      'Organic orange-grove vineyard dining in Vatolakkos'
    ],
    isVipOnly: false,
  },
  {
    id: 'rethymno-mountain-cheese-mill-trail',
    title: 'Rethymno Heritage Mills & Ida Mountain Cave Cheese',
    greekTitle: 'Ελαιοτριβεία & Τυροκομεία Ρεθύμνου & Ψηλορείτη',
    subtitle: 'Cold Olive Pressing, Raw Sheep Milk & Cave-Aged Graviera',
    destination: 'crete',
    region: 'Rethymno',
    totalDuration: '5.0 hours',
    drivingDistance: '48 km (Scenic foothills)',
    stops: [
      {
        producerId: 'paraschakis-olive-mill',
        suggestedTime: '10:30 AM - 12:00 PM',
        activity: 'Explore the historic 19th-century olive press museum and taste cold-extracted extra virgin olive oil.'
      },
      {
        producerId: 'tzourmpakis-dairy-amari',
        suggestedTime: '12:30 PM - 2:00 PM',
        activity: 'Sample artisanal raw-milk Graviera, velvety Galeni, and smoked goat cheese in the pristine Amari Valley.'
      },
      {
        producerId: 'aerakis-dairy-anogeia',
        suggestedTime: '2:30 PM - 4:00 PM',
        activity: 'Taste legendary 18-month cave-aged Graviera and warm sheep Mizithra from the alpine slopes of Mount Ida.'
      }
    ],
    description: 'Journey through the historic heart of rural Crete. Taste award-winning cold-pressed olive oils in Melidoni, followed by two legendary artisan cheese makers preserving ancient mountain shepherd traditions.',
    highlightPointers: [
      'Historic olive mill museum in Melidoni',
      'Pure raw-milk Graviera and Galeni in Amari Valley',
      'Cave-aged alpine cheeses on Mount Psiloritis'
    ],
    isVipOnly: false,
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
