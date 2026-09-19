-- Crete Visitability V1: Meligyris.
-- Current first-party pages confirm the Arkalochori contact/pickup location,
-- but not a general apiary visit, tasting programme, public shop timetable or walk-in access.

update public.producers
set
  visit_status = 'not_publicly_confirmed',
  visit_source_url = 'https://meligyris.com/pages/contact',
  visit_notes = 'Current first-party site confirms the Arkalochori contact/pickup location. The online store offers order pickup at Arkalochori, but the producer does not publish a current apiary visit, tour, tasting programme, public shop timetable, booking rule, or walk-in policy. Do not present the site as a general visitor attraction.',
  opening_hours = null,
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 19:25:00+03'
where id = 'meligyris-apiary';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'meligyris-apiary',
  'order_pickup_available',
  '{"location":"Arkalochori","available":true}'::jsonb,
  'first_party_source',
  'https://meligyris.com/products/honey-with-honeycomb',
  'Meligyris — official online store',
  timestamptz '2026-09-19 19:25:00+03',
  'The current first-party product page states that pickup is available at Arkalochori, usually ready within 24 hours. This is an order-pickup fact, not evidence of general public apiary visits.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='meligyris-apiary'
    and field_key='order_pickup_available'
    and source_url='https://meligyris.com/products/honey-with-honeycomb'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'meligyris-apiary',
  'visit_status',
  '{"status":"not_publicly_confirmed"}'::jsonb,
  'first_party_source',
  'https://meligyris.com/pages/contact',
  'Meligyris — official contact page',
  timestamptz '2026-09-19 19:25:00+03',
  'Current first-party pages support a contact/pickup location but do not publish a current apiary visitor programme, tour, tasting, public shop hours or walk-in policy.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='meligyris-apiary'
    and field_key='visit_status'
    and verified_at=timestamptz '2026-09-19 19:25:00+03'
);
