-- Puglia Visitability V1: Frantoio D'Orazio.
-- Current first-party experience page publishes seasonal production-site mill
-- visits during the olive-oil campaign, separate from BI-SHOP experiences.

update public.producers
set
  visit_status = 'seasonal_public',
  visit_source_url = 'https://www.frantoiodorazio.it/pages/esperienze',
  visit_notes = 'Current first-party Frantoio D''Orazio experience page publishes an actual mill visit at the Via dell''Ulivo production site during the olive-oil campaign, November-January, Monday-Friday in morning and afternoon sessions. The visit includes live milling observation and tasting freshly pressed EVOO. The page lists Italian, English and French. It does not state a universal advance-booking requirement, exact daily start times, walk-in policy, parking details or standard duration. Separate year-round/seasonal experiences at the BI-SHOP and countryside locations are not used to redefine this mapped production-site record.',
  opening_hours = 'Mill visit season: Nov-Jan, Mon-Fri, morning and afternoon sessions.',
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{"season":{"start":"11-01","end":"01-31"},"monday_friday":["morning","afternoon"]}'::jsonb,
  seasonal_visit_notes = 'Production-site mill visit is tied to the olive-oil campaign, November through January.',
  visitor_languages = array['it','en','fr'],
  visitability_reviewed_at = now()
where id = 'frantoio-dorazio-puglia';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'frantoio-dorazio-puglia','visitor_hours',
  '{"season":{"start":"11-01","end":"01-31"},"monday_friday":["morning","afternoon"]}'::jsonb,
  'first_party_source',
  'https://www.frantoiodorazio.it/pages/esperienze',
  'Frantoio D''Orazio — Esperienze',
  now(),
  'The current official experience page publishes mill visits November-January, Monday-Friday, morning and afternoon.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='frantoio-dorazio-puglia'
    and field_key='visitor_hours'
    and source_url='https://www.frantoiodorazio.it/pages/esperienze'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'frantoio-dorazio-puglia','visitor_languages',
  '{"languages":["it","en","fr"],"scope":"mill_visit"}'::jsonb,
  'first_party_source',
  'https://www.frantoiodorazio.it/pages/esperienze',
  'Frantoio D''Orazio — Esperienze',
  now(),
  'The current official experience page explicitly lists Italian, English and French for the mill visit.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='frantoio-dorazio-puglia'
    and field_key='visitor_languages'
    and source_url='https://www.frantoiodorazio.it/pages/esperienze'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'frantoio-dorazio-puglia','visitor_offering',
  '{"live_milling_visit":true,"fresh_evoo_tasting":true,"season":"november_january"}'::jsonb,
  'first_party_source',
  'https://www.frantoiodorazio.it/pages/esperienze',
  'Frantoio D''Orazio — Esperienze',
  now(),
  'The current official experience page explicitly describes the production-site mill visit during the olive-oil campaign.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='frantoio-dorazio-puglia'
    and field_key='visitor_offering'
    and source_url='https://www.frantoiodorazio.it/pages/esperienze'
);
