-- Northern Greece Visitability V1: Siris Craft Brewery / Voreia.
-- Current first-party content explicitly welcomes brewery tours, but ordinary
-- hours and booking/walk-in rules remain unpublished.

update public.producers
set
  visit_status = 'current_access_uncertain',
  visit_source_url = 'https://www.sirisbrewery.com/en/contact-us/',
  visit_notes = 'Current first-party Siris/Voreia pages explicitly welcome visitors into the brewery for a tour of the beer-making world. However, the current site does not publish a normal visitor timetable, advance-booking requirement, walk-in policy, standard duration, parking details or visitor languages. Event-specific Open Breweries participation is not treated as ordinary year-round access. Contact the brewery before travelling.',
  opening_hours = 'Current ordinary visitor hours are not published; contact the brewery before travelling.',
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 20:29:00+03'
where id = 'siris-craft-brewery';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'siris-craft-brewery','visit_status',
  '{"status":"current_access_uncertain"}'::jsonb,
  'first_party_source',
  'https://www.sirisbrewery.com/en/contact-us/',
  'Siris Craft Brewery / Voreia — Contact',
  timestamptz '2026-09-19 20:29:00+03',
  'The current official contact page explicitly welcomes visitors for brewery tours, but does not publish ordinary operational access terms.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='siris-craft-brewery' and field_key='visit_status'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'siris-craft-brewery','visitor_offering',
  '{"brewery_tour":true}'::jsonb,
  'first_party_source',
  'https://www.sirisbrewery.com/en/contact-us/',
  'Siris Craft Brewery / Voreia — Contact',
  timestamptz '2026-09-19 20:29:00+03',
  'The current official page explicitly says the brewery is pleased to welcome visitors and take them on a tour.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='siris-craft-brewery' and field_key='visitor_offering'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);
