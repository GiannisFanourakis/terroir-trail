
update public.producers
set
  visit_status='public_visits',
  visit_source_url='https://eplisideri.no/en/about-us/',
  visit_notes='Current first-party Epli Sideri page explicitly welcomes visitors to the farm shop in the new cider house at Sekse and states that parking is available directly outside the door. Group cider tastings are by appointment. The current page does not publish fixed farm-shop hours or define a general walk-in policy beyond welcoming visitors.',
  opening_hours='Farm shop open to visitors; current fixed hours are not published. Group cider tastings by appointment.',
  visit_booking_requirement=null,
  walk_in_status=null,
  parking_status='available',
  typical_visit_minutes=null,
  visitor_hours=null,
  seasonal_visit_notes='Group cider tastings require appointment.',
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='epli-sideri-vestland';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'epli-sideri-vestland','visitor_offering',
  '{"farm_shop":true,"group_cider_tasting":true}'::jsonb,
  'first_party_source','https://eplisideri.no/en/about-us/',
  'Epli Sideri — About us',now(),
  'The current official page welcomes visitors to the farm shop and offers group cider tastings by appointment.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='epli-sideri-vestland' and field_key='visitor_offering'
    and source_url='https://eplisideri.no/en/about-us/'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'epli-sideri-vestland','parking_status',
  '{"status":"available","location":"outside_the_door"}'::jsonb,
  'first_party_source','https://eplisideri.no/en/about-us/',
  'Epli Sideri — About us',now(),
  'The current official page explicitly states easy access with parking right outside the door.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='epli-sideri-vestland' and field_key='parking_status'
    and source_url='https://eplisideri.no/en/about-us/'
);
