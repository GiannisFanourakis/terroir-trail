-- Crete Visitability V1: Aerakis Cheese Products.
-- Current first-party material verifies the Sokaras production facility but not
-- a public visitor programme or ordinary walk-in access.

update public.producers
set
  visit_status = 'not_publicly_confirmed',
  visit_source_url = 'https://cretancheeseaerakis.com/',
  visit_notes = 'Current first-party site confirms the working dairy in Sokaras and presents the business as a production, quality-assurance and export operation. It does not publish a public visitor programme, tasting/tour procedure, shop opening hours, booking rule, or walk-in policy. Do not present the dairy as a public attraction; contact the producer directly if considering a visit.',
  opening_hours = null,
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 19:20:00+03'
where id = 'aerakis-dairy-anogeia';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'aerakis-dairy-anogeia',
  'visit_status',
  '{"status":"not_publicly_confirmed"}'::jsonb,
  'first_party_source',
  'https://cretancheeseaerakis.com/',
  'Aerakis Cheese Products — official site',
  timestamptz '2026-09-19 19:20:00+03',
  'The current first-party site verifies the Sokaras dairy and its production/export operation but publishes no public visitor programme or ordinary walk-in procedure.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='aerakis-dairy-anogeia'
    and field_key='visit_status'
    and verified_at=timestamptz '2026-09-19 19:20:00+03'
);
