
update public.producers
set
  visit_status='public_visits',
  visit_source_url='https://pacheca.com/pages/ribafreixowines',
  visit_notes='Current Ribafreixo first-party page, now hosted by Pacheca Group, confirms the Vidigueira winery remains active with a public wine shop, tasting area, restaurant and multiple wine-tourism activities including vineyard tours, guided winery tours and tastings. The wine shop is open Monday-Friday 09:00-18:00 and Saturday-Sunday 10:00-18:00. The page does not explicitly state a universal advance-booking requirement for all visitor access.',
  opening_hours='Wine shop: Mon-Fri 09:00-18:00; Sat-Sun 10:00-18:00.',
  visit_booking_requirement='not_required',
  walk_in_status='accepted',
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours='{"wine_shop":{"monday_friday":"09:00-18:00","saturday_sunday":"10:00-18:00"}}'::jsonb,
  seasonal_visit_notes=null,
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='ribafreixo-wines-alentejo';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'ribafreixo-wines-alentejo','visitor_hours',
  '{"wine_shop":{"monday_friday":"09:00-18:00","saturday_sunday":"10:00-18:00"}}'::jsonb,
  'first_party_source','https://pacheca.com/pages/ribafreixowines','Ribafreixo Wines — current first-party page',now(),
  'The current official page publishes these wine-shop hours.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='ribafreixo-wines-alentejo' and field_key='visitor_hours'
    and source_url='https://pacheca.com/pages/ribafreixowines'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'ribafreixo-wines-alentejo','visitor_offering',
  '{"wine_shop":true,"tasting_area":true,"vineyard_tours":true,"guided_winery_tours":true,"wine_tastings":true,"restaurant":true}'::jsonb,
  'first_party_source','https://pacheca.com/pages/ribafreixowines','Ribafreixo Wines — current first-party page',now(),
  'The current first-party page explicitly publishes these visitor facilities and wine-tourism activities.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='ribafreixo-wines-alentejo' and field_key='visitor_offering'
    and source_url='https://pacheca.com/pages/ribafreixowines'
);
