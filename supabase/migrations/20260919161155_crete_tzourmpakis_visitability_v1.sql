-- Crete Visitability V1: Tzourmpakis Dairy.
-- Current first-party material confirms the dairy and contact point but not
-- present-day public shop/tour/walk-in access. Historical shop references are
-- retained only as context, not as current visitability evidence.

update public.producers
set
  visit_status = 'not_publicly_confirmed',
  visit_source_url = 'https://tzourmpakis.gr/',
  visit_notes = 'Current first-party site confirms the working dairy and direct contact details in Mixorrouma, but it does not publish a current public visitor programme, shop opening schedule, tour procedure, booking rule, or walk-in policy. Older public sources mention a shop on the Rethymno-Spili road, but that evidence is not current enough to establish present-day public access. Contact the producer before considering a visit.',
  opening_hours = null,
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 19:15:00+03'
where id = 'tzourmpakis-dairy-amari';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'tzourmpakis-dairy-amari',
  'visit_status',
  '{"status":"not_publicly_confirmed"}'::jsonb,
  'first_party_source',
  'https://tzourmpakis.gr/',
  'Tzourmpakis Dairy — official site',
  timestamptz '2026-09-19 19:15:00+03',
  'Current first-party site confirms the dairy but publishes no current public visitor programme, shop hours, tour procedure, booking rule or walk-in policy. Older shop references are not treated as current access evidence.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='tzourmpakis-dairy-amari'
    and field_key='visit_status'
    and verified_at=timestamptz '2026-09-19 19:15:00+03'
);
