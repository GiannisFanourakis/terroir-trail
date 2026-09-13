-- Experiences are dormant unless explicitly approved and published.
-- Producer discovery does not imply TerroirTrail booking permission.

ALTER TABLE public.experiences
  ALTER COLUMN is_active SET DEFAULT FALSE;

UPDATE public.experiences
SET is_active = FALSE
WHERE is_active IS DISTINCT FROM FALSE;
