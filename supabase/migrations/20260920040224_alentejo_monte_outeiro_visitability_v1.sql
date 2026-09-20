
update public.producers
set
  visit_status='current_access_uncertain',
  visit_source_url='https://www.herdademonteouteiro.com/',
  visit_notes='Current first-party Herdade do Monte Outeiro site confirms active rural-tourism accommodation on an agricultural estate with olive groves, sheep, goats, beehives and nature activities. However, it does not publish a standalone producer/farm visit programme for non-guests, visitor hours, booking rules for agricultural areas, walk-in access or a structured tasting experience. Do not treat accommodation availability as proof of ordinary producer access.',
  opening_hours='Rural-tourism estate active; standalone producer-visit access for non-guests is not currently defined.',
  visit_booking_requirement=null,
  walk_in_status=null,
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours=null,
  seasonal_visit_notes=null,
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='herdade-do-monte-outeiro-alentejo';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'herdade-do-monte-outeiro-alentejo','visit_status',
  '{"status":"current_access_uncertain","rural_tourism_active":true,"standalone_producer_visit_not_published":true}'::jsonb,
  'first_party_source','https://www.herdademonteouteiro.com/','Herdade do Monte Outeiro — official site',now(),
  'The current official site confirms rural tourism and agricultural activity but not standalone public producer access for non-guests.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='herdade-do-monte-outeiro-alentejo' and field_key='visit_status'
    and source_url='https://www.herdademonteouteiro.com/'
);
