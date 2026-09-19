-- Peloponnese Visitability V1: KYKAO Handcrafted Beers.
-- Current first-party information confirms the active microbrewery but does not
-- establish ordinary public brewery access. A 2026 public visit report is
-- retained only as activity corroboration.

update public.producers
set
  visit_status = 'not_publicly_confirmed',
  visit_source_url = 'https://kykao.gr/',
  visit_notes = 'KYKAO remains an active independent microbrewery near Patras, but no current first-party visitor page, taproom timetable, public shop hours, tour/tasting procedure, booking rule, or walk-in policy could be verified. A 2026 public social report describes a brewery visit and tasting, but that does not establish ordinary public access. Keep public visitability unconfirmed.',
  opening_hours = null,
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 00:00:00+03'
where id = 'kykao-handcrafted-beers';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'kykao-handcrafted-beers',
  'visit_status',
  '{"status":"not_publicly_confirmed"}'::jsonb,
  'first_party_source',
  'https://kykao.gr/',
  'KYKAO — official site',
  timestamptz '2026-09-19 00:00:00+03',
  'The current official domain identifies the active microbrewery but no current public visitor programme or access policy could be verified.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='kykao-handcrafted-beers'
    and field_key='visit_status'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'kykao-handcrafted-beers',
  'informal_visit_report',
  '{"visit_and_tasting_reported":true,"year":2026,"public_access_not_established":true}'::jsonb,
  'public_listing',
  'https://www.instagram.com/p/Da0BktbgqJu/',
  '2026 public social visitor report',
  timestamptz '2026-09-19 00:00:00+03',
  'A July 2026 public social post describes a visit and tasting at KYKAO. This corroborates activity only; it is not used as evidence that ordinary public walk-in visits are available.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='kykao-handcrafted-beers'
    and field_key='informal_visit_report'
);
