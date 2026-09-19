-- Crete Visitability V1: Manousakis Winery.
-- Current first-party visit page provides seasonal hours and explicitly requires bookings.

update public.producers
set
  visit_status = 'appointment_only',
  visit_source_url = 'https://www.manousakiswinery.com/visit',
  visit_notes = 'Current first-party visit page requires bookings for tours, tastings and/or dining. Complimentary winery tours are offered at published daily slots depending on season. The tasting terrace and taverna operate on published seasonal hours; Sundays are closed. Parking, typical visit duration and tour languages are not published on the current visit/contact pages.',
  opening_hours = 'Through 10 Oct 2026: Mon-Sat 12:00-20:00; Sun closed. 12 Oct-14 Nov 2026: 12:00-18:00; Sun closed. 16 Nov 2026-Apr 2027: tours & tastings by appointment only.',
  visit_booking_requirement = 'required',
  walk_in_status = 'not_accepted',
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{
    "2026_through_oct_10":{"monday_saturday":"12:00-20:00","sunday":"closed"},
    "2026_oct_12_nov_14":{"monday_saturday":"12:00-18:00","sunday":"closed"},
    "2026_nov_16_to_2027_april":{"tours_tastings":"appointment_only"}
  }'::jsonb,
  seasonal_visit_notes = 'Tours are complimentary and published at 12:00, 14:00, 16:00, 18:00 and 20:00 depending on time of year. Booking is required.',
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 19:50:00+03'
where id = 'manousakis-winery';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'manousakis-winery',
  'booking_requirement',
  '{"required":true,"scope":["tour","tasting","lunch","dinner"]}'::jsonb,
  'first_party_source',
  'https://www.manousakiswinery.com/visit',
  'Manousakis Winery — Visit',
  timestamptz '2026-09-19 19:50:00+03',
  'The current first-party visit page explicitly states that bookings are required and one booking covers a tour, tasting and/or meal.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='manousakis-winery'
    and field_key='booking_requirement'
    and verified_at=timestamptz '2026-09-19 19:50:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'manousakis-winery',
  'visitor_hours',
  '{
    "through_2026_10_10":{"monday_saturday":"12:00-20:00","sunday":"closed"},
    "2026_10_12_to_2026_11_14":{"monday_saturday":"12:00-18:00","sunday":"closed"},
    "2026_11_16_to_2027_04":{"tours_tastings":"appointment_only"}
  }'::jsonb,
  'first_party_source',
  'https://www.manousakiswinery.com/visit',
  'Manousakis Winery — Visit',
  timestamptz '2026-09-19 19:50:00+03',
  'Seasonal tasting terrace/taverna hours and winter appointment-only period are published on the current official visit page.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='manousakis-winery'
    and field_key='visitor_hours'
    and verified_at=timestamptz '2026-09-19 19:50:00+03'
);
