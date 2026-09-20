-- Puglia Visitability V1: Sabino Leone.
-- Current first-party tour pages publish fixed visitor windows and 90/120-minute
-- programmes. A booking flow exists, but mandatory advance booking is not stated.

update public.producers
set
  visit_status = 'public_visits',
  visit_source_url = 'https://www.sabinoleone.it/en/pages/tour',
  visit_notes = 'Current first-party Sabino Leone tour pages publish two visitor programmes at the Canosa di Puglia oil mill. The Oil Mill Tour lasts about 90 minutes and is available Monday-Friday 08:30-11:30 and 15:30-17:30, Saturday 08:30-11:30. Discovering the Origins lasts about 120 minutes and is available Monday-Friday 08:30-10:30 and 15:30-16:30, Saturday 08:30-10:30. The site offers a Book Now flow but does not explicitly state that reservations are mandatory or define a general walk-in policy. Parking and actual visitor languages are not explicitly published.',
  opening_hours = 'Oil Mill Tour: Mon-Fri 08:30-11:30 & 15:30-17:30; Sat 08:30-11:30. Origins tour: Mon-Fri 08:30-10:30 & 15:30-16:30; Sat 08:30-10:30.',
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{
    "oil_mill_tour":{"monday_friday":["08:30-11:30","15:30-17:30"],"saturday":"08:30-11:30"},
    "discovering_origins":{"monday_friday":["08:30-10:30","15:30-16:30"],"saturday":"08:30-10:30"}
  }'::jsonb,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = now()
where id = 'sabino-leone-puglia';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'sabino-leone-puglia','visitor_hours',
  '{"oil_mill_tour":{"monday_friday":["08:30-11:30","15:30-17:30"],"saturday":"08:30-11:30"},"discovering_origins":{"monday_friday":["08:30-10:30","15:30-16:30"],"saturday":"08:30-10:30"}}'::jsonb,
  'first_party_source',
  'https://www.sabinoleone.it/en/pages/tour',
  'Sabino Leone — Tours',
  now(),
  'The current official tour page publishes these visitor windows.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='sabino-leone-puglia'
    and field_key='visitor_hours'
    and source_url='https://www.sabinoleone.it/en/pages/tour'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'sabino-leone-puglia','programme_durations',
  '{"oil_mill_tour_minutes":90,"discovering_origins_minutes":120}'::jsonb,
  'first_party_source',
  'https://www.sabinoleone.it/en/pages/tour',
  'Sabino Leone — Tours',
  now(),
  'The current official page publishes 90-minute and 120-minute tours.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='sabino-leone-puglia'
    and field_key='programme_durations'
    and source_url='https://www.sabinoleone.it/en/pages/tour'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'sabino-leone-puglia','visitor_offering',
  '{"oil_mill_tour":true,"three_oil_tasting":true,"monumental_olive_tree_visit":true,"five_oil_tasting_course":true}'::jsonb,
  'first_party_source',
  'https://www.sabinoleone.it/en/pages/tour',
  'Sabino Leone — Tours',
  now(),
  'The current first-party page explicitly describes the two tour formats and tasting components.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='sabino-leone-puglia'
    and field_key='visitor_offering'
    and source_url='https://www.sabinoleone.it/en/pages/tour'
);
