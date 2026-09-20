-- Sicily Visitability V1: Mirto Verde Agricola / Olio Mio Sicily.
-- Current first-party pages verify the San Cipirello mill and on-site pickup,
-- but do not publish a public mill/farm visitor programme.

update public.producers
set
  visit_status = 'not_publicly_confirmed',
  visit_source_url = 'https://oliomiosicily.com/produzione-olio-extravergine-artigianale/',
  visit_notes = 'Current first-party Olio Mio pages confirm the Mirto Verde Agricola mill in Contrada Gianvicario, San Cipirello, and offer on-site order pickup. However, they do not publish a current public mill/farm visitor programme, guided tour, tasting procedure, visitor timetable, booking rule, or walk-in policy. On-site pickup is not treated as evidence of general mill visitability.',
  opening_hours = null,
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = now()
where id = 'olio-mio-sicily';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'olio-mio-sicily','visit_status',
  '{"status":"not_publicly_confirmed","on_site_pickup_not_equivalent_to_visit":true}'::jsonb,
  'first_party_source',
  'https://oliomiosicily.com/produzione-olio-extravergine-artigianale/',
  'Olio Mio Sicily — production / contact pages',
  now(),
  'The current official site verifies the San Cipirello mill and on-site pickup but publishes no public mill/farm visit programme.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='olio-mio-sicily'
    and field_key='visit_status'
    and source_url='https://oliomiosicily.com/produzione-olio-extravergine-artigianale/'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'olio-mio-sicily','order_pickup_available',
  '{"available":true}'::jsonb,
  'first_party_source',
  'https://oliomiosicily.com/contatti/',
  'Olio Mio Sicily — Contacts',
  now(),
  'The current contact page advertises a promotional code for on-site pickup; this is retained separately from public visitability.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='olio-mio-sicily'
    and field_key='order_pickup_available'
    and source_url='https://oliomiosicily.com/contatti/'
);
