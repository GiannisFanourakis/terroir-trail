-- Puglia Visitability V1: Olio Intini.
-- Current first-party experience page documents a 60-minute EVO Tour but
-- explicitly states that the programme will return next year.

update public.producers
set
  visit_status = 'current_access_uncertain',
  visit_source_url = 'https://oliointini.it/en/experience-extra-virgin-olive-oil-in-puglia/',
  visit_notes = 'Current first-party Olio Intini experience page documents the EVO Tour as a one-hour olive-mill visit and guided tasting, but explicitly states that the EVO Tour will return next year. No current visitor timetable, active booking window, walk-in policy, parking details or visitor languages are published for the paused programme. Confirm current availability directly before travelling.',
  opening_hours = 'EVO Tour currently paused; official page states it will return next year.',
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = 'Published EVO Tour duration is 60 minutes when active. The current 2026 page states the tour will return next year.',
  visitor_languages = null,
  visitability_reviewed_at = now()
where id = 'olio-intini-puglia';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'olio-intini-puglia','visit_status',
  '{"status":"current_access_uncertain","programme_paused":true,"wording":"EVO Tour will return next year"}'::jsonb,
  'first_party_source',
  'https://oliointini.it/en/experience-extra-virgin-olive-oil-in-puglia/',
  'Olio Intini — EVO Tour',
  now(),
  'The current official experience page explicitly states that the EVO Tour will return next year.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='olio-intini-puglia'
    and field_key='visit_status'
    and source_url='https://oliointini.it/en/experience-extra-virgin-olive-oil-in-puglia/'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'olio-intini-puglia','programme_durations',
  '{"evo_tour_minutes":60,"currently_paused":true}'::jsonb,
  'first_party_source',
  'https://oliointini.it/en/experience-extra-virgin-olive-oil-in-puglia/',
  'Olio Intini — EVO Tour',
  now(),
  'The official page lists the EVO Tour at one hour when active.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='olio-intini-puglia'
    and field_key='programme_durations'
    and source_url='https://oliointini.it/en/experience-extra-virgin-olive-oil-in-puglia/'
);
