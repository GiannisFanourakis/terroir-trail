-- Piedmont Visitability V1: NoccioleNatura.
-- Current first-party page explicitly offers a 90-minute farm tour with final
-- tasting through a prior quote/booking request.

update public.producers
set
  visit_status = 'appointment_only',
  visit_source_url = 'https://nocciolenatura.it/azienda.html',
  visit_notes = 'Current first-party NoccioleNatura company page explicitly offers a 1.5-hour farm tour with final tasting and directs visitors to request a quote/booking. The current page does not publish fixed visitor hours, parking details, visitor languages or walk-in access.',
  opening_hours = '90-minute farm tour with final tasting by prior request; no fixed visitor timetable published.',
  visit_booking_requirement = 'required',
  walk_in_status = 'not_accepted',
  parking_status = null,
  typical_visit_minutes = 90,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = now()
where id = 'nocciolenatura-piedmont';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'nocciolenatura-piedmont','booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted","mechanism":"quote_request"}'::jsonb,
  'first_party_source',
  'https://nocciolenatura.it/azienda.html',
  'NoccioleNatura — Azienda',
  now(),
  'The current official page offers the tour through a request-a-quote/booking flow.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='nocciolenatura-piedmont'
    and field_key='booking_requirement'
    and source_url='https://nocciolenatura.it/azienda.html'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'nocciolenatura-piedmont','typical_visit_minutes',
  '{"minutes":90,"scope":"farm_tour_with_tasting"}'::jsonb,
  'first_party_source',
  'https://nocciolenatura.it/azienda.html',
  'NoccioleNatura — Azienda',
  now(),
  'The current official page explicitly states the tour lasts 1.5 hours.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='nocciolenatura-piedmont'
    and field_key='typical_visit_minutes'
    and source_url='https://nocciolenatura.it/azienda.html'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'nocciolenatura-piedmont','visitor_offering',
  '{"farm_tour":true,"final_tasting":true}'::jsonb,
  'first_party_source',
  'https://nocciolenatura.it/azienda.html',
  'NoccioleNatura — Azienda',
  now(),
  'The current first-party page explicitly offers a farm tour with final tasting.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='nocciolenatura-piedmont'
    and field_key='visitor_offering'
    and source_url='https://nocciolenatura.it/azienda.html'
);
