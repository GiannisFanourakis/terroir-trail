-- Thessaly Visitability V1: K. Tsililis / Theopetra Estate.
-- Current first-party visitor page states visits are upon request and
-- take approximately 45 minutes.

update public.producers
set
  visit_status = 'appointment_only',
  visit_source_url = 'https://www.tsililis.gr/english/episkepsi5bee.html?cat=0&id=1055',
  visit_notes = 'The current first-party Tsililis visitor page states that visits to the Tsililis family winery-distillery / Theopetra Estate are offered upon request and take about 45 minutes. The current site does not publish general daily visitor hours, parking details, or actual visitor languages.',
  opening_hours = 'Visits by request; no general daily visitor timetable published.',
  visit_booking_requirement = 'required',
  walk_in_status = 'not_accepted',
  parking_status = null,
  typical_visit_minutes = 45,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 20:29:00+03'
where id = 'tsililis-theopetra-thessaly';

insert into public.producer_fact_evidence (producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select
  'tsililis-theopetra-thessaly','booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted","wording":"upon request"}'::jsonb,
  'first_party_source',
  'https://www.tsililis.gr/english/episkepsi5bee.html?cat=0&id=1055',
  'Tsililis — Visiting Tsilili Distillery and Theopetra Estate',
  timestamptz '2026-09-19 20:29:00+03',
  'The current official visitor page explicitly states the visit is upon request.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='tsililis-theopetra-thessaly' and field_key='booking_requirement'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);

insert into public.producer_fact_evidence (producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select
  'tsililis-theopetra-thessaly','typical_visit_minutes',
  '{"minutes":45,"approximate":true}'::jsonb,
  'first_party_source',
  'https://www.tsililis.gr/english/episkepsi5bee.html?cat=0&id=1055',
  'Tsililis — Visiting Tsilili Distillery and Theopetra Estate',
  timestamptz '2026-09-19 20:29:00+03',
  'The current official visitor page states the winery-distillery visit takes about 45 minutes.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='tsililis-theopetra-thessaly' and field_key='typical_visit_minutes'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);
