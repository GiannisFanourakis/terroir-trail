-- Crete Visitability V1: Stamatogiorgis Dairy.
-- First-party review on 2026-09-19 confirms tasting experiences at the dairy,
-- but no dependable visitor timetable, booking/walk-in policy, duration or parking policy.

update public.producers
set
  visit_source_url = 'https://stamatogiorgis.gr/en/',
  visit_notes = 'Current first-party site explicitly says the dairy offers tasting experiences at its facilities. It does not publish a clear current visitor timetable, booking requirement, walk-in policy, visit duration, or parking policy. Contact the dairy before travelling.',
  opening_hours = null,
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 19:10:00+03'
where id = 'stamatogiorgis-dairy-smari';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'stamatogiorgis-dairy-smari',
  'tasting_experience',
  '{"at_facilities":true}'::jsonb,
  'first_party_source',
  'https://stamatogiorgis.gr/en/',
  'Stamatogiorgis Dairy — official site',
  timestamptz '2026-09-19 19:10:00+03',
  'The current first-party site explicitly refers to tasting experiences at the dairy facilities.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='stamatogiorgis-dairy-smari'
    and field_key='tasting_experience'
    and source_url='https://stamatogiorgis.gr/en/'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'stamatogiorgis-dairy-smari',
  'visit_status',
  '{"status":"current_access_uncertain"}'::jsonb,
  'first_party_source',
  'https://stamatogiorgis.gr/en/',
  'Stamatogiorgis Dairy — official site',
  timestamptz '2026-09-19 19:10:00+03',
  'Tasting experiences are currently advertised, but ordinary visitor hours, booking requirements and walk-in access are not clearly published. Keep current_access_uncertain.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='stamatogiorgis-dairy-smari'
    and field_key='visit_status'
    and verified_at=timestamptz '2026-09-19 19:10:00+03'
);
