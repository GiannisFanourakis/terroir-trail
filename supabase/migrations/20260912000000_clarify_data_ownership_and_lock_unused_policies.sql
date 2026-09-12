-- =====================================================================
-- TERROIR TRAIL: Clarify Data Ownership and Lock Unused Policies
-- Migration: 20260912000000_clarify_data_ownership_and_lock_unused_policies.sql
--
-- Data Ownership Architecture:
-- 1. Supabase (PostgreSQL + PostGIS):
--    - Authoritative catalogue for public producers and tasting experiences.
--    - Read-only for browser / anonymous clients via public SELECT.
--    - Writes performed exclusively via administrative, migration, or service-role tooling.
-- 2. Firebase Auth + Firestore:
--    - Authoritative identity and authentication (Firebase Auth).
--    - Traveler profiles, passport stamps, personal tasting notes (Firestore users).
--    - Trusted host / estate authorization (Firestore producer_owners/{producerId}).
--    - Host claims and fiscal registration applications (Firestore producer_registrations).
--    - Real-time estate operational overlays (Firestore producer_overrides/{producerId}).
--    - Tasting reservations and guest inquiries (Firestore bookings).
--    - Explorer Pass paid entitlements (Firestore explorerPasses).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. PRODUCERS: Remove Obsolete Supabase Auth Update Policy
-- ---------------------------------------------------------------------
-- Production authorization is driven by Firebase Auth UID -> Firestore producer_owners/{producerId}.
-- Supabase auth.users is not used.
DROP POLICY IF EXISTS "Producer owners can update their own estate" ON public.producers;

-- Ensure public SELECT remains active
DROP POLICY IF EXISTS "Public can view all producers" ON public.producers;
CREATE POLICY "Public can view all producers"
  ON public.producers FOR SELECT
  USING (true);

-- Mark obsolete ownership columns deprecated in database comments
COMMENT ON COLUMN public.producers.owner_user_id IS
  'DEPRECATED: Obsolete Supabase auth.users foreign key. Producer authorization is authoritative exclusively in Firebase Auth UID -> Firestore producer_owners/{producerId}.';

COMMENT ON COLUMN public.producers.is_claimed IS
  'DEPRECATED: Obsolete column. Producer claim status is authoritative exclusively in Firestore producer_owners and producer_registrations.';

COMMENT ON COLUMN public.producers.is_verified IS
  'DEPRECATED: Obsolete column. Producer verification is authoritative exclusively in Firestore producer_owners.';

-- ---------------------------------------------------------------------
-- 2. EXPERIENCES: Remove Obsolete Supabase Auth Management Policy
-- ---------------------------------------------------------------------
-- Experience management is no longer tied to Supabase auth.users.
DROP POLICY IF EXISTS "Producer owners can manage experiences" ON public.experiences;

-- Retain public SELECT for active experiences
DROP POLICY IF EXISTS "Public can view active experiences" ON public.experiences;
CREATE POLICY "Public can view active experiences"
  ON public.experiences FOR SELECT
  USING (is_active = true);

-- ---------------------------------------------------------------------
-- 3. BOOKINGS: Lock Unused Supabase Bookings Table
-- ---------------------------------------------------------------------
-- Application bookings are authoritative exclusively in Cloud Firestore (collection: bookings).
-- Remove all public and authenticated client policies to prevent bypasses.
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Producers can view bookings for their estate" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can create a booking" ON public.bookings;

-- Revoke all table permissions from client roles
REVOKE ALL ON TABLE public.bookings FROM anon, authenticated;

-- Document deprecation on table
COMMENT ON TABLE public.bookings IS
  'DEPRECATED: Unused table. Production bookings are authoritative exclusively in Cloud Firestore (collection: bookings). Client access is locked.';

-- ---------------------------------------------------------------------
-- 4. REVIEWS: Lock Unused Client Review Access
-- ---------------------------------------------------------------------
-- There is currently no active review-writing flow, and review authorization depended on Supabase Auth.
-- Lock client write access and reserve table for future review feature.
DROP POLICY IF EXISTS "Authenticated users can post reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public can view reviews" ON public.reviews;

-- Revoke client access
REVOKE ALL ON TABLE public.reviews FROM anon, authenticated;

-- Document status on table
COMMENT ON TABLE public.reviews IS
  'DEPRECATED / RESERVED: Unused table reserved for future review feature. Client access is locked as TerroirTrail uses Firebase Auth for identity.';
