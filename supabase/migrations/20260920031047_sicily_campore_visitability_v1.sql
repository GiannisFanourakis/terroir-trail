-- Sicily Visitability V1: Campore.
-- Current first-party pages publish multiple visitor experiences. Several
-- packages explicitly require reservations, while simpler tastings only expose
-- booking flows, so no universal booking mandate is inferred.

update public.producers
set
  visit_status = 'public_visits',
  visit_source_url = 'https://camporewine.it/en/tastings/',
  visit_notes = 'Current first-party Camporè tasting page publishes multiple visitor experiences at the Randazzo estate, ranging from 60-minute tastings to approximately 4-hour food, wine and wellness experiences. Several experiences explicitly require reservations, while the two simplest tasting formats provide a Book Here flow without stating a universal reservation mandate. The current pages do not define a general walk-in policy, ordinary visitor hours, parking details, or visitor languages.',
  opening_hours = 'Visitor experiences are bookable on published experience pages; no general visitor timetable is stated.',
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = 'Some experiences are weather-dependent. Published programme durations range from 60 minutes to approximately 4 hours.',
  visitor_languages = null,
  visitability_reviewed_at = now()
where id = 'campore-wine-sicily';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'campore-wine-sicily','programme_durations',
  '{"on_the_volcano_minutes":60,"etna_traditions_minutes":90,"campore_experience_minutes":180,"etna_in_a_glass_minutes":180,"luxury_sensory_minutes":240,"picnic_basic_minutes":120,"picnic_premium_minutes":180,"cooking_class_minutes":240}'::jsonb,
  'first_party_source',
  'https://camporewine.it/en/tastings/',
  'Camporè — Tastings',
  now(),
  'Current first-party tasting page publishes package-specific durations; no single typical visit duration is appropriate.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='campore-wine-sicily'
    and field_key='programme_durations'
    and source_url='https://camporewine.it/en/tastings/'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'campore-wine-sicily','package_booking_requirements',
  '{"campore_experience":"required","etna_in_a_glass":"required","luxury_sensory":"required","picnic_basic":"required","picnic_premium":"required","massage_in_cellar":"required","body_and_spirit":"required","on_the_volcano":"book_here_flow","etna_traditions":"book_here_flow"}'::jsonb,
  'first_party_source',
  'https://camporewine.it/en/tastings/',
  'Camporè — Tastings',
  now(),
  'The current page explicitly labels several experiences reservation-required, while two simpler tasting formats only expose booking links. A universal booking rule is therefore not inferred.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='campore-wine-sicily'
    and field_key='package_booking_requirements'
    and source_url='https://camporewine.it/en/tastings/'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'campore-wine-sicily','visitor_offering',
  '{"wine_tasting":true,"food_wine_experience":true,"vineyard_picnic":true,"cooking_class":true,"wellness_experiences":true}'::jsonb,
  'first_party_source',
  'https://camporewine.it/en/tastings/',
  'Camporè — Tastings',
  now(),
  'The current official tasting page publishes these visitor experience categories.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='campore-wine-sicily'
    and field_key='visitor_offering'
    and source_url='https://camporewine.it/en/tastings/'
);
