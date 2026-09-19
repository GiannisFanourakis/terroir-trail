-- Santorini Visitability V1: Venetsanos Winery.
-- Current first-party operational pages confirm main-hall and sunset-terrace
-- hours, recommend reservations, publish 75/90-minute package durations,
-- and explicitly support English/Greek guided tours.

update public.producers
set
  visit_status = 'public_visits',
  visit_source_url = 'https://venetsanoswinery.com/contact/',
  visit_notes = 'Current first-party operational pages publish Main Hall Terrace hours daily 11:00-20:00, with the last tasting pour at 18:30. The Sunset Terrace operates May-September 18:00-22:00 according to the current contact page; an older FAQ still says 18:30 and is treated as superseded. Reservations are recommended because the winery is often fully booked, but the FAQ does not state that reservations are mandatory. Guided tour language is English unless all guests know Greek. Current bookable packages include a 75-minute museum winery tour and tasting and a 90-minute tasting with light lunch.',
  opening_hours = 'Main Hall Terrace: daily 11:00-20:00; last tasting pour 18:30. Sunset Terrace: May-Sep 18:00-22:00.',
  visit_booking_requirement = 'recommended',
  walk_in_status = 'subject_to_availability',
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{
    "main_hall_terrace":{"daily":"11:00-20:00","last_tasting_pour":"18:30"},
    "sunset_terrace":{"season":"may_september","daily":"18:00-22:00"}
  }'::jsonb,
  seasonal_visit_notes = 'An older FAQ still lists the Sunset Terrace as 18:30-22:00; the current contact page, modified more recently, publishes 18:00-22:00 and is used as the current value.',
  visitor_languages = array['en','el'],
  visitability_reviewed_at = timestamptz '2026-09-19 00:00:00+03'
where id = 'venetsanos-winery-santorini';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'venetsanos-winery-santorini',
  'visitor_hours',
  '{"main_hall_terrace":{"daily":"11:00-20:00","last_tasting_pour":"18:30"},"sunset_terrace":{"season":"may_september","daily":"18:00-22:00"}}'::jsonb,
  'first_party_source',
  'https://venetsanoswinery.com/contact/',
  'Venetsanos Winery — Contact',
  timestamptz '2026-09-19 00:00:00+03',
  'The current contact page publishes Main Hall Terrace hours, last tasting pour and May-September Sunset Terrace hours.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='venetsanos-winery-santorini'
    and field_key='visitor_hours'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'venetsanos-winery-santorini',
  'booking_requirement',
  '{"requirement":"recommended","walk_in_status":"subject_to_availability"}'::jsonb,
  'first_party_source',
  'https://venetsanoswinery.com/faq/',
  'Venetsanos Winery — FAQ',
  timestamptz '2026-09-19 00:00:00+03',
  'The FAQ says the winery suggests reserving because most days are fully booked; it does not say reservations are universally mandatory.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='venetsanos-winery-santorini'
    and field_key='booking_requirement'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'venetsanos-winery-santorini',
  'programme_durations',
  '{"minutes":[75,90],"variable_by_package":true}'::jsonb,
  'first_party_source',
  'https://venetsanoswinery.com/book-now/',
  'Venetsanos Winery — Book Now',
  timestamptz '2026-09-19 00:00:00+03',
  'Current booking page lists a 75-minute Museum Winery Tour & Wine Tasting and a 90-minute Wine Tasting & Light Lunch.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='venetsanos-winery-santorini'
    and field_key='programme_durations'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'venetsanos-winery-santorini',
  'visitor_languages',
  '{"languages":["en","el"],"scope":"guided_tour"}'::jsonb,
  'first_party_source',
  'https://venetsanoswinery.com/product/museum-winery-tour-wine-tasting/',
  'Venetsanos Winery — Museum Winery Tour & Wine Tasting',
  timestamptz '2026-09-19 00:00:00+03',
  'The current tour page states that guided tours are in English unless all guests know Greek.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='venetsanos-winery-santorini'
    and field_key='visitor_languages'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'venetsanos-winery-santorini',
  'stale_hours_conflict',
  '{"older_faq_sunset_start":"18:30","current_contact_sunset_start":"18:00","selected":"18:00"}'::jsonb,
  'first_party_source',
  'https://venetsanoswinery.com/faq/',
  'Venetsanos Winery — FAQ / Contact conflict',
  timestamptz '2026-09-19 00:00:00+03',
  'The older FAQ lists 18:30 while the more recently maintained contact page lists 18:00. The current contact-page value is surfaced.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='venetsanos-winery-santorini'
    and field_key='stale_hours_conflict'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);
