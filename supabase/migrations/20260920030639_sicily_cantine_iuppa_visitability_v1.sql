-- Sicily Visitability V1: Cantine Iuppa.
-- Current first-party visitor page publishes 120-minute wine-tasting/lunch
-- experiences and a reservation/request flow, but does not state a universal
-- booking mandate or general visitor timetable.

update public.producers
set
  visit_status = 'public_visits',
  visit_source_url = 'https://cantineiuppa.it/en/visite-degustazioni',
  visit_notes = 'Current first-party Cantine Iuppa visitor page publishes wine-tasting and lunch experiences at the Milo estate and provides an online request flow plus a reservations contact. Published tasting/lunch packages last 120 minutes. The current page does not explicitly state that advance booking is universally mandatory, define a general walk-in policy, publish visitor hours, parking details, or visitor languages.',
  opening_hours = 'Visitor experiences are published; no general visitor timetable is stated.',
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = 120,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = now()
where id = 'cantine-iuppa-sicily';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'cantine-iuppa-sicily','visitor_offering',
  '{"wine_tasting":true,"lunch":true,"published_package_minutes":120}'::jsonb,
  'first_party_source',
  'https://cantineiuppa.it/en/visite-degustazioni',
  'Cantine Iuppa — Visits & Tastings',
  now(),
  'The current official visitor page publishes wine tasting and lunch experiences and provides an online request flow.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='cantine-iuppa-sicily'
    and field_key='visitor_offering'
    and source_url='https://cantineiuppa.it/en/visite-degustazioni'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'cantine-iuppa-sicily','typical_visit_minutes',
  '{"minutes":120,"scope":"published_tasting_lunch_packages"}'::jsonb,
  'first_party_source',
  'https://cantineiuppa.it/en/visite-degustazioni',
  'Cantine Iuppa — Visits & Tastings',
  now(),
  'Both currently published tasting-and-lunch packages are listed as 120 minutes.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='cantine-iuppa-sicily'
    and field_key='typical_visit_minutes'
    and source_url='https://cantineiuppa.it/en/visite-degustazioni'
);
