-- Piedmont Visitability V1: Ceretto.
-- Current first-party visitor platform explicitly requires reservation for
-- visits and structured tastings and publishes seasonal opening patterns.

update public.producers
set
  visit_status = 'appointment_only',
  visit_source_url = 'https://visit.ceretto.com/',
  visit_notes = 'Current first-party Ceretto visitor platform explicitly states that visits and structured tastings are available by reservation. Standard opening is daily 10:00-18:00; during October and November the estate is open Monday-Saturday 10:00-18:00. The shop follows the same hours and may offer wine tasting depending on staff availability. No standard visit duration, parking details or visitor languages are published on the main visitor page.',
  opening_hours = 'Daily 10:00-18:00; Oct-Nov Mon-Sat 10:00-18:00. Visits/tastings by reservation.',
  visit_booking_requirement = 'required',
  walk_in_status = 'not_accepted',
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{"standard":{"monday_sunday":"10:00-18:00"},"october_november":{"monday_saturday":"10:00-18:00","sunday":"closed"}}'::jsonb,
  seasonal_visit_notes = 'October-November: open Monday-Saturday rather than daily. Shop tastings may be possible subject to staff availability.',
  visitor_languages = null,
  visitability_reviewed_at = now()
where id = 'ceretto-piedmont';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'ceretto-piedmont','booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted","scope":"visits_and_structured_tastings"}'::jsonb,
  'first_party_source',
  'https://visit.ceretto.com/',
  'Ceretto — Visitor Platform',
  now(),
  'The current official visitor platform explicitly states visits and tastings are available by reservation.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='ceretto-piedmont'
    and field_key='booking_requirement'
    and source_url='https://visit.ceretto.com/'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'ceretto-piedmont','visitor_hours',
  '{"standard":{"monday_sunday":"10:00-18:00"},"october_november":{"monday_saturday":"10:00-18:00","sunday":"closed"}}'::jsonb,
  'first_party_source',
  'https://visit.ceretto.com/',
  'Ceretto — Visitor Platform',
  now(),
  'The current official visitor platform publishes daily 10:00-18:00, with October-November limited to Monday-Saturday.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='ceretto-piedmont'
    and field_key='visitor_hours'
    and source_url='https://visit.ceretto.com/'
);
