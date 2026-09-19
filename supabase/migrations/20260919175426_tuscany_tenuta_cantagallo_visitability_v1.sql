-- Tuscany Visitability V1: Tenuta Cantagallo.
-- Current first-party activity page confirms wine/olive-oil tastings and
-- guided winery, vineyard and olive-grove visits upon request, with tours
-- offered in Italian, English, French and German.

update public.producers
set
  visit_status = 'appointment_only',
  visit_source_url = 'https://www.cantagallolefarnete.it/en/the-activities/',
  visit_notes = 'Current first-party Cantagallo activity page states that food-and-wine tastings and guided visits of wineries, vineyards and olive groves are organised upon request for both agriturismo guests and outside groups. Tours include Cantagallo wines and extra-virgin olive oil and are conducted in Italian, English, French and German. No current public visitor timetable, standard duration, parking details, or ordinary walk-in policy are published.',
  opening_hours = 'Visits and tastings by prior request; no general public visitor timetable published.',
  visit_booking_requirement = 'required',
  walk_in_status = 'not_accepted',
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = array['it','en','fr','de'],
  visitability_reviewed_at = now()
where id = 'tenuta-cantagallo-tuscany';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'tenuta-cantagallo-tuscany',
  'booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted","wording":"upon_request"}'::jsonb,
  'first_party_source',
  'https://www.cantagallolefarnete.it/en/the-activities/',
  'Cantagallo Le Farnete — The activities',
  now(),
  'The current official activity page states that food-and-wine tastings and guided winery/vineyard/olive-grove visits are organised upon request.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='tenuta-cantagallo-tuscany'
    and field_key='booking_requirement'
    and source_url='https://www.cantagallolefarnete.it/en/the-activities/'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'tenuta-cantagallo-tuscany',
  'visitor_languages',
  '{"languages":["it","en","fr","de"],"scope":"guided_tours"}'::jsonb,
  'first_party_source',
  'https://www.cantagallolefarnete.it/en/the-activities/',
  'Cantagallo Le Farnete — The activities',
  now(),
  'The current official activity page explicitly lists Italian, English, French and German for guided tours.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='tenuta-cantagallo-tuscany'
    and field_key='visitor_languages'
    and source_url='https://www.cantagallolefarnete.it/en/the-activities/'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'tenuta-cantagallo-tuscany',
  'visitor_offering',
  '{"wine_tasting":true,"olive_oil_tasting":true,"guided_winery_visit":true,"vineyard_visit":true,"olive_grove_visit":true}'::jsonb,
  'first_party_source',
  'https://www.cantagallolefarnete.it/en/the-activities/',
  'Cantagallo Le Farnete — The activities',
  now(),
  'The current first-party activity page explicitly describes these visitor activities.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='tenuta-cantagallo-tuscany'
    and field_key='visitor_offering'
    and source_url='https://www.cantagallolefarnete.it/en/the-activities/'
);
