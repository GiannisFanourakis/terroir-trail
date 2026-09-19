-- Crete Visitability V1: Biolea Astrikas Estate.
-- Current first-party pages show a mixed-access visitor model: guided tours are
-- appointment-only, while the Kafeneion explicitly accepts first-come walk-ins.

update public.producers
set
  visit_status = 'public_visits',
  visit_source_url = 'https://biolea.gr/book-a-tour/',
  visit_notes = 'Current first-party pages confirm a year-round visitor-oriented estate with several access modes. The standard olive-oil guided tour is available by appointment only, Monday-Sunday 10:00-17:00, with classic tours published for April-October. The Restaurant/Kafeneion is open Tuesday-Sunday 11:00-15:30, and the Kafeneion explicitly operates first-come-first-served. Because booking rules differ by activity, no single estate-wide booking or walk-in flag is stored.',
  opening_hours = 'Guided tour: Mon-Sun 10:00-17:00 by appointment; classic tours Apr-Oct. Restaurant/Kafeneion: Tue-Sun 11:00-15:30.',
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{
    "guided_tour":{"monday_sunday":"10:00-17:00","booking":"required","classic_tour_season":"april_october"},
    "restaurant_kafeneion":{"tuesday_sunday":"11:00-15:30","kafeneion_access":"first_come_first_served"}
  }'::jsonb,
  seasonal_visit_notes = 'Classic tours are published for April-October. The estate homepage also describes the olive mill as designed to accommodate visitors year-round; activity availability varies by product.',
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 19:05:00+03'
where id = 'biolea-estate';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'biolea-estate',
  'tour_booking_requirement',
  '{"required":true,"scope":"olive_oil_guided_tour","hours":"Mon-Sun 10:00-17:00","classic_tour_season":"April-October"}'::jsonb,
  'first_party_source',
  'https://biolea.gr/tour/olive-oil-guided-tour-tasting/',
  'Biolea — Olive Oil Guided Tour & Tasting',
  timestamptz '2026-09-19 19:05:00+03',
  'The current 2026 tour page explicitly states that tours are by appointment only and available Monday-Sunday 10:00-17:00.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='biolea-estate'
    and field_key='tour_booking_requirement'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'biolea-estate',
  'programme_durations',
  '{"standard_guided_tour_minutes":60,"owner_walk_pairing_minutes":180,"chef_table_minutes":180,"other_programmes":"variable"}'::jsonb,
  'first_party_source',
  'https://biolea.gr/book-a-tour/',
  'Biolea — Book A Tour',
  timestamptz '2026-09-19 19:05:00+03',
  'Current official booking page publishes a 1-hour standard guided tour, two 3-hour programmes, and variable durations for other experiences. No single whole-estate typical duration is promoted.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='biolea-estate'
    and field_key='programme_durations'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'biolea-estate',
  'kafeneion_access',
  '{"walk_in":"accepted","mode":"first_come_first_served","hours":"Tue-Sun 11:00-15:30"}'::jsonb,
  'first_party_source',
  'https://biolea.gr/',
  'Biolea — homepage',
  timestamptz '2026-09-19 19:05:00+03',
  'The current official homepage explicitly says the Kafeneion is open to all visitors and operates on a first-come-first-served basis.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='biolea-estate'
    and field_key='kafeneion_access'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);
