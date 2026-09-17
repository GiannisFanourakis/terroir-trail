-- Align the France destination identifier with the canonical app Destination ID.
-- Applied to production as Supabase migration 20260917200252.
-- The authoritative regional identity remains Provence-Alpes-Côte d'Azur / FRL0.

UPDATE public.terroir_regions
SET
  id = 'provence',
  destination = 'provence',
  name = 'Provence-Alpes-Côte d''Azur',
  official_name = 'Provence-Alpes-Côte d''Azur',
  native_names = '{"fr":"Provence-Alpes-Côte d''Azur"}'::jsonb,
  updated_at = NOW()
WHERE id = 'provence_alpes_cote_d_azur'
  AND classification_system = 'NUTS'
  AND classification_code = 'FRL0';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.terroir_regions
    WHERE id = 'provence'
      AND destination = 'provence'
      AND classification_system = 'NUTS'
      AND classification_code = 'FRL0'
  ) THEN
    RAISE EXCEPTION 'Provence destination alignment failed';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.terroir_regions
    WHERE id = 'provence_alpes_cote_d_azur'
       OR destination = 'provence_alpes_cote_d_azur'
  ) THEN
    RAISE EXCEPTION 'Legacy Provence destination identifier remains';
  END IF;
END $$;
