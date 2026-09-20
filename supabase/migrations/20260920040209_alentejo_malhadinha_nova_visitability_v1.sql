
update public.producers
set
  visit_status='appointment_only',
  visit_source_url='https://www.malhadinhanova.pt/en/experiences/visits-wine-tasting/',
  visit_notes='Current first-party Malhadinha Nova page publishes guided estate/winery visits with wine tasting Monday-Saturday during 10:30-12:00 and 14:30-16:30 windows. Sunday sessions at 12:00 and 14:30 are exclusively for hotel guests. Visits and tastings explicitly require prior booking and are subject to availability.',
  opening_hours='Wine tours/tastings: Mon-Sat 10:30-12:00 and 14:30-16:30; Sun 12:00 and 14:30 for hotel guests only. Prior booking required.',
  visit_booking_requirement='required',
  walk_in_status='not_accepted',
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours='{"monday_saturday":["10:30-12:00","14:30-16:30"],"sunday_guests_only":["12:00","14:30"]}'::jsonb,
  seasonal_visit_notes='All visits and tastings require prior booking and are subject to availability.',
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='herdade-da-malhadinha-nova-alentejo';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'herdade-da-malhadinha-nova-alentejo','booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted","subject_to_availability":true}'::jsonb,
  'first_party_source','https://www.malhadinhanova.pt/en/experiences/visits-wine-tasting/','Malhadinha Nova — Visits & Wine Tasting',now(),
  'The current official page explicitly requires prior booking and states visits are subject to availability.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='herdade-da-malhadinha-nova-alentejo' and field_key='booking_requirement'
    and source_url='https://www.malhadinhanova.pt/en/experiences/visits-wine-tasting/'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'herdade-da-malhadinha-nova-alentejo','visitor_hours',
  '{"monday_saturday":["10:30-12:00","14:30-16:30"],"sunday_guests_only":["12:00","14:30"]}'::jsonb,
  'first_party_source','https://www.malhadinhanova.pt/en/experiences/visits-wine-tasting/','Malhadinha Nova — Visits & Wine Tasting',now(),
  'The current official page publishes these visit windows.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='herdade-da-malhadinha-nova-alentejo' and field_key='visitor_hours'
    and source_url='https://www.malhadinhanova.pt/en/experiences/visits-wine-tasting/'
);
