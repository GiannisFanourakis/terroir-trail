-- Piedmont Visitability V1: Ra Nissora.
-- Current official regional tourism listing confirms visits, tastings and sales.
-- The producer site was not reliably reachable during this audit, so evidence
-- remains explicitly public-listing rather than producer-confirmed.

update public.producers
set
  visit_status = 'public_visits',
  visit_source_url = 'https://www.visitlmr.it/en/aziende/ra-nissora',
  visit_notes = 'The current official Langhe Monferrato Roero tourism-authority listing identifies Ra Nissora as open for visits, tastings and sales throughout the week. It publishes a 90-minute guided visit to the hazelnut groves and processing/production laboratory plus a 60-minute guided tasting, with car and bus parking and accessible production/tasting areas. The producer website was not reliably reachable during this audit, so operational visitor details are retained as public-listing evidence rather than producer-confirmed facts. Exact daily visit times and booking/walk-in rules are not stated.',
  opening_hours = 'Visits/tastings listed Mon-Sun; contact the producer for the current time.',
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = 'available',
  typical_visit_minutes = 90,
  visitor_hours = '{"days":["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]}'::jsonb,
  seasonal_visit_notes = 'Tourism-authority listing gives 90 minutes for the guided visit and 60 minutes for the tasting.',
  visitor_languages = array['fr','ja','en','ro','es','de'],
  visitability_reviewed_at = now()
where id = 'ra-nissora-piedmont';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'ra-nissora-piedmont','visit_status',
  '{"status":"public_visits","services":["visits","tastings","sales"],"days":"monday_sunday"}'::jsonb,
  'public_listing',
  'https://www.visitlmr.it/en/aziende/ra-nissora',
  'Ente Turismo Langhe Monferrato Roero — Ra Nissora',
  now(),
  'The current regional tourism-authority listing explicitly marks the producer open for visits, tastings and sales throughout the week.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='ra-nissora-piedmont'
    and field_key='visit_status'
    and source_url='https://www.visitlmr.it/en/aziende/ra-nissora'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'ra-nissora-piedmont','programme_durations',
  '{"guided_visit_minutes":90,"guided_tasting_minutes":60}'::jsonb,
  'public_listing',
  'https://www.visitlmr.it/en/aziende/ra-nissora',
  'Ente Turismo Langhe Monferrato Roero — Ra Nissora',
  now(),
  'The current regional tourism listing publishes a 90-minute visit and 60-minute tasting.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='ra-nissora-piedmont'
    and field_key='programme_durations'
    and source_url='https://www.visitlmr.it/en/aziende/ra-nissora'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'ra-nissora-piedmont','parking_status',
  '{"status":"available","car":true,"bus":true}'::jsonb,
  'public_listing',
  'https://www.visitlmr.it/en/aziende/ra-nissora',
  'Ente Turismo Langhe Monferrato Roero — Ra Nissora',
  now(),
  'The current regional tourism listing explicitly states car and bus parking are available.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='ra-nissora-piedmont'
    and field_key='parking_status'
    and source_url='https://www.visitlmr.it/en/aziende/ra-nissora'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'ra-nissora-piedmont','visitor_languages',
  '{"languages":["fr","ja","en","ro","es","de"]}'::jsonb,
  'public_listing',
  'https://www.visitlmr.it/en/aziende/ra-nissora',
  'Ente Turismo Langhe Monferrato Roero — Ra Nissora',
  now(),
  'The current regional tourism listing explicitly lists French, Japanese, English, Romanian, Spanish and German.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='ra-nissora-piedmont'
    and field_key='visitor_languages'
    and source_url='https://www.visitlmr.it/en/aziende/ra-nissora'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'ra-nissora-piedmont','wheelchair_accessible',
  '{"production_area":true,"tasting_room":true}'::jsonb,
  'public_listing',
  'https://www.visitlmr.it/en/aziende/ra-nissora',
  'Ente Turismo Langhe Monferrato Roero — Ra Nissora',
  now(),
  'The current regional tourism listing marks both production access and tasting room as accessible.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='ra-nissora-piedmont'
    and field_key='wheelchair_accessible'
    and source_url='https://www.visitlmr.it/en/aziende/ra-nissora'
);
