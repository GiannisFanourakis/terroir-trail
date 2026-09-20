
update public.producers
set
  visit_status='appointment_only',
  visit_source_url='https://www.peraladamasmarce.com/es/visitas-granja/',
  visit_notes='Current first-party Mas Marcè farm-visit page publishes structured sheep-farm visits with dairy tasting and workshops. Family visits require reservation at least 48 hours in advance. Autumn, winter and spring family visits start Saturdays and Sundays at 10:30; summer and holiday family visits start at 10:00. Organised groups and school visits can be arranged throughout the year.',
  opening_hours='Family visits: autumn/winter/spring Sat-Sun 10:30; summer/holidays Sat-Sun 10:00. Reserve at least 48h ahead. Groups by arrangement year-round.',
  visit_booking_requirement='required',
  walk_in_status='not_accepted',
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours='{"family_autumn_winter_spring":{"saturday_sunday":"10:30"},"family_summer_holidays":{"saturday_sunday":"10:00"},"organised_groups":"year_round_by_arrangement"}'::jsonb,
  seasonal_visit_notes='An annual shearing-themed visit normally replaces the standard programme once in May; exact date is announced separately.',
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='peralada-mas-marce-catalonia';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'peralada-mas-marce-catalonia','booking_requirement',
  '{"required":true,"minimum_notice_hours":48,"walk_in_status":"not_accepted"}'::jsonb,
  'first_party_source','https://www.peraladamasmarce.com/es/visitas-granja/',
  'Peralada Mas Marcè — Visitas granja',now(),
  'The current official page explicitly requires booking 48 hours in advance for family visits.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='peralada-mas-marce-catalonia' and field_key='booking_requirement'
    and source_url='https://www.peraladamasmarce.com/es/visitas-granja/'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'peralada-mas-marce-catalonia','visitor_hours',
  '{"family_autumn_winter_spring":{"saturday_sunday":"10:30"},"family_summer_holidays":{"saturday_sunday":"10:00"},"organised_groups":"year_round_by_arrangement"}'::jsonb,
  'first_party_source','https://www.peraladamasmarce.com/es/visitas-granja/',
  'Peralada Mas Marcè — Visitas granja',now(),
  'The current official page publishes these family-visit start times and year-round group arrangements.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='peralada-mas-marce-catalonia' and field_key='visitor_hours'
    and source_url='https://www.peraladamasmarce.com/es/visitas-granja/'
);
