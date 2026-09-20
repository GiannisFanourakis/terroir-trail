
update public.producers
set
  visit_status='public_visits',
  visit_source_url='https://www.istra.hr/en/mc/food-and-cuisine/4470',
  visit_notes='Current official Istrian tourism material actively promotes a guided olive-oil tasting and estate tour at the verified Mate farm, and the regional producer listing confirms a tasting room with capacity for 30 visitors and free parking. The reviewed sources do not publish current visitor hours or a universal booking rule, so those fields remain unknown rather than being inferred.',
  opening_hours='Guided tasting and estate visit are publicly promoted; current routine hours are not published in the reviewed sources.',
  visit_booking_requirement=null,
  walk_in_status=null,
  parking_status='available',
  typical_visit_minutes=null,
  visitor_hours=null,
  seasonal_visit_notes=null,
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='mate-olive-oil-istria';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'mate-olive-oil-istria','visitor_offering',
  '{"guided_olive_oil_tasting":true,"estate_tour":true,"tasting_room_capacity":30}'::jsonb,
  'public_listing','https://www.istra.hr/en/mc/food-and-cuisine/4470','Istria Tourist Board — Mate olive oil tasting',now(),
  'Official regional tourism material promotes a guided tasting and estate tour at Mate.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='mate-olive-oil-istria' and field_key='visitor_offering'
    and source_url='https://www.istra.hr/en/mc/food-and-cuisine/4470'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'mate-olive-oil-istria','parking_status',
  '{"status":"available","wording":"free_parking"}'::jsonb,
  'public_listing','https://www.istra.hr/en/gourmet/evoo/producers/mate','Istria Tourist Board — Mate',now(),
  'The official regional producer listing explicitly states free parking.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='mate-olive-oil-istria' and field_key='parking_status'
    and source_url='https://www.istra.hr/en/gourmet/evoo/producers/mate'
);
