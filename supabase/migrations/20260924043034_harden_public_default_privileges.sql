-- Opt TerroirTrail into Supabase's post-2026-10-30 Data API exposure model now.
-- Existing objects keep their current grants. These statements affect only
-- future tables and sequences created by the postgres role in public.
--
-- Any future public table must declare its intended GRANTs explicitly in the
-- same migration that creates it. Tables intended to stay private should say so
-- explicitly for review/CI purposes.

alter default privileges for role postgres in schema public
  revoke select, insert, update, delete on tables
  from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke usage, select on sequences
  from anon, authenticated, service_role;
