-- Crete Visitability V1: StathakisFamily Cretan Honey Experience.
-- Current first-party site confirms an active dedicated visitor site with
-- bookable tours/tastings, a honey shop and coffee place. No current season
-- or daily visitor timetable is published.

update public.producers
set
  visit_status = 'public_visits',
  visit_source_url = 'https://stathakisfamily.com/cretan-honey-experience-tour-taste/',
  visit_notes = 'Current first-party site actively promotes and books the Cretan Honey Experience in Kaloudiana, including guided honey-production tours, tastings, a honey shop and coffee place. Four current bookable experiences are published with durations of 45 or 90 minutes. The site does not publish a current seasonal opening period, daily visitor timetable, general walk-in policy, parking policy, or tour languages, so those remain unconfirmed.',
  opening_hours = null,
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 19:05:00+03'
where id = 'stathakis-honey-park';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'stathakis-honey-park',
  'visit_status',
  '{"status":"public_visits","visitor_site":true,"shop":true,"coffee_place":true}'::jsonb,
  'first_party_source',
  'https://stathakisfamily.com/cretan-honey-experience-tour-taste/',
  'StathakisFamily — Cretan Honey Experience Tour & Taste',
  timestamptz '2026-09-19 19:05:00+03',
  'The current official site presents a dedicated visitor site with tours, honey tastings, a honey shop and coffee place. No current season or daily opening timetable is published.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='stathakis-honey-park'
    and field_key='visit_status'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'stathakis-honey-park',
  'programme_durations',
  '{"minutes":[90,90,45,90],"range_minutes":[45,90],"variable_by_package":true}'::jsonb,
  'first_party_source',
  'https://stathakisfamily.com/tours-book-now/',
  'StathakisFamily — Tours / Book Now',
  timestamptz '2026-09-19 19:05:00+03',
  'The current booking page lists four visitor experiences with durations of either 45 or 90 minutes; no single typical duration is promoted.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='stathakis-honey-park'
    and field_key='programme_durations'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'stathakis-honey-park',
  'booking_flow',
  '{"booking_available":true,"provider":"AnyRoad"}'::jsonb,
  'first_party_source',
  'https://stathakisfamily.com/tours-book-now/',
  'StathakisFamily — Tours / Book Now',
  timestamptz '2026-09-19 19:05:00+03',
  'The producer directly links each current experience into a booking flow. This establishes booking availability, not that advance booking is mandatory.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='stathakis-honey-park'
    and field_key='booking_flow'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);
