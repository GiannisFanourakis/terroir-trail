-- Peloponnese Visitability V1: Liokareas.
-- The mapped public point remains the previously verified producer shop.
-- The current first-party site sells an organised October 2026 Harvest Trip,
-- but that does not establish ordinary public access to the family farm.

update public.producers
set
  visit_status = 'not_publicly_confirmed',
  visit_source_url = 'https://www.liokareas.com/collections/harvest-trip-2026',
  visit_notes = 'Liokareas is a family olive-oil producer whose mapped TerroirTrail public point is the previously verified producer shop in Lagkada. The current first-party site separately sells an eight-day October 2026 Harvest Trip that includes picking and pressing olives at the family farm. That packaged trip does not establish ordinary public access to the farm, orchards or production site, and current shop opening hours are not published on the first-party site. Keep farm visitability unconfirmed and do not infer general walk-in access from the Harvest Trip.',
  opening_hours = null,
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = 'A packaged eight-day Harvest Trip is offered in October 2026 and includes participation in the family olive harvest and pressing. This is not evidence of ordinary public farm access.',
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 00:00:00+03'
where id = 'liokareas-olive-estate';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'liokareas-olive-estate',
  'limited_harvest_trip',
  '{"year":2026,"month":"october","duration_days":8,"farm_harvest_participation":true,"ordinary_public_access_established":false}'::jsonb,
  'first_party_source',
  'https://www.liokareas.com/collections/harvest-trip-2026',
  'Liokareas — 2026 Annual Harvest Trip',
  timestamptz '2026-09-19 00:00:00+03',
  'The current first-party package is an eight-day organised trip including olive picking and pressing at the family farm. It is retained as a limited packaged experience and not treated as general farm visitability.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='liokareas-olive-estate'
    and field_key='limited_harvest_trip'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'liokareas-olive-estate',
  'visit_status',
  '{"status":"not_publicly_confirmed","scope":"farm_or_production_site","mapped_public_point":"producer_shop"}'::jsonb,
  'terroirtrail_review',
  'https://www.liokareas.com/',
  'TerroirTrail field review using current Liokareas first-party site and existing verified public-point identity',
  timestamptz '2026-09-19 00:00:00+03',
  'Current first-party pages do not publish ordinary farm/orchard/mill access or current Lagkada shop hours. The mapped point remains separately identified as a producer shop from prior location verification.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='liokareas-olive-estate'
    and field_key='visit_status'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);
