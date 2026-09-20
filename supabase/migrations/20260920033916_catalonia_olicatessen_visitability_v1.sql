
update public.producers
set
  visit_status='appointment_only',
  visit_source_url='https://olicatessen.com/en/experiences/',
  visit_notes='Current first-party Olicatessen pages publish guided olive-oil tastings, estate walks, harvest workshops and mill visits at Molí dels Torms. Published experiences explicitly require advance booking and generally a minimum of 6 participants. Two current examples last about 90 minutes. Experiences are offered in Catalan, Spanish and English. No ordinary walk-in production access or fixed general visitor timetable is published.',
  opening_hours='Experiences by advance booking; schedules arranged with the mill.',
  visit_booking_requirement='required',
  walk_in_status='not_accepted',
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours=null,
  seasonal_visit_notes='Some experiences are available all year; the harvest-and-milling experience runs mid-October through November and is weather dependent.',
  visitor_languages=array['ca','es','en'],
  visitability_reviewed_at=now()
where id='olicatessen-moli-dels-torms-catalonia';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'olicatessen-moli-dels-torms-catalonia','booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted","minimum_participants":6}'::jsonb,
  'first_party_source','https://olicatessen.com/en/experiences/tasting-among-ancestral-olive-trees/',
  'Olicatessen — Tasting among ancestral olive trees',now(),
  'The current first-party experience page explicitly requires advance booking and a minimum of 6 participants.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='olicatessen-moli-dels-torms-catalonia' and field_key='booking_requirement'
    and source_url='https://olicatessen.com/en/experiences/tasting-among-ancestral-olive-trees/'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'olicatessen-moli-dels-torms-catalonia','programme_durations',
  '{"ancestral_olive_tasting_minutes":90,"harvest_mill_tour_minutes":90}'::jsonb,
  'first_party_source','https://olicatessen.com/en/experiences/',
  'Olicatessen — Experiences',now(),
  'Current first-party experience pages publish approximately 90 minutes for these two representative programmes.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='olicatessen-moli-dels-torms-catalonia' and field_key='programme_durations'
    and source_url='https://olicatessen.com/en/experiences/'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'olicatessen-moli-dels-torms-catalonia','visitor_languages',
  '{"languages":["ca","es","en"]}'::jsonb,
  'first_party_source','https://olicatessen.com/en/experiences/tasting-among-ancestral-olive-trees/',
  'Olicatessen — Experience details',now(),
  'The current official page explicitly lists Catalan, Spanish and English.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='olicatessen-moli-dels-torms-catalonia' and field_key='visitor_languages'
    and source_url='https://olicatessen.com/en/experiences/tasting-among-ancestral-olive-trees/'
);
