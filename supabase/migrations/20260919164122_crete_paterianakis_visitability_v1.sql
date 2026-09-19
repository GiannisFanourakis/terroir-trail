-- Crete Visitability V1: Domaine Paterianakis.
-- Current first-party hospitality page confirms the seasonal visitor timetable,
-- winter appointment-only access, 30-45 minute guided tours and wheelchair access.

update public.producers
set
  visit_status = 'seasonal_public',
  visit_source_url = 'https://paterianakis.gr/en/events/',
  visit_notes = 'Current first-party hospitality page welcomes visitors from April to mid-November on published hours and switches to appointment-only access from mid-November through March. Guided tours of the estate, vineyards, production, bottling and aging areas are published as lasting 30-45 minutes. The page also states that the visitor experience is wheelchair accessible. It does not explicitly state that reservations are mandatory during the main season or publish parking/tour-language details.',
  opening_hours = 'Apr-mid Nov: Mon-Fri 10:30-17:30; Sat-Sun 10:30-16:00. Mid-Nov-Mar: open by appointment.',
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{
    "april_to_mid_november":{"monday_friday":"10:30-17:30","saturday_sunday":"10:30-16:00"},
    "mid_november_to_march":{"access":"appointment_only"}
  }'::jsonb,
  seasonal_visit_notes = 'Guided estate tours are published as lasting 30-45 minutes. Winter access from mid-November through March is by appointment.',
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 19:05:00+03'
where id = 'domaine-paterianakis';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'domaine-paterianakis',
  'visitor_hours',
  '{"april_to_mid_november":{"monday_friday":"10:30-17:30","saturday_sunday":"10:30-16:00"},"mid_november_to_march":{"access":"appointment_only"}}'::jsonb,
  'first_party_source',
  'https://paterianakis.gr/en/events/',
  'Domaine Paterianakis — Hospitality',
  timestamptz '2026-09-19 19:05:00+03',
  'The live official hospitality page publishes the main-season visitor hours and the winter appointment-only period.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='domaine-paterianakis'
    and field_key='visitor_hours'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'domaine-paterianakis',
  'tour_duration',
  '{"minutes_min":30,"minutes_max":45,"scope":"guided_estate_tour"}'::jsonb,
  'first_party_source',
  'https://paterianakis.gr/en/events/',
  'Domaine Paterianakis — Hospitality',
  timestamptz '2026-09-19 19:05:00+03',
  'The current official hospitality page states that guided tours last between 30 and 45 minutes. This does not include any additional tasting time.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='domaine-paterianakis'
    and field_key='tour_duration'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'domaine-paterianakis',
  'wheelchair_accessible',
  '{"accessible":true}'::jsonb,
  'first_party_source',
  'https://paterianakis.gr/en/events/',
  'Domaine Paterianakis — Hospitality',
  timestamptz '2026-09-19 19:05:00+03',
  'The current official visitor page explicitly states wheelchair accessible.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='domaine-paterianakis'
    and field_key='wheelchair_accessible'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);
