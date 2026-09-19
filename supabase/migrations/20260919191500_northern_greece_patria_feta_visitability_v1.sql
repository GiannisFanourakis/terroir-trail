-- Northern Greece Visitability V1: Christakis / Patria Feta.
-- The verified Proastio point is a production site. The current first-party
-- domain was unreachable and no public visitor programme could be verified.

update public.producers
set
  visit_status = 'not_publicly_confirmed',
  visit_source_url = 'https://www.patriafeta.com/',
  visit_notes = 'The Proastio production site remains the verified Patria Feta / Christakis factory point, but the current first-party domain was unreachable during the 2026-09-19 visitability review and no indexed first-party visitor programme, factory-shop timetable, tour/tasting procedure, booking rule, or walk-in policy could be verified. Keep public access unconfirmed rather than inferring visitability from the factory listing.',
  opening_hours = null,
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 20:29:00+03'
where id = 'christakis-patria-feta-proastio';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'christakis-patria-feta-proastio','visit_status',
  '{"status":"not_publicly_confirmed","source_site_unreachable":true}'::jsonb,
  'terroirtrail_review',
  'https://www.patriafeta.com/',
  'TerroirTrail review of Patria Feta first-party domain',
  timestamptz '2026-09-19 20:29:00+03',
  'The current first-party domain was unreachable and no indexed first-party visitor programme or access terms could be verified. Existing location verification establishes a factory point only, not public visitability.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='christakis-patria-feta-proastio'
    and field_key='visit_status'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);
