
update public.producers
set
  visit_status='public_visits',
  visit_source_url='https://www.moulinjeannons.com/contactez-nous.html',
  visit_notes='Current first-party Moulin du Clos des Jeannons material publishes regular Monday-Saturday opening, free olive-oil tastings without reservation and free self-guided mill visits from March to early October. Only groups larger than 20 people are explicitly asked to reserve.',
  opening_hours='Mon-Sat 09:30-19:00. Free self-guided mill visit Mar to early Oct; free olive-oil tasting available during opening hours.',
  visit_booking_requirement='not_required',
  walk_in_status='accepted',
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours='{"monday_saturday":"09:30-19:00","self_guided_mill_visit":"march_to_early_october"}'::jsonb,
  seasonal_visit_notes='Self-guided mill visits run from March to early October. Groups over 20 people must reserve in advance.',
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='moulin-clos-des-jeannons-provence';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'moulin-clos-des-jeannons-provence','visitor_hours',
  '{"monday_saturday":"09:30-19:00","self_guided_mill_visit":"march_to_early_october"}'::jsonb,
  'first_party_source','https://www.moulinjeannons.com/contactez-nous.html','Moulin du Clos des Jeannons — Contact',now(),
  'The current official page publishes Monday-Saturday hours and the seasonal self-guided mill period.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='moulin-clos-des-jeannons-provence' and field_key='visitor_hours'
    and source_url='https://www.moulinjeannons.com/contactez-nous.html'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'moulin-clos-des-jeannons-provence','booking_requirement',
  '{"general_tasting":"not_required","self_guided_mill_visit":"not_required","walk_in_status":"accepted","groups_over_20":"required"}'::jsonb,
  'first_party_source','https://www.moulinjeannons.com/contactez-nous.html','Moulin du Clos des Jeannons — Contact',now(),
  'The official page states free tasting without reservation and only requires booking for groups over 20.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='moulin-clos-des-jeannons-provence' and field_key='booking_requirement'
    and source_url='https://www.moulinjeannons.com/contactez-nous.html'
);
