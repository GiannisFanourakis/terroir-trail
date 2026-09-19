-- Crete Visitability V1: Baladinos & Sons.
-- The mapped point is the producer-owned Central Store in Chania, listed
-- separately by the producer from its Varipetro factory. Public retail access
-- applies to the shop only and does not establish factory tours or tastings.

update public.producers
set
  visit_status = 'public_visits',
  visit_source_url = 'https://www.balantinos.gr/en/contact/',
  visit_notes = 'The mapped public point is the producer-owned Central Store in Chania, which the current first-party site lists separately from the Varipetro factory. Public retail access to the shop is supported; this does not establish public access, tours, or tastings at the factory.',
  opening_hours = null,
  visit_booking_requirement = 'not_required',
  walk_in_status = 'accepted',
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 19:35:00+03'
where id = 'baladinos-dairy-varipetro';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'baladinos-dairy-varipetro',
  'public_point_type',
  '{"type":"producer_shop","address":"Skalidi 25, Chania"}'::jsonb,
  'first_party_source',
  'https://www.balantinos.gr/en/contact/',
  'Baladinos — official contact page',
  timestamptz '2026-09-19 19:35:00+03',
  'The official site identifies the Chania point as the Central Store and lists the Varipetro factory separately.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='baladinos-dairy-varipetro'
    and field_key='public_point_type'
    and source_url='https://www.balantinos.gr/en/contact/'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'baladinos-dairy-varipetro',
  'visit_status',
  '{"status":"public_visits","scope":"producer_shop"}'::jsonb,
  'first_party_source',
  'https://www.balantinos.gr/en/contact/',
  'Baladinos — official contact page',
  timestamptz '2026-09-19 19:35:00+03',
  'Public access applies to the producer-owned Central Store in Chania. It does not establish public factory access.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='baladinos-dairy-varipetro'
    and field_key='visit_status'
    and verified_at=timestamptz '2026-09-19 19:35:00+03'
);
