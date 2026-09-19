-- Northern Greece Visitability V1: Alpha Estate.
-- Current first-party Visit page publishes daily/weekend 10:00-17:00 visits
-- upon request and describes guided winery tours ending with tasting.

update public.producers
set
  visit_status = 'appointment_only',
  visit_source_url = 'https://alpha-estate.com/visit/',
  visit_notes = 'Current first-party visit page, updated in August 2026, publishes visiting hours daily including weekends from 10:00-17:00 upon request and provides a reservation request flow. Visits include a guided winery tour covering the estate history and production process and conclude in the tasting area. Tailored hospitality packages may be arranged upon request. No standard visit duration, parking details or visitor languages are explicitly published.',
  opening_hours = 'Daily, including weekends, 10:00-17:00 upon request.',
  visit_booking_requirement = 'required',
  walk_in_status = 'not_accepted',
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{"monday_sunday":"10:00-17:00","booking":"upon_request"}'::jsonb,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 20:29:00+03'
where id = 'alpha-estate';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'alpha-estate','booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted","wording":"upon_request"}'::jsonb,
  'first_party_source',
  'https://alpha-estate.com/visit/',
  'Alpha Estate — Visit',
  timestamptz '2026-09-19 20:29:00+03',
  'The current official Visit page publishes visits upon request and provides reservation contact details.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='alpha-estate' and field_key='booking_requirement'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'alpha-estate','visitor_hours',
  '{"monday_sunday":"10:00-17:00","booking":"upon_request"}'::jsonb,
  'first_party_source',
  'https://alpha-estate.com/visit/',
  'Alpha Estate — Visit',
  timestamptz '2026-09-19 20:29:00+03',
  'The current official Visit page publishes daily and weekend visits from 10:00 to 17:00 upon request.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='alpha-estate' and field_key='visitor_hours'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'alpha-estate','visitor_offering',
  '{"guided_winery_tour":true,"wine_tasting":true,"tailored_hospitality_packages":true}'::jsonb,
  'first_party_source',
  'https://alpha-estate.com/visit/',
  'Alpha Estate — Visit',
  timestamptz '2026-09-19 20:29:00+03',
  'The current Visit page describes a guided winery tour ending in the tasting area and tailored hospitality packages upon request.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='alpha-estate' and field_key='visitor_offering'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);
