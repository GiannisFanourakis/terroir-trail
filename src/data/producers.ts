import { Producer } from '../types/terroir';

/**
 * Authoritative bundled offline/fallback catalogue for Crete.
 * Synchronized directly from live Supabase (28 audited Crete records).
 * All synthetic ratings, reviews, pricing, access defaults, and non-existent
 * tasting packages have been removed. Unknown fields are preserved as undefined.
 */
export const CRETAN_PRODUCERS: Producer[] = [
  // ==========================================
  // --- CHANIA (8 AUDITED RECORDS) ---
  // ==========================================
  {
      "id": "anoskeli-estate",
      "name": "Anoskeli Winery & Olive Mill",
      "greekName": "Οινοποιείο & Ελαιοτριβείο Ανώσκελη",
      "category": "winery",
      "destination": "crete",
      "country": "Greece",
      "countryCode": "GR",
      "region": "Chania",
      "village": "Anoskeli (Platanias)",
      "locality": "Anoskeli (Platanias)",
      "coordinates": [
          35.4598333333,
          23.7757861111
      ],
      "coverImage": "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1000&q=80",
      "gallery": [
          "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1000&q=80"
      ],
      "tagLine": "Mamidakis family roots, olive oil and wine in one village estate",
      "description": "In the small Chania village that gave the brand its name, Anoskeli brings together olive groves, vineyards, a working olive mill, bottling facilities and a boutique winery. Olive oil, wine and tsikoudia all grow out of the same family connection to this corner of western Crete.",
      "story": "The Mamidakis family traces its roots in Anoskeli to Alexandros and Irene Mamidakis. During difficult wartime years Irene cared for seven children and cultivated the family land; decades later the family invested back in the village, founding Anoskeli S.A. in 1983 and opening the modern olive mill in 1985.",
      "indigenousVarieties": [],
      "tastingHighlights": [
          "Wine and olive oil from one family estate"
      ],
      "openingHours": "Current 2026 visitor hours not yet confirmed; contact Anoskeli before travelling.",
      "ethos": [],
      "additionalCategories": [
          "olive_mill"
      ],
      "visitorFeatures": [
          "tasting"
      ],
      "productSections": [
          {
              "category": "winery",
              "specialties": [
                  "Estate Wines",
                  "Tsikoudia Anoskeli"
              ],
              "varieties": [
                  "Vidiano",
                  "Vilana",
                  "Assyrtiko",
                  "Syrah",
                  "Cabernet Sauvignon",
                  "Grenache"
              ],
              "highlights": [
                  "Ano Playia White & Red",
                  "Anoskeli Red",
                  "Anoskeli Tsikoudia"
              ]
          },
          {
              "category": "olive_mill",
              "specialties": [
                  "PDO Kolymvari Extra Virgin Olive Oil",
                  "Bio Anoskeli Organic EVOO"
              ],
              "varieties": [
                  "Koroneiki"
              ],
              "highlights": [
                  "Single-estate cold extracted olive oil",
                  "Certified PDO Kolymvari Chania"
              ]
          }
      ],
      "phone": "+30 28240 83126",
      "website": "https://anoskeli.gr",
      "googleMapsUrl": "https://maps.google.com/?q=35.459833,23.775786",
      "googlePlaceId": "ChIJQwdI8aeMnBQRZAI_Lg6tC08",
      "roadAccess": "narrow_paved",
      "roadAccessStatus": "verified",
      "roadAccessSourceUrl": "https://anoskeli.gr",
      "roadAccessNotes": "Manual operator road review: narrow paved rural/village approach. Road classification only; does not establish rental-car suitability or guarantee current conditions.",
      "locationStatus": "verified_location",
      "locationSourceUrl": "https://anoskeli.gr/en/",
      "locationNotes": "Estate location in Anoskeli is verified by the producer; reservation number stored for visitor contact.",
      "publicPointType": "estate",
      "visitStatus": "seasonal_public",
      "visitSourceUrl": "https://anoskeli.gr/experiences",
      "visitNotes": "The current first-party visitor material confirms guided tasting experiences, strongly recommends advance booking, and welcomes drop-ins subject to availability. A current French-language version of the visitor guidance explicitly states that guided tours are offered in English or Greek. The English page still carries a 2025 season label, so TerroirTrail does not reuse that stale season/timetable as current 2026 visitor hours."
  },
  {
      "id": "baladinos-dairy-varipetro",
      "name": "Baladinos & Sons",
      "greekName": "Μπαλαντίνος",
      "category": "cheese_dairy",
      "destination": "crete",
      "country": "Greece",
      "countryCode": "GR",
      "region": "Chania",
      "village": "Chania",
      "locality": "Chania",
      "coordinates": [
          35.4742449,
          23.9575491
      ],
      "coverImage": "",
      "gallery": [],
      "tagLine": "Four generations of Chania cheesemaking, from Therissos pastoral roots to Varipetro.",
      "description": "Baladinos & Sons traces its dairy tradition to Therissos and 1928. The fourth-generation family business now produces a wide range of Cretan cheeses and dairy products at its modern Varipetro factory, using milk associated with free-range animals in Crete; its long-standing Skalidi Street shop is a separate public point.",
      "story": "The Baladinos family links its cheesemaking story to the mountain village of Therissos, where stock raising and dairy production shaped the family trade. Since 1928 the business has grown through four generations, adding a central Chania shop in the 1950s and later a modern production plant in Varipetro. The company presents its mission as preserving Cretan food culture while combining traditional cheesemaking with modern production and quality controls.",
      "indigenousVarieties": [
          "Kefalotyri",
          "Graviera PDO",
          "Pichtogalo Chanion PDO",
          "dry anthotyros",
          "Cretan tyromalama",
          "goat and sheep white cheese",
          "Cretan butter oil",
          "sheep and goat Cretan butter",
          "goat yogurt",
          "cow yogurt",
          "sheep yogurt"
      ],
      "tastingHighlights": [
          "The Baladinos family traces its cheesemaking tradition to Therissos in 1928 and is now in its fourth generation.",
          "Production is associated with the modern Varipetro facilities, while the long-standing central Chania shop is a separate public point.",
          "The dairy makes Cretan Graviera PDO, Pichtogalo Chanion PDO, Kefalotyri, dry Anthotyros, Tyromalama, yogurts and traditional Cretan butter products."
      ],
      "openingHours": "",
      "ethos": [],
      "additionalCategories": [],
      "visitorFeatures": [],
      "productSections": [
          {
              "category": "cheese_dairy",
              "specialties": [
                  "Traditional Cretan Sheep & Goat Cheeses",
                  "PDO Graviera Kritis",
                  "PDO Pichtogalo Chanion",
                  "Authentic Staka & Stakovoutyro"
              ],
              "varieties": [
                  "Graviera Kritis PDO (cave-aged)",
                  "Pichtogalo Chanion PDO",
                  "Anthotyros (Fresh & Dry)",
                  "Kefalotyri",
                  "Staka cream",
                  "Tyromalama"
              ],
              "highlights": [
                  "Graviera Kritis PDO Cave-Aged",
                  "Pichtogalo Chanion PDO",
                  "Authentic Cretan Staka",
                  "Dry Anthotyros Grated"
              ]
          }
      ],
      "phone": "+30 28210 33030 / +30 28210 32222",
      "website": "https://www.balantinos.gr/en/",
      "googleMapsUrl": "https://www.google.com/maps/place/Balantinos+Dairy+Industry+-+%CE%A4%CF%85%CF%81%CE%BF%CE%BA%CE%BF%CE%BC%CE%B9%CE%BA%CE%B7+%CE%9C%CE%BF%CE%BD%CE%B1%CE%B4%CE%B1+%CE%9C%CF%80%CE%B1%CE%BB%CE%B1%CE%BD%CF%84%CE%AF%CE%BD%CE%BF%CF%82/@35.4742449,23.9549742,987m/data=!3m2!1e3!4b1!4m6!3m5!1s0x149c87463b23eff3:0x9cd9a9b92ffc94e9!8m2!3d35.4742449!4d23.9575491!16s%2Fg%2F11qmm9mf4j",
      "googlePlaceId": "ChIJ8-8jO0aHnBQR6ZT8L7mp2Zw",
      "roadAccess": "paved",
      "roadAccessStatus": "verified",
      "roadAccessSourceUrl": "https://www.google.com/maps/search/?api=1&query=35.5133795%2C24.0162928&query_place_id=ChIJq117gb19nBQR0We4DTt-XNc",
      "roadAccessNotes": "Manual operator road review: normal paved approach. Road classification only; does not establish rental-car suitability or guarantee current conditions.",
      "locationStatus": "verified_location",
      "locationSourceUrl": "https://www.balantinos.gr/en/contact/",
      "locationNotes": "Verified production plant at Varypetro Kydonias, Chania. Updated to the primary production facility via direct Google Maps place listing.",
      "publicPointType": "production_site",
      "visitStatus": "not_publicly_confirmed",
      "visitSourceUrl": "https://www.balantinos.gr/en/",
      "visitNotes": "Industrial production facility in Varypetro. Public access/tours not publicly confirmed without prior arrangement; retail point operates separately in Chania center."
  },
  {
      "id": "biolea-estate",
      "name": "Biolea Astrikas Estate",
      "greekName": "Βιολέα - Βιολογικό Ελαιοτριβείο",
      "category": "olive_mill",
      "destination": "crete",
      "country": "Greece",
      "countryCode": "GR",
      "region": "Chania",
      "village": "Astrikas (Kolymbari)",
      "locality": "Astrikas (Kolymbari)",
      "coordinates": [
          35.463807,
          23.743427
      ],
      "coverImage": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1000&q=80",
      "gallery": [
          "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1000&q=80"
      ],
      "tagLine": "Fifth- and sixth-generation olive growers keeping stone milling alive in Astrikas",
      "description": "Biolea is a family-owned single-estate olive-oil producer in Astrikas, where organic olives are stone-milled and cold-pressed using a modernized version of the traditional process. Its oils are grown, produced and bottled by the estate.",
      "story": "Founder Yiorgos Dimitriadis spent decades researching how traditional olive-oil production could work in a modern estate. Today the fifth and sixth generations remain hands-on: Chloe Dimitriadis directs the harvest and mill, while she and her husband Michalis Papadakis continue the family business around olive oil, food and the Astrikas estate.",
      "indigenousVarieties": [],
      "tastingHighlights": [],
      "openingHours": "Guided tour: Mon-Sun 10:00-17:00 by appointment; classic tours Apr-Oct. Restaurant/Kafeneion: Tue-Sun 11:00-15:30.",
      "ethos": [],
      "additionalCategories": [],
      "visitorFeatures": [],
      "productSections": [
          {
              "category": "olive_mill",
              "specialties": [
                  "Traditional Millstone & Hydraulic Press Cold Extraction",
                  "Artisanal Organic Extra Virgin Olive Oil",
                  "Cold-Fused Citrus Olive Oils"
              ],
              "varieties": [
                  "Koroneiki",
                  "Tsunati"
              ],
              "highlights": [
                  "Biolea Organic EVOO Millstone Pressed",
                  "Biolea Lemonomichelakis (Lemon Olive Oil)",
                  "Biolea Nerantzi (Bitter Orange Olive Oil)"
              ]
          }
      ],
      "phone": "+30 28240 23281",
      "website": "https://biolea.gr",
      "googleMapsUrl": "https://maps.google.com/?q=35.463807,23.743427",
      "googlePlaceId": "ChIJ_U9uyrr0nBQRPiI3ZYRHH2M",
      "roadAccess": "paved",
      "roadAccessStatus": "verified",
      "roadAccessSourceUrl": "https://biolea.gr/contact/",
      "roadAccessNotes": "Manual operator road review: normal paved approach. Road classification only; does not establish rental-car suitability or guarantee current conditions.",
      "locationStatus": "verified_entrance",
      "locationSourceUrl": "https://biolea.gr",
      "locationNotes": "Exact GPS coordinates published by Biolea match the database pin.",
      "publicPointType": "estate",
      "visitStatus": "seasonal_public",
      "visitSourceUrl": "https://biolea.gr/book-a-tour/",
      "visitNotes": "Current first-party Biolea visitor pages state that advance reservation is required before visiting the estate because places are limited. The standard Olive Oil Guided Tour & Tasting is published as a one-hour experience. Other hospitality products have different durations, so the 60-minute typical value refers to the standard guided mill tour. Parking and visitor languages remain unconfirmed."
  },
  {
      "id": "cretan-brewery-charma",
      "name": "Cretan Brewery (Charma Beer)",
      "greekName": "Κρητική Ζυθοποιία (Μπίρα Χάρμα)",
      "category": "brewery",
      "destination": "crete",
      "country": "Greece",
      "countryCode": "GR",
      "region": "Chania",
      "village": "Zounaki (Platanias)",
      "locality": "Zounaki (Platanias)",
      "coordinates": [
          35.48687,
          23.82586
      ],
      "coverImage": "https://images.unsplash.com/photo-1575037614876-c38a4d44f5b8?auto=format&fit=crop&w=1000&q=80",
      "gallery": [
          "https://images.unsplash.com/photo-1575037614876-c38a4d44f5b8?auto=format&fit=crop&w=1000&q=80",
          "https://images.unsplash.com/photo-1538488881522-4326c36397ce?auto=format&fit=crop&w=1000&q=80"
      ],
      "tagLine": "Fresh Charma beer born from a Chania engineer's idea",
      "description": "Cretan Brewery sits among olive, avocado and orange groves in Zounaki and produces fresh Charma beer in Chania. It was the first brewery in the prefecture and grew around the idea that locally brewed, unpasteurised beer should be part of contemporary Cretan food culture.",
      "story": "Mechanical engineer Ioannis Lionakis, born and raised in Chania, founded the brewery in 2007. His starting point was simple: he felt locals and visitors were missing the kind of fresh beer he had encountered elsewhere in Europe, so he set out to make it in western Crete.",
      "indigenousVarieties": [],
      "tastingHighlights": [],
      "openingHours": "8 Apr-31 Oct: daily 11:00-20:00. Kitchen until 19:30. No brewery tours Sundays or bank holidays.",
      "ethos": [],
      "additionalCategories": [],
      "visitorFeatures": [],
      "productSections": [
          {
              "category": "brewery",
              "specialties": [
                  "Fresh Unpasteurized Craft Beer",
                  "Unfiltered Draught Beers",
                  "Brewery Taproom Gastronomy"
              ],
              "varieties": [
                  "Lager",
                  "Dunkel",
                  "Pale Ale",
                  "Cretan Ale",
                  "IPA",
                  "Seasonal Specialties"
              ],
              "highlights": [
                  "Charma Lager Fresh",
                  "Charma Dunkel",
                  "Charma Pale Ale",
                  "Charma Cretan Ale with Local Honey"
              ]
          }
      ],
      "phone": "+30 28240 31002",
      "website": "https://cretanbeer.gr",
      "googleMapsUrl": "https://maps.google.com/?q=35.486870,23.825860",
      "googlePlaceId": "ChIJQ7fRzLOLnBQRWaCt5UX2izE",
      "roadAccess": "paved",
      "roadAccessStatus": "verified",
      "roadAccessSourceUrl": "https://www.cretanbeer.gr/en/cretan-brewery/visit-us/",
      "roadAccessNotes": "Manual operator road review: normal paved approach. Official visit information also lists driving by car. Road classification does not by itself establish rental-car suitability.",
      "foodOption": "brewery_taproom",
      "locationStatus": "verified_location",
      "locationSourceUrl": "https://www.cretanbeer.gr/en/contact/",
      "locationNotes": "Current producer address verified as Zounaki, Platanias. Site coordinate retained as verified brewery location; entrance/access grading remains separate.",
      "publicPointType": "production_site",
      "visitStatus": "seasonal_public",
      "visitSourceUrl": "https://www.cretanbeer.gr/en/cretan-brewery/visit-us/",
      "visitNotes": "Current first-party visitor page confirms a public visiting season from 8 April to 31 October, daily 11:00-20:00. Guided brewery tours are offered at published times except Sundays and bank holidays, and the site provides reservation links for tours and tasting packages. General walk-in policy, parking and tour languages are not explicitly published."
  },
  {
      "id": "karavitakis-winery",
      "name": "Karavitakis Winery",
      "greekName": "Οινοποιείο Καραβιτάκη",
      "category": "winery",
      "destination": "crete",
      "country": "Greece",
      "countryCode": "GR",
      "region": "Chania",
      "village": "Pontikiana (Kolymbari)",
      "locality": "Pontikiana (Kolymbari)",
      "coordinates": [
          35.5019916667,
          23.7911722222
      ],
      "coverImage": "https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1000&q=80",
      "gallery": [
          "https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1000&q=80"
      ],
      "tagLine": "Eighty years of family winemaking in the hills of Chania",
      "description": "Karavitakis is a family winery in Pontikiana, surrounded by the hills, vineyards and olive groves of the Kolymbari area. Its wines draw on both local Cretan grapes and selected international varieties from estate and contracted vineyards.",
      "story": "The family describes an eighty-year winemaking legacy in western Crete. Rather than turning that history into a museum piece, the current generation has built a boutique winery with modern equipment and continues experimenting with different varieties and carefully selected vineyard sites.",
      "indigenousVarieties": [],
      "tastingHighlights": [],
      "openingHours": "",
      "ethos": [],
      "additionalCategories": [],
      "visitorFeatures": [],
      "productSections": [
          {
              "category": "winery",
              "specialties": [
                  "Boutique Estate Wines",
                  "Indigenous & Rare Varieties"
              ],
              "varieties": [
                  "Vidiano",
                  "Kotsifali",
                  "Romeiko",
                  "Mavrotragano",
                  "Malagouzia",
                  "Syrah",
                  "Cabernet Sauvignon"
              ],
              "highlights": [
                  "Elia Vidiano",
                  "Klima White & Red",
                  "The Little Prince",
                  "Kompsos"
              ]
          }
      ],
      "phone": "+30 28240 23381",
      "website": "https://karavitakiswines.com",
      "googleMapsUrl": "https://maps.google.com/?q=35.501992,23.791172",
      "googlePlaceId": "ChIJJ-2L8JSLnBQRwjVRodG9348",
      "roadAccess": "paved",
      "roadAccessStatus": "verified",
      "roadAccessSourceUrl": "https://karavitakiswines.com",
      "roadAccessNotes": "Manual operator road review: normal paved approach. Road classification only; does not establish rental-car suitability or guarantee current conditions.",
      "vipPerks": {
          "freeMeze": "Chania Kalamata olives & sourdough",
          "welcomePour": "Kompsos Sparkling Romaiko",
          "discountPercent": 10
      },
      "locationStatus": "verified_location",
      "locationSourceUrl": "https://www.karavitakiswines.com/",
      "locationNotes": "Pontikiana winery location and contact details are producer-verified; coordinates match Wines of Crete route data.",
      "publicPointType": "estate",
      "visitStatus": "public_visits",
      "visitSourceUrl": "https://www.karavitakiswines.com/",
      "visitNotes": "Current first-party homepage explicitly welcomes visitors and states that the winery accepts visitors with or without appointments. The separate online-booking page still contains a stale 2025 date note, so it is not used to infer current tour availability, hours or programme dates. Current daily visitor hours, visit duration, parking and tour languages are not published clearly enough to structure."
  },
  {
      "id": "lafkas-brewery",
      "name": "Lafkas Brewery",
      "greekName": "Ζυθοποιία Λάφκας",
      "category": "brewery",
      "destination": "crete",
      "country": "Greece",
      "countryCode": "GR",
      "region": "Chania",
      "village": "Pazinos",
      "locality": "Pazinos",
      "coordinates": [
          35.518276,
          24.1244784
      ],
      "coverImage": "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1000&q=80",
      "gallery": [
          "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1000&q=80"
      ],
      "tagLine": "Greek–Belgian brewing roots, handcrafted in Chania",
      "description": "Lafkas Brewery is the Chania brewery of Michalis Lafkas and Aurelie Petillion. Their beers combine Michalis's studies in winemaking and beverage technology with Aurelie's Belgian beer background in a small-scale, unfiltered and unpasteurised brewing project.",
      "story": "The story began in 2011, when Michalis was studying winemaking and beverage technology and travelled to Belgium, where he met Aurelie. Five years later they were living together in Crete and developing their own Greek–Belgian beer; in 2017 they launched their first release, a Triple Hop Pale Ale.",
      "indigenousVarieties": [],
      "tastingHighlights": [],
      "openingHours": "Open by appointment",
      "ethos": [],
      "additionalCategories": [],
      "visitorFeatures": [],
      "productSections": [
          {
              "category": "brewery",
              "specialties": [
                  "Belgian-Greek Craft Brewing",
                  "Unfiltered & Unpasteurized Beers",
                  "Bespoke Collaborations"
              ],
              "varieties": [
                  "Pale Ale",
                  "Grape Ale",
                  "White Beer",
                  "Belgian Saison"
              ],
              "highlights": [
                  "Triple Hop Pale Ale (White Mountains)",
                  "Grape Ale with Local Must",
                  "Lafkas Seasonal Belgian-Greek Blends"
              ]
          }
      ],
      "phone": "+30 6945430402",
      "website": "https://lafkasbrewery.com",
      "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Lafkas%20Brewery%2C%20Pazinos%20731%2000&query_place_id=ChIJSSvI3YiHnBQRBtbO7K4u444",
      "googlePlaceId": "ChIJSSvI3YiHnBQRBtbO7K4u444",
      "roadAccess": "paved",
      "roadAccessStatus": "verified",
      "roadAccessSourceUrl": "https://lafkasbrewery.com",
      "roadAccessNotes": "Manual operator road review: normal paved approach. Road classification only; does not establish rental-car suitability or guarantee current conditions.",
      "locationStatus": "verified_location",
      "locationSourceUrl": "https://www.google.com/maps/search/?api=1&query=Lafkas%20Brewery%2C%20Pazinos%20731%2000&query_place_id=ChIJSSvI3YiHnBQRBtbO7K4u444",
      "locationNotes": "Phase 9B correction (2026-09-14): previous TerroirTrail pin was stale/wrong by about 12.8 km. Google Places audit resolved the Lafkas Brewery business in Pazinos at 35.5182760, 24.1244784 (Place ID ChIJSSvI3YiHnBQRBtbO7K4u444), and the producer-owned Lafkas Brewery website independently confirms the current address as Pazinos 73100 Chania. Location verified at business-property level; entrance-level precision has not been separately established.",
      "publicPointType": "production_site",
      "visitStatus": "appointment_only",
      "visitSourceUrl": "https://lafkasbrewery.com/beer-tasting-brewery-tour/",
      "visitNotes": "Current first-party pages say the Pazinos taproom is open by appointment and that the brewery tour/tasting is available after booking an appointment. The brewery currently advertises a simple tasting of four beers. No reliable visit duration, parking policy, or visitor-language information is published."
  },
  {
      "id": "manousakis-winery",
      "name": "Manousakis Winery",
      "greekName": "Οινοποιείο Μανουσάκη",
      "category": "winery",
      "destination": "crete",
      "country": "Greece",
      "countryCode": "GR",
      "region": "Chania",
      "village": "Vatolakkos",
      "locality": "Vatolakkos",
      "coordinates": [
          35.4490416667,
          23.8878194444
      ],
      "coverImage": "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1000&q=80",
      "gallery": [
          "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1000&q=80"
      ],
      "tagLine": "A homecoming to Vatolakkos, bottled under the name Nostos",
      "description": "Manousakis Winery is a family estate in Vatolakkos, in the foothills of the White Mountains, producing wines under the Nostos name. The winery's identity is tied as much to return and family memory as to vineyards and cellar work.",
      "story": "Ted Manousakis was born in Vatolakkos in 1943 and left Crete for the United States at the age of eleven. His desire to reconnect with the village eventually became the winery: the first vineyards were planted in 1993, and the wines took the name Nostos, the Greek idea of yearning to return home. His daughter Alexandra made a similar return in 2007, leaving New York for Crete and helping grow the family winery.",
      "indigenousVarieties": [],
      "tastingHighlights": [],
      "openingHours": "Through 10 Oct 2026: Mon-Sat 12:00-20:00; Sun closed. 12 Oct-14 Nov 2026: 12:00-18:00; Sun closed. 16 Nov 2026-Apr 2027: tours & tastings by appointment only.",
      "ethos": [],
      "additionalCategories": [],
      "visitorFeatures": [],
      "productSections": [
          {
              "category": "winery",
              "specialties": [
                  "Rhône Varieties in Crete",
                  "Organic Nostos Wines",
                  "Tsikoudia & Olive Oil"
              ],
              "varieties": [
                  "Syrah",
                  "Grenache",
                  "Mourvèdre",
                  "Roussanne",
                  "Vidiano",
                  "Assyrtiko",
                  "Romeiko"
              ],
              "highlights": [
                  "Nostos Syrah",
                  "Nostos Roussanne",
                  "Nostos Blend",
                  "2 Mazi",
                  "Terroir Vatolakkos"
              ]
          }
      ],
      "phone": "+30 28210 78787",
      "website": "https://manousakiswinery.com",
      "googleMapsUrl": "https://maps.google.com/?q=35.449042,23.887819",
      "googlePlaceId": "ChIJuaGesySJnBQRgOXzw30bNBA",
      "roadAccess": "narrow_paved",
      "roadAccessStatus": "verified",
      "roadAccessSourceUrl": "https://www.manousakiswinery.com/contact",
      "roadAccessNotes": "Manual operator road review: narrow paved rural/village approach; final junction includes a paved/concrete-surfaced section. Official visitor information lists arrival by car, taxi, bus and shuttle. Rental-car suitability remains separate.",
      "foodOption": "full_taverna",
      "locationStatus": "verified_location",
      "locationSourceUrl": "https://www.manousakiswinery.com/contact",
      "locationNotes": "Vatolakkos winery location and coordinates are verified through producer and Wines of Crete sources.",
      "publicPointType": "estate",
      "visitStatus": "seasonal_public",
      "visitSourceUrl": "https://www.manousakiswinery.com/visit",
      "visitNotes": "Current first-party visit page requires bookings for tours, tastings and/or dining. Complimentary winery tours are offered at published daily slots depending on season. The tasting terrace and taverna operate on published seasonal hours; Sundays are closed. Parking, typical visit duration and tour languages are not published on the current visit/contact pages."
  },
  {
      "id": "stathakis-honey-park",
      "name": "StathakisFamily Cretan Honey Experience",
      "greekName": "Μελισσοκομία Σταθάκη - Πάρκο Μέλισσας",
      "category": "apiary",
      "destination": "crete",
      "country": "Greece",
      "countryCode": "GR",
      "region": "Chania",
      "village": "Kaloudiana (Kissamos)",
      "locality": "Kaloudiana (Kissamos)",
      "coordinates": [
          35.480012,
          23.689595
      ],
      "coverImage": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1000&q=80",
      "gallery": [
          "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1000&q=80"
      ],
      "tagLine": "More than sixty years of family beekeeping from Kissamos",
      "description": "StathakisFamily is a Kissamos honey producer whose work spans beekeeping, honey packing and a seasonal visitor site in Kaloudiana. The family produces several Cretan honey types alongside other bee products.",
      "story": "The family business began in 1963 when Stelios Stathakis acquired his first hives. More than sixty years later, the next generations have expanded the operation with a modern packing facility while keeping beekeeping—not tourism—as the foundation of the family business.",
      "indigenousVarieties": [],
      "tastingHighlights": [],
      "openingHours": "",
      "ethos": [],
      "additionalCategories": [],
      "visitorFeatures": [],
      "productSections": [
          {
              "category": "apiary",
              "specialties": [
                  "Cretan Honey Experience & Bee Education",
                  "Artisanal Single-Origin Honeys",
                  "Honey Treats & Beeswax Cosmetics"
              ],
              "varieties": [
                  "Thyme Honey",
                  "Pine Honey",
                  "Wild Herbs & Heather Honey",
                  "Citrus Honey"
              ],
              "highlights": [
                  "Stathakis Family Wild Thyme Honey",
                  "Pine & Mountain Herbs Honey",
                  "Honeycomb and Beeswax Ointments"
              ]
          }
      ],
      "phone": "+30 6977906195",
      "website": "https://stathakisfamily.com",
      "googleMapsUrl": "https://maps.google.com/?q=35.480012,23.689595",
      "googlePlaceId": "ChIJ-bttLbr1nBQRqwEUhZIfplM",
      "roadAccess": "paved",
      "roadAccessStatus": "verified",
      "roadAccessSourceUrl": "https://stathakisfamily.com",
      "roadAccessNotes": "Manual operator road review: normal paved approach. Road classification only; does not establish rental-car suitability or guarantee current conditions.",
      "vipPerks": {
          "freeMeze": "Fresh sheep yogurt with pollen granules",
          "welcomePour": "Wild Malotira herbal tea with pure comb honey",
          "discountPercent": 10
      },
      "locationStatus": "verified_entrance",
      "locationSourceUrl": "https://stathakisfamily.com",
      "locationNotes": "Exact visitor-site coordinates verified from the producer-controlled map link.",
      "publicPointType": "visitor_center",
      "visitStatus": "seasonal_public",
      "visitSourceUrl": "https://stathakisfamily.com",
      "visitNotes": "Current first-party site actively promotes and books the Cretan Honey Experience in Kaloudiana, including guided honey-production tours, tastings, a honey shop and coffee place. Four current bookable experiences are published with durations of 45 or 90 minutes. The site does not publish a current seasonal opening period, daily visitor timetable, general walk-in policy, parking policy, or tour languages, so those remain unconfirmed."
  },
  // ==========================================
  // --- HERAKLION (15 AUDITED RECORDS) ---
  // ==========================================
  {
      "id": "aerakis-dairy-anogeia",
      "name": "Aerakis Cheese Products",
      "greekName": "Παραδοσιακό Τυροκομείο Αεράκη",
      "category": "cheese_dairy",
      "destination": "crete",
      "country": "Greece",
      "countryCode": "GR",
      "region": "Heraklion",
      "village": "Sokaras (Gortyna)",
      "locality": "Sokaras (Gortyna)",
      "coordinates": [
          35.065803,
          25.106932
      ],
      "coverImage": "https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=1000&q=80",
      "gallery": [
          "https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=1000&q=80"
      ],
      "tagLine": "Family cheesemaking rooted in Sokaras and the Asterousia landscape",
      "description": "A family dairy in Sokaras, Gortyna, making traditional Cretan cheeses from sheep and goat milk collected around the Asterousia area. The business pairs local raw material and inherited cheesemaking knowledge with modern traceability and food-safety systems.",
      "story": "Aerakis is a family-owned dairy in Sokaras with a long-standing tradition in Cretan cheesemaking. Its production uses sheep and goat milk collected from local farmers in the Asterousia region, combining traditional cheesemaking methods with modern food-safety, traceability and quality-control systems.",
      "indigenousVarieties": [],
      "tastingHighlights": [],
      "openingHours": "",
      "ethos": [],
      "additionalCategories": [],
      "visitorFeatures": [],
      "productSections": [
          {
              "category": "cheese_dairy",
              "specialties": [
                  "Traditional Cretan Sheep & Goat Cheeses",
                  "Graviera Kritis PDO",
                  "Anthotyros & Myzithra"
              ],
              "varieties": [
                  "Graviera Kritis PDO",
                  "Kefalotyri",
                  "Anthotyros Xeros",
                  "Fresh Myzithra"
              ],
              "highlights": [
                  "Aerakis Graviera Kritis PDO",
                  "Traditional Sheep Kefalotyri",
                  "Aged Anthotyros"
              ]
          }
      ],
      "phone": "+30 28930 31990",
      "website": "https://cretancheeseaerakis.com",
      "googleMapsUrl": "https://www.google.com/maps?ll=35.065803,25.106932&z=15&t=m&hl=en-US&gl=US&mapclient=embed&cid=8450329635840177008",
      "googlePlaceId": "ChIJK7sRuXvvmhQRcLM1MwiaRXU",
      "roadAccess": "narrow_paved",
      "roadAccessStatus": "verified",
      "roadAccessSourceUrl": "https://cretancheeseaerakis.com/",
      "roadAccessNotes": "Manual operator road review: narrow paved approach. Road classification only; does not establish rental-car suitability or guarantee current conditions.",
      "vipPerks": {
          "freeMeze": "Slice of 2-year cave-aged Graviera",
          "welcomePour": "Fresh alpine sheep whey warm drink",
          "discountPercent": 10
      },
      "locationStatus": "verified_location",
      "locationSourceUrl": "https://www.google.com/maps?ll=35.065803,25.106932&z=15&t=m&hl=en-US&gl=US&mapclient=embed&cid=8450329635840177008",
      "locationNotes": "Current Aerakis Cheese Products location supplied from the Google Maps business listing. Treat as verified location; entrance-level precision has not been separately established.",
      "publicPointType": "production_site",
      "visitStatus": "not_publicly_confirmed",
      "visitSourceUrl": "https://cretancheeseaerakis.com",
      "visitNotes": "Current first-party site confirms the working dairy in Sokaras and presents the business as a production, quality-assurance and export operation. It does not publish a public visitor programme, tasting/tour procedure, shop opening hours, booking rule, or walk-in policy. Do not present the dairy as a public attraction; contact the producer directly if considering a visit."
  },
  {
      "id": "domaine-paterianakis",
      "name": "Domaine Paterianakis",
      "greekName": "Κτήμα Πατεριανάκη",
      "category": "winery",
      "destination": "crete",
      "country": "Greece",
      "countryCode": "GR",
      "region": "Heraklion",
      "village": "Melesses (Peza)",
      "locality": "Melesses (Peza)",
      "coordinates": [
          35.1808944444,
          25.1963472222
      ],
      "coverImage": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=80",
      "gallery": [
          "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=80"
      ],
      "tagLine": "Organic Peza wines shaped by one family across generations",
      "description": "Domaine Paterianakis is a family estate in Melesses, inside the Peza wine region, with vineyards cultivated organically and biodynamically around a gravity-designed winery. Cretan varieties remain at the centre of its identity.",
      "story": "The family vineyard predates the modern estate: Aristides Nikoloudakis established vines here, and Manolis Paterianakis moved toward organic cultivation in 1980. Giorgos Paterianakis created the present estate in 1988 and produced its first organic wine in 1997; today his daughters Emmanuela and Niki continue the work in wine production and sales.",
      "indigenousVarieties": [],
      "tastingHighlights": [],
      "openingHours": "Apr-mid Nov: Mon-Fri 10:30-17:30; Sat-Sun 10:30-16:00. Mid-Nov-Mar: open by appointment.",
      "ethos": [],
      "additionalCategories": [],
      "visitorFeatures": [],
      "productSections": [
          {
              "category": "winery",
              "specialties": [
                  "Organic Wines",
                  "Natural Wines",
                  "Bio Tsikoudia"
              ],
              "varieties": [
                  "Vidiano",
                  "Thrapsathiri",
                  "Kotsifali",
                  "Mandilaria",
                  "Assyrtiko"
              ],
              "highlights": [
                  "Melissinos Bio White & Red",
                  "3.14 Natural Vidiano Orange",
                  "Domaine Paterianakis PDO Peza"
              ]
          }
      ],
      "phone": "+30 2810 226674",
      "website": "https://paterianakis.gr",
      "googleMapsUrl": "https://maps.google.com/?q=35.180894,25.196347",
      "googlePlaceId": "ChIJdX0LdST0mhQReNnGJiIVQKk",
      "roadAccess": "paved",
      "roadAccessStatus": "verified",
      "roadAccessSourceUrl": "https://paterianakis.gr",
      "roadAccessNotes": "Manual operator road review: normal paved approach. Road classification only; does not establish rental-car suitability or guarantee current conditions.",
      "locationStatus": "verified_location",
      "locationSourceUrl": "https://paterianakis.gr/en/",
      "locationNotes": "Winery coordinates match Wines of Crete route data and the current producer location in Melesses.",
      "publicPointType": "estate",
      "visitStatus": "seasonal_public",
      "visitSourceUrl": "https://paterianakis.gr/en/events/",
      "visitNotes": "Current first-party hospitality page welcomes visitors from April to mid-November on published hours and switches to appointment-only access from mid-November through March. Guided tours of the estate, vineyards, production, bottling and aging areas are published as lasting 30-45 minutes. The page also states that the visitor experience is wheelchair accessible. It does not explicitly state that reservations are mandatory during the main season or publish parking/tour-language details."
  },
  {
      "id": "douloufakis-winery",
      "name": "Douloufakis Winery",
      "greekName": "Οινοποιείο Δουλουφάκη",
      "category": "winery",
      "destination": "crete",
      "country": "Greece",
      "countryCode": "GR",
      "region": "Heraklion",
      "village": "Dafnes",
      "locality": "Dafnes",
      "coordinates": [
          35.215109,
          25.049664
      ],
      "coverImage": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=80",
      "gallery": [
          "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=80",
          "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1000&q=80"
      ],
      "tagLine": "Three generations in Dafnes, with Vidiano at the centre",
      "description": "Douloufakis Winery is rooted in the village of Dafnes and works with both indigenous Cretan grapes and selected international varieties. Its modern cellar grew from a family wine business that began well before bottled estate wine became common on Crete.",
      "story": "Dimitris Douloufakis began professional winemaking in 1930, his son George took over in 1960, and grandson Nikos returned from oenology studies in Alba, Italy, to lead the winery in 1993. In 2000 Nikos turned his attention to the then little-known Vidiano grape and began planting and vinifying it seriously.",
      "indigenousVarieties": [],
      "tastingHighlights": [],
      "openingHours": "Wine cellar: Mon-Fri 10:00-15:30. Tours/tastings: Mon-Fri 10:00, 12:00, 14:00 all year; Sat 12:00 and 14:00 in Jun-Sep. Advance booking required.",
      "ethos": [],
      "additionalCategories": [],
      "visitorFeatures": [],
      "productSections": [
          {
              "category": "winery",
              "specialties": [
                  "Single-Variety Cretan Wines",
                  "Amphora Fermentations",
                  "Sparkling Vidiano"
              ],
              "varieties": [
                  "Vidiano",
                  "Liatiko",
                  "Kotsifali",
                  "Malvasia di Candia Aromatica",
                  "Cabernet Sauvignon"
              ],
              "highlights": [
                  "Dafnios Vidiano White",
                  "Dafnios Liatiko Red",
                  "Aspros Lagos Barrel-Aged Vidiano",
                  "Amphora Vidiano",
                  "Spark Brut"
              ]
          }
      ],
      "phone": "+30 2810 792017",
      "website": "https://douloufakis.wine",
      "googleMapsUrl": "https://maps.google.com/?q=35.215109,25.049664",
      "googlePlaceId": "ChIJFaEXELf5mhQRNPosWGmK770",
      "roadAccess": "narrow_paved",
      "roadAccessStatus": "verified",
      "roadAccessSourceUrl": "https://douloufakis.wine/en/getting-here/",
      "roadAccessNotes": "Manual operator road review: narrow paved village approach. Official directions confirm access by car and winery parking. Rental-car suitability remains a separate field/assessment.",
      "locationStatus": "verified_location",
      "locationSourceUrl": "https://douloufakis.wine/en/contact-us/",
      "locationNotes": "Winery coordinates and Dafnes location are verified through producer and Wines of Crete sources.",
      "publicPointType": "estate",
      "visitStatus": "appointment_only",
      "visitSourceUrl": "https://douloufakis.wine/en/opening-hours/",
      "visitNotes": "Current first-party pages require advance booking for wine and olive-oil tasting experiences. The winery publishes weekday and seasonal Saturday tasting slots and explicitly provides on-site parking. The current site conflicts on the standard YAMAS duration (80 vs about 90 minutes), so duration remains unset pending clarification. Experience pages explicitly list Greek and English, while the general visitor-information page lists Greek, English, German and French as languages spoken; visitor_languages remains unset until TerroirTrail defines whether this field means experience language or on-site spoken language."
  },
  {
      "id": "gavalas-crete-winery",
      "name": "Fragospito Winery (Domaine Gavalas)",
      "greekName": "Οινοποιείο Φραγκόσπιτο - Κτήμα Γαβαλά",
      "category": "winery",
      "destination": "crete",
      "country": "Greece",
      "countryCode": "GR",
      "region": "Heraklion",
      "village": "Vorias (Monofatsi)",
      "locality": "Vorias (Monofatsi)",
      "coordinates": [
          35.09995,
          25.1172527778
      ],
      "coverImage": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=80",
      "gallery": [
          "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=80"
      ],
      "tagLine": "Organic vineyards in Vorias with a story reaching back to 1906",
      "description": "Fragospito, the Gavalas family winery of Vorias Monofatsi, grows Cretan and international varieties in organically cultivated vineyards. The current winery stands inside the vineyards and handles the process from grapes through bottling.",
      "story": "The family story starts in 1906, when Emmanuel Gavalas planted vineyards and used an old dressed-stone grape treading tank at Agios Thomas before settling in Vorias. Later generations continued the vineyards; they entered organic cultivation in 2001 and the family built the modern winery among them in 2004.",
      "indigenousVarieties": [],
      "tastingHighlights": [],
      "openingHours": "Contact winery before visiting",
      "ethos": [],
      "additionalCategories": [],
      "visitorFeatures": [],
      "productSections": [
          {
              "category": "winery",
              "specialties": [
                  "Organic Wines",
                  "Vegan Certified Wines"
              ],
              "varieties": [
                  "Vilana",
                  "Vidiano",
                  "Assyrtiko",
                  "Malvasia",
                  "Kotsifali",
                  "Mandilaria",
                  "Muscat of Spina"
              ],
              "highlights": [
                  "Fragospito White & Red",
                  "Monopati",
                  "Vorinos"
              ]
          }
      ],
      "phone": "+30 28940 51060",
      "website": "https://www.fragospitowinery.com/en/",
      "googleMapsUrl": "https://maps.google.com/?q=35.099950,25.117253",
      "googlePlaceId": "ChIJgzInNBjwmhQRutqQL7tYua4",
      "roadAccess": "narrow_paved",
      "roadAccessStatus": "verified",
      "roadAccessSourceUrl": "https://www.fragospitowinery.com/en/",
      "roadAccessNotes": "Manual operator road review: narrow paved approach. Road classification only; does not establish rental-car suitability or guarantee current conditions.",
      "locationStatus": "verified_location",
      "locationSourceUrl": "https://www.fragospitowinery.com/en/",
      "locationNotes": "Crete winery identity and Vorias location verified. The former gavalaswines.gr link belonged to the unrelated Santorini Gavalas winery and has been replaced.",
      "publicPointType": "estate",
      "visitStatus": "appointment_only",
      "visitSourceUrl": "https://www.fragospitowinery.com/visit/",
      "visitNotes": "Current first-party visit page advertises a guided winery tour covering winemaking, bottling and cellar areas plus a tasting of selected labels. The winery does not publish a current visitor timetable, explicit booking requirement, or walk-in policy on that page. Contact the winery before travelling."
  },
  {
      "id": "kasta-brewery",
      "name": "KASTA Microbrews",
      "greekName": "Μικροζυθοποιία Κάστα",
      "category": "brewery",
      "destination": "crete",
      "country": "Greece",
      "countryCode": "GR",
      "region": "Heraklion",
      "village": "Heraklion City Center",
      "locality": "Heraklion City Center",
      "coordinates": [
          35.338429,
          25.131678
      ],
      "coverImage": "https://images.unsplash.com/photo-1538488881522-4326c36397ce?auto=format&fit=crop&w=1000&q=80",
      "gallery": [
          "https://images.unsplash.com/photo-1538488881522-4326c36397ce?auto=format&fit=crop&w=1000&q=80"
      ],
      "tagLine": "A biologist, a pharmacist and a family brewing lab",
      "description": "KASTA Microbrews is a small family brewery in central Heraklion producing fresh, unfiltered and unpasteurised beer in small batches. Its compact brewing lab is intentionally close to the city rather than hidden in an industrial estate.",
      "story": "Biologist and brewer Kostas Antonakakis founded KASTA with his wife Anna Tzani, a pharmacist, opening the Heraklion brewing lab in late 2018. Even the name is personal: KASTA is an acronym built from the initials of members of their family.",
      "indigenousVarieties": [],
      "tastingHighlights": [],
      "openingHours": "Tap Room closed until further notice; Show Room hours not currently published. Beer tasting sessions are offered by booking.",
      "ethos": [],
      "additionalCategories": [],
      "visitorFeatures": [],
      "productSections": [
          {
              "category": "brewery",
              "specialties": [
                  "Small-Batch Microbrews",
                  "Craft Beers in Heraklion",
                  "Brewery Tasting Room"
              ],
              "varieties": [
                  "Oatmeal Stout",
                  "Red Ale",
                  "American IPA",
                  "Session Ale"
              ],
              "highlights": [
                  "Kasta Oatmeal Stout",
                  "Kasta Red Ale",
                  "Kasta IPA",
                  "Kasta Immortal"
              ]
          }
      ],
      "phone": "+30 2811 813479",
      "website": "https://kastabeer.com",
      "googleMapsUrl": "https://maps.google.com/?q=35.338429,25.131678",
      "googlePlaceId": "ChIJ94-gKsBbmhQRN5SD4LmOscM",
      "roadAccess": "narrow_paved",
      "roadAccessStatus": "verified",
      "roadAccessSourceUrl": "https://kastabeer.com",
      "roadAccessNotes": "Manual operator road review: adjacent road is narrow paved; the final approximately 10 m to the showroom are through a pedestrian alley, so vehicles should not be routed to the exact entrance. Nearby parking has not been verified.",
      "locationStatus": "verified_location",
      "locationSourceUrl": "https://kastabeer.com",
      "locationNotes": "Current brewery address verified as Zampeliou 6, Heraklion.",
      "publicPointType": "producer_shop",
      "visitStatus": "appointment_only",
      "visitSourceUrl": "https://kastabeer.com/beer-tasting/",
      "visitNotes": "Current first-party pages state that the Tap Room is closed until further notice and that Show Room visiting hours are to be announced. A separate current Beer Tasting page and booking/workshop page still promote an interactive tasting session. Treat visitor access as appointment-based for the tasting experience; do not present the site as an open taproom or publish the older Mon-Fri 09:00-17:00 showroom hours."
  },
  {
      "id": "lyrarakis-winery",
      "name": "Lyrarakis Winery",
      "greekName": "Οινοποιείο Λυραράκη",
      "category": "winery",
      "destination": "crete",
      "country": "Greece",
      "countryCode": "GR",
      "region": "Heraklion",
      "village": "Alagni",
      "locality": "Alagni",
      "coordinates": [
          35.1848888889,
          25.2082222222
      ],
      "coverImage": "https://images.unsplash.com/photo-1474722883778-792e7990302f?auto=format&fit=crop&w=1000&q=80",
      "gallery": [
          "https://images.unsplash.com/photo-1474722883778-792e7990302f?auto=format&fit=crop&w=1000&q=80"
      ],
      "tagLine": "The family that helped bring rare Cretan grapes back",
      "description": "Lyrarakis is a family winery established in 1966 and closely associated with the revival of indigenous Cretan grape varieties. The winery works across distinctive island terroirs while keeping rare local grapes at the heart of its range.",
      "story": "Brothers Manolis and Sotiris Lyrarakis founded the winery in 1966. The family planted the rare Dafni and Plyto varieties in the Psarades vineyard in 1992 and later gave Melissaki a home at Gero Deti in 2010—part of a continuing search for Cretan grapes that had almost disappeared.",
      "indigenousVarieties": [],
      "tastingHighlights": [],
      "openingHours": "Apr-Oct: daily 11:30-19:00; last tastings start 17:30. Bank holidays closed. Nov-Mar: visits available upon request.",
      "ethos": [],
      "additionalCategories": [],
      "visitorFeatures": [],
      "productSections": [
          {
              "category": "winery",
              "specialties": [
                  "Single-Variety Indigenous Revivals",
                  "Estate Wines",
                  "Extra Virgin Olive Oil"
              ],
              "varieties": [
                  "Dafni",
                  "Plyto",
                  "Melissaki",
                  "Vidiano",
                  "Vilana",
                  "Thrapsathiri",
                  "Liatiko",
                  "Kotsifali",
                  "Mandilari"
              ],
              "highlights": [
                  "Psarades Dafni",
                  "Psarades Plyto",
                  "Gero-detis Liatiko",
                  "Ippodromos Vidiano",
                  "Aggelis Liatiko"
              ]
          }
      ],
      "phone": "+30 6981050681",
      "website": "https://lyrarakis.com",
      "googleMapsUrl": "https://maps.google.com/?q=35.184889,25.208222",
      "googlePlaceId": "ChIJa95IFTf0mhQRY5TF5uhxJoU",
      "roadAccess": "narrow_paved",
      "roadAccessStatus": "verified",
      "roadAccessSourceUrl": "https://lyrarakis.com",
      "roadAccessNotes": "Manual operator road review: narrow paved approach. Road classification only; does not establish rental-car suitability or guarantee current conditions.",
      "locationStatus": "verified_entrance",
      "locationSourceUrl": "https://lyrarakis.com/en/visit-us",
      "locationNotes": "Producer publishes exact tasting/event GPS coordinates: 35°11'05.6\"N 25°12'29.6\"E, matching the database pin.",
      "publicPointType": "estate",
      "visitStatus": "seasonal_public",
      "visitSourceUrl": "https://www.lyrarakis.com/en/visit-us",
      "visitNotes": "Current first-party visit page publishes April-October daily opening hours, last tasting time, an estimated total visit duration of 1.5 hours, and November-March visits available upon request. The page does not explicitly state a general main-season booking requirement, walk-in policy, parking policy, or visitor languages."
  },
  {
      "id": "meligyris-apiary",
      "name": "Meligyris",
      "greekName": "Μελίγυρις Κρητικό Μέλι",
      "category": "apiary",
      "destination": "crete",
      "country": "Greece",
      "countryCode": "GR",
      "region": "Heraklion",
      "village": "Arkalochori",
      "locality": "Arkalochori",
      "coordinates": [
          35.1499302,
          25.2656256
      ],
      "coverImage": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1000&q=80",
      "gallery": [
          "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1000&q=80"
      ],
      "tagLine": "Family beekeeping since 1920, studied through a scientist's lens",
      "description": "Meligyris produces Cretan honeys from wild and cultivated landscapes around the island, with an emphasis on how place changes aroma, composition and character. The company is based in Arkalochori and builds on a family beekeeping tradition reaching back to 1920.",
      "story": "Manolis Stefanakis grew up inside that beekeeping tradition and later studied at the Agricultural University of Athens. He brought the two worlds together by examining how altitude, humidity, soil and local microclimates affect the organoleptic and biochemical character of each honey.",
      "indigenousVarieties": [],
      "tastingHighlights": [],
      "openingHours": "",
      "ethos": [],
      "additionalCategories": [],
      "visitorFeatures": [],
      "productSections": [
          {
              "category": "apiary",
              "specialties": [
                  "Single-Origin Cretan Honey",
                  "Raw Wild Thyme Honey",
                  "Pine, Fir & Mountain Blossom Honeys",
                  "Natural Bee Pollen & Royal Jelly"
              ],
              "varieties": [
                  "Thyme",
                  "Pine & Thyme",
                  "White Thyme (Malotira)",
                  "Heather (Reiki)",
                  "Sage",
                  "Forest & Wild Herbs"
              ],
              "highlights": [
                  "Meligyris Wild Thyme Honey",
                  "Meligyris White Thyme from White Mountains",
                  "Organic Cretan Pine & Thyme Honey",
                  "Raw Honeycomb"
              ]
          }
      ],
      "phone": "+30 28910 29066",
      "website": "https://meligyris.com",
      "googleMapsUrl": "https://maps.google.com/?q=35.149930,25.265626",
      "googlePlaceId": "ChIJ88HxsqT0mhQRh_C91lHjOsc",
      "roadAccess": "paved",
      "roadAccessStatus": "verified",
      "roadAccessSourceUrl": "https://meligyris.com",
      "roadAccessNotes": "Manual operator road review: paved village road of normal usable width. Road classification only; does not establish rental-car suitability or guarantee current conditions.",
      "locationStatus": "verified_entrance",
      "locationSourceUrl": "https://meligyris.com",
      "locationNotes": "Exact coordinates verified from the producer-controlled map destination.",
      "publicPointType": "production_site",
      "visitStatus": "not_publicly_confirmed",
      "visitSourceUrl": "https://meligyris.com",
      "visitNotes": "Current first-party site confirms the Arkalochori contact/pickup location. The online store offers order pickup at Arkalochori, but the producer does not publish a current apiary visit, tour, tasting programme, public shop timetable, booking rule, or walk-in policy. Do not present the site as a general visitor attraction."
  },
  {
      "id": "notos-brewery",
      "name": "Notos Brewery",
      "greekName": "Ζυθοποιία Νότος",
      "category": "brewery",
      "destination": "crete",
      "country": "Greece",
      "countryCode": "GR",
      "region": "Heraklion",
      "village": "Kaminia (Heraklion)",
      "locality": "Kaminia (Heraklion)",
      "coordinates": [
          35.3293991,
          25.1142006
      ],
      "coverImage": "https://images.unsplash.com/photo-1575037614876-c38a4d44f5b8?auto=format&fit=crop&w=1000&q=80",
      "gallery": [
          "https://images.unsplash.com/photo-1575037614876-c38a4d44f5b8?auto=format&fit=crop&w=1000&q=80"
      ],
      "tagLine": "Four childhood friends who built Heraklion's first microbrewery",
      "description": "Notos is an independent brewery in Heraklion that grew out of home brewing, friendship and a desire to make local craft beer in a city that did not yet have its own microbrewery. It remains a distinctly urban Cretan beer project.",
      "story": "Childhood friends Antonis Tampakakis, Giorgos Neroladakis, Kostas Verigos and Lambros Petsalakis spent years talking, planning and learning before turning their brewing hobby into Notos. Their project became Heraklion's first microbrewery and introduced their own local craft beer to the city.",
      "indigenousVarieties": [],
      "tastingHighlights": [],
      "openingHours": "",
      "ethos": [],
      "additionalCategories": [],
      "visitorFeatures": [],
      "productSections": [
          {
              "category": "brewery",
              "specialties": [
                  "Independent Urban Microbrewery",
                  "Unfiltered Handcrafted Beers",
                  "Fresh Local Kegs & Bottles"
              ],
              "varieties": [
                  "Lager",
                  "Pilsner",
                  "Pale Ale",
                  "Dry Stout"
              ],
              "highlights": [
                  "Notos Lager Unfiltered",
                  "Notos Pilsner",
                  "Notos She's a Pirate Pale Ale",
                  "Notos Dry Stout"
              ]
          }
      ],
      "phone": "+30 2811 117167",
      "website": "https://notosbrewery.gr",
      "googleMapsUrl": "https://maps.google.com/?q=35.329399,25.114201",
      "googlePlaceId": "ChIJV-H_WvJZmhQRhDv7rC9J7BI",
      "roadAccess": "paved",
      "roadAccessStatus": "verified",
      "roadAccessSourceUrl": "https://notosbrewery.gr",
      "roadAccessNotes": "Manual operator road review: normal paved urban street to the mapped entrance. Road classification only; does not establish rental-car suitability.",
      "locationStatus": "verified_location",
      "locationSourceUrl": "https://notosbrewery.gr",
      "locationNotes": "Current address verified as Patriarchou Meletiou Metaxaki 36A, Heraklion.",
      "publicPointType": "production_site",
      "visitStatus": "appointment_only",
      "visitSourceUrl": "https://notosbrewery.gr/zithopoieio/",
      "visitNotes": "The current first-party site confirms the Heraklion brewery and direct brewer contact details but does not publish a formal visitor programme or visitor hours. Current public listings and 2026 visitor reports indicate that informal brewery visits, beer tasting/drinking and takeaway purchases do occur, while also describing the site as not set up as a formal taproom. Contact the brewery before travelling."
  },
  {
      "id": "peskesi-farm-kazani",
      "name": "Peskesi Organic Farm",
      "greekName": "Αγρόκτημα Πεσκέσι",
      "category": "farm",
      "destination": "crete",
      "country": "Greece",
      "countryCode": "GR",
      "region": "Heraklion",
      "village": "Charaso (Hersonissos)",
      "locality": "Charaso (Hersonissos)",
      "coordinates": [
          35.2751612,
          25.2996351
      ],
      "coverImage": "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1000&q=80",
      "gallery": [
          "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1000&q=80"
      ],
      "tagLine": "Regenerative farming at the root of a wider Cretan food philosophy",
      "description": "Peskesi's farm in Charaso combines vegetable gardens, olive groves, herbs and livestock under certified organic, biodynamic and regenerative cultivation. It is the agricultural base behind a broader effort to keep Cretan ingredients connected to the land and seasons that produce them.",
      "story": "The farm follows what Peskesi calls a “Farm to Table” and “Table to Farm” cycle: food begins in the soil, while organic material and knowledge return to the farm rather than ending at the plate. The result is less a showcase farm than a working attempt to make cultivation, cooking and waste reduction part of one system.",
      "indigenousVarieties": [],
      "tastingHighlights": [],
      "openingHours": "Guided farm tours daily at 11:00 and 13:00; tours are weather-dependent.",
      "ethos": [],
      "additionalCategories": [],
      "visitorFeatures": [],
      "productSections": [
          {
              "category": "farm",
              "specialties": [
                  "Traditional Biodynamic Agriculture",
                  "Heirloom Vegetables & Herbs",
                  "Free-Range Poultry"
              ],
              "varieties": [
                  "Traditional Cretan Seed Varieties",
                  "Wild Mountain Greens",
                  "Medicinal Herbs"
              ],
              "highlights": [
                  "Farm-to-table organic produce",
                  "Heirloom vegetable varieties",
                  "Pasture-raised poultry and eggs"
              ]
          }
      ],
      "phone": "+30 6988889994",
      "website": "https://peskesicrete.gr",
      "googleMapsUrl": "https://maps.google.com/?q=35.275161,25.299635",
      "googlePlaceId": "ChIJg4hwRwthmhQRBF4b9YPGsZU",
      "roadAccess": "unpaved_passable",
      "roadAccessStatus": "verified",
      "roadAccessSourceUrl": "https://peskesicrete.gr/en/experiences/explore-the-farm",
      "roadAccessNotes": "Producer guidance confirms a passable dirt-road approach and vehicles up to 20 seats. Manual operator review found the final approximately 400 m unpaved and in reasonable visible condition. Conditions can change; this classification does not imply rental-car suitability.",
      "vipPerks": {
          "freeMeze": "Freshly baked sourdough with wood-fired anthotiro",
          "welcomePour": "Single-Estate Wild Thyme Tsikoudia",
          "discountPercent": 10
      },
      "locationStatus": "verified_location",
      "locationSourceUrl": "https://peskesicrete.gr",
      "locationNotes": "Current Peskesi farm location verified as Charaso, Hersonissos. Producer approval is still required for TerroirTrail experiences.",
      "publicPointType": "estate",
      "visitStatus": "public_visits",
      "visitSourceUrl": "https://peskesicrete.gr/en/experiences/explore-the-farm",
      "visitNotes": "Current first-party Peskesi farm experience page publishes the guided farm tour at 11:00 and 13:00 with a 2-hour duration. The current website Terms state that access may be denied without company confirmation and that visitors must show their confirmation to gain entry, supporting advance booking as required for the farm experience and no unconfirmed walk-in access. Vehicle-size access guidance is not treated as parking evidence, and visitor languages remain unconfirmed."
  },
  {
      "id": "silva-daskalaki-winery",
      "name": "Silva Daskalaki Winery",
      "greekName": "Οινοποιείο Σίλβα Δασκαλάκη",
      "category": "winery",
      "destination": "crete",
      "country": "Greece",
      "countryCode": "GR",
      "region": "Heraklion",
      "village": "Siva (Heraklion)",
      "locality": "Siva (Heraklion)",
      "coordinates": [
          35.2088833333,
          25.0358527778
      ],
      "coverImage": "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1000&q=80",
      "gallery": [
          "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1000&q=80",
          "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=80"
      ],
      "tagLine": "A Siva family tradition carried into modern organic winemaking",
      "description": "Silva Daskalaki is a family winery in Siva, Heraklion, working with organically cultivated vineyards and Cretan varieties within the wider Dafnes wine landscape. The current winery combines family continuity with modern cellar practice.",
      "story": "The Daskalaki family dates its viticulture and winemaking tradition to 1920. In 1998 Irini Daskalaki-Xenogiannaki began building the modern winery in Siva; by 2004 the family had made its first official bottlings of dry and naturally sweet Liatiko.",
      "indigenousVarieties": [],
      "tastingHighlights": [],
      "openingHours": "Apr-Oct: Mon-Sat 10:30-17:30; Nov-Mar: Mon-Fri 10:30-17:30. Closed on holidays. Appointment required one day ahead.",
      "ethos": [],
      "additionalCategories": [],
      "visitorFeatures": [],
      "productSections": [
          {
              "category": "winery",
              "specialties": [
                  "Biodynamic & Organic Viticulture",
                  "Native Cretan Varieties",
                  "Natural Sweet Wines"
              ],
              "varieties": [
                  "Liatiko",
                  "Kotsifali",
                  "Mandilaria",
                  "Vidiano",
                  "Thrapsathiri",
                  "Malvasia",
                  "Plyto"
              ],
              "highlights": [
                  "Enstikto White & Red",
                  "Sera",
                  "Vorinos",
                  "Psithiros",
                  "Liatiko Liasto Sweet"
              ]
          }
      ],
      "phone": "+30 2810 792021",
      "website": "https://silvawines.gr",
      "googleMapsUrl": "https://maps.google.com/?q=35.208883,25.035853",
      "googlePlaceId": "ChIJCwKcSg35mhQRemlU_UuJXJg",
      "roadAccess": "paved",
      "roadAccessStatus": "verified",
      "roadAccessSourceUrl": "https://silvawines.gr",
      "roadAccessNotes": "Manual operator road review: normal paved road reaches the winery; no dirt final section observed. Road classification only; does not establish rental-car suitability.",
      "vipPerks": {
          "freeMeze": "Aged sheep Graviera & carob rusks",
          "welcomePour": "Biodynamic Vorinos Vidiano",
          "discountPercent": 15
      },
      "locationStatus": "verified_location",
      "locationSourceUrl": "https://www.silvawines.gr/en/about-us",
      "locationNotes": "Siva winery coordinates match Wines of Crete route data; producer contact details verified.",
      "publicPointType": "estate",
      "visitStatus": "appointment_only",
      "visitSourceUrl": "https://www.silvawines.gr/en/guided-tours-tasting-amp-wine-tips",
      "visitNotes": "Current first-party visitor page lists five guided-tour/tasting programmes. Arrangement one day in advance is required. Tours are offered in Greek and English. Published programme durations vary from 45 to 120 minutes, so no single typical visit duration is stored. Food can be arranged with tastings on request. Parking is not explicitly documented on the current visitor page."
  },
  {
      "id": "solo-craft-brewery",
      "name": "Solo Cretan Craft Brewery",
      "greekName": "Μικροζυθοποιία Σόλο",
      "category": "brewery",
      "destination": "crete",
      "country": "Greece",
      "countryCode": "GR",
      "region": "Heraklion",
      "village": "Kallithea (Heraklion)",
      "locality": "Kallithea (Heraklion)",
      "coordinates": [
          35.3117,
          25.176
      ],
      "coverImage": "https://images.unsplash.com/photo-1538488881522-4326c36397ce?auto=format&fit=crop&w=1000&q=80",
      "gallery": [
          "https://images.unsplash.com/photo-1538488881522-4326c36397ce?auto=format&fit=crop&w=1000&q=80"
      ],
      "tagLine": "Heraklion craft beer built around experimentation and human contact",
      "description": "Solo is an independent Cretan craft brewery based in Heraklion, founded in late 2015. Its identity is intentionally experimental, moving across beer styles rather than treating craft brewing as a fixed set of labels.",
      "story": "From the beginning, Solo framed good beer as something social rather than simply commercial—its own language says craft beer is about people, togetherness and sharing ideas. That philosophy explains why experimentation and dialogue with beer drinkers are part of the brewery's identity.",
      "indigenousVarieties": [],
      "tastingHighlights": [],
      "openingHours": "Mon-Fri 11:00-16:00; Sat-Sun by appointment. Contact before visiting so the brewery can schedule the visit.",
      "ethos": [],
      "additionalCategories": [],
      "visitorFeatures": [],
      "productSections": [
          {
              "category": "brewery",
              "specialties": [
                  "True Craft Brewing",
                  "High Gravity Beers",
                  "Imperial Ales & Stouts"
              ],
              "varieties": [
                  "Imperial IPA",
                  "Imperial Stout",
                  "American Pale Ale",
                  "Saison",
                  "Gose"
              ],
              "highlights": [
                  "Fouriaris Imperial IPA",
                  "Skotadi Imperial Stout",
                  "Psaki India Pale Ale",
                  "Askianos",
                  "Gourouni"
              ]
          }
      ],
      "phone": "+30 2811 750209",
      "website": "https://solobeer.gr",
      "googleMapsUrl": "https://maps.google.com/?q=35.311700,25.176000",
      "googlePlaceId": "ChIJo2tbh7JZmhQRkvvJabgPQH8",
      "roadAccess": "paved",
      "roadAccessStatus": "verified",
      "roadAccessSourceUrl": "https://solobeer.gr/en/",
      "roadAccessNotes": "Manual operator road review: normal paved approach. Official producer information publishes the mapped brewery location. Road classification only; does not establish rental-car suitability.",
      "locationStatus": "verified_location",
      "locationSourceUrl": "https://solobeer.gr",
      "locationNotes": "Current production-site address verified as Kountourioti 35, Heraklion.",
      "publicPointType": "production_site",
      "visitStatus": "appointment_only",
      "visitSourceUrl": "https://solobeer.gr/en/",
      "visitNotes": "Current first-party site explicitly welcomes visitors to the Kallithea brewery and asks them to contact the brewery before visiting so the visit can be scheduled. Published visiting hours are 11:00-16:00 on weekdays, with Saturday and Sunday by appointment. Group tastings, brewery tours and tailor-made experiences are available after communication. Parking, visit duration and visitor languages are not published."
  },
  {
      "id": "stamatogiorgis-dairy-smari",
      "name": "Stamatogiorgis Dairy",
      "greekName": "Τυροκομείο Σταματογιώργης",
      "category": "cheese_dairy",
      "destination": "crete",
      "country": "Greece",
      "countryCode": "GR",
      "region": "Heraklion",
      "village": "Smari Pediados",
      "locality": "Smari Pediados",
      "coordinates": [
          35.237247,
          25.3152673
      ],
      "coverImage": "",
      "gallery": [],
      "tagLine": "Generations of Smari cheesemaking, 100% local milk and both traditional and delicatessen Cretan flavors.",
      "description": "Stamatogiorgis is a family-owned dairy in Smari, Pediados, rooted in Cretan cheesemaking tradition. It makes classic cheeses from 100% local milk and also develops delicatessen variations with pepper, bukovo, Cretan herbs and smoking, alongside traditional dairy products.",
      "story": "The Stamatogiorgis family describes generations of cheesemaking know-how carried into a modern family dairy in Smari. Its range begins with traditional Cretan cheeses such as Graviera, Kefalotyri, Myzithra and Anthotyro, but extends to herb, pepper and smoked cheeses and everyday dairy products. The producer also highlights international distinctions and tasting experiences at its facilities; because current booking and walk-in procedures are not clear, TerroirTrail continues to treat visitor access as uncertain rather than guaranteed.",
      "indigenousVarieties": [
          "Graviera",
          "Kefalotyri",
          "Myzithra",
          "Anthotyro",
          "cheese with pepper",
          "cheese with bukovo",
          "cheese with Cretan herbs",
          "smoked cheese",
          "sheep yogurt",
          "anthogalo",
          "katsochoiri"
      ],
      "tastingHighlights": [
          "The family-owned Smari dairy presents generations of Cretan cheesemaking know-how and uses 100% local milk.",
          "Traditional cheeses include Graviera, Kefalotyri, Myzithra and Anthotyro, alongside pepper, bukovo, Cretan-herb and smoked delicatessen cheeses.",
          "The producer also makes sheep yogurt, anthogalo and katsochoiri and advertises tasting experiences at its facilities; current booking and walk-in terms remain uncertain."
      ],
      "openingHours": "",
      "ethos": [],
      "additionalCategories": [],
      "visitorFeatures": [],
      "productSections": [
          {
              "category": "cheese_dairy",
              "specialties": [
                  "Artisanal Small-Batch Cheeses",
                  "Tasting Experiences",
                  "Heirloom Family Recipes"
              ],
              "varieties": [
                  "Graviera",
                  "Kefalograviera",
                  "Anthotyros",
                  "Melichloro"
              ],
              "highlights": [
                  "Stamatogiorgis Graviera",
                  "Handcrafted Aged Hard Cheeses",
                  "Traditional Smari Cream"
              ]
          }
      ],
      "phone": "+30 697 342 3040",
      "website": "https://stamatogiorgis.gr/en/",
      "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=35.237247%2C25.3152673&query_place_id=ChIJDZQB-RFhmhQRcsREVVyuhSQ",
      "googlePlaceId": "ChIJDZQB-RFhmhQRcsREVVyuhSQ",
      "roadAccess": "paved",
      "roadAccessStatus": "verified",
      "roadAccessSourceUrl": "https://www.google.com/maps/search/?api=1&query=35.237247%2C25.3152673&query_place_id=ChIJDZQB-RFhmhQRcsREVVyuhSQ",
      "roadAccessNotes": "Manual operator road review: normal paved approach. Road classification only; does not establish rental-car suitability or guarantee current conditions.",
      "locationStatus": "verified_location",
      "locationSourceUrl": "https://www.google.com/maps/search/?api=1&query=35.237247%2C25.3152673&query_place_id=ChIJDZQB-RFhmhQRcsREVVyuhSQ",
      "locationNotes": "Exact Google business point manually matched to the Stamatogiorgis dairy in Smari and the producer-controlled business identity. This verifies the business location, not a specific customer entrance.",
      "publicPointType": "production_site",
      "visitStatus": "appointment_only",
      "visitSourceUrl": "https://stamatogiorgis.gr/en/",
      "visitNotes": "Current first-party site explicitly says the dairy offers tasting experiences at its facilities. It does not publish a clear current visitor timetable, booking requirement, walk-in policy, visit duration, or parking policy. Contact the dairy before travelling."
  },
  {
      "id": "kazani-stilianou",
      "name": "Stilianou Winery",
      "greekName": "Οινοποιείο Στυλιανού",
      "category": "winery",
      "destination": "crete",
      "country": "Greece",
      "countryCode": "GR",
      "region": "Heraklion",
      "village": "Kounavoi",
      "locality": "Kounavoi",
      "coordinates": [
          35.2358583333,
          25.1914
      ],
      "coverImage": "https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?auto=format&fit=crop&w=1000&q=80",
      "gallery": [
          "https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?auto=format&fit=crop&w=1000&q=80"
      ],
      "tagLine": "Five generations of family winemaking and organic olive oil in Kounavoi",
      "description": "Stilianou is a small family winery in the historic wine country around Kounavoi and Archanes, producing natural and organically grown wines with a strong emphasis on indigenous Cretan grapes. Olive oil is part of the same family agricultural landscape.",
      "story": "The family dates its domain to 1922 and describes five generations of winemakers. Native Cretan grapes and family-scale production remain central to its natural-wine approach, alongside organically cultivated olive groves and organic extra virgin olive oil.",
      "indigenousVarieties": [
          "Vidiano",
          "Thrapsathiri",
          "Vilana",
          "Kotsifali",
          "Mandilari"
      ],
      "tastingHighlights": [
          "4-wine tasting (€10 per person)",
          "6-wine tasting (€12 per person)",
          "Organic olive oil tasting",
          "Cheese platter available",
          "Local pies platter available"
      ],
      "openingHours": "Daily 11:00-19:00. Nov-Mar: contact/book before visiting.",
      "ethos": [],
      "additionalCategories": [
          "olive_oil_producer"
      ],
      "visitorFeatures": [],
      "productSections": [
          {
              "category": "winery",
              "specialties": [
                  "Natural & Bio-Organic Wines",
                  "Indigenous Cretan Grape Varieties"
              ],
              "varieties": [
                  "Vidiano",
                  "Thrapsathiri",
                  "Vilana",
                  "Kotsifali",
                  "Mandilaria"
              ],
              "highlights": [
                  "Great Mother Red & White",
                  "Theon Gi Vidiano",
                  "Stilianou Bio Tsikoudia"
              ]
          },
          {
              "category": "olive_oil_producer",
              "specialties": [
                  "Single-Estate Organic Extra Virgin Olive Oil"
              ],
              "varieties": [
                  "Koroneiki"
              ],
              "highlights": [
                  "Cold pressed organic olive oil"
              ]
          }
      ],
      "phone": "+30 6940784329",
      "website": "https://stilianouwinery.com",
      "googleMapsUrl": "https://maps.google.com/?q=35.235858,25.191400",
      "googlePlaceId": "ChIJ64tJU_71mhQRkQMBKPHOyUs",
      "roadAccess": "narrow_paved",
      "roadAccessStatus": "verified",
      "roadAccessSourceUrl": "https://stilianouwinery.com",
      "roadAccessNotes": "Manual operator road review: narrow paved approach. Road classification only; does not establish rental-car suitability or guarantee current conditions.",
      "foodOption": "tasting_board",
      "locationStatus": "verified_location",
      "locationSourceUrl": "https://stilianouwinery.com/",
      "locationNotes": "Current winery identity, visitor operation and phone verified on the producer site. Closing time varies between current producer pages, so users should check the booking page.",
      "publicPointType": "estate",
      "visitStatus": "seasonal_public",
      "visitSourceUrl": "https://stilianouwinery.com/",
      "visitNotes": "Current first-party Stilianou Winery site lists daily opening hours of 11:00-19:00 and presents visits/tastings with a booking calendar. The current tasting menu publishes a 4-wine tasting at €10 per person, a 6-wine tasting at €12 per person, organic olive-oil tasting at €3 per person, a cheese platter at €17 per plate (for two), and a local-pies platter at €12 per plate (for two). Winter access from November through March is stated as on booking. No current public email address is published on the present website; use the official booking/contact route or current phone number."
  },
  {
      "id": "titakis-winery",
      "name": "Titakis Winery",
      "greekName": "Οινοποιείο Τιτάκη",
      "category": "winery",
      "destination": "crete",
      "country": "Greece",
      "countryCode": "GR",
      "region": "Heraklion",
      "village": "Kounavi (Peza PDO)",
      "locality": "Kounavi (Peza PDO)",
      "coordinates": [
          35.2330555556,
          25.1838666667
      ],
      "coverImage": "https://images.unsplash.com/photo-1574856344991-aaa31b6f4ce3?auto=format&fit=crop&w=1000&q=80",
      "gallery": [
          "https://images.unsplash.com/photo-1574856344991-aaa31b6f4ce3?auto=format&fit=crop&w=1000&q=80"
      ],
      "tagLine": "Three generations moving Cretan wine from Kalloni to Kounavoi",
      "description": "Titakis is a three-generation Cretan winery whose modern production base is in Kounavoi. Its history follows the wider transition of island wine from small family production toward estate vineyards, bottling and contemporary cellar work.",
      "story": "Titos Titakis founded the first family winery in Kalloni in 1952, and his son Nikolaos expanded its commercial reach. Production moved to modern facilities in Kounavoi in 1996; the third generation entered management in 2005 and has continued expanding the family's vineyards and wine portfolio.",
      "indigenousVarieties": [],
      "tastingHighlights": [],
      "openingHours": "Booking office: Mon-Fri 08:00-15:00; Sat upon request. Visit time is arranged through the Fabrika reservation flow.",
      "ethos": [],
      "additionalCategories": [],
      "visitorFeatures": [],
      "productSections": [
          {
              "category": "winery",
              "specialties": [
                  "Fabrika Wine Experience",
                  "Concrete Cellar Aging",
                  "Single-Varieties"
              ],
              "varieties": [
                  "Vidiano",
                  "Malvasia Aromatica",
                  "Kotsifali",
                  "Mandilari",
                  "Assyrtiko",
                  "Syrah"
              ],
              "highlights": [
                  "Impetus White & Red",
                  "Kounavi PDO Peza",
                  "Fabrika Selections"
              ]
          }
      ],
      "phone": "+30 2810 743630",
      "website": "https://titakis.gr",
      "googleMapsUrl": "https://maps.google.com/?q=35.2330555556,25.1838666667",
      "googlePlaceId": "ChIJc19IswH2mhQRs59Vro6kHog",
      "roadAccess": "paved",
      "roadAccessStatus": "verified",
      "roadAccessSourceUrl": "https://titakis.gr",
      "roadAccessNotes": "Manual operator road review: normal paved approach. Road classification only; does not establish rental-car suitability or guarantee current conditions.",
      "locationStatus": "verified_location",
      "locationSourceUrl": "https://titakis.gr/en/history/",
      "locationNotes": "Coordinates normalized to Wines of Crete Kounavoi location; current phone verified by the winery and Wines of Crete.",
      "publicPointType": "production_site",
      "visitStatus": "seasonal_public",
      "visitSourceUrl": "https://www.fabrikaexperience.gr/en/book-your-visit",
      "visitNotes": "Current first-party Fabrika Experience site presents Titakis Winery as an active wine-tour destination with multiple bookable tour/tasting packages. Reservations are handled by phone or booking form. The page publishes booking-office hours and package-specific durations, including additional 1- or 2-day notice for selected premium experiences. The site does not explicitly state a general walk-in policy, parking policy, or tour languages, so those remain unconfirmed."
  },
  {
      "id": "zacharioudakis-winery",
      "name": "Zacharioudakis Organic Winery",
      "greekName": "Βιολογικό Οινοποιείο Ζαχαριουδάκη",
      "category": "winery",
      "destination": "crete",
      "country": "Greece",
      "countryCode": "GR",
      "region": "Heraklion",
      "village": "Plouti (Messara Valley)",
      "locality": "Plouti (Messara Valley)",
      "coordinates": [
          35.0773388889,
          24.9414527778
      ],
      "coverImage": "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1000&q=80",
      "gallery": [
          "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1000&q=80"
      ],
      "tagLine": "A journalist's return to family land on Orthi Petra",
      "description": "Domaine Zacharioudakis is an organic wine estate on the steep Orthi Petra hill near Plouti, above the Messara landscape. The vineyard wraps around the hill on stone-supported slopes, with the winery built directly into the estate.",
      "story": "Journalist Stelios Zacharioudakis and his wife Victoria began creating the estate in 2000 on land connected to his father and grandfather. By 2009 the project had grown into a completed winery, and Zacharioudakis describes that moment as the point when journalism moved to the background and winemaking became his daily work.",
      "indigenousVarieties": [],
      "tastingHighlights": [],
      "openingHours": "Open to visitors year-round; current daily visitor hours are not published on the official visit page. Contact the winery before travelling.",
      "ethos": [],
      "additionalCategories": [],
      "visitorFeatures": [],
      "productSections": [
          {
              "category": "winery",
              "specialties": [
                  "Certified Organic Hilltop Viticulture",
                  "Gravity-Flow Winery"
              ],
              "varieties": [
                  "Vidiano",
                  "Vilana",
                  "Malvasia di Candia",
                  "Kotsifali",
                  "Syrah",
                  "Cabernet Sauvignon"
              ],
              "highlights": [
                  "Orthi Petra White & Red",
                  "Codex",
                  "Victoria"
              ]
          }
      ],
      "phone": "+30 28920 96226",
      "website": "https://zacharioudakis.com",
      "googleMapsUrl": "https://maps.google.com/?q=35.077339,24.941453",
      "googlePlaceId": "ChIJRS6SqV3imhQRh2S9CPLm4oE",
      "roadAccess": "narrow_paved",
      "roadAccessStatus": "verified",
      "roadAccessSourceUrl": "https://zacharioudakis.com",
      "roadAccessNotes": "Manual operator road review: narrow paved approach. Road classification only; does not establish rental-car suitability or guarantee current conditions.",
      "vipPerks": {
          "freeMeze": "Messara artisanal dried figs & cheese",
          "welcomePour": "Orthi Petra Organic Vidiano",
          "discountPercent": 10
      },
      "locationStatus": "verified_location",
      "locationSourceUrl": "https://www.winesofcrete.gr/en/wineries/domaine-zacharioudakis/",
      "locationNotes": "Plouti estate coordinates and current visitor details are verified through Wines of Crete.",
      "publicPointType": "estate",
      "visitStatus": "seasonal_public",
      "visitSourceUrl": "https://www.zacharioudakis.com/en/visit-us/",
      "visitNotes": "Current first-party visitor page confirms that both the vineyard and winery are open and visitable to the public throughout the year. Visitors can tour the vineyard and production areas, taste estate wines and traditional Cretan foods, and buy wines/products from the wine shop. The official page does not publish current daily opening hours, a general booking requirement, walk-in policy, parking policy, visit duration, or tour languages."
  },
  // ==========================================
  // --- RETHYMNO (3 AUDITED RECORDS) ---
  // ==========================================
  {
      "id": "parasiris-olive-mill",
      "name": "Paraschakis Family Olive Oil Factory",
      "greekName": "Ελαιοτριβείο Παρασχάκη",
      "category": "olive_mill",
      "destination": "crete",
      "country": "Greece",
      "countryCode": "GR",
      "region": "Rethymno",
      "village": "Melidoni (Mylopotamos)",
      "locality": "Melidoni (Mylopotamos)",
      "coordinates": [
          35.37587,
          24.72841
      ],
      "coverImage": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1000&q=80",
      "gallery": [
          "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1000&q=80"
      ],
      "tagLine": "Generations of olive-oil making in Melidoni",
      "description": "The Paraschakis family olive mill in Melidoni is both a working family business and a place where older and modern methods of olive-oil production can be understood side by side. The family continues to make extra virgin olive oil in Mylopotamos.",
      "story": "The mill has remained in the Paraschakis family for generations. Rather than discarding older equipment as production modernised, the family kept the story visible: visitors can see how pressing moved from manual and animal-powered methods to contemporary centrifugal extraction.",
      "indigenousVarieties": [],
      "tastingHighlights": [],
      "openingHours": "",
      "ethos": [],
      "additionalCategories": [],
      "visitorFeatures": [],
      "productSections": [
          {
              "category": "olive_mill",
              "specialties": [
                  "Generational Family Olive Mill",
                  "Cold Extracted Extra Virgin Olive Oil",
                  "Local Distillates (Tsikoudia) & Honey"
              ],
              "varieties": [
                  "Koroneiki",
                  "Chondrolia"
              ],
              "highlights": [
                  "Paraschakis Family Extra Virgin Olive Oil",
                  "Organic Bio EVOO",
                  "Traditional Kazan Tsikoudia"
              ]
          }
      ],
      "phone": "+30 28340 22039",
      "website": "https://paraschakis.gr",
      "googleMapsUrl": "https://maps.google.com/?q=35.375870,24.728410",
      "googlePlaceId": "ChIJc4w4p8SomxQRNLLndoFdE0E",
      "roadAccess": "paved",
      "roadAccessStatus": "verified",
      "roadAccessSourceUrl": "https://paraschakis.gr",
      "roadAccessNotes": "Manual operator road review: normal paved approach. Road classification only; does not establish rental-car suitability or guarantee current conditions.",
      "locationStatus": "verified_location",
      "locationSourceUrl": "https://paraschakis.gr/olive-oil-factory/",
      "locationNotes": "Current official site verifies the Paraschakis family olive mill in Melidoni. The public landline +30 28340 22039 is consistently listed by the Municipality/local business sources and current travel listings.",
      "publicPointType": "production_site",
      "visitStatus": "seasonal_public",
      "visitSourceUrl": "https://paraschakis.gr",
      "visitNotes": "Current first-party site explicitly presents the Melidoni olive mill as visitor-friendly and welcomes guests for a guided introduction to olive-oil production and tasting. The current official pages do not publish daily visitor hours, a booking requirement, walk-in policy, visit duration, parking policy, or visitor languages. The previously displayed Mon-Sat 09:00-18:00 timetable came from public listings and is no longer surfaced as a producer-confirmed schedule."
  },
  {
      "id": "psiloritis-cheese-dairy-livadia",
      "name": "Psiloritis Cheese Dairy",
      "greekName": "Τυροκομείο Ψηλορείτης",
      "category": "cheese_dairy",
      "destination": "crete",
      "country": "Greece",
      "countryCode": "GR",
      "region": "Rethymno",
      "village": "Livadia Mylopotamou",
      "locality": "Livadia Mylopotamou",
      "coordinates": [
          35.3038706,
          24.8093411
      ],
      "coverImage": "",
      "gallery": [],
      "tagLine": "Family cheesemaking at the foothills of Psiloritis, built around local mountain sheep and goat milk.",
      "description": "Psiloritis Cheese Dairy has produced traditional Cretan dairy products in Livadia Mylopotamou since 1993. Founder Efstratios Klados began with milk from his own sheep and goats; the dairy later expanded its local milk network and moved to modern facilities in 2007 while retaining traditional Cretan cheeses at the centre of production.",
      "story": "Efstratios Klados began producing Graviera and Kefalotyri in 1993 from milk supplied by his own sheep and goats at the foothills of Psiloritis. As demand grew, the dairy began working with other local producers from 1995, with particular attention to milk quality and local sheep and goat breeds reared largely in mountainous areas. In 2007 the family business relocated to modern facilities and adopted ISO 22000 food-safety certification while continuing its traditional Cretan range.",
      "indigenousVarieties": [
          "Cretan Graviera",
          "Kefalotyri",
          "Cretan Xynomyzithra",
          "Anthotyros",
          "sweet Myzithra",
          "white brine cheese",
          "yogurt",
          "Graviera with thyme",
          "Graviera with oregano",
          "Graviera with bukovo",
          "smoked cheese",
          "grated Graviera",
          "Cretan xinochondros"
      ],
      "tastingHighlights": [
          "Founder Efstratios Klados began producing Graviera and Kefalotyri in 1993 using milk from his own sheep and goats at the foothills of Psiloritis.",
          "From 1995 the dairy expanded its local milk network, with emphasis on milk quality and local sheep and goat breeds reared largely in mountainous areas.",
          "The family moved to modern facilities in 2007 and adopted ISO 22000 food-safety certification; the range includes Cretan Graviera, Kefalotyri, Xynomyzithra, Anthotyros and flavored Graviera."
      ],
      "openingHours": "",
      "ethos": [],
      "additionalCategories": [],
      "visitorFeatures": [],
      "productSections": [
          {
              "category": "cheese_dairy",
              "specialties": [
                  "High-Altitude Mountain Cheeses",
                  "PDO Graviera Kritis",
                  "Livadia Traditional Dairy"
              ],
              "varieties": [
                  "Graviera Kritis PDO",
                  "Kefalotyri Psiloriti",
                  "Anthotyros",
                  "Xynomyzithra PDO"
              ],
              "highlights": [
                  "Psiloritis Graviera Kritis PDO",
                  "Mountain Hard Cheese",
                  "Traditional Dry Anthotyros"
              ]
          }
      ],
      "phone": "+30 28340 61716",
      "website": "https://www.psiloriths.gr/en/home/",
      "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=35.3038706%2C24.8093411&query_place_id=ChIJIZTR0koHmxQRQqWZvFNSOGU",
      "googlePlaceId": "ChIJIZTR0koHmxQRQqWZvFNSOGU",
      "roadAccess": "narrow_paved",
      "roadAccessStatus": "verified",
      "roadAccessSourceUrl": "https://www.google.com/maps/search/?api=1&query=35.3038706%2C24.8093411&query_place_id=ChIJIZTR0koHmxQRQqWZvFNSOGU",
      "roadAccessNotes": "Manual operator road review: narrow paved village road. Road classification only; does not establish rental-car suitability or guarantee current conditions.",
      "locationStatus": "verified_location",
      "locationSourceUrl": "https://www.google.com/maps/search/?api=1&query=35.3038706%2C24.8093411",
      "locationNotes": "Exact Google business point manually matched to the current Psiloritis cheese dairy in Livadia, resolving the post-2007 facility location. Persistent Google Place ID additionally cross-matched on 2026-09-16 to the Livadia Psiloritis dairy business listing using the same published phone (+30 28340 61716) and locality as the official producer site.",
      "publicPointType": "production_site",
      "visitStatus": "not_publicly_confirmed",
      "visitSourceUrl": "https://www.psiloriths.gr/en/home/",
      "visitNotes": "Current first-party site confirms the Livadia dairy as a modern production plant and publishes direct contact details, but it does not publish a public visitor programme, tour/tasting procedure, public opening hours, booking rule, or walk-in policy. Keep public access unconfirmed."
  },
  {
      "id": "tzourmpakis-dairy-amari",
      "name": "Tzourmpakis Dairy",
      "greekName": "Τυροκομείο Τζουρμπάκη",
      "category": "cheese_dairy",
      "destination": "crete",
      "country": "Greece",
      "countryCode": "GR",
      "region": "Rethymno",
      "village": "Mixorrouma (Agios Vasileios)",
      "locality": "Mixorrouma (Agios Vasileios)",
      "coordinates": [
          35.2211278,
          24.4979202
      ],
      "coverImage": "https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=1000&q=80",
      "gallery": [
          "https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=1000&q=80"
      ],
      "tagLine": "Sheep and goat milk from Karines, cheesemaking since 1978",
      "description": "Tzourmpakis is a family dairy in Mixorrouma, Rethymno, making traditional Cretan cheeses from sheep and goat milk. The dairy points specifically to herds grazing around Karines, linking its products to the pastoral landscape south of Rethymno.",
      "story": "The family dates its cheesemaking activity to 1978. Its own account emphasises continuity rather than reinvention: milk from local grazing flocks, recipes and handling passed between generations, and modern food-safety certification supporting a traditional range of Cretan cheeses.",
      "indigenousVarieties": [],
      "tastingHighlights": [],
      "openingHours": "",
      "ethos": [],
      "additionalCategories": [],
      "visitorFeatures": [],
      "productSections": [
          {
              "category": "cheese_dairy",
              "specialties": [
                  "Amari Valley Sheep & Goat Milk Cheeses",
                  "Traditional Graviera",
                  "Authentic Rethymno Dairy"
              ],
              "varieties": [
                  "Graviera Kritis PDO",
                  "Anthotyros",
                  "Myzithra",
                  "Gidino (Goat Cheese)"
              ],
              "highlights": [
                  "Tzourmpakis Graviera Kritis PDO",
                  "Pure Goat Hard Cheese",
                  "Aged Dry Anthotyros"
              ]
          }
      ],
      "phone": "+30 28320 20013",
      "website": "https://tzourmpakis.gr",
      "googleMapsUrl": "https://www.google.com/maps/place/%CE%A4%CF%85%CF%81%CE%BF%CE%BA%CE%BF%CE%BC%CE%B5%CE%AF%CE%BF+%CE%A4%CE%B6%CE%BF%CF%85%CF%81%CE%BC%CF%80%CE%AC%CE%BA%CE%B7/@35.2210821,24.4977471,21z/data=!4m14!1m7!3m6!1s0x149b6d60e5af177f:0x28f04e6827f00777!2zzqTPhc-Bzr_Ous6_zrzOtc6vzr8gzqTOts6_z4XPgc68z4DOrM66zrc!8m2!3d35.2211278!4d24.4979202!16s%2Fg%2F11bxd77_pt!3m5!1s0x149b6d60e5af177f:0x28f04e6827f00777!8m2!3d35.2211278!4d24.4979202!16s%2Fg%2F11bxd77_pt?entry=ttu&g_ep=EgoyMDI2MDkwOS4wIKXMDSoASAFQAw%3D%3D",
      "googlePlaceId": "ChIJfxev5WBtmxQRdwfwJ2hO8Cg",
      "roadAccess": "narrow_paved",
      "roadAccessStatus": "verified",
      "roadAccessSourceUrl": "https://tzourmpakis.gr/",
      "roadAccessNotes": "Manual operator road review: narrow paved village road. Road classification only; does not establish rental-car suitability or guarantee current conditions.",
      "locationStatus": "verified_location",
      "locationSourceUrl": "https://www.google.com/maps/place/%CE%A4%CF%85%CF%81%CE%BF%CE%BA%CE%BF%CE%BC%CE%B5%CE%AF%CE%BF+%CE%A4%CE%B6%CE%BF%CF%85%CF%81%CE%BC%CF%80%CE%AC%CE%BA%CE%B7/@35.2210821,24.4977471,21z/data=!4m14!1m7!3m6!1s0x149b6d60e5af177f:0x28f04e6827f00777!2zzqTPhc-Bzr_Ous6_zrzOtc6vzr8gzqTOts6_z4XPgc68z4DOrM66zrc!8m2!3d35.2211278!4d24.4979202!16s%2Fg%2F11bxd77_pt!3m5!1s0x149b6d60e5af177f:0x28f04e6827f00777!8m2!3d35.2211278!4d24.4979202!16s%2Fg%2F11bxd77_pt?entry=ttu&g_ep=EgoyMDI2MDkwOS4wIKXMDSoASAFQAw%3D%3D",
      "locationNotes": "Current Tzourmpakis Dairy location supplied from the Google Maps business listing. Treat as verified location; entrance-level precision has not been separately established.",
      "publicPointType": "production_site",
      "visitStatus": "not_publicly_confirmed",
      "visitSourceUrl": "https://tzourmpakis.gr",
      "visitNotes": "Current first-party site confirms the working dairy and direct contact details in Mixorrouma, but it does not publish a current public visitor programme, shop opening schedule, tour procedure, booking rule, or walk-in policy. Older public sources mention a shop on the Rethymno-Spili road, but that evidence is not current enough to establish present-day public access. Contact the producer before considering a visit."
  },
  // ==========================================
  // --- LASITHI (2 AUDITED RECORDS) ---
  // ==========================================
  {
      "id": "toplou-monastery-winery",
      "name": "Ktima Toplou",
      "greekName": "Κτήμα Τοπλού",
      "category": "winery",
      "destination": "crete",
      "country": "Greece",
      "countryCode": "GR",
      "region": "Lasithi",
      "village": "Sitia",
      "locality": "Sitia",
      "coordinates": [
          35.2215,
          26.2163
      ],
      "coverImage": "https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1000&q=80",
      "gallery": [
          "https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1000&q=80"
      ],
      "tagLine": "Monastic vineyards and centuries of wine history in eastern Crete",
      "description": "Ktima Toplou produces organic wines and spirits from the agricultural estate of the Holy Monastery of Toplou near Sitia. Vineyards, olive groves, dry soils and strong coastal winds connect the modern winery to a much older monastic farming landscape.",
      "story": "Wine has long been part of monastery life here: an inscription on Toplou's wine press records Liatiko cultivation in 1709. The monastery revived old vineyards and planted new ones in the late 1990s, leading to the modern winery and distillery that now carry this agricultural heritage forward.",
      "indigenousVarieties": [],
      "tastingHighlights": [],
      "openingHours": "Toplou Fabrica visitor/tasting room: daily 10:00-18:00. Production winery contact hours: Mon-Fri 08:30-16:30; tastings do not take place at the winery.",
      "ethos": [],
      "additionalCategories": [],
      "visitorFeatures": [],
      "productSections": [
          {
              "category": "winery",
              "specialties": [
                  "Monastic Organic Wines",
                  "Traditional Tsikoudia",
                  "Organic EVOO"
              ],
              "varieties": [
                  "Thrapsathiri",
                  "Liatiko",
                  "Assyrtiko",
                  "Vilana",
                  "Mandilaria",
                  "Syrah"
              ],
              "highlights": [
                  "Gerto Thrapsathiri",
                  "Amaranton Liatiko Rose",
                  "Linos Liatiko Red",
                  "Filotheos Liastos Sweet",
                  "Toplou Tsikoudia"
              ]
          }
      ],
      "phone": "+30 28430 29630",
      "website": "https://www.ktimatoplou.gr/",
      "googleMapsUrl": "https://maps.google.com/?q=35.2215,26.2163",
      "googlePlaceId": "ChIJEaesXnDvkBQRqf3MIrUc1WQ",
      "roadAccess": "paved",
      "roadAccessStatus": "verified",
      "roadAccessSourceUrl": "https://www.ktimatoplou.gr/",
      "roadAccessNotes": "Manual operator road review: normal paved approach to the mapped public point. Classification applies to the mapped visitor location only, not unrelated service or production tracks.",
      "locationStatus": "verified_location",
      "locationSourceUrl": "https://www.ktimatoplou.gr/en/contact-us-285",
      "locationNotes": "Monastery/estate location is verified. Do not present the production winery pin as the tasting-room entrance; current tastings are at Toplou Fabrica in the monastery courtyard.",
      "publicPointType": "estate",
      "visitStatus": "public_visits",
      "visitSourceUrl": "https://www.ktimatoplou.gr/en/toplou-fabrica-tasting-room-315",
      "visitNotes": "Current first-party pages confirm that public tastings and visitor experiences take place at Toplou Fabrica inside the courtyard of the Holy Monastery of Toplou, open daily 10:00-18:00. Ktima Toplou explicitly states that wine tastings do not take place at the production winery. The winery publishes separate contact hours Mon-Fri 08:30-16:30. Booking availability exists through the Fabrica request/contact flow, but a general mandatory-booking or walk-in rule is not explicitly stated."
  },
  {
      "id": "cretan-olive-oil-farm",
      "name": "Spiridi Olive Oil Farm",
      "greekName": "Spiridi Olive Oil Farm",
      "category": "olive_mill",
      "destination": "crete",
      "country": "Greece",
      "countryCode": "GR",
      "region": "Lasithi",
      "village": "Agios Nikolaos - Elounda Road",
      "locality": "Agios Nikolaos - Elounda Road",
      "coordinates": [
          35.211141,
          25.7116105
      ],
      "coverImage": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1000&q=80",
      "gallery": [
          "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1000&q=80"
      ],
      "tagLine": "A family farm where old olive-press history became a living museum",
      "description": "Spiridi Olive Oil Farm, formerly Cretan Olive Oil Farm, combines family olive-oil production with a collection of traditional Cretan food and craft practices on the Agios Nikolaos–Elounda road. At its centre is a restored nineteenth-century olive press brought from the village of Vrouha.",
      "story": "The project grew unexpectedly from work on books about the Cretan diet in the 1990s, which led the family to reconnect with older recipes, ingredients and producers across the island. After years of welcoming visitors, they rebuilt their family's 1882 olive press inside the museum; in 2024 the farm took the Spiridi name to foreground the family legacy.",
      "indigenousVarieties": [],
      "tastingHighlights": [],
      "openingHours": "Usually 1 Apr-31 Oct. Mon-Sat 09:30-18:30; Sun 10:00-16:00. Check the main page for seasonal timetable updates.",
      "ethos": [],
      "additionalCategories": [],
      "visitorFeatures": [],
      "productSections": [
          {
              "category": "olive_mill",
              "specialties": [
                  "Traditional Cold-Pressed Extra Virgin Olive Oil",
                  "Infused Herb Olive Oils",
                  "Natural Olive Oil Soaps & Cosmetics"
              ],
              "varieties": [
                  "Koroneiki",
                  "Tsunati"
              ],
              "highlights": [
                  "Spiridi Estate EVOO",
                  "Flavored Herb Infused Olive Oils",
                  "Handmade Natural Olive Oil Soaps"
              ]
          }
      ],
      "phone": "+30 28410 24139",
      "website": "https://cretanoliveoilfarm.com",
      "googleMapsUrl": "https://maps.google.com/?q=35.211141,25.711611",
      "googlePlaceId": "ChIJVVVVVeV_kBQRuwz899nRDW0",
      "roadAccess": "paved",
      "roadAccessStatus": "verified",
      "roadAccessSourceUrl": "https://cretanoliveoilfarm.com",
      "roadAccessNotes": "Manual operator road review: normal paved approach. Road classification only; does not establish rental-car suitability or guarantee current conditions.",
      "locationStatus": "verified_location",
      "locationSourceUrl": "https://cretanoliveoilfarm.com",
      "locationNotes": "Current Spiridi Olive Oil Farm identity and Agios Nikolaos-Elounda road location verified. Producer advises checking current timetable.",
      "publicPointType": "estate",
      "visitStatus": "seasonal_public",
      "visitSourceUrl": "https://cretanoliveoilfarm.com/tours",
      "visitNotes": "Current first-party pages confirm Spiridi as a seasonal public visitor farm and museum. A simple/e-guided visit requires no reservation and lasts about 60 minutes, including an olive-oil and Cretan-products tasting. The farm usually welcomes visitors from 1 April to 31 October. Separate hands-on activities require booking at least 12 hours ahead. The e-guided tablet content is available in English, French, German, Russian and Polish."
  },
];

export const allProducers = CRETAN_PRODUCERS;
export const producers = CRETAN_PRODUCERS;
