-- Sicily Visitability V1: Santa Tresa.
-- Current first-party pages publish Mon-Sat core tasting/tour programmes and
-- package-specific durations, but do not explicitly state a universal advance
-- booking mandate.

update public.producers
set
  visit_status = 'public_visits',
  visit_source_url = 'https://www.santatresa.com/en/tastings-and-tours/tastings-and-tours/',
  visit_notes = 'Current first-party Santa Tresa pages publish winery tours, vineyard walks, wine tastings, Sicilian brunch and workshop experiences. Core tasting experiences are available Monday-Saturday; the Excellence experience is Wednesday-Saturday. Published core visit durations range from 90 minutes to 2 hours. Each experience provides direct booking contacts, but the current first-party pages do not explicitly state a universal advance-booking mandate or define general walk-in access. Parking and visitor languages are not explicitly published.',
  opening_hours = 'Core tasting experiences: Mon-Sat. Excellence experience: Wed-Sat. Contact the estate for specific availability.',
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{
    "classics_of_vittoria":"monday_saturday",
    "sicilian_brunch":"monday_saturday",
    "excellence":"wednesday_saturday"
  }'::jsonb,
  seasonal_visit_notes = 'Published core tasting durations range from 90 to 120 minutes depending on the experience.',
  visitor_languages = null,
  visitability_reviewed_at = now()
where id = 'santa-tresa-sicily';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'santa-tresa-sicily','visitor_hours',
  '{"classics_of_vittoria":"monday_saturday","sicilian_brunch":"monday_saturday","excellence":"wednesday_saturday"}'::jsonb,
  'first_party_source',
  'https://www.santatresa.com/en/tastings-and-tours/tastings-and-tours/',
  'Santa Tresa — Tastings & Tours',
  now(),
  'Current first-party experience pages publish these day ranges for the core tasting programmes.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='santa-tresa-sicily'
    and field_key='visitor_hours'
    and source_url='https://www.santatresa.com/en/tastings-and-tours/tastings-and-tours/'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'santa-tresa-sicily','programme_durations',
  '{"classics_of_vittoria_minutes":90,"sicilian_brunch_minutes":90,"excellence_minutes":120}'::jsonb,
  'first_party_source',
  'https://www.santatresa.com/en/tastings-and-tours/tastings-and-tours/',
  'Santa Tresa — Tastings & Tours',
  now(),
  'Current first-party experience pages publish 90-minute Classics/Brunch visits and a 120-minute Excellence visit.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='santa-tresa-sicily'
    and field_key='programme_durations'
    and source_url='https://www.santatresa.com/en/tastings-and-tours/tastings-and-tours/'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'santa-tresa-sicily','visitor_offering',
  '{"vineyard_visit":true,"wine_tasting":true,"sicilian_brunch":true,"workshops":true}'::jsonb,
  'first_party_source',
  'https://www.santatresa.com/en/tastings-and-tours/tastings-and-tours/',
  'Santa Tresa — Tastings & Tours',
  now(),
  'The current first-party tourism section publishes these visitor offerings.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='santa-tresa-sicily'
    and field_key='visitor_offering'
    and source_url='https://www.santatresa.com/en/tastings-and-tours/tastings-and-tours/'
);
