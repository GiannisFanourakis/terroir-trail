
update public.producers
set
  visit_status='public_visits',
  visit_source_url='https://rocim.pt/en/contact/',
  visit_notes='Current first-party Herdade do Rocim contact page publishes ordinary estate opening Tuesday-Saturday 11:00-18:00, with Monday and Sunday available by reservation. The current wine-tourism section also publishes multiple tasting and experience products. General Tuesday-Saturday access is therefore distinct from reservation-only Monday/Sunday access and bookable structured experiences.',
  opening_hours='Tue-Sat 11:00-18:00; Mon and Sun by reservation.',
  visit_booking_requirement='not_required',
  walk_in_status='accepted',
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours='{"tuesday_saturday":"11:00-18:00","monday_sunday":"by_reservation"}'::jsonb,
  seasonal_visit_notes=null,
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='herdade-do-rocim-alentejo';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'herdade-do-rocim-alentejo','visitor_hours',
  '{"tuesday_saturday":"11:00-18:00","monday_sunday":"by_reservation"}'::jsonb,
  'first_party_source','https://rocim.pt/en/contact/','Herdade do Rocim — Contacts',now(),
  'The current official contact page publishes these estate hours.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='herdade-do-rocim-alentejo' and field_key='visitor_hours'
    and source_url='https://rocim.pt/en/contact/'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'herdade-do-rocim-alentejo','booking_requirement',
  '{"general_tuesday_saturday":"not_required","walk_in_status":"accepted","monday_sunday":"by_reservation"}'::jsonb,
  'first_party_source','https://rocim.pt/en/contact/','Herdade do Rocim — Contacts',now(),
  'The current official page explicitly distinguishes regular Tuesday-Saturday hours from Monday/Sunday by reservation.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='herdade-do-rocim-alentejo' and field_key='booking_requirement'
    and source_url='https://rocim.pt/en/contact/'
);
