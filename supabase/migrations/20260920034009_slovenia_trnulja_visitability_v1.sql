
update public.producers
set
  visit_status='current_access_uncertain',
  visit_source_url='https://trnulja.com/en/',
  visit_notes='Current first-party Trnulja site confirms an active organic tourist estate with accommodation, gastronomy, wellness, events and an estate shop/product offer. Visitor experiences are handled through enquiries/reservations, but the site does not publish a general estate visitor timetable, ordinary walk-in farm access, or a clear universal booking rule for non-overnight visitors. Agricultural work areas are not assumed to be publicly accessible.',
  opening_hours='Estate experiences are enquiry/reservation-led; no general visitor timetable published.',
  visit_booking_requirement=null,
  walk_in_status=null,
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours=null,
  seasonal_visit_notes=null,
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='trnulja-estate-central-slovenia';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'trnulja-estate-central-slovenia','visit_status',
  '{"status":"current_access_uncertain","tourist_estate":true,"experience_inquiry_flow":true}'::jsonb,
  'first_party_source','https://trnulja.com/en/',
  'Trnulja Estate — official site',now(),
  'The current official site confirms tourist-estate activity and enquiry-led experiences but does not define ordinary walk-in farm access.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='trnulja-estate-central-slovenia' and field_key='visit_status'
    and source_url='https://trnulja.com/en/'
);
