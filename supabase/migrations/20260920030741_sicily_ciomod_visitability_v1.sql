-- Sicily Visitability V1: Ciomod / XOCOA.
-- Public chocolate/liquor experiences are explicitly located at the separate
-- Terrazza Ciomod venue; they do not establish public access to the mapped
-- production-site record.

update public.producers
set
  visit_status = 'not_publicly_confirmed',
  visit_source_url = 'https://www.ciomod.com/',
  visit_notes = 'Current first-party Ciomod pages confirm active visitor experiences, but those experiences are explicitly located at Terrazza Ciomod, Via Pizzo 23 in Modica Alta. The mapped TerroirTrail record represents the separate Ciomod production-site identity, and the current first-party site does not publish ordinary public access, tours, opening hours, booking terms, or walk-in access for that mapped production site. Keep production-site visitability unconfirmed.',
  opening_hours = null,
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = 'Separate Terrazza Ciomod experiences are bookable, but they are not used to classify this mapped production-site record.',
  visitor_languages = null,
  visitability_reviewed_at = now()
where id = 'ciomod-modica-sicily';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'ciomod-modica-sicily','visit_status',
  '{"status":"not_publicly_confirmed","scope":"mapped_production_site","separate_visitor_venue":"Terrazza Ciomod"}'::jsonb,
  'terroirtrail_review',
  'https://www.ciomod.com/',
  'Ciomod — official site / TerroirTrail point review',
  now(),
  'Current first-party pages place public chocolate/liquor experiences at Terrazza Ciomod rather than establishing public access to this mapped production-site point.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='ciomod-modica-sicily'
    and field_key='visit_status'
    and source_url='https://www.ciomod.com/'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'ciomod-modica-sicily','separate_visitor_venue',
  '{"name":"Terrazza Ciomod","address":"Via Pizzo 23, Modica Alta","group_tasting_minutes_min":40,"group_tasting_minutes_max":45,"group_tasting_weekdays":"monday_friday","booking":"required","educational_experience_minutes":90,"educational_notice_days":7}'::jsonb,
  'first_party_source',
  'https://www.ciomod.com/degustazione-cioccolato-liquori-per-gruppi/',
  'Ciomod — Terrazza Ciomod experiences',
  now(),
  'Recorded as a separate visitor venue only; it does not change the public-access status of the mapped production-site record.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='ciomod-modica-sicily'
    and field_key='separate_visitor_venue'
    and source_url='https://www.ciomod.com/degustazione-cioccolato-liquori-per-gruppi/'
);
