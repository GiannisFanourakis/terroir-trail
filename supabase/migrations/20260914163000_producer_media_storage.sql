-- =====================================================================
-- TERROIR TRAIL: Host-Managed Producer Imagery Storage Infrastructure
-- Migration: 20260914163000_producer_media_storage.sql
--
-- PROPOSAL ONLY: Do NOT apply directly to production.
-- Production Supabase must remain untouched during this prototype phase.
--
-- TerroirTrail Identity & Authorization Architecture:
-- 1. Identity Authority:
--    - TerroirTrail user accounts and producer host claims are authenticated
--      exclusively via Firebase Authentication (UIDs).
--    - Verified estate ownership is recorded authoritatively in Cloud Firestore
--      (under collections: `producer_owners/{producerId}` and `producer_registrations`).
-- 2. Client Access Boundary:
--    - Frontend browser clients connect to Supabase anonymously using the public
--      anon key for read-only PostGIS queries.
--    - Browser clients do NOT possess direct Supabase Auth JWT sessions.
--    - Direct client uploads to Supabase Storage are therefore prohibited to
--      prevent unauthenticated file injection.
-- 3. Ingestion Pipeline:
--    - Production uploads route through a verified backend API endpoint
--      (e.g., Express / Cloud Functions).
--    - The backend verifies the caller's Firebase ID token against Firestore
--      producer ownership records, validates MIME types, strips EXIF data,
--      and executes the upload using the Supabase `service_role` key.
-- 4. Bucket Configuration:
--    - Bucket: 'producer-media' (public read for CDN distribution)
--    - Max file size: 8 MB (8,388,608 bytes)
--    - Allowed MIME types: image/jpeg, image/png, image/webp (SVG / binaries rejected)
-- 5. Strict Provenance Invariant:
--    - Only host-provided photos with verified copyright confirmations are stored here.
--    - Third-party Google Places imagery is NEVER saved, cached, or mirrored in Supabase.
-- =====================================================================

-- 1. Create the 'producer-media' storage bucket if it does not already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'producer-media',
  'producer-media',
  true,
  8388608, -- 8 MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Public Read Access:
-- Allow anyone to read and cache approved estate imagery via CDN.
DROP POLICY IF EXISTS "Public read access for producer media" ON storage.objects;
CREATE POLICY "Public read access for producer media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'producer-media');

-- 3. Backend Service-Role Upload Policy:
-- Writes are strictly restricted to the authorized backend upload service.
-- Direct unauthenticated or client-side uploads are rejected.
DROP POLICY IF EXISTS "Backend service role can upload producer media" ON storage.objects;
DROP POLICY IF EXISTS "Host can upload images to own producer folder" ON storage.objects;
CREATE POLICY "Backend service role can upload producer media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'producer-media'
    AND auth.role() = 'service_role'
  );

-- 4. Backend Service-Role Update Policy:
-- Both USING and WITH CHECK clauses enforce bucket and service_role boundaries.
DROP POLICY IF EXISTS "Backend service role can update producer media" ON storage.objects;
DROP POLICY IF EXISTS "Host can update images in own producer folder" ON storage.objects;
CREATE POLICY "Backend service role can update producer media"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'producer-media'
    AND auth.role() = 'service_role'
  )
  WITH CHECK (
    bucket_id = 'producer-media'
    AND auth.role() = 'service_role'
  );

-- 5. Backend Service-Role Delete Policy:
DROP POLICY IF EXISTS "Backend service role can delete producer media" ON storage.objects;
DROP POLICY IF EXISTS "Host can delete images in own producer folder" ON storage.objects;
CREATE POLICY "Backend service role can delete producer media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'producer-media'
    AND auth.role() = 'service_role'
  );

-- =====================================================================
-- OPTIONAL FUTURE MILESTONE: Direct Client Upload via Token Bridging
--
-- If TerroirTrail introduces Firebase-to-Supabase JWT minting (third-party auth),
-- the following policies can be activated to permit scoped direct uploads:
--
-- CREATE POLICY "Bridged host can upload to own producer folder"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'producer-media'
--     AND auth.role() = 'authenticated'
--     AND (storage.foldername(name))[1] = (auth.jwt() -> 'app_metadata' ->> 'claimed_producer_id')
--   );
--
-- CREATE POLICY "Bridged host can update own producer folder"
--   ON storage.objects FOR UPDATE
--   USING (
--     bucket_id = 'producer-media'
--     AND auth.role() = 'authenticated'
--     AND (storage.foldername(name))[1] = (auth.jwt() -> 'app_metadata' ->> 'claimed_producer_id')
--   )
--   WITH CHECK (
--     bucket_id = 'producer-media'
--     AND auth.role() = 'authenticated'
--     AND (storage.foldername(name))[1] = (auth.jwt() -> 'app_metadata' ->> 'claimed_producer_id')
--   );
-- =====================================================================

COMMENT ON TABLE storage.buckets IS
  'Storage buckets configuration. The producer-media bucket stores producer-provided photos with verified copyright provenance. Writes managed exclusively via backend service-role.';
