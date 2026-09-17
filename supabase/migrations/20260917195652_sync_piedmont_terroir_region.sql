-- Sync Piedmont / Piemonte into the canonical terroir_regions table.
-- Applied to production as Supabase migration 20260917195652.
-- Eurostat/GISCO NUTS 2024 NUTS-2 ITC1, EPSG:4326, 1:3M generalized geometry.

CREATE TEMP TABLE _terroir_http_state (had_http boolean) ON COMMIT DROP;
INSERT INTO _terroir_http_state
SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'http');

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'http') THEN
    EXECUTE 'CREATE EXTENSION http WITH SCHEMA extensions';
  END IF;
END $$;

WITH response AS (
  SELECT *
  FROM extensions.http_get(
    'https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/NUTS_RG_03M_2024_4326_LEVL_2.geojson'
  )
), payload AS (
  SELECT content::jsonb AS doc
  FROM response
  WHERE status = 200
), feature AS (
  SELECT f.value AS feature
  FROM payload,
       LATERAL jsonb_array_elements(doc -> 'features') AS f(value)
  WHERE f.value -> 'properties' ->> 'NUTS_ID' = 'ITC1'
)
INSERT INTO public.terroir_regions (
  id, name, greek_name, country_code, destination,
  nuts_code, nuts_version, nuts_level,
  center_lat, center_lng, geometry, source_url, boundary_attribution
)
SELECT
  'piedmont', 'Piedmont', NULL, 'IT', 'piedmont',
  'ITC1', 2024, 2,
  ST_Y(ST_PointOnSurface(g.geom)),
  ST_X(ST_PointOnSurface(g.geom)),
  g.geom,
  'https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/NUTS_RG_03M_2024_4326_LEVL_2.geojson',
  'Boundary: Eurostat/GISCO NUTS 2024, NUTS-2 ITC1, EPSG:4326, 1:3M generalized geometry.'
FROM feature,
LATERAL (
  SELECT ST_Multi(
    ST_SetSRID(ST_GeomFromGeoJSON((feature -> 'geometry')::text), 4326)
  )::geometry(MultiPolygon, 4326) AS geom
) AS g
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  country_code = EXCLUDED.country_code,
  destination = EXCLUDED.destination,
  nuts_code = EXCLUDED.nuts_code,
  nuts_version = EXCLUDED.nuts_version,
  nuts_level = EXCLUDED.nuts_level,
  center_lat = EXCLUDED.center_lat,
  center_lng = EXCLUDED.center_lng,
  geometry = EXCLUDED.geometry,
  source_url = EXCLUDED.source_url,
  boundary_attribution = EXCLUDED.boundary_attribution,
  updated_at = NOW();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.terroir_regions
    WHERE id = 'piedmont' AND nuts_code = 'ITC1'
  ) THEN
    RAISE EXCEPTION 'GISCO feature ITC1 was not found; Piedmont was not imported';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT (SELECT had_http FROM _terroir_http_state LIMIT 1) THEN
    EXECUTE 'DROP EXTENSION IF EXISTS http';
  END IF;
END $$;
