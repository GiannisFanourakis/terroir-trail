
update public.producers
set
  visit_status='public_visits',
  visit_source_url='https://www.hanen.no/en/bedrift/rueslaatten-ysteri/',
  visit_notes='Current official HANEN farm-tourism listing confirms the Rueslåtten Ysteri / Hol Ysteri farm-shop point and explicitly invites visitors to stop by and buy cheese made on the farm. The producer website was not reliably reachable during this audit, and the current HANEN page does not publish fixed shop hours, guided-tour terms, duration, parking or visitor languages. Public shop access is confirmed; production-area access is not inferred.',
  opening_hours='Public farm-shop access confirmed; current fixed hours not reliably published in the authoritative source used.',
  visit_booking_requirement='not_required',
  walk_in_status='accepted',
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours=null,
  seasonal_visit_notes=null,
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='rueslatten-ysteri-buskerud';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'rueslatten-ysteri-buskerud','visit_status',
  '{"status":"public_visits","farm_shop":true,"walk_in_invitation":"stop_by"}'::jsonb,
  'public_listing','https://www.hanen.no/en/bedrift/rueslaatten-ysteri/',
  'HANEN — Rueslåtten Ysteri',now(),
  'The current official farm-tourism listing explicitly invites visitors to stop by Hol Ysteri to buy farm-made cheese.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='rueslatten-ysteri-buskerud' and field_key='visit_status'
    and source_url='https://www.hanen.no/en/bedrift/rueslaatten-ysteri/'
);
