-- =====================================================================
-- TERROIR TRAIL: Host-Managed Producer Imagery Storage Infrastructure
-- Migration: 20260914163000_producer_media_storage.sql
--
-- PROPOSAL ONLY: Do NOT apply directly to production.
-- Production Supabase must remain untouched during this prototype phase.
--
-- TerroirTrail Identity & Authorization Architecture:
-- 1. Real Write-Security Boundary:
--    - Supabase `service_role` completely bypasses storage RLS.
--    - Therefore, backend authorization — validating the caller's Firebase ID token
--      and verifying authoritative estate ownership in Cloud Firestore (`producer_owners/{producerId}`) —
--      is the TRUE write-security boundary. RLS policies here provide defense-in-depth,
--      not the primary authentication gate.
-- 2. Moderation & Public Exposure Boundary:
--    - Pending and unmoderated producer photography MUST NEVER be stored in or exposed
--      through a public bucket.
--    - Recommended Future Ingestion Architecture:
--        Host upload
--        → authenticated backend (Express / Cloud Functions)
--        → Firebase ID token & Firestore ownership verification
--        → MIME/magic-byte validation, virus scan, and EXIF/metadata stripping
--        → private staging storage (non-public)
--        → editorial / automated moderation & approval
--        → approved public producer-media CDN asset
--      Alternatively, the backend service holds the file temporarily in quarantine
--      and uploads directly to the public 'producer-media' bucket only upon explicit approval.
-- 3. Client Access Boundary:
--    - Frontend browser clients connect to Supabase anonymously using the public anon key.
--    - Browser clients DO NOT possess direct Supabase Auth JWT sessions.
--    - Direct client uploads to Supabase Storage are strictly forbidden.
-- 4. Bucket Configuration:
--    - Bucket: 'producer-media' (public read for CDN distribution of approved media)
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
