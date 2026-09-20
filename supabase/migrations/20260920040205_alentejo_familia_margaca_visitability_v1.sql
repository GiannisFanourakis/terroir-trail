
update public.producers
set
  visit_status='not_publicly_confirmed',
  visit_source_url='https://www.margaca.com',
  visit_notes='Current producer-controlled material confirms Família Margaça as an active wine producer in Pias/Serpa, but no routine public winery visit, tasting programme, visitor timetable, booking rule or walk-in policy for the mapped production site was found during this review.',
  opening_hours=null,
  visit_booking_requirement=null,
  walk_in_status=null,
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours=null,
  seasonal_visit_notes=null,
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='familia-margaca-alentejo';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'familia-margaca-alentejo','visit_status',
  '{"status":"not_publicly_confirmed"}'::jsonb,
  'terroirtrail_review','https://www.margaca.com','TerroirTrail review of Família Margaça sources',now(),
  'Current producer material confirms the winery identity but does not establish a routine public visitor programme at the mapped point.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='familia-margaca-alentejo' and field_key='visit_status'
    and source_url='https://www.margaca.com'
);
