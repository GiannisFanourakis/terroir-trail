-- Phase 10A Santorini Google Place/location audit, 2026-09-15.
--
-- These coordinates and Place IDs were manually matched against Google Places
-- candidates and checked against the producer identity/locality audit.
-- A Google business point verifies the listing/location, not entrance-level
-- precision and not road-surface or rental-car suitability.
--
-- The legacy Santorini `road_access = 'paved'` values were never source-audited.
-- Clear them while touching the pins so a corrected map point cannot be mistaken
-- for a road-safety claim.

WITH audited (
  id,
  lat,
  lng,
  google_place_id,
  google_maps_url,
  location_notes
) AS (
  VALUES
    (
      'canava-santorini-distillery',
      36.3974300::double precision,
      25.4398730::double precision,
      'ChIJ5YMrxW_OmRQRk0po0X3EDuM',
      'https://www.google.com/maps/search/?api=1&query=Canava%20Museum%20Santorini&query_place_id=ChIJ5YMrxW_OmRQRk0po0X3EDuM',
      'Phase 10A manual Google Places audit (2026-09-15): matched Canava Museum Santorini in Mesaria to the operating Canava Santorini distillery/museum identity. Stored pin updated to the Google business point; entrance-level precision is not separately established.'
    ),
    (
      'domaine-sigalas-santorini',
      36.4714413::double precision,
      25.3941458::double precision,
      'ChIJu7u3b4DLmRQRpxve6-VHUd0',
      'https://www.google.com/maps/search/?api=1&query=Domaine%20Sigalas&query_place_id=ChIJu7u3b4DLmRQRpxve6-VHUd0',
      'Phase 10A manual Google Places audit (2026-09-15): matched Domaine Sigalas in Baxes/Oia to the current producer identity and official locality. Stored pin updated to the Google business point; entrance-level precision is not separately established.'
    ),
    (
      'estate-argyros-santorini',
      36.3830929::double precision,
      25.4647308::double precision,
      'ChIJD8Ll3xfOmRQRDhaOcljaawQ',
      'https://www.google.com/maps/search/?api=1&query=Estate%20Argyros&query_place_id=ChIJD8Ll3xfOmRQRDhaOcljaawQ',
      'Phase 10A manual Google Places audit (2026-09-15): matched Estate Argyros in Episkopi Gonias to the current producer identity and official locality. Stored pin updated to the Google business point; entrance-level precision is not separately established.'
    ),
    (
      'gaia-wines-santorini',
      36.3913453::double precision,
      25.4857922::double precision,
      'ChIJxwtdmPDRmRQRvv2sLef21bU',
      'https://www.google.com/maps/search/?api=1&query=Gaia%20Winery%20Santorini&query_place_id=ChIJxwtdmPDRmRQRvv2sLef21bU',
      'Phase 10A manual Google Places audit (2026-09-15): matched Gaia Winery Santorini at Vrachies/Exo Gonia to the current producer identity and official visitor locality. Stored pin updated to the Google business point; entrance-level precision is not separately established.'
    ),
    (
      'gavalas-winery-santorini',
      36.3755559::double precision,
      25.4305407::double precision,
      'ChIJtTl4tVbOmRQR3jJOJZ5Hrac',
      'https://www.google.com/maps/search/?api=1&query=Gavalas%20Winery&query_place_id=ChIJtTl4tVbOmRQR3jJOJZ5Hrac',
      'Phase 10A manual Google Places audit (2026-09-15): matched Gavalas Winery in Megalochori to the current producer identity and official locality. Stored pin updated to the Google business point; entrance-level precision is not separately established.'
    ),
    (
      'santorini-brewing-company',
      36.3841336::double precision,
      25.4644929::double precision,
      'ChIJ30mo9xjOmRQRSFZDLJsvVy4',
      'https://www.google.com/maps/search/?api=1&query=Santorini%20Brewing%20Company&query_place_id=ChIJ30mo9xjOmRQRSFZDLJsvVy4',
      'Phase 10A manual Google Places audit (2026-09-15): selected the Google candidate named Santorini Brewing Company, matching the producer official identity and Mesa Gonia locality. The nearby Donkey brewery listing was not persisted. Stored pin updated to the Google business point; entrance-level precision is not separately established.'
    ),
    (
      'vassaltis-vineyards',
      36.4425450::double precision,
      25.4376770::double precision,
      'ChIJVX4lYq_NmRQR1_VKq8vhjd8',
      'https://www.google.com/maps/search/?api=1&query=Vassaltis%20Vineyards&query_place_id=ChIJVX4lYq_NmRQR1_VKq8vhjd8',
      'Phase 10A manual Google Places audit (2026-09-15): matched Vassaltis Vineyards in Vourvoulos to the current producer identity and official locality. Stored pin updated to the Google business point; entrance-level precision is not separately established.'
    ),
    (
      'santo-wines-santorini',
      36.3875640::double precision,
      25.4367460::double precision,
      'ChIJFbhZ3F7OmRQReOlBpwauSzg',
      'https://www.google.com/maps/search/?api=1&query=Santo%20Wines&query_place_id=ChIJFbhZ3F7OmRQReOlBpwauSzg',
      'Phase 10A manual Google Places audit (2026-09-15): matched Santo Wines in Pyrgos to the current cooperative wine-tourism identity and official locality. Stored pin updated to the Google business point; entrance-level precision is not separately established.'
    ),
    (
      'venetsanos-winery-santorini',
      36.3823401::double precision,
      25.4315203::double precision,
      'ChIJTy6LeFnOmRQRkX31v9sqMWo',
      'https://www.google.com/maps/search/?api=1&query=Venetsanos%20Winery&query_place_id=ChIJTy6LeFnOmRQRkX31v9sqMWo',
      'Phase 10A manual Google Places audit (2026-09-15): matched Venetsanos Winery on the Megalochori caldera to the current producer identity and official locality. Stored pin updated to the Google business point; entrance-level precision is not separately established.'
    )
)
UPDATE public.producers AS p
SET
  lat = audited.lat,
  lng = audited.lng,
  google_place_id = audited.google_place_id,
  google_maps_url = audited.google_maps_url,
  location_status = 'verified_location',
  location_source_url = audited.google_maps_url,
  location_notes = audited.location_notes,
  road_access = NULL,
  road_access_status = 'not_publicly_confirmed',
  road_access_source_url = p.website,
  road_access_notes = 'Phase 10A review (2026-09-15): correcting a Google business pin does not establish road surface, width, condition, or rental-car suitability. No explicit source-backed road classification has been retained.',
  updated_at = NOW()
FROM audited
WHERE p.id = audited.id
  AND p.destination = 'santorini';
