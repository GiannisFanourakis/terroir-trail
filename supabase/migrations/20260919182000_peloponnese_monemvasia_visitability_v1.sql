-- Peloponnese Visitability V1: Monemvasia Winery Tsimbidi.
-- Standard tour/tasting visits are Tuesday-Saturday 10:00-16:00,
-- reservation required, and last 60-90 minutes.

update public.producers
set
  visit_status = 'appointment_only',
  visit_source_url = 'https://www.monemvasiawinery.gr/en/tour-tasting/',
  visit_notes = 'Current first-party Tour/Tasting page explicitly requires reservations for standard winery tastings. Tour/tasting visits are published Tuesday-Saturday 10:00-16:00 and last 60-90 minutes. The general contact page separately lists Tue-Fri winery opening hours to 17:00 and Saturday to 16:00, with Monday/Sunday closed; the visitor tasting window is kept distinct. Parking and actual visitor languages are not explicitly published.',
  opening_hours = 'Tour/tasting: Tue-Sat 10:00-16:00; reservation required. General winery hours: Tue-Fri 10:00-17:00; Sat 10:00-16:00; Mon/Sun closed.',
  visit_booking_requirement = 'required',
  walk_in_status = 'not_accepted',
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{
    "tour_tasting":{"tuesday_saturday":"10:00-16:00","booking":"required"},
    "general_winery":{"tuesday_friday":"10:00-17:00","saturday":"10:00-16:00","monday":"closed","sunday":"closed"}
  }'::jsonb,
  seasonal_visit_notes = 'Tour/tasting duration is published as 60-90 minutes depending on the visit/tasting.',
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 00:00:00+03'
where id = 'monemvasia-winery';

insert into public.producer_fact_evidence (producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'monemvasia-winery','booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted","tour_days":"tuesday_saturday"}'::jsonb,
  'first_party_source','https://www.monemvasiawinery.gr/en/tour-tasting/',
  'Monemvasia Winery — Tour/Tasting',timestamptz '2026-09-19 00:00:00+03',
  'The current official Tour/Tasting page explicitly states reservation is required.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='monemvasia-winery' and field_key='booking_requirement'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'monemvasia-winery','visitor_hours',
  '{"tour_tasting":{"tuesday_saturday":"10:00-16:00"},"general_winery":{"tuesday_friday":"10:00-17:00","saturday":"10:00-16:00","monday":"closed","sunday":"closed"}}'::jsonb,
  'first_party_source','https://www.monemvasiawinery.gr/en/tour-tasting/',
  'Monemvasia Winery — Tour/Tasting and Contact',timestamptz '2026-09-19 00:00:00+03',
  'The official Tour/Tasting page gives the visitor tasting window; the official Contact page provides broader winery opening hours.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='monemvasia-winery' and field_key='visitor_hours'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'monemvasia-winery','programme_durations',
  '{"minutes_min":60,"minutes_max":90,"variable_by_visit":true}'::jsonb,
  'first_party_source','https://www.monemvasiawinery.gr/en/tour-tasting/',
  'Monemvasia Winery — Tour/Tasting',timestamptz '2026-09-19 00:00:00+03',
  'The current official Tour/Tasting page states tastings last 60-90 minutes. No single typical duration is promoted.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='monemvasia-winery' and field_key='programme_durations'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);
