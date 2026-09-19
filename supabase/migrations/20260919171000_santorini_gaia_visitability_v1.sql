-- Santorini Visitability V1: GAIA Wines Santorini.
-- Current first-party 2026 page publishes exact season/hours, recommends advance
-- booking while allowing walk-ins subject to availability, gives a 60-minute
-- tasting duration, and explicitly offers Greek/English guided visits.

update public.producers
set
  visit_status = 'seasonal_public',
  visit_source_url = 'https://gaiawines.gr/en/visit-santorini-en/',
  visit_notes = 'Current 2026 first-party visitor page publishes the Santorini season from 29 April to 31 October, daily 12:00-20:00. Guided tastings of 4-7 wines last approximately 1 hour. Advance online booking is recommended, especially in July-August, while walk-ins may be accommodated depending on availability. Guided visits are offered in Greek and English. Larger groups should contact the winery in advance.',
  opening_hours = '29 Apr-31 Oct: daily 12:00-20:00.',
  visit_booking_requirement = 'recommended',
  walk_in_status = 'subject_to_availability',
  parking_status = null,
  typical_visit_minutes = 60,
  visitor_hours = '{
    "season":{"start":"04-29","end":"10-31"},
    "daily":"12:00-20:00"
  }'::jsonb,
  seasonal_visit_notes = 'Advance online booking is recommended, especially during July-August. Larger groups should contact the winery in advance.',
  visitor_languages = array['el','en'],
  visitability_reviewed_at = timestamptz '2026-09-19 00:00:00+03'
where id = 'gaia-wines-santorini';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'gaia-wines-santorini',
  'visitor_hours',
  '{"season":{"start":"04-29","end":"10-31"},"daily":"12:00-20:00"}'::jsonb,
  'first_party_source',
  'https://gaiawines.gr/en/visit-santorini-en/',
  'GAIA Wines — Santorini Winery Tours & Wine Tasting',
  timestamptz '2026-09-19 00:00:00+03',
  'The current official page, updated in September 2026, publishes the 29 April-31 October season and daily 12:00-20:00 hours.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='gaia-wines-santorini'
    and field_key='visitor_hours'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'gaia-wines-santorini',
  'booking_requirement',
  '{"requirement":"recommended","walk_in_status":"subject_to_availability"}'::jsonb,
  'first_party_source',
  'https://gaiawines.gr/en/visit-santorini-en/',
  'GAIA Wines — FAQ',
  timestamptz '2026-09-19 00:00:00+03',
  'The official FAQ says walk-ins may be accommodated depending on availability, while advance booking is recommended to guarantee a preferred time.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='gaia-wines-santorini'
    and field_key='booking_requirement'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'gaia-wines-santorini',
  'typical_visit_minutes',
  '{"minutes":60,"scope":"guided_tasting"}'::jsonb,
  'first_party_source',
  'https://gaiawines.gr/en/visit-santorini-en/',
  'GAIA Wines — Santorini Winery Tours & Wine Tasting',
  timestamptz '2026-09-19 00:00:00+03',
  'The official visitor page states that each guided tasting lasts approximately one hour.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='gaia-wines-santorini'
    and field_key='typical_visit_minutes'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'gaia-wines-santorini',
  'visitor_languages',
  '{"languages":["el","en"],"scope":"guided_visits"}'::jsonb,
  'first_party_source',
  'https://gaiawines.gr/en/visit-santorini-en/',
  'GAIA Wines — FAQ',
  timestamptz '2026-09-19 00:00:00+03',
  'The current official FAQ explicitly states that fully guided tours are offered in Greek and English.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='gaia-wines-santorini'
    and field_key='visitor_languages'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);
