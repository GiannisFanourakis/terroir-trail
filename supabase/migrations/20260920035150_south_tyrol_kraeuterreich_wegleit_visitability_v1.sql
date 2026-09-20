
update public.producers
set
  visit_status='public_visits',
  visit_source_url='https://www.kraeuterreich.com/',
  visit_notes='Current first-party KräuterReich Wegleit page publishes a public farm shop Tuesday, Thursday and Saturday 16:00-18:00. Separate 2026 guided farm tours run May-October every Tuesday at 10:00, last about one hour and require registration by the previous day; individually arranged tours are also available by telephone.',
  opening_hours='Farm shop: Tue, Thu, Sat 16:00-18:00. Guided farm tour May-Oct Tue 10:00, registration by previous day.',
  visit_booking_requirement='not_required',
  walk_in_status='accepted',
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours='{"farm_shop":{"tuesday_thursday_saturday":"16:00-18:00"},"guided_farm_tour_2026":{"may_october":{"tuesday":"10:00"},"registration_deadline":"previous_day"}}'::jsonb,
  seasonal_visit_notes='Guided farm tour runs May-October and lasts about 60 minutes; individual tours can also be arranged by phone.',
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='kraeuterreich-wegleit-south-tyrol';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'kraeuterreich-wegleit-south-tyrol','visitor_hours',
  '{"farm_shop":{"tuesday_thursday_saturday":"16:00-18:00"},"guided_farm_tour_2026":{"may_october":{"tuesday":"10:00"},"registration_deadline":"previous_day"}}'::jsonb,
  'first_party_source','https://www.kraeuterreich.com/hoffuehrugen',
  'KräuterReich Wegleit — Hofführungen',now(),
  'The current official pages publish these farm-shop hours and 2026 tour schedule.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='kraeuterreich-wegleit-south-tyrol' and field_key='visitor_hours'
    and source_url='https://www.kraeuterreich.com/hoffuehrugen'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'kraeuterreich-wegleit-south-tyrol','programme_durations',
  '{"guided_farm_tour_minutes":60,"approximate":true}'::jsonb,
  'first_party_source','https://www.kraeuterreich.com/hoffuehrugen',
  'KräuterReich Wegleit — Hofführungen',now(),
  'The current official page states the guided farm tour lasts about one hour.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='kraeuterreich-wegleit-south-tyrol' and field_key='programme_durations'
    and source_url='https://www.kraeuterreich.com/hoffuehrugen'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'kraeuterreich-wegleit-south-tyrol','booking_requirement',
  '{"general_shop_access":"not_required","walk_in_status":"accepted","guided_farm_tour":{"required":true,"deadline":"previous_day"}}'::jsonb,
  'first_party_source','https://www.kraeuterreich.com/hoffuehrugen',
  'KräuterReich Wegleit — Hofführungen',now(),
  'Ordinary shop access is published separately; scheduled guided tours require registration by the previous day.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='kraeuterreich-wegleit-south-tyrol' and field_key='booking_requirement'
    and source_url='https://www.kraeuterreich.com/hoffuehrugen'
);
