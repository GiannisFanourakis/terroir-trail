-- Crete Visitability V1: Lyrarakis Winery.
-- Current first-party visit page confirms April-October daily hours, last tasting
-- time, an estimated whole-visit duration of 1.5 hours, and winter upon-request access.

update public.producers
set
  visit_status = 'seasonal_public',
  visit_source_url = 'https://www.lyrarakis.com/en/visit-us',
  visit_notes = 'Current first-party visit page publishes April-October daily opening hours, last tasting time, an estimated total visit duration of 1.5 hours, and November-March visits available upon request. The page does not explicitly state a general main-season booking requirement, walk-in policy, parking policy, or visitor languages.',
  opening_hours = 'Apr-Oct: daily 11:30-19:00; last tastings start 17:30. Bank holidays closed. Nov-Mar: visits available upon request.',
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = 90,
  visitor_hours = '{
    "april_october":{"daily":"11:30-19:00","last_tasting":"17:30","bank_holidays":"closed"},
    "november_march":{"access":"upon_request"}
  }'::jsonb,
  seasonal_visit_notes = 'Estimated whole-visit duration published by the winery: 1.5 hours. November-March visits are available upon request.',
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 19:05:00+03'
where id = 'lyrarakis-winery';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'lyrarakis-winery',
  'visitor_hours',
  '{"april_october":{"daily":"11:30-19:00","last_tasting":"17:30","bank_holidays":"closed"},"november_march":{"access":"upon_request"}}'::jsonb,
  'first_party_source',
  'https://www.lyrarakis.com/en/visit-us',
  'Lyrarakis Winery — Visit Us',
  timestamptz '2026-09-19 19:05:00+03',
  'The current official visit page publishes the April-October timetable, last tasting time, bank-holiday closure and winter upon-request access.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='lyrarakis-winery'
    and field_key='visitor_hours'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'lyrarakis-winery',
  'typical_visit_minutes',
  '{"minutes":90,"source_wording":"Estimated visit duration: 1.5 hours"}'::jsonb,
  'first_party_source',
  'https://www.lyrarakis.com/en/visit-us',
  'Lyrarakis Winery — Visit Us',
  timestamptz '2026-09-19 19:05:00+03',
  'The current official visit page explicitly publishes an estimated total visit duration of one and a half hours.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='lyrarakis-winery'
    and field_key='typical_visit_minutes'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);
