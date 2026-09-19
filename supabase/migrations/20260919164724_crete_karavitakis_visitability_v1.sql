-- Crete Visitability V1: Karavitakis Winery.
-- Current first-party homepage explicitly accepts visitors with or without
-- appointments. A separate booking page still contains a stale 2025 date note,
-- so it is not used to set current 2026 availability or hours.

update public.producers
set
  visit_status = 'public_visits',
  visit_source_url = 'https://www.karavitakiswines.com/',
  visit_notes = 'Current first-party homepage explicitly welcomes visitors and states that the winery accepts visitors with or without appointments. The separate online-booking page still contains a stale 2025 date note, so it is not used to infer current tour availability, hours or programme dates. Current daily visitor hours, visit duration, parking and tour languages are not published clearly enough to structure.',
  opening_hours = null,
  visit_booking_requirement = 'not_required',
  walk_in_status = 'accepted',
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = 'Online booking remains available, but the current booking page includes a stale 2025 cutoff note; contact the winery for specific guided-tour scheduling.',
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 19:05:00+03'
where id = 'karavitakis-winery';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'karavitakis-winery',
  'booking_requirement',
  '{"requirement":"not_required","walk_in_status":"accepted"}'::jsonb,
  'first_party_source',
  'https://www.karavitakiswines.com/',
  'Karavitakis Winery — official homepage',
  timestamptz '2026-09-19 19:05:00+03',
  'The official homepage explicitly states: visitors are accepted with or without appointments.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='karavitakis-winery'
    and field_key='booking_requirement'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'karavitakis-winery',
  'stale_booking_notice',
  '{"status":"stale","mentions_date":"2025-08-05"}'::jsonb,
  'first_party_source',
  'https://www.karavitakiswines.com/explore-karavitakis-winery/',
  'Karavitakis Winery — Explore / Booking page',
  timestamptz '2026-09-19 19:05:00+03',
  'The current booking page still contains a 2025 booking cutoff note. It is retained as provenance only and not treated as current 2026 availability.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='karavitakis-winery'
    and field_key='stale_booking_notice'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);
