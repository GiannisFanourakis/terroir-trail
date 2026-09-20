
update public.producers
set
  visit_status='appointment_only',
  visit_source_url='https://ipsa-maslinovaulja.com/en/posjetite-nas/',
  visit_notes='Current first-party Ipša page offers several guided olive-oil and wine experiences and explicitly states that guided tastings are possible only with prior reservation. Programme lengths vary substantially, from 60 minutes for the Selection tasting to several hours for the most elaborate experiences. Official Istrian tourism material confirms free parking at the estate.',
  opening_hours='Guided tastings only by prior reservation; no fixed public visitor timetable published.',
  visit_booking_requirement='required',
  walk_in_status='not_accepted',
  parking_status='available',
  typical_visit_minutes=null,
  visitor_hours=null,
  seasonal_visit_notes=null,
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='ipsa-istria';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'ipsa-istria','booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted","scope":"guided_tastings"}'::jsonb,
  'first_party_source','https://ipsa-maslinovaulja.com/en/posjetite-nas/','Ipša — Visit Us',now(),
  'The official page repeatedly states that guided tastings are possible only with prior reservation.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='ipsa-istria' and field_key='booking_requirement'
    and source_url='https://ipsa-maslinovaulja.com/en/posjetite-nas/'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'ipsa-istria','programme_durations',
  '{"selection_minutes":60,"expert_minutes_range":[60,90],"winemakers_reserve_minutes_range":[120,160],"truffle_wine_minutes_range":[180,240]}'::jsonb,
  'first_party_source','https://ipsa-maslinovaulja.com/en/posjetite-nas/','Ipša — Visit Us',now(),
  'The official page publishes different durations for each current guided experience.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='ipsa-istria' and field_key='programme_durations'
    and source_url='https://ipsa-maslinovaulja.com/en/posjetite-nas/'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'ipsa-istria','parking_status',
  '{"status":"available","wording":"free_parking"}'::jsonb,
  'public_listing','https://www.istra.hr/en/gourmet/evoo/producers/ipsa','Istria Tourist Board — Ipša',now(),
  'The official regional tourism listing explicitly states free parking.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='ipsa-istria' and field_key='parking_status'
    and source_url='https://www.istra.hr/en/gourmet/evoo/producers/ipsa'
);
