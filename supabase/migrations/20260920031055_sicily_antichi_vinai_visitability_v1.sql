-- Sicily Visitability V1: Antichi Vinai 1877.
-- Current first-party pages clearly advertise public cellar tours/tastings and
-- link to a live booking platform, but do not state a universal booking mandate.

update public.producers
set
  visit_status = 'public_visits',
  visit_source_url = 'https://www.antichivinai.it/en/experience-the-volcano/',
  visit_notes = 'Current first-party Antichi Vinai pages explicitly welcome visitors for underground-cellar tours and Etna wine tastings, and the producer links to a live booking platform with multiple visitor experiences. A currently listed short winery-tour-and-tasting experience lasts 60 minutes. The current first-party pages do not explicitly state that all visits require advance booking, define a general walk-in policy, publish universal visitor hours, parking details, or visitor languages.',
  opening_hours = 'Visitor experiences are published through the live booking platform; no universal visitor timetable is stated.',
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = now()
where id = 'antichi-vinai-1877-sicily';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'antichi-vinai-1877-sicily','visitor_offering',
  '{"underground_cellar_tour":true,"wine_tasting":true,"live_booking_platform":true}'::jsonb,
  'first_party_source',
  'https://www.antichivinai.it/en/experience-the-volcano/',
  'Antichi Vinai 1877 — Experience the Volcano',
  now(),
  'Current official pages explicitly invite visitors for cellar tours and tastings and link to the producer booking platform.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='antichi-vinai-1877-sicily'
    and field_key='visitor_offering'
    and source_url='https://www.antichivinai.it/en/experience-the-volcano/'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'antichi-vinai-1877-sicily','programme_durations',
  '{"short_winery_tour_tasting_minutes":60}'::jsonb,
  'first_party_source',
  'https://visit.antichivinai.it/en/691b390b24c5101bdfd90ec6?lang=en',
  'Antichi Vinai 1877 — live booking platform',
  now(),
  'The current producer-linked booking platform lists a short winery tour and two-wine tasting lasting one hour.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='antichi-vinai-1877-sicily'
    and field_key='programme_durations'
    and source_url='https://visit.antichivinai.it/en/691b390b24c5101bdfd90ec6?lang=en'
);
