-- Crete Visitability V1: Notos Brewery.
-- First-party pages confirm the brewery/contact point but do not publish a
-- formal visitor programme. Current public visitor reports support informal
-- visits while explicitly describing the site as not set up as a formal taproom.

update public.producers
set
  visit_status = 'current_access_uncertain',
  visit_source_url = 'https://brewshop.notosbrewery.gr/?page_id=282',
  visit_notes = 'The current first-party site confirms the Heraklion brewery and direct brewer contact details but does not publish a formal visitor programme or visitor hours. Current public listings and 2026 visitor reports indicate that informal brewery visits, beer tasting/drinking and takeaway purchases do occur, while also describing the site as not set up as a formal taproom. Contact the brewery before travelling.',
  opening_hours = null,
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 19:30:00+03'
where id = 'notos-brewery';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'notos-brewery',
  'visit_status',
  '{"status":"current_access_uncertain"}'::jsonb,
  'public_listing',
  'https://www.tripadvisor.com/Attraction_Review-g189417-d15710451-Reviews-Notos_Brewery-Heraklion_Crete.html',
  'Notos Brewery — current public visitor listing',
  timestamptz '2026-09-19 19:30:00+03',
  'Recent public visitor evidence indicates informal visits and on-site beer consumption/purchases, but the current first-party site does not publish a formal visitor programme, walk-in policy or visitor hours.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='notos-brewery'
    and field_key='visit_status'
    and verified_at=timestamptz '2026-09-19 19:30:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'notos-brewery',
  'informal_visit_reports',
  '{"on_site_beer":true,"takeaway_sales":true,"formal_taproom":false}'::jsonb,
  'public_listing',
  'https://wanderlog.com/place/details/3828792/notos-brewery',
  'Current public visitor reports',
  timestamptz '2026-09-19 19:30:00+03',
  'Recent public reviews report on-site beer and takeaway purchases while noting that the brewery is not really set up as a formal taproom.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='notos-brewery'
    and field_key='informal_visit_reports'
);
