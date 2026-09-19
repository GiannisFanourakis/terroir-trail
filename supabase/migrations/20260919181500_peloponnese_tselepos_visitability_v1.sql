-- Peloponnese Visitability V1: Ktima Tselepos.
-- Current first-party Visit page says tours are available Monday-Sunday by
-- appointment. General estate working hours are kept separate from tour availability.

update public.producers
set
  visit_status = 'appointment_only',
  visit_source_url = 'https://tselepos.gr/%CE%B5%CF%80%CE%B9%CF%83%CE%BA%CE%B5%CF%86%CF%84%CE%B5%CE%AF%CF%84%CE%B5-%CE%BC%CE%B1%CF%82/?lang=en',
  visit_notes = 'Current first-party Visit page states that all tours are available Monday through Sunday by appointment. The separate contact page publishes general estate working hours of Mon-Fri 09:00-17:00, Sat 10:00-16:00 and Sunday closed; this is kept separate from pre-arranged tour availability. Current tasting options include introductory, premium and old-vintage packages, plus a seasonal Fall(ing) for Wine tasting from 14 September to 30 November 2026. Parking, visit duration and actual tour languages are not explicitly published.',
  opening_hours = 'Tours: Mon-Sun by appointment. Estate contact/working hours: Mon-Fri 09:00-17:00; Sat 10:00-16:00; Sun closed.',
  visit_booking_requirement = 'required',
  walk_in_status = 'not_accepted',
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{
    "tours":{"monday_sunday":"appointment_only"},
    "estate_working_hours":{"monday_friday":"09:00-17:00","saturday":"10:00-16:00","sunday":"closed"}
  }'::jsonb,
  seasonal_visit_notes = 'Seasonal Fall(ing) for Wine tasting is published for 14 Sep-30 Nov 2026. Premium and old-vintage packages may include a vineyard tour depending on circumstances.',
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 00:00:00+03'
where id = 'ktima-tselepos';

insert into public.producer_fact_evidence (producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'ktima-tselepos','booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted","tour_days":"monday_sunday"}'::jsonb,
  'first_party_source',
  'https://tselepos.gr/%CE%B5%CF%80%CE%B9%CF%83%CE%BA%CE%B5%CF%86%CF%84%CE%B5%CE%AF%CF%84%CE%B5-%CE%BC%CE%B1%CF%82/?lang=en',
  'Ktima Tselepos — Visit Us',
  timestamptz '2026-09-19 00:00:00+03',
  'The current official Visit page explicitly says all tours are available daily Monday through Sunday by appointment.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='ktima-tselepos' and field_key='booking_requirement'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'ktima-tselepos','estate_working_hours',
  '{"monday_friday":"09:00-17:00","saturday":"10:00-16:00","sunday":"closed"}'::jsonb,
  'first_party_source','https://tselepos.gr/contact/?lang=en',
  'Ktima Tselepos — Contact',
  timestamptz '2026-09-19 00:00:00+03',
  'The current contact page publishes general estate working hours. These are not treated as a restriction on separately pre-arranged Sunday tours.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='ktima-tselepos' and field_key='estate_working_hours'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'ktima-tselepos','seasonal_tasting',
  '{"name":"Fall(ing) for wine","start":"2026-09-14","end":"2026-11-30","wines":5}'::jsonb,
  'first_party_source',
  'https://tselepos.gr/%CE%B5%CF%80%CE%B9%CF%83%CE%BA%CE%B5%CF%86%CF%84%CE%B5%CE%AF%CF%84%CE%B5-%CE%BC%CE%B1%CF%82/?lang=en',
  'Ktima Tselepos — Visit Us',
  timestamptz '2026-09-19 00:00:00+03',
  'The current official Visit page explicitly publishes this seasonal 2026 tasting period.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='ktima-tselepos' and field_key='seasonal_tasting'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);
