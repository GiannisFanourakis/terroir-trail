-- Northern Greece Visitability V1: Thymiopoulos Vineyards.
-- Current first-party site verifies the Trilofos winery and contact point but
-- publishes no public visitor programme or access procedure.

update public.producers
set
  visit_status = 'not_publicly_confirmed',
  visit_source_url = 'https://www.thymiopoulosvineyards.gr/contact/',
  visit_notes = 'Current first-party Thymiopoulos Vineyards site verifies the active Trilofos winery and publishes direct contact details, but the current navigation and indexed first-party pages do not publish a visitor programme, winery tour, tasting procedure, visitor timetable, booking rule, or walk-in policy. Keep public visitability unconfirmed.',
  opening_hours = null,
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 20:29:00+03'
where id = 'thymiopoulos-naoussa';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'thymiopoulos-naoussa','visit_status',
  '{"status":"not_publicly_confirmed"}'::jsonb,
  'first_party_source',
  'https://www.thymiopoulosvineyards.gr/contact/',
  'Thymiopoulos Vineyards — official site/contact',
  timestamptz '2026-09-19 20:29:00+03',
  'The current first-party site verifies the winery and contact point but publishes no current public visitor programme or access procedure.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='thymiopoulos-naoussa' and field_key='visit_status'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);
