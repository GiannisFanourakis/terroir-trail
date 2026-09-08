-- =====================================================================
-- TERROIR TRAIL: Supabase PostgreSQL + PostGIS Production Schema
-- Supports 10,000+ Greek & Mediterranean Terroir Producers at Scale
-- =====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Create Producers Table
CREATE TABLE IF NOT EXISTS public.producers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  greek_name TEXT,
  category TEXT NOT NULL CHECK (category IN ('winery', 'kazani', 'olive_mill', 'cheese_dairy', 'apiary', 'brewery')),
  destination TEXT NOT NULL CHECK (destination IN ('crete', 'santorini', 'peloponnese', 'northern_greece', 'aegean_islands', 'ionian_islands', 'central_greece')),
  region TEXT NOT NULL,
  village TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  location GEOMETRY(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(lng, lat), 4326)) STORED,
  cover_image TEXT,
  gallery TEXT[] DEFAULT ARRAY[]::TEXT[],
  tag_line TEXT,
  description TEXT,
  story TEXT,
  indigenous_varieties TEXT[] DEFAULT ARRAY[]::TEXT[],
  tasting_highlights TEXT[] DEFAULT ARRAY[]::TEXT[],
  opening_hours TEXT,
  best_season TEXT,
  phone TEXT,
  website TEXT,
  google_maps_url TEXT,
  road_access TEXT DEFAULT 'paved' CHECK (road_access IN ('paved', 'gravel_ok', '4x4_required')),
  ethos TEXT[] DEFAULT ARRAY[]::TEXT[],
  food_option TEXT DEFAULT 'dakos_snacks' CHECK (food_option IN ('full_taverna', 'tasting_board', 'dakos_snacks', 'brewery_taproom', 'byo_picnic')),
  dog_friendly BOOLEAN DEFAULT false,
  kid_friendly BOOLEAN DEFAULT true,
  walk_in_friendly BOOLEAN DEFAULT true,
  campervan_friendly BOOLEAN DEFAULT false,
  price_level TEXT DEFAULT '€€' CHECK (price_level IN ('€', '€€', '€€€')),
  rating NUMERIC(3, 2) DEFAULT 5.00,
  review_count INTEGER DEFAULT 0,
  vip_perks JSONB,
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_claimed BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Experiences Table
CREATE TABLE IF NOT EXISTS public.experiences (
  id TEXT PRIMARY KEY,
  producer_id TEXT NOT NULL REFERENCES public.producers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price_per_person NUMERIC(10, 2) NOT NULL DEFAULT 20.00,
  currency TEXT DEFAULT 'EUR',
  description TEXT NOT NULL,
  includes TEXT[] DEFAULT ARRAY[]::TEXT[],
  badge TEXT,
  producer_name TEXT,
  producer_greek_name TEXT,
  category TEXT,
  destination TEXT,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id TEXT NOT NULL REFERENCES public.producers(id) ON DELETE CASCADE,
  experience_id TEXT REFERENCES public.experiences(id) ON DELETE SET NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT,
  booking_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  guests_count INTEGER NOT NULL DEFAULT 2,
  total_estimated NUMERIC(10, 2) NOT NULL,
  special_requests TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id TEXT NOT NULL REFERENCES public.producers(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- PERFORMANCE & GEOSPATIAL INDEXES (Essential for 10,000+ items)
-- =====================================================================

-- Spatial index: 10,000 points indexed in milliseconds
CREATE INDEX IF NOT EXISTS idx_producers_location ON public.producers USING GIST (location);

-- Lat/Lng bounding box compound index for standard range queries
CREATE INDEX IF NOT EXISTS idx_producers_lat_lng ON public.producers (lat, lng);

-- Faceted search indexes
CREATE INDEX IF NOT EXISTS idx_producers_dest_cat ON public.producers (destination, category);
CREATE INDEX IF NOT EXISTS idx_experiences_producer ON public.experiences (producer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_producer_date ON public.bookings (producer_id, booking_date);

-- Bilingual Greek & English Trigram Full-Text Search Indexes
CREATE INDEX IF NOT EXISTS idx_producers_name_trgm ON public.producers USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_producers_greek_name_trgm ON public.producers USING GIN (greek_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_producers_village_trgm ON public.producers USING GIN (village gin_trgm_ops);

-- =====================================================================
-- STORED PROCEDURES / RPC FUNCTIONS
-- =====================================================================

-- High-speed Viewport Bounding Box Query
CREATE OR REPLACE FUNCTION get_producers_in_viewport(
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
AS $$
  SELECT *
  FROM public.producers
  WHERE location && ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)
    AND (filter_category IS NULL OR filter_category = 'all' OR category = filter_category)
    AND (filter_destination IS NULL OR filter_destination = 'all' OR destination = filter_destination)
  ORDER BY rating DESC, review_count DESC
  LIMIT max_limit;
$$;

-- Proximity Radius Search (e.g. Find all producers within 25km of current GPS, ordered by distance)
CREATE OR REPLACE FUNCTION get_nearby_producers(
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
AS $$
  SELECT *
  FROM public.producers p
  WHERE ST_DWithin(
    p.location::geography,
    ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
    radius_km * 1000.0
  )
  AND (filter_category IS NULL OR filter_category = 'all' OR p.category = filter_category)
  AND (filter_destination IS NULL OR filter_destination = 'all' OR p.destination = filter_destination)
  ORDER BY ST_Distance(
    p.location::geography,
    ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
  ) ASC
  LIMIT max_limit;
$$;

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES (Idempotent)
-- =====================================================================

ALTER TABLE public.producers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 1. Producers: Anyone can read, only verified owners can update
DROP POLICY IF EXISTS "Public can view all producers" ON public.producers;
CREATE POLICY "Public can view all producers"
  ON public.producers FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Producer owners can update their own estate" ON public.producers;
CREATE POLICY "Producer owners can update their own estate"
  ON public.producers FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

-- 2. Experiences: Anyone can read, only estate owner can insert/update/delete
DROP POLICY IF EXISTS "Public can view active experiences" ON public.experiences;
CREATE POLICY "Public can view active experiences"
  ON public.experiences FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Producer owners can manage experiences" ON public.experiences;
CREATE POLICY "Producer owners can manage experiences"
  ON public.experiences FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.producers
      WHERE producers.id = experiences.producer_id
        AND producers.owner_user_id = auth.uid()
    )
  );

-- 3. Bookings: Users can see their own bookings; producers can see bookings for their estate
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
CREATE POLICY "Users can view own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Producers can view bookings for their estate" ON public.bookings;
CREATE POLICY "Producers can view bookings for their estate"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.producers
      WHERE producers.id = bookings.producer_id
        AND producers.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Anyone can create a booking" ON public.bookings;
CREATE POLICY "Anyone can create a booking"
  ON public.bookings FOR INSERT
  WITH CHECK (true);

-- 4. Reviews: Anyone can read, authenticated travelers can insert
DROP POLICY IF EXISTS "Public can view reviews" ON public.reviews;
CREATE POLICY "Public can view reviews"
  ON public.reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can post reviews" ON public.reviews;
CREATE POLICY "Authenticated users can post reviews"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);
