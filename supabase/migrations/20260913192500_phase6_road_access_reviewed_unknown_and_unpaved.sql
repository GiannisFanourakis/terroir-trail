-- Phase 6 follow-up: distinguish reviewed-but-unconfirmed access from unreviewed data,
-- and preserve explicit "passable unpaved" evidence without relabeling it as gravel.

ALTER TABLE public.producers
  DROP CONSTRAINT IF EXISTS producers_road_access_check;

ALTER TABLE public.producers
  ADD CONSTRAINT producers_road_access_check
  CHECK (
    road_access IS NULL OR road_access IN (
      'paved',
      'narrow_paved',
      'gravel_ok',
      'unpaved_passable',
      'high_clearance_recommended',
      '4x4_required'
    )
  );

ALTER TABLE public.producers
  DROP CONSTRAINT IF EXISTS producers_road_access_status_check;

ALTER TABLE public.producers
  ADD CONSTRAINT producers_road_access_status_check
  CHECK (
    road_access_status IN (
      'unreviewed',
      'verified',
      'not_publicly_confirmed',
      'current_access_uncertain'
    )
  );
