-- Santorini Visitability V1: Canava Santorini Distillery.
-- Live first-party content confirms a public museum, guided distillery tours and
-- spirit tastings. Current hours and access-policy details remain unpublished.

update public.producers
set
  visit_status = 'public_visits',
  visit_source_url = 'https://www.canavasantorini.com/',
  visit_notes = 'The live first-party Canava Santorini site states that its museum is open to guests and that visitors are welcomed for guided distillery tours, explanation of the distillation process, and spirit tasting. The official site does not publish current daily visitor hours, booking requirements, walk-in policy, parking, visit duration, or tour languages. Current 2026 public visitor reporting corroborates that the distillery remains a visitable site, but is not used to set operational details.',
  opening_hours = null,
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 00:00:00+03'
where id = 'canava-santorini-distillery';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'canava-santorini-distillery',
  'visit_status',
  '{"status":"public_visits"}'::jsonb,
  'first_party_source',
  'https://www.canavasantorini.com/',
  'Canava Santorini — official site',
  timestamptz '2026-09-19 00:00:00+03',
  'The live official site explicitly says the museum is open to guests and welcomes visitors for distillery tours and tastings.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='canava-santorini-distillery'
    and field_key='visit_status'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'canava-santorini-distillery',
  'visitor_offering',
  '{"museum":true,"guided_distillery_tour":true,"spirit_tasting":true}'::jsonb,
  'first_party_source',
  'https://www.canavasantorini.com/',
  'Canava Santorini — official site',
  timestamptz '2026-09-19 00:00:00+03',
  'The official site describes a museum, guided tours through the distillery and distillation process, and tasting of Canava spirits.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='canava-santorini-distillery'
    and field_key='visitor_offering'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'canava-santorini-distillery',
  'current_2026_visit_activity',
  '{"visits_reported":true,"year":2026}'::jsonb,
  'public_listing',
  'https://takemetogreece.com',
  '2026 visitor/travel reporting',
  timestamptz '2026-09-19 00:00:00+03',
  'A 2026 travel article still directs visitors to Canava Santorini distillery. Used only to corroborate current activity, not to set hours or access policy.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='canava-santorini-distillery'
    and field_key='current_2026_visit_activity'
);
