-- Tuscany Visitability V1: Casa Julia.
-- Current first-party oleotourism page confirms a May-end October season,
-- standard 09:30-11:30 / ~2 hour visits, and mandatory booking at least 24h ahead.

update public.producers
set
  visit_status = 'seasonal_public',
  visit_source_url = 'https://www.casajulia.info/negozio/en/product/esperienza-di-oleoturismo-in-toscana-nelloliveto-di-casa-julia/',
  visit_notes = 'Current first-party Casa Julia oleotourism page publishes a visitor season from May through the end of October. The standard experience runs approximately 09:30-11:30 and lasts about 2 hours. Reservations are mandatory at least 24 hours in advance. The full experience includes a guided olive-grove visit and comparative EVOO tasting; a simple bread-and-oil tasting is also offered. The page notes hilly terrain, recommends closed-toe shoes, and allows dogs on a leash. Parking and visitor languages are not explicitly published.',
  opening_hours = 'May-end Oct: standard oleotourism visit approximately 09:30-11:30; reservation required at least 24h in advance.',
  visit_booking_requirement = 'required',
  walk_in_status = 'not_accepted',
  parking_status = null,
  typical_visit_minutes = 120,
  visitor_hours = '{
    "season":{"start":"05-01","end":"10-31"},
    "standard_visit":"09:30-11:30"
  }'::jsonb,
  seasonal_visit_notes = 'Best period: spring and early autumn. Hilly terrain; closed-toe shoes recommended; dogs allowed on leash.',
  visitor_languages = null,
  visitability_reviewed_at = now()
where id = 'casa-julia-tuscany';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'casa-julia-tuscany','booking_requirement',
  '{"required":true,"minimum_notice_hours":24,"walk_in_status":"not_accepted"}'::jsonb,
  'first_party_source',
  'https://www.casajulia.info/negozio/en/product/esperienza-di-oleoturismo-in-toscana-nelloliveto-di-casa-julia/',
  'Casa Julia — Oleotourism',
  now(),
  'The current official page explicitly states that reservations are mandatory at least 24 hours in advance.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='casa-julia-tuscany'
    and field_key='booking_requirement'
    and source_url='https://www.casajulia.info/negozio/en/product/esperienza-di-oleoturismo-in-toscana-nelloliveto-di-casa-julia/'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'casa-julia-tuscany','visitor_hours',
  '{"season":{"start":"05-01","end":"10-31"},"standard_visit":"09:30-11:30"}'::jsonb,
  'first_party_source',
  'https://www.casajulia.info/negozio/en/product/esperienza-di-oleoturismo-in-toscana-nelloliveto-di-casa-julia/',
  'Casa Julia — Oleotourism',
  now(),
  'The current official page publishes visits from May through end of October and a standard 09:30-11:30 time window.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='casa-julia-tuscany'
    and field_key='visitor_hours'
    and source_url='https://www.casajulia.info/negozio/en/product/esperienza-di-oleoturismo-in-toscana-nelloliveto-di-casa-julia/'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'casa-julia-tuscany','typical_visit_minutes',
  '{"minutes":120,"scope":"standard_oleotourism_experience","approximate":true}'::jsonb,
  'first_party_source',
  'https://www.casajulia.info/negozio/en/product/esperienza-di-oleoturismo-in-toscana-nelloliveto-di-casa-julia/',
  'Casa Julia — Oleotourism',
  now(),
  'The current official page states the standard experience lasts about 2 hours.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='casa-julia-tuscany'
    and field_key='typical_visit_minutes'
    and source_url='https://www.casajulia.info/negozio/en/product/esperienza-di-oleoturismo-in-toscana-nelloliveto-di-casa-julia/'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'casa-julia-tuscany','visitor_offering',
  '{"guided_olive_grove_visit":true,"comparative_evoo_tasting":true,"simple_tasting":true}'::jsonb,
  'first_party_source',
  'https://www.casajulia.info/negozio/en/product/esperienza-di-oleoturismo-in-toscana-nelloliveto-di-casa-julia/',
  'Casa Julia — Oleotourism',
  now(),
  'The current official page describes a guided olive-grove visit, comparative EVOO tasting, and simple bread-and-oil tasting.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='casa-julia-tuscany'
    and field_key='visitor_offering'
    and source_url='https://www.casajulia.info/negozio/en/product/esperienza-di-oleoturismo-in-toscana-nelloliveto-di-casa-julia/'
);
