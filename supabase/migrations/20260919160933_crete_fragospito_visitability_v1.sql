-- Crete Visitability V1: Fragospito Winery (Domaine Gavalas).
-- First-party review on 2026-09-19 confirms a guided winery tour and
-- selected-label tasting, but does not publish a current visitor timetable,
-- explicit booking requirement, walk-in policy, parking, duration or tour languages.

update public.producers
set
  visit_source_url = 'https://www.fragospitowinery.com/visit/',
  visit_notes = 'Current first-party visit page advertises a guided winery tour covering winemaking, bottling and cellar areas plus a tasting of selected labels. The winery does not publish a current visitor timetable, explicit booking requirement, or walk-in policy on that page. Contact the winery before travelling.',
  opening_hours = 'Contact winery before visiting',
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 19:05:00+03'
where id = 'gavalas-crete-winery';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'gavalas-crete-winery',
  'guided_visit_offering',
  '{"guided_tour":true,"wine_tasting":true}'::jsonb,
  'first_party_source',
  'https://www.fragospitowinery.com/visit/',
  'Fragospito Winery — Guided tour',
  timestamptz '2026-09-19 19:05:00+03',
  'The current first-party visit page explicitly describes a guided winery tour and tasting of selected labels.'
where not exists (
  select 1
  from public.producer_fact_evidence
  where producer_id='gavalas-crete-winery'
    and field_key='guided_visit_offering'
    and source_url='https://www.fragospitowinery.com/visit/'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'gavalas-crete-winery',
  'visit_status',
  '{"status":"current_access_uncertain"}'::jsonb,
  'first_party_source',
  'https://www.fragospitowinery.com/visit/',
  'Fragospito Winery — Guided tour',
  timestamptz '2026-09-19 19:05:00+03',
  'Tour/tasting is currently advertised, but no current visitor timetable, explicit booking requirement, or walk-in policy is published. Keep current_access_uncertain and advise contact before travel.'
where not exists (
  select 1
  from public.producer_fact_evidence
  where producer_id='gavalas-crete-winery'
    and field_key='visit_status'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);
