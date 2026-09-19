-- Peloponnese Visitability V1: Tetramythos Winery.
-- Current first-party site identifies a visitable winery with tours and
-- publishes current tasting-room hours. Booking/walk-in rules remain unstated.

update public.producers
set
  visit_status = 'public_visits',
  visit_source_url = 'https://www.tetramythoswines.com/contact/',
  visit_notes = 'Current first-party site explicitly presents Tetramythos as a visitable winery offering tours, and the current contact page publishes tasting-room hours. The tasting room is open Monday-Friday 08:00-16:00 and Saturday-Sunday 09:00-14:00. The current official pages do not explicitly state whether advance booking is required, whether walk-ins are guaranteed, or publish parking, visit duration or visitor-language details.',
  opening_hours = 'Tasting room: Mon-Fri 08:00-16:00; Sat-Sun 09:00-14:00.',
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{
    "tasting_room":{"monday_friday":"08:00-16:00","saturday_sunday":"09:00-14:00"}
  }'::jsonb,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 00:00:00+03'
where id = 'tetramythos-winery';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'tetramythos-winery','visitor_hours',
  '{"tasting_room":{"monday_friday":"08:00-16:00","saturday_sunday":"09:00-14:00"}}'::jsonb,
  'first_party_source',
  'https://www.tetramythoswines.com/contact/',
  'Tetramythos Winery — Contact',
  timestamptz '2026-09-19 00:00:00+03',
  'The current first-party contact page publishes tasting-room hours for weekdays and weekends.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='tetramythos-winery' and field_key='visitor_hours'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'tetramythos-winery','visitor_offering',
  '{"visitable_winery":true,"guided_tours":true,"tasting_room":true}'::jsonb,
  'first_party_source',
  'https://www.tetramythoswines.com/',
  'Tetramythos Winery — official homepage',
  timestamptz '2026-09-19 00:00:00+03',
  'The current official homepage identifies Tetramythos as a visitable winery and advertises tours and winery exhibition/visitor facilities.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='tetramythos-winery' and field_key='visitor_offering'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);
