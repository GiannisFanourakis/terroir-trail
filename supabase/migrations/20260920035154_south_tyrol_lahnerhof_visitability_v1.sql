
update public.producers
set
  visit_status='public_visits',
  visit_source_url='https://lahnerhof.com/de/brennerei',
  visit_notes='Current first-party Lahnerhof distillery page actively advertises distillery tours through the historic vaulted cellar, tastings and on-site sales. The current site does not explicitly state that advance booking is mandatory, nor does it publish fixed visitor hours, a standard duration, parking details or visitor languages. The older appointment-only assumption is therefore not retained.',
  opening_hours='Distillery tours, tastings and sales are offered; contact Lahnerhof for current timing.',
  visit_booking_requirement=null,
  walk_in_status=null,
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours=null,
  seasonal_visit_notes=null,
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='lahnerhof-distillery-south-tyrol';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'lahnerhof-distillery-south-tyrol','visitor_offering',
  '{"distillery_tour":true,"tasting":true,"on_site_sales":true}'::jsonb,
  'first_party_source','https://lahnerhof.com/de/brennerei',
  'Lahnerhof — Brennerei',now(),
  'The current official page advertises tours through the historic cellar, tastings and sales.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='lahnerhof-distillery-south-tyrol' and field_key='visitor_offering'
    and source_url='https://lahnerhof.com/de/brennerei'
);
