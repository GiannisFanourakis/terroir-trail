-- Phase 6: road/access confidence must be independent from location confidence.
-- Unknown road access stays NULL; classifications require explicit evidence.

ALTER TABLE public.producers
  ALTER COLUMN road_access DROP DEFAULT;

ALTER TABLE public.producers
  DROP CONSTRAINT IF EXISTS producers_road_access_check;

ALTER TABLE public.producers
  ADD CONSTRAINT producers_road_access_check
  CHECK (
    road_access IS NULL OR road_access IN (
      'paved',
      'narrow_paved',
      'gravel_ok',
      'high_clearance_recommended',
      '4x4_required'
    )
  );

ALTER TABLE public.producers
  ADD COLUMN IF NOT EXISTS road_access_status TEXT NOT NULL DEFAULT 'unreviewed',
  ADD COLUMN IF NOT EXISTS road_access_source_url TEXT,
  ADD COLUMN IF NOT EXISTS road_access_notes TEXT;

ALTER TABLE public.producers
  DROP CONSTRAINT IF EXISTS producers_road_access_status_check;

ALTER TABLE public.producers
  ADD CONSTRAINT producers_road_access_status_check
  CHECK (road_access_status IN ('unreviewed', 'verified', 'current_access_uncertain'));

ALTER TABLE public.producers
  DROP CONSTRAINT IF EXISTS producers_verified_road_access_requires_classification;

ALTER TABLE public.producers
  ADD CONSTRAINT producers_verified_road_access_requires_classification
  CHECK (road_access_status <> 'verified' OR road_access IS NOT NULL);
