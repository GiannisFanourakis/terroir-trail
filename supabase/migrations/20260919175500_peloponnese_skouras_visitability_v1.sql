-- Peloponnese Visitability V1: Domaine Skouras.
-- Current first-party visitor page explicitly requires reservations and
-- publishes weekday/Saturday hours plus Sunday/national-holiday closure.

update public.producers
set
  visit_status = 'appointment_only',
  visit_source_url = 'https://skouras.gr/en/tastings-wine-tours',
  visit_notes = 'Current first-party visitor page explicitly states that reservations are required to visit Domaine Skouras. Visits include the 1,000-barrel cellar, bottling, vinification and wine-storage areas plus wine tasting. Published visitor hours are Monday-Friday 09:00-16:30 and Saturday 10:30-17:30; the winery is closed Sundays and national holidays. Parking, visit duration and actual tour languages are not explicitly published.',
  opening_hours = 'Mon-Fri 09:00-16:30; Sat 10:30-17:30; closed Sundays and national holidays. Reservation required.',
  visit_booking_requirement = 'required',
  walk_in_status = 'not_accepted',
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{
    "monday_friday":"09:00-16:30",
    "saturday":"10:30-17:30",
    "sunday":"closed",
    "national_holidays":"closed"
  }'::jsonb,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 00:00:00+03'
where id = 'skouras-winery-nemea';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'skouras-winery-nemea',
  'booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted"}'::jsonb,
  'first_party_source',
  'https://skouras.gr/en/tastings-wine-tours',
  'Domaine Skouras — Wine tours and tastings',
  timestamptz '2026-09-19 00:00:00+03',
  'The current first-party visitor page explicitly states that reservations are required to visit the winery.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='skouras-winery-nemea'
    and field_key='booking_requirement'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'skouras-winery-nemea',
  'visitor_hours',
  '{"monday_friday":"09:00-16:30","saturday":"10:30-17:30","sunday":"closed","national_holidays":"closed"}'::jsonb,
  'first_party_source',
  'https://skouras.gr/en/tastings-wine-tours',
  'Domaine Skouras — Wine tours and tastings',
  timestamptz '2026-09-19 00:00:00+03',
  'The current visitor page publishes weekday and Saturday hours and states Sundays and national holidays are closed.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='skouras-winery-nemea'
    and field_key='visitor_hours'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'skouras-winery-nemea',
  'visitor_offering',
  '{"cellar_tour":true,"bottling_area":true,"vinification_area":true,"wine_storage":true,"wine_tasting":true}'::jsonb,
  'first_party_source',
  'https://skouras.gr/en/tastings-wine-tours',
  'Domaine Skouras — Wine tours and tastings',
  timestamptz '2026-09-19 00:00:00+03',
  'The current visitor page describes tours of the cellar, bottling, vinification and storage areas plus tastings.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='skouras-winery-nemea'
    and field_key='visitor_offering'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);
