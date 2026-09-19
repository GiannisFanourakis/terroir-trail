-- Santorini Visitability V1: Santo Wines Cooperative.
-- Current first-party content confirms a year-round Wine Tourism Center with
-- multiple visitor services. Service-specific hours vary and reservations are
-- available but not stated as universally mandatory.

update public.producers
set
  visit_status = 'public_visits',
  visit_source_url = 'https://santowines.gr/visit-us',
  visit_notes = 'Current first-party Santo Wines site states that the Wine Tourism Center in Pyrgos is open all year round. The current visitor offer includes winery tours, wine tasting, olive-oil tasting, restaurant service, documentary film and a wine/deli shop, with online reservation flows for several services. The official site does not currently publish one dependable daily timetable covering all visitor services or state that reservations are mandatory, so booking and walk-in status remain unset.',
  opening_hours = 'Wine Tourism Center open year-round; individual service hours vary, so check the current official booking/visit pages before travelling.',
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{"year_round":true,"service_hours":"vary_by_service"}'::jsonb,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 00:00:00+03'
where id = 'santo-wines-santorini';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'santo-wines-santorini',
  'visitor_hours',
  '{"year_round":true,"service_hours":"vary_by_service"}'::jsonb,
  'first_party_source',
  'https://santowines.gr/',
  'Santo Wines — official homepage',
  timestamptz '2026-09-19 00:00:00+03',
  'The current official homepage explicitly states that the Wine Tourism Center is open all year round.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='santo-wines-santorini'
    and field_key='visitor_hours'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'santo-wines-santorini',
  'visitor_offering',
  '{"winery_tour":true,"wine_tasting":true,"olive_oil_tasting":true,"restaurant":true,"documentary_film":true,"wine_deli_shop":true,"online_booking_available":true}'::jsonb,
  'first_party_source',
  'https://santowines.gr/visit-us',
  'Santo Wines — Visit Us / Book Online',
  timestamptz '2026-09-19 00:00:00+03',
  'Current first-party visit and booking pages list these visitor services. Booking availability is not treated as evidence that every visit requires a reservation.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='santo-wines-santorini'
    and field_key='visitor_offering'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);
