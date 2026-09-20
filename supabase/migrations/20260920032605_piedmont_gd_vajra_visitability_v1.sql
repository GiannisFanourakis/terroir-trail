-- Piedmont Visitability V1: G.D. Vajra.
-- Current first-party page explicitly receives visitors by reservation seven
-- days per week in two published visitor windows.

update public.producers
set
  visit_status = 'appointment_only',
  visit_source_url = 'https://www.gdvajra.it/en/visit-our-winery',
  visit_notes = 'Current first-party G.D. Vajra visit page explicitly states that the winery receives visitors on reservation Monday-Sunday, 10:00-13:00 and 15:00-18:00, and offers winery tours with guided wine tasting. The current page does not publish a standard visit duration, parking details or visitor languages.',
  opening_hours = 'Mon-Sun 10:00-13:00 and 15:00-18:00 by reservation.',
  visit_booking_requirement = 'required',
  walk_in_status = 'not_accepted',
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{"monday_sunday":["10:00-13:00","15:00-18:00"]}'::jsonb,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = now()
where id = 'gd-vajra-piedmont';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'gd-vajra-piedmont','booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted"}'::jsonb,
  'first_party_source',
  'https://www.gdvajra.it/en/visit-our-winery',
  'G.D. Vajra — Visit Our Winery',
  now(),
  'The current official page explicitly says visitors are received on reservation.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='gd-vajra-piedmont'
    and field_key='booking_requirement'
    and source_url='https://www.gdvajra.it/en/visit-our-winery'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'gd-vajra-piedmont','visitor_hours',
  '{"monday_sunday":["10:00-13:00","15:00-18:00"]}'::jsonb,
  'first_party_source',
  'https://www.gdvajra.it/en/visit-our-winery',
  'G.D. Vajra — Visit Our Winery',
  now(),
  'The current official page publishes Monday-Sunday 10:00-13:00 and 15:00-18:00.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='gd-vajra-piedmont'
    and field_key='visitor_hours'
    and source_url='https://www.gdvajra.it/en/visit-our-winery'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'gd-vajra-piedmont','visitor_offering',
  '{"winery_tour":true,"guided_wine_tasting":true}'::jsonb,
  'first_party_source',
  'https://www.gdvajra.it/en/visit-our-winery',
  'G.D. Vajra — Visit Our Winery',
  now(),
  'The current first-party page explicitly offers a winery visit and guided tasting.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='gd-vajra-piedmont'
    and field_key='visitor_offering'
    and source_url='https://www.gdvajra.it/en/visit-our-winery'
);
