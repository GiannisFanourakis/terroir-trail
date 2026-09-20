
update public.producers
set
  visit_status='public_visits',
  visit_source_url='https://www.jmf.pt/index.php?id=96',
  visit_notes='Current first-party José Maria da Fonseca page publishes daily visits and a daily wine shop at Adega José de Sousa. April-October visits run at 11:00, 15:00 and 17:00; November-March at 11:00 and 15:00. The shop is open daily 10:00-19:00 April-October and 10:00-17:30 November-March. Prior reservation is explicitly recommended, not stated as mandatory.',
  opening_hours='Visits daily: Apr-Oct 11:00, 15:00, 17:00; Nov-Mar 11:00, 15:00. Shop daily: Apr-Oct 10:00-19:00; Nov-Mar 10:00-17:30.',
  visit_booking_requirement='recommended',
  walk_in_status=null,
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours='{"visits":{"april_october":["11:00","15:00","17:00"],"november_march":["11:00","15:00"]},"shop":{"april_october":"10:00-19:00","november_march":"10:00-17:30"}}'::jsonb,
  seasonal_visit_notes='Prior reservation is recommended.',
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='adega-jose-de-sousa-alentejo';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'adega-jose-de-sousa-alentejo','visitor_hours',
  '{"visits":{"april_october":["11:00","15:00","17:00"],"november_march":["11:00","15:00"]},"shop":{"april_october":"10:00-19:00","november_march":"10:00-17:30"}}'::jsonb,
  'first_party_source','https://www.jmf.pt/index.php?id=96','José Maria da Fonseca — Adega José de Sousa',now(),
  'The current official page publishes these seasonal daily visit and shop hours.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='adega-jose-de-sousa-alentejo' and field_key='visitor_hours'
    and source_url='https://www.jmf.pt/index.php?id=96'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'adega-jose-de-sousa-alentejo','booking_requirement',
  '{"requirement":"recommended"}'::jsonb,
  'first_party_source','https://www.jmf.pt/index.php?id=96','José Maria da Fonseca — Adega José de Sousa',now(),
  'The official page explicitly states prior reservation is recommended.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='adega-jose-de-sousa-alentejo' and field_key='booking_requirement'
    and source_url='https://www.jmf.pt/index.php?id=96'
);
