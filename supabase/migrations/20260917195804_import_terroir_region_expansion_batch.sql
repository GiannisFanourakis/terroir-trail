-- Import the 15 expansion terroir regions required by the frozen producer queue.
-- Applied to production as Supabase migration 20260917195804.
-- EU regions use NUTS 2024; Norwegian regions use Eurostat Statistical Regions (SR) 2024.

CREATE TEMP TABLE _terroir_http_state (had_http boolean) ON COMMIT DROP;
INSERT INTO _terroir_http_state
SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'http');

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'http') THEN
    EXECUTE 'CREATE EXTENSION http WITH SCHEMA extensions';
  END IF;
END $$;

CREATE TEMP TABLE _gisco_region_features (
  classification_level smallint NOT NULL,
  feature jsonb NOT NULL
) ON COMMIT DROP;

WITH response AS (
  SELECT * FROM extensions.http_get(
    'https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/NUTS_RG_03M_2024_4326_LEVL_2.geojson'
  )
), payload AS (
  SELECT content::jsonb AS doc FROM response WHERE status = 200
)
INSERT INTO _gisco_region_features (classification_level, feature)
SELECT 2, f.value
FROM payload,
LATERAL jsonb_array_elements(doc -> 'features') AS f(value);

WITH response AS (
  SELECT * FROM extensions.http_get(
    'https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/NUTS_RG_03M_2024_4326_LEVL_3.geojson'
  )
), payload AS (
  SELECT content::jsonb AS doc FROM response WHERE status = 200
)
INSERT INTO _gisco_region_features (classification_level, feature)
SELECT 3, f.value
FROM payload,
LATERAL jsonb_array_elements(doc -> 'features') AS f(value);

CREATE TEMP TABLE _terroir_region_targets (
  id text PRIMARY KEY,
  display_name text NOT NULL,
  country_code text NOT NULL,
  destination text NOT NULL,
  classification_system text NOT NULL,
  classification_code text NOT NULL,
  classification_version integer NOT NULL,
  classification_level smallint NOT NULL,
  native_names jsonb NOT NULL DEFAULT '{}'::jsonb
) ON COMMIT DROP;

INSERT INTO _terroir_region_targets
(id, display_name, country_code, destination, classification_system, classification_code, classification_version, classification_level, native_names)
VALUES
  ('puglia', 'Puglia', 'IT', 'puglia', 'NUTS', 'ITF4', 2024, 2, '{"it":"Puglia"}'),
  ('sicily', 'Sicily', 'IT', 'sicily', 'NUTS', 'ITG1', 2024, 2, '{"it":"Sicilia"}'),
  ('south_tyrol', 'South Tyrol', 'IT', 'south_tyrol', 'NUTS', 'ITH1', 2024, 2, '{"de":"Südtirol","it":"Alto Adige"}'),
  ('provence_alpes_cote_d_azur', 'Provence-Alpes-Côte d''Azur', 'FR', 'provence_alpes_cote_d_azur', 'NUTS', 'FRL0', 2024, 2, '{"fr":"Provence-Alpes-Côte d''Azur"}'),
  ('catalonia', 'Catalonia', 'ES', 'catalonia', 'NUTS', 'ES51', 2024, 2, '{"ca":"Catalunya","es":"Cataluña"}'),
  ('alentejo', 'Alentejo', 'PT', 'alentejo', 'NUTS', 'PT1C', 2024, 2, '{"pt":"Alentejo"}'),
  ('istria', 'Istria', 'HR', 'istria', 'NUTS', 'HR036', 2024, 3, '{"hr":"Istarska županija"}'),
  ('pomurska', 'Pomurska', 'SI', 'pomurska', 'NUTS', 'SI031', 2024, 3, '{"sl":"Pomurska"}'),
  ('southeast_slovenia', 'Southeast Slovenia', 'SI', 'southeast_slovenia', 'NUTS', 'SI037', 2024, 3, '{"sl":"Jugovzhodna Slovenija"}'),
  ('central_slovenia', 'Central Slovenia', 'SI', 'central_slovenia', 'NUTS', 'SI041', 2024, 3, '{"sl":"Osrednjeslovenska"}'),
  ('goriska', 'Goriška', 'SI', 'goriska', 'NUTS', 'SI043', 2024, 3, '{"sl":"Goriška"}'),
  ('trondelag', 'Trøndelag', 'NO', 'trondelag', 'SR', 'NO060', 2024, 3, '{"no":"Trøndelag","sma":"Trööndelage"}'),
  ('more_og_romsdal', 'Møre og Romsdal', 'NO', 'more_og_romsdal', 'SR', 'NO0A3', 2024, 3, '{"no":"Møre og Romsdal"}'),
  ('buskerud', 'Buskerud', 'NO', 'buskerud', 'SR', 'NO085', 2024, 3, '{"no":"Buskerud"}'),
  ('vestland', 'Vestland', 'NO', 'vestland', 'SR', 'NO0A2', 2024, 3, '{"no":"Vestland"}');

