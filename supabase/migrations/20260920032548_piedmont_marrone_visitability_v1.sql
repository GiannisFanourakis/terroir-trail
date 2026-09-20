-- Piedmont Visitability V1: Agricola Gian Piero Marrone.
-- Current first-party winery page requires the booking form for winery tours.
-- Separate restaurant hours are not treated as winery-visit hours.

update public.producers
set
  visit_status = 'appointment_only',
  visit_source_url = 'https://www.agricolamarrone.com/en/book-a-visit/',
  visit_notes = 'Current first-party Agricola Gian Piero Marrone winery page explicitly instructs visitors to complete the booking form to book a winery tour and publishes winery tours, tastings, cooking classes, viticulture lessons and guided tastings. Separate restaurant opening hours are not treated as winery-visit hours. The current winery pages do not publish a universal tour timetable, standard duration, parking details or visitor languages.',
  opening_hours = 'Winery tours and tastings by advance booking; no universal winery-visit timetable published.',
  visit_booking_requirement = 'required',
  walk_in_status = 'not_accepted',
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = now()
where id = 'agricola-gian-piero-marrone-piedmont';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'agricola-gian-piero-marrone-piedmont','booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted","mechanism":"booking_form"}'::jsonb,
  'first_party_source',
  'https://www.agricolamarrone.com/en/book-a-visit/',
  'Agricola Gian Piero Marrone — Book a Visit',
  now(),
  'The current official winery page explicitly instructs visitors to fill out the booking form to book a tour.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='agricola-gian-piero-marrone-piedmont'
    and field_key='booking_requirement'
    and source_url='https://www.agricolamarrone.com/en/book-a-visit/'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'agricola-gian-piero-marrone-piedmont','visitor_offering',
  '{"winery_tour":true,"wine_tasting":true,"cooking_classes":true,"viticulture_lessons":true,"guided_tastings":true}'::jsonb,
  'first_party_source',
  'https://www.agricolamarrone.com/en/book-a-visit/',
  'Agricola Gian Piero Marrone — Book a Visit',
  now(),
  'The current first-party visitor page lists these visit formats.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='agricola-gian-piero-marrone-piedmont'
    and field_key='visitor_offering'
    and source_url='https://www.agricolamarrone.com/en/book-a-visit/'
);
