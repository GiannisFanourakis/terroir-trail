-- Phase 10A Santorini trust-data cleanup, 2026-09-15.
--
-- Rules:
-- - remove legacy synthetic ratings/pricing/hospitality claims and stock imagery;
-- - keep Google-audited locations and Place IDs from the preceding audit;
-- - visitor status is source-backed and independent from partnership status;
-- - road access remains unclassified unless a source explicitly supports surface/width/suitability;
-- - Experiences remain dormant and are not activated here.

BEGIN;

-- Neutralize legacy synthetic fields across the Santorini catalogue first.
UPDATE public.producers
SET
  cover_image = NULL,
  gallery = ARRAY[]::TEXT[],
  tasting_highlights = ARRAY[]::TEXT[],
  ethos = ARRAY[]::TEXT[],
  food_option = NULL,
  dog_friendly = NULL,
  kid_friendly = NULL,
  walk_in_friendly = NULL,
  campervan_friendly = NULL,
  price_level = NULL,
  rating = NULL,
  review_count = NULL,
  vip_perks = NULL,
  best_season = NULL
WHERE destination = 'santorini';

UPDATE public.producers SET
  village = 'Messaria',
  phone = '+30 22860 31573',
  website = 'https://www.canavasantorini.com',
  tag_line = 'A family distillery and museum in Messaria, making Santorini ouzo and tsikoudia since 1974',
  description = 'Canava Santorini Distillery in Messaria combines a working spirits producer with a museum devoted to Santorini''s distilling and vineyard culture. The operation began in 1974 and remains associated with the Lygnos family.',
  story = 'Evangelos Lygnos founded the distillery in 1974 after learning the craft of ouzo making and working in Santorini wine. His son Loukas later continued the family operation and assembled historic tools, workshops and everyday objects into the museum beside the distillery.',
  indigenous_varieties = ARRAY[]::TEXT[],
  opening_hours = 'Contact the distillery before visiting; current visitor hours are not confirmed on a producer-controlled page',
  visit_status = 'not_publicly_confirmed',
  visit_source_url = 'https://www.greekgastronomyguide.gr/en/item/canava-santorini-distillery/',
  visit_notes = 'Current independent sources support the operating distillery/museum identity and public visitor use, but a current producer-controlled visitor page was not verified. Contact the distillery before making a special trip.',
  road_access_source_url = 'https://www.canavasantorini.com',
  road_access_notes = 'Phase 10A review (2026-09-15): the verified Google business location does not establish road surface, width, condition, or rental-car suitability. No explicit producer-backed road classification was found, so road type remains unpublished.'
WHERE id = 'canava-santorini-distillery';

UPDATE public.producers SET
  village = 'Baxes, Oia',
  phone = '+30 22860 71644',
  website = 'https://sigalas-wine.com',
  tag_line = 'Paris Sigalas'' Oia estate, pairing Santorini tradition with a long-running focus on Assyrtiko',
  description = 'Domaine Sigalas sits among vineyards on the plain of Oia. The estate''s operation began with Paris Sigalas'' 1991 Santorini vintage and today its visitor area offers tastings and food-and-wine experiences by advance reservation.',
  story = 'Paris Sigalas moved from family vineyard work into professional winemaking, bringing his background in mathematics and an experimental approach to viticulture and oenology. The estate describes its guiding idea as the dynamic evolution of tradition.',
  indigenous_varieties = ARRAY['Assyrtiko','Aidani','Athiri','Mavrotragano','Mandilaria']::TEXT[],
  opening_hours = 'Advance booking required for every visit; check the current 2026 timetable on the official site',
  visit_status = 'appointment_only',
  visit_source_url = 'https://sigalas-wine.com/',
  visit_notes = 'Domaine Sigalas explicitly states that any visit requires advance booking. The official contact page publishes current seasonal tasting hours and a dedicated tasting-room contact.',
  road_access_source_url = 'https://sigalas-wine.com/contact-en/',
  road_access_notes = 'Official sources verify the Baxes, Oia address but do not publish road-surface, width, condition, or rental-car suitability. Road type remains unpublished.'
WHERE id = 'domaine-sigalas-santorini';

UPDATE public.producers SET
  village = 'Episkopi Gonia',
  phone = '+30 22860 31489',
  website = 'https://estateargyros.com',
  tag_line = 'Four generations of Estate Argyros in Episkopi, rooted in Santorini''s old vineyards',
  description = 'Established in 1903, Estate Argyros combines a long family winegrowing history with a modern winery in Episkopi Gonia. The estate works extensively with old Santorini vines and offers guided winery and vineyard tastings.',
  story = 'The Argyros family was making wine before the formal estate was established in 1903. Today the fourth generation leads the estate, which says its vineyard holdings exceed 120 hectares and include parcels more than two centuries old.',
  indigenous_varieties = ARRAY['Assyrtiko']::TEXT[],
  opening_hours = 'Open year-round except national holidays; tour schedule varies and advance booking is recommended',
  visit_status = 'public_visits',
  visit_source_url = 'https://estateargyros.com/faq/',
  visit_notes = 'The winery welcomes visitors and says reservations are recommended rather than mandatory. Tour schedules vary by day and season, so visitors should check current availability before travelling.',
  road_access_source_url = 'https://estateargyros.com/faq/',
  road_access_notes = 'Estate Argyros states that guests arrive by private car, transfer, taxi or bus and that on-site parking is available. This confirms practical vehicle access but does not establish road surface, width or rental-car suitability, so no road type is published.'
