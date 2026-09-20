-- Puglia Visitability V1: Masseria Il Frantoio.
-- Current first-party page publishes a 60-minute guided olive-oil experience.
-- It is bookable, but the page does not explicitly state a universal advance-
-- reservation requirement.

update public.producers
set
  visit_status = 'public_visits',
  visit_source_url = 'https://www.masseriailfrantoio.it/en/farmhouse-for-oil-tasting-near-ostuni',
  visit_notes = 'Current first-party Masseria Il Frantoio page publishes a 60-minute olive-oil experience including a guided visit through the farmhouse, underground oil mill and ancient olive grove, followed by a technical tasting of four organic extra virgin olive oils. The page invites visitors to book the experience but does not explicitly state that advance reservation is universally mandatory, define walk-in access, publish general visitor hours, parking details, or visitor languages.',
  opening_hours = 'Bookable 60-minute olive-oil experience; no general visitor timetable published.',
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = 60,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = now()
where id = 'masseria-il-frantoio-puglia';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'masseria-il-frantoio-puglia','typical_visit_minutes',
  '{"minutes":60,"scope":"olive_oil_experience","approximate":true}'::jsonb,
  'first_party_source',
  'https://www.masseriailfrantoio.it/en/farmhouse-for-oil-tasting-near-ostuni',
  'Masseria Il Frantoio — Olive Oil Experience',
  now(),
  'The current official page states the olive-oil experience lasts approximately 60 minutes.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='masseria-il-frantoio-puglia'
    and field_key='typical_visit_minutes'
    and source_url='https://www.masseriailfrantoio.it/en/farmhouse-for-oil-tasting-near-ostuni'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'masseria-il-frantoio-puglia','visitor_offering',
  '{"guided_farmhouse_visit":true,"underground_oil_mill":true,"ancient_olive_grove":true,"technical_evoo_tasting":true,"oils_tasted":4}'::jsonb,
  'first_party_source',
  'https://www.masseriailfrantoio.it/en/farmhouse-for-oil-tasting-near-ostuni',
  'Masseria Il Frantoio — Olive Oil Experience',
  now(),
  'The current first-party page explicitly describes these components.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='masseria-il-frantoio-puglia'
    and field_key='visitor_offering'
    and source_url='https://www.masseriailfrantoio.it/en/farmhouse-for-oil-tasting-near-ostuni'
);
