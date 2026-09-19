-- Northern Greece Visitability V1: Ktima Kir-Yianni Naoussa.
-- Current 2026 first-party visitor page requires reservations, publishes
-- Tue-Sun 11:00-18:00, and explicitly confirms free parking and disabled access.

update public.producers
set
  visit_status = 'appointment_only',
  visit_source_url = 'https://kiryianni.gr/el/episkepseis-naoussa/',
  visit_notes = 'Current first-party Naoussa visitor page, updated in June 2026, explicitly states that reservations are mandatory. The estate is open Tuesday-Sunday 11:00-18:00 and closed Monday. The page also explicitly publishes free parking and disabled access. Current visitor offers include wine tastings, food-and-wine pairing, vineyard picnics, cycling routes and private tastings. A standard visit duration and visitor languages are not explicitly published.',
  opening_hours = 'Tue-Sun 11:00-18:00; Mon closed. Reservations mandatory.',
  visit_booking_requirement = 'required',
  walk_in_status = 'not_accepted',
  parking_status = 'available',
  typical_visit_minutes = null,
  visitor_hours = '{
    "tuesday_sunday":"11:00-18:00",
    "monday":"closed"
  }'::jsonb,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 20:29:00+03'
where id = 'kir-yianni-naoussa';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'kir-yianni-naoussa','booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted"}'::jsonb,
  'first_party_source',
  'https://kiryianni.gr/el/episkepseis-naoussa/',
  'Ktima Kir-Yianni — Naoussa Visits',
  timestamptz '2026-09-19 20:29:00+03',
  'The current official Naoussa visitor page explicitly states that reservations are mandatory.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='kir-yianni-naoussa' and field_key='booking_requirement'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'kir-yianni-naoussa','visitor_hours',
  '{"tuesday_sunday":"11:00-18:00","monday":"closed"}'::jsonb,
  'first_party_source',
  'https://kiryianni.gr/el/episkepseis-naoussa/',
  'Ktima Kir-Yianni — Naoussa Visits',
  timestamptz '2026-09-19 20:29:00+03',
  'The current official page publishes 11:00-18:00 opening hours and Monday closure.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='kir-yianni-naoussa' and field_key='visitor_hours'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'kir-yianni-naoussa','parking_status',
  '{"status":"available","fee":"free"}'::jsonb,
  'first_party_source',
  'https://kiryianni.gr/el/episkepseis-naoussa/',
  'Ktima Kir-Yianni — Naoussa Visits',
  timestamptz '2026-09-19 20:29:00+03',
  'The current official Naoussa visitor page explicitly lists free parking.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='kir-yianni-naoussa' and field_key='parking_status'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'kir-yianni-naoussa','wheelchair_accessible',
  '{"accessible":true,"scope":"visitor_site"}'::jsonb,
  'first_party_source',
  'https://kiryianni.gr/el/episkepseis-naoussa/',
  'Ktima Kir-Yianni — Naoussa Visits',
  timestamptz '2026-09-19 20:29:00+03',
  'The current official Naoussa visitor page explicitly lists disabled access.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='kir-yianni-naoussa' and field_key='wheelchair_accessible'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'kir-yianni-naoussa','visitor_offering',
  '{"wine_tasting":true,"food_wine_pairing":true,"vineyard_picnic":true,"cycling_routes":true,"private_tasting":true}'::jsonb,
  'first_party_source',
  'https://kiryianni.gr/el/episkepseis-naoussa/',
  'Ktima Kir-Yianni — Naoussa Visits',
  timestamptz '2026-09-19 20:29:00+03',
  'The current first-party visitor page lists these visitor experiences.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='kir-yianni-naoussa' and field_key='visitor_offering'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);
