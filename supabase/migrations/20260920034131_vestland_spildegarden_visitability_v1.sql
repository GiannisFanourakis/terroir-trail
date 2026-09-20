
update public.producers
set
  visit_status='public_visits',
  visit_source_url='https://www.spildegarden.no/english',
  visit_notes='Current first-party Spildegarden page publishes 2026 public farm-shop and restaurant access Monday-Saturday and drop-in summer access. Cider tasting with lunch is available Monday-Saturday, while guided history-and-cider tastings are group-only, last about 1 hour, and require booking for groups of at least 5 people. Public shop/restaurant access and guided group experiences therefore have different rules.',
  opening_hours='Farm shop/restaurant: Mon-Sat 11:00-16:00. Summer drop-in: Mon-Sat 11:00-17:00.',
  visit_booking_requirement='not_required',
  walk_in_status='accepted',
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours='{"farm_shop_restaurant":{"monday_saturday":"11:00-16:00"},"summer_drop_in":{"monday_saturday":"11:00-17:00"}}'::jsonb,
  seasonal_visit_notes='Guided history/cider tasting is group-only, about 60 minutes, booking required, minimum 5 people.',
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='spildegarden-vestland';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'spildegarden-vestland','visitor_hours',
  '{"farm_shop_restaurant":{"monday_saturday":"11:00-16:00"},"summer_drop_in":{"monday_saturday":"11:00-17:00"}}'::jsonb,
  'first_party_source','https://www.spildegarden.no/english',
  'Spildegarden — English information',now(),
  'The current official page publishes these 2026 public/drop-in hours.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='spildegarden-vestland' and field_key='visitor_hours'
    and source_url='https://www.spildegarden.no/english'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'spildegarden-vestland','programme_durations',
  '{"guided_group_cider_tasting_minutes":60,"minimum_group_size":5,"booking_required":true}'::jsonb,
  'first_party_source','https://www.spildegarden.no/english',
  'Spildegarden — English information',now(),
  'The current official page states the guided group cider tasting lasts about one hour and requires booking for groups of at least five.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='spildegarden-vestland' and field_key='programme_durations'
    and source_url='https://www.spildegarden.no/english'
);
