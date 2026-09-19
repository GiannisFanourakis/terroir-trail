-- Crete Visitability V1: Lafkas Brewery.
-- Current first-party pages explicitly require an appointment for the brewery/taproom
-- and publish a simple tasting offer. Duration, parking and visitor languages remain unknown.

update public.producers
set
  visit_status = 'appointment_only',
  visit_source_url = 'https://lafkasbrewery.com/beer-tasting-brewery-tour/',
  visit_notes = 'Current first-party pages say the Pazinos taproom is open by appointment and that the brewery tour/tasting is available after booking an appointment. The brewery currently advertises a simple tasting of four beers. No reliable visit duration, parking policy, or visitor-language information is published.',
  opening_hours = 'Open by appointment',
  visit_booking_requirement = 'required',
  walk_in_status = 'not_accepted',
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 19:45:00+03'
where id = 'lafkas-brewery';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'lafkas-brewery',
  'visit_status',
  '{"status":"appointment_only","booking_required":true,"walk_in_status":"not_accepted"}'::jsonb,
  'first_party_source',
  'https://lafkasbrewery.com/beer-tasting-brewery-tour/',
  'Lafkas Brewery — Beer Tasting & Brewery Tour',
  timestamptz '2026-09-19 19:45:00+03',
  'Current first-party page states that the tour/tasting is possible after booking an appointment; the homepage also says the brewery is open under appointment.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='lafkas-brewery'
    and field_key='visit_status'
    and verified_at=timestamptz '2026-09-19 19:45:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'lafkas-brewery',
  'tasting_offer',
  '{"simple_tasting":{"beer_count":4,"price_eur":9}}'::jsonb,
  'first_party_source',
  'https://lafkasbrewery.com/beer-tasting-brewery-tour/',
  'Lafkas Brewery — Beer Tasting & Brewery Tour',
  timestamptz '2026-09-19 19:45:00+03',
  'Current first-party page advertises a simple tasting of four types of beer for EUR 9. Price is time-sensitive and should be rechecked before being surfaced as a promise.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='lafkas-brewery'
    and field_key='tasting_offer'
    and source_url='https://lafkasbrewery.com/beer-tasting-brewery-tour/'
);
