
update public.producers
set
  visit_status='public_visits',
  visit_source_url='https://www.kozlovic.hr/en/frequently-asked-questions/',
  visit_notes='Current first-party Kozlović FAQ welcomes winery visitors Tuesday-Sunday and says booking is recommended, not universally mandatory. It also warns that during high turnout or private events entry for unreserved public visitors may be limited. Guided tasting programmes currently operate in Croatian and English. The wine shop remains open during the winter period when tours and tastings close.',
  opening_hours='Tue-Fri 10:00-19:00; Sat 12:00-20:00; Sun 11:00-17:00; Mon closed. Winter tours/tastings close while the wine shop remains open.',
  visit_booking_requirement='recommended',
  walk_in_status='subject_to_availability',
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours='{"tuesday_friday":"10:00-19:00","saturday":"12:00-20:00","sunday":"11:00-17:00","monday":"closed"}'::jsonb,
  seasonal_visit_notes='Winery tours and tastings close during winter while the wine shop remains open; current winter shop hours should be rechecked before travel.',
  visitor_languages=array['hr','en'],
  visitability_reviewed_at=now()
where id='kozlovic-winery-istria';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'kozlovic-winery-istria','visitor_hours',
  '{"tuesday_friday":"10:00-19:00","saturday":"12:00-20:00","sunday":"11:00-17:00","monday":"closed"}'::jsonb,
  'first_party_source','https://www.kozlovic.hr/en/frequently-asked-questions/','Kozlović Winery — Frequently Asked Questions',now(),
  'The current official FAQ publishes these winery opening hours.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='kozlovic-winery-istria' and field_key='visitor_hours'
    and source_url='https://www.kozlovic.hr/en/frequently-asked-questions/'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'kozlovic-winery-istria','booking_requirement',
  '{"requirement":"recommended","walk_in_status":"subject_to_availability","unreserved_entry_may_be_limited":true}'::jsonb,
  'first_party_source','https://www.kozlovic.hr/en/frequently-asked-questions/','Kozlović Winery — Frequently Asked Questions',now(),
  'The official FAQ recommends booking and separately warns that unreserved entry can be limited during busy periods or private events.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='kozlovic-winery-istria' and field_key='booking_requirement'
    and source_url='https://www.kozlovic.hr/en/frequently-asked-questions/'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'kozlovic-winery-istria','visitor_languages',
  '{"languages":["hr","en"],"scope":"guided_tastings"}'::jsonb,
  'first_party_source','https://www.kozlovic.hr/en/wine-experience-kozlovic-with-wine-1904/','Kozlović Winery — 2026 Wine Experience',now(),
  'The current official experience page explicitly states tastings can be conducted in Croatian or English.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='kozlovic-winery-istria' and field_key='visitor_languages'
    and source_url='https://www.kozlovic.hr/en/wine-experience-kozlovic-with-wine-1904/'
);
