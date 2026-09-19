-- Crete Visitability V1: Solo Cretan Craft Brewery.
-- Current first-party site welcomes visitors, requires prior contact so the visit
-- can be scheduled, and publishes weekday visiting hours plus weekend appointments.

update public.producers
set
  visit_status = 'appointment_only',
  visit_source_url = 'https://solobeer.gr/en/',
  visit_notes = 'Current first-party site explicitly welcomes visitors to the Kallithea brewery and asks them to contact the brewery before visiting so the visit can be scheduled. Published visiting hours are 11:00-16:00 on weekdays, with Saturday and Sunday by appointment. Group tastings, brewery tours and tailor-made experiences are available after communication. Parking, visit duration and visitor languages are not published.',
  opening_hours = 'Mon-Fri 11:00-16:00; Sat-Sun by appointment. Contact before visiting so the brewery can schedule the visit.',
  visit_booking_requirement = 'required',
  walk_in_status = 'not_accepted',
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{
    "monday_friday":"11:00-16:00",
    "saturday_sunday":"appointment_only"
  }'::jsonb,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 00:00:00+03'
where id = 'solo-craft-brewery';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'solo-craft-brewery',
  'visit_status',
  '{"status":"appointment_only","booking_required":true,"walk_in_status":"not_accepted"}'::jsonb,
  'first_party_source',
  'https://solobeer.gr/en/',
  'Solo Cretan Craft Brewery — official site',
  timestamptz '2026-09-19 00:00:00+03',
  'The official site welcomes visitors but explicitly asks them to contact the brewery before visiting so the visit can be scheduled.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='solo-craft-brewery'
    and field_key='visit_status'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'solo-craft-brewery',
  'visitor_hours',
  '{"monday_friday":"11:00-16:00","saturday_sunday":"appointment_only"}'::jsonb,
  'first_party_source',
  'https://solobeer.gr/en/',
  'Solo Cretan Craft Brewery — official site',
  timestamptz '2026-09-19 00:00:00+03',
  'Published visiting hours are 11:00-16:00 on weekdays; weekends are by appointment.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='solo-craft-brewery'
    and field_key='visitor_hours'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);
