
update public.producers
set
  visit_status='public_visits',
  visit_source_url='https://lenkhof.com/',
  visit_notes='Current first-party Lenkhof page welcomes visitors to the farm shop Monday-Saturday 10:00-18:00. Guided farm/dairy tours are offered separately and registration is requested through the Hafling tourism association. The site explicitly lists German and Italian for the guided tour and states that sufficient visitor parking is available.',
  opening_hours='Farm shop: Mon-Sat 10:00-18:00. Guided farm/dairy tours require registration through the Hafling tourism association.',
  visit_booking_requirement='not_required',
  walk_in_status='accepted',
  parking_status='available',
  typical_visit_minutes=null,
  visitor_hours='{"farm_shop":{"monday_saturday":"10:00-18:00"},"guided_farm_dairy_tour":"registration_via_hafling_tourism_association"}'::jsonb,
  seasonal_visit_notes=null,
  visitor_languages=array['de','it'],
  visitability_reviewed_at=now()
where id='lenkhof-south-tyrol';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'lenkhof-south-tyrol','visitor_hours',
  '{"farm_shop":{"monday_saturday":"10:00-18:00"}}'::jsonb,
  'first_party_source','https://lenkhof.com/',
  'Lenkhof — official site',now(),
  'The current official page publishes Monday-Saturday 10:00-18:00 farm-shop hours.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='lenkhof-south-tyrol' and field_key='visitor_hours'
    and source_url='https://lenkhof.com/'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'lenkhof-south-tyrol','parking_status',
  '{"status":"available","capacity_wording":"sufficient_visitor_parking"}'::jsonb,
  'first_party_source','https://lenkhof.com/',
  'Lenkhof — official site',now(),
  'The current official page explicitly states sufficient parking is available for visitors.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='lenkhof-south-tyrol' and field_key='parking_status'
    and source_url='https://lenkhof.com/'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'lenkhof-south-tyrol','visitor_languages',
  '{"languages":["de","it"],"scope":"guided_farm_dairy_tour"}'::jsonb,
  'first_party_source','https://lenkhof.com/',
  'Lenkhof — official site',now(),
  'The current official page explicitly lists German and Italian for the guided tour.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='lenkhof-south-tyrol' and field_key='visitor_languages'
    and source_url='https://lenkhof.com/'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'lenkhof-south-tyrol','booking_requirement',
  '{"general_shop_access":"not_required","walk_in_status":"accepted","guided_farm_dairy_tour":"registration_via_tourism_association"}'::jsonb,
  'first_party_source','https://lenkhof.com/',
  'Lenkhof — official site',now(),
  'The farm shop has published opening hours; guided tours are separately registration-led.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='lenkhof-south-tyrol' and field_key='booking_requirement'
    and source_url='https://lenkhof.com/'
);
