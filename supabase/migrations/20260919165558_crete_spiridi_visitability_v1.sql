-- Crete Visitability V1: Spiridi Olive Oil Farm.
-- Current first-party pages confirm a seasonal public farm/museum with a
-- no-reservation e-guided visit, current hours, 60-minute duration and
-- five supported tablet-tour languages. Separate activities require booking.

update public.producers
set
  visit_status = 'seasonal_public',
  visit_source_url = 'https://www.cretanoliveoilfarm.com/tours',
  visit_notes = 'Current first-party pages confirm Spiridi as a seasonal public visitor farm and museum. A simple/e-guided visit requires no reservation and lasts about 60 minutes, including an olive-oil and Cretan-products tasting. The farm usually welcomes visitors from 1 April to 31 October. Separate hands-on activities require booking at least 12 hours ahead. The e-guided tablet content is available in English, French, German, Russian and Polish.',
  opening_hours = 'Usually 1 Apr-31 Oct. Mon-Sat 09:30-18:30; Sun 10:00-16:00. Check the main page for seasonal timetable updates.',
  visit_booking_requirement = 'not_required',
  walk_in_status = 'accepted',
  parking_status = null,
  typical_visit_minutes = 60,
  visitor_hours = '{
    "usual_season":{"start":"04-01","end":"10-31"},
    "monday_saturday":"09:30-18:30",
    "sunday":"10:00-16:00"
  }'::jsonb,
  seasonal_visit_notes = 'The FAQ says the farm usually opens for visits from 1 April and closes 31 October, and that summer hours are updated on the official site. Hands-on activities require booking at least 12 hours ahead; simple visits do not.',
  visitor_languages = array['en','fr','de','ru','pl'],
  visitability_reviewed_at = timestamptz '2026-09-19 19:05:00+03'
where id = 'cretan-olive-oil-farm';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'cretan-olive-oil-farm',
  'visitor_hours',
  '{"usual_season":{"start":"04-01","end":"10-31"},"monday_saturday":"09:30-18:30","sunday":"10:00-16:00"}'::jsonb,
  'first_party_source',
  'https://www.cretanoliveoilfarm.com/',
  'Spiridi Olive Oil Farm — official homepage / FAQ',
  timestamptz '2026-09-19 19:05:00+03',
  'Current first-party homepage publishes 09:30-18:30 daily with Sunday 10:00-16:00; FAQ states visits usually run 1 April-31 October and directs visitors to the homepage for the latest seasonal timetable.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='cretan-olive-oil-farm'
    and field_key='visitor_hours'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'cretan-olive-oil-farm',
  'simple_visit_access',
  '{"booking_required":false,"walk_in_status":"accepted","duration_minutes":60}'::jsonb,
  'first_party_source',
  'https://www.cretanoliveoilfarm.com/tours',
  'Spiridi Olive Oil Farm — E-Guided Tours & Olive Oil Tasting',
  timestamptz '2026-09-19 19:05:00+03',
  'The official e-guided tour page explicitly says no reservations are needed and publishes an approximately 60-minute visit.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='cretan-olive-oil-farm'
    and field_key='simple_visit_access'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'cretan-olive-oil-farm',
  'visitor_languages',
  '{"languages":["en","fr","de","ru","pl"],"scope":"e_guided_tablet_tour"}'::jsonb,
  'first_party_source',
  'https://www.cretanoliveoilfarm.com/tours',
  'Spiridi Olive Oil Farm — E-Guided Tours & Olive Oil Tasting',
  timestamptz '2026-09-19 19:05:00+03',
  'The official tour page explicitly lists English, French, German, Russian and Polish for the tablet-guided visitor content.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='cretan-olive-oil-farm'
    and field_key='visitor_languages'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'cretan-olive-oil-farm',
  'activity_booking_rule',
  '{"advance_notice_hours":12,"scope":"activities","simple_visit_booking_required":false}'::jsonb,
  'first_party_source',
  'https://www.cretanoliveoilfarm.com/faq',
  'Spiridi Olive Oil Farm — FAQ',
  timestamptz '2026-09-19 19:05:00+03',
  'The current FAQ explicitly says all activities require booking at least 12 hours ahead, while simple visits do not require booking.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='cretan-olive-oil-farm'
    and field_key='activity_booking_rule'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);
