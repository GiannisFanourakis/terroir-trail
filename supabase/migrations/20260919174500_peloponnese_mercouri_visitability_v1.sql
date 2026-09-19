-- Peloponnese Visitability V1: Domaine Mercouri.
-- The live official site still exposes visitor-oriented links, but its detailed
-- operational visitor information is in a 2018 brochure. Do not carry those
-- hours forward as current 2026 facts.

update public.producers
set
  visit_status = 'current_access_uncertain',
  visit_source_url = 'https://mercouri.gr/',
  visit_notes = 'The live first-party Domaine Mercouri site still presents a visitor pathway and links an English estate brochure describing tours, tastings, vineyards, olive groves and a folklore museum. However, that brochure is dated 2018 and its Mon-Sat 09:00-15:00 timetable cannot be treated as current 2026 visitor hours. The old dedicated virtual-visit link is no longer valid. Contact the estate before travelling.',
  opening_hours = 'Current 2026 visitor hours not confirmed; contact the estate before travelling.',
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 00:00:00+03'
where id = 'domaine-mercouri';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'domaine-mercouri',
  'visit_status',
  '{"status":"current_access_uncertain"}'::jsonb,
  'first_party_source',
  'https://mercouri.gr/',
  'Domaine Mercouri — official site',
  timestamptz '2026-09-19 00:00:00+03',
  'The live official site still exposes visitor-oriented links, but no current operational visitor timetable is published.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='domaine-mercouri'
    and field_key='visit_status'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'domaine-mercouri',
  'stale_visitor_hours',
  '{"published_year":2018,"hours":"Mon-Sat 09:00-15:00","status":"stale"}'::jsonb,
  'first_party_source',
  'https://mercouri.gr/brochure_en.pdf',
  'Domaine Mercouri — 2018 English brochure',
  timestamptz '2026-09-19 00:00:00+03',
  'The linked first-party brochure describes tours/tastings and Mon-Sat 09:00-15:00 hours, but it is dated 2018 and is not surfaced as current 2026 operating information.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='domaine-mercouri'
    and field_key='stale_visitor_hours'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);
