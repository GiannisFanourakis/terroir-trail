-- Santorini Visitability V1: Santorini Brewing Company.
-- Current first-party content confirms walk-in brewery visits, seasonal hours,
-- and appointment requests for groups of four or more.

update public.producers
set
  visit_status = 'public_visits',
  visit_source_url = 'https://www.santorinibrewingcompany.gr/the-brewery',
  visit_notes = 'Current first-party brewery page welcomes visitors to stop by the Mesa Gonia microbrewery and use the upstairs tasting area. Summer hours are Monday-Saturday 11:30-17:00; in the winter period from November through April, the brewery is open weekdays 12:00-16:00. Sundays are always closed. Appointments are requested for groups of 4 or more because space is limited, while ordinary individual/small-party visits are presented as walk-in visits.',
  opening_hours = 'Summer: Mon-Sat 11:30-17:00. Nov-Apr: weekdays 12:00-16:00. Closed Sundays.',
  visit_booking_requirement = 'not_required',
  walk_in_status = 'accepted',
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{
    "summer":{"monday_saturday":"11:30-17:00","sunday":"closed"},
    "november_april":{"weekdays":"12:00-16:00","sunday":"closed"}
  }'::jsonb,
  seasonal_visit_notes = 'Appointments are requested for groups of 4+ people because the tasting area has limited space; large groups cannot be accommodated.',
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 00:00:00+03'
where id = 'santorini-brewing-company';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'santorini-brewing-company',
  'visitor_hours',
  '{"summer":{"monday_saturday":"11:30-17:00","sunday":"closed"},"november_april":{"weekdays":"12:00-16:00","sunday":"closed"}}'::jsonb,
  'first_party_source',
  'https://www.santorinibrewingcompany.gr/the-brewery',
  'Santorini Brewing Company — The Brewery',
  timestamptz '2026-09-19 00:00:00+03',
  'The current official brewery page publishes separate summer and November-April visitor hours and states Sundays are always closed.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='santorini-brewing-company'
    and field_key='visitor_hours'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'santorini-brewing-company',
  'booking_requirement',
  '{"requirement":"not_required","walk_in_status":"accepted","group_appointment_requested_from":4}'::jsonb,
  'first_party_source',
  'https://www.santorinibrewingcompany.gr/the-brewery',
  'Santorini Brewing Company — The Brewery',
  timestamptz '2026-09-19 00:00:00+03',
  'The page invites visitors to stop by; appointments are specifically requested for groups of four or more due to limited space.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='santorini-brewing-company'
    and field_key='booking_requirement'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'santorini-brewing-company',
  'visitor_offering',
  '{"brewery_visit":true,"beer_tasting":true}'::jsonb,
  'first_party_source',
  'https://www.santorinibrewingcompany.gr/the-brewery',
  'Santorini Brewing Company — The Brewery',
  timestamptz '2026-09-19 00:00:00+03',
  'The official page describes on-site brewery visits and tasting beers in the upstairs tasting area.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='santorini-brewing-company'
    and field_key='visitor_offering'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);
