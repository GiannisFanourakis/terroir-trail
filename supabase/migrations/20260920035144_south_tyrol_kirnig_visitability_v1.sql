
update public.producers
set
  visit_status='appointment_only',
  visit_source_url='https://www.kirnig.com/kaufen-fuehrungen/',
  visit_notes='Current first-party Kirnig page offers guided mushroom-farm visits daily only with advance registration and a minimum group size of 10 people. A tasting can be added. No fixed tour start times, standard duration, parking details or visitor languages are published.',
  opening_hours='Guided visits available daily by advance registration; minimum 10 people.',
  visit_booking_requirement='required',
  walk_in_status='not_accepted',
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours='{"guided_visits":{"days":"daily","advance_registration":true,"minimum_group_size":10}}'::jsonb,
  seasonal_visit_notes=null,
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='kirnig-mushrooms-south-tyrol';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'kirnig-mushrooms-south-tyrol','booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted","minimum_group_size":10,"days":"daily"}'::jsonb,
  'first_party_source','https://www.kirnig.com/kaufen-fuehrungen/',
  'Kirnig Südtiroler Edelpilze — Führungen',now(),
  'The current official page explicitly states guided visits are available daily with advance registration and a minimum of 10 people.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='kirnig-mushrooms-south-tyrol' and field_key='booking_requirement'
    and source_url='https://www.kirnig.com/kaufen-fuehrungen/'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'kirnig-mushrooms-south-tyrol','visitor_offering',
  '{"guided_mushroom_farm_visit":true,"optional_tasting":true}'::jsonb,
  'first_party_source','https://www.kirnig.com/kaufen-fuehrungen/',
  'Kirnig Südtiroler Edelpilze — Führungen',now(),
  'The current official page offers guided visits with an optional tasting.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='kirnig-mushrooms-south-tyrol' and field_key='visitor_offering'
    and source_url='https://www.kirnig.com/kaufen-fuehrungen/'
);
