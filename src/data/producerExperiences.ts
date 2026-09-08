import { TastingExperience } from '../types/booking';

/**
 * 114 Curated Bespoke Estate Experiences (2 unique experiences for each of the 57 authentic Greek producers)
 * Spanning Crete, Santorini, Peloponnese, and Northern Greece across wineries, craft breweries,
 * olive mills, cheese dairies, traditional raki kazania, and mountain apiaries.
 */
export const PRODUCER_EXPERIENCES: TastingExperience[] = [
  {
    "id": "exp_cretan-brewery-charma_1",
    "title": "Cretan Brewery (Charma Beer) - Fresh Cold-Room Draft Flight & Spent-Grain Pretzels",
    "durationMinutes": 45,
    "pricePerPerson": 14,
    "description": "Taste 4 unfiltered, unpasteurized craft beers freshly pulled from the brewery cold room in the olive hills of Platanias.",
    "includes": [
      "4 x 150ml tasting pours: Charma Lager, Dunkel, Pale Ale & Seasonal Wheat",
      "House-baked salty spent-grain pretzels made from brewing malt",
      "Brewery sensory tasting sheet with hop and malt flavor profiles"
    ],
    "producerId": "cretan-brewery-charma",
    "producerName": "Cretan Brewery (Charma Beer)",
    "producerGreekName": "Κρητική Ζυθοποιία (Μπίρα Χάρμα)",
    "category": "brewery",
    "destination": "crete",
    "location": "Chania, Zounaki (Platanias)",
    "badge": "Fresh Draft"
  },
  {
    "id": "exp_cretan-brewery-charma_2",
    "title": "Cretan Brewery (Charma Beer) - Zounaki Eco-Brewhouse Walk & Dunkel-Glazed Smoked Apaki Feast",
    "durationMinutes": 80,
    "pricePerPerson": 32,
    "description": "Explore the geothermal energy systems and open fermentation tanks with the brewer, followed by a hearty open-air craft beer meal.",
    "includes": [
      "Full walkthrough of the brewhouse, conditioning vessels and bottling line",
      "5 craft beers including limited seasonal and experimental single-hop brews",
      "Cretan smoked apaki pork glazed in Charma Dunkel reduction & aged graviera"
    ],
    "producerId": "cretan-brewery-charma",
    "producerName": "Cretan Brewery (Charma Beer)",
    "producerGreekName": "Κρητική Ζυθοποιία (Μπίρα Χάρμα)",
    "category": "brewery",
    "destination": "crete",
    "location": "Chania, Zounaki (Platanias)",
    "badge": "Brewhouse Feast"
  },
  {
    "id": "exp_solo-craft-brewery_1",
    "title": "Solo Craft Brewery - Solo Anarchist Craft Flight: Fouriaris Imperial IPA & Psaki",
    "durationMinutes": 50,
    "pricePerPerson": 16,
    "description": "Meet the team that redefined Greek extreme brewing. Taste intense hop-forward IPAs and unfiltered farmhouse ales.",
    "includes": [
      "4 robust craft beers: Psaki IPA, Fouriaris Imperial IPA, Askianos & Pale Ale",
      "Brewery briefing on dry hopping techniques and wild yeast cultures",
      "Spicy cured Cretan sausage slices, barley rusks & mountain cheese"
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
    "title": "Solo Craft Brewery - Extreme Fermentation & Wild Oak-Aged Barrel Tasting",
    "durationMinutes": 80,
    "pricePerPerson": 35,
    "description": "A deep dive into sour ales, barrel-aged imperial stouts, and experimental wild fermentations matured in Greek wine casks.",
    "includes": [
      "Cellar tour of oak barrels previously holding Cretan red wines and tsikoudia",
      "5 high-gravity and barrel-aged beers with complex flavor notes",
      "Artisanal dark chocolate cuts, blue cheese & smoked meat pairing"
    ],
    "producerId": "solo-craft-brewery",
    "producerName": "Solo Craft Brewery",
    "producerGreekName": "Μικροζυθοποιία Σόλο",
    "category": "brewery",
    "destination": "crete",
    "location": "Heraklion, Nea Alikarnassos",
    "badge": "Wild Oak Ales"
  },
  {
    "id": "exp_lafkas-brewery_1",
    "title": "Lafkas Microbrewery - White Mountains Glacier Water & White Roll Wheat Beer Tasting",
    "durationMinutes": 45,
    "pricePerPerson": 14,
    "description": "In the orange groves of Chania, discover how pristine snow-melt water from the Lefka Ori mountains creates exceptionally crisp craft beer.",
    "includes": [
      "4 fresh beers: White Roll Belgian Pale Ale, Triple Hop IPA, Stout & Seasonal",
      "Malt sensory smelling and fresh hop pellet aroma testing",
      "Local citrus zest bread, Cretan sheep graviera & cured meats"
    ],
    "producerId": "lafkas-brewery",
    "producerName": "Lafkas Microbrewery",
    "producerGreekName": "Ζυθοποιία Λάφκας",
    "category": "brewery",
    "destination": "crete",
    "location": "Chania, Vamvakopoulo",
    "badge": "Alpine Water"
  },
  {
    "id": "exp_lafkas-brewery_2",
    "title": "Lafkas Microbrewery - Franco-Greek Craft Fusion & Citrus Orchard Taproom Pairing",
    "durationMinutes": 75,
    "pricePerPerson": 30,
    "description": "A tasting guided by the Belgian-Greek brewing couple, pairing artisanal ales with fresh citrus from the surrounding family orchards.",
    "includes": [
      "Brewery tour highlighting Belgian brewing tradition adapted to Cretan terroir",
      "5 craft beers including vintage-conditioned Belgian-style ales",
      "Smoked pork bites with orange chutney, rustic bread & fresh mizithra"
    ],
    "producerId": "lafkas-brewery",
    "producerName": "Lafkas Microbrewery",
    "producerGreekName": "Ζυθοποιία Λάφκας",
    "category": "brewery",
    "destination": "crete",
    "location": "Chania, Vamvakopoulo",
    "badge": "Brewers Table"
  },
  {
    "id": "exp_santorini-brewing-company_1",
    "title": "Santorini Brewing Company (Donkey Beer) - Crazy Donkey & Yellow Donkey Volcanic Craft Flight",
    "durationMinutes": 45,
    "pricePerPerson": 18,
    "description": "Visit the world-famous Donkey brewery in Mesa Gonia and taste unfiltered craft ales brewed in Santorini’s unique climate.",
    "includes": [
      "4 iconic Donkey beers: Yellow Donkey, Red Donkey, Crazy Donkey (First Greek IPA), Slow Donkey",
      "Donkey logo tasting glass to keep as a souvenir",
      "Crunchy spent-grain malt breadsticks & Santorini tomato paste"
    ],
    "producerId": "santorini-brewing-company",
    "producerName": "Santorini Brewing Company (Donkey Beer)",
    "producerGreekName": "Ζυθοποιία Σαντορίνης (Donkey Beer)",
    "category": "brewery",
    "destination": "santorini",
    "location": "Santorini, Mesa Gonia",
    "badge": "Volcanic Craft"
  },
  {
    "id": "exp_santorini-brewing-company_2",
    "title": "Santorini Brewing Company (Donkey Beer) - Brewmaster Donkey Experience & Spent Malt Smoked Pork Bites",
    "durationMinutes": 75,
    "pricePerPerson": 36,
    "description": "Step into the brew room to learn how water is reverse-osmosis purified on water-scarce Santorini to create award-winning ales.",
    "includes": [
      "Behind-the-scenes brewhouse inspection with the head brewer",
      "5 craft beers including barrel-aged Slow Donkey aged in Vinsanto casks",
      "Smoked Cycladic pork loin, Santorini caper leaves & aged Naxos graviera"
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
    "title": "Anoskeli Winery & Olive Mill - Dual Heritage: Anoskeli Bio-Olive Oil & Single-Estate Wine Flight",
    "durationMinutes": 60,
    "pricePerPerson": 22,
    "description": "Experience both pillars of Cretan gastronomy in one family estate: extra virgin PDO Kolymbari olive oil and single-estate organic wines.",
    "includes": [
      "Guided tour through the olive oil bottling facility and wine barrel cellar",
      "3 PDO Kolymbari extra virgin olive oils (early harvest, organic, classic)",
      "3 estate wines (Anoiktos, Anoferia & Platani Vidiano)",
      "Warm wood-fired bread, wild mountain oregano & Cretan graviera cheese"
    ],
    "producerId": "anoskeli-estate",
    "producerName": "Anoskeli Winery & Olive Mill",
    "producerGreekName": "Οινοποιείο & Ελαιοτριβείο Ανώσκελη",
    "category": "winery",
    "destination": "crete",
    "location": "Chania, Anoskeli (Platanias)",
    "badge": "Wine & Olive Oil"
  },
  {
    "id": "exp_anoskeli-estate_2",
    "title": "Anoskeli Winery & Olive Mill - Millennial Olive Grove Walk & Kolymbari PDO EVOO Degustation",
    "durationMinutes": 80,
    "pricePerPerson": 38,
    "description": "Walk through ancient silver-green olive trees in Platanias, followed by a professional cobalt-glass sensory olive oil and wine masterclass.",
    "includes": [
      "Botanical walk among ancient olive trees with certified agronomic guide",
      "Professional cobalt glass olive oil tasting discovering polyphenol levels",
      "5 estate wines and olive oils paired with homemade Cretan dakos meze"
    ],
    "producerId": "anoskeli-estate",
    "producerName": "Anoskeli Winery & Olive Mill",
    "producerGreekName": "Οινοποιείο & Ελαιοτριβείο Ανώσκελη",
    "category": "winery",
    "destination": "crete",
    "location": "Chania, Anoskeli (Platanias)",
    "badge": "Master Tasting"
  },
  {
    "id": "exp_domaine-paterianakis_1",
    "title": "Domaine Paterianakis - Estate Terroir Flight (Vidiano, Kotsifali, Mandilari)",
    "durationMinutes": 50,
    "pricePerPerson": 18,
    "badge": "Estate Flight",
    "description": "Experience the signature terroir of Heraklion with a guided tasting of 4 estate wines featuring Vidiano, Kotsifali, Mandilari.",
    "includes": [
      "4 signature estate wines focusing on Vidiano, Kotsifali, Mandilari",
      "Artisanal local cheese bites & Cretan barley rusks",
      "Introduction to the estate vineyards and regional microclimate"
    ],
    "producerId": "domaine-paterianakis",
    "producerName": "Domaine Paterianakis",
    "producerGreekName": "Κτήμα Πατεριανάκη",
    "category": "winery",
    "destination": "crete",
    "location": "Heraklion, Melesses (Peza)"
  },
  {
    "id": "exp_domaine-paterianakis_2",
    "title": "Domaine Paterianakis - Cellar Master Reserve Tour & Regional Meze",
    "durationMinutes": 80,
    "pricePerPerson": 38,
    "badge": "Cellar Reserve",
    "description": "Go behind the scenes into the oak barrel maturation cellars of Domaine Paterianakis, followed by tasting 5 premium reserve wines paired with regional delicacies.",
    "includes": [
      "Full walking tour of the vineyards and underground barrel maturation room",
      "5 premium reserve & single-vineyard wines",
      "Traditional meze platter with cured meats, local mountain cheeses and estate olive oil"
    ],
    "producerId": "domaine-paterianakis",
    "producerName": "Domaine Paterianakis",
    "producerGreekName": "Κτήμα Πατεριανάκη",
    "category": "winery",
    "destination": "crete",
    "location": "Heraklion, Melesses (Peza)"
  },
  {
    "id": "exp_vassaltis-vineyards_1",
    "title": "Vassaltis Vineyards Santorini - Black Volcanic Pumice & Single-Vineyard Gramina Tasting",
    "durationMinutes": 60,
    "pricePerPerson": 32,
    "description": "Discover Santorini’s newest boutique icon built on black volcanic ash. Taste mineral-driven, saline Assyrtiko and barrel-fermented Nassitis.",
    "includes": [
      "Modern minimalist winery tour and volcanic soil geology briefing",
      "4 terroir wines: Vassaltis Assyrtiko, Nassitis, Plethora & Gramina",
      "Local Santorini caper leaves, sun-dried tomatoes & artisanal cheese"
    ],
    "producerId": "vassaltis-vineyards",
    "producerName": "Vassaltis Vineyards Santorini",
    "producerGreekName": "Αμπελώνες Βασάλτης",
    "category": "winery",
    "destination": "santorini",
    "location": "Santorini, Vourvoulos",
    "badge": "Volcanic Terroir"
  },
  {
    "id": "exp_vassaltis-vineyards_2",
    "title": "Vassaltis Vineyards Santorini - Santorini Sunset Barrique & Amphora Gastronomy Pairing",
    "durationMinutes": 90,
    "pricePerPerson": 65,
    "description": "An intimate evening tasting on the Vourvoulos terrace featuring clay amphora and experimental oak cuvees paired with Aegean delicacies.",
    "includes": [
      "5 limited-release cuvees including Amphora Assyrtiko and Mavrotragano",
      "Four-course Aegean gastronomy pairing prepared by the estate chef",
      "Panoramic caldera and northern Aegean twilight views"
    ],
    "producerId": "vassaltis-vineyards",
    "producerName": "Vassaltis Vineyards Santorini",
    "producerGreekName": "Αμπελώνες Βασάλτης",
    "category": "winery",
    "destination": "santorini",
    "location": "Santorini, Vourvoulos",
    "badge": "Sunset Gastronomy"
  },
  {
    "id": "exp_skouras-winery-nemea_1",
    "title": "Ktima Skouras (Peloponnese) - Megas Oenos Heritage Tour & Agiorgitiko Terroir Flight",
    "durationMinutes": 60,
    "pricePerPerson": 28,
    "description": "Visit the legendary George Skouras in Malandreni, taste the iconic Megas Oenos blend (Agiorgitiko & Cabernet), and learn Nemea wine history.",
    "includes": [
      "Tour of the majestic 1,000-barrel maturation cellar and contemporary art gallery",
      "4 wines: Megas Oenos, Grand Cuvee Nemea, Salto Moschofilero, Peplo Rose",
      "Peloponnesian graviera cheese, rustic sourdough bread & olive tapenade"
    ],
    "producerId": "skouras-winery-nemea",
    "producerName": "Ktima Skouras (Peloponnese)",
    "producerGreekName": "Κτήμα Σκούρας",
    "category": "winery",
    "destination": "peloponnese",
    "location": "Nemea, Malandreni (Argos)",
    "badge": "Nemea Icon"
  },
  {
    "id": "exp_skouras-winery-nemea_2",
    "title": "Ktima Skouras (Peloponnese) - Grand Cuvee Cellar Master Vertical & Peloponnesian Gastronomy Lunch",
    "durationMinutes": 100,
    "pricePerPerson": 65,
    "description": "A sommelier-led vertical tasting comparing 3 decades of Megas Oenos and Grand Cuvee Nemea, followed by a seasonal regional luncheon.",
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
    "badge": "Library Vertical"
  },
  {
    "id": "exp_thymiopoulos-naoussa_1",
    "title": "Thymiopoulos Vineyards Naoussa - Earth & Sky Biodynamic Xinomavro Tasting",
    "durationMinutes": 60,
    "pricePerPerson": 26,
    "description": "Visit Apostolos Thymiopoulos in Trilofos, the visionary who redefined Xinomavro through natural, low-intervention biodynamic farming.",
    "includes": [
      "Walk through biodynamic vineyards planted with wild flora and herbs",
      "4 terroir expressions: Rose de Xinomavro, Jeunes Vignes, Alta & Earth & Sky",
      "Traditional Naoussa batzina vegetable pie and aged feta bites"
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
    "title": "Thymiopoulos Vineyards Naoussa - Thymiopoulos High-Elevation Terroir Vertical & Spiced Meze",
    "durationMinutes": 90,
    "pricePerPerson": 55,
    "description": "Compare single-parcel Xinomavro wines from various microclimates across Mount Vermion, paired with regional Northern Greek dishes.",
    "includes": [
      "5 wines including single-vineyard Vrana Petra, Aftorizo and back vintages",
      "Cellar barrel tasting directly from large 5,000L neutral Slavonian oak casks",
      "Naoussa slow-cooked beef with quince, local sausages & aged Kasseri"
    ],
    "producerId": "thymiopoulos-naoussa",
    "producerName": "Thymiopoulos Vineyards Naoussa",
    "producerGreekName": "Αμπελώνες Θυμιόπουλου",
    "category": "winery",
    "destination": "northern_greece",
    "location": "Naoussa, Trilofos",
    "badge": "Masterclass Cru"
  },
  {
    "id": "exp_tyrokomio-gasparis_1",
    "title": "Gasparis Traditional Mountain Dairy - Gasparis Cave-Aged Sheep Graviera & Fresh Mizithra Tasting",
    "durationMinutes": 60,
    "pricePerPerson": 18,
    "description": "Visit an authentic artisan dairy in Rethymno, learn how alpine sheep and goat milk are transformed into PDO Cretan Graviera.",
    "includes": [
      "Walk through temperature-controlled cheese aging and salting cellars",
      "Tasting of 4 cheeses: Fresh Sweet Mizithra, Dry Anthotiros, 6-Month Graviera & Cave-Aged Reserve",
      "Warm village sourdough bread, thyme honey & sweet cherry tomatoes"
    ],
    "producerId": "tyrokomio-gasparis",
    "producerName": "Gasparis Traditional Mountain Dairy",
    "producerGreekName": "Παραδοσιακό Τυροκομείο Γάσπαρης",
    "category": "cheese_dairy",
    "destination": "crete",
    "location": "Chania, Gavalochori (Apokoronas)",
    "badge": "Artisan Dairy"
  },
  {
    "id": "exp_tyrokomio-gasparis_2",
    "title": "Gasparis Traditional Mountain Dairy - Rethymno Artisan Cheese-Making Workshop & Mountain Wine Pairing",
    "durationMinutes": 80,
    "pricePerPerson": 35,
    "description": "Watch the master cheesemaker set the curd in traditional copper cauldrons and press cheese wheels into woven molds.",
    "includes": [
      "Live demonstration of curds heating and traditional hand pressing",
      "Vertical tasting of Graviera aged 3, 12, and 24 months",
      "Pairing with 2 local Cretan wines (Vidiano and Liatiko) and barley rusks"
    ],
    "producerId": "tyrokomio-gasparis",
    "producerName": "Gasparis Traditional Mountain Dairy",
    "producerGreekName": "Παραδοσιακό Τυροκομείο Γάσπαρης",
    "category": "cheese_dairy",
    "destination": "crete",
    "location": "Chania, Gavalochori (Apokoronas)",
    "badge": "Cheesemaker Hands-on"
  },
  {
    "id": "exp_estate-argyros-santorini_1",
    "title": "Estate Argyros Santorini - 150-Yr Kouloura Ungrafted Vine & Assyrtiko Terroir Flight",
    "durationMinutes": 60,
    "pricePerPerson": 35,
    "description": "Walk through ungrafted bush vines woven into protective kouloura baskets against Aegean winds, followed by 4 single-parcel Assyrtiko wines.",
    "includes": [
      "Vineyard walk among 150+ year-old phylloxera-free rootstocks",
      "4 Estate Assyrtiko wines (Estate, Oak Fermented, Cuvee Monsignori, Cuvee Evdemon)",
      "Cycladic graviera cheese, Santorini cherry tomato paste & barley rusks"
    ],
    "producerId": "estate-argyros-santorini",
    "producerName": "Estate Argyros Santorini",
    "producerGreekName": "Κτήμα Αργυρού Σαντορίνη",
    "category": "winery",
    "destination": "santorini",
    "location": "Santorini, Episkopi Gonia",
    "badge": "Signature Terroir"
  },
  {
    "id": "exp_estate-argyros-santorini_2",
    "title": "Estate Argyros Santorini - Century-Old Vinsanto Masterclass & Library Vintage Cellar Tour",
    "durationMinutes": 90,
    "pricePerPerson": 75,
    "description": "An exclusive masterclass exploring Argyros’s historic barrel room and rare Vinsanto vintages aged up to 20 years in French oak barrels.",
    "includes": [
      "Private tour of the state-of-the-art barrel aging sanctuary",
      "Flight of 5 wines including 12-Year and 20-Year barrel-aged Vinsanto",
      "Aged goat cheese pairing, dry figs, roasted almonds & dark cocoa nibs"
    ],
    "producerId": "estate-argyros-santorini",
    "producerName": "Estate Argyros Santorini",
    "producerGreekName": "Κτήμα Αργυρού Σαντορίνη",
    "category": "winery",
    "destination": "santorini",
    "location": "Santorini, Episkopi Gonia",
    "badge": "Collector Reserve"
  },
  {
    "id": "exp_semeli-estate-nemea_1",
    "title": "Semeli Estate Nemea - Estate Terroir Flight (Agiorgitiko, Moschofilero, Malagousia)",
    "durationMinutes": 50,
    "pricePerPerson": 18,
    "badge": "Estate Flight",
    "description": "Experience the signature terroir of Nemea with a guided tasting of 4 estate wines featuring Agiorgitiko, Moschofilero, Malagousia.",
    "includes": [
      "4 signature estate wines focusing on Agiorgitiko, Moschofilero, Malagousia",
      "Artisanal local cheese bites & Cretan barley rusks",
      "Introduction to the estate vineyards and regional microclimate"
    ],
    "producerId": "semeli-estate-nemea",
    "producerName": "Semeli Estate Nemea",
    "producerGreekName": "Κτήμα Σεμέλη Νεμέα",
    "category": "winery",
    "destination": "peloponnese",
    "location": "Nemea, Koutsi (Nemea)"
  },
  {
    "id": "exp_semeli-estate-nemea_2",
    "title": "Semeli Estate Nemea - Cellar Master Reserve Tour & Regional Meze",
    "durationMinutes": 80,
    "pricePerPerson": 38,
    "badge": "Cellar Reserve",
    "description": "Go behind the scenes into the oak barrel maturation cellars of Semeli Estate Nemea, followed by tasting 5 premium reserve wines paired with regional delicacies.",
    "includes": [
      "Full walking tour of the vineyards and underground barrel maturation room",
      "5 premium reserve & single-vineyard wines",
      "Traditional meze platter with cured meats, local mountain cheeses and estate olive oil"
    ],
    "producerId": "semeli-estate-nemea",
    "producerName": "Semeli Estate Nemea",
    "producerGreekName": "Κτήμα Σεμέλη Νεμέα",
    "category": "winery",
    "destination": "peloponnese",
    "location": "Nemea, Koutsi (Nemea)"
  },
  {
    "id": "exp_kir-yianni-naoussa_1",
    "title": "Ktima Kir-Yianni Naoussa - Estate Terroir Flight (Xinomavro, Malagousia, Assyrtiko)",
    "durationMinutes": 50,
    "pricePerPerson": 18,
    "badge": "Estate Flight",
    "description": "Experience the signature terroir of Naoussa with a guided tasting of 4 estate wines featuring Xinomavro, Malagousia, Assyrtiko.",
    "includes": [
      "4 signature estate wines focusing on Xinomavro, Malagousia, Assyrtiko",
      "Artisanal local cheese bites & Cretan barley rusks",
      "Introduction to the estate vineyards and regional microclimate"
    ],
    "producerId": "kir-yianni-naoussa",
    "producerName": "Ktima Kir-Yianni Naoussa",
    "producerGreekName": "Κτήμα Κυρ-Γιάννη Νάουσα",
    "category": "winery",
    "destination": "northern_greece",
    "location": "Naoussa, Yiannakochori"
  },
  {
    "id": "exp_kir-yianni-naoussa_2",
    "title": "Ktima Kir-Yianni Naoussa - Cellar Master Reserve Tour & Regional Meze",
    "durationMinutes": 80,
    "pricePerPerson": 38,
    "badge": "Cellar Reserve",
    "description": "Go behind the scenes into the oak barrel maturation cellars of Ktima Kir-Yianni Naoussa, followed by tasting 5 premium reserve wines paired with regional delicacies.",
    "includes": [
      "Full walking tour of the vineyards and underground barrel maturation room",
      "5 premium reserve & single-vineyard wines",
      "Traditional meze platter with cured meats, local mountain cheeses and estate olive oil"
    ],
    "producerId": "kir-yianni-naoussa",
    "producerName": "Ktima Kir-Yianni Naoussa",
    "producerGreekName": "Κτήμα Κυρ-Γιάννη Νάουσα",
    "category": "winery",
    "destination": "northern_greece",
    "location": "Naoussa, Yiannakochori"
  },
  {
    "id": "exp_douloufakis-winery_1",
    "title": "Douloufakis Winery - Estate Terroir Flight (Vidiano, Liatiko, Kotsifali)",
    "durationMinutes": 50,
    "pricePerPerson": 18,
    "badge": "Estate Flight",
    "description": "Experience the signature terroir of Heraklion with a guided tasting of 4 estate wines featuring Vidiano, Liatiko, Kotsifali.",
    "includes": [
      "4 signature estate wines focusing on Vidiano, Liatiko, Kotsifali",
      "Artisanal local cheese bites & Cretan barley rusks",
      "Introduction to the estate vineyards and regional microclimate"
    ],
    "producerId": "douloufakis-winery",
    "producerName": "Douloufakis Winery",
    "producerGreekName": "Οινοποιείο Δουλουφάκη",
    "category": "winery",
    "destination": "crete",
    "location": "Heraklion, Dafnes"
  },
  {
    "id": "exp_douloufakis-winery_2",
    "title": "Douloufakis Winery - Cellar Master Reserve Tour & Regional Meze",
    "durationMinutes": 80,
    "pricePerPerson": 38,
    "badge": "Cellar Reserve",
    "description": "Go behind the scenes into the oak barrel maturation cellars of Douloufakis Winery, followed by tasting 5 premium reserve wines paired with regional delicacies.",
    "includes": [
      "Full walking tour of the vineyards and underground barrel maturation room",
      "5 premium reserve & single-vineyard wines",
      "Traditional meze platter with cured meats, local mountain cheeses and estate olive oil"
    ],
    "producerId": "douloufakis-winery",
    "producerName": "Douloufakis Winery",
    "producerGreekName": "Οινοποιείο Δουλουφάκη",
    "category": "winery",
    "destination": "crete",
    "location": "Heraklion, Dafnes"
  },
  {
    "id": "exp_manousakis-winery_1",
    "title": "Manousakis Winery (Nostos) - Estate Terroir Flight (Romeiko, Vidiano, Assyrtiko)",
    "durationMinutes": 50,
    "pricePerPerson": 18,
    "badge": "Estate Flight",
    "description": "Experience the signature terroir of Chania with a guided tasting of 4 estate wines featuring Romeiko, Vidiano, Assyrtiko.",
    "includes": [
      "4 signature estate wines focusing on Romeiko, Vidiano, Assyrtiko",
      "Artisanal local cheese bites & Cretan barley rusks",
      "Introduction to the estate vineyards and regional microclimate"
    ],
    "producerId": "manousakis-winery",
    "producerName": "Manousakis Winery (Nostos)",
    "producerGreekName": "Οινοποιείο Μανουσάκη",
    "category": "winery",
    "destination": "crete",
    "location": "Chania, Vatolakkos"
  },
  {
    "id": "exp_manousakis-winery_2",
    "title": "Manousakis Winery (Nostos) - Cellar Master Reserve Tour & Regional Meze",
    "durationMinutes": 80,
    "pricePerPerson": 38,
    "badge": "Cellar Reserve",
    "description": "Go behind the scenes into the oak barrel maturation cellars of Manousakis Winery (Nostos), followed by tasting 5 premium reserve wines paired with regional delicacies.",
    "includes": [
      "Full walking tour of the vineyards and underground barrel maturation room",
      "5 premium reserve & single-vineyard wines",
      "Traditional meze platter with cured meats, local mountain cheeses and estate olive oil"
    ],
    "producerId": "manousakis-winery",
    "producerName": "Manousakis Winery (Nostos)",
    "producerGreekName": "Οινοποιείο Μανουσάκη",
    "category": "winery",
    "destination": "crete",
    "location": "Chania, Vatolakkos"
  },
  {
    "id": "exp_lyrarakis-winery_1",
    "title": "Lyrarakis Winery - Estate Terroir Flight (Dafni, Plyto, Melissaki)",
    "durationMinutes": 50,
    "pricePerPerson": 18,
    "badge": "Estate Flight",
    "description": "Experience the signature terroir of Heraklion with a guided tasting of 4 estate wines featuring Dafni, Plyto, Melissaki.",
    "includes": [
      "4 signature estate wines focusing on Dafni, Plyto, Melissaki",
      "Artisanal local cheese bites & Cretan barley rusks",
      "Introduction to the estate vineyards and regional microclimate"
    ],
    "producerId": "lyrarakis-winery",
    "producerName": "Lyrarakis Winery",
    "producerGreekName": "Οινοποιείο Λυραράκη",
    "category": "winery",
    "destination": "crete",
    "location": "Heraklion, Alagni"
  },
  {
    "id": "exp_lyrarakis-winery_2",
    "title": "Lyrarakis Winery - Cellar Master Reserve Tour & Regional Meze",
    "durationMinutes": 80,
    "pricePerPerson": 38,
    "badge": "Cellar Reserve",
    "description": "Go behind the scenes into the oak barrel maturation cellars of Lyrarakis Winery, followed by tasting 5 premium reserve wines paired with regional delicacies.",
    "includes": [
      "Full walking tour of the vineyards and underground barrel maturation room",
      "5 premium reserve & single-vineyard wines",
      "Traditional meze platter with cured meats, local mountain cheeses and estate olive oil"
    ],
    "producerId": "lyrarakis-winery",
    "producerName": "Lyrarakis Winery",
    "producerGreekName": "Οινοποιείο Λυραράκη",
    "category": "winery",
    "destination": "crete",
    "location": "Heraklion, Alagni"
  },
  {
    "id": "exp_toplou-monastery-winery_1",
    "title": "Monastery Toplou Organic Estate - Estate Terroir Flight (Liatiko, Thrapsathiri, Vilana)",
    "durationMinutes": 50,
    "pricePerPerson": 18,
    "badge": "Estate Flight",
    "description": "Experience the signature terroir of Lasithi with a guided tasting of 4 estate wines featuring Liatiko, Thrapsathiri, Vilana.",
    "includes": [
      "4 signature estate wines focusing on Liatiko, Thrapsathiri, Vilana",
      "Artisanal local cheese bites & Cretan barley rusks",
      "Introduction to the estate vineyards and regional microclimate"
    ],
    "producerId": "toplou-monastery-winery",
    "producerName": "Monastery Toplou Organic Estate",
    "producerGreekName": "Οινοποιείο Μονής Τοπλού",
    "category": "winery",
    "destination": "crete",
    "location": "Lasithi, Sitia"
  },
  {
    "id": "exp_toplou-monastery-winery_2",
    "title": "Monastery Toplou Organic Estate - Cellar Master Reserve Tour & Regional Meze",
    "durationMinutes": 80,
    "pricePerPerson": 38,
    "badge": "Cellar Reserve",
    "description": "Go behind the scenes into the oak barrel maturation cellars of Monastery Toplou Organic Estate, followed by tasting 5 premium reserve wines paired with regional delicacies.",
    "includes": [
      "Full walking tour of the vineyards and underground barrel maturation room",
      "5 premium reserve & single-vineyard wines",
      "Traditional meze platter with cured meats, local mountain cheeses and estate olive oil"
    ],
    "producerId": "toplou-monastery-winery",
    "producerName": "Monastery Toplou Organic Estate",
    "producerGreekName": "Οινοποιείο Μονής Τοπλού",
    "category": "winery",
    "destination": "crete",
    "location": "Lasithi, Sitia"
  },
  {
    "id": "exp_kazani-stilianou_1",
    "title": "Kazani Stilianou & Organic Estate - Copper Alembic Still Tour & Tsikoudia Flight",
    "durationMinutes": 45,
    "pricePerPerson": 14,
    "badge": "Still Tour",
    "description": "Witness traditional wood-fired distillation in historic copper alembic stills at Kazani Stilianou & Organic Estate and taste crystal-clear grape spirit.",
    "includes": [
      "Walkthrough of the copper distillation pot and steam condensation coil",
      "Tasting of 3 distillates (pure tsikoudia, aged raki & herbal rakomelo)",
      "Local roasted nuts, dried figs & mountain honey"
    ],
    "producerId": "kazani-stilianou",
    "producerName": "Kazani Stilianou & Organic Estate",
    "producerGreekName": "Καζάνι Στυλιανού",
    "category": "kazani",
    "destination": "crete",
    "location": "Heraklion, Kounavoi"
  },
  {
    "id": "exp_kazani-stilianou_2",
    "title": "Kazani Stilianou & Organic Estate - Village Rakokazano Feast & Oak-Aged Spirit Pairing",
    "durationMinutes": 90,
    "pricePerPerson": 38,
    "badge": "Kazani Feast",
    "description": "An unforgettable evening of Greek hospitality: taste spirit fresh from the coil while meats roast over open embers in Heraklion.",
    "includes": [
      "Tasting of fresh warm distillate straight from the copper pipe",
      "Charcoal-grilled local meats, wood-roasted potatoes & village salad",
      "Tasting of oak-matured amber reserve tsikoudia"
    ],
    "producerId": "kazani-stilianou",
    "producerName": "Kazani Stilianou & Organic Estate",
    "producerGreekName": "Καζάνι Στυλιανού",
    "category": "kazani",
    "destination": "crete",
    "location": "Heraklion, Kounavoi"
  },
  {
    "id": "exp_biolea-estate_1",
    "title": "Biolea Organic Artisanal Olive Mill - High-Phenolic EVOO Degustation & Mill Tour",
    "durationMinutes": 50,
    "pricePerPerson": 15,
    "badge": "EVOO Tasting",
    "description": "Learn the sensory secrets of certified extra virgin olive oil at Biolea Organic Artisanal Olive Mill, comparing early-harvest aromas and peppery polyphenol finishes.",
    "includes": [
      "Tour of the olive washing, crushing and cold-extraction facilities",
      "Professional cobalt-glass sensory tasting of 3 monovarietal olive oils",
      "Fresh warm sourdough bread, mountain sea salt & ripe tomato slices"
    ],
    "producerId": "biolea-estate",
    "producerName": "Biolea Organic Artisanal Olive Mill",
    "producerGreekName": "Βιολέα - Βιολογικό Ελαιοτριβείο",
    "category": "olive_mill",
    "destination": "crete",
    "location": "Chania, Astrikas (Kolymbari)"
  },
  {
    "id": "exp_biolea-estate_2",
    "title": "Biolea Organic Artisanal Olive Mill - Monumental Grove Walk & Wood-Fired Bread Workshop",
    "durationMinutes": 80,
    "pricePerPerson": 32,
    "badge": "Heritage & Hearth",
    "description": "Walk among historic olive trees in Chania and bake traditional village bread in outdoor wood ovens to pair with freshly pressed oils.",
    "includes": [
      "Botanical walk among ancient olive trees with explanations of regenerative farming",
      "Hands-on bread baking and warm olive oil degustation",
      "Traditional Cretan salad with mizithra, wild oregano & olives"
    ],
    "producerId": "biolea-estate",
    "producerName": "Biolea Organic Artisanal Olive Mill",
    "producerGreekName": "Βιολέα - Βιολογικό Ελαιοτριβείο",
    "category": "olive_mill",
    "destination": "crete",
    "location": "Chania, Astrikas (Kolymbari)"
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
    "title": "Wild Herbs of Crete - Babis & Family - Wild Thyme Honey Flight & Bee Sanctuary Tour",
    "durationMinutes": 45,
    "pricePerPerson": 12,
    "badge": "Raw Honey",
    "description": "Discover how bees gather wild Cretan thyme, pine, and mountain herbs to produce pure unfiltered honey at Wild Herbs of Crete - Babis & Family.",
    "includes": [
      "Guided walk through aromatic herb gardens with observation hives",
      "3 raw mono-floral honey tastings with authentic sheep yogurt",
      "Iced mountain tea infused with wild herbs and lemon"
    ],
    "producerId": "wild-herbs-kallikratis",
    "producerName": "Wild Herbs of Crete - Babis & Family",
    "producerGreekName": "Άγρια Βότανα Κρήτης - Καλλικράτης",
    "category": "apiary",
    "destination": "crete",
    "location": "Chania, Kallikratis (Sfakia)"
  },
  {
    "id": "exp_wild-herbs-kallikratis_2",
    "title": "Wild Herbs of Crete - Babis & Family - Beekeeper Suit Experience & Honeycomb Extraction",
    "durationMinutes": 75,
    "pricePerPerson": 30,
    "badge": "Beekeeper Walk",
    "description": "Wear a protective beekeeper suit to inspect live brood frames, learn queen bee behavior, and taste fresh honeycomb cut on the spot.",
    "includes": [
      "Full protective beekeeper suit and smoker training",
      "Hands-on hive frame inspection with the head apiarist",
      "Cut raw comb honey to taste, plus jar of organic raw honey to take home"
    ],
    "producerId": "wild-herbs-kallikratis",
    "producerName": "Wild Herbs of Crete - Babis & Family",
    "producerGreekName": "Άγρια Βότανα Κρήτης - Καλλικράτης",
    "category": "apiary",
    "destination": "crete",
    "location": "Chania, Kallikratis (Sfakia)"
  },
  {
    "id": "exp_silva-daskalaki-winery_1",
    "title": "Silva Daskalaki Winery - Estate Terroir Flight (Vidiano, Plyto, Kotsifali)",
    "durationMinutes": 50,
    "pricePerPerson": 18,
    "badge": "Estate Flight",
    "description": "Experience the signature terroir of Heraklion with a guided tasting of 4 estate wines featuring Vidiano, Plyto, Kotsifali.",
    "includes": [
      "4 signature estate wines focusing on Vidiano, Plyto, Kotsifali",
      "Artisanal local cheese bites & Cretan barley rusks",
      "Introduction to the estate vineyards and regional microclimate"
    ],
    "producerId": "silva-daskalaki-winery",
    "producerName": "Silva Daskalaki Winery",
    "producerGreekName": "Οινοποιείο Σίλβα Δασκαλάκη",
    "category": "winery",
    "destination": "crete",
    "location": "Heraklion, Siva (Heraklion)"
  },
  {
    "id": "exp_silva-daskalaki-winery_2",
    "title": "Silva Daskalaki Winery - Cellar Master Reserve Tour & Regional Meze",
    "durationMinutes": 80,
    "pricePerPerson": 38,
    "badge": "Cellar Reserve",
    "description": "Go behind the scenes into the oak barrel maturation cellars of Silva Daskalaki Winery, followed by tasting 5 premium reserve wines paired with regional delicacies.",
    "includes": [
      "Full walking tour of the vineyards and underground barrel maturation room",
      "5 premium reserve & single-vineyard wines",
      "Traditional meze platter with cured meats, local mountain cheeses and estate olive oil"
    ],
    "producerId": "silva-daskalaki-winery",
    "producerName": "Silva Daskalaki Winery",
    "producerGreekName": "Οινοποιείο Σίλβα Δασκαλάκη",
    "category": "winery",
    "destination": "crete",
    "location": "Heraklion, Siva (Heraklion)"
  },
  {
    "id": "exp_karavitakis-winery_1",
    "title": "Karavitakis Winery - Estate Terroir Flight (Romaiko, Vidiano, Malagousia)",
    "durationMinutes": 50,
    "pricePerPerson": 18,
    "badge": "Estate Flight",
    "description": "Experience the signature terroir of Chania with a guided tasting of 4 estate wines featuring Romaiko, Vidiano, Malagousia.",
    "includes": [
      "4 signature estate wines focusing on Romaiko, Vidiano, Malagousia",
      "Artisanal local cheese bites & Cretan barley rusks",
      "Introduction to the estate vineyards and regional microclimate"
    ],
    "producerId": "karavitakis-winery",
    "producerName": "Karavitakis Winery",
    "producerGreekName": "Οινοποιείο Καραβιτάκη",
    "category": "winery",
    "destination": "crete",
    "location": "Chania, Pontikiana (Kolymbari)"
  },
  {
    "id": "exp_karavitakis-winery_2",
    "title": "Karavitakis Winery - Cellar Master Reserve Tour & Regional Meze",
    "durationMinutes": 80,
    "pricePerPerson": 38,
    "badge": "Cellar Reserve",
    "description": "Go behind the scenes into the oak barrel maturation cellars of Karavitakis Winery, followed by tasting 5 premium reserve wines paired with regional delicacies.",
    "includes": [
      "Full walking tour of the vineyards and underground barrel maturation room",
      "5 premium reserve & single-vineyard wines",
      "Traditional meze platter with cured meats, local mountain cheeses and estate olive oil"
    ],
    "producerId": "karavitakis-winery",
    "producerName": "Karavitakis Winery",
    "producerGreekName": "Οινοποιείο Καραβιτάκη",
    "category": "winery",
    "destination": "crete",
    "location": "Chania, Pontikiana (Kolymbari)"
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
    "title": "Titakis Winery - Estate Terroir Flight (Vilana, Vidiano, Kotsifali)",
    "durationMinutes": 50,
    "pricePerPerson": 18,
    "badge": "Estate Flight",
    "description": "Experience the signature terroir of Heraklion with a guided tasting of 4 estate wines featuring Vilana, Vidiano, Kotsifali.",
    "includes": [
      "4 signature estate wines focusing on Vilana, Vidiano, Kotsifali",
      "Artisanal local cheese bites & Cretan barley rusks",
      "Introduction to the estate vineyards and regional microclimate"
    ],
    "producerId": "titakis-winery",
    "producerName": "Titakis Winery",
    "producerGreekName": "Οινοποιείο Τιτάκη",
    "category": "winery",
    "destination": "crete",
    "location": "Heraklion, Kounavi (Peza PDO)"
  },
  {
    "id": "exp_titakis-winery_2",
    "title": "Titakis Winery - Cellar Master Reserve Tour & Regional Meze",
    "durationMinutes": 80,
    "pricePerPerson": 38,
    "badge": "Cellar Reserve",
    "description": "Go behind the scenes into the oak barrel maturation cellars of Titakis Winery, followed by tasting 5 premium reserve wines paired with regional delicacies.",
    "includes": [
      "Full walking tour of the vineyards and underground barrel maturation room",
      "5 premium reserve & single-vineyard wines",
      "Traditional meze platter with cured meats, local mountain cheeses and estate olive oil"
    ],
    "producerId": "titakis-winery",
    "producerName": "Titakis Winery",
    "producerGreekName": "Οινοποιείο Τιτάκη",
    "category": "winery",
    "destination": "crete",
    "location": "Heraklion, Kounavi (Peza PDO)"
  },
  {
    "id": "exp_zacharioudakis-winery_1",
    "title": "Zacharioudakis Organic Winery - Estate Terroir Flight (Vidiano, Malvasia di Candia, Kotsifali)",
    "durationMinutes": 50,
    "pricePerPerson": 18,
    "badge": "Estate Flight",
    "description": "Experience the signature terroir of Heraklion with a guided tasting of 4 estate wines featuring Vidiano, Malvasia di Candia, Kotsifali.",
    "includes": [
      "4 signature estate wines focusing on Vidiano, Malvasia di Candia, Kotsifali",
      "Artisanal local cheese bites & Cretan barley rusks",
      "Introduction to the estate vineyards and regional microclimate"
    ],
    "producerId": "zacharioudakis-winery",
    "producerName": "Zacharioudakis Organic Winery",
    "producerGreekName": "Βιολογικό Οινοποιείο Ζαχαριουδάκη",
    "category": "winery",
    "destination": "crete",
    "location": "Heraklion, Plouti (Messara Valley)"
  },
  {
    "id": "exp_zacharioudakis-winery_2",
    "title": "Zacharioudakis Organic Winery - Cellar Master Reserve Tour & Regional Meze",
    "durationMinutes": 80,
    "pricePerPerson": 38,
    "badge": "Cellar Reserve",
    "description": "Go behind the scenes into the oak barrel maturation cellars of Zacharioudakis Organic Winery, followed by tasting 5 premium reserve wines paired with regional delicacies.",
    "includes": [
      "Full walking tour of the vineyards and underground barrel maturation room",
      "5 premium reserve & single-vineyard wines",
      "Traditional meze platter with cured meats, local mountain cheeses and estate olive oil"
    ],
    "producerId": "zacharioudakis-winery",
    "producerName": "Zacharioudakis Organic Winery",
    "producerGreekName": "Βιολογικό Οινοποιείο Ζαχαριουδάκη",
    "category": "winery",
    "destination": "crete",
    "location": "Heraklion, Plouti (Messara Valley)"
  },
  {
    "id": "exp_venetsanos-winery-santorini_1",
    "title": "Venetsanos Winery Santorini - Caldera Cliffside Gravity-Flow Heritage Tour & 4-Wine Flight",
    "durationMinutes": 60,
    "pricePerPerson": 30,
    "description": "Explore the first industrial winery of Santorini built in 1947 directly carved into the caldera cliffs, operating entirely by natural gravity.",
    "includes": [
      "Guided historical tour through carved volcanic stone gravity shafts",
      "4 estate wines: Nykteri, Santorini Assyrtiko, Anagallis & Mandilaria",
      "Fresh local graviera cheese, kalamata olives & crisp barley rusks"
    ],
    "producerId": "venetsanos-winery-santorini",
    "producerName": "Venetsanos Winery Santorini",
    "producerGreekName": "Οινοποιείο Βενετσάνου Σαντορίνη",
    "category": "winery",
    "destination": "santorini",
    "location": "Santorini Caldera, Megalochori (Caldera)",
    "badge": "Heritage Architecture"
  },
  {
    "id": "exp_venetsanos-winery-santorini_2",
    "title": "Venetsanos Winery Santorini - Venetsanos Golden Hour Sunset Vinsanto & Aegean Meze Feast",
    "durationMinutes": 90,
    "pricePerPerson": 58,
    "description": "Perched 300 meters above the Aegean Sea, enjoy world-famous caldera sunset views paired with rare Nykteri and sun-dried Vinsanto.",
    "includes": [
      "Front-row cliffside terrace seating during golden sunset hour",
      "5 estate wines featuring aged Nykteri and dessert Vinsanto",
      "Artisanal meze platter: smoked fava puree, local cured meats & cheeses"
    ],
    "producerId": "venetsanos-winery-santorini",
    "producerName": "Venetsanos Winery Santorini",
    "producerGreekName": "Οινοποιείο Βενετσάνου Σαντορίνη",
    "category": "winery",
    "destination": "santorini",
    "location": "Santorini Caldera, Megalochori (Caldera)",
    "badge": "Caldera Sunset"
  },
  {
    "id": "exp_domaine-sigalas-santorini_1",
    "title": "Domaine Sigalas - Oia Black Soil Assyrtiko & Mavrotragano Signature Flight",
    "durationMinutes": 60,
    "pricePerPerson": 35,
    "description": "Taste the benchmark wines of Paris Sigalas in the peaceful vineyards of Oia, exploring volcanic minerality and intense acidity.",
    "includes": [
      "4 benchmark wines: Sigalas Santorini PDO, Kavalieros, Eptani & Mavrotragano",
      "Cycladic cheese board with aged Naxos Graviera and caper shoots",
      "Sommelier introduction to the volcanic microclimate and drought conditions"
    ],
    "producerId": "domaine-sigalas-santorini",
    "producerName": "Domaine Sigalas",
    "producerGreekName": "Κτήμα Σιγάλα",
    "category": "winery",
    "destination": "santorini",
    "location": "Santorini, Oia (Baxedes Plain)",
    "badge": "Sommelier Choice"
  },
  {
    "id": "exp_domaine-sigalas-santorini_2",
    "title": "Domaine Sigalas - Sigalas Vineyard Pergola Degustation & Cycladic Culinary Pairing",
    "durationMinutes": 90,
    "pricePerPerson": 70,
    "description": "Dine under the shaded grape pergolas in the plains of Oia, savoring a multi-course seasonal tasting menu paired with rare back-vintages.",
    "includes": [
      "5 single-vineyard cru wines including library vintage Kavalieros",
      "4-course gourmet Cycladic lunch featuring local fava, octopus and lamb",
      "Chilled Sigalas Vinsanto served with artisanal chocolate dessert"
    ],
    "producerId": "domaine-sigalas-santorini",
    "producerName": "Domaine Sigalas",
    "producerGreekName": "Κτήμα Σιγάλα",
    "category": "winery",
    "destination": "santorini",
    "location": "Santorini, Oia (Baxedes Plain)",
    "badge": "Vineyard Dining"
  },
  {
    "id": "exp_gavalas-winery-santorini_1",
    "title": "Gavalas Winery Santorini - 5th Generation Stone Vats & Rare Katsano / Voudomato Flight",
    "durationMinutes": 60,
    "pricePerPerson": 28,
    "description": "Visit one of Santorini’s oldest family canavas in Megalochori and taste ultra-rare revived indigenous varieties found nowhere else.",
    "includes": [
      "Tour of the 19th-century canava and traditional stone stomping vats",
      "4 wines featuring rare indigenous Katsano, Voudomato, and Santorini Assyrtiko",
      "Barley rusks with homemade tomato paste and aged volcanic graviera"
    ],
    "producerId": "gavalas-winery-santorini",
    "producerName": "Gavalas Winery Santorini",
    "producerGreekName": "Οινοποιείο Γαβαλά Σαντορίνη",
    "category": "winery",
    "destination": "santorini",
    "location": "Santorini, Megalochori Village",
    "badge": "Rare Indigenous"
  },
  {
    "id": "exp_gavalas-winery-santorini_2",
    "title": "Gavalas Winery Santorini - Gavalas Historic Canava Cellar Walk & Aged Natural Vinsanto",
    "durationMinutes": 80,
    "pricePerPerson": 50,
    "description": "Deep dive into 150 years of family winemaking heritage with a barrel cellar tasting of natural Vinsanto and aged Nykteri.",
    "includes": [
      "Behind-the-scenes access to historic subterranean maturation cellars",
      "5 premium estate pours including Natural Nykteri and 2009 Vinsanto",
      "Selection of dry figs, walnuts, pasteli and artisanal Greek cheeses"
    ],
    "producerId": "gavalas-winery-santorini",
    "producerName": "Gavalas Winery Santorini",
    "producerGreekName": "Οινοποιείο Γαβαλά Σαντορίνη",
    "category": "winery",
    "destination": "santorini",
    "location": "Santorini, Megalochori Village",
    "badge": "Historic Canava"
  },
  {
    "id": "exp_gaia-wines-santorini_1",
    "title": "Gaia Wines Santorini - Monolithos Beachfront & Thalassitis Submerged Sea-Aged Tasting",
    "durationMinutes": 60,
    "pricePerPerson": 38,
    "description": "Visit the converted tomato cannery on the black sand beach of Monolithos and hear the story of wines aged under the Aegean Sea.",
    "includes": [
      "Tour of the coastal winery right on the volcanic pebble shoreline",
      "4 wines: Thalassitis, Wild Ferment Assyrtiko, Gaia S & Monograph",
      "Comparative discussion of undersea bottle aging vs cellar maturation",
      "Santorini fava dip, smoked mackerel bites & caper berries"
    ],
    "producerId": "gaia-wines-santorini",
    "producerName": "Gaia Wines Santorini",
    "producerGreekName": "Γαία Οινοποιητική Σαντορίνη",
    "category": "winery",
    "destination": "santorini",
    "location": "Santorini, Monolithos / Kamari Beach",
    "badge": "Ocean Aged"
  },
  {
    "id": "exp_gaia-wines-santorini_2",
    "title": "Gaia Wines Santorini - Wild Ferment Assyrtiko & Barrel-Aged Aegean Sunset Pairing",
    "durationMinutes": 90,
    "pricePerPerson": 65,
    "description": "An exploration of spontaneous fermentation in wood, stainless steel, and clay, paired with sea-salted Greek mezze.",
    "includes": [
      "5 wines showcasing wild-yeast oak, acacia, and French barrique vinification",
      "Seafood meze platter: grilled calamari, smoked eel & local cheese",
      "Beachfront sunset seating with waves lapping just meters away"
    ],
    "producerId": "gaia-wines-santorini",
    "producerName": "Gaia Wines Santorini",
    "producerGreekName": "Γαία Οινοποιητική Σαντορίνη",
    "category": "winery",
    "destination": "santorini",
    "location": "Santorini, Monolithos / Kamari Beach",
    "badge": "Wild Fermentation"
  },
  {
    "id": "exp_santo-wines-santorini_1",
    "title": "Santo Wines Cooperative - Caldera Panoramic Terrace Flight (6 Terroir Wines)",
    "durationMinutes": 60,
    "pricePerPerson": 32,
    "description": "Sitting high on the caldera edge at Pyrgos, taste 6 distinctive volcanic wines produced by Santorini’s 1,200 member grape growers union.",
    "includes": [
      "6 cooperative estate wines: Assyrtiko, Athiri, Aidani, Rose, Kameni, Vinsanto",
      "Breathtaking 360-degree caldera cliff and volcano panorama",
      "Greek meze plate with PDO Santorini Fava, tomato keftedes & graviera"
    ],
    "producerId": "santo-wines-santorini",
    "producerName": "Santo Wines Cooperative",
    "producerGreekName": "Συνεταιρισμός Santo Wines Σαντορίνη",
    "category": "winery",
    "destination": "santorini",
    "location": "Santorini Caldera, Pyrgos (Caldera Rim)",
    "badge": "Iconic View"
  },
  {
    "id": "exp_santo-wines-santorini_2",
    "title": "Santo Wines Cooperative - Santo Sunset VIP Cellar Reserve Tasting & Gastronomic Pairing",
    "durationMinutes": 90,
    "pricePerPerson": 68,
    "description": "Reserved prime terrace seating at sunset with a private sommelier presenting old vintage Assyrtiko and barrel-aged Vinsanto.",
    "includes": [
      "Exclusive reserved seating for the world-famous Santorini sunset",
      "5 top-tier reserve wines including Grand Reserve and Kameni Oak",
      "Four paired gourmet mezedes highlighting volcanic soil agriculture"
    ],
    "producerId": "santo-wines-santorini",
    "producerName": "Santo Wines Cooperative",
    "producerGreekName": "Συνεταιρισμός Santo Wines Σαντορίνη",
    "category": "winery",
    "destination": "santorini",
    "location": "Santorini Caldera, Pyrgos (Caldera Rim)",
    "badge": "VIP Caldera"
  },
  {
    "id": "exp_gaia-wines-nemea_1",
    "title": "Gaia Wines Nemea - Koutsi Mountain Single-Vineyard Agiorgitiko Flight",
    "durationMinutes": 60,
    "pricePerPerson": 25,
    "description": "Perched on the steep chalky slopes of Koutsi at 650m, taste high-altitude Agiorgitiko wines offering sublime freshness and structure.",
    "includes": [
      "Walk through the amphitheater-shaped vineyards overlooking the Nemea plain",
      "4 wines: Gaia Estate Nemea, Agiorgitiko by Gaia, Notios Red & 14-18h Rose",
      "Local Corinthian currants, aged sheep cheese & village bread"
    ],
    "producerId": "gaia-wines-nemea",
    "producerName": "Gaia Wines Nemea",
    "producerGreekName": "Γαία Οινοποιητική Νεμέα",
    "category": "winery",
    "destination": "peloponnese",
    "location": "Nemea, Koutsi (Nemea)",
    "badge": "High Altitude"
  },
  {
    "id": "exp_gaia-wines-nemea_2",
    "title": "Gaia Wines Nemea - Gaia Clay Amphora & High-Elevation Clay Terroir Masterclass",
    "durationMinutes": 80,
    "pricePerPerson": 50,
    "description": "Taste experimental Agiorgitiko and Assyrtiko fermented in subterranean clay vessels and French oak barriques with the resident winemaker.",
    "includes": [
      "Visit to the experimental vinification room and clay amphora row",
      "5 wines featuring Gaia Estate single-block reserves and clay amphora cuvees",
      "Smoked Peloponnesian pork bites, wild thyme olives & aged graviera"
    ],
    "producerId": "gaia-wines-nemea",
    "producerName": "Gaia Wines Nemea",
    "producerGreekName": "Γαία Οινοποιητική Νεμέα",
    "category": "winery",
    "destination": "peloponnese",
    "location": "Nemea, Koutsi (Nemea)",
    "badge": "Amphora Clay"
  },
  {
    "id": "exp_domaine-mercouri_1",
    "title": "Domaine Mercouri - Coastal Pine Forest Estate Walk & Historic Refosco Flight",
    "durationMinutes": 60,
    "pricePerPerson": 25,
    "description": "Stroll through 150 years of agricultural history overlooking the Ionian Sea, where peacocks roam freely under century-old maritime pines.",
    "includes": [
      "Guided walk through the historical estate, olive groves and family museum",
      "4 wines: Domaine Mercouri Red (Refosco/Mavrodafni), Kallisto, Foloi & Daphne",
      "Mercouri estate-grown Koroneiki olive oil with fresh bread and local cheese"
    ],
    "producerId": "domaine-mercouri",
    "producerName": "Domaine Mercouri",
    "producerGreekName": "Κτήμα Μερκούρη",
    "category": "winery",
    "destination": "peloponnese",
    "location": "Ilia, Korakochori (Peloponnese)",
    "badge": "Historic Estate"
  },
  {
    "id": "exp_domaine-mercouri_2",
    "title": "Domaine Mercouri - 150-Year Heritage Manor Tour & Kallisto / Foloi Olive Oil Pairing",
    "durationMinutes": 90,
    "pricePerPerson": 50,
    "description": "Step inside the Mercouri family’s 19th-century estate manor and stone cellars, pairing aged Refosco wines with estate extra virgin olive oil.",
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
    "badge": "Coastal Heritage"
  },
  {
    "id": "exp_ktima-tselepos_1",
    "title": "Ktima Tselepos - Mantineia High-Plateau Moschofilero & Blanc de Gris Flight",
    "durationMinutes": 60,
    "pricePerPerson": 25,
    "description": "Explore the cool, high-altitude plateau of Mantineia at 650m and discover the exotic, aromatic nuances of the pink-skinned Moschofilero grape.",
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
    "badge": "Cult Classic"
  },
  {
    "id": "exp_tetramythos-winery_1",
    "title": "Tetramythos Winery - Mount Helmos High-Altitude Organic Roditis & Sideritis Tasting",
    "durationMinutes": 60,
    "pricePerPerson": 24,
    "description": "Perched on the snowy foothills of Mount Helmos at 850m, taste crisp, mineral organic wines with natural alpine acidity.",
    "includes": [
      "Panoramic view of the Gulf of Corinth and high-altitude mountain slopes",
      "4 organic wines: Roditis Nature, Sideritis, Black Kalavryta & Malagousia",
      "Achaian village feta cheese, wild oregano rusks & local mountain honey"
    ],
    "producerId": "tetramythos-winery",
    "producerName": "Tetramythos Winery",
    "producerGreekName": "Οινοποιείο Τετράμυθος",
    "category": "winery",
    "destination": "peloponnese",
    "location": "Aigialeia, Ano Diakopto (Peloponnese)",
    "badge": "Alpine Slopes"
  },
  {
    "id": "exp_tetramythos-winery_2",
    "title": "Tetramythos Winery - Black Kalavryta & Clay Retsina Nature Amphora Workshop",
    "durationMinutes": 85,
    "pricePerPerson": 48,
    "description": "Discover how natural retsina is fermented in buried clay amphoras with fresh pine resin from local Pinus halepensis trees.",
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
    "badge": "Natural & Amphora"
  },
  {
    "id": "exp_monemvasia-winery_1",
    "title": "Monemvasia Winery (Tsimbidi) - Malvasia Rebirth: Historic Sun-Dried Malvasia & Kydonitsa Tasting",
    "durationMinutes": 60,
    "pricePerPerson": 26,
    "description": "Relive the medieval glory of Malvasia wine, resurrected by Yiorgos Tsimbidis after centuries of historical research in Laconia.",
    "includes": [
      "Historical narrative on Monemvasia’s trade route and Byzantine grape lore",
      "4 wines: Malvasia PDO Sun-Dried, Kydonitsa, Asproudi & Monembasia Red",
      "Laconian lalagia fried dough strips, cured syglino pork & sfela cheese"
    ],
    "producerId": "monemvasia-winery",
    "producerName": "Monemvasia Winery (Tsimbidi)",
    "producerGreekName": "Οινοποιητική Μονεμβασιάς (Τσιμπίδη)",
    "category": "winery",
    "destination": "peloponnese",
    "location": "Laconia, Velies (Monemvasia)",
    "badge": "Medieval Legend"
  },
  {
    "id": "exp_monemvasia-winery_2",
    "title": "Monemvasia Winery (Tsimbidi) - Laconian Terroir & Byzantine Sun-Dried Nectar Cellar Tour",
    "durationMinutes": 85,
    "pricePerPerson": 52,
    "description": "Visit the maturation cellar where sun-dried grapes concentrate into golden nectar aged for years in oak barrels.",
    "includes": [
      "Tour of the drying straw mats (seasonal) and barrel maturation cellar",
      "5 wines featuring 2 vintage Malvasia PDO releases and single-vineyard Kydonitsa",
      "Artisanal pairing of aged graviera, dried local figs, walnuts & dark chocolate"
    ],
    "producerId": "monemvasia-winery",
    "producerName": "Monemvasia Winery (Tsimbidi)",
    "producerGreekName": "Οινοποιητική Μονεμβασιάς (Τσιμπίδη)",
    "category": "winery",
    "destination": "peloponnese",
    "location": "Laconia, Velies (Monemvasia)",
    "badge": "Byzantine Nectar"
  },
  {
    "id": "exp_ktima-gerovassiliou_1",
    "title": "Ktima Gerovassiliou - World Corkscrew Museum & Malagousia Terroir Flight",
    "durationMinutes": 75,
    "pricePerPerson": 30,
    "description": "Tour the famous Gerovassiliou Wine Museum housing over 2,600 rare antique corkscrews, followed by tasting the grape saved from extinction: Malagousia.",
    "includes": [
      "Guided tour of the world-renowned Gerovassiliou Wine & Corkscrew Museum",
      "4 estate wines: Single-Vineyard Malagousia, White Estate, Avaton & Red Estate",
      "Northern Greek artisanal cheese platter with freshly baked bread and estate oil"
    ],
    "producerId": "ktima-gerovassiliou",
    "producerName": "Ktima Gerovassiliou",
    "producerGreekName": "Κτήμα Γεροβασιλείου",
    "category": "winery",
    "destination": "northern_greece",
    "location": "Thessaloniki, Epanomi (Thessaloniki)",
    "badge": "Heritage & Wine"
  },
  {
    "id": "exp_ktima-gerovassiliou_2",
    "title": "Ktima Gerovassiliou - Avaton Rare Ancient Varietals Vertical & Estate Cellar Tour",
    "durationMinutes": 90,
    "pricePerPerson": 60,
    "description": "Explore the underground barrel aging cellar and taste older vintages of Avaton (blend of ancient Limnio, Mavrotragano, and Mavroudi).",
    "includes": [
      "Private access to the subterranean barrel cellar and private library bins",
      "5 top reserve pours including 2 older vintages of Gerovassiliou Avaton",
      "Gourmet Macedonian cold cuts, truffle graviera & smoked Metsovone cheese"
    ],
    "producerId": "ktima-gerovassiliou",
    "producerName": "Ktima Gerovassiliou",
    "producerGreekName": "Κτήμα Γεροβασιλείου",
    "category": "winery",
    "destination": "northern_greece",
    "location": "Thessaloniki, Epanomi (Thessaloniki)",
    "badge": "Ancient Grapes"
  },
  {
    "id": "exp_domaine-biblia-chora_1",
    "title": "Domaine Biblia Chora - Mount Pangeon Limestone Terroir Flight (Ovilos & Areti)",
    "durationMinutes": 60,
    "pricePerPerson": 28,
    "description": "Nestled on the slopes of Mount Pangeon where Dionysian rituals began, taste world-acclaimed blends of Assyrtiko and Semillon.",
    "includes": [
      "Tour of the state-of-the-art organic gravity winery and vineyards",
      "4 benchmark wines: Ktima White, Ovilos (Assyrtiko/Semillon), Areti & Biblinos",
      "Local Kavala cheeses, wild herb rusks and marinated green olives"
    ],
    "producerId": "domaine-biblia-chora",
    "producerName": "Domaine Biblia Chora",
    "producerGreekName": "Κτήμα Βιβλία Χώρα",
    "category": "winery",
    "destination": "northern_greece",
    "location": "Kavala, Kokkinochori (Mount Pangeon)",
    "badge": "Mountain Terroir"
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
    "title": "Alpha Estate - Twin-Lake Plateau Cold-Climate Xinomavro & Sauvignon Fume Flight",
    "durationMinutes": 60,
    "pricePerPerson": 30,
    "description": "Perched at 650m altitude between two mountain lakes in Amyndeon, explore Greece’s most technologically advanced cold-climate terroir.",
    "includes": [
      "Vineyard terrace briefing overlooking Lake Vegoritis and Lake Petron",
      "4 wines: Ecosystem Sauvignon Blanc Fume, Hedgehog Xinomavro, Axia & Rose",
      "Florina sweet roasted red pepper dip, local sourdough & sheep graviera"
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
    "title": "Alpha Estate - Ecosystem Single-Block Old-Vine Vertical & Lake View Degustation",
    "durationMinutes": 90,
    "pricePerPerson": 65,
    "description": "A masterclass of single-parcel ungrafted century-old bush vines, comparing aged Xinomavro vintages paired with Florina gastronomic specialties.",
    "includes": [
      "Visit to the century-old phylloxera-free ungrafted bush vine parcels",
      "5 top cru wines: Ecosystem Barba Yannis Xinomavro, Alpha One & Library Vintages",
      "Gastronomic pairing: Florina roasted peppers, wild mushrooms & aged Macedonian cheeses"
    ],
    "producerId": "alpha-estate",
    "producerName": "Alpha Estate",
    "producerGreekName": "Κτήμα Άλφα",
    "category": "winery",
    "destination": "northern_greece",
    "location": "Florina, Amyndeon (Florina)",
    "badge": "Single Block Cru"
  },
  {
    "id": "exp_ktima-pavlidis_1",
    "title": "Ktima Pavlidis - Marble Mountains of Drama: Emphasis & Thema Flight",
    "durationMinutes": 60,
    "pricePerPerson": 25,
    "description": "Surrounded by the marble-rich mountains of Drama, taste elegant single-varietal wines harvested at night to preserve pristine aromatics.",
    "includes": [
      "Guided tour of modern avant-garde winery architecture and sorting tables",
      "4 signature wines: Thema White (Sauvignon/Assyrtiko), Thema Red, Emphasis Syrah, Emphasis Agiorgitiko",
      "Drama region sheep cheese, smoked pork fillet & homemade breadsticks"
    ],
    "producerId": "ktima-pavlidis",
    "producerName": "Ktima Pavlidis",
    "producerGreekName": "Κτήμα Παυλίδη",
    "category": "winery",
    "destination": "northern_greece",
    "location": "Drama, Kokkinogeia (Drama)",
    "badge": "Drama Terroir"
  },
  {
    "id": "exp_ktima-pavlidis_2",
    "title": "Ktima Pavlidis - Pavlidis Night-Harvest Masterclass & French Oak Barrel Tasting",
    "durationMinutes": 80,
    "pricePerPerson": 50,
    "description": "Learn why night-harvesting at 4:00 AM changes grape biochemistry and taste developing wines straight from French oak barrels.",
    "includes": [
      "Presentation of night-harvest technology and thermo-regulated vinification",
      "5 wines including experimental single-barrel lots and aged Thema vintages",
      "Selection of regional Macedonian dry salamis, graviera & fig marmalade"
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
    "id": "exp_domaine-karanika_1",
    "title": "Domaine Karanika - Biodynamic Methode Traditionnelle Sparkler & Brut Nature Flight",
    "durationMinutes": 60,
    "pricePerPerson": 28,
    "description": "Greece’s leading producer of organic method-champenoise sparkling wines: taste vintage sparkling Xinomavro disgorged without dosage.",
    "includes": [
      "Tour of the traditional riddling pupitres and manual disgorging area",
      "4 sparkling & still wines: Brut Cuvee Speciale, Brut Rose, Cuvee Prestige & Xinomavro Red",
      "Crisp savory cheese biscuits and smoked lake trout canapes"
    ],
    "producerId": "domaine-karanika",
    "producerName": "Domaine Karanika",
    "producerGreekName": "Κτήμα Καρανίκα",
    "category": "winery",
    "destination": "northern_greece",
    "location": "Florina, Amyndeon (Florina)",
    "badge": "Sparkling Master"
  },
  {
    "id": "exp_domaine-karanika_2",
    "title": "Domaine Karanika - Karanika High-Altitude Old-Vine Xinomavro & Artisanal Fondue Pairing",
    "durationMinutes": 90,
    "pricePerPerson": 55,
    "description": "Discover how cold Amyndeon nights produce world-class bubbles. Savor vintage sparkling wines paired with local melted mountain cheeses.",
    "includes": [
      "5 wines featuring 3 vintage sparkling cuvees and Karanika Terra Petra Red",
      "Interactive disgorgement demonstration with the winemaker",
      "Macedonian melted mountain cheese pot with wild herbs and crusty sourdough"
    ],
    "producerId": "domaine-karanika",
    "producerName": "Domaine Karanika",
    "producerGreekName": "Κτήμα Καρανίκα",
    "category": "winery",
    "destination": "northern_greece",
    "location": "Florina, Amyndeon (Florina)",
    "badge": "Terroir & Bubbles"
  },
  {
    "id": "exp_kazani-kokolakis_1",
    "title": "Kazani Kokolakis - Copper Alembic Raki Still & Oak-Matured Tsikoudia Tasting",
    "durationMinutes": 50,
    "pricePerPerson": 16,
    "description": "Visit an authentic working village kazani in Heraklion and learn how Cretan grape skins are transformed into pure clear spirit.",
    "includes": [
      "Detailed explanation of the double-distillation process and copper coil condensation",
      "3 distillates: Traditional clear tsikoudia, 3-year oak barrel-aged, and spiced rakomelo",
      "Warm toasted village bread with mizithra cheese and mountain honey"
    ],
    "producerId": "kazani-kokolakis",
    "producerName": "Kazani Kokolakis",
    "producerGreekName": "Παραδοσιακό Καζάνι Κοκολάκη",
    "category": "kazani",
    "destination": "crete",
    "location": "Heraklion, Archanes Village",
    "badge": "Copper Alembic"
  },
  {
    "id": "exp_kazani-kokolakis_2",
    "title": "Kazani Kokolakis - Autumn Rakokazano Feast with Roasted Chestnuts & Charcoal Lamb",
    "durationMinutes": 100,
    "pricePerPerson": 40,
    "description": "Participate in Crete’s most joyful autumn tradition: the rakokazano gathering with live wood fires, music, and charcoal-grilled feast.",
    "includes": [
      "Tasting of hot first-run spirit (protoraki) coming right out of the condensing pipe",
      "Charcoal-grilled lamb chops, roasted sweet chestnuts & potatoes baked in embers",
      "Unlimited village wine and tsikoudia with traditional Cretan hospitality"
    ],
    "producerId": "kazani-kokolakis",
    "producerName": "Kazani Kokolakis",
    "producerGreekName": "Παραδοσιακό Καζάνι Κοκολάκη",
    "category": "kazani",
    "destination": "crete",
    "location": "Heraklion, Archanes Village",
    "badge": "Rakokazano Feast"
  },
  {
    "id": "exp_peskesi-farm-kazani_1",
    "title": "Peskesi Organic Farm & Kazani - Peskesi Traditional Wood-Fired Kazani Still Tour & Tsikoudia Flight",
    "durationMinutes": 60,
    "pricePerPerson": 20,
    "description": "At the certified organic Peskesi Farm in Haraso, experience traditional wood-fired distillation of grape pomace in authentic copper cauldrons.",
    "includes": [
      "Walk through the historic copper alembic still house with the master distiller",
      "Tasting of 3 distillates: Fresh Tsikoudia straight from the coil, Aged Raki & Rakomelo",
      "Wood-roasted potatoes in ash, organic farm olives & sourdough bread"
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
    "title": "Peskesi Organic Farm & Kazani - Farm-to-Table Minoan Hearthside Cooking & Distillation Feast",
    "durationMinutes": 120,
    "pricePerPerson": 48,
    "description": "A slow-food celebration at the organic farm: harvest seasonal vegetables, watch copper pot distillation, and feast by the open wood hearth.",
    "includes": [
      "Guided foraging of heirloom wild greens and vegetables across the organic farm",
      "Four-course traditional Cretan meal cooked over wood coals in clay pots",
      "Unlimited fresh tsikoudia from the copper still and organic farm wine"
    ],
    "producerId": "peskesi-farm-kazani",
    "producerName": "Peskesi Organic Farm & Kazani",
    "producerGreekName": "Αγρόκτημα & Καζάνι Πεσκέσι",
    "category": "kazani",
    "destination": "crete",
    "location": "Heraklion, Harasso (Hersonissos)",
    "badge": "Farm Gastronomy"
  },
  {
    "id": "exp_canava-santorini-distillery_1",
    "title": "Canava Santorini Distillery - Volcanic Tsikoudia & Wild Anise Ouzo Masterclass",
    "durationMinutes": 50,
    "pricePerPerson": 20,
    "description": "Santorini’s first licensed distillery in Messaria: discover how Assyrtiko grape pomace is distilled into smooth crystal spirit.",
    "includes": [
      "Walk through copper alembic pot stills and sensory herb displays",
      "Tasting of 3 distillates: Tsikoudia Santorini, Herbal Ouzo & Liqueur",
      "Pickled octopus, roasted chickpeas & wild capers"
    ],
    "producerId": "canava-santorini-distillery",
    "producerName": "Canava Santorini Distillery",
    "producerGreekName": "Αποσταγματοποιία Canava Σαντορίνη",
    "category": "kazani",
    "destination": "santorini",
    "location": "Santorini, Messaria (Santorini)",
    "badge": "Distillery Craft"
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
    "id": "exp_parasiris-olive-mill_1",
    "title": "Parasiris Olive Mill & Heritage Museum - Melidoni Heritage Olive Mill & 18th-Century Press Walk",
    "durationMinutes": 50,
    "pricePerPerson": 15,
    "description": "Visit the historic village of Melidoni and trace olive oil production across three centuries from wooden animal-driven presses to modern centrifuges.",
    "includes": [
      "Guided walkthrough of preserved 18th-century stone and wood olive presses",
      "Sensory tasting of 3 single-estate extra virgin olive oils (mild, robust, infused)",
      "Traditional Cretan dakos with crushed tomatoes, mizithra cheese & sea salt"
    ],
    "producerId": "parasiris-olive-mill",
    "producerName": "Parasiris Olive Mill & Heritage Museum",
    "producerGreekName": "Ελαιοτριβείο & Μουσείο Παρασύρη",
    "category": "olive_mill",
    "destination": "crete",
    "location": "Rethymno, Melidoni (Mylopotamos)",
    "badge": "Heritage Mill"
  },
  {
    "id": "exp_parasiris-olive-mill_2",
    "title": "Parasiris Olive Mill & Heritage Museum - Parasiris Cold-Pressed Olive Oil Tasting with Warm Wood-Fired Bread",
    "durationMinutes": 75,
    "pricePerPerson": 28,
    "description": "Bake your own traditional village pita in the wood-fired outdoor oven and dip it hot into freshly pressed golden-green olive oil.",
    "includes": [
      "Hands-on bread baking demonstration using stone-ground Cretan flour",
      "Tasting of high-polyphenol Koroneiki olive oil with official tasting cups",
      "Village table spread with wild capers, country olives, cheese & local raki"
    ],
    "producerId": "parasiris-olive-mill",
    "producerName": "Parasiris Olive Mill & Heritage Museum",
    "producerGreekName": "Ελαιοτριβείο & Μουσείο Παρασύρη",
    "category": "olive_mill",
    "destination": "crete",
    "location": "Rethymno, Melidoni (Mylopotamos)",
    "badge": "Hearth & Harvest"
  },
  {
    "id": "exp_cretan-olive-oil-farm_1",
    "title": "Cretan Olive Oil Farm - Mirabello Bay Olive Oil, Pottery & Wild Herb Cooking Workshop",
    "durationMinutes": 75,
    "pricePerPerson": 25,
    "description": "Immerse yourself in traditional Cretan farm life overlooking Mirabello Bay: taste cold-pressed oils, watch pottery making, and smell wild herbs.",
    "includes": [
      "Farm walk through aromatic herb gardens and historic stone olive press",
      "Tasting of 3 organic extra virgin olive oils with village bread",
      "Demonstration of traditional Cretan ceramic pot creation"
    ],
    "producerId": "cretan-olive-oil-farm",
    "producerName": "Cretan Olive Oil Farm",
    "producerGreekName": "Κρητικό Αγρόκτημα Ελαιολάδου",
    "category": "olive_mill",
    "destination": "crete",
    "location": "Lasithi, Agios Nikolaos (Mirabello)",
    "badge": "Farm Experience"
  },
  {
    "id": "exp_cretan-olive-oil-farm_2",
    "title": "Cretan Olive Oil Farm - Traditional Donkey Press Experience & Hand-Rolled Bread Baking",
    "durationMinutes": 90,
    "pricePerPerson": 40,
    "description": "Participate in traditional farm activities: hand-roll sourdough bread, press olives the old-fashioned way, and cook over open coals.",
    "includes": [
      "Interactive bread-making workshop in outdoor stone hearths",
      "Tasting of olive oils, local artisanal honey, and sheep milk cheeses",
      "Farmhouse meze platter with fresh garden vegetables and village wine"
    ],
    "producerId": "cretan-olive-oil-farm",
    "producerName": "Cretan Olive Oil Farm",
    "producerGreekName": "Κρητικό Αγρόκτημα Ελαιολάδου",
    "category": "olive_mill",
    "destination": "crete",
    "location": "Lasithi, Agios Nikolaos (Mirabello)",
    "badge": "Hands-on Village"
  },
  {
    "id": "exp_liokareas-olive-estate_1",
    "title": "Liokareas Olive Estate - Kalamata Wild Athinoelia & Koroneiki High-Phenolic EVOO Flight",
    "durationMinutes": 60,
    "pricePerPerson": 24,
    "description": "In the Mani foothills of Kalamata, taste fifth-generation estate olive oils made from ancient Athinoelia and Koroneiki olives.",
    "includes": [
      "Tour of the certified organic family groves and modern two-phase mill",
      "Tasting of 4 monovarietal & co-milled olive oils (Early Harvest, Athinoelia, Wild Thyme, Lemon)",
      "Mani cured pork syglino, Kalamata olives & freshly baked sourdough"
    ],
    "producerId": "liokareas-olive-estate",
    "producerName": "Liokareas Olive Estate",
    "producerGreekName": "Ελαιοκτήματα Λιοκαρέα",
    "category": "olive_mill",
    "destination": "peloponnese",
    "location": "Messinia, Mani Peninsula (Peloponnese)",
    "badge": "Kalamata EVOO"
  },
  {
    "id": "exp_liokareas-olive-estate_2",
    "title": "Liokareas Olive Estate - Liokareas Century-Old Family Grove Walk & Infused Oil Workshop",
    "durationMinutes": 85,
    "pricePerPerson": 45,
    "description": "Learn the secrets of whole-fruit co-milling where fresh citrus, garlic, and wild herbs are crushed simultaneously with olives.",
    "includes": [
      "Hands-on workshop blending and tasting fresh herb-infused oils",
      "Professional cobalt glass sensory analysis of bitterness and pungency",
      "Traditional Mani meal: toasted bread with warm olive oil, graviera & local wine"
    ],
    "producerId": "liokareas-olive-estate",
    "producerName": "Liokareas Olive Estate",
    "producerGreekName": "Ελαιοκτήματα Λιοκαρέα",
    "category": "olive_mill",
    "destination": "peloponnese",
    "location": "Messinia, Mani Peninsula (Peloponnese)",
    "badge": "Mani Masterclass"
  },
  {
    "id": "exp_aerakis-dairy-anogeia_1",
    "title": "Aerakis Traditional Mountain Dairy - Anogeia High-Psiloritis Alpine Raw Milk Cheese Flight",
    "durationMinutes": 60,
    "pricePerPerson": 18,
    "description": "In the legendary shepherd stronghold of Anogeia at 800m, taste raw sheep and goat cheeses grazing on high-altitude alpine herbs.",
    "includes": [
      "Presentation of the Anogeia pastoral dairy tradition and seasonal transhumance",
      "Tasting of PDO Graviera Kritis, sharp aged Kefalotyri, and creamy Tyrozouli",
      "Cretan mountain tea, wild thyme honey drizzle & warm toasted carob bread"
    ],
    "producerId": "aerakis-dairy-anogeia",
    "producerName": "Aerakis Traditional Mountain Dairy",
    "producerGreekName": "Παραδοσιακό Τυροκομείο Αεράκη",
    "category": "cheese_dairy",
    "destination": "crete",
    "location": "Rethymno, Anogeia (Mount Psiloritis)",
    "badge": "Mountain Alpine"
  },
  {
    "id": "exp_aerakis-dairy-anogeia_2",
    "title": "Aerakis Traditional Mountain Dairy - Shepherd Mitato Cheese Tradition & Smoked Cretan Ham Walk",
    "durationMinutes": 85,
    "pricePerPerson": 36,
    "description": "Experience how shepherds in high stone mitato huts preserved cheese for millennia, paired with traditional wood-smoked meats.",
    "includes": [
      "Visit to a stone-built mitato replica and cheese maturing wooden shelves",
      "5 artisanal dairy tastings including cave-matured Graviera with peppercorns",
      "Anogeian smoked pork, wild mountain greens & local village red wine"
    ],
    "producerId": "aerakis-dairy-anogeia",
    "producerName": "Aerakis Traditional Mountain Dairy",
    "producerGreekName": "Παραδοσιακό Τυροκομείο Αεράκη",
    "category": "cheese_dairy",
    "destination": "crete",
    "location": "Rethymno, Anogeia (Mount Psiloritis)",
    "badge": "Mitato Heritage"
  },
  {
    "id": "exp_tzourmpakis-dairy-amari_1",
    "title": "Tzourmpakis Artisan Dairy - Amari Valley Tyromala & 18-Month Aged Graviera Masterclass",
    "durationMinutes": 60,
    "pricePerPerson": 20,
    "description": "Tucked beneath Mount Kedros in the pristine Amari Valley, taste cheeses crafted from pure sheep and goat milk without chemical additives.",
    "includes": [
      "Tour of the family dairy and subterranean cheese maturation room",
      "4 cheeses: Fresh Tyromala, Smoked Graviera, Aged Kefalotyri & Anthotiros",
      "Amari valley walnuts, fresh figs, rusks & cold mountain spring water"
    ],
    "producerId": "tzourmpakis-dairy-amari",
    "producerName": "Tzourmpakis Artisan Dairy",
    "producerGreekName": "Τυροκομείο Τζουρμπάκη",
    "category": "cheese_dairy",
    "destination": "crete",
    "location": "Rethymno, Amari Valley (Mount Kedros)",
    "badge": "Amari Valley"
  },
  {
    "id": "exp_tzourmpakis-dairy-amari_2",
    "title": "Tzourmpakis Artisan Dairy - Artisanal Cauldron Cheese-Making & Wild Herb Butter Tasting",
    "durationMinutes": 80,
    "pricePerPerson": 36,
    "description": "Learn the ancient science of raw milk curd setting and taste fresh Staka butter made from simmering rich sheep milk cream.",
    "includes": [
      "Hands-on curd setting and cheese mold pressing demonstration",
      "Tasting of warm Staka with fried village eggs and crusty bread",
      "Platter of 4 reserve cheeses paired with local Rethymno village wine"
    ],
    "producerId": "tzourmpakis-dairy-amari",
    "producerName": "Tzourmpakis Artisan Dairy",
    "producerGreekName": "Τυροκομείο Τζουρμπάκη",
    "category": "cheese_dairy",
    "destination": "crete",
    "location": "Rethymno, Amari Valley (Mount Kedros)",
    "badge": "Dairy Master"
  },
  {
    "id": "exp_stathakis-honey-park_1",
    "title": "Stathakis Family Thyme Honey & Bee Park - Kissamos Wild Thyme Bee Park Walk & Raw Comb Honey Flight",
    "durationMinutes": 50,
    "pricePerPerson": 14,
    "description": "Stroll through a protected botanical bee sanctuary in western Crete with over 50 species of Cretan nectar-producing flora.",
    "includes": [
      "Guided walk along educational bee trails observing safe glass observation hives",
      "3 raw mono-floral honey tastings (Wild Thyme, White Pine, Spring Heather)",
      "Fresh sheep yogurt with honey drizzle, walnuts & iced malotira mountain tea"
    ],
    "producerId": "stathakis-honey-park",
    "producerName": "Stathakis Family Thyme Honey & Bee Park",
    "producerGreekName": "Μελισσοκομία Σταθάκη - Πάρκο Μέλισσας",
    "category": "apiary",
    "destination": "crete",
    "location": "Chania, Kissamos (Gramvousa)",
    "badge": "Bee Sanctuary"
  },
  {
    "id": "exp_stathakis-honey-park_2",
    "title": "Stathakis Family Thyme Honey & Bee Park - Beekeeper Suit Experience: Active Hive Opening & Royal Jelly Tasting",
    "durationMinutes": 75,
    "pricePerPerson": 32,
    "description": "Put on a professional beekeeper suit, use the herbal smoker, and open an active beehive with the master apiarist.",
    "includes": [
      "Full protective suit and gentle herbal smoker handling instruction",
      "Hands-on frame removal and search for the Queen bee",
      "Fresh piece of wax honeycomb cut directly from the frame to taste and take home",
      "Tasting of pure raw royal jelly and antioxidant bee pollen granules"
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
    "title": "Meligyris Cretan Apiary - Meligyris Rare Single-Flora Honeys (White Thyme, Pine, Sage) Flight",
    "durationMinutes": 50,
    "pricePerPerson": 15,
    "description": "Taste the diverse botanical geography of Crete through rare, unfiltered single-origin honeys harvested from mountain plateaus and coastal gorges.",
    "includes": [
      "Sensory tasting of 4 single-origin honeys: Wild Thyme, Sage, Oak, White Thyme",
      "Visual and aroma profiling using official honey color and viscosity scales",
      "Freshly made Cretan sfakianopita (cheese pancake) drenched in warm honey"
    ],
    "producerId": "meligyris-apiary",
    "producerName": "Meligyris Cretan Apiary",
    "producerGreekName": "Μελίγυρις Κρητικό Μέλι",
    "category": "apiary",
    "destination": "crete",
    "location": "Heraklion, Arkalochori (Heraklion)",
    "badge": "Single Origin"
  },
  {
    "id": "exp_meligyris-apiary_2",
    "title": "Meligyris Cretan Apiary - Ancient Beekeeping Traditions & Cretan Malotira Tea Pairing",
    "durationMinutes": 75,
    "pricePerPerson": 28,
    "description": "Discover the Minoan 3,500-year history of beekeeping on Crete and learn how medicinal mountain herbs amplify the healing power of raw honey.",
    "includes": [
      "Walk through the honey processing facility and cold centrifuge extraction area",
      "Herbal tea brewing workshop pairing wild Dictamnus and Malotira with specific honeys",
      "Gift jar of organic raw Cretan thyme honey to take home"
    ],
    "producerId": "meligyris-apiary",
    "producerName": "Meligyris Cretan Apiary",
    "producerGreekName": "Μελίγυρις Κρητικό Μέλι",
    "category": "apiary",
    "destination": "crete",
    "location": "Heraklion, Arkalochori (Heraklion)",
    "badge": "Botanical Lore"
  },
  {
    "id": "exp_notos-brewery_1",
    "title": "Notos Microbrewery - Fresh Tank-Pull Draft Flight & Spent-Grain Snacks",
    "durationMinutes": 45,
    "pricePerPerson": 14,
    "badge": "Fresh Draft",
    "description": "Taste 4 unpasteurized, unfiltered craft beers pulled fresh from the conditioning tanks at Notos Microbrewery in Heraklion.",
    "includes": [
      "4 x 150ml tasting pours of fresh unfiltered craft beers",
      "Warm spent-grain pretzels or seasoned barley crisps",
      "Brewmaster tasting sheet with hop and malt descriptions"
    ],
    "producerId": "notos-brewery",
    "producerName": "Notos Microbrewery",
    "producerGreekName": "Ζυθοποιία Νότος",
    "category": "brewery",
    "destination": "crete",
    "location": "Heraklion, Heraklion City"
  },
  {
    "id": "exp_notos-brewery_2",
    "title": "Notos Microbrewery - Brewhouse Tour & Artisan Beer-Food Pairing",
    "durationMinutes": 75,
    "pricePerPerson": 28,
    "badge": "Brewery Tour",
    "description": "Step into the brewhouse with the craft brewing team, inspect raw Greek malts and wild hops, and enjoy a curated beer and tapas flight.",
    "includes": [
      "Guided walkthrough of the brewing deck, fermentation vessels and bottling line",
      "5 craft beers including limited-edition seasonal brews",
      "Smoked local sausage bites, aged graviera & pickled village vegetables"
    ],
    "producerId": "notos-brewery",
    "producerName": "Notos Microbrewery",
    "producerGreekName": "Ζυθοποιία Νότος",
    "category": "brewery",
    "destination": "crete",
    "location": "Heraklion, Heraklion City"
  },
  {
    "id": "exp_kasta-brewery_1",
    "title": "Kasta Microbrewery - Fresh Tank-Pull Draft Flight & Spent-Grain Snacks",
    "durationMinutes": 45,
    "pricePerPerson": 14,
    "badge": "Fresh Draft",
    "description": "Taste 4 unpasteurized, unfiltered craft beers pulled fresh from the conditioning tanks at Kasta Microbrewery in Heraklion.",
    "includes": [
      "4 x 150ml tasting pours of fresh unfiltered craft beers",
      "Warm spent-grain pretzels or seasoned barley crisps",
      "Brewmaster tasting sheet with hop and malt descriptions"
    ],
    "producerId": "kasta-brewery",
    "producerName": "Kasta Microbrewery",
    "producerGreekName": "Μικροζυθοποιία Κάστα",
    "category": "brewery",
    "destination": "crete",
    "location": "Heraklion, Heraklion Urban Port"
  },
  {
    "id": "exp_kasta-brewery_2",
    "title": "Kasta Microbrewery - Brewhouse Tour & Artisan Beer-Food Pairing",
    "durationMinutes": 75,
    "pricePerPerson": 28,
    "badge": "Brewery Tour",
    "description": "Step into the brewhouse with the craft brewing team, inspect raw Greek malts and wild hops, and enjoy a curated beer and tapas flight.",
    "includes": [
      "Guided walkthrough of the brewing deck, fermentation vessels and bottling line",
      "5 craft beers including limited-edition seasonal brews",
      "Smoked local sausage bites, aged graviera & pickled village vegetables"
    ],
    "producerId": "kasta-brewery",
    "producerName": "Kasta Microbrewery",
    "producerGreekName": "Μικροζυθοποιία Κάστα",
    "category": "brewery",
    "destination": "crete",
    "location": "Heraklion, Heraklion Urban Port"
  },
  {
    "id": "exp_kykao-handcrafted-beers_1",
    "title": "Kykao Handcrafted Beers - Fresh Tank-Pull Draft Flight & Spent-Grain Snacks",
    "durationMinutes": 45,
    "pricePerPerson": 14,
    "badge": "Fresh Draft",
    "description": "Taste 4 unpasteurized, unfiltered craft beers pulled fresh from the conditioning tanks at Kykao Handcrafted Beers in Achaia.",
    "includes": [
      "4 x 150ml tasting pours of fresh unfiltered craft beers",
      "Warm spent-grain pretzels or seasoned barley crisps",
      "Brewmaster tasting sheet with hop and malt descriptions"
    ],
    "producerId": "kykao-handcrafted-beers",
    "producerName": "Kykao Handcrafted Beers",
    "producerGreekName": "Χειροποίητη Ζυθοποιία Κύκαο",
    "category": "brewery",
    "destination": "peloponnese",
    "location": "Achaia, Patras (Peloponnese)"
  },
  {
    "id": "exp_kykao-handcrafted-beers_2",
    "title": "Kykao Handcrafted Beers - Brewhouse Tour & Artisan Beer-Food Pairing",
    "durationMinutes": 75,
    "pricePerPerson": 28,
    "badge": "Brewery Tour",
    "description": "Step into the brewhouse with the craft brewing team, inspect raw Greek malts and wild hops, and enjoy a curated beer and tapas flight.",
    "includes": [
      "Guided walkthrough of the brewing deck, fermentation vessels and bottling line",
      "5 craft beers including limited-edition seasonal brews",
      "Smoked local sausage bites, aged graviera & pickled village vegetables"
    ],
    "producerId": "kykao-handcrafted-beers",
    "producerName": "Kykao Handcrafted Beers",
    "producerGreekName": "Χειροποίητη Ζυθοποιία Κύκαο",
    "category": "brewery",
    "destination": "peloponnese",
    "location": "Achaia, Patras (Peloponnese)"
  },
  {
    "id": "exp_siris-craft-brewery_1",
    "title": "Siris Craft Brewery (Voreia Beer) - Fresh Tank-Pull Draft Flight & Spent-Grain Snacks",
    "durationMinutes": 45,
    "pricePerPerson": 14,
    "badge": "Fresh Draft",
    "description": "Taste 4 unpasteurized, unfiltered craft beers pulled fresh from the conditioning tanks at Siris Craft Brewery (Voreia Beer) in Serres.",
    "includes": [
      "4 x 150ml tasting pours of fresh unfiltered craft beers",
      "Warm spent-grain pretzels or seasoned barley crisps",
      "Brewmaster tasting sheet with hop and malt descriptions"
    ],
    "producerId": "siris-craft-brewery",
    "producerName": "Siris Craft Brewery (Voreia Beer)",
    "producerGreekName": "Μικροζυθοποιία Σερρών (Voreia)",
    "category": "brewery",
    "destination": "northern_greece",
    "location": "Serres, Serres (Macedonia)"
  },
  {
    "id": "exp_siris-craft-brewery_2",
    "title": "Siris Craft Brewery (Voreia Beer) - Brewhouse Tour & Artisan Beer-Food Pairing",
    "durationMinutes": 75,
    "pricePerPerson": 28,
    "badge": "Brewery Tour",
    "description": "Step into the brewhouse with the craft brewing team, inspect raw Greek malts and wild hops, and enjoy a curated beer and tapas flight.",
    "includes": [
      "Guided walkthrough of the brewing deck, fermentation vessels and bottling line",
      "5 craft beers including limited-edition seasonal brews",
      "Smoked local sausage bites, aged graviera & pickled village vegetables"
    ],
    "producerId": "siris-craft-brewery",
    "producerName": "Siris Craft Brewery (Voreia Beer)",
    "producerGreekName": "Μικροζυθοποιία Σερρών (Voreia)",
    "category": "brewery",
    "destination": "northern_greece",
    "location": "Serres, Serres (Macedonia)"
  },
  {
    "id": "exp_propator-sknipa-brewery_1",
    "title": "Propator Microbrewery (Sknipa Beer) - Fresh Tank-Pull Draft Flight & Spent-Grain Snacks",
    "durationMinutes": 45,
    "pricePerPerson": 14,
    "badge": "Fresh Draft",
    "description": "Taste 4 unpasteurized, unfiltered craft beers pulled fresh from the conditioning tanks at Propator Microbrewery (Sknipa Beer) in Thessaloniki.",
    "includes": [
      "4 x 150ml tasting pours of fresh unfiltered craft beers",
      "Warm spent-grain pretzels or seasoned barley crisps",
      "Brewmaster tasting sheet with hop and malt descriptions"
    ],
    "producerId": "propator-sknipa-brewery",
    "producerName": "Propator Microbrewery (Sknipa Beer)",
    "producerGreekName": "Πρότυπη Μικροζυθοποιία (Μπίρα Σκνίπα)",
    "category": "brewery",
    "destination": "northern_greece",
    "location": "Thessaloniki, Nea Raidestos (Thessaloniki)"
  },
  {
    "id": "exp_propator-sknipa-brewery_2",
    "title": "Propator Microbrewery (Sknipa Beer) - Brewhouse Tour & Artisan Beer-Food Pairing",
    "durationMinutes": 75,
    "pricePerPerson": 28,
    "badge": "Brewery Tour",
    "description": "Step into the brewhouse with the craft brewing team, inspect raw Greek malts and wild hops, and enjoy a curated beer and tapas flight.",
    "includes": [
      "Guided walkthrough of the brewing deck, fermentation vessels and bottling line",
      "5 craft beers including limited-edition seasonal brews",
      "Smoked local sausage bites, aged graviera & pickled village vegetables"
    ],
    "producerId": "propator-sknipa-brewery",
    "producerName": "Propator Microbrewery (Sknipa Beer)",
    "producerGreekName": "Πρότυπη Μικροζυθοποιία (Μπίρα Σκνίπα)",
    "category": "brewery",
    "destination": "northern_greece",
    "location": "Thessaloniki, Nea Raidestos (Thessaloniki)"
  }
];
