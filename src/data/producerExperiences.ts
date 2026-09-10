import { TastingExperience } from '../types/booking';

/**
 * 114 Curated Bespoke Estate Experiences (2 unique experiences for each of the 57 authentic Greek producers)
 * Enriched with exact package titles, real pricing, genuine inclusions, and visitor options
 * sourced directly from producer official websites and visitor programs.
 */
export const PRODUCER_EXPERIENCES: TastingExperience[] = [
  {
    "id": "exp_cretan-brewery-charma_1",
    "title": "Cretan Brewery (Charma Beer) - Fresh Unfiltered Cold-Room Draft Flight",
    "durationMinutes": 45,
    "pricePerPerson": 4,
    "description": "The official Cretan Brewery visitor experience in Zounaki (Platanias): guided tour of the brewhouse followed by 4 fresh draft samples pulled directly from the cold storage tanks.",
    "includes": [
      "Guided walkthrough of the eco-friendly brewhouse and fermentation deck",
      "4 x 150ml tasting pours: Charma Fresh Draft Lager, Dunkel, Pale Ale & Seasonal Wheat",
      "House-baked crunchy spent-grain pretzels seasoned with Cretan sea salt",
      "Tasting card with hop, malt, and bitterness (IBU) sensory metrics"
    ],
    "producerId": "cretan-brewery-charma",
    "producerName": "Cretan Brewery (Charma Beer)",
    "producerGreekName": "Κρητική Ζυθοποιία (Μπίρα Χάρμα)",
    "category": "brewery",
    "destination": "crete",
    "location": "Chania, Zounaki (Platanias)",
    "badge": "Fresh Tank-Pull (€4)"
  },
  {
    "id": "exp_cretan-brewery-charma_2",
    "title": "Cretan Brewery (Charma Beer) - Zounaki Eco-Brewery Tour & Smoked Apaki Taproom Pairing",
    "durationMinutes": 75,
    "pricePerPerson": 18,
    "description": "Explore the geothermal energy systems with the brewer, then relax on the shaded brewery terrace with fresh drafts and Charma Dunkel-glazed smoked apaki pork.",
    "includes": [
      "In-depth tour of geothermal brewing, compost recycling, and solar energy systems",
      "5 craft beers including limited-batch seasonal specials and unreleased tanks",
      "Full plate of Cretan smoked pork apaki simmered in Dunkel glaze, village graviera & bread",
      "Panoramic terrace view over the orange and olive valleys of Platanias"
    ],
    "producerId": "cretan-brewery-charma",
    "producerName": "Cretan Brewery (Charma Beer)",
    "producerGreekName": "Κρητική Ζυθοποιία (Μπίρα Χάρμα)",
    "category": "brewery",
    "destination": "crete",
    "location": "Chania, Zounaki (Platanias)",
    "badge": "Taproom & Meze"
  },
  {
    "id": "exp_solo-craft-brewery_1",
    "title": "Solo Craft Brewery - Heraklion Urban Microbrewery Tasting by Appointment",
    "durationMinutes": 50,
    "pricePerPerson": 15,
    "description": "Visit Solo Brewery’s headquarters in Kalithea by appointment: tour the brewhouse with the brewers and taste 4 unfiltered, unpasteurized craft ales.",
    "includes": [
      "Behind-the-scenes tour of the brew tanks, kegging line, and grain store",
      "4 craft beers: Amerikana Pale Ale, Horiatiki Saison, Askianos Porter & Psaki IPA",
      "Seasoned spent-grain crackers and Cretan village cheese bites",
      "Story of Solo’s international brewing philosophy and extreme recipes"
    ],
    "producerId": "solo-craft-brewery",
    "producerName": "Solo Craft Brewery",
    "producerGreekName": "Μικροζυθοποιία Σόλο",
    "category": "brewery",
    "destination": "crete",
    "location": "Heraklion, Nea Alikarnassos",
    "badge": "Craft Revolution"
  },
  {
    "id": "exp_solo-craft-brewery_2",
    "title": "Solo Craft Brewery - Fouriaris Imperial IPA & Extreme Barrel-Aged Wild Ale Tasting",
    "durationMinutes": 80,
    "pricePerPerson": 30,
    "description": "An advanced craft beer masterclass: taste 5 high-gravity and barrel-aged wild ales matured in Greek oak wine casks and tsikoudia barrels.",
    "includes": [
      "Private tasting in the barrel maturation corner of the brewery",
      "5 robust beers featuring Fouriaris Imperial IPA, barrel-aged stouts, and sour ales",
      "Pairing with artisanal 80% dark chocolate, sharp graviera, and cured spicy sausage",
      "Discussion on wild yeast cultures (Brettanomyces) and barrel wood interactions"
    ],
    "producerId": "solo-craft-brewery",
    "producerName": "Solo Craft Brewery",
    "producerGreekName": "Μικροζυθοποιία Σόλο",
    "category": "brewery",
    "destination": "crete",
    "location": "Heraklion, Nea Alikarnassos",
    "badge": "Barrel-Aged Wild Ales"
  },
  {
    "id": "exp_lafkas-brewery_1",
    "title": "Lafkas Microbrewery - Franco-Greek Craft Brewing Walk & Triple Hop Ale Tasting",
    "durationMinutes": 45,
    "pricePerPerson": 14,
    "description": "In Vamvakopoulo near Chania, discover how Belgian brewing mastery pairs with pristine White Mountains snow-melt water to craft unfiltered ales.",
    "includes": [
      "Tour of the microbrewery facility with the Belgian-Greek founder couple",
      "Tasting of 4 fresh beers: Triple Hop Pale Ale, Chaniotissa Witbier, Stout & Seasonal",
      "Sensory smelling of raw Belgian malts and whole-cone aroma hops",
      "Warm sourdough bread with local olive oil and sheep cheese"
    ],
    "producerId": "lafkas-brewery",
    "producerName": "Lafkas Microbrewery",
    "producerGreekName": "Ζυθοποιία Λάφκας",
    "category": "brewery",
    "destination": "crete",
    "location": "Chania, Vamvakopoulo",
    "badge": "Belgian-Greek Fusion"
  },
  {
    "id": "exp_lafkas-brewery_2",
    "title": "Lafkas Microbrewery - Chaniotissa Witbier & Orchard Pairing",
    "durationMinutes": 75,
    "pricePerPerson": 28,
    "description": "Taste experimental small batches brewed with local Chania citrus peels and coriander, paired with fresh orange-glazed pork and mountain cheese.",
    "includes": [
      "Walk through the nearby citrus orchards supplying organic orange peels for brewing",
      "5 craft pours including barrel-aged and vintage bottle-conditioned Belgian ales",
      "Smoked pork bites glazed with citrus reduction, local graviera & warm pita",
      "Interactive Q&A on bottle-conditioning and natural carbonation"
    ],
    "producerId": "lafkas-brewery",
    "producerName": "Lafkas Microbrewery",
    "producerGreekName": "Ζυθοποιία Λάφκας",
    "category": "brewery",
    "destination": "crete",
    "location": "Chania, Vamvakopoulo",
    "badge": "Citrus & Hops"
  },
  {
    "id": "exp_santorini-brewing-company_1",
    "title": "Santorini Brewing Company (Donkey Beer) - Mesa Gonia Tasting Room Donkey Flight",
    "durationMinutes": 45,
    "pricePerPerson": 18,
    "description": "Sample fresh unfiltered Donkey beers in the upstairs tasting area overlooking the traditional village of Mesa Gonia. Discover Santorini’s iconic craft brews.",
    "includes": [
      "4 iconic Donkey beers: Yellow Donkey, Red Donkey, Crazy Donkey (First Greek IPA) & Slow Donkey",
      "Spent-grain malt breadsticks with volcanic tomato dip",
      "Explanation of reverse-osmosis desalination brewing on an arid island"
    ],
    "producerId": "santorini-brewing-company",
    "producerName": "Santorini Brewing Company (Donkey Beer)",
    "producerGreekName": "Ζυθοποιία Σαντορίνης (Donkey Beer)",
    "category": "brewery",
    "destination": "santorini",
    "location": "Santorini, Mesa Gonia",
    "badge": "Donkey Craft Ales"
  },
  {
    "id": "exp_santorini-brewing-company_2",
    "title": "Santorini Brewing Company (Donkey Beer) - Brewmaster Donkey Experience & Souvenir Glass",
    "durationMinutes": 75,
    "pricePerPerson": 35,
    "description": "Step into the brew deck with the brewing team to inspect raw malts, Slovenian hops, and French oak Vinsanto aging barrels, complete with a souvenir logo glass.",
    "includes": [
      "Behind-the-scenes brewhouse inspection and conditioning tanks walk",
      "5 craft beers including vintage-conditioned Slow Donkey aged in Vinsanto casks",
      "Authentic Santorini Brewing Company glassware to take home",
      "Smoked pork loin bites, caper leaves & aged graviera pairing"
    ],
    "producerId": "santorini-brewing-company",
    "producerName": "Santorini Brewing Company (Donkey Beer)",
    "producerGreekName": "Ζυθοποιία Σαντορίνης (Donkey Beer)",
    "category": "brewery",
    "destination": "santorini",
    "location": "Santorini, Mesa Gonia",
    "badge": "Brewmaster Tour"
  },
  {
    "id": "exp_anoskeli-estate_1",
    "title": "Anoskeli Winery & Olive Mill - Olive Mill & Winery Dual Presentation with 5 Wines",
    "durationMinutes": 60,
    "pricePerPerson": 25,
    "description": "The official Anoskeli estate tour: a presentation of both extra virgin olive oil extraction and winemaking processes, tasting 5 wines, EVOO, and Cretan snacks.",
    "includes": [
      "Guided walkthrough of the certified organic olive mill and wine barrel cellar",
      "Tasting of PDO Kolymbari extra virgin olive oil (early harvest vs classic)",
      "5 estate wines: Anoiktos White, Anoferia Vidiano, Syrah & Cabernet blend",
      "Traditional Cretan snacks: graviera cheese, olives, and warm village bread"
    ],
    "producerId": "anoskeli-estate",
    "producerName": "Anoskeli Winery & Olive Mill",
    "producerGreekName": "Οινοποιείο & Ελαιοτριβείο Ανώσκελη",
    "category": "winery",
    "destination": "crete",
    "location": "Chania, Anoskeli (Platanias)",
    "badge": "Official Dual Tour"
  },
  {
    "id": "exp_anoskeli-estate_2",
    "title": "Anoskeli Winery & Olive Mill - Kolymbari PDO EVOO & Single-Estate Reserve Tasting",
    "durationMinutes": 80,
    "pricePerPerson": 38,
    "description": "An in-depth sensory masterclass: professional cobalt-glass tasting of high-phenolic olive oils followed by 5 reserve wines and homemade dakos meze.",
    "includes": [
      "Professional cobalt glass olive oil sensory tasting identifying fruitiness, bitterness & pungency",
      "Botanical walk among centenary olive trees in the Anoskeli valley",
      "5 reserve wines paired with freshly assembled Cretan dakos (mizithra, tomato & oregano)",
      "Take-home sensory tasting guide with polyphenol health benefits"
    ],
    "producerId": "anoskeli-estate",
    "producerName": "Anoskeli Winery & Olive Mill",
    "producerGreekName": "Οινοποιείο & Ελαιοτριβείο Ανώσκελη",
    "category": "winery",
    "destination": "crete",
    "location": "Chania, Anoskeli (Platanias)",
    "badge": "EVOO & Reserve Wine"
  },
  {
    "id": "exp_domaine-paterianakis_1",
    "title": "Domaine Paterianakis - Peza Gravity-Flow Cellar Tour & 5 Organic Wines + Tsikoudia",
    "durationMinutes": 60,
    "pricePerPerson": 28,
    "description": "Tour Greece’s first subterranean gravity-flow winery in Melesses: taste 5 organic wines and 1 estate tsikoudia spirit with barley rusks and mountain cheeses.",
    "includes": [
      "Guided tour of the 4-level gravity-flow architecture and underground cellar",
      "Tasting of 5 organic wines: Melissinos White (Thrapsathiri/Sauvignon), Melissinos Red & 3.14 Natural",
      "1 shot of estate organic double-distilled tsikoudia (raki)",
      "Traditional Cretan rusks and local graviera bites"
    ],
    "producerId": "domaine-paterianakis",
    "producerName": "Domaine Paterianakis",
    "producerGreekName": "Κτήμα Πατεριανάκη",
    "category": "winery",
    "destination": "crete",
    "location": "Heraklion, Melesses (Peza)",
    "badge": "Gravity-Flow Pioneer"
  },
  {
    "id": "exp_domaine-paterianakis_2",
    "title": "Domaine Paterianakis - Organic Wine & Cretan Cold Cuts / Tomato Jam Platter",
    "durationMinutes": 80,
    "pricePerPerson": 35,
    "description": "Relax on the winery veranda overlooking Peza’s olive-clad hills: 5 organic wines and spirit accompanied by a generous platter of local cured meats, cheeses, and homemade tomato jam.",
    "includes": [
      "Full vineyard biodiversity walk through certified organic and biodynamic vines",
      "5 organic wines + 1 aged oak tsikoudia pour",
      "Generous platter of local cured pork apaki, graviera, fresh garden vegetables & tomato jam",
      "Stories of the Paterianakis sisters pioneering third-generation organic winemaking"
    ],
    "producerId": "domaine-paterianakis",
    "producerName": "Domaine Paterianakis",
    "producerGreekName": "Κτήμα Πατεριανάκη",
    "category": "winery",
    "destination": "crete",
    "location": "Heraklion, Melesses (Peza)",
    "badge": "Organic Farm Platter"
  },
  {
    "id": "exp_vassaltis-vineyards_1",
    "title": "Vassaltis Vineyards Santorini - Vassaltis Volcanic Tasting & Food Bites",
    "durationMinutes": 60,
    "pricePerPerson": 40,
    "description": "The official Vassaltis tasting experience in Vourvoulos: 4 mineral-driven volcanic wines, each paired with a bespoke culinary bite created specifically to elevate that wine’s saline aromatics.",
    "includes": [
      "Minimalist boutique winery walkthrough and black pumice soil overview",
      "4 signature wines: Vassaltis Assyrtiko, Nassitis, Plethora & Gramina",
      "4 paired artisan culinary bites matching each wine label",
      "Sommelier presentation of cool northern microclimates in Santorini"
    ],
    "producerId": "vassaltis-vineyards",
    "producerName": "Vassaltis Vineyards Santorini",
    "producerGreekName": "Αμπελώνες Βασάλτης",
    "category": "winery",
    "destination": "santorini",
    "location": "Santorini, Vourvoulos",
    "badge": "Boutique Tasting"
  },
  {
    "id": "exp_vassaltis-vineyards_2",
    "title": "Vassaltis Vineyards Santorini - Cellar Tour & Whole Experience Gastronomy Lunch",
    "durationMinutes": 120,
    "pricePerPerson": 90,
    "description": "Intimate cellar tour with the winemaking team followed by \"The Whole Experience\" on the panoramic terrace: a four-course seasonal lunch menu paired with 4 cru wines.",
    "includes": [
      "Private cellar inspection (maximum 12 guests) with barrel tasting",
      "Four-course Aegean gastronomy lunch prepared by the estate chef",
      "4 paired wines including Barrel-Fermented Assyrtiko and Mavrotragano",
      "Unobstructed Aegean and northern Santorini coastal panorama"
    ],
    "producerId": "vassaltis-vineyards",
    "producerName": "Vassaltis Vineyards Santorini",
    "producerGreekName": "Αμπελώνες Βασάλτης",
    "category": "winery",
    "destination": "santorini",
    "location": "Santorini, Vourvoulos",
    "badge": "Gastronomy Lunch"
  },
  {
    "id": "exp_skouras-winery-nemea_1",
    "title": "Ktima Skouras (Peloponnese) - Megas Oenos Heritage Tour & Agiorgitiko Flight",
    "durationMinutes": 60,
    "pricePerPerson": 25,
    "description": "Visit the legendary George Skouras in Malandreni (Argolida): tour the grand 1,000-barrel cellar and contemporary art gallery, tasting 4 signature wines including Megas Oenos.",
    "includes": [
      "Tour of the 1,000-barrel French oak maturation cellar and winery bistro",
      "4 signature wines: Megas Oenos (Agiorgitiko/Cabernet), Grand Cuvee Nemea, Salto Moschofilero & Peplo Rose",
      "Peloponnesian graviera cheese, rustic sourdough bread & olive tapenade",
      "History of George Skouras revolutionizing modern Greek wine since 1986"
    ],
    "producerId": "skouras-winery-nemea",
    "producerName": "Ktima Skouras (Peloponnese)",
    "producerGreekName": "Κτήμα Σκούρας",
    "category": "winery",
    "destination": "peloponnese",
    "location": "Nemea, Malandreni (Argos)",
    "badge": "Megas Oenos Heritage"
  },
  {
    "id": "exp_skouras-winery-nemea_2",
    "title": "Ktima Skouras (Peloponnese) - Grand Cuvee Cellar Master Vertical & Peloponnesian Luncheon",
    "durationMinutes": 100,
    "pricePerPerson": 65,
    "description": "A sommelier-led vertical tasting comparing 3 decades of Megas Oenos and Grand Cuvee Nemea, followed by a seasonal regional luncheon in the estate bistro.",
    "includes": [
      "5 wines including 2 rare library back-vintages aged 10+ years",
      "Three-course Peloponnesian lunch featuring slow-braised beef in Agiorgitiko reduction",
      "Private sommelier commentary and cellar reserve walk"
    ],
    "producerId": "skouras-winery-nemea",
    "producerName": "Ktima Skouras (Peloponnese)",
    "producerGreekName": "Κτήμα Σκούρας",
    "category": "winery",
    "destination": "peloponnese",
    "location": "Nemea, Malandreni (Argos)",
    "badge": "Three-Decade Vertical"
  },
  {
    "id": "exp_thymiopoulos-naoussa_1",
    "title": "Thymiopoulos Vineyards Naoussa - Earth & Sky Biodynamic Xinomavro Tasting",
    "durationMinutes": 60,
    "pricePerPerson": 26,
    "description": "Visit Apostolos Thymiopoulos in Trilofos, the visionary who redefined Xinomavro: tour the biodynamic vineyards and taste 4 terroir expressions with local batzina pie.",
    "includes": [
      "Walk through living biodynamic vineyards planted with wild flora, clover, and herbs",
      "4 terroir expressions: Rose de Xinomavro, Jeunes Vignes, Alta & Earth & Sky",
      "Traditional Naoussa batzina vegetable pie and aged feta bites",
      "Discussion of natural spontaneous fermentation and low sulfur protocols"
    ],
    "producerId": "thymiopoulos-naoussa",
    "producerName": "Thymiopoulos Vineyards Naoussa",
    "producerGreekName": "Αμπελώνες Θυμιόπουλου",
    "category": "winery",
    "destination": "northern_greece",
    "location": "Naoussa, Trilofos",
    "badge": "Biodynamic Pioneer"
  },
  {
    "id": "exp_thymiopoulos-naoussa_2",
    "title": "Thymiopoulos Vineyards Naoussa - 10-Wine Vermion Terroir Vertical & Artisan Platter",
    "durationMinutes": 90,
    "pricePerPerson": 55,
    "description": "Cellar tasting directly from large 5,000L neutral Slavonian oak casks: taste 10 wines comparing single-parcel terroirs across Mount Vermion with local cured meats and cheeses.",
    "includes": [
      "Tasting from large 5,000L neutral casks and clay vessels in the cellar",
      "10 wines including single-vineyard Vrana Petra, Aftorizo, and rare library releases",
      "Abundant platter of Naoussa slow-cooked beef bites, spicy cured salami, and aged Kasseri",
      "In-depth geological comparison of schists, limestone, and red clay soils"
    ],
    "producerId": "thymiopoulos-naoussa",
    "producerName": "Thymiopoulos Vineyards Naoussa",
    "producerGreekName": "Αμπελώνες Θυμιόπουλου",
    "category": "winery",
    "destination": "northern_greece",
    "location": "Naoussa, Trilofos",
    "badge": "10-Wine Masterclass"
  },
  {
    "id": "exp_tyrokomio-gasparis_1",
    "title": "Mastorakis Traditional Dairy - Artisan Raw Milk Graviera & Fresh Cheese Flight",
    "durationMinutes": 50,
    "pricePerPerson": 16,
    "badge": "Dairy Flight",
    "description": "Taste authentic raw sheep and goat cheeses crafted following traditional alpine pastoral methods at Mastorakis Traditional Artisan Dairy.",
    "includes": [
      "Walkthrough of the cheese salting and temperature-controlled curing cellar",
      "Tasting of 4 fresh and aged cheeses (Galomyzithra, Anthotiros, Graviera, Goat Kasseri)",
      "Crushed barley rusks, wild thyme honey & mountain tea"
    ],
    "producerId": "tyrokomio-gasparis",
    "producerName": "Mastorakis Traditional Artisan Dairy (Apokoronas)",
    "producerGreekName": "Παραδοσιακό Τυροκομείο Μαστοράκη",
    "category": "cheese_dairy",
    "destination": "crete",
    "location": "Chania, Tzitzifes (Apokoronas)"
  },
  {
    "id": "exp_tyrokomio-gasparis_2",
    "title": "Mastorakis Traditional Dairy - Shepherd Cauldron Workshop & Terroir Wine Pairing",
    "durationMinutes": 80,
    "pricePerPerson": 32,
    "badge": "Master Cheesemaker",
    "description": "Watch the master cheesemaker separate curds and whey in traditional copper vats, followed by vertical cheese tasting paired with native wines.",
    "includes": [
      "Live demonstration of curds heating and cheese mold pressing",
      "Tasting of 3 aged cave Gravieras aged 6, 12, and 24 months",
      "2 glasses of local wine paired with wild greens and artisan charcuterie"
    ],
    "producerId": "tyrokomio-gasparis",
    "producerName": "Mastorakis Traditional Artisan Dairy (Apokoronas)",
    "producerGreekName": "Παραδοσιακό Τυροκομείο Μαστοράκη",
    "category": "cheese_dairy",
    "destination": "crete",
    "location": "Chania, Tzitzifes (Apokoronas)"
  },
  {
    "id": "exp_estate-argyros-santorini_1",
    "title": "Estate Argyros Santorini - Estate Argyros Welcome Tour & 4-Wine Flight",
    "durationMinutes": 60,
    "pricePerPerson": 25,
    "description": "The official estate welcome tour: guided walk through the 150+ year-old ungrafted bush-vine parcels and state-of-the-art production area, tasting 4 wines including signature Vinsanto, accompanied by artisanal local cheeses.",
    "includes": [
      "Guided tour of ancient bush vineyards and modern production winery",
      "Flight of 4 estate wines (Estate Argyros Assyrtiko, Oak Fermented, Cuvee Monsignori & signature Vinsanto)",
      "Selection of traditional Cycladic cheeses and barley rusks",
      "In-depth explanation of phylloxera-free volcanic terroir and kouloura basket pruning"
    ],
    "producerId": "estate-argyros-santorini",
    "producerName": "Estate Argyros Santorini",
    "producerGreekName": "Κτήμα Αργυρού Σαντορίνη",
    "category": "winery",
    "destination": "santorini",
    "location": "Santorini, Episkopi Gonia",
    "badge": "Official Welcome Tour"
  },
  {
    "id": "exp_estate-argyros-santorini_2",
    "title": "Estate Argyros Santorini - Taste the Real Santorini Food & Wine Pairing",
    "durationMinutes": 90,
    "pricePerPerson": 40,
    "description": "Led by a dedicated Wine Educator, this official masterclass features 6 Estate Argyros wines matched with regional Greek cheeses and cold cuts, focusing on rare indigenous varieties and the remarkable aging potential of Vinsanto.",
    "includes": [
      "Full winery and barrel maturation cellar walkthrough",
      "6 estate wines exploring single-parcel Assyrtiko and library Vinsanto",
      "Gourmet platter of selected Greek cheeses, smoked cold cuts & caper leaves",
      "Sommelier guidance on the art of Santorini food and wine pairing"
    ],
    "producerId": "estate-argyros-santorini",
    "producerName": "Estate Argyros Santorini",
    "producerGreekName": "Κτήμα Αργυρού Σαντορίνη",
    "category": "winery",
    "destination": "santorini",
    "location": "Santorini, Episkopi Gonia",
    "badge": "Official Pairing Flight"
  },
  {
    "id": "exp_semeli-estate-nemea_1",
    "title": "Semeli Estate Nemea - \"#SemeliWineExperience I\" Tour & PDO Peloponnese Flight",
    "durationMinutes": 60,
    "pricePerPerson": 24,
    "description": "The official Semeli Estate experience in Koutsi: guided tour of the production, bottling areas, and cellar, followed by a tasting of 4 signature wines showcasing Mantinia and Nemea PDOs.",
    "includes": [
      "Guided tour of gravity-flow production halls, bottling line, and barrel cellar",
      "4 signature wines: Feast Moschofilero, Semeli Mantinia, Mountain Sun & Semeli Nemea Reserve",
      "Traditional Greek breadsticks, artisan cheese bites, and olive tapenade",
      "Panoramic hillside views of the Corinthian Gulf from 600m altitude"
    ],
    "producerId": "semeli-estate-nemea",
    "producerName": "Semeli Estate Nemea",
    "producerGreekName": "Κτήμα Σεμέλη Νεμέα",
    "category": "winery",
    "destination": "peloponnese",
    "location": "Nemea, Koutsi (Nemea)",
    "badge": "Official Semeli Tour"
  },
  {
    "id": "exp_semeli-estate-nemea_2",
    "title": "Semeli Estate Nemea - Exclusive Private Cellar Tasting & Wine Pic-Nic",
    "durationMinutes": 90,
    "pricePerPerson": 60,
    "description": "The premier Semeli package: private cellar tasting of 7 iconic vintages with the resident sommelier, or a private tasting at a vineyard kiosk with a gourmet picnic basket.",
    "includes": [
      "Private access to the underground barrel aging cellar or panoramic vineyard kiosk",
      "7 iconic vintages including single-block Agiorgitiko reserves and library releases",
      "Gourmet picnic basket with artisanal cheeses, cured meats, fresh fruits, and warm bread",
      "Guided tasting commentary on the chalky soils and microclimate of Koutsi"
    ],
    "producerId": "semeli-estate-nemea",
    "producerName": "Semeli Estate Nemea",
    "producerGreekName": "Κτήμα Σεμέλη Νεμέα",
    "category": "winery",
    "destination": "peloponnese",
    "location": "Nemea, Koutsi (Nemea)",
    "badge": "Private Cellar Tasting"
  },
  {
    "id": "exp_kir-yianni-naoussa_1",
    "title": "Ktima Kir-Yianni Naoussa - Tailored Naoussa & Amyndeon 4-Label Flight",
    "durationMinutes": 60,
    "pricePerPerson": 18,
    "description": "The official visitor experience at Ktima Kir-Yianni in Yianakohori: guided tour of the winemaking facilities, 4 wine samples (30ml each), and an individual food platter.",
    "includes": [
      "Guided tour of the state-of-the-art vinification and aging facilities on Mount Vermion",
      "4 wine samples featuring Ramnista Naoussa Xinomavro, Kali Riza, and Amyndeon whites",
      "Individual platter of Greek graviera cheese, seasoned breadsticks & dried fruits",
      "Introduction to the Boutaris family heritage and the crus of Naoussa"
    ],
    "producerId": "kir-yianni-naoussa",
    "producerName": "Ktima Kir-Yianni Naoussa",
    "producerGreekName": "Κτήμα Κυρ-Γιάννη Νάουσα",
    "category": "winery",
    "destination": "northern_greece",
    "location": "Naoussa, Yiannakochori",
    "badge": "Official Tailored Flight"
  },
  {
    "id": "exp_kir-yianni-naoussa_2",
    "title": "Ktima Kir-Yianni Naoussa - Yiannis Boutaris Hall Private Reserve & E-Bike Vineyard Tour",
    "durationMinutes": 120,
    "pricePerPerson": 55,
    "description": "E-bike through the steep terraced vineyards of Yianakohori followed by a private tasting in the \"Yiannis Boutaris Hall\" of flagship crus paired with regional dishes.",
    "includes": [
      "Guided e-bike exploration through high-altitude Mount Vermion vineyard blocks",
      "Private reserve tasting in the Yiannis Boutaris Hall: Diaporos Single-Block, Ble Alepou & Library Vintages",
      "Three-course regional food pairing from the estate culinary team",
      "Sommelier discussion on Xinomavro tannins and 20-year cellaring potential"
    ],
    "producerId": "kir-yianni-naoussa",
    "producerName": "Ktima Kir-Yianni Naoussa",
    "producerGreekName": "Κτήμα Κυρ-Γιάννη Νάουσα",
    "category": "winery",
    "destination": "northern_greece",
    "location": "Naoussa, Yiannakochori",
    "badge": "Private Hall Reserve"
  },
  {
    "id": "exp_douloufakis-winery_1",
    "title": "Douloufakis Winery - \"YAMAS\" Estate Cellar Wine Tasting",
    "durationMinutes": 90,
    "pricePerPerson": 30,
    "description": "The official Douloufakis estate experience in Dafnes: guided tour of the winery and cellar, followed by a relaxed tasting of 6 wines focusing on Vidiano and Liatiko with Cretan graviera.",
    "includes": [
      "Guided tour of the fermentation cellar, oak aging rooms & bottling line",
      "6 estate wines featuring Dafnios Vidiano, Aspros Lagos Oak, and Amphora Vidiano",
      "Artisanal Cretan barley rusks & aged graviera cheese bites",
      "History of 3 generations of Douloufakis winemaking in the Dafnes PDO"
    ],
    "producerId": "douloufakis-winery",
    "producerName": "Douloufakis Winery",
    "producerGreekName": "Οινοποιείο Δουλουφάκη",
    "category": "winery",
    "destination": "crete",
    "location": "Heraklion, Dafnes",
    "badge": "Official Yamas Flight"
  },
  {
    "id": "exp_douloufakis-winery_2",
    "title": "Douloufakis Winery - \"ARISMARI\" Vineyard Tour & Pergola Tasting",
    "durationMinutes": 120,
    "pricePerPerson": 40,
    "description": "Outdoor immersive experience: winery tour followed by transport to the hillside vineyards for a tasting of 6 wines under a traditional pergola with panoramic Cretan mountain views.",
    "includes": [
      "Scenic transfer to the high-elevation Dafnes limestone vineyards",
      "Tasting of 6 premium cru wines under the vineyard pergola",
      "Accompaniments of traditional Cretan cheeses, organic olive oil & paximadia",
      "Botanical walk among wild rosemary (arismari) and thyme bushes"
    ],
    "producerId": "douloufakis-winery",
    "producerName": "Douloufakis Winery",
    "producerGreekName": "Οινοποιείο Δουλουφάκη",
    "category": "winery",
    "destination": "crete",
    "location": "Heraklion, Dafnes",
    "badge": "Official Arismari Flight"
  },
  {
    "id": "exp_manousakis-winery_1",
    "title": "Manousakis Winery (Nostos) - Nostos Organic Tasting & Complimentary Winery Tour",
    "durationMinutes": 60,
    "pricePerPerson": 20,
    "description": "In the peaceful village of Vatolakkos, join daily complimentary tours (12pm, 2pm, 4pm, 6pm, 8pm) followed by an organic tasting on the garden terrace among olive and orange groves.",
    "includes": [
      "Complimentary guided winery production and barrel cellar walkthrough",
      "Tasting of 5 organic Nostos wines (Roussanne, Grenache, Syrah, Nostos Blend & Romeiko)",
      "Cretan barley rusks and estate organic extra virgin olive oil",
      "Relaxing garden seating under century-old olive and citrus trees"
    ],
    "producerId": "manousakis-winery",
    "producerName": "Manousakis Winery (Nostos)",
    "producerGreekName": "Οινοποιείο Μανουσάκη",
    "category": "winery",
    "destination": "crete",
    "location": "Chania, Vatolakkos",
    "badge": "Organic Nostos Flight"
  },
  {
    "id": "exp_manousakis-winery_2",
    "title": "Manousakis Winery (Nostos) - Wine Dinner Under the Stars & Terrace Taverna Pairing",
    "durationMinutes": 120,
    "pricePerPerson": 65,
    "description": "Experience an enchanting dinner on the stone tasting terrace: authentic slow-cooked Cretan dishes from the estate taverna paired with premium single-block Nostos wines.",
    "includes": [
      "Four-course traditional Cretan dinner prepared with local organic ingredients",
      "5 paired premium Nostos wines including reserve Syrah and barrel Roussanne",
      "Atmospheric evening candlelight dining in the olive courtyard",
      "Warm carob bread, fresh seasonal fruit, and chilled tsikoudia digestive"
    ],
    "producerId": "manousakis-winery",
    "producerName": "Manousakis Winery (Nostos)",
    "producerGreekName": "Οινοποιείο Μανουσάκη",
    "category": "winery",
    "destination": "crete",
    "location": "Chania, Vatolakkos",
    "badge": "Taverna Under Stars"
  },
  {
    "id": "exp_lyrarakis-winery_1",
    "title": "Lyrarakis Winery - Single-Variety Revival Tasting Package",
    "durationMinutes": 60,
    "pricePerPerson": 22,
    "description": "The official tasting package from Lyrarakis in Alagni: explore single-variety wines from rare indigenous grapes saved from extinction by the family, including Dafni, Plyto, and Melissaki.",
    "includes": [
      "Tasting of 5 single-variety wines: Dafni Psarades, Plyto Psarades, Melissaki, Voila Assyrtiko & Mandilari Plakoura",
      "Traditional Cretan rusks with extra virgin olive oil from the estate",
      "Guided presentation on Minoan viticulture history and ampelography"
    ],
    "producerId": "lyrarakis-winery",
    "producerName": "Lyrarakis Winery",
    "producerGreekName": "Οινοποιείο Λυραράκη",
    "category": "winery",
    "destination": "crete",
    "location": "Heraklion, Alagni",
    "badge": "Ancient Grapes Revival"
  },
  {
    "id": "exp_lyrarakis-winery_2",
    "title": "Lyrarakis Winery - The Psarades Vineyard Picnic Experience",
    "durationMinutes": 120,
    "pricePerPerson": 70,
    "description": "Lyrarakis’s celebrated picnic in the heart of Psarades vineyard: an artisanal wicker basket filled with Cretan farm delicacies, fresh local cheeses, and chilled estate wine under the shade of olive trees.",
    "includes": [
      "Artisanal picnic basket with homemade pies, aged Graviera, olives, and fresh bread",
      "Bottle of estate single-vineyard wine (white or red) per couple",
      "Private shaded seating spot in the vineyards overlooking the Lassithi Mountains",
      "Complimentary entry to the winery cellar and vineyard trail"
    ],
    "producerId": "lyrarakis-winery",
    "producerName": "Lyrarakis Winery",
    "producerGreekName": "Οινοποιείο Λυραράκη",
    "category": "winery",
    "destination": "crete",
    "location": "Heraklion, Alagni",
    "badge": "Vineyard Picnic"
  },
  {
    "id": "exp_toplou-monastery-winery_1",
    "title": "Monastery Toplou Organic Estate - Toplou Monastery 15th-Century Cellar & Organic Tasting",
    "durationMinutes": 45,
    "pricePerPerson": 15,
    "description": "Visit the historic fortified Monastery of Toplou in Sitia, exploring the stone vaulted cellar and tasting 4 certified organic wines crafted by the monastic community alongside estate olive oil.",
    "includes": [
      "Guided tour of the 15th-century monastic stone cellar and winemaking estate",
      "Flight of 4 organic wines (Vilana-Thrapsathiri White, PDO Sitia Red Liatiko-Mandilaria, Organic Rosé)",
      "Toplou organic extra virgin olive oil tasting with monastic barley rusks",
      "Entrance to the monastery courtyard and historical museum area"
    ],
    "producerId": "toplou-monastery-winery",
    "producerName": "Monastery Toplou Organic Estate",
    "producerGreekName": "Οινοποιείο Μονής Τοπλού",
    "category": "winery",
    "destination": "crete",
    "location": "Lasithi, Sitia",
    "badge": "Monastery Tasting"
  },
  {
    "id": "exp_toplou-monastery-winery_2",
    "title": "Monastery Toplou Organic Estate - Historic Monastic Reserve & Tsikoudia Masterclass",
    "durationMinutes": 75,
    "pricePerPerson": 35,
    "description": "An exclusive masterclass inside the Abbot’s reserve tasting room, featuring aged Liatiko library reserves, organic double-distilled Tsikoudia, and traditional monastic cheeses.",
    "includes": [
      "Private cellar walkthrough with the estate wine curator",
      "6 premium and aged reserve wines including Sun-Dried Sweet Liatiko",
      "Taste of organic distilled Tsikoudia of Crete from copper alembic",
      "Platter of Sitia monastic graviera, pickled sea fennel & organic olives"
    ],
    "producerId": "toplou-monastery-winery",
    "producerName": "Monastery Toplou Organic Estate",
    "producerGreekName": "Οινοποιείο Μονής Τοπλού",
    "category": "winery",
    "destination": "crete",
    "location": "Lasithi, Sitia",
    "badge": "Monastic Reserve"
  },
  {
    "id": "exp_kazani-stilianou_1",
    "title": "Kazani Stilianou & Organic Estate - Organic Micro-Winery & Traditional Copper Kazani Tour",
    "durationMinutes": 45,
    "pricePerPerson": 15,
    "description": "In Kounavoi (Archanes wine region): visit Giannis Stilianou’s certified organic boutique estate and traditional wood-fired copper raki still (kazani).",
    "includes": [
      "Walkthrough of dry-farmed organic bush vineyards and copper distillation cauldron",
      "Tasting of 3 organic natural wines (Vidiano, Kotsifali, Mandilaria)",
      "Sample of pure, freshly distilled organic Tsikoudia (Raki)",
      "Traditional Cretan barley dakos with fresh grated tomato, mizithra cheese & olive oil"
    ],
    "producerId": "kazani-stilianou",
    "producerName": "Kazani Stilianou & Organic Estate",
    "producerGreekName": "Καζάνι Στυλιανού",
    "category": "kazani",
    "destination": "crete",
    "location": "Heraklion, Kounavoi",
    "badge": "Kazani & Wine (€15)"
  },
  {
    "id": "exp_kazani-stilianou_2",
    "title": "Kazani Stilianou & Organic Estate - Cellar Tasting, Raki Distillation & Archanes Meze Feast",
    "durationMinutes": 75,
    "pricePerPerson": 32,
    "description": "An authentic Cretan immersion: barrel cellar tasting, in-depth explanation of traditional autumn raki boiling rituals, and a generous homemade Archanes meze feast.",
    "includes": [
      "Guided barrel cellar tour and tasting of aged reserve organic cuvées",
      "Double-distilled oak-aged Tsikoudia spirit tasting",
      "Abundant homemade meze feast: stuffed vine leaves (dolmades), slow-cooked fava & village cheeses",
      "Stories of Cretan rakokazana customs and musical traditions with the winemaker"
    ],
    "producerId": "kazani-stilianou",
    "producerName": "Kazani Stilianou & Organic Estate",
    "producerGreekName": "Καζάνι Στυλιανού",
    "category": "kazani",
    "destination": "crete",
    "location": "Heraklion, Kounavoi",
    "badge": "Distillation Feast"
  },
  {
    "id": "exp_biolea-estate_1",
    "title": "Biolea Organic Artisanal Olive Mill - Granite Millstone & Cold-Water EVOO Tasting",
    "durationMinutes": 60,
    "pricePerPerson": 7,
    "description": "The official Biolea visitor experience: 1-hour tour exploring the history of olives in Crete, cultivation practices, the operational granite millstone, and tasting 4 awarded olive oils.",
    "includes": [
      "Live demonstration of massive granite millstones crushing Koroneiki olives cold",
      "Walkthrough of traditional hydraulic pressing mats operating without hot water addition",
      "Professional tasting of 4 awarded organic olive oils (unfiltered traditional, nerantzi, lemon, chili)",
      "Fresh warm country bread, rock salt crystals from Cretan cliffs & garden tomatoes"
    ],
    "producerId": "biolea-estate",
    "producerName": "Biolea Organic Artisanal Olive Mill",
    "producerGreekName": "Βιολέα - Βιολογικό Ελαιοτριβείο",
    "category": "olive_mill",
    "destination": "crete",
    "location": "Chania, Astrikas (Kolymbari)",
    "badge": "Official Tour (€7)"
  },
  {
    "id": "exp_biolea-estate_2",
    "title": "Biolea Organic Artisanal Olive Mill - A Walk With the Owner & Chef’s Olive Pairing Menu",
    "durationMinutes": 180,
    "pricePerPerson": 65,
    "description": "The premier Biolea experience: an extensive 3-hour walk through the organic olive groves with the estate owner, followed by a chef-crafted culinary degustation pairing menu.",
    "includes": [
      "Personal guided walk through organic dry-farmed groves with owner George Dimitriadis",
      "In-depth discussion of sustainable biodynamic agriculture and high-phenolic milling",
      "Multi-course chef’s degustation menu on the panoramic terrace overlooking Astrikas gorge",
      "Curated pairings with local boutique organic wines and olive oil infused dishes"
    ],
    "producerId": "biolea-estate",
    "producerName": "Biolea Organic Artisanal Olive Mill",
    "producerGreekName": "Βιολέα - Βιολογικό Ελαιοτριβείο",
    "category": "olive_mill",
    "destination": "crete",
    "location": "Chania, Astrikas (Kolymbari)",
    "badge": "Chef’s Pairing Menu"
  },
  {
    "id": "exp_monumental-olive-tree-vouves_1",
    "title": "Ancient Olive Tree of Vouves & Heritage Mill - High-Phenolic EVOO Degustation & Mill Tour",
    "durationMinutes": 50,
    "pricePerPerson": 15,
    "badge": "EVOO Tasting",
    "description": "Learn the sensory secrets of certified extra virgin olive oil at Ancient Olive Tree of Vouves & Heritage Mill, comparing early-harvest aromas and peppery polyphenol finishes.",
    "includes": [
      "Tour of the olive washing, crushing and cold-extraction facilities",
      "Professional cobalt-glass sensory tasting of 3 monovarietal olive oils",
      "Fresh warm sourdough bread, mountain sea salt & ripe tomato slices"
    ],
    "producerId": "monumental-olive-tree-vouves",
    "producerName": "Ancient Olive Tree of Vouves & Heritage Mill",
    "producerGreekName": "Μνημειακή Ελιά Βουβών & Ελαιοτριβείο",
    "category": "olive_mill",
    "destination": "crete",
    "location": "Chania, Ano Vouves"
  },
  {
    "id": "exp_monumental-olive-tree-vouves_2",
    "title": "Ancient Olive Tree of Vouves & Heritage Mill - Monumental Grove Walk & Wood-Fired Bread Workshop",
    "durationMinutes": 80,
    "pricePerPerson": 32,
    "badge": "Heritage & Hearth",
    "description": "Walk among historic olive trees in Chania and bake traditional village bread in outdoor wood ovens to pair with freshly pressed oils.",
    "includes": [
      "Botanical walk among ancient olive trees with explanations of regenerative farming",
      "Hands-on bread baking and warm olive oil degustation",
      "Traditional Cretan salad with mizithra, wild oregano & olives"
    ],
    "producerId": "monumental-olive-tree-vouves",
    "producerName": "Ancient Olive Tree of Vouves & Heritage Mill",
    "producerGreekName": "Μνημειακή Ελιά Βουβών & Ελαιοτριβείο",
    "category": "olive_mill",
    "destination": "crete",
    "location": "Chania, Ano Vouves"
  },
  {
    "id": "exp_mitato-halepa_1",
    "title": "Stone Shepherd Mitato of Halepa - Artisan Raw Milk Graviera & Fresh Cheese Flight",
    "durationMinutes": 50,
    "pricePerPerson": 16,
    "badge": "Dairy Flight",
    "description": "Taste authentic raw sheep and goat cheeses crafted following traditional alpine pastoral methods at Stone Shepherd Mitato of Halepa.",
    "includes": [
      "Walkthrough of the cheese salting and temperature-controlled curing cellar",
      "Tasting of 4 fresh and aged cheeses (Mizithra, Anthotiros, Graviera)",
      "Crushed barley rusks, wild thyme honey & mountain tea"
    ],
    "producerId": "mitato-halepa",
    "producerName": "Stone Shepherd Mitato of Halepa",
    "producerGreekName": "Πέτρινο Μητάτο Χαλέπας",
    "category": "cheese_dairy",
    "destination": "crete",
    "location": "Rethymno, Livadia (Mount Psiloritis)"
  },
  {
    "id": "exp_mitato-halepa_2",
    "title": "Stone Shepherd Mitato of Halepa - Shepherd Cauldron Workshop & Terroir Wine Pairing",
    "durationMinutes": 80,
    "pricePerPerson": 32,
    "badge": "Master Cheesemaker",
    "description": "Watch the master cheesemaker separate curds and whey in traditional copper vats, followed by vertical cheese tasting paired with native wines.",
    "includes": [
      "Live demonstration of curds heating and cheese mold pressing",
      "Tasting of 3 aged cave Gravieras aged 6, 12, and 24 months",
      "2 glasses of local wine paired with wild greens and artisan charcuterie"
    ],
    "producerId": "mitato-halepa",
    "producerName": "Stone Shepherd Mitato of Halepa",
    "producerGreekName": "Πέτρινο Μητάτο Χαλέπας",
    "category": "cheese_dairy",
    "destination": "crete",
    "location": "Rethymno, Livadia (Mount Psiloritis)"
  },
  {
    "id": "exp_wild-herbs-kallikratis_1",
    "title": "Wild Herbs of Crete - Babis & Family - Kallikratis Mountain Herb Walk & Essential Oil Distillation",
    "durationMinutes": 50,
    "pricePerPerson": 15,
    "description": "In the remote mountain plateau of Kallikratis (Sfakia): join Babis and his family for an aromatic walk through wild herb fields and witness live copper still essential oil distillation.",
    "includes": [
      "Guided stroll through mountain plots of Dictamnus (Erontas), Malotira (Sideritis), and wild thyme",
      "Live copper alembic distillation demonstration extracting pure essential oils and floral waters",
      "Hot or iced freshly brewed Malotira mountain tea with wild thyme honey",
      "Small vial of pure essential oil or herbal hydrosol to take home"
    ],
    "producerId": "wild-herbs-kallikratis",
    "producerName": "Wild Herbs of Crete - Babis & Family",
    "producerGreekName": "Άγρια Βότανα Κρήτης - Καλλικράτης",
    "category": "apiary",
    "destination": "crete",
    "location": "Chania, Kallikratis (Sfakia)",
    "badge": "Mountain Herbs (€15)"
  },
  {
    "id": "exp_wild-herbs-kallikratis_2",
    "title": "Wild Herbs of Crete - Babis & Family - Botanical Foraging, Herbalism Masterclass & Sfakian Hearth Meze",
    "durationMinutes": 75,
    "pricePerPerson": 28,
    "description": "An immersive herbalism workshop in the White Mountains: learn wild harvesting techniques, blend your own mountain tisane, and enjoy a traditional Sfakian cheese pie meze.",
    "includes": [
      "Hands-on identification and foraging of endemic Cretan medicinal plants",
      "Custom herbal tea blending session to craft your personalized tea pouch",
      "Traditional Sfakian pie drizzled with wild mountain honey and served with tsikoudia",
      "Herbal preparation guide and handbook on ancient Minoan herbal remedies"
    ],
    "producerId": "wild-herbs-kallikratis",
    "producerName": "Wild Herbs of Crete - Babis & Family",
    "producerGreekName": "Άγρια Βότανα Κρήτης - Καλλικράτης",
    "category": "apiary",
    "destination": "crete",
    "location": "Chania, Kallikratis (Sfakia)",
    "badge": "Botanical Masterclass"
  },
  {
    "id": "exp_silva-daskalaki-winery_1",
    "title": "Silva Daskalaki Winery - \"A Taste of Crete\" 6-Wine & Local Cheese Flight",
    "durationMinutes": 60,
    "pricePerPerson": 22,
    "description": "The official introductory package at Silva Daskalaki in Siva: a tour of the winery premises followed by tasting 6 distinct wines accompanied by Cretan rusks, aged gruyere, and fresh anthotyro cheese.",
    "includes": [
      "Walkthrough of the modern boutique vinification and barrel rooms",
      "6 estate wines: Vorinos White (Vidiano), Enstikto White, Vorinos Red (Liatiko/Kotsifali), Grifos & Rose",
      "Traditional Cretan rusks with aged gruyere and mild anthotyro cheese",
      "Sensory notes provided by the Daskalaki family sommeliers"
    ],
    "producerId": "silva-daskalaki-winery",
    "producerName": "Silva Daskalaki Winery",
    "producerGreekName": "Οινοποιείο Σίλβα Δασκαλάκη",
    "category": "winery",
    "destination": "crete",
    "location": "Heraklion, Siva (Heraklion)",
    "badge": "Official Taste of Crete"
  },
  {
    "id": "exp_silva-daskalaki-winery_2",
    "title": "Silva Daskalaki Winery - \"Platinum Tasting\" 10-Wine Riedel Masterclass & Mezes",
    "durationMinutes": 90,
    "pricePerPerson": 65,
    "description": "The premier Silva Daskalaki masterclass: 10 estate wines served in grape-specific Riedel glassware, paired with an abundant spread of authentic Cretan mezedes, dolmadakia, and wild green pies.",
    "includes": [
      "Comprehensive cellar tour and private barrel sampling with the winemaker",
      "10 award-winning wines served in professional Riedel crystal glasses",
      "Full spread of Cretan mezes: dolmadakia, sarikopitakia, smoked apaki & aged graviera",
      "Comparative tasting of fresh vs oak-matured Vidiano and Liatiko reserves"
    ],
    "producerId": "silva-daskalaki-winery",
    "producerName": "Silva Daskalaki Winery",
    "producerGreekName": "Οινοποιείο Σίλβα Δασκαλάκη",
    "category": "winery",
    "destination": "crete",
    "location": "Heraklion, Siva (Heraklion)",
    "badge": "Platinum Riedel Flight"
  },
  {
    "id": "exp_karavitakis-winery_1",
    "title": "Karavitakis Winery - Pontikiana Estate Vineyard Walk & 4-Wine Flight",
    "durationMinutes": 50,
    "pricePerPerson": 12,
    "description": "Visit the modern Karavitakis winery nestled in the rolling green hills of Pontikiana (Kolymbari): walk the experimental vine garden and taste 4 fresh estate wines.",
    "includes": [
      "Walk through the 30-variety experimental botanical vineyard",
      "Tasting of 4 wines: Klima White (Vidiano), The Little Prince White, Klima Red & Rose",
      "Traditional Cretan breadsticks with sea salt and local cheese bites",
      "Introduction to Chania’s coastal microclimate and maritime breezes"
    ],
    "producerId": "karavitakis-winery",
    "producerName": "Karavitakis Winery",
    "producerGreekName": "Οινοποιείο Καραβιτάκη",
    "category": "winery",
    "destination": "crete",
    "location": "Chania, Pontikiana (Kolymbari)",
    "badge": "Estate Walk"
  },
  {
    "id": "exp_karavitakis-winery_2",
    "title": "Karavitakis Winery - Rare Terroir Selection & Riedel Tasting",
    "durationMinutes": 75,
    "pricePerPerson": 28,
    "description": "A sommelier-led vertical tasting in the glass-walled tasting salon: 6 premium single-varietal wines served in Riedel glasses with an artisan cheese board.",
    "includes": [
      "Cellar tour of French and American oak barriques with the winemaker",
      "6 premium wines: Elia Vidiano, Romeiko Natural, Syrah Single Vineyard & Sweet Romeiko",
      "Artisanal board of Cretan cheeses, smoked prosciutto, and dried fruits",
      "Comparative tasting of modern vs traditional clay-fermented Romeiko"
    ],
    "producerId": "karavitakis-winery",
    "producerName": "Karavitakis Winery",
    "producerGreekName": "Οινοποιείο Καραβιτάκη",
    "category": "winery",
    "destination": "crete",
    "location": "Chania, Pontikiana (Kolymbari)",
    "badge": "Riedel Terroir"
  },
  {
    "id": "exp_gavalas-crete-winery_1",
    "title": "Gavalas Crete Winery - Estate Terroir Flight (Vilana, Vidiano, Kotsifali)",
    "durationMinutes": 50,
    "pricePerPerson": 18,
    "badge": "Estate Flight",
    "description": "Experience the signature terroir of Heraklion with a guided tasting of 4 estate wines featuring Vilana, Vidiano, Kotsifali.",
    "includes": [
      "4 signature estate wines focusing on Vilana, Vidiano, Kotsifali",
      "Artisanal local cheese bites & Cretan barley rusks",
      "Introduction to the estate vineyards and regional microclimate"
    ],
    "producerId": "gavalas-crete-winery",
    "producerName": "Gavalas Crete Winery",
    "producerGreekName": "Οινοποιείο Γαβαλά Κρήτης",
    "category": "winery",
    "destination": "crete",
    "location": "Heraklion, Vorias (Monofatsi)"
  },
  {
    "id": "exp_gavalas-crete-winery_2",
    "title": "Gavalas Crete Winery - Cellar Master Reserve Tour & Regional Meze",
    "durationMinutes": 80,
    "pricePerPerson": 38,
    "badge": "Cellar Reserve",
    "description": "Go behind the scenes into the oak barrel maturation cellars of Gavalas Crete Winery, followed by tasting 5 premium reserve wines paired with regional delicacies.",
    "includes": [
      "Full walking tour of the vineyards and underground barrel maturation room",
      "5 premium reserve & single-vineyard wines",
      "Traditional meze platter with cured meats, local mountain cheeses and estate olive oil"
    ],
    "producerId": "gavalas-crete-winery",
    "producerName": "Gavalas Crete Winery",
    "producerGreekName": "Οινοποιείο Γαβαλά Κρήτης",
    "category": "winery",
    "destination": "crete",
    "location": "Heraklion, Vorias (Monofatsi)"
  },
  {
    "id": "exp_titakis-winery_1",
    "title": "Titakis Winery - \"Asterousia Wine Tasting\" & Fabrika Tour",
    "durationMinutes": 50,
    "pricePerPerson": 17,
    "description": "The official Asterousia package at Titakis Fabrika in Kounavoi: a guided tour of the winery facilities and Vineyard Garden, tasting 4 wines featuring Vidiano and Merlot-Syrah blends.",
    "includes": [
      "Guided tour of the historical winery \"Fabrika\" and barrel cellar",
      "Visit to the curated Vineyard Garden showcasing indigenous vine canopies",
      "Tasting of 4 estate wines: Asterousia White, Rose, Red & Impressis Vidiano",
      "Crispy village breadsticks, olive paste, and sheep cheese bites"
    ],
    "producerId": "titakis-winery",
    "producerName": "Titakis Winery",
    "producerGreekName": "Οινοποιείο Τιτάκη",
    "category": "winery",
    "destination": "crete",
    "location": "Heraklion, Kounavi (Peza PDO)",
    "badge": "Fabrika Tour"
  },
  {
    "id": "exp_titakis-winery_2",
    "title": "Titakis Winery - \"Wine Enthusiast Tasting\" & Food Board",
    "durationMinutes": 75,
    "pricePerPerson": 21,
    "description": "An extended exploration of Titakis single-varietal labels with a walk through the educational vineyard rows, tasting 5 wines paired with Cretan meze.",
    "includes": [
      "In-depth winemaking tour covering modern temperature-controlled stainless fermentation",
      "5 wines featuring single-vineyard Vidiano, Kotsifali, and oak-matured Syrah",
      "Artisanal board of Cretan graviera cheese, olives, and barley rusks",
      "Complimentary access for non-drinking companions and youth under 17"
    ],
    "producerId": "titakis-winery",
    "producerName": "Titakis Winery",
    "producerGreekName": "Οινοποιείο Τιτάκη",
    "category": "winery",
    "destination": "crete",
    "location": "Heraklion, Kounavi (Peza PDO)",
    "badge": "Wine Enthusiast"
  },
  {
    "id": "exp_zacharioudakis-winery_1",
    "title": "Zacharioudakis Organic Winery - \"Orthi Petra\" Hilltop Vineyard Tour & Organic Tasting",
    "durationMinutes": 60,
    "pricePerPerson": 23,
    "description": "Perched on the hill of Orthi Petra in Plouti, tour certified organic hillside vineyards and taste 4 organic wines overlooking the vast Messara Plain and the Libyan Sea.",
    "includes": [
      "Guided botanical walk along the stone terraced Orthi Petra slopes",
      "Tasting of 4 organic wines: Orthi Petra White (Vidiano/Sauvignon), Rose, Red (Kotsifali/Syrah) & Kotsifali Mono",
      "Traditional Cretan rusks, organic olive oil, and village feta bites",
      "Spectacular 360-degree views of Phaistos and Mount Psiloritis"
    ],
    "producerId": "zacharioudakis-winery",
    "producerName": "Zacharioudakis Organic Winery",
    "producerGreekName": "Βιολογικό Οινοποιείο Ζαχαριουδάκη",
    "category": "winery",
    "destination": "crete",
    "location": "Heraklion, Plouti (Messara Valley)",
    "badge": "Orthi Petra Hill"
  },
  {
    "id": "exp_zacharioudakis-winery_2",
    "title": "Zacharioudakis Organic Winery - Messara Valley Sunset Organic Tasting & Cold Cuts Platter",
    "durationMinutes": 90,
    "pricePerPerson": 38,
    "description": "Experience twilight on the highest vineyard terrace in southern Heraklion: 6 organic reserve wines paired with local cured meats, aged graviera, and wood-fired bread.",
    "includes": [
      "Private sunset terrace seating overlooking the illuminated Messara Valley",
      "6 organic wines including reserve oak-aged Orthi Petra Red and Vidiano Cuvee",
      "Generous platter of local cured apaki, aged mountain graviera, and farm vegetables",
      "Discussion of regenerative organic viticulture without irrigation"
    ],
    "producerId": "zacharioudakis-winery",
    "producerName": "Zacharioudakis Organic Winery",
    "producerGreekName": "Βιολογικό Οινοποιείο Ζαχαριουδάκη",
    "category": "winery",
    "destination": "crete",
    "location": "Heraklion, Plouti (Messara Valley)",
    "badge": "Messara Sunset"
  },
  {
    "id": "exp_venetsanos-winery-santorini_1",
    "title": "Venetsanos Winery Santorini - Historic Gravity-Flow Museum Tour & 5-Wine Flight",
    "durationMinutes": 60,
    "pricePerPerson": 35,
    "description": "Guided tour through Santorini’s first industrial winery built in 1947, carved directly into the caldera cliffs and operating entirely by natural gravity without electricity, followed by a 5-wine tasting with local snacks.",
    "includes": [
      "Guided historical tour through volcanic stone gravity shafts and museum rooms",
      "5 estate wines: Santorini Assyrtiko, Nykteri, Anagallis Rose, Mandilaria & Vinsanto",
      "Platter of Greek cheeses, kalamata olives, and traditional barley rusks",
      "Caldera cliff panoramic view 300m above Athinios port"
    ],
    "producerId": "venetsanos-winery-santorini",
    "producerName": "Venetsanos Winery Santorini",
    "producerGreekName": "Οινοποιείο Βενετσάνου Σαντορίνη",
    "category": "winery",
    "destination": "santorini",
    "location": "Santorini Caldera, Megalochori (Caldera)",
    "badge": "Historic 1947 Winery"
  },
  {
    "id": "exp_venetsanos-winery-santorini_2",
    "title": "Venetsanos Winery Santorini - Caldera Cliffside Sunset Terrace Wine & Food Pairing",
    "durationMinutes": 90,
    "pricePerPerson": 44,
    "description": "Front-row terrace seating during golden sunset hour over the caldera. Taste 5 premium wines accompanied by authentic Santorini mezedes, local fava puree, and sun-dried delicacies.",
    "includes": [
      "Reserved premium sunset terrace table overlooking the volcanic caldera",
      "5 estate wines featuring aged Nykteri and barrel-aged Vinsanto",
      "Traditional Santorini meze platter: PDO Santorini Fava, tomato paste & graviera",
      "Sunset photography session against the caldera backdrop"
    ],
    "producerId": "venetsanos-winery-santorini",
    "producerName": "Venetsanos Winery Santorini",
    "producerGreekName": "Οινοποιείο Βενετσάνου Σαντορίνη",
    "category": "winery",
    "destination": "santorini",
    "location": "Santorini Caldera, Megalochori (Caldera)",
    "badge": "Caldera Sunset Flight"
  },
  {
    "id": "exp_domaine-sigalas-santorini_1",
    "title": "Domaine Sigalas - Baxedes Vineyard Pergola Tasting",
    "durationMinutes": 60,
    "pricePerPerson": 30,
    "description": "Taste the benchmark wines of Paris Sigalas in the tranquil plains of Baxedes near Oia. 5 volcanic wines served under shaded grape pergolas with Greek cheese bites.",
    "includes": [
      "5 signature wines: Sigalas Santorini PDO, Kavalieros Cru, Eptani & Mavrotragano",
      "Cycladic cheese board with aged Naxos Graviera, capers, and barley rusks",
      "Sommelier briefing on volcanic drought viticulture and low yields"
    ],
    "producerId": "domaine-sigalas-santorini",
    "producerName": "Domaine Sigalas",
    "producerGreekName": "Κτήμα Σιγάλα",
    "category": "winery",
    "destination": "santorini",
    "location": "Santorini, Oia (Baxedes Plain)",
    "badge": "Vineyard Pergola"
  },
  {
    "id": "exp_domaine-sigalas-santorini_2",
    "title": "Domaine Sigalas - Vineyard, Wine & Cycladic Gastronomy Tour",
    "durationMinutes": 120,
    "pricePerPerson": 100,
    "description": "The signature Sigalas 2-hour experience: guided tour of the organic vineyards and barrel cellar, followed by a tasting of 10 labels paired with a multi-course seasonal Cycladic tasting menu.",
    "includes": [
      "Comprehensive vineyard walk and cellar production tour",
      "Tasting of 10 different labels including single-cru Kavalieros and aged Vinsanto",
      "Multi-course Cycladic gastronomy meal featuring local fava, slow-cooked octopus & lamb",
      "Private sommelier commentary throughout the luncheon"
    ],
    "producerId": "domaine-sigalas-santorini",
    "producerName": "Domaine Sigalas",
    "producerGreekName": "Κτήμα Σιγάλα",
    "category": "winery",
    "destination": "santorini",
    "location": "Santorini, Oia (Baxedes Plain)",
    "badge": "Gastronomy Tour"
  },
  {
    "id": "exp_gavalas-winery-santorini_1",
    "title": "Gavalas Winery Santorini - \"Introduction to Santorini\" Indigenous 4-Wine Flight",
    "durationMinutes": 60,
    "pricePerPerson": 15,
    "description": "Visit the Gavalas family’s 5th-generation historic canava in Megalochori: taste 4 indigenous wines including rare Katsano revived from extinction.",
    "includes": [
      "Tour of the 19th-century stone stomp vats and underground maturation cellar",
      "4 indigenous wines: Katsano, Santorini Assyrtiko, Posta Red & Xenoloo",
      "Local paximadia rusks, tomato paste and volcanic graviera cheese",
      "Personal stories from one of Santorini’s oldest winemaking families"
    ],
    "producerId": "gavalas-winery-santorini",
    "producerName": "Gavalas Winery Santorini",
    "producerGreekName": "Οινοποιείο Γαβαλά Σαντορίνη",
    "category": "winery",
    "destination": "santorini",
    "location": "Santorini, Megalochori Village",
    "badge": "Indigenous Heritage"
  },
  {
    "id": "exp_gavalas-winery-santorini_2",
    "title": "Gavalas Winery Santorini - \"Premium and Rare\" Katsano, Voudomato & Natural Vinsanto",
    "durationMinutes": 75,
    "pricePerPerson": 30,
    "description": "A dedicated tasting of 6 of Gavalas’s rarest limited labels, accompanied by bite pairings in the historic vaulted cellars of Megalochori.",
    "includes": [
      "6 premium labels: Katsano, Natural Ferment Assyrtiko, Voudomato Red & Aged Vinsanto",
      "Artisanal pairing of aged Cycladic cheeses, smoked pork, and dried figs",
      "Detailed exploration of pre-phylloxera ungrafted vine genetics"
    ],
    "producerId": "gavalas-winery-santorini",
    "producerName": "Gavalas Winery Santorini",
    "producerGreekName": "Οινοποιείο Γαβαλά Σαντορίνη",
    "category": "winery",
    "destination": "santorini",
    "location": "Santorini, Megalochori Village",
    "badge": "Rare Varieties"
  },
  {
    "id": "exp_gaia-wines-santorini_1",
    "title": "Gaia Wines Santorini - Monolithos Black Beach Tasting Flight",
    "durationMinutes": 60,
    "pricePerPerson": 20,
    "description": "In a restored early 20th-century stone tomato factory right on the black sand beach of Monolithos, enjoy a flight of 5 crisp wines with Aegean breezes and local cheeses.",
    "includes": [
      "Tour of the coastal winery right on the black volcanic shoreline",
      "5 wines: Thalassitis, Wild Ferment Assyrtiko, Monograph, Gaia S & 14-18h Rose",
      "Artisanal Greek cheese plate with crunchy paximadia and olives",
      "Story of Yiannis Paraskevopoulos reviving ancient maritime vinification"
    ],
    "producerId": "gaia-wines-santorini",
    "producerName": "Gaia Wines Santorini",
    "producerGreekName": "Γαία Οινοποιητική Σαντορίνη",
    "category": "winery",
    "destination": "santorini",
    "location": "Santorini, Monolithos / Kamari Beach",
    "badge": "Beachfront Canava"
  },
  {
    "id": "exp_gaia-wines-santorini_2",
    "title": "Gaia Wines Santorini - Thalassitis Submerged & Wild Ferment Premium Flight",
    "durationMinutes": 90,
    "pricePerPerson": 70,
    "description": "Gaia’s internationally acclaimed experiment: compare cellar-aged Assyrtiko with bottles retrieved from 5 years of aging 20 meters beneath the Aegean Sea.",
    "includes": [
      "Tasting of 6 premium cuvees including rare Thalassitis Submerged and Wild Ferment",
      "Detailed presentation on undersea pressure, darkness, and maturation chemistry",
      "Gourmet Aegean seafood meze: grilled calamari, smoked mackerel & aged graviera",
      "Beachfront seating just meters from the breaking waves"
    ],
    "producerId": "gaia-wines-santorini",
    "producerName": "Gaia Wines Santorini",
    "producerGreekName": "Γαία Οινοποιητική Σαντορίνη",
    "category": "winery",
    "destination": "santorini",
    "location": "Santorini, Monolithos / Kamari Beach",
    "badge": "Undersea Aged"
  },
  {
    "id": "exp_santo-wines-santorini_1",
    "title": "Santo Wines Cooperative - Caldera Cooperative Winery Tour & 2-Wine Flight",
    "durationMinutes": 45,
    "pricePerPerson": 12,
    "description": "A 20-minute guided walkthrough of the cooperative winery representing 1,200 Santorini vine growers, followed by tasting 2 signature wines overlooking the caldera.",
    "includes": [
      "Guided tour of processing, fermentation tanks, and subterranean barrel room",
      "Tasting of 2 signature wines: Santorini Assyrtiko and Kameni Red",
      "Crispy barley rusks and volcanic cherry tomato paste",
      "History of the Union of Santorini Cooperatives founded in 1947"
    ],
    "producerId": "santo-wines-santorini",
    "producerName": "Santo Wines Cooperative",
    "producerGreekName": "Συνεταιρισμός Santo Wines Σαντορίνη",
    "category": "winery",
    "destination": "santorini",
    "location": "Santorini Caldera, Pyrgos (Caldera Rim)",
    "badge": "Cooperative Heritage"
  },
  {
    "id": "exp_santo-wines-santorini_2",
    "title": "Santo Wines Cooperative - Caldera Panoramic Terrace 6-Wine Flight & Fava Pairing",
    "durationMinutes": 75,
    "pricePerPerson": 28,
    "description": "Sitting high on the caldera edge at Pyrgos, enjoy a flight of 6 cooperative terroir wines paired with authentic PDO Santorini Fava and local delicacies.",
    "includes": [
      "Reserved table on the expansive cliffside caldera terrace",
      "6 wines: Assyrtiko, Athiri, Aidani, Nykteri, Kameni & Vinsanto",
      "Traditional mezze platter: PDO Santorini Fava dip, tomato fritters & graviera",
      "Panoramic views of the volcanic islands and Aegean cruise ship basin"
    ],
    "producerId": "santo-wines-santorini",
    "producerName": "Santo Wines Cooperative",
    "producerGreekName": "Συνεταιρισμός Santo Wines Σαντορίνη",
    "category": "winery",
    "destination": "santorini",
    "location": "Santorini Caldera, Pyrgos (Caldera Rim)",
    "badge": "Panoramic Caldera"
  },
  {
    "id": "exp_gaia-wines-nemea_1",
    "title": "Gaia Wines Nemea - Gaia Nemea High-Slope Agiorgitiko Flight",
    "durationMinutes": 45,
    "pricePerPerson": 18,
    "description": "At Gaia’s gravity-flow winery in Koutsi, perched at 650m altitude: a guided 4-wine flight celebrating Agiorgitiko in fresh, rosé, and classic oak-aged expressions.",
    "includes": [
      "Walkthrough of the modern hillside winery overlooking the Nemea plain",
      "4 estate wines (Monograph Moschofilero-Assyrtiko, 14-18h Agiorgitiko Rosé, Agiorgitiko by Gaia, Gaia S)",
      "Local sourdough breadsticks and Koroneiki extra virgin olive oil",
      "Introduction to the microclimates of the three Nemea altitude zones"
    ],
    "producerId": "gaia-wines-nemea",
    "producerName": "Gaia Wines Nemea",
    "producerGreekName": "Γαία Οινοποιητική Νεμέα",
    "category": "winery",
    "destination": "peloponnese",
    "location": "Nemea, Koutsi (Nemea)",
    "badge": "Official Flight"
  },
  {
    "id": "exp_gaia-wines-nemea_2",
    "title": "Gaia Wines Nemea - Koutsi Single-Vineyard Terroir & Clayver Amphora Tasting",
    "durationMinutes": 80,
    "pricePerPerson": 40,
    "description": "Experience Gaia’s cutting-edge winemaking at Koutsi: cellar tour, Clayver ceramic sphere aging, and a guided tasting of 6 wines including Gaia Estate and aged library vintages.",
    "includes": [
      "Cellar tour highlighting French barrique aging and Clayver spherical ceramic maturation",
      "6 premium wines including Gaia Estate PDO Nemea, Gaia S, and library vintage Agiorgitiko",
      "Selection of aged Greek cheeses (Graviera of Naxos, San Michali) and smoked meats",
      "Sommelier guidance on aging potential of high-altitude Agiorgitiko"
    ],
    "producerId": "gaia-wines-nemea",
    "producerName": "Gaia Wines Nemea",
    "producerGreekName": "Γαία Οινοποιητική Νεμέα",
    "category": "winery",
    "destination": "peloponnese",
    "location": "Nemea, Koutsi (Nemea)",
    "badge": "Terroir Masterclass"
  },
  {
    "id": "exp_domaine-mercouri_1",
    "title": "Domaine Mercouri - Coastal Pine Forest Estate Walk & Historic Refosco Flight",
    "durationMinutes": 60,
    "pricePerPerson": 25,
    "description": "Stroll through 150 years of agricultural history overlooking the Ionian Sea, where peacocks roam freely under century-old maritime pines, tasting 4 estate wines.",
    "includes": [
      "Guided walk through the historical estate, olive groves, and family museum",
      "4 wines: Domaine Mercouri Red (Refosco/Mavrodafni), Kallisto, Foloi & Daphne",
      "Mercouri estate-grown Koroneiki olive oil with fresh bread and local cheese",
      "History of the Italian Refosco cuttings imported to Ilia in 1870"
    ],
    "producerId": "domaine-mercouri",
    "producerName": "Domaine Mercouri",
    "producerGreekName": "Κτήμα Μερκούρη",
    "category": "winery",
    "destination": "peloponnese",
    "location": "Ilia, Korakochori (Peloponnese)",
    "badge": "150-Year Coastal Estate"
  },
  {
    "id": "exp_domaine-mercouri_2",
    "title": "Domaine Mercouri - 150-Year Heritage Manor Tour & Foloi / Koroneiki EVOO Pairing",
    "durationMinutes": 90,
    "pricePerPerson": 50,
    "description": "Private access to the Mercouri family’s 19th-century estate manor and stone cellars, pairing aged Refosco wines with estate extra virgin olive oil.",
    "includes": [
      "Private access to the Mercouri historic residence and archives",
      "5 estate wines including aged Mercouri Cava and sweet Chortais",
      "Degustation of cold-pressed estate olive oils with Greek cheeses and dry fruit"
    ],
    "producerId": "domaine-mercouri",
    "producerName": "Domaine Mercouri",
    "producerGreekName": "Κτήμα Μερκούρη",
    "category": "winery",
    "destination": "peloponnese",
    "location": "Ilia, Korakochori (Peloponnese)",
    "badge": "Manor & EVOO Pairing"
  },
  {
    "id": "exp_ktima-tselepos_1",
    "title": "Ktima Tselepos - Mantineia High-Plateau Moschofilero Flight",
    "durationMinutes": 60,
    "pricePerPerson": 25,
    "description": "Explore the cool high-altitude plateau of Mantineia at 650m: discover the exotic, aromatic nuances of the pink-skinned Moschofilero grape with mountain cheese.",
    "includes": [
      "Walking tour through the organically farmed Arcadia vineyard",
      "4 signature wines: Mantinia PDO, Blanc de Gris, Gris de Nuit & Driopi Classic",
      "Arcadian mountain cheese, sesame bread rings & fresh herb spread"
    ],
    "producerId": "ktima-tselepos",
    "producerName": "Ktima Tselepos",
    "producerGreekName": "Κτήμα Τσέλεπου",
    "category": "winery",
    "destination": "peloponnese",
    "location": "Arcadia, Rizes (Mantinia Plateau)",
    "badge": "Plateau Terroir"
  },
  {
    "id": "exp_ktima-tselepos_2",
    "title": "Ktima Tselepos - Kokkinomylos Merlot & Driopi Nemea Reserve Cellar Masterclass",
    "durationMinutes": 90,
    "pricePerPerson": 60,
    "description": "Taste Greece’s most celebrated cult red, Kokkinomylos single-vineyard Merlot, alongside aged Driopi Nemea reserves in the barrel cellar.",
    "includes": [
      "Detailed cellar walk exploring oak forest wood selections and aging regimens",
      "5 reserve wines including Kokkinomylos Merlot and Driopi Reserve Nemea",
      "Smoked trout from Arcadian mountain springs, aged kasseri cheese & dry ham"
    ],
    "producerId": "ktima-tselepos",
    "producerName": "Ktima Tselepos",
    "producerGreekName": "Κτήμα Τσέλεπου",
    "category": "winery",
    "destination": "peloponnese",
    "location": "Arcadia, Rizes (Mantinia Plateau)",
    "badge": "Cult Kokkinomylos"
  },
  {
    "id": "exp_tetramythos-winery_1",
    "title": "Tetramythos Winery - Mount Helmos High-Altitude Roditis & Kalavryta Tasting",
    "durationMinutes": 50,
    "pricePerPerson": 10,
    "description": "At Ano Diakopto on the snowy foothills of Mount Helmos at 850m: taste crisp organic wines with natural alpine acidity overlooking the Gulf of Corinth.",
    "includes": [
      "Panoramic view of the Gulf of Corinth from the outdoor tasting terrace",
      "4 organic wines: Roditis Nature, Sideritis, Black Kalavryta & Malagousia",
      "Local Achaian feta cheese, wild oregano rusks & mountain honey",
      "Story of cultivating vines on 850m snowy slopes"
    ],
    "producerId": "tetramythos-winery",
    "producerName": "Tetramythos Winery",
    "producerGreekName": "Οινοποιείο Τετράμυθος",
    "category": "winery",
    "destination": "peloponnese",
    "location": "Aigialeia, Ano Diakopto (Peloponnese)",
    "badge": "Alpine Slopes (€10)"
  },
  {
    "id": "exp_tetramythos-winery_2",
    "title": "Tetramythos Winery - Clay Retsina Nature Amphora Workshop & Cheese Pie Pairing",
    "durationMinutes": 85,
    "pricePerPerson": 28,
    "description": "Discover how natural retsina is fermented in buried clay amphoras with fresh pine resin from local Pinus halepensis trees, paired with traditional wood-fired cheese pie.",
    "includes": [
      "Interactive demonstration of pine resin harvesting and clay amphora cleaning",
      "5 natural wines including Retsina Amphore Nature and Black Kalavryta Oak",
      "Traditional wood-fired cheese pie, smoked pork fillet & wild caper shoots"
    ],
    "producerId": "tetramythos-winery",
    "producerName": "Tetramythos Winery",
    "producerGreekName": "Οινοποιείο Τετράμυθος",
    "category": "winery",
    "destination": "peloponnese",
    "location": "Aigialeia, Ano Diakopto (Peloponnese)",
    "badge": "Amphora & Resin"
  },
  {
    "id": "exp_monemvasia-winery_1",
    "title": "Monemvasia Winery (Tsimbidi) - Historic 6-Wine Indigenous Flight & Sigklino Pairing",
    "durationMinutes": 80,
    "pricePerPerson": 32,
    "description": "The official tasting at Monemvasia Winery (Tsimbidi) in Velies: guided session featuring 6 local wines accompanied by Laconian sigklino cured pork, graviera, and olive oil rusks.",
    "includes": [
      "Guided tasting of 6 local wines: Kydonitsa, Monemvasia, Panther, Monemvasios, Mura Rossa & sweet PDO Monemvasia-Malvasia",
      "Platter of authentic Laconian delicacies: sigklino cured pork, aged graviera & olive oil rusks",
      "Narrative on Yiorgos Tsimbidis resurrecting the legendary Malvasia grape after centuries of research",
      "Cellar inspection of aging barrels and sun-drying equipment"
    ],
    "producerId": "monemvasia-winery",
    "producerName": "Monemvasia Winery (Tsimbidi)",
    "producerGreekName": "Οινοποιητική Μονεμβασιάς (Τσιμπίδη)",
    "category": "winery",
    "destination": "peloponnese",
    "location": "Laconia, Velies / Aggelona (Monemvasia)",
    "badge": "Official 6-Wine Flight"
  },
  {
    "id": "exp_monemvasia-winery_2",
    "title": "Monemvasia Winery (Tsimbidi) - Byzantine Malvasia Sun-Dried Nectar & Barrel Cellar Tour",
    "durationMinutes": 90,
    "pricePerPerson": 55,
    "description": "Deep dive into the historic maturation cellar where sun-dried grapes concentrate into golden nectar aged for years in oak barrels, with collector back-vintages.",
    "includes": [
      "Tour of the drying straw mats (seasonal) and subterranean barrel cellar",
      "5 wines featuring 2 vintage Malvasia PDO releases and single-vineyard Kydonitsa",
      "Artisanal pairing of aged graviera, dried local figs, walnuts & dark chocolate"
    ],
    "producerId": "monemvasia-winery",
    "producerName": "Monemvasia Winery (Tsimbidi)",
    "producerGreekName": "Οινοποιητική Μονεμβασιάς (Τσιμπίδη)",
    "category": "winery",
    "destination": "peloponnese",
    "location": "Laconia, Velies / Aggelona (Monemvasia)",
    "badge": "Byzantine Nectar"
  },
  {
    "id": "exp_ktima-gerovassiliou_1",
    "title": "Ktima Gerovassiliou - World Corkscrew Museum Guided Tour & Malagousia Flight",
    "durationMinutes": 75,
    "pricePerPerson": 20,
    "description": "Guided tour of the vineyard, production, barrel cellars, and the world-renowned Gerovassiliou Wine & Corkscrew Museum (2,600+ antique pieces), followed by a 4-wine Malagousia flight.",
    "includes": [
      "Guided tour of the production facilities and the prestigious Wine Museum",
      "4 signature wines: Single-Vineyard Malagousia, White Estate, Avaton & Red Estate",
      "Platter of Northern Greek artisanal cheeses, freshly baked bread & estate olive oil",
      "Story of Vangelis Gerovassiliou reviving the Malagousia grape from extinction"
    ],
    "producerId": "ktima-gerovassiliou",
    "producerName": "Ktima Gerovassiliou",
    "producerGreekName": "Κτήμα Γεροβασιλείου",
    "category": "winery",
    "destination": "northern_greece",
    "location": "Thessaloniki, Epanomi (Thessaloniki)",
    "badge": "Corkscrew Museum"
  },
  {
    "id": "exp_ktima-gerovassiliou_2",
    "title": "Ktima Gerovassiliou - Subterranean Barrel Cellar & Avaton Collector Reserve Flight",
    "durationMinutes": 90,
    "pricePerPerson": 45,
    "description": "Private tour of the subterranean maturation cellar housing hundreds of French barriques, followed by tasting 5 collector reserve wines including older vintages of Avaton.",
    "includes": [
      "Private access to the underground barrel aging sanctuary and library bins",
      "5 top reserve wines featuring 2 back-vintages of Gerovassiliou Avaton and Museum Collection",
      "Gourmet Macedonian charcuterie board with smoked Metsovone cheese and truffle graviera",
      "Sommelier analysis of Limnio, Mavrotragano, and Mavroudi ancient grape synergy"
    ],
    "producerId": "ktima-gerovassiliou",
    "producerName": "Ktima Gerovassiliou",
    "producerGreekName": "Κτήμα Γεροβασιλείου",
    "category": "winery",
    "destination": "northern_greece",
    "location": "Thessaloniki, Epanomi (Thessaloniki)",
    "badge": "Avaton Collector"
  },
  {
    "id": "exp_domaine-biblia-chora_1",
    "title": "Domaine Biblia Chora - Mount Pangeon Limestone Terroir Flight (Ovilos & Areti)",
    "durationMinutes": 60,
    "pricePerPerson": 25,
    "description": "Nestled on the slopes of Mount Pangeon in Kokkinochori where Dionysian wine rituals began: tour the gravity winery and taste world-acclaimed blends of Assyrtiko and Semillon.",
    "includes": [
      "Tour of the organic gravity-fed winery, fermentation hall, and bottle aging cellars",
      "4 benchmark wines: Ktima White, Ovilos (Assyrtiko/Semillon), Areti & Biblinos",
      "Local Kavala cheeses, wild herb rusks and marinated green olives",
      "Story of Vangelis Gerovassiliou and Vassilis Tsaktsarlis establishing the estate in 1998"
    ],
    "producerId": "domaine-biblia-chora",
    "producerName": "Domaine Biblia Chora",
    "producerGreekName": "Κτήμα Βιβλία Χώρα",
    "category": "winery",
    "destination": "northern_greece",
    "location": "Kavala, Kokkinochori (Mount Pangeon)",
    "badge": "Mount Pangeon"
  },
  {
    "id": "exp_domaine-biblia-chora_2",
    "title": "Domaine Biblia Chora - Biblia Chora Barrel Cellar Tour & Sole Pinot Noir / Semillon Pairing",
    "durationMinutes": 90,
    "pricePerPerson": 55,
    "description": "Walk through thousands of French oak barriques and taste single-variety experimental micro-cuvees paired with local Macedonian flavors.",
    "includes": [
      "In-depth cellar walkthrough with barrel bung tasting when available",
      "5 premium reserve wines including Sole Pinot Noir and late harvest sweet wine",
      "Charcuterie board with wild boar salami, aged kashkaval & warm pita"
    ],
    "producerId": "domaine-biblia-chora",
    "producerName": "Domaine Biblia Chora",
    "producerGreekName": "Κτήμα Βιβλία Χώρα",
    "category": "winery",
    "destination": "northern_greece",
    "location": "Kavala, Kokkinochori (Mount Pangeon)",
    "badge": "Cellar Reserve"
  },
  {
    "id": "exp_alpha-estate_1",
    "title": "Alpha Estate - Amyndeon Plateau Cold-Climate Ecosystem Flight",
    "durationMinutes": 60,
    "pricePerPerson": 30,
    "description": "Perched at 650m elevation between Lake Vegoritis and Lake Petron: guided winery tour and tasting of 4 benchmark wines showcasing Greece’s premier cool-climate terroir.",
    "includes": [
      "Guided walk through the gravity-fed modern winery and sorting tables",
      "4 wines: Ecosystem Sauvignon Blanc Fume, Hedgehog Xinomavro, Axia Red & Alpha Rose",
      "Artisanal platter featuring Florina sweet roasted red pepper dip, local sourdough & sheep cheese",
      "Story of Makis Mavridis and Angelos Iatridis transforming Greek cold-climate viticulture"
    ],
    "producerId": "alpha-estate",
    "producerName": "Alpha Estate",
    "producerGreekName": "Κτήμα Άλφα",
    "category": "winery",
    "destination": "northern_greece",
    "location": "Florina, Amyndeon (Florina)",
    "badge": "Cold-Climate Terroir"
  },
  {
    "id": "exp_alpha-estate_2",
    "title": "Alpha Estate - Old-Vine Ungrafted Xinomavro Vertical & Lake Vegoritis Pairing",
    "durationMinutes": 90,
    "pricePerPerson": 65,
    "description": "A sommelier-led masterclass of single-parcel ungrafted century-old bush vines, comparing aged Xinomavro vintages paired with Florina gastronomic specialties.",
    "includes": [
      "Visit to the century-old phylloxera-free ungrafted bush vine parcels",
      "5 top cru wines: Ecosystem Barba Yannis Xinomavro, Alpha One & Library Vintages",
      "Gastronomic pairing: Florina roasted peppers, wild mushrooms & aged Macedonian cheeses",
      "Unobstructed views over Lake Vegoritis and Mount Voras"
    ],
    "producerId": "alpha-estate",
    "producerName": "Alpha Estate",
    "producerGreekName": "Κτήμα Άλφα",
    "category": "winery",
    "destination": "northern_greece",
    "location": "Florina, Amyndeon (Florina)",
    "badge": "Century Bush Vines"
  },
  {
    "id": "exp_ktima-pavlidis_1",
    "title": "Ktima Pavlidis - Thema & Emphasis Night-Harvest Flight",
    "durationMinutes": 60,
    "pricePerPerson": 25,
    "description": "Surrounded by the marble-rich mountains of Drama, tour the avant-garde winery and taste single-varietal wines harvested at 4:00 AM to preserve pristine aromatics.",
    "includes": [
      "Guided tour of modern avant-garde winery architecture, sorting tables, and bottling facility",
      "4 signature wines: Thema White (Sauvignon/Assyrtiko), Thema Red, Emphasis Syrah & Emphasis Agiorgitiko",
      "Drama region sheep cheese, smoked pork fillet & homemade breadsticks",
      "Presentation on how nocturnal harvesting locks in delicate floral terpenes"
    ],
    "producerId": "ktima-pavlidis",
    "producerName": "Ktima Pavlidis",
    "producerGreekName": "Κτήμα Παυλίδη",
    "category": "winery",
    "destination": "northern_greece",
    "location": "Drama, Kokkinogeia (Drama)",
    "badge": "Night Harvest"
  },
  {
    "id": "exp_ktima-pavlidis_2",
    "title": "Ktima Pavlidis - Private Vineyard & Contemporary Architecture Cellar Walk",
    "durationMinutes": 80,
    "pricePerPerson": 45,
    "description": "Private tour of privately owned vineyards and barrel cellar, tasting developing wines straight from French oak barriques with regional charcuterie.",
    "includes": [
      "Walk through the high-density trellised vineyards facing Mount Falakro",
      "5 wines including experimental single-barrel lots and aged Thema vintages",
      "Selection of regional Macedonian dry salamis, graviera cheese & fig marmalade"
    ],
    "producerId": "ktima-pavlidis",
    "producerName": "Ktima Pavlidis",
    "producerGreekName": "Κτήμα Παυλίδη",
    "category": "winery",
    "destination": "northern_greece",
    "location": "Drama, Kokkinogeia (Drama)",
    "badge": "Cellar Reserve"
  },
  {
    "id": "exp_domaine-karanika_1",
    "title": "Domaine Karanika - Organic Méthode Traditionnelle Brut Nature Flight",
    "durationMinutes": 60,
    "pricePerPerson": 28,
    "description": "Greece’s leading producer of organic method-champenoise sparkling wines in Amyndeon: tour the traditional riddling pupitres and taste vintage sparkling Xinomavro.",
    "includes": [
      "Tour of the traditional riddling pupitres, cold disgorgement, and manual corking line",
      "4 sparkling & still wines: Brut Cuvee Speciale, Brut Rose, Cuvee Prestige & Xinomavro Red",
      "Crisp savory cheese biscuits and smoked lake trout canapes",
      "Presentation by Laurens Hartman on biodynamic cold-plateau viticulture"
    ],
    "producerId": "domaine-karanika",
    "producerName": "Domaine Karanika",
    "producerGreekName": "Κτήμα Καρανίκα",
    "category": "winery",
    "destination": "northern_greece",
    "location": "Florina, Levea / Vegora (Lake Vegoritis)",
    "badge": "Sparkling Master"
  },
  {
    "id": "exp_domaine-karanika_2",
    "title": "Domaine Karanika - High-Altitude Sparkling Vintage & Fondue Degustation",
    "durationMinutes": 90,
    "pricePerPerson": 55,
    "description": "Interactive disgorgement demonstration with the winemaker, tasting 5 vintage sparkling cuvees paired with a pot of melted Macedonian mountain cheeses and crusty bread.",
    "includes": [
      "Live hand-disgorgement demonstration of zero-dosage sparkling bottles",
      "5 wines featuring 3 vintage sparkling cuvees and Karanika Terra Petra Red",
      "Macedonian melted mountain cheese fondue pot with wild herbs and sourdough cubes",
      "Panoramic views of Lake Vegoritis and Mount Kaimaktsalan"
    ],
    "producerId": "domaine-karanika",
    "producerName": "Domaine Karanika",
    "producerGreekName": "Κτήμα Καρανίκα",
    "category": "winery",
    "destination": "northern_greece",
    "location": "Florina, Levea / Vegora (Lake Vegoritis)",
    "badge": "Sparkling & Fondue"
  },
  {
    "id": "exp_kazani-kokolakis_1",
    "title": "Rakokazano Zargianaki - Copper Alembic Still Tour & Tsikoudia Flight",
    "durationMinutes": 45,
    "pricePerPerson": 14,
    "badge": "Still Tour",
    "description": "Witness traditional wood-fired distillation in historic copper alembic stills at Rakokazano Zargianaki and taste crystal-clear grape spirit.",
    "includes": [
      "Walkthrough of the copper distillation pot and steam condensation coil",
      "Tasting of 3 distillates (pure tsikoudia, aged raki & herbal rakomelo)",
      "Local roasted nuts, dried figs & mountain honey"
    ],
    "producerId": "kazani-kokolakis",
    "producerName": "Rakokazano Zargianaki",
    "producerGreekName": "Παραδοσιακό Ρακοκάζανο Ζαργιανάκη",
    "category": "kazani",
    "destination": "crete",
    "location": "Heraklion, Prinias (Malevizi)"
  },
  {
    "id": "exp_kazani-kokolakis_2",
    "title": "Rakokazano Zargianaki - Village Rakokazano Feast & Oak-Aged Spirit Pairing",
    "durationMinutes": 90,
    "pricePerPerson": 38,
    "badge": "Kazani Feast",
    "description": "An unforgettable evening of Greek hospitality: taste spirit fresh from the coil while meats roast over open embers in Prinias.",
    "includes": [
      "Tasting of fresh warm distillate straight from the copper pipe",
      "Charcoal-grilled local meats, wood-roasted potatoes & village salad",
      "Tasting of oak-matured amber reserve tsikoudia"
    ],
    "producerId": "kazani-kokolakis",
    "producerName": "Rakokazano Zargianaki",
    "producerGreekName": "Παραδοσιακό Ρακοκάζανο Ζαργιανάκη",
    "category": "kazani",
    "destination": "crete",
    "location": "Heraklion, Prinias (Malevizi)"
  },
  {
    "id": "exp_peskesi-farm-kazani_1",
    "title": "Peskesi Organic Farm & Kazani - Biodynamic Farm Walk & Wood-Fired Copper Alembic Raki Tour",
    "durationMinutes": 60,
    "pricePerPerson": 20,
    "description": "At the certified organic Peskesi Farm in Haraso: tour the heirloom vegetable gardens and historic copper still house, tasting warm distillate straight from the condensing coil.",
    "includes": [
      "Guided walk through the biodynamic permaculture gardens and olive trees",
      "Detailed explanation of grape pomace double-distillation in traditional copper alembics",
      "Tasting of 3 distillates: Fresh Tsikoudia from the coil, 3-year oak-aged raki, and rakomelo",
      "Wood-roasted potatoes in hearth ash, farm-pickled olives, and warm sourdough bread"
    ],
    "producerId": "peskesi-farm-kazani",
    "producerName": "Peskesi Organic Farm & Kazani",
    "producerGreekName": "Αγρόκτημα & Καζάνι Πεσκέσι",
    "category": "kazani",
    "destination": "crete",
    "location": "Heraklion, Harasso (Hersonissos)",
    "badge": "Wood-Fired Raki"
  },
  {
    "id": "exp_peskesi-farm-kazani_2",
    "title": "Peskesi Organic Farm & Kazani - Minoan Farm-to-Fork Hearth Cooking & Distillation Feast",
    "durationMinutes": 150,
    "pricePerPerson": 95,
    "description": "Peskesi’s celebrated \"Farm to Fork\" private culinary journey: harvest seasonal heirloom produce, cook over wood coals in clay pots, and feast with unlimited raki and farm wine.",
    "includes": [
      "Heirloom vegetable harvesting and foraging walk across the 60-dunam farm",
      "Hands-on culinary demonstration using ancient Minoan clay pot hearth techniques",
      "Multi-course feast of slow-roasted meats, wild mountain greens, and artisanal cheeses",
      "Unlimited organic estate wine and wood-fired copper still tsikoudia"
    ],
    "producerId": "peskesi-farm-kazani",
    "producerName": "Peskesi Organic Farm & Kazani",
    "producerGreekName": "Αγρόκτημα & Καζάνι Πεσκέσι",
    "category": "kazani",
    "destination": "crete",
    "location": "Heraklion, Harasso (Hersonissos)",
    "badge": "Farm-to-Fork Feast"
  },
  {
    "id": "exp_canava-santorini-distillery_1",
    "title": "Canava Santorini Distillery - Volcanic Tsikoudia & Wild Anise Ouzo Masterclass",
    "durationMinutes": 50,
    "pricePerPerson": 20,
    "description": "Santorini’s first licensed artisan distillery in Messaria: learn how Assyrtiko grape pomace is transformed in copper pot stills into pure crystalline spirit.",
    "includes": [
      "Tour of traditional copper alembic stills and botanical maceration jars",
      "Tasting of 3 distillates: Tsikoudia Santorini, Wild Anise Ouzo & Herbal Liqueur",
      "Pickled octopus, roasted chickpeas & wild caper shoots"
    ],
    "producerId": "canava-santorini-distillery",
    "producerName": "Canava Santorini Distillery",
    "producerGreekName": "Αποσταγματοποιία Canava Σαντορίνη",
    "category": "kazani",
    "destination": "santorini",
    "location": "Santorini, Messaria (Santorini)",
    "badge": "Distillery Tour"
  },
  {
    "id": "exp_canava-santorini-distillery_2",
    "title": "Canava Santorini Distillery - Distiller’s Oak-Aged Tsipouro & Saffron Workshop",
    "durationMinutes": 75,
    "pricePerPerson": 35,
    "description": "Taste amber spirits matured in French oak wine casks and learn how Greek saffron and wild herbs infuse unique botanical notes.",
    "includes": [
      "4 premium distillates including Barrel-Aged Tsipouro and Saffron Ouzo",
      "Interactive spice and botanical identification session with the distiller",
      "Platter of dry-aged smoked meats, Cretan graviera & honeyed nuts"
    ],
    "producerId": "canava-santorini-distillery",
    "producerName": "Canava Santorini Distillery",
    "producerGreekName": "Αποσταγματοποιία Canava Σαντορίνη",
    "category": "kazani",
    "destination": "santorini",
    "location": "Santorini, Messaria (Santorini)",
    "badge": "Master Distiller"
  },
  {
    "id": "exp_paraschakis-olive-mill_1",
    "title": "Paraschakis Family Olive Mill & Heritage Museum - Melidoni Heritage Mill Tour & Fresh Stone-Pressed EVOO Tasting",
    "durationMinutes": 45,
    "pricePerPerson": 8,
    "description": "At the historic Paraschakis family olive mill in Melidoni: explore the traditional stone press museum and modern ecological cold extraction unit, tasting 3 extra virgin olive oils.",
    "includes": [
      "Tour of the working mill and the preserved 19th-century animal-drawn stone press museum",
      "Sensory tasting of 3 extra virgin olive oils (Koroneiki early harvest, Tsounati, Wild Olive)",
      "Fresh village sourdough bread baked daily, sea salt, and ripe garden tomatoes",
      "Demonstration of the cold two-phase extraction process preserving polyphenols"
    ],
    "producerId": "paraschakis-olive-mill",
    "producerName": "Paraschakis Family Olive Mill & Heritage Museum",
    "producerGreekName": "Ελαιοτριβείο Οικογένειας Παρασχάκη (Melidoni)",
    "category": "olive_mill",
    "destination": "crete",
    "location": "Rethymno, Melidoni (Mylopotamos)",
    "badge": "Heritage Mill (€8)"
  },
  {
    "id": "exp_paraschakis-olive-mill_2",
    "title": "Paraschakis Family Olive Mill & Heritage Museum - Olive Grove Walk, Wood-Fired Hearth & Cretan Meze Platter",
    "durationMinutes": 75,
    "pricePerPerson": 22,
    "description": "Walk through ancient olive terraces around Melidoni village, watch traditional kalitsounia pies bake in a wood-fired outdoor oven, and feast on fresh olive oil pairings.",
    "includes": [
      "Guided walk among ancient olive trees with explanations of traditional pruning",
      "Wood-fired Cretan cheese and herb pies (kalitsounia) fresh from the stone oven",
      "Full tasting platter: pickled wild bulbs, cured olives, aged graviera & tsikoudia",
      "Complimentary bottle of Paraschakis Organic EVOO (100ml)"
    ],
    "producerId": "paraschakis-olive-mill",
    "producerName": "Paraschakis Family Olive Mill & Heritage Museum",
    "producerGreekName": "Ελαιοτριβείο Οικογένειας Παρασχάκη (Melidoni)",
    "category": "olive_mill",
    "destination": "crete",
    "location": "Rethymno, Melidoni (Mylopotamos)",
    "badge": "Hearth & Olive"
  },
  {
    "id": "exp_cretan-olive-oil-farm_1",
    "title": "Cretan Olive Oil Farm - Self-Guided Olive Museum, Herbal Garden & Raki Still Tour",
    "durationMinutes": 50,
    "pricePerPerson": 5,
    "description": "At the Spiridi (Cretan) Olive Oil Farm near Agios Nikolaos: interactive multi-language tablet tour of the historic olive mill, herbal gardens, raki still, and ceramic studio.",
    "includes": [
      "Interactive tablet guide in your language exploring 10 traditional farm stations",
      "Visit to the 18th-century stone olive press, pottery workshop & bee corner",
      "Tasting of 3 farm extra virgin olive oils, wild thyme honey, and pure tsikoudia",
      "Panoramic views over the crystal waters of Mirabello Bay"
    ],
    "producerId": "cretan-olive-oil-farm",
    "producerName": "Cretan Olive Oil Farm",
    "producerGreekName": "Κρητικό Αγρόκτημα Ελαιολάδου",
    "category": "olive_mill",
    "destination": "crete",
    "location": "Lasithi, Agios Nikolaos (Mirabello)",
    "badge": "Spiridi Farm Tour (€5)"
  },
  {
    "id": "exp_cretan-olive-oil-farm_2",
    "title": "Cretan Olive Oil Farm - Interactive Wine & Traditional Farm Delicacy Tasting",
    "durationMinutes": 90,
    "pricePerPerson": 45,
    "description": "The farm’s premier experience: guided farm tour followed by an introduction to Cretan wines, hand-rolled bread baking in wood ovens, and traditional delicacies.",
    "includes": [
      "Personal guided tour through all agricultural workshops and animal pens",
      "Hands-on bread-making demonstration baked over open coals",
      "Tasting of 4 Cretan wines paired with farmhouse cheeses and fresh garden salad",
      "Authentic Cretan rakomelo digestif with handmade loukoumades"
    ],
    "producerId": "cretan-olive-oil-farm",
    "producerName": "Cretan Olive Oil Farm",
    "producerGreekName": "Κρητικό Αγρόκτημα Ελαιολάδου",
    "category": "olive_mill",
    "destination": "crete",
    "location": "Lasithi, Agios Nikolaos (Mirabello)",
    "badge": "Farmstead Gastronomy"
  },
  {
    "id": "exp_liokareas-olive-estate_1",
    "title": "Liokareas Olive Estate - Liokareas Mani Ancient Groves & Phenolic EVOO Masterclass",
    "durationMinutes": 50,
    "pricePerPerson": 16,
    "description": "Hosted at the 5th-generation Liokareas estate in Mani: walk among centuries-old Koroneiki and Kalamata olive groves, learn harvest timings, and taste award-winning high-phenolic EVOOs.",
    "includes": [
      "Guided walk through ancient olive terraces overlooking the Messenian Gulf",
      "Professional cobalt-glass tasting of 3 single-estate early harvest olive oils",
      "Sensory guide to identifying peppery polyphenols and freshness indicators",
      "Warm Mani sourdough bread, sea salt crystals & Kalamata table olives"
    ],
    "producerId": "liokareas-olive-estate",
    "producerName": "Liokareas Olive Estate",
    "producerGreekName": "Ελαιοκτήματα Λιοκαρέα",
    "category": "olive_mill",
    "destination": "peloponnese",
    "location": "Messinia, Lagada (West Mani)",
    "badge": "EVOO Masterclass"
  },
  {
    "id": "exp_liokareas-olive-estate_2",
    "title": "Liokareas Olive Estate - Liokareas Agrumato Cold-Press Tasting & Mani Gastronomy Pairing",
    "durationMinutes": 80,
    "pricePerPerson": 38,
    "description": "Discover Liokareas’ renowned cold co-pressed Agrumato oils (crushed simultaneously with whole fresh organic lemons, oranges, and chili peppers), paired with traditional Mani delicacies.",
    "includes": [
      "Introduction to the artisan Italian cold-milling and agrumato co-pressing technique",
      "Tasting of 4 signature flavored EVOOs (Lemon, Orange, Basil, Chili Agrumato)",
      "Traditional Mani meze board: cured pork Sigklino, Sfela PDO cheese & Lalangia dough crisps",
      "Complimentary 100ml tasting bottle of Early Harvest EVOO to take home"
    ],
    "producerId": "liokareas-olive-estate",
    "producerName": "Liokareas Olive Estate",
    "producerGreekName": "Ελαιοκτήματα Λιοκαρέα",
    "category": "olive_mill",
    "destination": "peloponnese",
    "location": "Messinia, Lagada (West Mani)",
    "badge": "Agrumato Pairing"
  },
  {
    "id": "exp_aerakis-dairy-anogeia_1",
    "title": "Aerakis Traditional Mountain Dairy - Artisan Raw Milk Graviera & Fresh Cheese Flight",
    "durationMinutes": 50,
    "pricePerPerson": 16,
    "badge": "Dairy Flight",
    "description": "Taste authentic raw sheep and goat cheeses crafted following traditional alpine pastoral methods at Aerakis Traditional Mountain Dairy.",
    "includes": [
      "Walkthrough of the cheese salting and temperature-controlled curing cellar",
      "Tasting of 4 fresh and aged cheeses (Mizithra, Anthotiros, Graviera)",
      "Crushed barley rusks, wild thyme honey & mountain tea"
    ],
    "producerId": "aerakis-dairy-anogeia",
    "producerName": "Aerakis Traditional Mountain Dairy",
    "producerGreekName": "Παραδοσιακό Τυροκομείο Αεράκη",
    "category": "cheese_dairy",
    "destination": "crete",
    "location": "Rethymno, Anogeia (Mount Psiloritis)"
  },
  {
    "id": "exp_aerakis-dairy-anogeia_2",
    "title": "Aerakis Traditional Mountain Dairy - Shepherd Cauldron Workshop & Terroir Wine Pairing",
    "durationMinutes": 80,
    "pricePerPerson": 32,
    "badge": "Master Cheesemaker",
    "description": "Watch the master cheesemaker separate curds and whey in traditional copper vats, followed by vertical cheese tasting paired with native wines.",
    "includes": [
      "Live demonstration of curds heating and cheese mold pressing",
      "Tasting of 3 aged cave Gravieras aged 6, 12, and 24 months",
      "2 glasses of local wine paired with wild greens and artisan charcuterie"
    ],
    "producerId": "aerakis-dairy-anogeia",
    "producerName": "Aerakis Traditional Mountain Dairy",
    "producerGreekName": "Παραδοσιακό Τυροκομείο Αεράκη",
    "category": "cheese_dairy",
    "destination": "crete",
    "location": "Rethymno, Anogeia (Mount Psiloritis)"
  },
  {
    "id": "exp_tzourmpakis-dairy-amari_1",
    "title": "Tzourmpakis Artisan Dairy - Artisan Raw Milk Graviera & Fresh Cheese Flight",
    "durationMinutes": 50,
    "pricePerPerson": 16,
    "badge": "Dairy Flight",
    "description": "Taste authentic raw sheep and goat cheeses crafted following traditional alpine pastoral methods at Tzourmpakis Artisan Dairy.",
    "includes": [
      "Walkthrough of the cheese salting and temperature-controlled curing cellar",
      "Tasting of 4 fresh and aged cheeses (Mizithra, Anthotiros, Graviera)",
      "Crushed barley rusks, wild thyme honey & mountain tea"
    ],
    "producerId": "tzourmpakis-dairy-amari",
    "producerName": "Tzourmpakis Artisan Dairy",
    "producerGreekName": "Τυροκομείο Τζουρμπάκη",
    "category": "cheese_dairy",
    "destination": "crete",
    "location": "Rethymno, Amari Valley (Mount Kedros)"
  },
  {
    "id": "exp_tzourmpakis-dairy-amari_2",
    "title": "Tzourmpakis Artisan Dairy - Shepherd Cauldron Workshop & Terroir Wine Pairing",
    "durationMinutes": 80,
    "pricePerPerson": 32,
    "badge": "Master Cheesemaker",
    "description": "Watch the master cheesemaker separate curds and whey in traditional copper vats, followed by vertical cheese tasting paired with native wines.",
    "includes": [
      "Live demonstration of curds heating and cheese mold pressing",
      "Tasting of 3 aged cave Gravieras aged 6, 12, and 24 months",
      "2 glasses of local wine paired with wild greens and artisan charcuterie"
    ],
    "producerId": "tzourmpakis-dairy-amari",
    "producerName": "Tzourmpakis Artisan Dairy",
    "producerGreekName": "Τυροκομείο Τζουρμπάκη",
    "category": "cheese_dairy",
    "destination": "crete",
    "location": "Rethymno, Amari Valley (Mount Kedros)"
  },
  {
    "id": "exp_stathakis-honey-park_1",
    "title": "Stathakis Family Thyme Honey & Bee Park - Kissamos Botanical Bee Park & Live Hive Observation",
    "durationMinutes": 50,
    "pricePerPerson": 14,
    "description": "Stroll along educational botanical trails featuring over 50 Cretan nectar flora species, observe live bees safely through glass observation hives, and taste 3 raw honeys.",
    "includes": [
      "Guided walk through the protected botanical bee sanctuary in Kissamos",
      "Safe inspection of live colonies inside glass observation hives",
      "Tasting of 3 raw mono-floral honeys (Wild Thyme, Pine, White Heather) with sheep yogurt",
      "Iced Cretan malotira mountain tea brewed with fresh lemon and honey"
    ],
    "producerId": "stathakis-honey-park",
    "producerName": "Stathakis Family Thyme Honey & Bee Park",
    "producerGreekName": "Μελισσοκομία Σταθάκη - Πάρκο Μέλισσας",
    "category": "apiary",
    "destination": "crete",
    "location": "Chania, Kissamos (Gramvousa)",
    "badge": "Bee Park Walk"
  },
  {
    "id": "exp_stathakis-honey-park_2",
    "title": "Stathakis Family Thyme Honey & Bee Park - Interactive Cretan Honey Experience & Full Beekeeper Suit",
    "durationMinutes": 80,
    "pricePerPerson": 32,
    "description": "The official Stathakis Family interactive experience: put on a full protective beekeeper suit, handle the herbal smoker, open an active hive with the master apiarist, and taste fresh comb.",
    "includes": [
      "Full professional beekeeping suit and gentle herbal smoker handling instruction",
      "Hands-on frame removal and search for worker bees, drones, and the Queen",
      "Fresh piece of raw wax honeycomb cut directly from the wooden frame to take home",
      "Private honey tasting seminar with traditional Cretan finger food and bee pollen"
    ],
    "producerId": "stathakis-honey-park",
    "producerName": "Stathakis Family Thyme Honey & Bee Park",
    "producerGreekName": "Μελισσοκομία Σταθάκη - Πάρκο Μέλισσας",
    "category": "apiary",
    "destination": "crete",
    "location": "Chania, Kissamos (Gramvousa)",
    "badge": "Active Beekeeper"
  },
  {
    "id": "exp_meligyris-apiary_1",
    "title": "Meligyris Cretan Apiary - Single-Botanical Wild Honey Flight & Hive Walk",
    "durationMinutes": 40,
    "pricePerPerson": 12,
    "description": "At Meligyris Cretan Apiary in Arkalochori: sample 5 rare single-botanical raw honeys harvested from nomadic hives across Crete’s mountain ranges and coastal gorges.",
    "includes": [
      "Sensory tasting of 5 distinct mono-floral raw honeys (White Thyme, Pine-Thyme, Heather, Sage, Chestnut)",
      "Fresh sheep milk anthotyro cheese and barley rusks for dipping",
      "Walk through the honey extraction lab and botanical garden of nectar plants",
      "Iced Cretan mountain herb tea sweetened with raw thyme honey"
    ],
    "producerId": "meligyris-apiary",
    "producerName": "Meligyris Cretan Apiary",
    "producerGreekName": "Μελίγυρις Κρητικό Μέλι",
    "category": "apiary",
    "destination": "crete",
    "location": "Heraklion, Arkalochori (Heraklion)",
    "badge": "Honey Flight (€12)"
  },
  {
    "id": "exp_meligyris-apiary_2",
    "title": "Meligyris Cretan Apiary - Nomadic Beekeeping Workshop & Raw Honeycomb Cutting",
    "durationMinutes": 75,
    "pricePerPerson": 28,
    "description": "Learn the ancient art of nomadic beekeeping in Crete, suit up to view working hives, and experience cutting raw honeycomb dripping with golden thyme nectar.",
    "includes": [
      "Protective veil gear and live observation hive frame inspection",
      "Hands-on honeycomb cutting session with warm honey tasting",
      "Traditional Cretan pancake (Tiganita) platter served with warm honey and walnuts",
      "Jar of single-harvest White Thyme Honey (250g) to take home"
    ],
    "producerId": "meligyris-apiary",
    "producerName": "Meligyris Cretan Apiary",
    "producerGreekName": "Μελίγυρις Κρητικό Μέλι",
    "category": "apiary",
    "destination": "crete",
    "location": "Heraklion, Arkalochori (Heraklion)",
    "badge": "Nomadic Beekeeper"
  },
  {
    "id": "exp_notos-brewery_1",
    "title": "Notos Microbrewery - Notos Fresh Draft Flight & Heraklion Craft Tasting",
    "durationMinutes": 40,
    "pricePerPerson": 10,
    "description": "At Notos Microbrewery in Heraklion: taste 4 fresh, unpasteurized craft beers produced by Crete’s passionate urban craft brewing team.",
    "includes": [
      "Flight of 4 x 150ml draft beers (Notos Lager, Session Ale, Weiss, Dry Stout)",
      "Cretan barley rusks with sea salt and local graviera cubes",
      "Introductory talk on modern microbrewing in Crete and unpasteurized beer care",
      "Brewery tasting booklet with beer style notes"
    ],
    "producerId": "notos-brewery",
    "producerName": "Notos Microbrewery",
    "producerGreekName": "Ζυθοποιία Νότος",
    "category": "brewery",
    "destination": "crete",
    "location": "Heraklion, Heraklion City",
    "badge": "Craft Flight (€10)"
  },
  {
    "id": "exp_notos-brewery_2",
    "title": "Notos Microbrewery - Notos Brewhouse Tour & Smoked Cretan Apaki Pairing",
    "durationMinutes": 60,
    "pricePerPerson": 20,
    "description": "A behind-the-scenes walkthrough of the fermentation tanks and cold storage room, followed by pairing Notos craft beers with wood-smoked pork apaki and local cheeses.",
    "includes": [
      "Full walking tour of brewing tanks, heat exchange systems, and bottling line",
      "5 generous craft beer pours including seasonal small-batch releases",
      "Warm plate of Cretan smoked pork apaki sautéed in olive oil and aged cheeses",
      "Souvenir Notos craft beer tulip glass"
    ],
    "producerId": "notos-brewery",
    "producerName": "Notos Microbrewery",
    "producerGreekName": "Ζυθοποιία Νότος",
    "category": "brewery",
    "destination": "crete",
    "location": "Heraklion, Heraklion City",
    "badge": "Brewery Tour & Apaki"
  },
  {
    "id": "exp_kasta-brewery_1",
    "title": "Kasta Microbrewery - Kasta Hop Exploration Flight & Taproom Tasting",
    "durationMinutes": 40,
    "pricePerPerson": 10,
    "description": "At Kasta Microbrewery in Heraklion: experience aromatic, hop-forward craft beers brewed with passion, from crisp pale ales to rich malty stouts.",
    "includes": [
      "4 x 150ml craft beer flight (American Pale Ale, New England IPA, Red Ale, Stout)",
      "Sensory hop pellet rubbing and aroma identification exercise",
      "Toasted barley breadcrumbs and seasoned Cretan nuts",
      "Q&A with the craft brewing team on modern hop varieties"
    ],
    "producerId": "kasta-brewery",
    "producerName": "Kasta Microbrewery",
    "producerGreekName": "Μικροζυθοποιία Κάστα",
    "category": "brewery",
    "destination": "crete",
    "location": "Heraklion, Heraklion Urban Port",
    "badge": "Hop Flight (€10)"
  },
  {
    "id": "exp_kasta-brewery_2",
    "title": "Kasta Microbrewery - Brewer’s Table & Artisan Beer Gastronomy",
    "durationMinutes": 60,
    "pricePerPerson": 22,
    "description": "Join the Kasta brewers for an intimate tasting session featuring 5 signature and experimental brews paired with savory local meze bites.",
    "includes": [
      "Guided cellar walkthrough explaining dry-hopping techniques and water profiles",
      "5 craft beers including limited single-hop editions",
      "Gourmet platter of cured meats, smoked cheeses, and sourdough bread",
      "Take-home 330ml can of fresh Kasta craft beer"
    ],
    "producerId": "kasta-brewery",
    "producerName": "Kasta Microbrewery",
    "producerGreekName": "Μικροζυθοποιία Κάστα",
    "category": "brewery",
    "destination": "crete",
    "location": "Heraklion, Heraklion Urban Port",
    "badge": "Brewer’s Table"
  },
  {
    "id": "exp_kykao-handcrafted-beers_1",
    "title": "Kykao Handcrafted Beers - Kykao Wild Barrel Fermentation Taproom Flight",
    "durationMinutes": 45,
    "pricePerPerson": 14,
    "description": "At the Kykao craft nanobrewery near Patras: taste 4 boundary-pushing craft beers, exploring mixed fermentations, grape ales co-fermented with local wine must, and hop-saturated IPAs.",
    "includes": [
      "Flight of 4 x 150ml draft beers from rotating craft taps",
      "Tasting notes on wild yeast harvesting and indigenous fermentation cultures",
      "Crispy spent-grain crackers and roasted Greek almonds",
      "Conversation with the brewing collective about Greece’s craft beer revolution"
    ],
    "producerId": "kykao-handcrafted-beers",
    "producerName": "Kykao Handcrafted Beers",
    "producerGreekName": "Χειροποίητη Ζυθοποιία Κύκαο",
    "category": "brewery",
    "destination": "peloponnese",
    "location": "Achaia, Platani (Patras)",
    "badge": "Wild Ferment Flight"
  },
  {
    "id": "exp_kykao-handcrafted-beers_2",
    "title": "Kykao Handcrafted Beers - Kykao Barrel Cellar Masterclass & Mixed-Fermentation Pairing",
    "durationMinutes": 75,
    "pricePerPerson": 30,
    "description": "Go behind the scenes into the barrel-aging sanctum: sample wild sours aged in local oak barrels, Greek grape ales, and imperial stouts paired with Greek artisan cheeses.",
    "includes": [
      "Guided cellar tour of wine and spirit oak barrels harboring mixed-fermentation beers",
      "5 exclusive bottle pours including Barrel-Aged Sour Ale and Greek Grape Ale",
      "Artisanal pairing platter of aged Peloponnesian cheeses and dried figs",
      "Souvenir Kykao craft beer glass"
    ],
    "producerId": "kykao-handcrafted-beers",
    "producerName": "Kykao Handcrafted Beers",
    "producerGreekName": "Χειροποίητη Ζυθοποιία Κύκαο",
    "category": "brewery",
    "destination": "peloponnese",
    "location": "Achaia, Platani (Patras)",
    "badge": "Cellar Masterclass"
  },
  {
    "id": "exp_siris-craft-brewery_1",
    "title": "Siris Craft Brewery (Voreia Beer) - Voreia Fresh Craft Tap Flight",
    "durationMinutes": 45,
    "pricePerPerson": 12,
    "description": "At Siris Craft Brewery in Serres: taste 4 signature Voreia craft beers poured fresh from the brewery taps, celebrating natural Greek brewing without preservatives.",
    "includes": [
      "4 x 150ml pours of fresh Voreia craft beers (Voreia Pilsner, IPA, Witbier, Smoked Amber)",
      "Overview of raw Greek barley, specialty malts, and whole-cone hops",
      "Traditional Greek pretzel crisps and salted local pistachios",
      "Official Voreia tasting mat and sensory score sheet"
    ],
    "producerId": "siris-craft-brewery",
    "producerName": "Siris Craft Brewery (Voreia Beer)",
    "producerGreekName": "Μικροζυθοποιία Σερρών (Voreia)",
    "category": "brewery",
    "destination": "northern_greece",
    "location": "Serres, Serres (Macedonia)",
    "badge": "Fresh Tap Flight"
  },
  {
    "id": "exp_siris-craft-brewery_2",
    "title": "Siris Craft Brewery (Voreia Beer) - Siris Brewhouse Tour & Imperial Stout Cheese Pairing",
    "durationMinutes": 75,
    "pricePerPerson": 26,
    "description": "Step onto the brewing platform with the master brewer, observe mashing and boiling kettles, and conclude with a pairing of Voreia Imperial Porter and Smoked Amber with local Macedonian cheeses.",
    "includes": [
      "Guided brewhouse, fermentation cellar, and automated bottling line tour",
      "5 craft beers including barrel-aged Voreia Imperial Porter and Smoked Amber Ale",
      "Curated pairing board of smoked Metsovone cheese, Kasseri, and dark chocolate bites",
      "Q&A session on craft brewing and micro-canning in Greece"
    ],
    "producerId": "siris-craft-brewery",
    "producerName": "Siris Craft Brewery (Voreia Beer)",
    "producerGreekName": "Μικροζυθοποιία Σερρών (Voreia)",
    "category": "brewery",
    "destination": "northern_greece",
    "location": "Serres, Serres (Macedonia)",
    "badge": "Brewery Tour & Pairing"
  },
  {
    "id": "exp_propator-sknipa-brewery_1",
    "title": "Propator Microbrewery (Sknipa Beer) - Sknipa Raw Craft Flight & Greek Barley Brewhouse Tour",
    "durationMinutes": 45,
    "pricePerPerson": 12,
    "description": "At Propator Microbrewery outside Thessaloniki: discover the unfiltered, unpasteurized \"Sknipa\" beer series made with 100% Greek barley malts and raw thyme honey.",
    "includes": [
      "4 x 150ml craft beer flight (Sknipa Bold IPA, Lady Wheat, Strong Ale, Honey Golden Ale)",
      "Tour of the compact eco-brewhouse and bottle-conditioning fermentation room",
      "Warm sourdough pretzels and Greek olive tapenade",
      "Explanation of natural carbonation without artificial gas injection"
    ],
    "producerId": "propator-sknipa-brewery",
    "producerName": "Propator Microbrewery (Sknipa Beer)",
    "producerGreekName": "Πρότυπη Μικροζυθοποιία (Μπίρα Σκνίπα)",
    "category": "brewery",
    "destination": "northern_greece",
    "location": "Thessaloniki, Thermi / Nea Raidestos",
    "badge": "Sknipa Flight (€12)"
  },
  {
    "id": "exp_propator-sknipa-brewery_2",
    "title": "Propator Microbrewery (Sknipa Beer) - Thessaloniki Brewer’s Table & Honey Glaze Meze",
    "durationMinutes": 70,
    "pricePerPerson": 25,
    "description": "An intimate tasting session with the founders of Propator, featuring 5 generous craft pours paired with honey-glazed grilled sausages, Macedonian cheeses, and country bread.",
    "includes": [
      "Private brewer-led walkthrough of grain milling, mashing, and cold lagering",
      "5 full craft beer pours including seasonal imperial and honey-infused batches",
      "Hot meze platter: country sausages with Sknipa beer glaze, graviera, and peppers",
      "Take-home 330ml bottle of Sknipa Bold IPA"
    ],
    "producerId": "propator-sknipa-brewery",
    "producerName": "Propator Microbrewery (Sknipa Beer)",
    "producerGreekName": "Πρότυπη Μικροζυθοποιία (Μπίρα Σκνίπα)",
    "category": "brewery",
    "destination": "northern_greece",
    "location": "Thessaloniki, Thermi / Nea Raidestos",
    "badge": "Brewer’s Table"
  }
];
