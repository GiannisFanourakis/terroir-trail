
update public.producers
set
  visit_status='seasonal_public',
  visit_source_url='https://www.hellelandgard.no/',
  visit_notes='Current first-party Helleland Gard page publishes 2026 seasonal farm-shop hours and explicitly offers drop-in cider tasting during shop opening hours. A separate cider tasting with food in Mosstova requires reservation at least three days in advance and has a maximum capacity of 20. General seasonal shop/drop-in access therefore does not require booking.',
  opening_hours='2026: May 2-Jun 20 Fri-Sat 16:00-18:00; Jun 22-Aug 8 Mon-Sat 15:00-18:00; Aug 14-29 Fri-Sat 16:00-18:00; Sun/holidays closed.',
  visit_booking_requirement='not_required',
  walk_in_status='accepted',
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours='{"2026":{"may_02_jun_20":{"friday_saturday":"16:00-18:00"},"jun_22_aug_08":{"monday_saturday":"15:00-18:00"},"aug_14_aug_29":{"friday_saturday":"16:00-18:00"},"sundays_holidays":"closed"}}'::jsonb,
  seasonal_visit_notes='Drop-in cider tasting is available during shop hours. Mosstova cider tasting with food requires at least 3 days advance booking; maximum 20 people.',
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='helleland-heldre-sider-vestland';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'helleland-heldre-sider-vestland','visitor_hours',
  '{"2026":{"may_02_jun_20":{"friday_saturday":"16:00-18:00"},"jun_22_aug_08":{"monday_saturday":"15:00-18:00"},"aug_14_aug_29":{"friday_saturday":"16:00-18:00"},"sundays_holidays":"closed"}}'::jsonb,
  'first_party_source','https://www.hellelandgard.no/',
  'Helleland Gard / Heldre Sider — official site',now(),
  'The current official page publishes these 2026 farm-shop and drop-in tasting hours.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='helleland-heldre-sider-vestland' and field_key='visitor_hours'
    and source_url='https://www.hellelandgard.no/'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'helleland-heldre-sider-vestland','booking_requirement',
  '{"general_access":"not_required","walk_in_status":"accepted","mosstova_group_tasting":{"required":true,"minimum_notice_days":3,"max_people":20}}'::jsonb,
  'first_party_source','https://www.hellelandgard.no/',
  'Helleland Gard / Heldre Sider — official site',now(),
  'The current page explicitly offers drop-in tasting during shop hours and requires three days advance booking for the Mosstova tasting.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='helleland-heldre-sider-vestland' and field_key='booking_requirement'
    and source_url='https://www.hellelandgard.no/'
);
