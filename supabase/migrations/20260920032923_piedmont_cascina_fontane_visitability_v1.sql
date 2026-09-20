-- Piedmont Visitability V1: Cascina Fontane.
-- Current official regional tourism listing confirms visits, tastings and sales,
-- including durations, parking, languages and accessibility.

update public.producers
set
  visit_status = 'public_visits',
  visit_source_url = 'https://www.visitlmr.it/en/aziende/cascina-fontane',
  visit_notes = 'The current official Langhe Monferrato Roero tourism-authority listing identifies Cascina Fontane as open for visits, tastings and sales throughout the week. It publishes a 60-minute guided visit to the hazelnut groves and production laboratory plus a 30-minute guided tasting, with car and bus parking and accessible production/tasting areas. The producer shop site confirms the active Cascina Fontane business but does not currently expose equivalent visitor-operation details. Exact daily visit times and booking/walk-in rules are not stated.',
  opening_hours = 'Visits/tastings listed Mon-Sun; contact the producer for the current time.',
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = 'available',
  typical_visit_minutes = 60,
  visitor_hours = '{"days":["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]}'::jsonb,
  seasonal_visit_notes = 'Tourism-authority listing gives 60 minutes for the guided visit and 30 minutes for the tasting.',
  visitor_languages = array['fr','en','ro','es','de'],
  visitability_reviewed_at = now()
where id = 'cascina-fontane-piedmont';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'cascina-fontane-piedmont','visit_status',
  '{"status":"public_visits","services":["visits","tastings","sales"],"days":"monday_sunday"}'::jsonb,
  'public_listing',
  'https://www.visitlmr.it/en/aziende/cascina-fontane',
  'Ente Turismo Langhe Monferrato Roero — Cascina Fontane',
  now(),
  'The current regional tourism-authority listing explicitly marks the producer open for visits, tastings and sales throughout the week.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='cascina-fontane-piedmont'
    and field_key='visit_status'
    and source_url='https://www.visitlmr.it/en/aziende/cascina-fontane'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'cascina-fontane-piedmont','programme_durations',
  '{"guided_visit_minutes":60,"guided_tasting_minutes":30}'::jsonb,
  'public_listing',
  'https://www.visitlmr.it/en/aziende/cascina-fontane',
  'Ente Turismo Langhe Monferrato Roero — Cascina Fontane',
  now(),
  'The current regional tourism listing publishes a 60-minute visit and 30-minute tasting.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='cascina-fontane-piedmont'
    and field_key='programme_durations'
    and source_url='https://www.visitlmr.it/en/aziende/cascina-fontane'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'cascina-fontane-piedmont','parking_status',
  '{"status":"available","car":true,"bus":true}'::jsonb,
  'public_listing',
  'https://www.visitlmr.it/en/aziende/cascina-fontane',
  'Ente Turismo Langhe Monferrato Roero — Cascina Fontane',
  now(),
  'The current regional tourism listing explicitly states car and bus parking are available.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='cascina-fontane-piedmont'
    and field_key='parking_status'
    and source_url='https://www.visitlmr.it/en/aziende/cascina-fontane'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'cascina-fontane-piedmont','visitor_languages',
  '{"languages":["fr","en","ro","es","de"]}'::jsonb,
  'public_listing',
  'https://www.visitlmr.it/en/aziende/cascina-fontane',
  'Ente Turismo Langhe Monferrato Roero — Cascina Fontane',
  now(),
  'The current regional tourism listing explicitly lists French, English, Romanian, Spanish and German.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='cascina-fontane-piedmont'
    and field_key='visitor_languages'
    and source_url='https://www.visitlmr.it/en/aziende/cascina-fontane'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'cascina-fontane-piedmont','wheelchair_accessible',
  '{"production_area":true,"tasting_room":true}'::jsonb,
  'public_listing',
  'https://www.visitlmr.it/en/aziende/cascina-fontane',
  'Ente Turismo Langhe Monferrato Roero — Cascina Fontane',
  now(),
  'The current regional tourism listing marks both production access and tasting room as accessible.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='cascina-fontane-piedmont'
    and field_key='wheelchair_accessible'
    and source_url='https://www.visitlmr.it/en/aziende/cascina-fontane'
);
