-- Generalize terroir region classification metadata for both EU NUTS and
-- Eurostat Statistical Regions (SR) used for non-EU partner countries.
-- Applied to production as Supabase migration 20260917195713.

ALTER TABLE public.terroir_regions
  ADD COLUMN IF NOT EXISTS official_name TEXT,
  ADD COLUMN IF NOT EXISTS native_names JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS classification_system TEXT,
  ADD COLUMN IF NOT EXISTS classification_code TEXT,
  ADD COLUMN IF NOT EXISTS classification_version INTEGER,
  ADD COLUMN IF NOT EXISTS classification_level SMALLINT;

UPDATE public.terroir_regions
SET
  official_name = COALESCE(official_name, name),
  classification_system = COALESCE(classification_system, 'NUTS'),
  classification_code = COALESCE(classification_code, nuts_code),
  classification_version = COALESCE(classification_version, nuts_version),
  classification_level = COALESCE(classification_level, nuts_level),
  native_names = CASE
    WHEN id = 'thessaly' AND native_names = '{}'::jsonb THEN '{"el":"Θεσσαλία"}'::jsonb
    WHEN id = 'piedmont' AND native_names = '{}'::jsonb THEN '{"it":"Piemonte"}'::jsonb
    ELSE native_names
  END,
  updated_at = NOW();

UPDATE public.terroir_regions
SET official_name = 'Piemonte'
WHERE id = 'piedmont';

ALTER TABLE public.terroir_regions
  ALTER COLUMN official_name SET NOT NULL,
  ALTER COLUMN classification_system SET NOT NULL,
  ALTER COLUMN classification_code SET NOT NULL,
  ALTER COLUMN classification_version SET NOT NULL,
  ALTER COLUMN classification_level SET NOT NULL;

ALTER TABLE public.terroir_regions
  DROP CONSTRAINT IF EXISTS terroir_regions_classification_system_check;
ALTER TABLE public.terroir_regions
  ADD CONSTRAINT terroir_regions_classification_system_check
  CHECK (classification_system IN ('NUTS', 'SR'));

ALTER TABLE public.terroir_regions
  DROP CONSTRAINT IF EXISTS terroir_regions_classification_level_check;
ALTER TABLE public.terroir_regions
  ADD CONSTRAINT terroir_regions_classification_level_check
  CHECK (classification_level BETWEEN 0 AND 3);

CREATE UNIQUE INDEX IF NOT EXISTS idx_terroir_regions_classification_identity
  ON public.terroir_regions (
    classification_system,
    classification_version,
    classification_level,
    classification_code
  );

COMMENT ON COLUMN public.terroir_regions.classification_system IS
  'Geographic classification authority: NUTS for EU regions, SR for Eurostat Statistical Regions in non-EU partner countries.';
COMMENT ON COLUMN public.terroir_regions.classification_code IS
  'Authoritative Eurostat/GISCO regional code. Use this generic field for both NUTS and Statistical Regions.';
COMMENT ON COLUMN public.terroir_regions.classification_version IS
  'Classification release year associated with classification_code.';
COMMENT ON COLUMN public.terroir_regions.classification_level IS
  'Regional classification level (0-3).';
COMMENT ON COLUMN public.terroir_regions.nuts_code IS
  'Backward-compatible NUTS-only code. NULL for non-EU Statistical Regions.';
