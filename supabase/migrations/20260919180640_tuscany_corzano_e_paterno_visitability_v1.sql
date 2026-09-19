-- Tuscany Visitability V1: Fattoria Corzano e Paterno.
-- Current first-party visitor page publishes wine/cheese/oil tastings and tours.
-- Booking is highly recommended, not stated as mandatory; package durations vary.

update public.producers
set
  visit_status = 'public_visits',
  visit_source_url = 'https://www.corzanoepaterno.com/en/shop/',
  visit_notes = 'Current first-party shop/visitor page publishes wine-and-cheese tastings and vineyard/cellar tours with dairy-production explanation. Booking is highly recommended but not stated as mandatory. The simple tasting lasts about 45 minutes and is available 10:00-12:00 in winter and 10:00-17:00 in summer. Tour-and-tasting formats last about 90 minutes, with published start times at 11:00 and 16:00; the afternoon slot is summer-only for the standard tour+tasting. Parking and visitor languages are not explicitly published, and the page does not explicitly define a general walk-in policy.',
  opening_hours = 'Simple tasting: winter 10:00-12:00; summer 10:00-17:00. Tour/tasting start times include 11:00 and 16:00, with afternoon availability varying by season.',
  visit_booking_requirement = 'recommended',
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{
    "simple_tasting":{"winter":"10:00-12:00","summer":"10:00-17:00"},
    "tour_tasting":{"start_times":["11:00","16:00"],"afternoon_standard_tour":"summer_only"}
  }'::jsonb,
  seasonal_visit_notes = 'Published experiences vary by format: simple tasting about 45 minutes; tour+tasting formats about 90 minutes. Booking is highly recommended.',
  visitor_languages = null,
  visitability_reviewed_at = now()
where id = 'fattoria-corzano-e-paterno-tuscany';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'fattoria-corzano-e-paterno-tuscany','booking_requirement',
  '{"requirement":"recommended","mandatory":false}'::jsonb,
  'first_party_source',
  'https://www.corzanoepaterno.com/en/shop/',
  'Fattoria Corzano e Paterno — Shop / Tastings',
  now(),
  'The current official page says booking is highly recommended, but does not state that reservations are mandatory.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='fattoria-corzano-e-paterno-tuscany'
    and field_key='booking_requirement'
    and source_url='https://www.corzanoepaterno.com/en/shop/'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'fattoria-corzano-e-paterno-tuscany','visitor_hours',
  '{"simple_tasting":{"winter":"10:00-12:00","summer":"10:00-17:00"},"tour_tasting":{"start_times":["11:00","16:00"],"afternoon_standard_tour":"summer_only"}}'::jsonb,
  'first_party_source',
  'https://www.corzanoepaterno.com/en/shop/',
  'Fattoria Corzano e Paterno — Shop / Tastings',
  now(),
  'The current official page publishes seasonal tasting windows and tour/tasting start times.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='fattoria-corzano-e-paterno-tuscany'
    and field_key='visitor_hours'
    and source_url='https://www.corzanoepaterno.com/en/shop/'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'fattoria-corzano-e-paterno-tuscany','programme_durations',
  '{"simple_tasting_minutes":45,"tour_tasting_minutes":90,"gran_tagliere_tour_minutes":90}'::jsonb,
  'first_party_source',
  'https://www.corzanoepaterno.com/en/shop/',
  'Fattoria Corzano e Paterno — Shop / Tastings',
  now(),
  'The current official page publishes approximately 45 minutes for the simple tasting and 90 minutes for the tour/tasting formats.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='fattoria-corzano-e-paterno-tuscany'
    and field_key='programme_durations'
    and source_url='https://www.corzanoepaterno.com/en/shop/'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'fattoria-corzano-e-paterno-tuscany','visitor_offering',
  '{"wine_tasting":true,"cheese_tasting":true,"olive_oil_tasting":true,"vineyard_walk":true,"cellar_tour":true,"dairy_process_explanation":true}'::jsonb,
  'first_party_source',
  'https://www.corzanoepaterno.com/en/shop/',
  'Fattoria Corzano e Paterno — Shop / Tastings',
  now(),
  'The current first-party visitor page explicitly describes these tasting and tour components.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='fattoria-corzano-e-paterno-tuscany'
    and field_key='visitor_offering'
    and source_url='https://www.corzanoepaterno.com/en/shop/'
);
