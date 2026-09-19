-- Santorini Visitability V1: Vassaltis Vineyards.
-- Current first-party pages publish 11:00-20:00 winery hours and a daily
-- 16:00-17:00 cellar tour. Reservation flows exist but a universal booking
-- requirement or general walk-in policy is not explicitly stated.

update public.producers
set
  visit_status = 'public_visits',
  visit_source_url = 'https://vassaltis.com/contact/',
  visit_notes = 'Current first-party Vassaltis pages publish winery opening hours of 11:00-20:00 and describe multiple wine experiences, including tasting flights, food-and-wine experiences, and an intimate cellar tour. The cellar tour is currently published daily from 16:00-17:00 for up to 12 people. Reservation flows are provided for experiences, but the current site does not explicitly state a universal advance-booking requirement or define a general walk-in policy. Parking and visitor languages are not published.',
  opening_hours = 'Daily 11:00-20:00.',
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{
    "daily":"11:00-20:00",
    "cellar_tour":"16:00-17:00"
  }'::jsonb,
  seasonal_visit_notes = 'Cellar tour is currently published daily 16:00-17:00 with a maximum of 12 guests.',
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 00:00:00+03'
where id = 'vassaltis-vineyards';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'vassaltis-vineyards',
  'visitor_hours',
  '{"daily":"11:00-20:00"}'::jsonb,
  'first_party_source',
  'https://vassaltis.com/contact/',
  'Vassaltis Vineyards — Contact',
  timestamptz '2026-09-19 00:00:00+03',
  'The current official contact page publishes winery open hours of 11:00-20:00.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='vassaltis-vineyards'
    and field_key='visitor_hours'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'vassaltis-vineyards',
  'cellar_tour_schedule',
  '{"daily":"16:00-17:00","max_guests":12}'::jsonb,
  'first_party_source',
  'https://vassaltis.com/best-wine-experience-in-santorini/',
  'Vassaltis Vineyards — Wine Experiences',
  timestamptz '2026-09-19 00:00:00+03',
  'The current official wine-experience page publishes the cellar tour daily from 16:00 to 17:00 for a maximum of 12 guests.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='vassaltis-vineyards'
    and field_key='cellar_tour_schedule'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'vassaltis-vineyards',
  'visitor_offering',
  '{"wine_tasting":true,"cellar_tour":true,"lunch_dinner":true,"food_wine_pairing":true}'::jsonb,
  'first_party_source',
  'https://vassaltis.com/best-wine-experience-in-santorini/',
  'Vassaltis Vineyards — Wine Experiences',
  timestamptz '2026-09-19 00:00:00+03',
  'Current first-party pages describe tasting flights, a cellar tour, and food-and-wine experiences.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='vassaltis-vineyards'
    and field_key='visitor_offering'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);