WHERE id = 'estate-argyros-santorini';

UPDATE public.producers SET
  village = 'Vrachies, Exo Gonia',
  phone = '+30 22860 34186',
  website = 'https://gaiawines.gr',
  tag_line = 'A seaside Santorini winery in a restored tomato-processing building at Vrachies',
  description = 'GAIA''s Santorini winery sits on the eastern coast at Vrachies of Exo Gonia, between Kamari and Monolithos. The winery occupies a restored early-20th-century tomato-processing building and focuses its Santorini work on Assyrtiko.',
  story = 'GAIA adapted the old industrial building into its Santorini winery, placing contemporary production beside a visible piece of the island''s agricultural history. The visitor programme runs seasonally and includes guided tastings.',
  indigenous_varieties = ARRAY['Assyrtiko']::TEXT[],
  opening_hours = '29 Apr-31 Oct 2026: daily 12:00-20:00; advance online booking recommended',
  visit_status = 'seasonal_public',
  visit_source_url = 'https://gaiawines.gr/en/visit-santorini-en/',
  visit_notes = 'GAIA publishes a 2026 visitor season from 29 April to 31 October, daily 12:00-20:00. Advance online booking is recommended, especially in peak summer.',
  road_access_source_url = 'https://gaiawines.gr/en/visit-santorini-en/',
  road_access_notes = 'The official visitor page verifies the winery at Vrachies of Exo Gonia and describes its position between Kamari and Monolithos. It does not classify road surface, width, condition or rental-car suitability, so no road type is published.'
WHERE id = 'gaia-wines-santorini';

UPDATE public.producers SET
  village = 'Megalochori',
  phone = '+30 22860 82552',
  website = 'https://www.gavalaswines.gr',
  tag_line = 'Five generations of family winemaking in Megalochori''s traditional canava',
  description = 'Gavalas Winery is a family winery in Megalochori, operating in a traditional stone canava alongside a modern production section. Its range centers on Santorini''s indigenous grapes, including Assyrtiko and the rare Katsano and Voudomato.',
  story = 'The family traces winemaking at the site to the late 18th century and today identifies George Gavalas as the fourth-generation winemaker, with Vagelis representing the fifth. The winery opened to visitors in 2004 and preserves its older cellars and grape-stomping spaces.',
  indigenous_varieties = ARRAY['Assyrtiko','Aidani','Mandilaria','Mavrotragano','Katsano','Voudomato']::TEXT[],
  opening_hours = 'April-October: daily 11:00-19:00',
  visit_status = 'seasonal_public',
  visit_source_url = 'https://www.gavalaswines.gr/wine-tasting',
  visit_notes = 'Gavalas publishes wine tastings and winery tours from April through October, 11:00-19:00. This is producer-operated visitor service and not a TerroirTrail Experience.',
  road_access_source_url = 'https://www.gavalaswines.gr/contact',
  road_access_notes = 'The official site verifies the Megalochori winery address but does not publish road-surface, width, condition or rental-car suitability. Road type remains unpublished.'
WHERE id = 'gavalas-winery-santorini';

UPDATE public.producers SET
  region = 'Santorini',
  village = 'Pyrgos',
  phone = '+30 22860 28058',
  website = 'https://santowines.gr',
  tag_line = 'Santorini''s cooperative winery and year-round wine-tourism center in Pyrgos',
  description = 'Santo Wines is the island''s cooperative wine producer, with its winery and Wine Tourism Center in Pyrgos. The visitor center operates year-round and brings together winery tours, tastings, a shop, restaurant and local agricultural products.',
  story = 'The cooperative structure dates to 1947, while the modern Pyrgos winery and wine-tourism facilities were developed in the early 1990s. Santo Wines links wine production with other Santorini products such as fava, tomato and capers.',
  indigenous_varieties = ARRAY['Assyrtiko','Aidani','Athiri','Mavrotragano']::TEXT[],
  opening_hours = 'Wine Tourism Center open year-round; individual service hours vary, so check the official site before visiting',
  visit_status = 'public_visits',
  visit_source_url = 'https://santowines.gr/visit-us',
  visit_notes = 'Santo Wines states that its Wine Tourism Center in Pyrgos is open all year. Winery tours, tastings, restaurant and shop services are producer-operated; reservations may apply to specific activities.',
  road_access_source_url = 'https://santowines.gr/contact/company',
  road_access_notes = 'Official sources verify the Wine Tourism Center in Pyrgos and publish dedicated visitor/reservation contacts, but do not classify road surface, width, condition or rental-car suitability. Road type remains unpublished.'
