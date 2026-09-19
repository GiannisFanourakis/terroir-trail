-- Northern Greece Visitability V1: Domaine Biblia Chora.
-- Current first-party visitor page publishes Mon-Fri 10:00-14:00 visits upon
-- request, guided estate/winery/cellar touring and disability access.

update public.producers
set
  visit_status = 'appointment_only',
  visit_source_url = 'https://bibliachora.gr/en/visit-the-estate/',
  visit_notes = 'Current first-party Visit the Estate page, updated in June 2026, publishes estate visits Monday-Friday 10:00-14:00 upon request. A typical visit includes a guided walk around the estate grounds, views of the vineyard, fermentation hall, bottling line, maturation rooms and underground cellars, ending with wine tasting. The estate explicitly states it is accessible to people with disabilities. No standard visit duration, parking details or visitor languages are published.',
  opening_hours = 'Mon-Fri 10:00-14:00 upon request.',
  visit_booking_requirement = 'required',
  walk_in_status = 'not_accepted',
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{"monday_friday":"10:00-14:00","booking":"upon_request"}'::jsonb,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 20:29:00+03'
where id = 'domaine-biblia-chora';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'domaine-biblia-chora','booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted","wording":"upon_request"}'::jsonb,
  'first_party_source',
  'https://bibliachora.gr/en/visit-the-estate/',
  'Ktima Biblia Chora — Visit the Estate',
  timestamptz '2026-09-19 20:29:00+03',
  'The current official visitor page states that estate visits are available upon request.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='domaine-biblia-chora' and field_key='booking_requirement'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'domaine-biblia-chora','visitor_hours',
  '{"monday_friday":"10:00-14:00","booking":"upon_request"}'::jsonb,
  'first_party_source',
  'https://bibliachora.gr/en/visit-the-estate/',
  'Ktima Biblia Chora — Visit the Estate',
  timestamptz '2026-09-19 20:29:00+03',
  'The current official visitor page publishes Monday-Friday 10:00-14:00 for visits upon request.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='domaine-biblia-chora' and field_key='visitor_hours'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'domaine-biblia-chora','visitor_offering',
  '{"guided_estate_tour":true,"vineyard_viewing":true,"production_areas":true,"cellars":true,"wine_tasting":true}'::jsonb,
  'first_party_source',
  'https://bibliachora.gr/en/visit-the-estate/',
  'Ktima Biblia Chora — Visit the Estate',
  timestamptz '2026-09-19 20:29:00+03',
  'The current official visitor page describes the guided estate/winery/cellar visit and wine tasting.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='domaine-biblia-chora' and field_key='visitor_offering'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'domaine-biblia-chora','wheelchair_accessible',
  '{"accessible":true,"scope":"estate_visit"}'::jsonb,
  'first_party_source',
  'https://bibliachora.gr/en/visit-the-estate/',
  'Ktima Biblia Chora — Visit the Estate',
  timestamptz '2026-09-19 20:29:00+03',
  'The current official page explicitly states that Ktima Biblia Chora is accessible to people with disabilities.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='domaine-biblia-chora' and field_key='wheelchair_accessible'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);
