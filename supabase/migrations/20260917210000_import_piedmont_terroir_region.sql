-- Authoritative terroir region import: Piedmont / Piemonte, Italy
-- Eurostat/GISCO NUTS 2024 NUTS-2 boundary (ITC1).
--
-- The HTTP extension is enabled only for this migration so the authoritative
-- GISCO GeoJSON can be imported directly, then removed again.

CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.terroir_regions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  greek_name TEXT,
  country_code TEXT NOT NULL,
  destination TEXT NOT NULL UNIQUE,
  nuts_code TEXT UNIQUE,
  nuts_version INTEGER,
  nuts_level SMALLINT,
  center_lat DOUBLE PRECISION NOT NULL,
  center_lng DOUBLE PRECISION NOT NULL,
  geometry geometry(MultiPolygon, 4326) NOT NULL,
  source_url TEXT NOT NULL,
  boundary_attribution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_terroir_regions_geometry
  ON public.terroir_regions USING GIST (geometry);

ALTER TABLE public.terroir_regions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view terroir regions" ON public.terroir_regions;
CREATE POLICY "Public can view terroir regions"
  ON public.terroir_regions FOR SELECT
  USING (true);

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
  id,
  name,
  greek_name,
  country_code,
  destination,
  nuts_code,
  nuts_version,
  nuts_level,
  center_lat,
  center_lng,
  geometry,
  source_url,
  boundary_attribution
)
SELECT
  'piedmont',
  'Piedmont',
  NULL,
  'IT',
  'piedmont',
  'ITC1',
  2024,
  2,
  ST_Y(ST_PointOnSurface(g.geom)),
  ST_X(ST_PointOnSurface(g.geom)),
  g.geom,
  'https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/NUTS_RG_03M_2024_4326_LEVL_2.geojson',
  'Boundary: Eurostat/GISCO NUTS 2024, NUTS-2 ITC1, EPSG:4326, 1:3M.'
FROM feature,
LATERAL (
  SELECT ST_Multi(
    ST_SetSRID(
      ST_GeomFromGeoJSON((feature -> 'geometry')::text),
      4326
    )
  )::geometry(MultiPolygon, 4326) AS geom
) AS g
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  greek_name = EXCLUDED.greek_name,
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
    SELECT 1
    FROM public.terroir_regions
    WHERE id = 'piedmont'
  ) THEN
    RAISE EXCEPTION 'GISCO NUTS feature ITC1 was not found; Piedmont region was not imported';
  END IF;
END $$;

DROP EXTENSION IF EXISTS http;
