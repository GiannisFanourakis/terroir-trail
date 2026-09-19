-- Crete Visitability V1: KASTA Microbrews.
-- Current first-party pages supersede the older showroom schedule: the Tap Room
-- is closed until further notice, showroom hours are not currently published,
-- and a beer-tasting session remains available through a booking/workshop flow.

update public.producers
set
  visit_status = 'appointment_only',
  visit_source_url = 'https://kastabeer.com/beer-tasting/',
  visit_notes = 'Current first-party pages state that the Tap Room is closed until further notice and that Show Room visiting hours are to be announced. A separate current Beer Tasting page and booking/workshop page still promote an interactive tasting session. Treat visitor access as appointment-based for the tasting experience; do not present the site as an open taproom or publish the older Mon-Fri 09:00-17:00 showroom hours.',
  opening_hours = 'Tap Room closed until further notice; Show Room hours not currently published. Beer tasting sessions are offered by booking.',
  visit_booking_requirement = 'required',
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 19:05:00+03'
where id = 'kasta-brewery';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'kasta-brewery',
  'tap_room_status',
  '{"status":"closed_until_further_notice"}'::jsonb,
  'first_party_source',
  'https://kastabeer.com/show-room/',
  'KASTA — Show Room / Tap Room',
  timestamptz '2026-09-19 19:05:00+03',
  'The current dedicated Tap Room page explicitly says the Tap Room will remain closed until further notice.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='kasta-brewery'
    and field_key='tap_room_status'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'kasta-brewery',
  'tasting_booking',
  '{"booking_available":true,"scope":"beer_tasting_session"}'::jsonb,
  'first_party_source',
  'https://kastabeer.com/beer-tasting/',
  'KASTA — Beer Tasting',
  timestamptz '2026-09-19 19:05:00+03',
  'The current first-party Beer Tasting page invites visitors to book an interactive beer-tasting session and links to a booking/workshop page.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='kasta-brewery'
    and field_key='tasting_booking'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'kasta-brewery',
  'stale_showroom_hours',
  '{"previous_hours":"Mon-Fri 09:00-17:00","status":"superseded_by_current_pages"}'::jsonb,
  'first_party_source',
  'https://kastabeer.com/about-us/',
  'KASTA — About Us',
  timestamptz '2026-09-19 19:05:00+03',
  'The About page still displays Mon-Fri 09:00-17:00 showroom hours, but newer/current visitor pages say the Tap Room is closed and showroom hours are to be announced. The old hours are not surfaced as current.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='kasta-brewery'
    and field_key='stale_showroom_hours'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);
