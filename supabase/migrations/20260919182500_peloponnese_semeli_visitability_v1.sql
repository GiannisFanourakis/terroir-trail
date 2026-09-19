-- Peloponnese Visitability V1: Semeli Estate Nemea.
-- Booking is mandatory; current hours, 60/90-minute experience durations and
-- hospitality accessibility are published first-party.

update public.producers
set
  visit_status = 'appointment_only',
  visit_source_url = 'https://www.semeliestate.gr/experience/',
  visit_notes = 'Current first-party experience/contact pages state that booking is mandatory before visiting. Wine tourism programs operate every day except Tuesday and public holidays. Published estate hours are Mon and Wed-Fri 10:00-16:00 and weekends 11:00-17:00. Standard open wine experiences last 60 minutes; private cellar experiences last 90 minutes. The estate states that all hospitality facilities and venues are fully accessible to visitors with disabilities. Parking and actual visitor languages are not explicitly published.',
  opening_hours = 'Mon and Wed-Fri 10:00-16:00; Sat-Sun 11:00-17:00; Tue and public holidays closed. Booking mandatory.',
  visit_booking_requirement = 'required',
  walk_in_status = 'not_accepted',
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{
    "monday":"10:00-16:00",
    "tuesday":"closed",
    "wednesday_friday":"10:00-16:00",
    "saturday_sunday":"11:00-17:00",
    "public_holidays":"closed"
  }'::jsonb,
  seasonal_visit_notes = 'Open wine experiences are published as 60 minutes; private cellar tastings are published as 90 minutes.',
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 00:00:00+03'
where id = 'semeli-estate-nemea';

insert into public.producer_fact_evidence (producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'semeli-estate-nemea','booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted"}'::jsonb,
  'first_party_source','https://www.semeliestate.gr/experience/',
  'Semeli Estate — Experience',timestamptz '2026-09-19 00:00:00+03',
  'The current official Experience page explicitly states booking is mandatory before the visit.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='semeli-estate-nemea' and field_key='booking_requirement'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'semeli-estate-nemea','visitor_hours',
  '{"monday":"10:00-16:00","tuesday":"closed","wednesday_friday":"10:00-16:00","saturday_sunday":"11:00-17:00","public_holidays":"closed"}'::jsonb,
  'first_party_source','https://www.semeliestate.gr/contact/',
  'Semeli Estate — Contact',timestamptz '2026-09-19 00:00:00+03',
  'The current official pages publish weekday/weekend estate hours and Tuesday/public-holiday closure.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='semeli-estate-nemea' and field_key='visitor_hours'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'semeli-estate-nemea','programme_durations',
  '{"open_wine_experiences_minutes":60,"private_cellar_experiences_minutes":90,"variable_by_package":true}'::jsonb,
  'first_party_source','https://www.semeliestate.gr/experience/open-wine-tours/',
  'Semeli Estate — Open / Exclusive Wine Tours',timestamptz '2026-09-19 00:00:00+03',
  'Current first-party tour pages publish 60-minute open experiences and 90-minute private cellar experiences. No single typical duration is promoted.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='semeli-estate-nemea' and field_key='programme_durations'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'semeli-estate-nemea','wheelchair_accessible',
  '{"accessible":true,"scope":"hospitality_facilities_and_venues"}'::jsonb,
  'first_party_source','https://www.semeliestate.gr/experience/',
  'Semeli Estate — Experience',timestamptz '2026-09-19 00:00:00+03',
  'The current official Experience page states all hospitality facilities and venues are fully accessible to visitors and guests with disabilities.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='semeli-estate-nemea' and field_key='wheelchair_accessible'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);
