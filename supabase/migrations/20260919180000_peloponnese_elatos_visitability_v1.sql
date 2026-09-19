-- Peloponnese Visitability V1: ELATOS / Kapetanou Bros.
-- Current first-party content verifies the Schinochori dairy production
-- facility but does not publish public visitor access.

update public.producers
set
  visit_status = 'not_publicly_confirmed',
  visit_source_url = 'https://afoikapetanou.gr/',
  visit_notes = 'Current first-party site confirms ELATOS as an active third-generation cheese and dairy producer in Schinochori, Argos, with production facilities and direct contact details. It does not publish a current public visitor programme, producer-shop opening hours, tour/tasting procedure, booking rule, or walk-in policy. Keep public access unconfirmed.',
  opening_hours = null,
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 00:00:00+03'
where id = 'elatos-kapetanou-schinochori';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'elatos-kapetanou-schinochori',
  'visit_status',
  '{"status":"not_publicly_confirmed"}'::jsonb,
  'first_party_source',
  'https://afoikapetanou.gr/',
  'ELATOS / Kapetanou Bros — official site',
  timestamptz '2026-09-19 00:00:00+03',
  'Current first-party content verifies the dairy production facility and contact point but publishes no current public visitor programme, shop timetable, tour/tasting procedure, booking rule or walk-in policy.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='elatos-kapetanou-schinochori'
    and field_key='visit_status'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);
