-- =====================================================================
-- TERROIR TRAIL: Host-Managed Producer Imagery Storage Infrastructure
-- Migration: 20260914163000_producer_media_storage.sql
--
-- PROPOSAL ONLY: Do NOT apply directly to production without staging validation.
--
-- Architecture & Compliance:
-- 1. Dedicated Public CDN Bucket: 'producer-media'
--    - Enforces 8MB file size limit.
--    - Restricts MIME types to image/jpeg, image/png, image/webp.
--    - Rejects SVG, executables, scripts, and non-image binaries.
-- 2. Storage Path Hierarchy:
--    - Cover images:   <producer_id>/cover.<ext>
--    - Gallery images: <producer_id>/gallery/<filename>.<ext>
-- 3. Provenance & Rights Guarantee:
--    - Images in this bucket are first-party producer uploads with explicit rights confirmation.
--    - Third-party Google Places imagery is NEVER saved or proxied here.
-- 4. Access Control:
--    - SELECT: Publicly readable for CDN distribution of approved estate imagery.
--    - INSERT / UPDATE / DELETE: Restricted to service-role or verified producer hosts
--      matching the path prefix (storage.foldername(name))[1].
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

-- 2. Public Read Access: Allow anyone to view images stored in 'producer-media'
DROP POLICY IF EXISTS "Public read access for producer media" ON storage.objects;
CREATE POLICY "Public read access for producer media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'producer-media');

-- 3. Producer Host Upload Policy:
-- When authenticating with Supabase JWT containing the host's claimed_producer_id claim,
-- enforce that the upload path starts with that producer's ID.
DROP POLICY IF EXISTS "Host can upload images to own producer folder" ON storage.objects;
CREATE POLICY "Host can upload images to own producer folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'producer-media'
    AND (
      -- Service-role bypass
      auth.role() = 'service_role'
      -- Or verified host matching the folder prefix
      OR (
        auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = (auth.jwt() ->> 'claimed_producer_id')
      )
    )
  );

-- 4. Producer Host Update Policy:
DROP POLICY IF EXISTS "Host can update images in own producer folder" ON storage.objects;
CREATE POLICY "Host can update images in own producer folder"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'producer-media'
    AND (
      auth.role() = 'service_role'
      OR (
        auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = (auth.jwt() ->> 'claimed_producer_id')
      )
    )
  );

-- 5. Producer Host Delete Policy:
DROP POLICY IF EXISTS "Host can delete images in own producer folder" ON storage.objects;
CREATE POLICY "Host can delete images in own producer folder"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'producer-media'
    AND (
      auth.role() = 'service_role'
      OR (
        auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = (auth.jwt() ->> 'claimed_producer_id')
      )
    )
  );

COMMENT ON TABLE storage.buckets IS
  'Storage buckets configuration. The producer-media bucket stores producer-provided photos with verified copyright provenance.';
