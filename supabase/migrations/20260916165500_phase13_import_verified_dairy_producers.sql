-- Phase 13: import the owner-approved, exact-location dairy producer set.
--
-- 12 new producers are inserted here. Aerakis Cheese Products and Tzourmpakis
-- Dairy already exist and are intentionally left untouched.
--
-- Trust rules preserved by this migration:
-- - exact reviewed production locations only;
-- - no inferred public visits;
-- - no inferred road-access classification;
-- - researched listings are not marked as platform-verified partnerships;
-- - no experiences are created or activated.

insert into public.producers (
  id, name, category, destination, region, village, lat, lng,
  tag_line, description, phone, website, is_verified,
  location_status, location_source_url, location_notes,
  visit_status, visit_source_url, visit_notes,
  road_access, road_access_status, road_access_source_url, road_access_notes,
  google_place_id, google_maps_url, public_point_type, product_specialties
) values
(
  'stamatogiorgis-dairy-smari', 'Stamatogiorgis Dairy', 'cheese_dairy', 'crete', 'Heraklion', 'Smari Pediados', 35.237247, 25.3152673,
  'Family dairy in Smari, Pediados.',
  'Family dairy in Smari producing Cretan cheeses from local milk. The producer also describes tasting experiences at its facilities, but current walk-in access is not treated as confirmed.',
  '+30 697 342 3040', 'https://stamatogiorgis.gr/en/', false,
  'verified_location', 'https://www.google.com/maps/search/?api=1&query=35.237247%2C25.3152673&query_place_id=ChIJDZQB-RFhmhQRcsREVVyuhSQ',
  'Exact Google business point manually matched to the Stamatogiorgis dairy in Smari and the producer-controlled business identity. This verifies the business location, not a specific customer entrance.',
  'current_access_uncertain', 'https://stamatogiorgis.gr/en/',
  'The current producer site describes tasting experiences at its facilities, but a clear current booking procedure, ordinary opening hours, price, or walk-in policy was not verified. Do not present as guaranteed public walk-in access.',
  null, 'not_publicly_confirmed', null,
  'No reliable source-backed road-surface, width, or last-mile vehicle-suitability classification was verified; routing safety must fail closed.',
  'ChIJDZQB-RFhmhQRcsREVVyuhSQ', 'https://www.google.com/maps/search/?api=1&query=35.237247%2C25.3152673&query_place_id=ChIJDZQB-RFhmhQRcsREVVyuhSQ', 'production_site',
  array['graviera','kefalotyri','myzithra','anthotyro']::text[]
),
(
  'elatos-kapetanou-schinochori', 'ELATOS / Kapetanou Bros', 'cheese_dairy', 'peloponnese', 'Argolida', 'Schinochori', 37.6787461, 22.6540322,
  'Third-generation dairy in Schinochori, Argos.',
  'Third-generation dairy operating since 1963, with its production location at Alogomandra, Schinochori, Argos.',
  '+30 697 305 8805 / +30 697 479 3211', 'https://afoikapetanou.gr/', false,
  'verified_location', 'https://www.google.com/maps/search/?api=1&query=37.6787461%2C22.6540322&query_place_id=ChIJce0j3iH-nxQRSYbQZyh7_Q0',
  'Exact Google business point manually matched to the producer-published production location at Alogomandra, Schinochori. This verifies the business location, not a specific customer entrance.',
  'not_publicly_confirmed', 'https://afoikapetanou.gr/',
  'The production site is documented, but no current first-party public visit, tour, tasting, or walk-in procedure was verified.',
  null, 'not_publicly_confirmed', null,
  'No reliable source-backed road-surface, width, or last-mile vehicle-suitability classification was verified; routing safety must fail closed.',
  'ChIJce0j3iH-nxQRSYbQZyh7_Q0', 'https://www.google.com/maps/search/?api=1&query=37.6787461%2C22.6540322&query_place_id=ChIJce0j3iH-nxQRSYbQZyh7_Q0', 'production_site',
  array['Feta PDO']::text[]
),
(
  'arvanitis-dairy-neochorouda', 'Arvanitis Dairy', 'cheese_dairy', 'northern_greece', 'Thessaloniki', 'Neochorouda', 40.7091636, 22.8796043,
  'Family cheese producer in Neochorouda.',
  'Three-generation family cheese producer with its fromagerie on Symmachiki Odos in Neochorouda, Thessaloniki.',
  '+30 2310 709559 / +30 2310 709951', 'https://arvanitis.gr/en/', false,
  'verified_location', 'https://www.google.com/maps/search/?api=1&query=40.7091636%2C22.8796043&query_place_id=ChIJ8VOFJRcxqBQR5ROjidyM_FI',
  'Exact Google business point manually matched to the Neochorouda cheese factory. The separate Agora Modiano Experience Store is not used as the production-site location.',
  'not_publicly_confirmed', 'https://arvanitis.gr/en/company/the-company/',
  'The Neochorouda factory is confirmed, but no current first-party public visit or tour procedure for the factory was verified. The central Thessaloniki Experience Store is a separate public point.',
  null, 'not_publicly_confirmed', null,
  'No reliable source-backed road-surface, width, or last-mile vehicle-suitability classification was verified; routing safety must fail closed.',
  'ChIJ8VOFJRcxqBQR5ROjidyM_FI', 'https://www.google.com/maps/search/?api=1&query=40.7091636%2C22.8796043&query_place_id=ChIJ8VOFJRcxqBQR5ROjidyM_FI', 'production_site',
  array['Feta PDO','barrel-matured Feta PDO','Manouri PDO','anthotyro','goat cheese','smoked Thessaloniki cheese','saganaki']::text[]
),
(
  'baladinos-dairy-varipetro', 'Baladinos & Sons', 'cheese_dairy', 'crete', 'Chania', 'Varipetro', 35.5133795, 24.0162928,
  'Chania family dairy with production in Varipetro.',
  'Family dairy whose production moved to privately owned facilities in Varipetro, Chania in 2014. Its central Chania retail shop is a separate public point.',
  '+30 28210 33030 / +30 28210 32222', 'https://www.balantinos.gr/en/', false,
  'verified_location', 'https://www.google.com/maps/search/?api=1&query=35.5133795%2C24.0162928',
  'Exact Google business point manually matched to the producer-described Varipetro factory. The central Chania retail shop is not used as the production-site location.',
  'not_publicly_confirmed', 'https://www.balantinos.gr/en/contact/',
  'The factory location is confirmed, but no current first-party public factory visit, tour, tasting, or walk-in procedure was verified.',
  null, 'not_publicly_confirmed', null,
  'No reliable source-backed road-surface, width, or last-mile vehicle-suitability classification was verified; routing safety must fail closed.',
  null, 'https://www.google.com/maps/search/?api=1&query=35.5133795%2C24.0162928', 'production_site',
  array['Graviera PDO','Pichtogalo Chanion PDO','kefalotyri','dry anthotyros','tyromalama','yoghurt','butter']::text[]
),
(
  'katsouli-cheese-koliaki', 'Katsouli Cheese Factory', 'cheese_dairy', 'peloponnese', 'Argolida', 'Koliaki / Trachia', 37.582741, 23.147568,
  'Family cheese factory in Argolida.',
  'Family cheese factory on the Old Epidaurus–Trachia provincial road, with a cheesemaking history beginning in 1989.',
  '+30 27530 71363 / +30 698 090 8616', 'https://katsou.gr/en/homepage-Tyrokomeio-Katsoyli', false,
  'verified_location', 'https://www.google.com/maps/search/?api=1&query=37.582741%2C23.147568',
  'Exact mapped point manually matched to the producer-published dairy address on the Old Epidaurus–Trachia road. This verifies the production location, not a specific entrance.',
  'not_publicly_confirmed', 'https://katsou.gr/en/Contact',
  'The cheese factory identity is confirmed, but no current producer-published walk-in, tour, or tasting procedure was verified.',
  null, 'not_publicly_confirmed', null,
  'No reliable source-backed road-surface, width, or last-mile vehicle-suitability classification was verified; routing safety must fail closed.',
  null, 'https://www.google.com/maps/search/?api=1&query=37.582741%2C23.147568', 'production_site',
  array['feta','graviera','kefalotyri','myzithra','anthotyro','goat cheese','Mastichoto']::text[]
),
(
  'kalavryta-dairy-cooperative-xirokampos', 'Agricultural Dairy Cooperative of Kalavryta', 'cheese_dairy', 'peloponnese', 'Achaia', 'Xirokampos', 38.0322125, 22.1063514,
  'Kalavryta dairy cooperative production site.',
  'Dairy cooperative founded in 1963, with cheese production at its Xirokampos factory on the Kalavryta–Patras road.',
  '+30 26920 22464', 'https://www.kalavritacoop.gr/en', false,
  'verified_location', 'https://www.google.com/maps/search/?api=1&query=38.0322125%2C22.1063514',
  'Exact mapped point manually matched to the cooperative production site at Xirokampos. The central Kalavryta offices and branch stores are separate locations.',
  'not_publicly_confirmed', 'https://www.kalavritacoop.gr/cheese-factory',
  'The production factory is confirmed, but no current first-party factory visitor programme or public walk-in procedure was verified.',
  null, 'not_publicly_confirmed', null,
  'No reliable source-backed road-surface, width, or last-mile vehicle-suitability classification was verified; routing safety must fail closed.',
  null, 'https://www.google.com/maps/search/?api=1&query=38.0322125%2C22.1063514', 'production_site',
  array['Feta PDO']::text[]
),
(
  'christakis-patria-feta-proastio', 'Christakis / Patria Feta', 'cheese_dairy', 'northern_greece', 'Pella', 'Proastio, Edessa', 40.783506, 22.060069,
  'Family cheesemaking at Proastio, Edessa.',
  'Cheese producer with family cheesemaking history beginning in 1890 and a current factory on the Edessa–Flamouria road at Proastio.',
  '+30 23810 28703', 'https://www.patriafeta.com/', false,
  'verified_location', 'https://www.google.com/maps/search/?api=1&query=40.783506%2C22.060069',
  'Exact Google business point manually matched to the Patria Feta / Christakis factory at the 3rd km Edessa–Flamouria road, Proastio.',
  'not_publicly_confirmed', 'https://www.patriafeta.com/',
  'The factory location is confirmed, but no current first-party public visit, tour, tasting, or walk-in procedure was verified.',
  null, 'not_publicly_confirmed', null,
  'No reliable source-backed road-surface, width, or last-mile vehicle-suitability classification was verified; routing safety must fail closed.',
  null, 'https://www.google.com/maps/search/?api=1&query=40.783506%2C22.060069', 'production_site',
  array['Feta PDO']::text[]
),
(
  'psiloritis-cheese-dairy-livadia', 'Psiloritis Cheese Dairy', 'cheese_dairy', 'crete', 'Rethymno', 'Livadia Mylopotamou', 35.3038706, 24.8093411,
  'Family dairy in Livadia Mylopotamou.',
  'Family dairy operating since 1993 in Livadia Mylopotamou, with production moved to newer facilities in 2007.',
  '+30 28340 61716', 'https://www.psiloriths.gr/en/home/', false,
  'verified_location', 'https://www.google.com/maps/search/?api=1&query=35.3038706%2C24.8093411',
  'Exact Google business point manually matched to the current Psiloritis cheese dairy in Livadia, resolving the post-2007 facility location.',
  'not_publicly_confirmed', 'https://www.psiloriths.gr/en/the-company/',
  'No current first-party visitor programme, opening hours, tour procedure, or booking method was verified for the dairy.',
  null, 'not_publicly_confirmed', null,
  'No reliable source-backed road-surface, width, or last-mile vehicle-suitability classification was verified; routing safety must fail closed.',
  null, 'https://www.google.com/maps/search/?api=1&query=35.3038706%2C24.8093411', 'production_site',
  array['Cretan graviera','kefalotyri','Cretan xynomyzithra','anthotyros','fresh myzithra','white brine cheese','yoghurt']::text[]
),
(
  'gypas-cheese-asi-gonia', 'GYPAS / Gyparaki Bros', 'cheese_dairy', 'crete', 'Chania', 'Asi Gonia', 35.2728027, 24.2781829,
  'Multi-generation creamery in Asi Gonia.',
  'Multi-generation family creamery that moved from the village centre to a modern 3,000 m² creamery at the edge of Asi Gonia.',
  '+30 28310 82213', 'https://www.gypas.gr/en/', false,
  'verified_location', 'https://www.google.com/maps/search/?api=1&query=35.2728027%2C24.2781829',
  'Exact Google business point manually matched to the modern GYPAS creamery at the edge of Asi Gonia rather than the historic village-centre creamery.',
  'not_publicly_confirmed', 'https://www.gypas.gr/en/the-creamery',
  'The modern creamery is confirmed, but no current first-party public visit, tour, tasting, or walk-in procedure was verified.',
  null, 'not_publicly_confirmed', null,
  'No reliable source-backed road-surface, width, or last-mile vehicle-suitability classification was verified; routing safety must fail closed.',
  null, 'https://www.google.com/maps/search/?api=1&query=35.2728027%2C24.2781829', 'production_site',
  array['Cretan Graviera PDO']::text[]
),
(
  'tsatsoulis-cheese-panagitsa', 'Tsatsoulis Cheese', 'cheese_dairy', 'peloponnese', 'Arcadia', 'Panagitsa', 37.7559711, 22.2236474,
  'Family cheesemaking in Panagitsa, Arcadia.',
  'Family cheesemaking operation in Panagitsa, Arcadia. The mapped business point is explicitly identified as a cheese factory and dairy-products retail outlet.',
  '+30 27960 41479', 'https://www.tsatsoulis.com.gr/', false,
  'verified_location', 'https://www.google.com/maps/search/?api=1&query=37.7559711%2C22.2236474',
  'Exact Google business point manually matched to the Panagitsa cheesemaking business. The same point is presented as both cheese factory and dairy-products retail outlet; production_site is retained as the primary role.',
  'not_publicly_confirmed', 'https://www.tsatsoulis.com.gr/',
  'The business point includes a retail role, but no current first-party factory tour or tasting programme was verified.',
  null, 'not_publicly_confirmed', null,
  'No reliable source-backed road-surface, width, or last-mile vehicle-suitability classification was verified; routing safety must fail closed.',
  null, 'https://www.google.com/maps/search/?api=1&query=37.7559711%2C22.2236474', 'production_site',
  array['Feta','Graviera']::text[]
),
(
  'argogal-koromichi-kefalari', 'ARGOGAL / Koromichi Family', 'cheese_dairy', 'peloponnese', 'Argolida', 'Kefalari, Argos', 37.5903119, 22.7124346,
  'Koromichi family cheesemaking in Kefalari, Argos.',
  'Family cheesemaking tradition dating to 1916, with modern 2,000 m² production facilities in Kefalari, Argos.',
  '+30 27510 86140 / +30 697 373 6600', 'https://www.argogal.gr/en/', false,
  'verified_location', 'https://www.google.com/maps/search/?api=1&query=37.5903119%2C22.7124346',
  'Exact Google business point manually matched to the ARGOGAL production facilities in Kefalari. The producer-controlled map link resolves to the same business identity.',
  'not_publicly_confirmed', 'https://www.argogal.gr/en/contact',
  'The production facilities are confirmed, but no current first-party public visit, tour, tasting, or walk-in procedure was verified.',
  null, 'not_publicly_confirmed', null,
  'No reliable source-backed road-surface, width, or last-mile vehicle-suitability classification was verified; routing safety must fail closed.',
  null, 'https://www.google.com/maps/search/?api=1&query=37.5903119%2C22.7124346', 'production_site',
  array['feta','graviera','kefalotyri','myzithra']::text[]
),
(
  'iliakis-dairy-kato-mallaki', 'Iliakis Dairy / Meraki Iliaki', 'cheese_dairy', 'crete', 'Rethymno', 'Kato Mallaki', 35.2847797, 24.4135176,
  'Traditional dairy production in Kato Mallaki, Rethymno.',
  'Iliakis S.A., operating since 1974, is an integrated traditional dairy-production unit in Kato Mallaki, Rethymno using sheep, goat, or mixed milk from local livestock farmers.',
  '+30 28310 58908', 'https://iliakisdairy.gr/', false,
  'verified_location', 'https://ilektronikoskatalogos.gr/item/tirokomeio-kato-malaki-rethimnou-meraki-ilaki/',
  'The exact coordinate was independently published alongside the same Iliakis business identity and website, and manually cross-checked against the producer-controlled Kato Mallaki address. A dedicated Google Business Place ID was not verified.',
  'not_publicly_confirmed', 'https://iliakisdairy.gr/',
  'The producer confirms the dairy-production unit and contact address, but no current public visit, tour, tasting, or walk-in procedure was verified.',
  null, 'not_publicly_confirmed', null,
  'No reliable source-backed road-surface, width, or last-mile vehicle-suitability classification was verified; routing safety must fail closed.',
  null, 'https://www.google.com/maps/search/?api=1&query=35.2847797%2C24.4135176', 'production_site',
  null
)
on conflict (id) do nothing;
