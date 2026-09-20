-- Puglia Visitability V1: Agricola Piano.
-- Current first-party site verifies the Apricena farm and production identity
-- but publishes no current public visitor programme.

update public.producers
set
  visit_status = 'not_publicly_confirmed',
  visit_source_url = 'https://www.agricolapiano.com/en/',
  visit_notes = 'Current first-party Agricola Piano site verifies the Apricena family farm, direct supply chain, wheat, olive and EVOO production, but current navigation and indexed first-party pages do not publish a public farm visit, mill tour, tasting programme, visitor timetable, booking rule or walk-in policy. Product tasting gift sets and e-commerce references are not treated as evidence of on-site visitability.',
  opening_hours = null,
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = now()
where id = 'agricola-piano-puglia';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'agricola-piano-puglia','visit_status',
  '{"status":"not_publicly_confirmed"}'::jsonb,
  'first_party_source',
  'https://www.agricolapiano.com/en/',
  'Agricola Piano — official site',
  now(),
  'The current first-party site verifies the farm and production identity but publishes no current public visitor programme or access procedure.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='agricola-piano-puglia'
    and field_key='visit_status'
    and source_url='https://www.agricolapiano.com/en/'
);
