
update public.producers
set
  visit_status='public_visits',
  visit_source_url='https://www.masderoles.com/la-formatgeria',
  visit_notes='Current first-party Mas d''Eroles page publishes regular public shop hours at the Adrall cheese dairy: Monday-Friday 09:00-18:00, Saturday 11:00-13:00, Sunday closed. Visits to the cheese dairy itself are separately available only at an arranged time by telephone. Public shop access and production-area visits therefore have different rules.',
  opening_hours='Shop: Mon-Fri 09:00-18:00; Sat 11:00-13:00; Sun closed. Dairy visits by arranged time.',
  visit_booking_requirement='not_required',
  walk_in_status='accepted',
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours='{"shop":{"monday_friday":"09:00-18:00","saturday":"11:00-13:00","sunday":"closed"},"dairy_visit":"arranged_time"}'::jsonb,
  seasonal_visit_notes='Advance arrangement applies to the dairy visit, not ordinary shop access.',
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='mas-deroles-catalonia';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'mas-deroles-catalonia','visitor_hours',
  '{"shop":{"monday_friday":"09:00-18:00","saturday":"11:00-13:00","sunday":"closed"},"dairy_visit":"arranged_time"}'::jsonb,
  'first_party_source','https://www.masderoles.com/la-formatgeria',
  'Formatgeria Mas d''Eroles — La formatgeria',now(),
  'The current official page publishes shop hours and states dairy visits are at arranged times.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='mas-deroles-catalonia' and field_key='visitor_hours'
    and source_url='https://www.masderoles.com/la-formatgeria'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'mas-deroles-catalonia','booking_requirement',
  '{"general_shop_access":"not_required","walk_in_status":"accepted","dairy_visit":"arranged_by_phone"}'::jsonb,
  'first_party_source','https://www.masderoles.com/la-formatgeria',
  'Formatgeria Mas d''Eroles — La formatgeria',now(),
  'Ordinary shop access is published; the dairy visit is explicitly by arranged time.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='mas-deroles-catalonia' and field_key='booking_requirement'
    and source_url='https://www.masderoles.com/la-formatgeria'
);
