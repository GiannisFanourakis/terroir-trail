
update public.producers
set
  visit_status='public_visits',
  visit_source_url='https://www.lavinyeta.es/es/experiencias/act/3/visita-guiada-i-tast-de-vins',
  visit_notes='Current first-party La Vinyeta page publishes regular guided vineyard/winery visits with wine tasting on Saturdays, Sundays and public holidays, with other days available on request. Standard published slots are 10:30-12:15 and 12:30-14:15. The standard tour page lists Catalan, while the current site also publishes an exclusive English tour. A reservation flow is provided, but the page does not explicitly state that all ordinary visits require advance booking or define walk-in access.',
  opening_hours='Guided visit slots Sat-Sun and public holidays: 10:30-12:15 and 12:30-14:15. Other days by request.',
  visit_booking_requirement=null,
  walk_in_status=null,
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours='{"saturday_sunday_holidays":["10:30-12:15","12:30-14:15"],"other_days":"on_request"}'::jsonb,
  seasonal_visit_notes=null,
  visitor_languages=array['ca','en'],
  visitability_reviewed_at=now()
where id='la-vinyeta-catalonia';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'la-vinyeta-catalonia','visitor_hours',
  '{"saturday_sunday_holidays":["10:30-12:15","12:30-14:15"],"other_days":"on_request"}'::jsonb,
  'first_party_source','https://www.lavinyeta.es/es/experiencias/act/3/visita-guiada-i-tast-de-vins',
  'La Vinyeta — Visita guiada y cata de vinos',now(),
  'The current official page publishes these fixed standard guided-visit slots.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='la-vinyeta-catalonia' and field_key='visitor_hours'
    and source_url='https://www.lavinyeta.es/es/experiencias/act/3/visita-guiada-i-tast-de-vins'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'la-vinyeta-catalonia','visitor_languages',
  '{"languages":["ca","en"],"scope":"published_tour_options"}'::jsonb,
  'first_party_source','https://www.lavinyeta.es/es/experiencias/act/3/visita-guiada-i-tast-de-vins',
  'La Vinyeta — published tour options',now(),
  'The standard tour explicitly lists Catalan and the current first-party site separately publishes an exclusive English tour.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='la-vinyeta-catalonia' and field_key='visitor_languages'
    and source_url='https://www.lavinyeta.es/es/experiencias/act/3/visita-guiada-i-tast-de-vins'
);
