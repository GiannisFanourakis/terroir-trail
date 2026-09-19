-- Tuscany Visitability V1: Azienda Agricola Monteraponi.
-- Current first-party contact page explicitly publishes tastings and cellar
-- visits Monday-Friday 09:00-17:00 by prior reservation.

update public.producers
set
  visit_status = 'appointment_only',
  visit_source_url = 'https://www.monteraponi.it/contatti_azienda_agricola_monteraponi.php?lang=it',
  visit_notes = 'Current first-party Monteraponi contact page explicitly states that tastings and cellar visits are available Monday-Friday from 09:00 to 17:00 by prior reservation. The current page does not publish a standard visit duration, parking information, ordinary visitor languages, or a walk-in option.',
  opening_hours = 'Mon-Fri 09:00-17:00 by prior reservation.',
  visit_booking_requirement = 'required',
  walk_in_status = 'not_accepted',
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{"monday_friday":"09:00-17:00","booking":"required"}'::jsonb,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = now()
where id = 'monteraponi-tuscany';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'monteraponi-tuscany',
  'booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted"}'::jsonb,
  'first_party_source',
  'https://www.monteraponi.it/contatti_azienda_agricola_monteraponi.php?lang=it',
  'Azienda Agricola Monteraponi — Contatti',
  now(),
  'The current first-party contact page explicitly requires prior reservation for tastings and cellar visits.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='monteraponi-tuscany'
    and field_key='booking_requirement'
    and source_url='https://www.monteraponi.it/contatti_azienda_agricola_monteraponi.php?lang=it'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'monteraponi-tuscany',
  'visitor_hours',
  '{"monday_friday":"09:00-17:00","booking":"required"}'::jsonb,
  'first_party_source',
  'https://www.monteraponi.it/contatti_azienda_agricola_monteraponi.php?lang=it',
  'Azienda Agricola Monteraponi — Contatti',
  now(),
  'The current first-party contact page publishes tastings and cellar visits Monday-Friday from 09:00 to 17:00.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='monteraponi-tuscany'
    and field_key='visitor_hours'
    and source_url='https://www.monteraponi.it/contatti_azienda_agricola_monteraponi.php?lang=it'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'monteraponi-tuscany',
  'visitor_offering',
  '{"wine_tasting":true,"cellar_visit":true}'::jsonb,
  'first_party_source',
  'https://www.monteraponi.it/contatti_azienda_agricola_monteraponi.php?lang=it',
  'Azienda Agricola Monteraponi — Contatti',
  now(),
  'The current first-party contact page explicitly offers tastings and cellar visits.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='monteraponi-tuscany'
    and field_key='visitor_offering'
    and source_url='https://www.monteraponi.it/contatti_azienda_agricola_monteraponi.php?lang=it'
);
