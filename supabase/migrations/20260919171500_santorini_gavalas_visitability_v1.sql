-- Santorini Visitability V1: Gavalas Winery.
-- Current first-party tasting page confirms April-October 11:00-19:00 hours,
-- guided tasting/tour access, and 60/75 minute package durations.

update public.producers
set
  visit_status = 'seasonal_public',
  visit_source_url = 'https://www.gavalaswines.gr/wine-tasting',
  visit_notes = 'Current first-party wine-tasting page confirms April-October visitor hours of 11:00-19:00 and guided winery tastings/tours through the traditional and modern winemaking areas. Published tasting packages last either 60 or 75 minutes. An online booking flow is offered, but the current page does not explicitly state that advance booking is mandatory or define a general walk-in policy. Parking and visitor languages are not published.',
  opening_hours = 'Apr-Oct: daily 11:00-19:00.',
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{
    "april_october":{"daily":"11:00-19:00"}
  }'::jsonb,
  seasonal_visit_notes = 'Published tasting packages currently last 60 or 75 minutes depending on the selected option.',
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 00:00:00+03'
where id = 'gavalas-winery-santorini';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'gavalas-winery-santorini',
  'visitor_hours',
  '{"season":"april_october","daily":"11:00-19:00"}'::jsonb,
  'first_party_source',
  'https://www.gavalaswines.gr/wine-tasting',
  'Gavalas Winery — Wine Tasting',
  timestamptz '2026-09-19 00:00:00+03',
  'The current first-party tasting page publishes April-October visitor hours of 11:00-19:00.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='gavalas-winery-santorini'
    and field_key='visitor_hours'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'gavalas-winery-santorini',
  'programme_durations',
  '{"minutes":[60,75],"variable_by_package":true}'::jsonb,
  'first_party_source',
  'https://www.gavalaswines.gr/wine-tasting',
  'Gavalas Winery — Wine Tasting',
  timestamptz '2026-09-19 00:00:00+03',
  'Current tasting options list 60-minute and 75-minute programmes; no single typical duration is promoted.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='gavalas-winery-santorini'
    and field_key='programme_durations'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'gavalas-winery-santorini',
  'visitor_offering',
  '{"wine_tasting":true,"guided_winery_tour":true}'::jsonb,
  'first_party_source',
  'https://www.gavalaswines.gr/wine-tasting',
  'Gavalas Winery — Wine Tasting',
  timestamptz '2026-09-19 00:00:00+03',
  'The current official page says a winery visit includes wine tasting and a tour through traditional and modern winemaking areas.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='gavalas-winery-santorini'
    and field_key='visitor_offering'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);
