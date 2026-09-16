-- Phase 13 Google Places media follow-up.
--
-- Christakis / Patria Feta:
--   Verified Google business identity matches the audited production site and
--   producer phone/address at Proastio, Edessa.
--
-- Baladinos & Sons:
--   The audited coordinate 35.5133795, 24.0162928 resolves to the producer-owned
--   central store at Skalidi 25, Chania, not the separate Varypetro factory.
--   First-party contact/history pages explicitly distinguish those two sites.
--   Keep the verified public point, but classify it honestly as producer_shop.

UPDATE public.producers
SET
  google_place_id = 'ChIJCxu6c1q7VxMRnLTFClGoPmM',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=40.783506%2C22.060069&query_place_id=ChIJCxu6c1q7VxMRnLTFClGoPmM',
  updated_at = now()
WHERE id = 'christakis-patria-feta-proastio'
  AND location_status IN ('verified_location', 'verified_entrance');

UPDATE public.producers
SET
  village = 'Chania',
  public_point_type = 'producer_shop',
  google_place_id = 'ChIJq117gb19nBQR0We4DTt-XNc',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=35.5133795%2C24.0162928&query_place_id=ChIJq117gb19nBQR0We4DTt-XNc',
  location_source_url = 'https://www.balantinos.gr/en/contact/',
  location_notes = 'Verified producer-owned central store at Skalidi 25, Chania. First-party sources place the production factory separately in Varypetro Kydonias; an exact persistent factory Place ID is not established, so this mapped public point is explicitly classified as producer_shop rather than production_site.',
  updated_at = now()
WHERE id = 'baladinos-dairy-varipetro'
  AND lat = 35.5133795
  AND lng = 24.0162928;
