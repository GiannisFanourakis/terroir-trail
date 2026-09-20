
update public.producers
set
  visit_status='appointment_only',
  visit_source_url='https://www.visitdolenjska.eu/en/offer/api-beehive-and-honey-garden/',
  visit_notes='Current official VisitDolenjska listing publishes structured Honey Garden experiences at Irča vas and repeatedly states that visits are by appointment. The main family beehive-and-garden programme lasts 2 hours; apitherapy with honey tasting lasts 30 minutes. Honey picnic, massage and forest-selfness experiences also require advance arrangement. The producer-controlled site was not reliably accessible during this audit.',
  opening_hours='Visits by advance appointment; no fixed public timetable published.',
  visit_booking_requirement='required',
  walk_in_status='not_accepted',
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours=null,
  seasonal_visit_notes='Published programmes vary by format; the main family programme is 2 hours and apitherapy with honey tasting is 30 minutes.',
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='stankovic-honey-garden-southeast-slovenia';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'stankovic-honey-garden-southeast-slovenia','booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted"}'::jsonb,
  'public_listing','https://www.visitdolenjska.eu/en/offer/api-beehive-and-honey-garden/',
  'VisitDolenjska — API Beehive and Honey Garden',now(),
  'The current official regional tourism listing repeatedly states that the experiences are available by appointment.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='stankovic-honey-garden-southeast-slovenia' and field_key='booking_requirement'
    and source_url='https://www.visitdolenjska.eu/en/offer/api-beehive-and-honey-garden/'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'stankovic-honey-garden-southeast-slovenia','programme_durations',
  '{"beehive_garden_family_programme_minutes":120,"apitherapy_honey_tasting_minutes":30}'::jsonb,
  'public_listing','https://www.visitdolenjska.eu/en/offer/api-beehive-and-honey-garden/',
  'VisitDolenjska — API Beehive and Honey Garden',now(),
  'The current official listing publishes these programme durations.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='stankovic-honey-garden-southeast-slovenia' and field_key='programme_durations'
    and source_url='https://www.visitdolenjska.eu/en/offer/api-beehive-and-honey-garden/'
);
