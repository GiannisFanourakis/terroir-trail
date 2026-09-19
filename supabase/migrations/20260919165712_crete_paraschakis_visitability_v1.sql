-- Crete Visitability V1: Paraschakis Family Olive Oil Factory.
-- Current first-party pages confirm a visitor-friendly olive mill with guided
-- production explanation and olive-oil tasting, but do not publish current
-- daily visitor hours or access-policy details.

update public.producers
set
  visit_status = 'public_visits',
  visit_source_url = 'https://paraschakis.gr/olive-oil-factory/',
  visit_notes = 'Current first-party site explicitly presents the Melidoni olive mill as visitor-friendly and welcomes guests for a guided introduction to olive-oil production and tasting. The current official pages do not publish daily visitor hours, a booking requirement, walk-in policy, visit duration, parking policy, or visitor languages. The previously displayed Mon-Sat 09:00-18:00 timetable came from public listings and is no longer surfaced as a producer-confirmed schedule.',
  opening_hours = null,
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 19:05:00+03'
where id = 'parasiris-olive-mill';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'parasiris-olive-mill',
  'visitor_offering',
  '{"guided_visit":true,"olive_oil_production_explanation":true,"olive_oil_tasting":true}'::jsonb,
  'first_party_source',
  'https://paraschakis.gr/olive-oil-factory/',
  'Paraschakis Family — Olive Oil Factory',
  timestamptz '2026-09-19 19:05:00+03',
  'The current official factory page explicitly welcomes visitors for a guided tour, production explanation and olive-oil tasting.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='parasiris-olive-mill'
    and field_key='visitor_offering'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'parasiris-olive-mill',
  'unconfirmed_public_listing_hours',
  '{"previous_hours":"Mon-Sat 09:00-18:00; Sunday closed","status":"not_first_party_confirmed"}'::jsonb,
  'public_listing',
  null,
  'Previously stored public listing hours',
  timestamptz '2026-09-19 19:05:00+03',
  'The prior timetable was based on public listings rather than a current first-party page. It is retained as provenance only and is not surfaced as current opening hours.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='parasiris-olive-mill'
    and field_key='unconfirmed_public_listing_hours'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);
