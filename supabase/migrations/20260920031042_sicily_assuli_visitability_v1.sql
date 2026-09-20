-- Sicily Visitability V1: Assuli Winery.
-- Current first-party wine-tourism page explicitly states winery visits are
-- by reservation.

update public.producers
set
  visit_status = 'appointment_only',
  visit_source_url = 'https://assuli.it/pages/degustazioni-in-cantina',
  visit_notes = 'Current first-party Assuli wine-tourism page explicitly states that winery visits are by reservation (su prenotazione). The estate offers winery tastings and has an on-site wine shop. The current page does not publish a general visitor timetable beyond reservation-only access, a standard visit duration, parking details, or visitor languages.',
  opening_hours = 'Winery visits by reservation; no general public visitor timetable published.',
  visit_booking_requirement = 'required',
  walk_in_status = 'not_accepted',
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = now()
where id = 'assuli-winery-sicily';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'assuli-winery-sicily','booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted","wording":"su_prenotazione"}'::jsonb,
  'first_party_source',
  'https://assuli.it/pages/degustazioni-in-cantina',
  'Assuli — Degustazioni in cantina',
  now(),
  'The current official wine-tourism page explicitly states winery visits are by reservation.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='assuli-winery-sicily'
    and field_key='booking_requirement'
    and source_url='https://assuli.it/pages/degustazioni-in-cantina'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'assuli-winery-sicily','visitor_offering',
  '{"winery_tasting":true,"wine_shop":true}'::jsonb,
  'first_party_source',
  'https://assuli.it/pages/degustazioni-in-cantina',
  'Assuli — Degustazioni in cantina',
  now(),
  'The current first-party page publishes winery tastings and identifies an on-site wine shop.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='assuli-winery-sicily'
    and field_key='visitor_offering'
    and source_url='https://assuli.it/pages/degustazioni-in-cantina'
);
