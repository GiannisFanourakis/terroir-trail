-- Northern Greece Visitability V1: Domaine Karanika.
-- Current first-party contact page explicitly requires advance booking for
-- winery visits and offers vineyard tours and wine tastings.

update public.producers
set
  visit_status = 'appointment_only',
  visit_source_url = 'https://karanika.com/contact/',
  visit_notes = 'Current first-party contact page explicitly invites visitors for winery visits, organic-vineyard tours and wine tastings, and states that any visit requires advance booking. The current official site does not publish a general visitor timetable, standard duration, parking details or visitor languages.',
  opening_hours = 'Advance booking required; no general visitor timetable published.',
  visit_booking_requirement = 'required',
  walk_in_status = 'not_accepted',
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 20:29:00+03'
where id = 'domaine-karanika';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'domaine-karanika','booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted"}'::jsonb,
  'first_party_source',
  'https://karanika.com/contact/',
  'Domaine Karanika — Contact',
  timestamptz '2026-09-19 20:29:00+03',
  'The current official contact page explicitly states that any visit requires advance booking.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='domaine-karanika' and field_key='booking_requirement'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'domaine-karanika','visitor_offering',
  '{"winery_visit":true,"organic_vineyard_tour":true,"wine_tasting":true}'::jsonb,
  'first_party_source',
  'https://karanika.com/contact/',
  'Domaine Karanika — Contact',
  timestamptz '2026-09-19 20:29:00+03',
  'The current official contact page explicitly invites winery visits, organic-vineyard tours and wine tastings.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='domaine-karanika' and field_key='visitor_offering'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);
