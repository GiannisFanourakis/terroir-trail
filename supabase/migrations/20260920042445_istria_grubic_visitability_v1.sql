
update public.producers
set
  visit_status='seasonal_public',
  visit_source_url='https://www.grubic.hr/visit_us',
  visit_notes='Current first-party Grubić page publishes public showroom/museum working hours from May through September and states that the rest of the year is by appointment. More specialist tastings and educational visits can also be arranged and booked in advance.',
  opening_hours='May: Mon-Sat 09:00-16:00. Jun-Sep: Mon-Sat 09:00-19:00. Sun closed. Rest of year by appointment.',
  visit_booking_requirement='not_required',
  walk_in_status='accepted',
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours='{"may":{"monday_saturday":"09:00-16:00","sunday":"closed"},"june_september":{"monday_saturday":"09:00-19:00","sunday":"closed"},"rest_of_year":"by_appointment"}'::jsonb,
  seasonal_visit_notes='Regular public showroom/museum access is published May-September; outside that period access is by appointment.',
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='grubic-olive-oil-istria';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'grubic-olive-oil-istria','visitor_hours',
  '{"may":{"monday_saturday":"09:00-16:00","sunday":"closed"},"june_september":{"monday_saturday":"09:00-19:00","sunday":"closed"},"rest_of_year":"by_appointment"}'::jsonb,
  'first_party_source','https://www.grubic.hr/visit_us','Grubić — Visit Us',now(),
  'The official page publishes seasonal showroom/museum hours and states that the remainder of the year is by appointment.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='grubic-olive-oil-istria' and field_key='visitor_hours'
    and source_url='https://www.grubic.hr/visit_us'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'grubic-olive-oil-istria','booking_requirement',
  '{"may_september":"not_required","walk_in_status":"accepted","rest_of_year":"appointment"}'::jsonb,
  'first_party_source','https://www.grubic.hr/visit_us','Grubić — Visit Us',now(),
  'Published opening hours establish regular seasonal access, while the page explicitly makes the rest of the year appointment-based.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='grubic-olive-oil-istria' and field_key='booking_requirement'
    and source_url='https://www.grubic.hr/visit_us'
);
