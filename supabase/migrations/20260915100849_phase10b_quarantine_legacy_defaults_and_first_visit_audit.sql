-- Phase 10B trust quarantine and first identity/visitability pass.
-- Peloponnese + Northern Greece + Tuscany / Italy.
--
-- Goals:
-- 1. Remove schema defaults that can manufacture unsupported producer facts.
-- 2. Quarantine all legacy Phase 10B media, hospitality, commercial and road claims.
-- 3. Fail closed on exact location until the separate manual Google/location audit.
-- 4. Apply only source-backed contact/visitability decisions from current first-party evidence.
--
-- This migration does NOT verify Google Place IDs, exact locations or road access.

ALTER TABLE public.producers
  ALTER COLUMN food_option DROP DEFAULT,
  ALTER COLUMN dog_friendly DROP DEFAULT,
  ALTER COLUMN kid_friendly DROP DEFAULT,
  ALTER COLUMN walk_in_friendly DROP DEFAULT,
  ALTER COLUMN campervan_friendly DROP DEFAULT,
  ALTER COLUMN price_level DROP DEFAULT,
  ALTER COLUMN rating DROP DEFAULT,
  ALTER COLUMN review_count DROP DEFAULT;

-- Quarantine the legacy Phase 10B rows before applying reviewed exceptions.
UPDATE public.producers
SET
  cover_image = NULL,
  gallery = ARRAY[]::text[],
  tasting_highlights = ARRAY[]::text[],
  opening_hours = NULL,
  best_season = NULL,
  food_option = NULL,
  dog_friendly = NULL,
  kid_friendly = NULL,
  walk_in_friendly = NULL,
  campervan_friendly = NULL,
  price_level = NULL,
  rating = NULL,
  review_count = NULL,
  vip_perks = NULL,
  road_access = NULL,
  road_access_status = 'unreviewed',
  road_access_source_url = NULL,
  road_access_notes = NULL,
  location_status = 'unresolved',
  location_source_url = NULL,
  location_notes = 'Phase 10B: legacy coordinates retained for audit reference only; exact public navigation point not yet independently verified.',
  google_maps_url = NULL,
  google_place_id = NULL,
  visit_status = 'not_publicly_confirmed',
  visit_source_url = NULL,
  visit_notes = 'Phase 10B first-pass review: ordinary public visitor access not yet confirmed from current first-party evidence.'
WHERE destination IN ('peloponnese', 'northern_greece', 'tuscany');

-- Northern Greece: strong current first-party visit evidence.
UPDATE public.producers
SET visit_status = 'appointment_only',
    visit_source_url = 'https://ktima-pavlidis.gr/en/contact-2/',
    visit_notes = 'Current first-party site welcomes visits six days per week upon communication. Confirm the current schedule directly before travel.',
    opening_hours = 'Visits upon communication; Mon-Fri 10:00-16:00, Sat 10:00-14:00, Sun closed.'
WHERE id = 'ktima-pavlidis';

UPDATE public.producers
SET visit_status = 'appointment_only',
    visit_source_url = 'https://alpha-estate.com/visit/',
    visit_notes = 'Current first-party visit page publishes daily/weekend visits upon request. Reservation/contact required before travel.',
    opening_hours = 'Visits upon request: daily and weekends 10:00-17:00.'
WHERE id = 'alpha-estate';

UPDATE public.producers
SET visit_status = 'appointment_only',
    visit_source_url = 'https://bibliachora.gr/en/visit-the-estate/',
    visit_notes = 'Current first-party visit page publishes estate visits Monday-Friday upon request.',
    opening_hours = 'Visits upon request: Mon-Fri 10:00-14:00.'
WHERE id = 'domaine-biblia-chora';

UPDATE public.producers
SET visit_status = 'appointment_only',
    visit_source_url = 'https://kiryianni.gr/visit/',
    visit_notes = 'Current first-party Naoussa visitor programme requires reservations.',
    opening_hours = 'Tue-Sun 11:00-18:00; Mon closed; reservations necessary.'
WHERE id = 'kir-yianni-naoussa';

UPDATE public.producers
SET phone = '+30 2331 093 604',
    visit_status = 'not_publicly_confirmed',
    visit_source_url = 'https://www.thymiopoulosvineyards.gr/',
    visit_notes = 'Producer identity and current contact are first-party verified, but no current public visitor programme was found in the Phase 10B first pass.',
    opening_hours = NULL
WHERE id = 'thymiopoulos-naoussa';

UPDATE public.producers
SET website = 'https://www.sirisbrewery.com/',
    phone = '+30 2321 099 949',
    visit_status = 'not_publicly_confirmed',
    visit_source_url = 'https://www.sirisbrewery.com/en/contact-us/',
    visit_notes = 'Current first-party site explicitly welcomes brewery tours, but ordinary visit hours and booking rules were not published clearly enough to classify normal public access. Contact the brewery first.',
    opening_hours = NULL
WHERE id = 'siris-craft-brewery';

UPDATE public.producers
SET phone = '+30 23920 44567',
    visit_status = 'public_visits',
    visit_source_url = 'https://gerovassiliou.gr/en/contact',
    visit_notes = 'Current first-party site publishes public opening times for the estate and Wine Museum. Group and school visits require advance booking.',
    opening_hours = 'Mon, Thu, Fri 10:00-16:00; Wed 13:00-19:00; Sat-Sun 11:00-17:00; Tue closed.'
