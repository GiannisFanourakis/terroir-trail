
update public.producers
set
  visit_status='appointment_only',
  visit_source_url='https://cebelarstvo-batistuta.si/en/services/',
  visit_notes='Current first-party Batištuta services page explicitly requires advance booking for the honey-tasting/apiary-tour experience and for bee-aerosol inhalation. The apiary tour includes beekeeping presentation, honey, dried persimmon and olive-oil tastings plus refreshments and lasts 60 minutes. Bee-aerosol therapy is seasonally suitable from March through September.',
  opening_hours='Visits by advance booking; no fixed public timetable published.',
  visit_booking_requirement='required',
  walk_in_status='not_accepted',
  parking_status=null,
  typical_visit_minutes=60,
  visitor_hours=null,
  seasonal_visit_notes='Bee-aerosol therapy is published as suitable from March through September.',
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='cebelarstvo-batistuta-goriska';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'cebelarstvo-batistuta-goriska','booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted"}'::jsonb,
  'first_party_source','https://cebelarstvo-batistuta.si/en/services/',
  'Čebelarstvo Batištuta — Services',now(),
  'The current official services page repeatedly says to book in advance.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='cebelarstvo-batistuta-goriska' and field_key='booking_requirement'
    and source_url='https://cebelarstvo-batistuta.si/en/services/'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'cebelarstvo-batistuta-goriska','typical_visit_minutes',
  '{"minutes":60,"scope":"honey_tasting_apiary_tour"}'::jsonb,
  'first_party_source','https://cebelarstvo-batistuta.si/en/services/',
  'Čebelarstvo Batištuta — Services',now(),
  'The current official page states the honey-tasting and apiary-tour experience lasts 60 minutes.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='cebelarstvo-batistuta-goriska' and field_key='typical_visit_minutes'
    and source_url='https://cebelarstvo-batistuta.si/en/services/'
);
