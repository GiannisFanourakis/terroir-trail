-- Crete Visitability V1: Anoskeli Winery & Olive Mill.
-- The live first-party Experiences page still labels its visitor season/hours as 2025.
-- Current 2026 visitor evidence corroborates that the estate is active, but stale
-- 2025 hours are not promoted into current 2026 opening hours.

update public.producers
set
  visit_status = 'seasonal_public',
  visit_source_url = 'https://anoskeli.gr/experiences',
  visit_notes = 'The live first-party Experiences page confirms guided olive-oil/wine tasting experiences, strongly recommends advance booking, and says drop-ins are welcomed subject to availability. However, the page still labels its active season and visiting hours as 2025. Current 2026 visitor evidence supports that the estate is still receiving guests, but TerroirTrail does not carry the stale 2025 timetable forward as current hours.',
  opening_hours = 'Current 2026 visitor hours not yet confirmed; contact Anoskeli before travelling.',
  visit_booking_requirement = 'recommended',
  walk_in_status = 'subject_to_availability',
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = 'Official visitor page currently still displays its 2025 season (April-20 November, Mon-Fri 10:00-18:00). Treat those hours as stale until the producer publishes a current schedule.',
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 19:05:00+03'
where id = 'anoskeli-estate';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'anoskeli-estate',
  'booking_requirement',
  '{"requirement":"recommended","walk_in_status":"subject_to_availability"}'::jsonb,
  'first_party_source',
  'https://anoskeli.gr/experiences',
  'Anoskeli — Experiences',
  timestamptz '2026-09-19 19:05:00+03',
  'The live official page states that prior booking is strongly recommended and that drop-ins are welcomed subject to availability.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='anoskeli-estate'
    and field_key='booking_requirement'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'anoskeli-estate',
  'stale_visitor_hours',
  '{"published_season":"2025-04_to_2025-11-20","monday_friday":"10:00-18:00","status":"stale"}'::jsonb,
  'first_party_source',
  'https://anoskeli.gr/experiences',
  'Anoskeli — Experiences',
  timestamptz '2026-09-19 19:05:00+03',
  'The current official page still explicitly labels these as 2025 hours. They are retained as provenance only and are not surfaced as current 2026 opening hours.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='anoskeli-estate'
    and field_key='stale_visitor_hours'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'anoskeli-estate',
  'current_2026_visit_activity',
  '{"visits_reported":true,"year":2026}'::jsonb,
  'public_listing',
  'https://frequentmiler.com/8-days-in-crete-heres-what-we-did/',
  '2026 visitor report',
  timestamptz '2026-09-19 19:05:00+03',
  'A May 2026 travel report documents an on-site Anoskeli visit and olive-oil tasting. Used only to corroborate current activity, not to set hours or booking policy.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='anoskeli-estate'
    and field_key='current_2026_visit_activity'
);
