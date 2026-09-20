
update public.producers
set
  visit_status='public_visits',
  visit_source_url='https://www.nougat-boyer.fr/fr/',
  visit_notes='Current first-party André Boyer material identifies the historic Sault location as a public-facing boutique selling traditional confectionery and house-made products, with pastries, ice cream and a tea-room offering. The reviewed official material does not provide sufficiently clear current opening hours or a booking rule, so those fields remain unknown rather than inferred.',
  opening_hours=null,
  visit_booking_requirement=null,
  walk_in_status=null,
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours=null,
  seasonal_visit_notes=null,
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='nougat-andre-boyer-provence';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'nougat-andre-boyer-provence','visitor_offering',
  '{"public_boutique":true,"traditional_confectionery":true,"pastries":true,"ice_cream":true,"tea_room":true}'::jsonb,
  'first_party_source','https://www.nougat-boyer.fr/fr/','Nougaterie André Boyer — official site',now(),
  'The current first-party site presents the Sault boutique and its public-facing food offering.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='nougat-andre-boyer-provence' and field_key='visitor_offering'
    and source_url='https://www.nougat-boyer.fr/fr/'
);
