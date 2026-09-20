
update public.producers
set
  visit_status='public_visits',
  visit_source_url='https://ysteri.no/english-information/',
  visit_notes='Current first-party Gangstad Gårdsysteri page explicitly welcomes visitors to drop by the year-round farm store. Published hours are Monday-Friday 09:00-15:00, with Saturday, Sunday and public holidays closed. In summer the farm serves its own ice cream and coffee in the yard. Larger/group visits can be arranged separately; ordinary farm-store access does not require booking.',
  opening_hours='Farm shop: Mon-Fri 09:00-15:00; Sat-Sun and public holidays closed.',
  visit_booking_requirement='not_required',
  walk_in_status='accepted',
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours='{"farm_shop":{"monday_friday":"09:00-15:00","saturday_sunday_public_holidays":"closed"}}'::jsonb,
  seasonal_visit_notes='Summer farm-yard service includes farm ice cream and coffee. Larger/group visits should be arranged separately.',
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='gangstad-gardsysteri-trondelag';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'gangstad-gardsysteri-trondelag','visitor_hours',
  '{"farm_shop":{"monday_friday":"09:00-15:00","saturday_sunday_public_holidays":"closed"}}'::jsonb,
  'first_party_source','https://ysteri.no/english-information/',
  'Gangstad Gårdsysteri — English information',now(),
  'The current official page publishes these farm-store hours.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='gangstad-gardsysteri-trondelag' and field_key='visitor_hours'
    and source_url='https://ysteri.no/english-information/'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'gangstad-gardsysteri-trondelag','booking_requirement',
  '{"general_shop_access":"not_required","walk_in_status":"accepted","wording":"welcome_to_drop_by"}'::jsonb,
  'first_party_source','https://ysteri.no/english-information/',
  'Gangstad Gårdsysteri — English information',now(),
  'The current official page explicitly says visitors are welcome to drop by the farm store.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='gangstad-gardsysteri-trondelag' and field_key='booking_requirement'
    and source_url='https://ysteri.no/english-information/'
);
