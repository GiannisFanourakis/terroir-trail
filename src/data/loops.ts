import { DayTripLoop } from '../types/terroir';

export const CRETAN_DAY_TRIP_LOOPS: DayTripLoop[] = [
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
    ]
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
    ]
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
    ]
  }
];
