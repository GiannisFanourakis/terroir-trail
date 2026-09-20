
update public.producers
set
  visit_status='not_publicly_confirmed',
  visit_source_url='https://met.apisaurum.com/',
  visit_notes='Current first-party Apis Aurum / Imkerei Hafner pages confirm the beekeeping and mead/mead-vinegar production business and provide commercial enquiry contact, but do not publish a routine public apiary visit, production tour, tasting programme, visitor timetable, booking rule or walk-in policy for the mapped production site.',
  opening_hours=null,
  visit_booking_requirement=null,
  walk_in_status=null,
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours=null,
  seasonal_visit_notes=null,
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='apis-aurum-south-tyrol';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'apis-aurum-south-tyrol','visit_status',
  '{"status":"not_publicly_confirmed","public_visit_programme_found":false}'::jsonb,
  'terroirtrail_review','https://met.apisaurum.com/',
  'TerroirTrail review of Apis Aurum first-party pages',now(),
  'Current first-party pages describe production and enquiries but do not publish a public visitor programme.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='apis-aurum-south-tyrol' and field_key='visit_status'
    and source_url='https://met.apisaurum.com/'
);
