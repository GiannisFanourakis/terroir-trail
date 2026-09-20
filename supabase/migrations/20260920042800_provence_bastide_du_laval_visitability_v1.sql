
update public.producers
set
  visit_status='public_visits',
  visit_source_url='https://www.bastidedulaval.com/en/pages/visits-tastings',
  visit_notes='Current first-party Bastide du Laval material confirms year-round self-guided visits to the mill and olive grove and free olive-oil tastings without reservation during public opening hours. Private guided tours and workshops are separately bookable. The producer also states that parking can accommodate buses.',
  opening_hours='Mon-Sat 10:00-13:00 and 15:00-19:00 year-round. Mid-Jul to mid-Aug: Sun 10:00-13:00 and 15:00-18:00. Closed between Christmas and New Year.',
  visit_booking_requirement='not_required',
  walk_in_status='accepted',
  parking_status='available',
  typical_visit_minutes=null,
  visitor_hours='{"monday_saturday":["10:00-13:00","15:00-19:00"],"mid_july_mid_august_sunday":["10:00-13:00","15:00-18:00"],"christmas_new_year":"closed"}'::jsonb,
  seasonal_visit_notes='Additional Sunday opening applies from mid-July to mid-August. The estate closes between Christmas and New Year. Guided private tours/workshops require booking.',
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='bastide-du-laval-provence';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'bastide-du-laval-provence','booking_requirement',
  '{"self_guided_mill_and_grove":"not_required","free_tasting":"not_required","walk_in_status":"accepted","private_guided_tours":"required"}'::jsonb,
  'first_party_source','https://www.bastidedulaval.com/en/pages/visits-tastings','Bastide du Laval — Visits & Tastings',now(),
  'The official visitor page explicitly states self-guided visits and tastings are available without reservation, while private guided activities are bookable.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='bastide-du-laval-provence' and field_key='booking_requirement'
    and source_url='https://www.bastidedulaval.com/en/pages/visits-tastings'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'bastide-du-laval-provence','visitor_hours',
  '{"monday_saturday":["10:00-13:00","15:00-19:00"],"mid_july_mid_august_sunday":["10:00-13:00","15:00-18:00"],"christmas_new_year":"closed"}'::jsonb,
  'first_party_source','https://www.bastidedulaval.com/en/pages/visits-tastings','Bastide du Laval — Visits & Tastings',now(),
  'The current official page publishes these year-round and seasonal opening times.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='bastide-du-laval-provence' and field_key='visitor_hours'
    and source_url='https://www.bastidedulaval.com/en/pages/visits-tastings'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'bastide-du-laval-provence','parking_status',
  '{"status":"available","bus_suitable":true}'::jsonb,
  'first_party_source','https://www.bastidedulaval.com/en/pages/contact','Bastide du Laval — Contact',now(),
  'The producer states that the parking area can accommodate buses.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='bastide-du-laval-provence' and field_key='parking_status'
    and source_url='https://www.bastidedulaval.com/en/pages/contact'
);
