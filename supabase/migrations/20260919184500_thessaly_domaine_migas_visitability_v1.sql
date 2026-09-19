-- Thessaly Visitability V1: Domaine D. Migas.
-- Current first-party visit page explicitly requires advance booking,
-- publishes visitor hours, and gives a 45-60 minute guided visit duration.

update public.producers
set
  visit_status = 'appointment_only',
  visit_source_url = 'https://domaine-migas.gr/en/experiences/visit/',
  visit_notes = 'Current first-party visit page explicitly requires advance booking. Guided visits include the vineyard, production, bottling and ageing areas and last approximately 45-60 minutes. Published visitor hours are Monday-Friday 10:00-16:00 and Saturday 11:00-17:00; Sunday and official holidays are closed. Parking and actual visitor languages are not explicitly published.',
  opening_hours = 'Mon-Fri 10:00-16:00; Sat 11:00-17:00; Sun and official holidays closed. Advance booking required.',
  visit_booking_requirement = 'required',
  walk_in_status = 'not_accepted',
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{
    "monday_friday":"10:00-16:00",
    "saturday":"11:00-17:00",
    "sunday":"closed",
    "official_holidays":"closed"
  }'::jsonb,
  seasonal_visit_notes = 'Guided visit duration is published as approximately 45-60 minutes.',
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 20:29:00+03'
where id = 'domaine-d-migas-thessaly';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'domaine-d-migas-thessaly',
  'booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted"}'::jsonb,
  'first_party_source',
  'https://domaine-migas.gr/en/experiences/visit/',
  'Domaine D. Migas — Visit',
  timestamptz '2026-09-19 20:29:00+03',
  'The current official Visit page states that timely advance booking is necessary.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='domaine-d-migas-thessaly'
    and field_key='booking_requirement'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'domaine-d-migas-thessaly',
  'visitor_hours',
  '{"monday_friday":"10:00-16:00","saturday":"11:00-17:00","sunday":"closed","official_holidays":"closed"}'::jsonb,
  'first_party_source',
  'https://domaine-migas.gr/en/experiences/visit/',
  'Domaine D. Migas — Visit',
  timestamptz '2026-09-19 20:29:00+03',
  'The current official Visit page publishes weekday/Saturday visitor hours and Sunday/official-holiday closure.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='domaine-d-migas-thessaly'
    and field_key='visitor_hours'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'domaine-d-migas-thessaly',
  'programme_durations',
  '{"minutes_min":45,"minutes_max":60,"variable":true}'::jsonb,
  'first_party_source',
  'https://domaine-migas.gr/en/experiences/visit/',
  'Domaine D. Migas — Visit',
  timestamptz '2026-09-19 20:29:00+03',
  'The official Visit page states the guided tour lasts approximately 45-60 minutes.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='domaine-d-migas-thessaly'
    and field_key='programme_durations'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);
