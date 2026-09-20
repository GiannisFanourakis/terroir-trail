
update public.producers
set
  visit_status='public_visits',
  visit_source_url='https://brist-olive.hr/our-shop-in-vodnjan/',
  visit_notes='Current first-party Brist page confirms a public Vodnjan shop with free guided olive-oil tastings. April-November opening is Monday-Friday 10:00-16:00 and Saturday 10:00-14:00; December-March is Monday-Saturday 10:00-14:00. Summer visitors are explicitly invited to drop in during regular hours. In the low season Brist advises calling ahead because the small family team may occasionally step away.',
  opening_hours='Apr-Nov: Mon-Fri 10:00-16:00, Sat 10:00-14:00. Dec-Mar: Mon-Sat 10:00-14:00; low-season call-ahead advised.',
  visit_booking_requirement='not_required',
  walk_in_status='subject_to_availability',
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours='{"april_november":{"monday_friday":"10:00-16:00","saturday":"10:00-14:00"},"december_march":{"monday_saturday":"10:00-14:00"}}'::jsonb,
  seasonal_visit_notes='Summer drop-ins are explicitly welcomed. During the low season the producer advises calling ahead because staff may occasionally be away from the shop.',
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='brist-olive-oil-istria';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'brist-olive-oil-istria','visitor_hours',
  '{"april_november":{"monday_friday":"10:00-16:00","saturday":"10:00-14:00"},"december_march":{"monday_saturday":"10:00-14:00"}}'::jsonb,
  'first_party_source','https://brist-olive.hr/our-shop-in-vodnjan/','Brist Olive Oil — Our Shop in Vodnjan',now(),
  'The current official shop page publishes these seasonal opening times.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='brist-olive-oil-istria' and field_key='visitor_hours'
    and source_url='https://brist-olive.hr/our-shop-in-vodnjan/'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'brist-olive-oil-istria','booking_requirement',
  '{"general_shop_access":"not_required","summer_walk_in":"accepted","low_season":"call_ahead_advised"}'::jsonb,
  'first_party_source','https://brist-olive.hr/our-shop-in-vodnjan/','Brist Olive Oil — Our Shop in Vodnjan',now(),
  'The official page explicitly welcomes summer drop-ins and only advises, rather than requires, a low-season call ahead.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='brist-olive-oil-istria' and field_key='booking_requirement'
    and source_url='https://brist-olive.hr/our-shop-in-vodnjan/'
);
