-- Crete Visitability V1: Stilianou Winery.
-- The newer homepage publishes 11:00-19:00 daily. An older first-party tasting
-- page still shows 11:00-18:00 and explicitly says November-March is by booking.

update public.producers
set
  visit_status = 'public_visits',
  visit_source_url = 'https://stilianouwinery.com/',
  visit_notes = 'Current first-party homepage publishes visitor/tasting hours of 11:00-19:00 daily and an active booking calendar. A separate older first-party tasting page still shows 11:00-18:00 and explicitly states that November-March visits are by booking. TerroirTrail uses the newer 19:00 closing time while retaining the winter booking rule. No reliable visit duration, parking policy, walk-in policy, or tour-language information is published.',
  opening_hours = 'Daily 11:00-19:00. Nov-Mar: contact/book before visiting.',
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{
    "current_daily":"11:00-19:00",
    "november_march":{"access":"by_booking"}
  }'::jsonb,
  seasonal_visit_notes = 'An older first-party tasting page still shows an 18:00 closing time; the newer homepage publishes 19:00 and is used as the current value.',
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 19:05:00+03'
where id = 'kazani-stilianou';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'kazani-stilianou',
  'visitor_hours',
  '{"daily":"11:00-19:00","source_recency":"newer_homepage"}'::jsonb,
  'first_party_source',
  'https://stilianouwinery.com/',
  'Stilianou Winery — homepage',
  timestamptz '2026-09-19 19:05:00+03',
  'The current homepage, published/updated in 2025, lists 11:00-19:00 for Monday through Sunday.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='kazani-stilianou'
    and field_key='visitor_hours'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'kazani-stilianou',
  'winter_booking_rule',
  '{"months":["november","december","january","february","march"],"access":"by_booking"}'::jsonb,
  'first_party_source',
  'https://stilianouwinery.com/wine-and-olive-oil-tastings/',
  'Stilianou Winery — Wine and Olive Oil Tastings',
  timestamptz '2026-09-19 19:05:00+03',
  'The dedicated tasting page explicitly states FROM NOVEMBER TO MARCH — On booking.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='kazani-stilianou'
    and field_key='winter_booking_rule'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'kazani-stilianou',
  'stale_hours_conflict',
  '{"older_page":"11:00-18:00","newer_homepage":"11:00-19:00","selected":"11:00-19:00"}'::jsonb,
  'first_party_source',
  'https://stilianouwinery.com/wine-and-olive-oil-tastings/',
  'Stilianou Winery — Wine and Olive Oil Tastings',
  timestamptz '2026-09-19 19:05:00+03',
  'The older dedicated tasting page lists 11:00-18:00. The newer homepage lists 11:00-19:00, so the newer figure is used.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='kazani-stilianou'
    and field_key='stale_hours_conflict'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);
