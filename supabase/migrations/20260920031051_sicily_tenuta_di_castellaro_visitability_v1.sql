-- Sicily Visitability V1: Tenuta di Castellaro.
-- Current first-party experience page repeatedly states core tastings and
-- experiences are only by reservation and publishes fixed/sunset-dependent slots.

update public.producers
set
  visit_status = 'appointment_only',
  visit_source_url = 'https://www.tenutadicastellaro.it/en/experiences-and-tastings/',
  visit_notes = 'Current first-party Tenuta di Castellaro experience page publishes guided tastings, sunset experiences, vineyard activities, cooking classes and food-and-wine experiences. Core tasting and experience listings explicitly state only by reservation and publish fixed or sunset-dependent time slots. Examples include daily 12:30 tastings, a daily 11:00 cooking class, and a Monday-Friday 09:30 vineyard experience. Published durations vary by package; the principal wine tastings last about two hours. Parking and visitor languages are not explicitly published.',
  opening_hours = 'Experiences operate on published time slots and by reservation; see current booking page for date-specific availability.',
  visit_booking_requirement = 'required',
  walk_in_status = 'not_accepted',
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{
    "core_tastings":{"daily":"12:30"},
    "cooking_class":{"daily":"11:00"},
    "vineyard_light_lunch":{"monday_friday":"09:30"},
    "sunset_experiences":"sunset_dependent"
  }'::jsonb,
  seasonal_visit_notes = 'Sunset experiences vary with sunset time. Some published experiences note cool evening temperatures and weather-dependent conditions.',
  visitor_languages = null,
  visitability_reviewed_at = now()
where id = 'tenuta-di-castellaro-sicily';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'tenuta-di-castellaro-sicily','booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted"}'::jsonb,
  'first_party_source',
  'https://www.tenutadicastellaro.it/en/experiences-and-tastings/',
  'Tenuta di Castellaro — Tastings and Experiences',
  now(),
  'Current first-party experience listings repeatedly state that core tastings and experiences are available only by reservation.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='tenuta-di-castellaro-sicily'
    and field_key='booking_requirement'
    and source_url='https://www.tenutadicastellaro.it/en/experiences-and-tastings/'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'tenuta-di-castellaro-sicily','visitor_hours',
  '{"core_tastings":{"daily":"12:30"},"cooking_class":{"daily":"11:00"},"vineyard_light_lunch":{"monday_friday":"09:30"},"sunset_experiences":"sunset_dependent"}'::jsonb,
  'first_party_source',
  'https://www.tenutadicastellaro.it/en/experiences-and-tastings/',
  'Tenuta di Castellaro — Tastings and Experiences',
  now(),
  'Current first-party page publishes these fixed and sunset-dependent experience slots.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='tenuta-di-castellaro-sicily'
    and field_key='visitor_hours'
    and source_url='https://www.tenutadicastellaro.it/en/experiences-and-tastings/'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'tenuta-di-castellaro-sicily','programme_durations',
  '{"principal_tastings_minutes":120,"variable_by_experience":true}'::jsonb,
  'first_party_source',
  'https://www.tenutadicastellaro.it/en/experiences-and-tastings/',
  'Tenuta di Castellaro — Tastings and Experiences',
  now(),
  'The principal published wine tastings are approximately two hours; other experiences vary, so no single typical duration is surfaced.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='tenuta-di-castellaro-sicily'
    and field_key='programme_durations'
    and source_url='https://www.tenutadicastellaro.it/en/experiences-and-tastings/'
);
