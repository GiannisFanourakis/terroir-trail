-- Reconcile the five legacy/base frontend destinations into the canonical
-- PostGIS terroir_regions table using their existing audited NUTS 2021 model.
-- Applied to production as Supabase migration 20260917200622.

CREATE TEMP TABLE _terroir_http_state (had_http boolean) ON COMMIT DROP;
INSERT INTO _terroir_http_state
SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'http');

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'http') THEN
    EXECUTE 'CREATE EXTENSION http WITH SCHEMA extensions';
  END IF;
END $$;

CREATE TEMP TABLE _gisco_2021_features (
  classification_level smallint NOT NULL,
  feature jsonb NOT NULL
) ON COMMIT DROP;

WITH response AS (
  SELECT * FROM extensions.http_get(
    'https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/NUTS_RG_03M_2021_4326_LEVL_2.geojson'
  )
), payload AS (
  SELECT content::jsonb AS doc FROM response WHERE status = 200
)
INSERT INTO _gisco_2021_features (classification_level, feature)
SELECT 2, f.value
FROM payload,
LATERAL jsonb_array_elements(doc -> 'features') AS f(value);

WITH response AS (
  SELECT * FROM extensions.http_get(
    'https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/NUTS_RG_03M_2021_4326_LEVL_3.geojson'
  )
), payload AS (
  SELECT content::jsonb AS doc FROM response WHERE status = 200
)
INSERT INTO _gisco_2021_features (classification_level, feature)
SELECT 3, f.value
FROM payload,
LATERAL jsonb_array_elements(doc -> 'features') AS f(value);

CREATE TEMP TABLE _single_base_targets (
  id text PRIMARY KEY,
  display_name text NOT NULL,
  country_code text NOT NULL,
  destination text NOT NULL,
  code text NOT NULL,
  level smallint NOT NULL,
  native_names jsonb NOT NULL DEFAULT '{}'::jsonb
) ON COMMIT DROP;

INSERT INTO _single_base_targets
(id, display_name, country_code, destination, code, level, native_names)
VALUES
  ('crete', 'Crete', 'GR', 'crete', 'EL43', 2, '{"el":"Κρήτη"}'),
  ('santorini', 'Santorini', 'GR', 'santorini', 'EL422', 3, '{"el":"Σαντορίνη"}'),
  ('peloponnese', 'Peloponnese', 'GR', 'peloponnese', 'EL65', 2, '{"el":"Πελοπόννησος"}'),
  ('tuscany', 'Tuscany', 'IT', 'tuscany', 'ITI1', 2, '{"it":"Toscana"}');

DO $$
DECLARE
  missing_codes text;
BEGIN
  SELECT string_agg(t.code, ', ' ORDER BY t.code)
  INTO missing_codes
  FROM _single_base_targets t
  LEFT JOIN _gisco_2021_features f
    ON f.classification_level = t.level
   AND f.feature -> 'properties' ->> 'NUTS_ID' = t.code
   AND f.feature -> 'properties' ->> 'CNTR_CODE' = CASE WHEN t.country_code = 'GR' THEN 'EL' ELSE t.country_code END
  WHERE f.feature IS NULL;

  IF missing_codes IS NOT NULL THEN
    RAISE EXCEPTION 'Expected GISCO 2021 base region code(s) not found: %', missing_codes;
  END IF;
END $$;

WITH matched AS (
  SELECT
    t.*,
    f.feature,
    CASE
      WHEN t.level = 2 THEN 'https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/NUTS_RG_03M_2021_4326_LEVL_2.geojson'
      ELSE 'https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/NUTS_RG_03M_2021_4326_LEVL_3.geojson'
    END AS source_url
  FROM _single_base_targets t
  JOIN _gisco_2021_features f
    ON f.classification_level = t.level
   AND f.feature -> 'properties' ->> 'NUTS_ID' = t.code
   AND f.feature -> 'properties' ->> 'CNTR_CODE' = CASE WHEN t.country_code = 'GR' THEN 'EL' ELSE t.country_code END
), geoms AS (
  SELECT
    m.*,
    ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON((m.feature -> 'geometry')::text), 4326))::geometry(MultiPolygon, 4326) AS geom
  FROM matched m
)
INSERT INTO public.terroir_regions (
  id, name, official_name, native_names, greek_name,
  country_code, destination,
  classification_system, classification_code, classification_codes,
  classification_version, classification_level,
  nuts_code, nuts_version, nuts_level,
  center_lat, center_lng, geometry, source_url, boundary_attribution
)
SELECT
  g.id,
  g.display_name,
  COALESCE(NULLIF(g.feature -> 'properties' ->> 'NAME_LATN', ''), NULLIF(g.feature -> 'properties' ->> 'NUTS_NAME', ''), g.display_name),
  g.native_names,
  NULL,
  g.country_code,
  g.destination,
  'NUTS',
  g.code,
  ARRAY[g.code],
  2021,
  g.level,
  g.code,
  2021,
  g.level,
  ST_Y(ST_PointOnSurface(g.geom)),
  ST_X(ST_PointOnSurface(g.geom)),
  g.geom,
  g.source_url,
  format('Boundary: Eurostat/GISCO NUTS 2021, NUTS-%s %s, EPSG:4326, 1:3M generalized geometry.', g.level, g.code)
