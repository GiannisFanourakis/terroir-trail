-- Sicily Visitability V1: Serra Ferdinandea.
-- Current first-party site verifies the estate and agricultural project but
-- publishes no routine public visitor programme.

update public.producers
set
  visit_status = 'not_publicly_confirmed',
  visit_source_url = 'https://serraferdinandea.com/en/',
  visit_notes = 'Current first-party Serra Ferdinandea site confirms the Sambuca di Sicilia estate, vineyards, wines and agricultural project but does not publish a routine public visitor programme, tasting/tour booking flow, visitor timetable, walk-in policy, standard duration, parking details or visitor languages. Keep ordinary public access unconfirmed.',
  opening_hours = null,
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = now()
where id = 'serra-ferdinandea-sicily';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'serra-ferdinandea-sicily','visit_status',
  '{"status":"not_publicly_confirmed"}'::jsonb,
  'first_party_source',
  'https://serraferdinandea.com/en/',
  'Serra Ferdinandea — official site',
  now(),
  'The current first-party site verifies the estate identity and agricultural project but publishes no current routine visitor programme or access procedure.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='serra-ferdinandea-sicily'
    and field_key='visit_status'
    and source_url='https://serraferdinandea.com/en/'
);
