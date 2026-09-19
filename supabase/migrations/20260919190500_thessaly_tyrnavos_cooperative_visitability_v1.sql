-- Thessaly Visitability V1: Agricultural Cooperative Winery & Distillery of Tyrnavos.
-- Current first-party visitor announcement confirms the winery is visitable
-- by prior arrangement and has facilities configured for disabled visitors.

update public.producers
set
  visit_status = 'appointment_only',
  visit_source_url = 'https://www.tirnavoswinery.gr/en/episkepsimo-oinopoieio-2/',
  visit_notes = 'The current first-party visitor announcement confirms that the Agricultural Cooperative Winery & Distillery of Tyrnavos is officially visitable and states that visits are organised by prior arrangement with the responsible staff. The page also states that the visitor facilities are appropriately configured for disabled visitors. No current public visitor timetable, standard duration, parking details, or visitor languages are published.',
  opening_hours = 'Visits by prior arrangement; no general public visitor timetable published.',
  visit_booking_requirement = 'required',
  walk_in_status = 'not_accepted',
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 20:29:00+03'
where id = 'tyrnavos-winery-cooperative-thessaly';

insert into public.producer_fact_evidence (producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select
  'tyrnavos-winery-cooperative-thessaly','booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted","wording":"prior_arrangement"}'::jsonb,
  'first_party_source',
  'https://www.tirnavoswinery.gr/en/episkepsimo-oinopoieio-2/',
  'Agricultural Cooperative Winery & Distillery of Tyrnavos — visitable winery',
  timestamptz '2026-09-19 20:29:00+03',
  'The current official visitor page states that visits are organised by prior arrangement with responsible staff.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='tyrnavos-winery-cooperative-thessaly' and field_key='booking_requirement'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);

insert into public.producer_fact_evidence (producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select
  'tyrnavos-winery-cooperative-thessaly','wheelchair_accessible',
  '{"accessible":true,"scope":"visitor_facilities"}'::jsonb,
  'first_party_source',
  'https://www.tirnavoswinery.gr/en/episkepsimo-oinopoieio-2/',
  'Agricultural Cooperative Winery & Distillery of Tyrnavos — visitable winery',
  timestamptz '2026-09-19 20:29:00+03',
  'The current official visitor page explicitly states that the visitor facilities are suitably configured for disabled visitors.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='tyrnavos-winery-cooperative-thessaly' and field_key='wheelchair_accessible'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);
