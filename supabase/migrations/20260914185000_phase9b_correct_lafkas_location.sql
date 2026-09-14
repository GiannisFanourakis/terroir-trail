-- Phase 9B: correct Lafkas Brewery location and persist verified Google Place ID.
-- Evidence reviewed 2026-09-14:
-- - Google Places candidate for Lafkas Brewery in Pazinos, Chania
-- - Producer-owned Lafkas Brewery website confirms Pazinos 73100 Chania
-- Previous TerroirTrail pin was stale/wrong by approximately 12.8 km.

UPDATE public.producers
SET
  lat = 35.5182760,
  lng = 24.1244784,
  google_place_id = 'ChIJSSvI3YiHnBQRBtbO7K4u444',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Lafkas%20Brewery%2C%20Pazinos%20731%2000&query_place_id=ChIJSSvI3YiHnBQRBtbO7K4u444',
  location_status = 'verified_location',
  location_source_url = 'https://www.google.com/maps/search/?api=1&query=Lafkas%20Brewery%2C%20Pazinos%20731%2000&query_place_id=ChIJSSvI3YiHnBQRBtbO7K4u444',
  location_notes = 'Phase 9B correction (2026-09-14): previous TerroirTrail pin was stale/wrong by about 12.8 km. Google Places audit resolved the Lafkas Brewery business in Pazinos at 35.5182760, 24.1244784 (Place ID ChIJSSvI3YiHnBQRBtbO7K4u444), and the producer-owned Lafkas Brewery website independently confirms the current address as Pazinos 73100 Chania. Location verified at business-property level; entrance-level precision has not been separately established.'
WHERE id = 'lafkas-brewery';
