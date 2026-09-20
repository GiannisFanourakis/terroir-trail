-- Piedmont Visitability V1: Beppino Occelli / Valcasotto.
-- The Cheese Village and producer shop are open to the public; the maturation-
-- cellar visit is a separate bookable experience lasting about 30 minutes.

update public.producers
set
  visit_status = 'public_visits',
  visit_source_url = 'https://occelli.it/en/pages/stagionature-di-valcasotto',
  visit_notes = 'Current first-party Beppino Occelli page explicitly states that the Valcasotto Cheese Village is open to the public and has a producer shop. The same page separately offers a bookable maturation-cellar visit lasting about 30 minutes. General public/shop access and cellar-tour access therefore have different rules. The page publishes public village/shop hours and separate cellar-visit opening windows. Parking and visitor languages are not explicitly published.',
  opening_hours = 'Public village/shop: Mon-Sun 08:30-12:30 & 14:00-18:00. Bookable cellar visits: Mon-Fri 08:30-12:30 & 13:00-17:00; Sat-Sun 09:30-12:30 & 14:00-18:00.',
  visit_booking_requirement = 'not_required',
  walk_in_status = 'accepted',
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{
    "public_village_shop":{"monday_sunday":["08:30-12:30","14:00-18:00"]},
    "bookable_cellar_visit":{"monday_friday":["08:30-12:30","13:00-17:00"],"saturday_sunday":["09:30-12:30","14:00-18:00"]}
  }'::jsonb,
  seasonal_visit_notes = 'The maturation-cellar visit is approximately 30 minutes and should be booked separately; ordinary village/shop access is public.',
  visitor_languages = null,
  visitability_reviewed_at = now()
where id = 'beppino-occelli-valcasotto-piedmont';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'beppino-occelli-valcasotto-piedmont','booking_requirement',
  '{"general_access":"not_required","walk_in_status":"accepted","cellar_visit":"bookable"}'::jsonb,
  'first_party_source',
  'https://occelli.it/en/pages/stagionature-di-valcasotto',
  'Beppino Occelli — Valcasotto',
  now(),
  'The current official page says the Cheese Village is open to the public while separately offering a bookable maturation-cellar visit.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='beppino-occelli-valcasotto-piedmont'
    and field_key='booking_requirement'
    and source_url='https://occelli.it/en/pages/stagionature-di-valcasotto'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'beppino-occelli-valcasotto-piedmont','visitor_hours',
  '{"public_village_shop":{"monday_sunday":["08:30-12:30","14:00-18:00"]},"bookable_cellar_visit":{"monday_friday":["08:30-12:30","13:00-17:00"],"saturday_sunday":["09:30-12:30","14:00-18:00"]}}'::jsonb,
  'first_party_source',
  'https://occelli.it/en/pages/stagionature-di-valcasotto',
  'Beppino Occelli — Valcasotto',
  now(),
  'The current official page publishes separate public village/shop hours and cellar-visit opening windows.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='beppino-occelli-valcasotto-piedmont'
    and field_key='visitor_hours'
    and source_url='https://occelli.it/en/pages/stagionature-di-valcasotto'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'beppino-occelli-valcasotto-piedmont','programme_durations',
  '{"maturation_cellar_visit_minutes":30,"approximate":true}'::jsonb,
  'first_party_source',
  'https://occelli.it/en/pages/stagionature-di-valcasotto',
  'Beppino Occelli — Valcasotto',
  now(),
  'The current official page states the maturation-cellar visit lasts approximately 30 minutes.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='beppino-occelli-valcasotto-piedmont'
    and field_key='programme_durations'
    and source_url='https://occelli.it/en/pages/stagionature-di-valcasotto'
);
