-- Crete Visitability V1: Wild Herbs of Crete.
-- The producer-controlled Facebook page states that the Kallikratis shop is now
-- closed, while the previously stored website no longer resolves. Remove the
-- old seasonal visitor-hours claim without inferring that all business activity
-- has ceased.

update public.producers
set
  visit_status = 'not_publicly_confirmed',
  visit_source_url = 'https://www.facebook.com/wildherbsofcrete/',
  visit_notes = 'The producer-controlled Facebook page states that the Kallikratis shop is now closed and thanks visitors for their company over the years. The previously stored website no longer resolves. No current first-party visitor programme, opening hours, booking flow, or walk-in access could be verified in 2026. Keep the producer record, but do not present it as currently visitable.',
  opening_hours = null,
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 19:05:00+03'
where id = 'wild-herbs-kallikratis';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'wild-herbs-kallikratis',
  'visitor_site_closure',
  '{"shop_closed":true,"current_visitability":"not_publicly_confirmed"}'::jsonb,
  'producer_confirmed',
  'https://www.facebook.com/wildherbsofcrete/',
  'Wild Herbs of Crete — producer-controlled Facebook page',
  timestamptz '2026-09-19 19:05:00+03',
  'The producer-controlled page states that the shop is now closed and thanks visitors for their company over the years. This supports removing the old seasonal visitor-hours claim. It does not by itself establish whether all non-visitor business activity has ceased.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='wild-herbs-kallikratis'
    and field_key='visitor_site_closure'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);
