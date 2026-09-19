-- Santorini Visitability V1: Estate Argyros.
-- Current first-party FAQ confirms year-round access except national holidays,
-- recommends rather than requires reservations, and publishes parking, accessibility
-- and package-duration details.

update public.producers
set
  visit_status = 'public_visits',
  visit_source_url = 'https://estateargyros.com/faq/',
  visit_notes = 'Current first-party FAQ confirms that Estate Argyros is open year-round except national holidays. Reservations are not required but are recommended because tour schedules vary daily and seasonally. The winery provides a free on-site parking area and states that the tasting room, patio, vineyards and production area are wheelchair accessible. Published tasting experiences last approximately 45 or 90 minutes depending on the selected option; the initial guided tour portion usually lasts 15-20 minutes.',
  opening_hours = 'Open year-round except national holidays; tour schedule varies daily/seasonally, so check current availability before travelling.',
  visit_booking_requirement = 'recommended',
  walk_in_status = 'subject_to_availability',
  parking_status = 'available',
  typical_visit_minutes = null,
  visitor_hours = '{
    "year_round":true,
    "national_holidays":"closed",
    "tour_schedule":"varies_daily_seasonally"
  }'::jsonb,
  seasonal_visit_notes = 'Published experiences currently include approximately 45-minute and 90-minute options. Tour schedules vary daily and seasonally.',
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 00:00:00+03'
where id = 'estate-argyros-santorini';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'estate-argyros-santorini',
  'booking_requirement',
  '{"requirement":"recommended","reservation_required":false,"walk_in_status":"subject_to_availability"}'::jsonb,
  'first_party_source',
  'https://estateargyros.com/faq/',
  'Estate Argyros — FAQ',
  timestamptz '2026-09-19 00:00:00+03',
  'The current official FAQ states that a reservation is not required but is recommended, and that the tour schedule varies daily and seasonally.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='estate-argyros-santorini'
    and field_key='booking_requirement'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'estate-argyros-santorini',
  'visitor_hours',
  '{"year_round":true,"national_holidays":"closed","tour_schedule":"varies_daily_seasonally"}'::jsonb,
  'first_party_source',
  'https://estateargyros.com/faq/',
  'Estate Argyros — FAQ',
  timestamptz '2026-09-19 00:00:00+03',
  'The current FAQ explicitly says the estate stays open all year except national holidays.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='estate-argyros-santorini'
    and field_key='visitor_hours'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'estate-argyros-santorini',
  'parking_status',
  '{"status":"available","fee":"free","reservable":false}'::jsonb,
  'first_party_source',
  'https://estateargyros.com/faq/',
  'Estate Argyros — FAQ',
  timestamptz '2026-09-19 00:00:00+03',
  'The official FAQ states there is a parking area on the property, with no parking fee, and spaces cannot be reserved.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='estate-argyros-santorini'
    and field_key='parking_status'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'estate-argyros-santorini',
  'programme_durations',
  '{"minutes":[45,90],"guided_tour_component_minutes":[15,20],"variable_by_package":true}'::jsonb,
  'first_party_source',
  'https://estateargyros.com/faq/',
  'Estate Argyros — FAQ',
  timestamptz '2026-09-19 00:00:00+03',
  'The FAQ publishes approximately 45 minutes for Estate Argyros Welcome and 90 minutes for Taste the Real Santorini; the common guided-tour portion is about 15-20 minutes.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='estate-argyros-santorini'
    and field_key='programme_durations'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'estate-argyros-santorini',
  'wheelchair_accessible',
  '{"accessible":true,"areas":["tasting_room","patio","vineyards","production_area"]}'::jsonb,
  'first_party_source',
  'https://estateargyros.com/faq/',
  'Estate Argyros — FAQ',
  timestamptz '2026-09-19 00:00:00+03',
  'The current official FAQ explicitly states these visitor areas are wheelchair accessible.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='estate-argyros-santorini'
    and field_key='wheelchair_accessible'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);
