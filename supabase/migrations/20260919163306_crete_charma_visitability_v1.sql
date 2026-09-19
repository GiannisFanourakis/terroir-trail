-- Crete Visitability V1: Cretan Brewery (Charma Beer).
-- Current first-party visitor page confirms the public visiting season, daily
-- hours, tour timetable and Sunday/bank-holiday tour exclusions.

update public.producers
set
  visit_status = 'seasonal_public',
  visit_source_url = 'https://www.cretanbeer.gr/en/cretan-brewery/visit-us/',
  visit_notes = 'Current first-party visitor page confirms a public visiting season from 8 April to 31 October, daily 11:00-20:00. Guided brewery tours are offered at published times except Sundays and bank holidays, and the site provides reservation links for tours and tasting packages. General walk-in policy, parking and tour languages are not explicitly published.',
  opening_hours = '8 Apr-31 Oct: daily 11:00-20:00. Kitchen until 19:30. No brewery tours Sundays or bank holidays.',
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{
    "season":{"start":"04-08","end":"10-31"},
    "daily":"11:00-20:00",
    "kitchen_until":"19:30",
    "tour_times":["12:00","13:30","15:00","16:30"],
    "tour_exceptions":["sunday","bank_holidays"]
  }'::jsonb,
  seasonal_visit_notes = 'Guided tours run at 12:00, 13:30, 15:00 and 16:30 except Sundays and bank holidays. Cooking classes require at least 5 days advance contact.',
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 19:05:00+03'
where id = 'cretan-brewery-charma';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'cretan-brewery-charma',
  'visitor_hours',
  '{"season":{"start":"04-08","end":"10-31"},"daily":"11:00-20:00","kitchen_until":"19:30"}'::jsonb,
  'first_party_source',
  'https://www.cretanbeer.gr/en/cretan-brewery/visit-us/',
  'Cretan Brewery — Visit us',
  timestamptz '2026-09-19 19:05:00+03',
  'The current official visitor page publishes the seasonal opening period and daily visiting hours.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='cretan-brewery-charma'
    and field_key='visitor_hours'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'cretan-brewery-charma',
  'tour_schedule',
  '{"times":["12:00","13:30","15:00","16:30"],"no_tours":["sunday","bank_holidays"]}'::jsonb,
  'first_party_source',
  'https://www.cretanbeer.gr/en/cretan-brewery/visit-us/',
  'Cretan Brewery — Visit us',
  timestamptz '2026-09-19 19:05:00+03',
  'The current official visitor page publishes daily guided-tour times and Sunday/bank-holiday exclusions.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='cretan-brewery-charma'
    and field_key='tour_schedule'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);
