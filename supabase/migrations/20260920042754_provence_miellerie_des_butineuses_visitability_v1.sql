
update public.producers
set
  visit_status='public_visits',
  visit_source_url='https://miellerie.fr/',
  visit_notes='Current first-party La Miellerie des Butineuses material publishes regular opening hours for the producer honey shop. This confirms public access to the shop at the verified point, not unrestricted access to apiary locations or production areas.',
  opening_hours='Tue-Fri 10:00-12:00 and 16:00-18:00; Sat 10:00-12:00. Closed Sun, Mon and public holidays.',
  visit_booking_requirement='not_required',
  walk_in_status='accepted',
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours='{"tuesday_friday":["10:00-12:00","16:00-18:00"],"saturday":"10:00-12:00","sunday_monday_public_holidays":"closed"}'::jsonb,
  seasonal_visit_notes=null,
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='miellerie-des-butineuses-provence';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'miellerie-des-butineuses-provence','visitor_hours',
  '{"tuesday_friday":["10:00-12:00","16:00-18:00"],"saturday":"10:00-12:00","sunday_monday_public_holidays":"closed"}'::jsonb,
  'first_party_source','https://miellerie.fr/','La Miellerie des Butineuses — official site',now(),
  'The current official site publishes these producer-shop opening hours.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='miellerie-des-butineuses-provence' and field_key='visitor_hours'
    and source_url='https://miellerie.fr/'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'miellerie-des-butineuses-provence','booking_requirement',
  '{"general_shop_access":"not_required","walk_in_status":"accepted","apiary_access":"not_implied"}'::jsonb,
  'first_party_source','https://miellerie.fr/','La Miellerie des Butineuses — official site',now(),
  'Published shop hours support ordinary public shop access; apiary or production-area access is not inferred.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='miellerie-des-butineuses-provence' and field_key='booking_requirement'
    and source_url='https://miellerie.fr/'
);
