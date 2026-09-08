import { DayTripLoop } from '../types/terroir';

export const CRETAN_DAY_TRIP_LOOPS: DayTripLoop[] = [
  {
    id: 'heraklion-terroir-circuit',
    title: 'The Heraklion Wine & Ancient Press Circuit',
    greekTitle: 'Οινική Διαδρομή & Αρχαία Πατητήρια Ηρακλείου',
    subtitle: 'From Amphora Vidiano to Wood-Fired Kazani Meze',
    region: 'heraklion',
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
    id: 'chania-stone-mill-romeiko',
    title: 'Chania Stone Mills & White Mountain Romeiko',
    greekTitle: 'Πέτρινοι Μύλοι & Ρωμαίικο Χανίων',
    subtitle: 'Ancient 3,000-Yr Olive Trees & Organic Vineyard Dining',
    region: 'chania',
    totalDuration: '6 hours',
    drivingDistance: '56 km (Paved roads)',
    stops: [
      {
        producerId: 'biolea-estate',
        suggestedTime: '10:30 AM - 12:00 PM',
        activity: 'Watch stone millstones crush organic Koroneiki olives, with bread dipping on the terrace.'
      },
      {
        producerId: 'monumental-olive-tree-vouves',
        suggestedTime: '12:30 PM - 1:30 PM',
        activity: 'Stand beside a 3,000-year-old living tree and explore ancient Cretan olive heritage.'
      },
      {
        producerId: 'manousakis-winery',
        suggestedTime: '2:00 PM - 4:30 PM',
        activity: 'Organic Romeiko orange wine tasting and farm-to-table lunch under the orange trees.'
      }
    ],
    description: 'Travel through the lush valleys of western Crete at the foot of the dramatic White Mountains (Lefka Ori). Connect with ancient olive heritage and finish with world-class organic food and wine.',
    highlightPointers: [
      'Gorge of Roka panoramic views from Biolea',
      'The world’s oldest documented olive tree',
      'Relaxed, family-run garden dining in Vatolakkos'
    ]
  },
  {
    id: 'rethymno-wild-amari-shepherd',
    title: 'Wild Amari Valley & Mountain Shepherd Quest',
    greekTitle: 'Η Άγρια Κοιλάδα Αμαρίου & Τα Μητάτα του Ψηλορείτη',
    subtitle: 'Waterfalls, Hidden Kazania & Raw-Milk Graviera at 1,200m',
    region: 'rethymno',
    totalDuration: '6.5 hours',
    drivingDistance: '72 km (Includes mountain road)',
    stops: [
      {
        producerId: 'paraschakis-olive-mill',
        suggestedTime: '10:00 AM - 11:30 AM',
        activity: 'Experience 18th-century wooden olive presses in historic Melidoni.'
      },
      {
        producerId: 'kazani-kourkoulou',
        suggestedTime: '12:30 PM - 2:00 PM',
        activity: 'Riverside raki and wild herb lunch under the plane trees of Patsos.'
      },
      {
        producerId: 'mitato-halepa',
        suggestedTime: '3:00 PM - 4:30 PM',
        activity: 'High-mountain trek to a dry-stone shepherd hut for warm curds and aged Graviera.'
      }
    ],
    description: 'An adventurous journey off the beaten track into the untouched heart of Crete. From historical olive mills to the high alpine pastures of Mount Psiloritis where shepherds still live by ancient customs.',
    highlightPointers: [
      'Patsos Saint Anthony Gorge scenery',
      'Breathtaking views of Mount Psiloritis summit',
      'Taste raw-milk cheese straight from the shepherd’s copper cauldron'
    ]
  }
];
