
update public.producers
set
  visit_status='appointment_only',
  visit_source_url='https://www.chateaudubarroux.fr/nos-visites/',
  visit_notes='Current first-party Château du Barroux material publishes guided distillery visits and tastings on bookable 2026 time slots and requires a confirmed reservation. Ordinary château visiting follows a separate access arrangement and must not be treated as proof of walk-in distillery access.',
  opening_hours='Distillery tours operate on bookable 2026 time slots with confirmed reservation; château opening hours are separate and do not define distillery access.',
  visit_booking_requirement='required',
  walk_in_status='not_accepted',
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours=null,
  seasonal_visit_notes='Distillery availability follows the current bookable tour calendar; ordinary château entry is a separate visitor product.',
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='distillerie-chateau-du-barroux-provence';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'distillerie-chateau-du-barroux-provence','booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted","scope":"guided_distillery_visit_and_tasting","confirmation_required":true}'::jsonb,
  'first_party_source','https://www.chateaudubarroux.fr/nos-visites/','Château du Barroux — Nos visites',now(),
  'The current official page requires visitors to reserve a distillery-tour time slot and receive confirmation.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='distillerie-chateau-du-barroux-provence' and field_key='booking_requirement'
    and source_url='https://www.chateaudubarroux.fr/nos-visites/'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'distillerie-chateau-du-barroux-provence','access_scope',
  '{"distillery_tour":"reservation_only","chateau_general_visit":"separate_access_arrangement"}'::jsonb,
  'first_party_source','https://www.chateaudubarroux.fr/infos-pratiques/','Château du Barroux — Infos pratiques',now(),
  'The official practical information distinguishes ordinary château access from the separately bookable distillery visit.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='distillerie-chateau-du-barroux-provence' and field_key='access_scope'
    and source_url='https://www.chateaudubarroux.fr/infos-pratiques/'
);
