import { ProducerCategory } from '../types/terroir';
import { TastingExperience } from '../types/booking';

export const DEFAULT_EXPERIENCES_BY_CATEGORY: Record<ProducerCategory, TastingExperience[]> = {
  winery: [
    {
      id: 'wine_classic',
      title: 'Classic Terroir Flight (4 Indigenous Wines)',
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
      title: 'Cellar Master & Single-Vineyard Reserve Tour',
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
      id: 'wine_amphora',
      title: 'Ancient Terracotta Amphora & Natural Wine Workshop',
      durationMinutes: 60,
      pricePerPerson: 32,
      description: 'Taste low-intervention, un-fined natural wines fermented in buried clay pithoi following 3,500-year-old Minoan traditions.',
      includes: [
        '4 skin-contact orange & amphora-fermented wines',
        'Raw fermented sourdough bread & wild caper leaves',
        'In-depth explanation of clay vessel vinification',
      ],
    },
    {
      id: 'wine_sunset',
      title: 'Golden Hour Sunset & Terroir Pairing on Panoramic Terrace',
      durationMinutes: 90,
      pricePerPerson: 45,
      description: 'The ultimate golden-hour experience overlooking olive valleys and mountain horizons with full estate wine and meze pairings.',
      includes: [
        '6 premium limited-edition wines',
        'Private panoramic terrace seating at sunset',
        'Full meze pairing: slow-cured meats, 3 mountain cheeses, fresh carob bread',
      ],
    },
    {
      id: 'wine_library',
      title: 'Sommelier Private Library & Old Vintages Masterclass',
      durationMinutes: 90,
      pricePerPerson: 65,
      description: 'An exclusive vertical tasting of rare library vintages dating back 10–20 years, opened exclusively for your party by the head sommelier.',
      includes: [
        '5 rare back-vintage & collector’s reserve pours',
        'Vertical comparison of aged Vidiano / Xinomavro / Agiorgitiko',
        'Reserve truffle Graviera and dry-aged prosciutto pairing',
      ],
    },
    {
      id: 'wine_gastronomy',
      title: 'Five-Course Farm-to-Table Vineyard Luncheon',
      durationMinutes: 120,
      pricePerPerson: 75,
      description: 'A slow-food celebration under the vineyard pergola. Five courses crafted from estate organic produce paired with matching pours.',
      includes: [
        '5 seasonal Cretan farm dishes prepared in wood ovens',
        '5 matched single-vineyard estate wines',
        'Handmade olive oil dessert & chilled sweet Vinsanto / Liastos',
      ],
    },
  ],

  brewery: [
    {
      id: 'beer_flight',
      title: 'Fresh Cold-Room Draft Flight & Spent-Grain Pretzels',
      durationMinutes: 45,
      pricePerPerson: 12,
      description: 'Taste 4 unfiltered, unpasteurized craft beers freshly pulled from the brewery cold room.',
      includes: [
        '4 x 150ml tasting pours (Lager, Pale Ale, IPA, Stout/Porter)',
        'House-baked spent-grain salty pretzels',
        'Brewery tasting card & sensory flavor notes',
      ],
    },
    {
      id: 'beer_brewmaster',
      title: 'Head Brewmaster Brewhouse Tour & Guided Flight',
      durationMinutes: 75,
      pricePerPerson: 22,
      description: 'Step into the brew deck with the head brewer, smell raw wild hops and malts, and taste unreleased conditioning tanks.',
      includes: [
        'Full stainless brewhouse and fermentation cellar walk',
        '5 craft beers including limited-batch seasonals',
        'Cretan wood-smoked sausage bites & village cheese',
      ],
    },
    {
      id: 'beer_meze_pairing',
      title: 'Craft Beer & Cretan Artisan Meze Pairing Feast',
      durationMinutes: 75,
      pricePerPerson: 28,
      description: 'A culinary journey matching specific hop profiles and malt bodies with authentic spicy local mezedes.',
      includes: [
        '5 diverse craft pours paired with 5 artisanal small plates',
        'Smoked pork apaki glazed in dunkel beer reduction',
        'Aged shepherd graviera & pickled wild mountain bulbs (volvi)',
      ],
    },
    {
      id: 'beer_wild_botanicals',
      title: 'Wild Mountain Botanicals & Honey Beer Workshop',
      durationMinutes: 90,
      pricePerPerson: 35,
      description: 'Explore the fusion of ancient herbalism with modern brewing: beers fermented with Cretan Dictamnus, mountain tea, and wild thyme honey.',
      includes: [
        'Sensory smelling of raw Cretan botanicals and specialty malts',
        '4 botanical and barrel-aged wild ales',
        'Fresh warm carob bread & herbal cheese spread',
      ],
    },
  ],

  kazani: [
    {
      id: 'raki_tasting',
      title: 'Copper Alembic Still & Artisanal Tsikoudia Flight',
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
        'Warm, fresh distillate tasting straight from the copper coil',
        'Charcoal-grilled mountain lamb chops & potatoes baked in wood ash',
        'Unlimited seasonal village wine & tsikoudia',
      ],
    },
    {
      id: 'raki_herbal',
      title: 'Rakomelo Blending & Mountain Botanical Infusion Class',
      durationMinutes: 60,
      pricePerPerson: 22,
      description: 'Learn the ancient winter recipe of infusing hot tsikoudia with mountain thyme honey, cinnamon barks, cloves, and wild mountain tea.',
      includes: [
        'Interactive preparation of your own personalized rakomelo jar',
        'Tasting of 3 spiced & herbal distillates',
        'Freshly fried loukoumades drizzled with honey and crushed walnuts',
      ],
    },
    {
      id: 'raki_barrel',
      title: 'Oak-Cask Aged Tsikoudia & Bitter Chocolate / Cigar Pairing',
      durationMinutes: 60,
      pricePerPerson: 28,
      description: 'Discover the world of aged Greek spirits: golden tsikoudia matured in French and American oak casks for up to 7 years.',
      includes: [
        '3 aged reserve distillates with amber cognac and bourbon hues',
        'Single-origin 80% dark chocolates & candied citrus peels',
        'Selection of Greek wild dried fruits and roasted almonds',
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
    {
      id: 'cheese_shepherd_walk',
      title: 'Alpine Shepherd Foraging & Morning Milking Walk',
      durationMinutes: 90,
      pricePerPerson: 28,
      description: 'Join a local shepherd family at sunrise in the high limestone pastures. Learn about free-range biodiversity and raw curd setting.',
      includes: [
        'Scenic morning walk through alpine thyme and oregano meadows',
        'Live demonstration of curds heating in copper cauldrons',
        'Hearty shepherd breakfast with warm milk, sourdough, and eggs',
      ],
    },
    {
      id: 'cheese_vertical',
      title: 'Three Ages of Graviera: Vertical Cave Cheese & Wine Flight',
      durationMinutes: 60,
      pricePerPerson: 24,
      description: 'A sensory vertical comparison of raw-milk sheep cheese aged at different elevations, paired with native Cretan wines.',
      includes: [
        '4 distinct cheese stages: Fresh Tyrozouli, 6-Month, 18-Month, and 3-Year Aged Cave Graviera',
        '3 accompanying local wines (Vidiano, Mandilaria & Liatiko)',
        'Pickled wild greens & crushed barley rusks',
      ],
    },
  ],

  olive_mill: [
    {
      id: 'evoo_sommelier',
      title: 'High-Phenolic EVOO Masterclass & Cobalt Glass Tasting',
      durationMinutes: 45,
      pricePerPerson: 14,
      description: 'Learn professional olive oil sensory tasting techniques using official blue cobalt tasting glasses.',
      includes: [
        'Tasting of 3 single-estate monovarietal Koroneiki oils (early harvest vs late)',
        'Warm sourdough bread, sea salt crystals from Cretan rocks',
        'Tomato and wild caper salad pairing',
      ],
    },
    {
      id: 'evoo_ancient_groves',
      title: 'Millennial Groves Walk & Stone Mill Cold Extraction',
      durationMinutes: 75,
      pricePerPerson: 25,
      description: 'Walk through ancient monumental olive groves with trees over 1,000 years old, followed by a live cold-press centrifuge demonstration.',
      includes: [
        'Guided botanical walk among certified monumental olive trees',
        'Live mill extraction walkthrough from fruit to unfiltered green oil',
        'Olive oil and freshly baked dakos with mizithra & wild oregano',
      ],
    },
    {
      id: 'evoo_gastronomy',
      title: 'Olive Oil Gastronomy & Hearthside Bread-Baking Workshop',
      durationMinutes: 90,
      pricePerPerson: 32,
      description: 'Hands-on culinary session: bake your own olive bread in a wood-fired stone hearth and pair it with freshly pressed oils.',
      includes: [
        'Traditional bread-kneading session with olive pieces and rosemary',
        'Tasting of bio-certified and infused olive oils (lemon, garlic, chili)',
        'Traditional country salad and local village wine pour',
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
    {
      id: 'honey_beekeeper_suit',
      title: 'Beekeeper For a Day: Active Hive Inspection & Honeycomb Cut',
      durationMinutes: 75,
      pricePerPerson: 28,
      description: 'Suit up in a full beekeeping suit, smoke the hive gently, open brood frames, and taste honeycomb directly from the wooden frame.',
      includes: [
        'Full professional beekeeping suit & smoker training',
        'Hands-on frame inspection with the master beekeeper',
        'Fresh piece of raw honeycomb to taste and take home',
      ],
    },
    {
      id: 'honey_medicinal_herbs',
      title: 'Medicinal Herbs, Propolis & Royal Jelly Masterclass',
      durationMinutes: 60,
      pricePerPerson: 22,
      description: 'Discover the ancient medicinal properties of bee products: propolis tinctures, royal jelly, bee pollen, and wild medicinal flora.',
      includes: [
        'Tasting of raw pollen granules, royal jelly, and 4 therapeutic honeys',
        'Herbal infusion brewing workshop with wild mountain herbs',
        'Take-home jar of organic bee balm ointment',
      ],
    },
  ],
};

export const getExperiencesForProducer = (category: ProducerCategory): TastingExperience[] => {
  return DEFAULT_EXPERIENCES_BY_CATEGORY[category] || DEFAULT_EXPERIENCES_BY_CATEGORY.winery;
};
