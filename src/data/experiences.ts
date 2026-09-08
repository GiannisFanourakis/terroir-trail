import { ProducerCategory } from '../types/terroir';
import { TastingExperience } from '../types/booking';

export const DEFAULT_EXPERIENCES_BY_CATEGORY: Record<ProducerCategory, TastingExperience[]> = {
  winery: [
    {
      id: 'wine_classic',
      title: 'Classic Terroir Tasting (4 Indigenous Wines)',
      durationMinutes: 45,
      pricePerPerson: 15,
      description: 'Discover native Greek grape varieties (Vidiano, Vilana, Mandilaria, Kotsifali) guided by a passionate estate host.',
      includes: [
        '4 curated estate wines (white, rosé & red)',
        'Traditional barley rusks & organic extra virgin olive oil',
        'Cretan aged Graviera cheese bites',
      ],
    },
    {
      id: 'wine_cellar',
      title: 'Cellar Master & Single-Vineyard Tour',
      durationMinutes: 75,
      pricePerPerson: 28,
      description: 'Walk through ancient stone terraced vineyards, visit the underground barrel cellar, and taste unreleased barrel samples.',
      includes: [
        'Guided vineyard walk & oak barrel cellar tour',
        '5 premium reserve & single-vineyard wines',
        'Artisanal Cretan charcuterie board with cured apaki & local olives',
      ],
    },
    {
      id: 'wine_sunset',
      title: 'Golden Hour Sunset & Terroir Pairing',
      durationMinutes: 90,
      pricePerPerson: 45,
      description: 'The ultimate golden-hour experience overlooking olive groves and mountain peaks with full estate wine and food pairings.',
      includes: [
        '6 premium limited-edition wines',
        'Private panoramic terrace seating at sunset',
        'Full meze pairing: slow-cured meats, 3 mountain cheeses, fresh carob sourdough',
      ],
    },
  ],

  brewery: [
    {
      id: 'beer_flight',
      title: 'Fresh Tap Flight & Spent-Grain Pretzels',
      durationMinutes: 45,
      pricePerPerson: 12,
      description: 'Taste 4 unfiltered, unpasteurized craft beers freshly pulled from the brewery cold room.',
      includes: [
        '4 x 150ml tasting pours (Lager, Pale Ale, IPA, Stout/Porter)',
        'House-baked spent-grain salty pretzels',
        'Brewery tasting card & flavor notes',
      ],
    },
    {
      id: 'beer_brewmaster',
      title: 'Brewmaster Brewhouse Tour & Guided Flight',
      durationMinutes: 75,
      pricePerPerson: 22,
      description: 'Step into the brew deck with the head brewer, smell raw wild hops and malts, and taste tank-fresh beer.',
      includes: [
        'Full stainless brewhouse and fermentation cellar tour',
        '5 craft beers including limited-batch seasonals',
        'Cretan wood-smoked sausage bites & village cheese',
      ],
    },
  ],

  kazani: [
    {
      id: 'raki_tasting',
      title: 'Copper Alembic Still & Tsikoudia Tasting',
      durationMinutes: 45,
      pricePerPerson: 14,
      description: 'Witness the traditional copper alembic still in action and taste single-grape distilled tsikoudia (raki).',
      includes: [
        'Live explanation of the grape pomace distillation tradition',
        '3 distinct tsikoudia distillates (pure, aged in oak, herbal rakomelo)',
        'Wild walnuts, dried figs, and thyme honey',
      ],
    },
    {
      id: 'raki_feast',
      title: 'Traditional Rakokazano Feast & Distillation Night',
      durationMinutes: 120,
      pricePerPerson: 35,
      description: 'Experience an authentic Cretan kazani evening: open wood fires, freshly distilled spirit straight from the coil, and music.',
      includes: [
        'Warm, fresh distillate tasting straight from the coil',
        'Charcoal-grilled mountain lamb chops & potatoes baked in wood ash',
        'Unlimited seasonal village wine & tsikoudia',
      ],
    },
  ],

  cheese_dairy: [
    {
      id: 'cheese_cave',
      title: 'Stone Mitato & Raw Milk Graviera Workshop',
      durationMinutes: 60,
      pricePerPerson: 16,
      description: 'Step into a traditional stone shepherd mitato to learn ancient alpine cheese-making techniques.',
      includes: [
        'Tasting of 3, 6, and 12-month cave-aged raw sheep Graviera',
        'Fresh warm Anthotiros and soft Mizithra cheese',
        'Wild mountain herbs, warm sourdough bread & honey drizzle',
      ],
    },
  ],

  olive_mill: [
    {
      id: 'evoo_sommelier',
      title: 'High-Phenolic EVOO Masterclass & Harvest Tasting',
      durationMinutes: 45,
      pricePerPerson: 14,
      description: 'Learn professional olive oil sensory tasting techniques using official blue cobalt tasting glasses.',
      includes: [
        'Tasting of 3 single-estate monovarietal Koroneiki oils (early harvest vs late)',
        'Warm sourdough bread, sea salt crystals from Cretan rocks',
        'Tomato and wild caper salad pairing',
      ],
    },
  ],

  apiary: [
    {
      id: 'honey_flight',
      title: 'Wild Thyme & Pine Honey Flight & Beehive Tour',
      durationMinutes: 50,
      pricePerPerson: 12,
      description: 'Safe guided look at mountain beehives and sensory comparison of raw Cretan thyme, pine, and blossom honeys.',
      includes: [
        'Protective bee veil and guided hive inspection',
        '3 raw mono-floral honey tastings with sheep yogurt & walnuts',
        'Herbal mountain tea infused with wild Malotira and Dictamnus',
      ],
    },
  ],
};

export const getExperiencesForProducer = (category: ProducerCategory): TastingExperience[] => {
  return DEFAULT_EXPERIENCES_BY_CATEGORY[category] || DEFAULT_EXPERIENCES_BY_CATEGORY.winery;
};
