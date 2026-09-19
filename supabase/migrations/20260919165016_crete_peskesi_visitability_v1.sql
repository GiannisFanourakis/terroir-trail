-- Crete Visitability V1: Peskesi Organic Farm.
-- Current first-party farm page publishes a 2-hour guided farm visit every day
-- at 11:00 and 13:00, weather permitting. Booking/walk-in requirements are not
-- explicit enough to infer.

update public.producers
set
  visit_status = 'public_visits',
  visit_source_url = 'https://peskesicrete.gr/en/experiences/explore-the-farm',
  visit_notes = 'Current first-party farm page publishes a guided farm visit every day at 11:00 and 13:00. The experience lasts 2 hours, includes a guided walk through gardens, olive groves, herbs and farm animals, and ends with a small farm tasting. Tours operate only in suitable weather and may be postponed in rain or severe weather. The page provides a booking flow but does not clearly state whether advance booking is mandatory for the guided tour, so no booking/walk-in flag is inferred.',
  opening_hours = 'Guided farm tours daily at 11:00 and 13:00; tours are weather-dependent.',
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = 120,
  visitor_hours = '{
    "guided_farm_tour":{"daily_start_times":["11:00","13:00"],"weather_dependent":true}
  }'::jsonb,
  seasonal_visit_notes = 'Tours take place only under suitable weather conditions and may be postponed in rain or severe weather.',
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 19:05:00+03'
where id = 'peskesi-farm-kazani';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'peskesi-farm-kazani',
  'guided_visit_schedule',
  '{"daily_start_times":["11:00","13:00"],"duration_minutes":120,"weather_dependent":true}'::jsonb,
  'first_party_source',
  'https://peskesicrete.gr/en/experiences/explore-the-farm',
  'Peskesi — Explore the Organic & Regenerative Farm',
  timestamptz '2026-09-19 19:05:00+03',
  'The current official farm page publishes two daily guided-tour start times, a two-hour duration and weather-dependent operation.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='peskesi-farm-kazani'
    and field_key='guided_visit_schedule'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'peskesi-farm-kazani',
  'road_access_guidance',
  '{"surface":"dirt_road","producer_wording":"passable dirt road","vehicle_limit":"up to 20 seats"}'::jsonb,
  'first_party_source',
  'https://peskesicrete.gr/en/experiences/explore-the-farm',
  'Peskesi — Explore the Organic & Regenerative Farm',
  timestamptz '2026-09-19 19:05:00+03',
  'The producer currently states that access is via a passable dirt road and limits entry to vehicles with up to 20 seats. This does not imply rental-car suitability or guarantee current road conditions.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='peskesi-farm-kazani'
    and field_key='road_access_guidance'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);
