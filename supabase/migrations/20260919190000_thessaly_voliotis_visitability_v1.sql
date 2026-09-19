-- Thessaly Visitability V1: Voliotis Family Olive Mill.
-- Current first-party Open to Public page requires an appointment, publishes
-- Mon-Sat 08:00-22:00 tour availability, and documents visitor facilities.

update public.producers
set
  visit_status = 'appointment_only',
  visit_source_url = 'https://www.elaioladopiliou.gr/en/olive-mill-open-to-public/',
  visit_notes = 'Current first-party Open to Public page invites visitors to arrange an appointment for guided mill visits. The published tour schedule is Monday-Saturday 08:00-22:00. The visitor facilities include a reception/waiting area, guided mill tour, olive-oil tasting, product sales, accessible routes and WC facilities for disabled visitors. The page states a maximum indoor group size of 20 people. No standard visit duration or visitor languages are explicitly published.',
  opening_hours = 'Tours by appointment, Mon-Sat 08:00-22:00.',
  visit_booking_requirement = 'required',
  walk_in_status = 'not_accepted',
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{"monday_saturday":"08:00-22:00","booking":"appointment"}'::jsonb,
  seasonal_visit_notes = 'Maximum indoor group size published as 20 people.',
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 20:29:00+03'
where id = 'voliotis-family-olive-mill-thessaly';

insert into public.producer_fact_evidence (producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'voliotis-family-olive-mill-thessaly','booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted"}'::jsonb,
  'first_party_source',
  'https://www.elaioladopiliou.gr/en/olive-mill-open-to-public/',
  'Voliotis Family — Olive Mill Open To Public',
  timestamptz '2026-09-19 20:29:00+03',
  'The current official page explicitly asks visitors to arrange an appointment.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='voliotis-family-olive-mill-thessaly' and field_key='booking_requirement'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);

insert into public.producer_fact_evidence (producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'voliotis-family-olive-mill-thessaly','visitor_hours',
  '{"monday_saturday":"08:00-22:00"}'::jsonb,
  'first_party_source',
  'https://www.elaioladopiliou.gr/en/olive-mill-open-to-public/',
  'Voliotis Family — Tour Schedule',
  timestamptz '2026-09-19 20:29:00+03',
  'The current official page publishes a Monday-Saturday tour schedule of 08:00-22:00.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='voliotis-family-olive-mill-thessaly' and field_key='visitor_hours'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);

insert into public.producer_fact_evidence (producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'voliotis-family-olive-mill-thessaly','visitor_offering',
  '{"guided_mill_tour":true,"olive_oil_tasting":true,"product_sales":true,"max_indoor_people":20}'::jsonb,
  'first_party_source',
  'https://www.elaioladopiliou.gr/en/olive-mill-open-to-public/',
  'Voliotis Family — Olive Mill Open To Public',
  timestamptz '2026-09-19 20:29:00+03',
  'The current official page explicitly lists guided tours, olive-oil tasting, product sales and a maximum indoor capacity of 20.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='voliotis-family-olive-mill-thessaly' and field_key='visitor_offering'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);

insert into public.producer_fact_evidence (producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'voliotis-family-olive-mill-thessaly','wheelchair_accessible',
  '{"accessible":true,"scope":"mill_visit_and_sanitary_facilities"}'::jsonb,
  'first_party_source',
  'https://www.elaioladopiliou.gr/en/olive-mill-open-to-public/',
  'Voliotis Family — Olive Mill Open To Public',
  timestamptz '2026-09-19 20:29:00+03',
  'The current official page states the mill can be visited by people with disabilities and has unobstructed access plus disabled WC facilities.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='voliotis-family-olive-mill-thessaly' and field_key='wheelchair_accessible'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);