DO $$
DECLARE
  missing_codes text;
BEGIN
  SELECT string_agg(t.classification_code, ', ' ORDER BY t.classification_code)
  INTO missing_codes
  FROM _terroir_region_targets t
  LEFT JOIN _gisco_region_features f
    ON f.classification_level = t.classification_level
   AND f.feature -> 'properties' ->> 'NUTS_ID' = t.classification_code
   AND f.feature -> 'properties' ->> 'CNTR_CODE' = CASE WHEN t.country_code = 'GR' THEN 'EL' ELSE t.country_code END
  WHERE f.feature IS NULL;

  IF missing_codes IS NOT NULL THEN
    RAISE EXCEPTION 'Expected GISCO 2024 region code(s) not found: %', missing_codes;
  END IF;
END $$;

WITH matched AS (
  SELECT
    t.*,
    f.feature,
    CASE
      WHEN t.classification_level = 2 THEN 'https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/NUTS_RG_03M_2024_4326_LEVL_2.geojson'
      ELSE 'https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/NUTS_RG_03M_2024_4326_LEVL_3.geojson'
    END AS source_url
  FROM _terroir_region_targets t
  JOIN _gisco_region_features f
    ON f.classification_level = t.classification_level
   AND f.feature -> 'properties' ->> 'NUTS_ID' = t.classification_code
   AND f.feature -> 'properties' ->> 'CNTR_CODE' = CASE WHEN t.country_code = 'GR' THEN 'EL' ELSE t.country_code END
), geoms AS (
  SELECT
    m.*,
    ST_Multi(
      ST_SetSRID(ST_GeomFromGeoJSON((m.feature -> 'geometry')::text), 4326)
    )::geometry(MultiPolygon, 4326) AS geom
  FROM matched m
)
INSERT INTO public.terroir_regions (
  id, name, official_name, native_names, greek_name,
  country_code, destination,
  classification_system, classification_code, classification_version, classification_level,
  nuts_code, nuts_version, nuts_level,
  center_lat, center_lng, geometry, source_url, boundary_attribution
)
SELECT
  g.id,
  g.display_name,
  COALESCE(
    NULLIF(g.feature -> 'properties' ->> 'NAME_LATN', ''),
    NULLIF(g.feature -> 'properties' ->> 'NUTS_NAME', ''),
    g.display_name
  ),
  g.native_names,
  NULL,
  g.country_code,
  g.destination,
  g.classification_system,
  g.classification_code,
  g.classification_version,
  g.classification_level,
  CASE WHEN g.classification_system = 'NUTS' THEN g.classification_code ELSE NULL END,
  CASE WHEN g.classification_system = 'NUTS' THEN g.classification_version ELSE NULL END,
  CASE WHEN g.classification_system = 'NUTS' THEN g.classification_level ELSE NULL END,
  ST_Y(ST_PointOnSurface(g.geom)),
  ST_X(ST_PointOnSurface(g.geom)),
  g.geom,
  g.source_url,
  CASE
    WHEN g.classification_system = 'NUTS'
      THEN format('Boundary: Eurostat/GISCO NUTS 2024, NUTS-%s %s, EPSG:4326, 1:3M generalized geometry.', g.classification_level, g.classification_code)
    ELSE format('Boundary: Eurostat/GISCO Statistical Regions 2024, SR-%s %s, EPSG:4326, 1:3M generalized geometry.', g.classification_level, g.classification_code)
  END
FROM geoms g
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  official_name = EXCLUDED.official_name,
  native_names = EXCLUDED.native_names,
  country_code = EXCLUDED.country_code,
  destination = EXCLUDED.destination,
  classification_system = EXCLUDED.classification_system,
  classification_code = EXCLUDED.classification_code,
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
  bad_count integer;
BEGIN
  SELECT count(*) INTO bad_count
  FROM public.terroir_regions r
  JOIN _terroir_region_targets t ON t.id = r.id
  WHERE NOT ST_IsValid(r.geometry)
     OR ST_IsEmpty(r.geometry)
     OR ST_SRID(r.geometry) <> 4326
     OR r.classification_code <> t.classification_code
     OR r.classification_system <> t.classification_system
     OR r.country_code <> t.country_code;

  IF bad_count <> 0 THEN
    RAISE EXCEPTION 'Imported terroir-region validation failed for % row(s)', bad_count;
  END IF;

  IF (SELECT count(*) FROM public.terroir_regions r JOIN _terroir_region_targets t ON t.id = r.id) <> 15 THEN
    RAISE EXCEPTION 'Expected 15 expansion regions after import';
  END IF;

  IF (SELECT count(*) FROM public.producers) <> 62 THEN
    RAISE EXCEPTION 'Producer count changed during region import; expected 62';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT (SELECT had_http FROM _terroir_http_state LIMIT 1) THEN
    EXECUTE 'DROP EXTENSION IF EXISTS http';
  END IF;
END $$;
