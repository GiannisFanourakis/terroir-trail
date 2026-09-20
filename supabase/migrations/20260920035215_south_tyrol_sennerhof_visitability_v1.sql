
update public.producers
set
  visit_status='public_visits',
  visit_source_url='https://www.sennerhof.eu/index.php?option=com_content&view=article&id=170:hofladen&Itemid=626&lang=de&catid=2',
  visit_notes='Current first-party Sennerhof farm-shop page publishes regular public hours Tuesday, Thursday, Friday and Saturday 09:00-11:00 and 16:00-19:00. The shop sells the farm’s own goat cheese, eggs, spreads, syrups and seasonal vegetables. This confirms public farm-shop access, not unrestricted access to dairy or agricultural work areas.',
  opening_hours='Farm shop: Tue, Thu, Fri, Sat 09:00-11:00 and 16:00-19:00.',
  visit_booking_requirement='not_required',
  walk_in_status='accepted',
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours='{"farm_shop":{"tuesday_thursday_friday_saturday":["09:00-11:00","16:00-19:00"]}}'::jsonb,
  seasonal_visit_notes=null,
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='sennerhof-south-tyrol';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'sennerhof-south-tyrol','visitor_hours',
  '{"farm_shop":{"tuesday_thursday_friday_saturday":["09:00-11:00","16:00-19:00"]}}'::jsonb,
  'first_party_source','https://www.sennerhof.eu/index.php?option=com_content&view=article&id=170:hofladen&Itemid=626&lang=de&catid=2',
  'Sennerhof — Hofladen',now(),
  'The current official farm-shop page publishes these opening hours.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='sennerhof-south-tyrol' and field_key='visitor_hours'
    and source_url='https://www.sennerhof.eu/index.php?option=com_content&view=article&id=170:hofladen&Itemid=626&lang=de&catid=2'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'sennerhof-south-tyrol','booking_requirement',
  '{"general_shop_access":"not_required","walk_in_status":"accepted","production_access":"not_implied"}'::jsonb,
  'first_party_source','https://www.sennerhof.eu/index.php?option=com_content&view=article&id=170:hofladen&Itemid=626&lang=de&catid=2',
  'Sennerhof — Hofladen',now(),
  'Published farm-shop opening hours support ordinary public shop access; production-area access is not inferred.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='sennerhof-south-tyrol' and field_key='booking_requirement'
    and source_url='https://www.sennerhof.eu/index.php?option=com_content&view=article&id=170:hofladen&Itemid=626&lang=de&catid=2'
);