WHERE id = 'ktima-gerovassiliou';

UPDATE public.producers
SET website = 'https://www.sknipa.beer/',
    phone = '+30 2310 463 444',
    visit_status = 'not_publicly_confirmed',
    visit_source_url = 'https://www.sknipa.beer/en/facilities',
    visit_notes = 'Current first-party facility/contact details are verified. Event-specific Open Breweries participation does not establish ordinary year-round public access.',
    opening_hours = NULL
WHERE id = 'propator-sknipa-brewery';

UPDATE public.producers
SET visit_status = 'not_publicly_confirmed',
    visit_source_url = 'https://karanika.com/',
    visit_notes = 'Current first-party site verifies the producer identity and Amyndeo operation, but the Phase 10B first pass found no current public visitor programme or booking terms.',
    opening_hours = NULL
WHERE id = 'domaine-karanika';

-- Peloponnese: source-backed contact/visitability decisions.
UPDATE public.producers
SET phone = '+30 261 600 7652',
    visit_status = 'not_publicly_confirmed',
    visit_source_url = 'https://kykao.gr/',
    visit_notes = 'Current first-party site exposes a Tap Room / Visit Tap Room entry point, but dependable current opening or booking terms were not established in the first pass. Contact directly before travel.',
    opening_hours = NULL
WHERE id = 'kykao-handcrafted-beers';

UPDATE public.producers
SET visit_status = 'not_publicly_confirmed',
    visit_source_url = 'https://www.tetramythoswines.com/en/',
    visit_notes = 'Current first-party site identifies the winery as visitable and advertises guided tours, but current operating/booking terms require further confirmation.',
    opening_hours = NULL
WHERE id = 'tetramythos-winery';

UPDATE public.producers
SET visit_status = 'appointment_only',
    visit_source_url = 'https://tselepos.gr/%CE%B5%CF%80%CE%B9%CF%83%CE%BA%CE%B5%CF%86%CF%84%CE%B5%CE%AF%CF%84%CE%B5-%CE%BC%CE%B1%CF%82/?lang=en',
    visit_notes = 'Current first-party visitor page states that tours are available by appointment.',
    opening_hours = 'Tours by appointment; contact estate for current available times.'
WHERE id = 'ktima-tselepos';

UPDATE public.producers
SET visit_status = 'current_access_uncertain',
    visit_source_url = 'https://www.mercouri.gr/brochure_en.pdf',
    visit_notes = 'Official Mercouri visitor material documents estate visits, tours and tastings, but the accessible first-party schedule is old. Confirm current visitor access directly before planning travel.',
    opening_hours = NULL
WHERE id = 'domaine-mercouri';

UPDATE public.producers
SET phone = '+30 2732 071 705',
    visit_status = 'appointment_only',
    visit_source_url = 'https://www.monemvasiawinery.gr/en/tour-tasting/',
    visit_notes = 'Current first-party tour page requires reservations for winery tours and tastings.',
    opening_hours = 'Tue-Sat 10:00-16:00; reservation required.'
WHERE id = 'monemvasia-winery';

UPDATE public.producers
SET phone = NULL,
    visit_status = 'not_publicly_confirmed',
    visit_source_url = 'https://www.liokareas.com/collections/harvest-trip-2026',
    visit_notes = 'Current first-party evidence supports a family olive-oil producer and an annual packaged harvest trip, not ordinary drop-in/public mill visitation. Entity type and exact Greek production/farm location require separate review.',
    opening_hours = NULL
WHERE id = 'liokareas-olive-estate';

UPDATE public.producers
SET visit_status = 'public_visits',
    visit_source_url = 'https://gaiawines.gr/en/visit-nemea-en/',
    visit_notes = 'Current first-party Nemea page publishes year-round visitor hours. Advance booking is recommended; walk-ins may be accommodated subject to availability.',
    opening_hours = 'Wed-Sun 10:30-16:30; Mon-Tue closed.'
WHERE id = 'gaia-wines-nemea';

UPDATE public.producers
SET visit_status = 'not_publicly_confirmed',
    visit_source_url = 'https://www.skouras.gr/',
    visit_notes = 'Producer identity/location and public contact are corroborated, but the Phase 10B first pass did not retrieve a sufficiently current first-party visitor page. Keep visitor access unconfirmed pending direct evidence.',
    opening_hours = NULL
WHERE id = 'skouras-winery-nemea';

UPDATE public.producers
SET visit_status = 'appointment_only',
    visit_source_url = 'https://www.semeliestate.gr/contact/',
    visit_notes = 'Current first-party site publishes wine-tourism programmes and requires booking before the visit.',
    opening_hours = 'Mon and Wed-Fri 10:00-16:00; Sat-Sun 11:00-17:00; Tue closed; booking mandatory.'
WHERE id = 'semeli-estate-nemea';

-- Tuscany: current first-party visit evidence.
UPDATE public.producers
SET visit_status = 'appointment_only',
    visit_source_url = 'https://www.monteraponi.it/contatti_azienda_agricola_monteraponi.php?lang=en',
    visit_notes = 'Current first-party contact page publishes tastings/visits Monday-Friday by advance booking.',
    opening_hours = 'Mon-Fri 09:00-17:00 by advance booking.'
WHERE id = 'monteraponi-tuscany';
