-- Puglia Visitability V1: De Carlo.
-- Current first-party experience page limits guided mill visits to harvest time,
-- requires an advance availability request, and offers tours only in Italian/English.

update public.producers
set
  visit_status = 'seasonal_public',
  visit_source_url = 'https://www.oliodecarlo.com/en/experiences/',
  visit_notes = 'Current first-party De Carlo experience page publishes guided visits to the oil mill during the olive-harvest period. Visitors must request availability by email, specifying date, number of participants, age and language. Guided tours are explicitly offered only in Italian or English. The current page does not publish a standard duration, fixed daily visitor timetable, parking details, or ordinary walk-in access.',
  opening_hours = 'Guided mill visits during the harvest period by advance availability request.',
  visit_booking_requirement = 'required',
  walk_in_status = 'not_accepted',
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = 'Guided mill visits operate during the olive-harvest period; exact dates and availability must be requested in advance.',
  visitor_languages = array['it','en'],
  visitability_reviewed_at = now()
where id = 'de-carlo-puglia';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'de-carlo-puglia','booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted","mechanism":"email_availability_request"}'::jsonb,
  'first_party_source',
  'https://www.oliodecarlo.com/en/experiences/',
  'De Carlo — Experiences',
  now(),
  'The current official page instructs visitors to request availability by email and provide visit date, party details and language.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='de-carlo-puglia'
    and field_key='booking_requirement'
    and source_url='https://www.oliodecarlo.com/en/experiences/'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'de-carlo-puglia','visitor_languages',
  '{"languages":["it","en"],"scope":"guided_mill_tours"}'::jsonb,
  'first_party_source',
  'https://www.oliodecarlo.com/en/experiences/',
  'De Carlo — Experiences',
  now(),
  'The current official page explicitly states guided tours are conducted exclusively in Italian or English.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='de-carlo-puglia'
    and field_key='visitor_languages'
    and source_url='https://www.oliodecarlo.com/en/experiences/'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'de-carlo-puglia','visitor_offering',
  '{"guided_oil_mill_visit":true,"showroom_welcome":true,"harvest_period_only":true}'::jsonb,
  'first_party_source',
  'https://www.oliodecarlo.com/en/experiences/',
  'De Carlo — Experiences',
  now(),
  'The current first-party page publishes guided oil-mill visits during the harvest period and welcomes visitors to the showroom.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='de-carlo-puglia'
    and field_key='visitor_offering'
    and source_url='https://www.oliodecarlo.com/en/experiences/'
);
