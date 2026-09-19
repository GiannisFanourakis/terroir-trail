-- Crete Visitability V1: Psiloritis Cheese Dairy.
-- Current first-party material confirms the Livadia production plant and
-- contact details but not a public visitor programme or ordinary walk-in access.

update public.producers
set
  visit_status = 'not_publicly_confirmed',
  visit_source_url = 'https://www.psiloriths.gr/en/the-company/',
  visit_notes = 'Current first-party site confirms the Livadia dairy as a modern production plant and publishes direct contact details, but it does not publish a public visitor programme, tour/tasting procedure, public opening hours, booking rule, or walk-in policy. Keep public access unconfirmed.',
  opening_hours = null,
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 19:40:00+03'
where id = 'psiloritis-cheese-dairy-livadia';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'psiloritis-cheese-dairy-livadia',
  'visit_status',
  '{"status":"not_publicly_confirmed"}'::jsonb,
  'first_party_source',
  'https://www.psiloriths.gr/en/the-company/',
  'Psiloritis Cheese Dairy — official company page',
  timestamptz '2026-09-19 19:40:00+03',
  'The current first-party site verifies the Livadia production plant and contact details but publishes no current visitor programme, public hours, tour/tasting procedure, booking rule or walk-in policy.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='psiloritis-cheese-dairy-livadia'
    and field_key='visit_status'
    and verified_at=timestamptz '2026-09-19 19:40:00+03'
);
