-- Santorini Visitability V1: Domaine Sigalas.
-- The live official homepage explicitly requires advance booking for every visit.

update public.producers
set
  visit_status = 'appointment_only',
  visit_source_url = 'https://sigalas-wine.com/',
  visit_notes = 'The live first-party Domaine Sigalas homepage invites visitors for tutored wine tastings, food-and-wine pairings and vineyard tours, and explicitly states that any visit requires advance booking. The current official site does not publish a dependable 2026 daily visitor timetable, parking policy, visit duration or visitor languages on the main visitor-facing content.',
  opening_hours = 'Advance booking required for every visit; current daily visitor hours are not published on the official visitor-facing page.',
  visit_booking_requirement = 'required',
  walk_in_status = 'not_accepted',
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 00:00:00+03'
where id = 'domaine-sigalas-santorini';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'domaine-sigalas-santorini',
  'booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted"}'::jsonb,
  'first_party_source',
  'https://sigalas-wine.com/',
  'Domaine Sigalas — official homepage',
  timestamptz '2026-09-19 00:00:00+03',
  'The live official homepage explicitly states that any visit requires advance booking.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='domaine-sigalas-santorini'
    and field_key='booking_requirement'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'domaine-sigalas-santorini',
  'visitor_offering',
  '{"tutored_tasting":true,"food_wine_pairing":true,"vineyard_tour":true}'::jsonb,
  'first_party_source',
  'https://sigalas-wine.com/',
  'Domaine Sigalas — official homepage',
  timestamptz '2026-09-19 00:00:00+03',
  'Current official content describes tutored tastings, food-and-wine pairings and comprehensive experiences including a vineyard tour.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='domaine-sigalas-santorini'
    and field_key='visitor_offering'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);
