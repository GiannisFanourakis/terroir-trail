-- Puglia Visitability V1: Olio Mimi.
-- Current first-party site verifies the Modugno mill but publishes no current
-- public visitor programme or access procedure.

update public.producers
set
  visit_status = 'not_publicly_confirmed',
  visit_source_url = 'https://www.oliomimi.com/en/',
  visit_notes = 'Current first-party Olio Mimì site verifies the active Modugno oil mill, production identity and direct contact/e-commerce channels, but current navigation and indexed first-party pages do not publish a public mill visit, guided tasting programme, visitor timetable, booking rule or walk-in policy. Keep ordinary public access unconfirmed.',
  opening_hours = null,
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = now()
where id = 'olio-mimi-puglia';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'olio-mimi-puglia','visit_status',
  '{"status":"not_publicly_confirmed"}'::jsonb,
  'first_party_source',
  'https://www.oliomimi.com/en/',
  'Olio Mimì — official site',
  now(),
  'The current first-party site verifies the oil mill and production identity but publishes no current public visitor programme or access procedure.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='olio-mimi-puglia'
    and field_key='visit_status'
    and source_url='https://www.oliomimi.com/en/'
);
