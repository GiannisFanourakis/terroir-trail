-- Crete Visitability V1: Zacharioudakis Organic Winery.
-- Current first-party Greek visitor page explicitly states that both the vineyard
-- and winery are open and visitable to the public all year. Daily hours are not
-- published on the current official visitor page.

update public.producers
set
  visit_status = 'public_visits',
  visit_source_url = 'https://www.zacharioudakis.com/en/visit-us/',
  visit_notes = 'Current first-party visitor page confirms that both the vineyard and winery are open and visitable to the public throughout the year. Visitors can tour the vineyard and production areas, taste estate wines and traditional Cretan foods, and buy wines/products from the wine shop. The official page does not publish current daily opening hours, a general booking requirement, walk-in policy, parking policy, visit duration, or tour languages.',
  opening_hours = 'Open to visitors year-round; current daily visitor hours are not published on the official visit page. Contact the winery before travelling.',
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{"year_round":true,"daily_hours":"not_published"}'::jsonb,
  seasonal_visit_notes = 'Programmed traditional grape-pressing participation is offered during harvest; timing is seasonal and not treated as a general opening-hours rule.',
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 19:05:00+03'
where id = 'zacharioudakis-winery';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'zacharioudakis-winery',
  'visit_status',
  '{"status":"public_visits","year_round":true}'::jsonb,
  'first_party_source',
  'https://www.zacharioudakis.com/el/visit-us/',
  'Zacharioudakis Winery — Επισκεφθείτε μας',
  timestamptz '2026-09-19 19:05:00+03',
  'The current Greek first-party page explicitly states that both the vineyard and winery are open and visitable to the public all year.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='zacharioudakis-winery'
    and field_key='visit_status'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'zacharioudakis-winery',
  'visitor_offering',
  '{"vineyard_tour":true,"winery_tour":true,"wine_tasting":true,"traditional_food":true,"wine_shop":true}'::jsonb,
  'first_party_source',
  'https://www.zacharioudakis.com/en/visit-us/',
  'Zacharioudakis Winery — Visit Us',
  timestamptz '2026-09-19 19:05:00+03',
  'The current official page describes vineyard and winery touring, tasting in the tasting hall, traditional Cretan foods and an on-site wine shop.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='zacharioudakis-winery'
    and field_key='visitor_offering'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);
