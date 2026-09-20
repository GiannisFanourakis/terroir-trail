
update public.producers
set
  visit_status='public_visits',
  visit_source_url='https://www.biohof-oberwerkstatt.it/bio/',
  visit_notes='Current first-party Biohof Oberwerkstatt page confirms a year-round farm shop and a weekly farm/show-dairy experience from March through September. The guided farm activity includes the animals, the farm concept, cheese making in the show dairy and product tasting. Places are limited and advance registration is explicitly requested. Fixed farm-shop hours, parking, visitor languages and tour duration are not published.',
  opening_hours='Farm shop products available year-round; fixed shop hours not published. Farm/show-dairy tour runs once weekly Mar-Sep with advance registration.',
  visit_booking_requirement=null,
  walk_in_status=null,
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours='{"farm_shop":"year_round_hours_not_published","farm_show_dairy_tour":{"march_september":"once_weekly","advance_registration":true}}'::jsonb,
  seasonal_visit_notes='Farm/show-dairy tours operate from March through September with limited capacity and advance registration.',
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='biohof-oberwerkstatt-south-tyrol';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'biohof-oberwerkstatt-south-tyrol','visitor_offering',
  '{"farm_shop":true,"farm_tour":true,"show_dairy":true,"cheese_making":true,"product_tasting":true}'::jsonb,
  'first_party_source','https://www.biohof-oberwerkstatt.it/bio/',
  'Biohof Oberwerkstatt — Bio',now(),
  'The current official page explicitly describes the farm shop and weekly farm/show-dairy experience.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='biohof-oberwerkstatt-south-tyrol' and field_key='visitor_offering'
    and source_url='https://www.biohof-oberwerkstatt.it/bio/'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'biohof-oberwerkstatt-south-tyrol','booking_requirement',
  '{"scope":"farm_show_dairy_tour","required":true,"reason":"limited_capacity"}'::jsonb,
  'first_party_source','https://www.biohof-oberwerkstatt.it/bio/',
  'Biohof Oberwerkstatt — Bio',now(),
  'The current official page explicitly asks visitors to register in advance because places are limited.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='biohof-oberwerkstatt-south-tyrol' and field_key='booking_requirement'
    and source_url='https://www.biohof-oberwerkstatt.it/bio/'
);
