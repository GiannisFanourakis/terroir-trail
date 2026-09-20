
update public.producers
set
  visit_status='public_visits',
  visit_source_url='https://adegaborba.pt/en/wine-tourism/',
  visit_notes='Current first-party Adega de Borba wine-tourism page publishes a public wine shop Monday-Saturday 09:00-19:00. Guided winery visits with a three-wine tasting run Monday-Saturday at 11:00 and 15:00, last about 1 hour 45 minutes and are explicitly subject to prior booking. Public shop access and guided winery access therefore have different booking rules.',
  opening_hours='Wine shop: Mon-Sat 09:00-19:00. Guided winery visits: Mon-Sat 11:00 and 15:00 by prior booking.',
  visit_booking_requirement='not_required',
  walk_in_status='accepted',
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours='{"wine_shop":{"monday_saturday":"09:00-19:00"},"guided_winery_visit":{"monday_saturday":["11:00","15:00"],"booking":"required"}}'::jsonb,
  seasonal_visit_notes='Guided winery visit duration is approximately 105 minutes and requires prior booking.',
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='adega-de-borba-alentejo';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'adega-de-borba-alentejo','visitor_hours',
  '{"wine_shop":{"monday_saturday":"09:00-19:00"},"guided_winery_visit":{"monday_saturday":["11:00","15:00"]}}'::jsonb,
  'first_party_source','https://adegaborba.pt/en/wine-tourism/','Adega de Borba — Wine Tourism',now(),
  'The current official page publishes wine-shop hours and guided winery visit start times.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='adega-de-borba-alentejo' and field_key='visitor_hours'
    and source_url='https://adegaborba.pt/en/wine-tourism/'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'adega-de-borba-alentejo','booking_requirement',
  '{"general_shop_access":"not_required","walk_in_status":"accepted","guided_winery_visit":{"required":true}}'::jsonb,
  'first_party_source','https://adegaborba.pt/en/wine-tourism/','Adega de Borba — Wine Tourism',now(),
  'The official page separates public shop hours from winery visits that are explicitly subject to prior booking.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='adega-de-borba-alentejo' and field_key='booking_requirement'
    and source_url='https://adegaborba.pt/en/wine-tourism/'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'adega-de-borba-alentejo','programme_durations',
  '{"guided_winery_visit_minutes":105,"approximate":true}'::jsonb,
  'first_party_source','https://adegaborba.pt/en/wine-tourism/','Adega de Borba — Wine Tourism',now(),
  'The official page states an estimated total winery-visit duration of 1 hour 45 minutes.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='adega-de-borba-alentejo' and field_key='programme_durations'
    and source_url='https://adegaborba.pt/en/wine-tourism/'
);
