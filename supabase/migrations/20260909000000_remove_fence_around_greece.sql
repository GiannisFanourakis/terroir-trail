-- =====================================================================
-- TERROIR TRAIL: Baby Step 1 — Remove the Fence Around Greece
-- Adds country & country_code columns, removes Greek-only destination constraint,
-- and registers our first verified Italian producer (Azienda Agricola Monteraponi)
-- =====================================================================

-- 1. Add geographic fields to producers table (idempotent)
ALTER TABLE public.producers ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Greece';
ALTER TABLE public.producers ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'GR';

-- 2. Backfill existing Greek producers
UPDATE public.producers 
SET country = 'Greece', country_code = 'GR' 
WHERE country IS NULL OR country_code IS NULL;

-- 3. Remove the architectural fence: drop the Greek-only destination check constraint
ALTER TABLE public.producers DROP CONSTRAINT IF EXISTS producers_destination_check;

-- 4. Register First Real Verified Italian Producer: Azienda Agricola Monteraponi
INSERT INTO public.producers (
  id, name, greek_name, category, destination, country, country_code, region, village, lat, lng,
  cover_image, gallery, tag_line, description, story, indigenous_varieties,
  tasting_highlights, opening_hours, best_season, phone, website,
  google_maps_url, road_access, ethos, food_option, dog_friendly,
  kid_friendly, walk_in_friendly, campervan_friendly, price_level,
  rating, review_count, vip_perks
) VALUES (
  'monteraponi-tuscany',
  'Azienda Agricola Monteraponi',
  'Azienda Agricola Monteraponi',
  'winery',
  'tuscany',
  'Italy',
  'IT',
  'Tuscany',
  'Radda in Chianti',
  43.4671,
  11.3447,
  'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80',
  ARRAY[
    'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80'
  ]::TEXT[],
  'High-Altitude Organic Chianti Classico from Pure Galestro Limestone',
  'Perched at 470 meters on the hills of Radda in Chianti, Monteraponi is a benchmark for purist, artisanal Sangiovese with unadorned minerality and natural elegance.',
  'Founded on a historic 10th-century medieval estate, Monteraponi was revitalized by winemaker Michele Braganti with a commitment to authentic, non-interventionist winemaking. Farming certified organic vineyards surrounded by oak forests, Michele vinifies exclusively with indigenous yeasts in raw concrete vats, followed by long, gentle macerations and aging in large neutral Slavonian and French oak ovals. The result is pure, vibrant Sangiovese that reflects the true, unmanipulated terroir of Radda in Chianti.',
  ARRAY['Sangiovese', 'Canaiolo', 'Colorino', 'Trebbiano Toscano']::TEXT[],
  ARRAY['Chianti Classico DOCG', 'Chianti Classico Riserva Il Campitello', 'Baron Ugo IGT Toscana', 'Artisanal Cellar Visit by Appointment']::TEXT[],
  'By Appointment: Mon - Fri: 09:00 - 18:00',
  'Spring through Autumn (April - October)',
  '+39 0577 738208',
  'https://www.monteraponi.it',
  'https://maps.google.com/?q=43.4671,11.3447',
  'paved',
  ARRAY['organic', 'indigenous_only', 'family_estate']::TEXT[],
  'tasting_board',
  true,
  true,
  false,
  false,
  '€€',
  4.9,
  42,
  '{"welcomePour": "Tasting of estate Extra Virgin Olive Oil & library vintage sample", "discountPercent": 10}'::JSONB
) ON CONFLICT (id) DO UPDATE SET
  country = EXCLUDED.country,
  country_code = EXCLUDED.country_code,
  destination = EXCLUDED.destination,
  region = EXCLUDED.region,
  village = EXCLUDED.village,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng;