FROM geoms g
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  official_name = EXCLUDED.official_name,
  native_names = EXCLUDED.native_names,
  country_code = EXCLUDED.country_code,
  destination = EXCLUDED.destination,
  classification_system = EXCLUDED.classification_system,
  classification_code = EXCLUDED.classification_code,
  classification_codes = EXCLUDED.classification_codes,
  classification_version = EXCLUDED.classification_version,
  classification_level = EXCLUDED.classification_level,
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
DECLARE
  expected_codes text[] := ARRAY['EL514','EL515','EL521','EL522','EL523','EL524','EL525','EL526','EL527','EL531','EL532','EL533'];
  found_count integer;
  composite_geom geometry(MultiPolygon,4326);
BEGIN
  SELECT count(*)
  INTO found_count
  FROM _gisco_2021_features
  WHERE classification_level = 3
    AND feature -> 'properties' ->> 'CNTR_CODE' = 'EL'
    AND feature -> 'properties' ->> 'NUTS_ID' = ANY(expected_codes);

  IF found_count <> cardinality(expected_codes) THEN
    RAISE EXCEPTION 'Expected % Northern Greece NUTS-3 features, found %', cardinality(expected_codes), found_count;
  END IF;

  SELECT ST_Multi(ST_UnaryUnion(ST_Collect(
    ST_SetSRID(ST_GeomFromGeoJSON((feature -> 'geometry')::text), 4326)
  )))::geometry(MultiPolygon,4326)
  INTO composite_geom
  FROM _gisco_2021_features
  WHERE classification_level = 3
    AND feature -> 'properties' ->> 'CNTR_CODE' = 'EL'
    AND feature -> 'properties' ->> 'NUTS_ID' = ANY(expected_codes);

  INSERT INTO public.terroir_regions (
    id, name, official_name, native_names, greek_name,
    country_code, destination,
    classification_system, classification_code, classification_codes,
    classification_version, classification_level,
    nuts_code, nuts_version, nuts_level,
    center_lat, center_lng, geometry, source_url, boundary_attribution
  ) VALUES (
    'northern_greece',
    'Northern Greece',
    'Northern Greece',
    '{}'::jsonb,
    NULL,
    'GR',
    'northern_greece',
    'NUTS',
    NULL,
    expected_codes,
    2021,
    3,
    NULL,
    2021,
    NULL,
    ST_Y(ST_PointOnSurface(composite_geom)),
    ST_X(ST_PointOnSurface(composite_geom)),
    composite_geom,
    'https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/NUTS_RG_03M_2021_4326_LEVL_3.geojson',
    'Composite boundary: union of 12 Eurostat/GISCO NUTS 2021 NUTS-3 features used by the TerroirTrail Northern Greece destination; EPSG:4326, 1:3M generalized geometry.'
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    official_name = EXCLUDED.official_name,
    native_names = EXCLUDED.native_names,
    country_code = EXCLUDED.country_code,
    destination = EXCLUDED.destination,
    classification_system = EXCLUDED.classification_system,
    classification_code = EXCLUDED.classification_code,
    classification_codes = EXCLUDED.classification_codes,
    classification_version = EXCLUDED.classification_version,
    classification_level = EXCLUDED.classification_level,
    nuts_code = EXCLUDED.nuts_code,
    nuts_version = EXCLUDED.nuts_version,
    nuts_level = EXCLUDED.nuts_level,
    center_lat = EXCLUDED.center_lat,
    center_lng = EXCLUDED.center_lng,
    geometry = EXCLUDED.geometry,
    source_url = EXCLUDED.source_url,
    boundary_attribution = EXCLUDED.boundary_attribution,
    updated_at = NOW();
END $$;

DO $$
BEGIN
  IF (SELECT count(*) FROM public.terroir_regions WHERE id IN ('crete','santorini','peloponnese','northern_greece','tuscany')) <> 5 THEN
    RAISE EXCEPTION 'Expected all five legacy base destinations in terroir_regions';
  END IF;

  IF (SELECT count(*) FROM public.terroir_regions) <> 22 THEN
    RAISE EXCEPTION 'Expected 22 canonical terroir region rows after legacy reconciliation';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.terroir_regions
    WHERE NOT ST_IsValid(geometry) OR ST_IsEmpty(geometry) OR ST_SRID(geometry) <> 4326
  ) THEN
    RAISE EXCEPTION 'One or more terroir region geometries failed validity/SRID checks';
  END IF;

  IF (SELECT count(*) FROM public.producers) <> 62 THEN
    RAISE EXCEPTION 'Producer count changed during legacy region reconciliation; expected 62';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT (SELECT had_http FROM _terroir_http_state LIMIT 1) THEN
    EXECUTE 'DROP EXTENSION IF EXISTS http';
  END IF;
END $$;
