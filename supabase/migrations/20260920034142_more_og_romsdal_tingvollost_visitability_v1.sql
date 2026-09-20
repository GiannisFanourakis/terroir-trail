
update public.producers
set
  visit_status='public_visits',
  visit_source_url='https://www.tingvollost.no/gardsbutikk/apen-gardsbutikk',
  visit_notes='Current first-party Tingvollost page publishes a public farm shop Monday-Friday 08:00-16:00 and Saturday 10:00-14:00, Sunday closed. Visitors can watch cheesemaking and the maturation room through large windows, but hygiene rules prevent public entry into the dairy itself. Group orientation/tasting visits are separately available by arrangement, with a minimum of 4 for the cheese-plate option.',
  opening_hours='Farm shop: Mon-Fri 08:00-16:00; Sat 10:00-14:00; Sun closed.',
  visit_booking_requirement='not_required',
  walk_in_status='accepted',
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours='{"farm_shop":{"monday_friday":"08:00-16:00","saturday":"10:00-14:00","sunday":"closed"}}'::jsonb,
  seasonal_visit_notes='Group visits are by arrangement; public entry into the dairy production room is not permitted, but production is visible through shop windows.',
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='tingvollost-more-og-romsdal';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'tingvollost-more-og-romsdal','visitor_hours',
  '{"farm_shop":{"monday_friday":"08:00-16:00","saturday":"10:00-14:00","sunday":"closed"}}'::jsonb,
  'first_party_source','https://www.tingvollost.no/gardsbutikk/apen-gardsbutikk',
  'Tingvollost — Åpen gardsbutikk',now(),
  'The current official farm-shop page publishes these hours.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='tingvollost-more-og-romsdal' and field_key='visitor_hours'
    and source_url='https://www.tingvollost.no/gardsbutikk/apen-gardsbutikk'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'tingvollost-more-og-romsdal','production_access',
  '{"inside_dairy_public_access":false,"production_visible_through_windows":true,"group_visits_by_arrangement":true}'::jsonb,
  'first_party_source','https://www.tingvollost.no/gardsbutikk/apen-gardsbutikk',
  'Tingvollost — Åpen gardsbutikk',now(),
  'The current official page explicitly says hygiene rules prevent tours inside the dairy while production can be observed through windows.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='tingvollost-more-og-romsdal' and field_key='production_access'
    and source_url='https://www.tingvollost.no/gardsbutikk/apen-gardsbutikk'
);
