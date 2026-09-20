-- Piedmont Visitability V1: Cascina Barroero.
-- Current first-party page publishes bookable guided hazelnut tours with
-- fixed arrival times for tasting and lunch formats.

update public.producers
set
  visit_status = 'appointment_only',
  visit_source_url = 'https://www.barroero.it/en/guided-tours/',
  visit_notes = 'Current first-party Cascina Barroero page publishes guided hazelnut-farm tours through the fields, shelling room and pastry production, ending with either tasting or lunch. The page explicitly provides separate booking-by-email instructions for both formats. Tour & Tasting arrival times are 09:00 or 11:00; Tour & Lunch arrival time is 11:00. No standard duration, parking details, visitor languages or walk-in option are published.',
  opening_hours = 'Tour & Tasting arrival: 09:00 or 11:00. Tour & Lunch arrival: 11:00. Advance booking by email.',
  visit_booking_requirement = 'required',
  walk_in_status = 'not_accepted',
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{"tour_tasting":{"arrival_times":["09:00","11:00"]},"tour_lunch":{"arrival_time":"11:00"}}'::jsonb,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = now()
where id = 'cascina-barroero-piedmont';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'cascina-barroero-piedmont','booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted","mechanism":"email_booking"}'::jsonb,
  'first_party_source',
  'https://www.barroero.it/en/guided-tours/',
  'Cascina Barroero — Guided Tours',
  now(),
  'The current official guided-tour page provides explicit booking-by-email instructions for both tour formats.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='cascina-barroero-piedmont'
    and field_key='booking_requirement'
    and source_url='https://www.barroero.it/en/guided-tours/'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'cascina-barroero-piedmont','visitor_hours',
  '{"tour_tasting":{"arrival_times":["09:00","11:00"]},"tour_lunch":{"arrival_time":"11:00"}}'::jsonb,
  'first_party_source',
  'https://www.barroero.it/en/guided-tours/',
  'Cascina Barroero — Guided Tours',
  now(),
  'The current official page publishes 09:00/11:00 arrivals for Tour & Tasting and 11:00 for Tour & Lunch.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='cascina-barroero-piedmont'
    and field_key='visitor_hours'
    and source_url='https://www.barroero.it/en/guided-tours/'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'cascina-barroero-piedmont','visitor_offering',
  '{"hazelnut_field_tour":true,"shelling_room":true,"pastry_production":true,"tasting":true,"hazelnut_lunch":true}'::jsonb,
  'first_party_source',
  'https://www.barroero.it/en/guided-tours/',
  'Cascina Barroero — Guided Tours',
  now(),
  'The current first-party page explicitly describes these visit components.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='cascina-barroero-piedmont'
    and field_key='visitor_offering'
    and source_url='https://www.barroero.it/en/guided-tours/'
);
