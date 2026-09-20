
update public.producers
set
  visit_status='public_visits',
  visit_source_url='https://chateaupesquie.com/',
  visit_notes='Current first-party Château Pesquié visitor material confirms free wine tasting and a self-guided vineyard route during public estate opening hours. More structured cellar visits and tasting experiences are reservation-based. General public tasting/self-guided access is therefore distinct from bookable guided experiences.',
  opening_hours='Generally Mon-Sat 10:00-12:00 and 14:00-18:00 year-round; seasonal Sunday opening in high season. Recheck current seasonal schedule before travel.',
  visit_booking_requirement='not_required',
  walk_in_status='accepted',
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours='{"monday_saturday":["10:00-12:00","14:00-18:00"],"sunday":"seasonal_high_season"}'::jsonb,
  seasonal_visit_notes='Seasonal Sunday opening applies in high season. Guided cellar experiences are separately reservation-based.',
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='chateau-pesquie-provence';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'chateau-pesquie-provence','visitor_hours',
  '{"monday_saturday":["10:00-12:00","14:00-18:00"],"sunday":"seasonal_high_season"}'::jsonb,
  'first_party_source','https://chateaupesquie.com/','Château Pesquié — visitor information',now(),
  'Current first-party visitor material publishes regular Monday-Saturday opening and seasonal Sunday access.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='chateau-pesquie-provence' and field_key='visitor_hours'
    and source_url='https://chateaupesquie.com/'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'chateau-pesquie-provence','booking_requirement',
  '{"general_tasting_and_self_guided_access":"not_required","walk_in_status":"accepted","guided_cellar_experiences":"reservation_based"}'::jsonb,
  'first_party_source','https://chateaupesquie.com/','Château Pesquié — visitor information',now(),
  'The current estate material distinguishes free public tasting/self-guided vineyard access from reservation-based guided experiences.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='chateau-pesquie-provence' and field_key='booking_requirement'
    and source_url='https://chateaupesquie.com/'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'chateau-pesquie-provence','programme_durations',
  '{"guided_cellar_visit_minutes":90}'::jsonb,
  'first_party_source','https://chateaupesquie.com/','Château Pesquié — visitor information',now(),
  'Current first-party visitor material states the guided cellar visit lasts about 1 hour 30 minutes.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='chateau-pesquie-provence' and field_key='programme_durations'
    and source_url='https://chateaupesquie.com/'
);
