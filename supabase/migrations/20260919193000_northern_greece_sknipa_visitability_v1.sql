-- Northern Greece Visitability V1: Sknipa Craft Beer.
-- Current first-party contact page supports arranged brewery visits but does
-- not establish ordinary walk-in access. Published weekday hours are kept as
-- business/contact hours rather than guaranteed tour hours.

update public.producers
set
  visit_status = 'appointment_only',
  visit_source_url = 'https://www.sknipa.beer/en/contact',
  visit_notes = 'Current first-party contact page tells visitors who want to learn how Sknipa beer is made to send a message to arrange a meeting. This establishes arranged brewery visits, but not ordinary walk-in access. The page publishes Monday-Friday 09:00-17:30 as brewery/contact hours; these are kept separate from any guaranteed tour timetable. No standard visit duration, parking details or visitor languages are published.',
  opening_hours = 'Visits by arrangement. Brewery/contact hours: Mon-Fri 09:00-17:30.',
  visit_booking_requirement = 'required',
  walk_in_status = 'not_accepted',
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 20:29:00+03'
where id = 'propator-sknipa-brewery';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'propator-sknipa-brewery','booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted","wording":"arrange_a_meeting"}'::jsonb,
  'first_party_source',
  'https://www.sknipa.beer/en/contact',
  'Sknipa Craft Beer — Contact',
  timestamptz '2026-09-19 20:29:00+03',
  'The current official contact page tells visitors interested in how the beer is made to send a message to arrange a meeting.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='propator-sknipa-brewery' and field_key='booking_requirement'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'propator-sknipa-brewery','business_hours',
  '{"monday_friday":"09:00-17:30"}'::jsonb,
  'first_party_source',
  'https://www.sknipa.beer/en/contact',
  'Sknipa Craft Beer — Contact',
  timestamptz '2026-09-19 20:29:00+03',
  'The current contact page publishes Monday-Friday 09:00-17:30. This is retained as business/contact hours, not treated as guaranteed public tour hours.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='propator-sknipa-brewery' and field_key='business_hours'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);
