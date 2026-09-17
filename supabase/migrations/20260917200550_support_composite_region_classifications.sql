-- Support composite TerroirTrail destinations that aggregate multiple official
-- statistical-region features (for example Northern Greece).
-- Applied to production as Supabase migration 20260917200550.

ALTER TABLE public.terroir_regions
  ADD COLUMN IF NOT EXISTS classification_codes TEXT[];

UPDATE public.terroir_regions
SET classification_codes = ARRAY[classification_code]
WHERE classification_codes IS NULL
  AND classification_code IS NOT NULL;

ALTER TABLE public.terroir_regions
  ALTER COLUMN classification_codes SET DEFAULT ARRAY[]::text[],
  ALTER COLUMN classification_codes SET NOT NULL,
  ALTER COLUMN classification_code DROP NOT NULL;

ALTER TABLE public.terroir_regions
  DROP CONSTRAINT IF EXISTS terroir_regions_classification_codes_nonempty;
ALTER TABLE public.terroir_regions
  ADD CONSTRAINT terroir_regions_classification_codes_nonempty
  CHECK (cardinality(classification_codes) > 0);

COMMENT ON COLUMN public.terroir_regions.classification_codes IS
  'All authoritative codes represented by this TerroirTrail region. Single official regions have one code; composite destinations may aggregate multiple codes.';
COMMENT ON COLUMN public.terroir_regions.classification_code IS
  'Single authoritative code when the region maps to one statistical feature; NULL for composite TerroirTrail regions represented by classification_codes.';
