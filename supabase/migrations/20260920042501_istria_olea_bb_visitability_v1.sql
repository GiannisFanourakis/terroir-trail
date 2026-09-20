
update public.producers
set
  visit_status='public_visits',
  visit_source_url='https://www.oleabb.hr/en/home/',
  visit_notes='Current first-party Olea B.B. page explicitly invites visitors to taste the producer''s extra virgin olive oils at the Rabac oleoteca and publishes seasonal public opening hours. This supports ordinary public shop/tasting access; no separate mandatory advance-booking rule is published.',
  opening_hours='May-Oct: Mon-Fri 09:00-16:00, Sat 09:00-14:00, Sun/holidays closed. Nov-Apr: Mon-Fri 08:00-16:00, weekends/holidays closed.',
  visit_booking_requirement='not_required',
  walk_in_status='accepted',
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours='{"may_october":{"monday_friday":"09:00-16:00","saturday":"09:00-14:00","sunday_holidays":"closed"},"november_april":{"monday_friday":"08:00-16:00","saturday_sunday_holidays":"closed"}}'::jsonb,
  seasonal_visit_notes=null,
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='olea-bb-oleum-viride-bellic-istria';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'olea-bb-oleum-viride-bellic-istria','visitor_hours',
  '{"may_october":{"monday_friday":"09:00-16:00","saturday":"09:00-14:00","sunday_holidays":"closed"},"november_april":{"monday_friday":"08:00-16:00","saturday_sunday_holidays":"closed"}}'::jsonb,
  'first_party_source','https://www.oleabb.hr/en/home/','Olea B.B. — Oleum Viride Belić',now(),
  'The current official page publishes seasonal Rabac oleoteca opening hours.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='olea-bb-oleum-viride-bellic-istria' and field_key='visitor_hours'
    and source_url='https://www.oleabb.hr/en/home/'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'olea-bb-oleum-viride-bellic-istria','booking_requirement',
  '{"general_oleoteca_access":"not_required","walk_in_status":"accepted"}'::jsonb,
  'first_party_source','https://www.oleabb.hr/en/home/','Olea B.B. — Oleum Viride Belić',now(),
  'The producer invites visitors to the oleoteca during published public opening hours and does not state a mandatory reservation requirement.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='olea-bb-oleum-viride-bellic-istria' and field_key='booking_requirement'
    and source_url='https://www.oleabb.hr/en/home/'
);
