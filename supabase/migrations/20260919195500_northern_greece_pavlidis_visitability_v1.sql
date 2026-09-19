-- Northern Greece Visitability V1: Ktima Pavlidis.
-- Current first-party contact page publishes six-day visiting hours and states
-- that visits are welcomed upon communication.

update public.producers
set
  visit_status = 'appointment_only',
  visit_source_url = 'https://ktima-pavlidis.gr/en/contact-2/',
  visit_notes = 'Current first-party contact page states that Ktima Pavlidis welcomes wine lovers and professionals for visits six days per week upon communication. Published visiting hours are Monday-Friday 10:00-16:00 and Saturday 10:00-14:00; Sunday is closed, and the winery may also close on national or local holidays. The current site does not publish a standard visit duration, parking details or visitor languages.',
  opening_hours = 'Mon-Fri 10:00-16:00; Sat 10:00-14:00; Sun closed. Visits upon prior communication.',
  visit_booking_requirement = 'required',
  walk_in_status = 'not_accepted',
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{
    "monday_friday":"10:00-16:00",
    "saturday":"10:00-14:00",
    "sunday":"closed"
  }'::jsonb,
  seasonal_visit_notes = 'The winery may be closed on national or local holidays.',
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 20:29:00+03'
where id = 'ktima-pavlidis';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'ktima-pavlidis','booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted","wording":"upon_communication"}'::jsonb,
  'first_party_source',
  'https://ktima-pavlidis.gr/en/contact-2/',
  'Ktima Pavlidis — Contact / Visit Us',
  timestamptz '2026-09-19 20:29:00+03',
  'The current official page states that visits are welcomed six days per week upon communication.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='ktima-pavlidis' and field_key='booking_requirement'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'ktima-pavlidis','visitor_hours',
  '{"monday_friday":"10:00-16:00","saturday":"10:00-14:00","sunday":"closed"}'::jsonb,
  'first_party_source',
  'https://ktima-pavlidis.gr/en/contact-2/',
  'Ktima Pavlidis — Contact / Visit Us',
  timestamptz '2026-09-19 20:29:00+03',
  'The current official page publishes the six-day visiting schedule.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='ktima-pavlidis' and field_key='visitor_hours'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);
