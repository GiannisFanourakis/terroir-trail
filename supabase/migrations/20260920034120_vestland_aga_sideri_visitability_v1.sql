
update public.producers
set
  visit_status='public_visits',
  visit_source_url='https://www.agasideri.no/',
  visit_notes='Current first-party Aga Sideri site publishes a public farm shop Monday-Saturday 10:00-15:00. The producer also runs cider tastings with production tours Monday-Saturday in June, July and August and offers group tastings on request. Reduced tasting capacity applies September-March. Public farm-shop access is distinct from bookable tasting experiences.',
  opening_hours='Farm shop: Mon-Sat 10:00-15:00. Scheduled cider tastings: Mon-Sat in Jun-Aug; group tastings by request.',
  visit_booking_requirement='not_required',
  walk_in_status='accepted',
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours='{"farm_shop":{"monday_saturday":"10:00-15:00"},"scheduled_tastings":{"june_august":"monday_saturday"}}'::jsonb,
  seasonal_visit_notes='Group tastings are available on request. September-March has reduced capacity for tastings.',
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='aga-sideri-vestland';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'aga-sideri-vestland','visitor_hours',
  '{"farm_shop":{"monday_saturday":"10:00-15:00"},"scheduled_tastings":{"june_august":"monday_saturday"}}'::jsonb,
  'first_party_source','https://www.agasideri.no/',
  'Aga Sideri — official site',now(),
  'The current official site publishes farm-shop hours and the June-August scheduled tasting period.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='aga-sideri-vestland' and field_key='visitor_hours'
    and source_url='https://www.agasideri.no/'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'aga-sideri-vestland','booking_requirement',
  '{"general_shop_access":"not_required","walk_in_status":"accepted","group_tastings":"on_request"}'::jsonb,
  'first_party_source','https://www.agasideri.no/',
  'Aga Sideri — official site',now(),
  'Published farm-shop hours support ordinary public access; group tastings are separately offered on request.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='aga-sideri-vestland' and field_key='booking_requirement'
    and source_url='https://www.agasideri.no/'
);
