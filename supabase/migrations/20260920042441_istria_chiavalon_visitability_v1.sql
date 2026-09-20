
update public.producers
set
  visit_status='public_visits',
  visit_source_url='https://chiavalon.hr/en/tasting-experience/',
  visit_notes='Current first-party Chiavalon pages publish visitor opening hours and guided olive-oil tasting programmes. The FAQ states that advance booking for guided tastings is recommended to secure a time slot and guide, not universally mandatory. Same-day online booking is unavailable, so unreserved guided-tasting access remains subject to availability.',
  opening_hours='Current published visitor hours: Mon-Fri 08:00-20:00; Sat 09:00-14:00; Sun and holidays closed.',
  visit_booking_requirement='recommended',
  walk_in_status='subject_to_availability',
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours='{"monday_friday":"08:00-20:00","saturday":"09:00-14:00","sunday_holidays":"closed"}'::jsonb,
  seasonal_visit_notes='The official page labels these as the current-period hours; visitors should recheck before travel. Advance booking is recommended for guided tastings.',
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='chiavalon-istria';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'chiavalon-istria','visitor_hours',
  '{"monday_friday":"08:00-20:00","saturday":"09:00-14:00","sunday_holidays":"closed"}'::jsonb,
  'first_party_source','https://chiavalon.hr/en/tasting-experience/','Chiavalon — Tasting Experience',now(),
  'The current official tasting page publishes these visitor hours.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='chiavalon-istria' and field_key='visitor_hours'
    and source_url='https://chiavalon.hr/en/tasting-experience/'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'chiavalon-istria','booking_requirement',
  '{"requirement":"recommended","guided_tasting_walk_in":"subject_to_availability","same_day_online_booking":false}'::jsonb,
  'first_party_source','https://chiavalon.hr/en/frequently-asked-questions/','Chiavalon — Frequently Asked Questions',now(),
  'The official FAQ says guided-tasting booking is recommended in order to secure availability; it does not state universal mandatory advance booking.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='chiavalon-istria' and field_key='booking_requirement'
    and source_url='https://chiavalon.hr/en/frequently-asked-questions/'
);
