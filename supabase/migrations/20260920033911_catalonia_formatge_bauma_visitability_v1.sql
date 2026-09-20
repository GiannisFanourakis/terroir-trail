
update public.producers
set
  visit_status='not_publicly_confirmed',
  visit_source_url='http://www.formatgebauma.com/',
  visit_notes='Current producer identity and the Sant Miquel de Balenyà dairy are verifiable, but the producer site was unreachable during this review and current indexed first-party/authoritative traces do not publish a public dairy visit, tasting programme, visitor timetable, booking rule or walk-in policy. Keep public access unconfirmed.',
  opening_hours=null,
  visit_booking_requirement=null,
  walk_in_status=null,
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours=null,
  seasonal_visit_notes=null,
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='formatge-bauma-catalonia';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'formatge-bauma-catalonia','visit_status',
  '{"status":"not_publicly_confirmed","source_site_unreachable":true}'::jsonb,
  'terroirtrail_review','http://www.formatgebauma.com/',
  'TerroirTrail review of Formatge Bauma sources',now(),
  'The producer site was unreachable and current indexed sources do not establish a public visitor programme.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='formatge-bauma-catalonia' and field_key='visit_status'
    and source_url='http://www.formatgebauma.com/'
);
