-- Tuscany Visitability V1: Colle di Bordocheo.
-- Current first-party tasting page explicitly publishes Mon-Fri 09:00-18:00,
-- reservation-only tastings, Italian/English/Spanish, and package-specific durations.

update public.producers
set
  visit_status = 'appointment_only',
  visit_source_url = 'https://www.colledibordocheo.com/it/proposte',
  visit_notes = 'Current first-party tasting page explicitly states that tastings are available Monday-Friday from 09:00 to 18:00 by reservation only, in Italian, English or Spanish. Published experiences vary substantially in duration: olive-oil tasting about 20 minutes, Bordocheo 5+1 about 90 minutes, Organic Walk & Wine Tasting about 2 hours, Lunch Tasting about 2 hours, and Gourmet Tasting over 2 hours. Parking is not explicitly published.',
  opening_hours = 'Mon-Fri 09:00-18:00; reservation only.',
  visit_booking_requirement = 'required',
  walk_in_status = 'not_accepted',
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{"monday_friday":"09:00-18:00","booking":"required"}'::jsonb,
  seasonal_visit_notes = 'Published tasting durations vary from about 20 minutes to over 2 hours depending on the selected experience.',
  visitor_languages = array['it','en','es'],
  visitability_reviewed_at = now()
where id = 'colle-di-bordocheo-tuscany';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'colle-di-bordocheo-tuscany','booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted"}'::jsonb,
  'first_party_source',
  'https://www.colledibordocheo.com/it/proposte',
  'Colle di Bordocheo — Proposte',
  now(),
  'The current official tasting page explicitly says tastings are available only by reservation.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='colle-di-bordocheo-tuscany'
    and field_key='booking_requirement'
    and source_url='https://www.colledibordocheo.com/it/proposte'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'colle-di-bordocheo-tuscany','visitor_hours',
  '{"monday_friday":"09:00-18:00","booking":"required"}'::jsonb,
  'first_party_source',
  'https://www.colledibordocheo.com/it/proposte',
  'Colle di Bordocheo — Proposte',
  now(),
  'The current official page publishes tastings Monday-Friday from 09:00 to 18:00.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='colle-di-bordocheo-tuscany'
    and field_key='visitor_hours'
    and source_url='https://www.colledibordocheo.com/it/proposte'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'colle-di-bordocheo-tuscany','visitor_languages',
  '{"languages":["it","en","es"],"scope":"tastings"}'::jsonb,
  'first_party_source',
  'https://www.colledibordocheo.com/it/proposte',
  'Colle di Bordocheo — Proposte',
  now(),
  'The current official tasting page explicitly lists Italian, English and Spanish.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='colle-di-bordocheo-tuscany'
    and field_key='visitor_languages'
    and source_url='https://www.colledibordocheo.com/it/proposte'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'colle-di-bordocheo-tuscany','programme_durations',
  '{"olive_oil_tasting_minutes":20,"bordocheo_5_plus_1_minutes":90,"organic_walk_wine_tasting_minutes":120,"lunch_tasting_minutes":120,"gourmet_tasting_minutes_min":120}'::jsonb,
  'first_party_source',
  'https://www.colledibordocheo.com/it/proposte',
  'Colle di Bordocheo — Proposte',
  now(),
  'The current official tasting page publishes materially different durations by experience; no single typical duration is appropriate.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='colle-di-bordocheo-tuscany'
    and field_key='programme_durations'
    and source_url='https://www.colledibordocheo.com/it/proposte'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'colle-di-bordocheo-tuscany','visitor_offering',
  '{"wine_tasting":true,"olive_oil_tasting":true,"vineyard_olive_grove_walk":true,"lunch_tasting":true,"gourmet_tasting":true}'::jsonb,
  'first_party_source',
  'https://www.colledibordocheo.com/it/proposte',
  'Colle di Bordocheo — Proposte',
  now(),
  'The current first-party page lists these tasting and walking experiences.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='colle-di-bordocheo-tuscany'
    and field_key='visitor_offering'
    and source_url='https://www.colledibordocheo.com/it/proposte'
);
