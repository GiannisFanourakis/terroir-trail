-- =====================================================================
-- TERROIR TRAIL: Close Remaining Supabase Security Housekeeping
-- Migration: 20260913000000_close_security_housekeeping_and_geo_search_paths.sql
-- Supabase Project: eoenugkkzmzsrzclvdhl
--
-- Actions:
-- 1. Remove the single known pre-migration probe booking:
--    id: dd42c890-fc63-4478-9f7d-32fa7c693e6e
--
-- 2. Fix mutable search paths on TerroirTrail-owned custom RPC functions:
--    - public.get_producers_in_viewport
--    - public.get_nearby_producers
--    Sets search_path = '' and fully qualifies all schema objects and
--    operators to resolve advisor warning 'function_search_path_mutable'.
--
-- Note on public.spatial_ref_sys:
--    public.spatial_ref_sys is a Supabase/PostGIS-managed table owned by
--    supabase_admin; the project database role (postgres) cannot alter it
--    to enable RLS. Attempting to change ownership or assume supabase_admin
--    is prohibited. The advisor is intentionally left unresolved pending a
--    supported Supabase/PostGIS platform remediation path and is treated as
--    documented managed-extension technical debt.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. REMOVE KNOWN TEST PROBE BOOKING ROW
-- ---------------------------------------------------------------------
DELETE FROM public.bookings
WHERE id = 'dd42c890-fc63-4478-9f7d-32fa7c693e6e';

-- ---------------------------------------------------------------------
-- 2. FIX CUSTOM GEO-FUNCTION SEARCH PATHS (SET search_path = '')
-- ---------------------------------------------------------------------

-- Viewport Bounding Box Query
CREATE OR REPLACE FUNCTION public.get_producers_in_viewport(
  min_lat DOUBLE PRECISION,
  min_lng DOUBLE PRECISION,
  max_lat DOUBLE PRECISION,
  max_lng DOUBLE PRECISION,
  filter_category TEXT DEFAULT NULL,
  filter_destination TEXT DEFAULT NULL,
  max_limit INTEGER DEFAULT 200
)
RETURNS SETOF public.producers
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT *
  FROM public.producers
  WHERE location OPERATOR(public.&&) public.ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)
    AND (filter_category IS NULL OR filter_category = 'all' OR category = filter_category)
    AND (filter_destination IS NULL OR filter_destination = 'all' OR destination = filter_destination)
  ORDER BY rating DESC, review_count DESC
  LIMIT max_limit;
$$;

-- Proximity Radius Search
CREATE OR REPLACE FUNCTION public.get_nearby_producers(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 30.0,
  filter_category TEXT DEFAULT NULL,
  filter_destination TEXT DEFAULT NULL,
  max_limit INTEGER DEFAULT 50
)
RETURNS SETOF public.producers
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT *
  FROM public.producers p
  WHERE public.ST_DWithin(
    p.location::public.geography,
    public.ST_SetSRID(public.ST_MakePoint(user_lng, user_lat), 4326)::public.geography,
    radius_km * 1000.0
  )
  AND (filter_category IS NULL OR filter_category = 'all' OR p.category = filter_category)
  AND (filter_destination IS NULL OR filter_destination = 'all' OR p.destination = filter_destination)
  ORDER BY public.ST_Distance(
    p.location::public.geography,
    public.ST_SetSRID(public.ST_MakePoint(user_lng, user_lat), 4326)::public.geography
  ) ASC
  LIMIT max_limit;
$$;