WHERE id = 'santo-wines-santorini';

UPDATE public.producers SET
  village = 'Mesa Gonia',
  phone = '+30 22860 30268',
  website = 'https://www.santorinibrewingcompany.gr',
  tag_line = 'A small Mesa Gonia brewery where visitors can taste Donkey beers above the brewhouse',
  description = 'Santorini Brewing Company operates in Mesa Gonia and welcomes visitors to a tasting area above the brewery. The producer''s current site says it has been brewing on Santorini since 2014.',
  story = 'The brewery built its identity around the Donkey beer range and a small visitor space connected directly to the working brewery. Because space is limited, the producer asks groups of four or more to arrange an appointment.',
  indigenous_varieties = ARRAY[]::TEXT[],
  opening_hours = 'Summer: Mon-Sat 11:30-17:00; Nov-Apr: weekdays 12:00-16:00; closed Sundays',
  visit_status = 'public_visits',
  visit_source_url = 'https://www.santorinibrewingcompany.gr/the-brewery',
  visit_notes = 'The brewery invites visitors to its tasting area. Groups of four or more are asked to make an appointment because space is limited; large groups cannot be accommodated.',
  road_access_source_url = 'https://www.santorinibrewingcompany.gr/the-brewery',
  road_access_notes = 'The producer verifies the brewery in Mesa Gonia but does not publish a road-surface, width, condition or rental-car classification. Road type remains unpublished.'
WHERE id = 'santorini-brewing-company';

UPDATE public.producers SET
  village = 'Vourvoulos',
  phone = '+30 22860 22211',
  website = 'https://vassaltis.com',
  tag_line = 'A modern Vourvoulos winery founded by Yannis Valambous around inherited family vineyards',
  description = 'Vassaltis Vineyards sits on the Vourvoulos-Oia peripheral road and offers wine experiences alongside lunch and dinner. The project grew from vineyards Yannis Valambous inherited from his father after he returned to Greece in 2010.',
  story = 'Valambous left a finance career in London and returned to Santorini to revive the family vineyards, building a winemaking team around a modern interpretation of the island''s wine tradition. The winery presents sustainability and continuity for the next generation as part of that approach.',
  indigenous_varieties = ARRAY[]::TEXT[],
  opening_hours = 'Daily 11:00-20:00; check reservation availability before visiting',
  visit_status = 'public_visits',
  visit_source_url = 'https://vassaltis.com/reservations/',
  visit_notes = 'Vassaltis publishes wine experiences, lunch and dinner together with an online reservation flow. Public visitor service is confirmed; unrestricted walk-in availability is not assumed.',
  road_access_source_url = 'https://vassaltis.com/contact/',
  road_access_notes = 'The official contact page identifies the winery on the Vourvoulos-Oia peripheral road, but does not publish road-surface, width, condition or rental-car suitability. Road type remains unpublished.'
WHERE id = 'vassaltis-vineyards';

UPDATE public.producers SET
  region = 'Santorini',
  village = 'Megalochori (Caldera)',
  phone = '+30 22860 21100',
  website = 'https://venetsanoswinery.com',
  tag_line = 'A 1947 gravity-designed winery carved into the caldera above Athinios',
  description = 'Venetsanos Winery was built by the Venetsanos family in 1947 above Athinios port. Its multi-level design used gravity to move wine through production when electricity and other energy sources were limited, and the historic winery now operates as a visitor and tasting venue.',
  story = 'The family built the winery downward through the caldera slope, using the site''s height as part of the production design. Visitors can tour the historic structure and taste wines on the main terrace; the producer recommends reservations because tables are often fully booked.',
  indigenous_varieties = ARRAY['Assyrtiko','Athiri','Aidani','Platani','Mavrotragano','Mandilaria']::TEXT[],
  opening_hours = 'Main Hall Terrace daily 11:00-20:00; Sunset Terrace May-Sep 18:00-22:00; last tasting pour 18:30',
  visit_status = 'public_visits',
  visit_source_url = 'https://venetsanoswinery.com/contact/',
  visit_notes = 'Venetsanos operates public tasting and tour service. The FAQ says visitors may turn up, but reservations are recommended because the winery is often fully booked.',
  road_access_source_url = 'https://venetsanoswinery.com/faq/',
  road_access_notes = 'The winery states that visitors can arrive by taxi, car or local bus from Fira. This supports practical access but does not classify road surface, width, condition or rental-car suitability, so no road type is published.'
WHERE id = 'venetsanos-winery-santorini';

-- Guardrail: Phase 10A must not activate producer Experiences.
UPDATE public.experiences
SET is_active = false
WHERE destination = 'santorini';

COMMIT;
