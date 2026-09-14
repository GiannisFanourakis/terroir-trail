-- =====================================================================
-- TERROIR TRAIL: Phase 9A — Verified Google Place IDs
-- Migration: 20260914170000_phase9a_verified_google_place_ids.sql
--
-- Trust invariant:
-- - Google Place IDs are manually audited business-identity references.
-- - They are never inferred from coordinates or reverse geocoding.
-- - Null means no verified Google business mapping is available.
-- - Google imagery remains separately feature-gated in the application.
-- =====================================================================

ALTER TABLE public.producers
  ADD COLUMN IF NOT EXISTS google_place_id text;

COMMENT ON COLUMN public.producers.google_place_id IS
  'Manually audited Google Maps Place ID for live Google Places UI Kit media. Null unless the business identity has been verified; never inferred from coordinates.';

UPDATE public.producers
SET google_place_id = CASE id
  WHEN 'lyrarakis-winery' THEN 'ChIJa95IFTf0mhQRY5TF5uhxJoU'
  WHEN 'peskesi-farm-kazani' THEN 'ChIJg4hwRwthmhQRBF4b9YPGsZU'
  WHEN 'cretan-brewery-charma' THEN 'ChIJQ7fRzLOLnBQRWaCt5UX2izE'
  WHEN 'biolea-estate' THEN 'ChIJ_U9uyrr0nBQRPiI3ZYRHH2M'
  WHEN 'stathakis-honey-park' THEN 'ChIJ-bttLbr1nBQRqwEUhZIfplM'
END
WHERE id IN (
  'lyrarakis-winery',
  'peskesi-farm-kazani',
  'cretan-brewery-charma',
  'biolea-estate',
  'stathakis-honey-park'
);

CREATE UNIQUE INDEX IF NOT EXISTS producers_google_place_id_unique
  ON public.producers (google_place_id)
  WHERE google_place_id IS NOT NULL;
