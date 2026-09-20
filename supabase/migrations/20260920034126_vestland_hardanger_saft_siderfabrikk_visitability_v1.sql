
update public.producers
set
  visit_status='public_visits',
  visit_source_url='https://hardangersider.no/kontakt-oss/',
  visit_notes='Current first-party Hardanger Saft- og Siderfabrikk contact page publishes year-round farm-shop sales hours Monday-Friday 09:00-17:00 and Saturday 10:00-17:00, Sunday closed. The site also publishes cider tasting, restaurant and group experiences, but those have separate seasonal/booking conditions. Public shop access is not treated as unrestricted production access.',
  opening_hours='Farm shop: Mon-Fri 09:00-17:00; Sat 10:00-17:00; Sun closed.',
  visit_booking_requirement='not_required',
  walk_in_status='accepted',
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours='{"farm_shop":{"monday_friday":"09:00-17:00","saturday":"10:00-17:00","sunday":"closed"}}'::jsonb,
  seasonal_visit_notes='Cider tasting, restaurant and group experiences have separate seasonal/booking conditions; check current experience pages.',
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='hardanger-saft-siderfabrikk-vestland';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'hardanger-saft-siderfabrikk-vestland','visitor_hours',
  '{"farm_shop":{"monday_friday":"09:00-17:00","saturday":"10:00-17:00","sunday":"closed"}}'::jsonb,
  'first_party_source','https://hardangersider.no/kontakt-oss/',
  'Hardanger Saft- og Siderfabrikk — Contact',now(),
  'The current official contact page publishes these farm-shop sales hours.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='hardanger-saft-siderfabrikk-vestland' and field_key='visitor_hours'
    and source_url='https://hardangersider.no/kontakt-oss/'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'hardanger-saft-siderfabrikk-vestland','booking_requirement',
  '{"general_shop_access":"not_required","walk_in_status":"accepted","production_access":"not_implied"}'::jsonb,
  'first_party_source','https://hardangersider.no/kontakt-oss/',
  'Hardanger Saft- og Siderfabrikk — Contact',now(),
  'Published farm-shop hours support ordinary public shop access; no unrestricted production access is inferred.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='hardanger-saft-siderfabrikk-vestland' and field_key='booking_requirement'
    and source_url='https://hardangersider.no/kontakt-oss/'
);
