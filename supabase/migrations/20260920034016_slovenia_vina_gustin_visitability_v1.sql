
update public.producers
set
  visit_status='public_visits',
  visit_source_url='https://vinagustin.si/en/degustacije',
  visit_notes='Current first-party Vina Guštin page publishes structured guided wine tastings in dedicated tasting rooms, including 4-wine and 6-wine programmes with food for groups of 6 people. The current site provides direct contact for tastings but does not explicitly state a universal advance-booking requirement, fixed visitor hours, walk-in policy, duration, parking or visitor languages.',
  opening_hours='Structured tasting programmes are published; contact the winery for current timing.',
  visit_booking_requirement=null,
  walk_in_status=null,
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours=null,
  seasonal_visit_notes='Published tasting programmes are structured around groups of 6 people.',
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='vina-gustin-goriska';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'vina-gustin-goriska','visitor_offering',
  '{"guided_tasting":true,"four_wine_programme":true,"six_wine_programme":true,"published_group_size":6}'::jsonb,
  'first_party_source','https://vinagustin.si/en/degustacije',
  'Vina Guštin — Degustacije',now(),
  'The current official page publishes guided 4-wine and 6-wine tasting programmes for groups of 6.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='vina-gustin-goriska' and field_key='visitor_offering'
    and source_url='https://vinagustin.si/en/degustacije'
);
