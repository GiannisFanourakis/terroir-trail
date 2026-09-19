-- Crete Visitability V1: Titakis Winery / Fabrika Experience.
-- Current first-party Fabrika pages confirm a dedicated reservation flow,
-- package-specific durations and notice requirements. Walk-in policy, parking
-- and tour languages are not explicitly published.

update public.producers
set
  visit_status = 'appointment_only',
  visit_source_url = 'https://www.fabrikaexperience.gr/en/book-your-visit',
  visit_notes = 'Current first-party Fabrika Experience site presents Titakis Winery as an active wine-tour destination with multiple bookable tour/tasting packages. Reservations are handled by phone or booking form. The page publishes booking-office hours and package-specific durations, including additional 1- or 2-day notice for selected premium experiences. The site does not explicitly state a general walk-in policy, parking policy, or tour languages, so those remain unconfirmed.',
  opening_hours = 'Booking office: Mon-Fri 08:00-15:00; Sat upon request. Visit time is arranged through the Fabrika reservation flow.',
  visit_booking_requirement = 'required',
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{
    "booking_office":{"monday_friday":"08:00-15:00","saturday":"upon_request"}
  }'::jsonb,
  seasonal_visit_notes = 'Published packages range from about 60 to 150 minutes. Some premium packages require 1-day notice; the Wine & Food Pairing Experience requires 2-day notice.',
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 19:15:00+03'
where id = 'titakis-winery';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'titakis-winery',
  'booking_requirement',
  '{"required":true,"booking_channels":["phone","booking_form"],"booking_office":{"monday_friday":"08:00-15:00","saturday":"upon_request"}}'::jsonb,
  'first_party_source',
  'https://www.fabrikaexperience.gr/en/book-your-visit',
  'Fabrika Experience — Book your Wine Tour & Tasting',
  timestamptz '2026-09-19 19:15:00+03',
  'The current first-party Fabrika page is a dedicated reservation page for winery tours/tastings and instructs visitors to reserve by phone or form. It publishes booking-office hours.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='titakis-winery'
    and field_key='booking_requirement'
    and verified_at=timestamptz '2026-09-19 19:15:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'titakis-winery',
  'programme_durations',
  '{"minutes":[60,70,90,80,120,60,120,150],"range_minutes":[60,150],"variable_by_package":true}'::jsonb,
  'first_party_source',
  'https://www.fabrikaexperience.gr/en/book-your-visit',
  'Fabrika Experience — Packages & Prices',
  timestamptz '2026-09-19 19:15:00+03',
  'Published package durations vary by chosen experience. The Sixteria package is published as approximately 100-120 minutes and is not reduced to a single typical duration.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='titakis-winery'
    and field_key='programme_durations'
    and verified_at=timestamptz '2026-09-19 19:15:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'titakis-winery',
  'advance_notice',
  '{"selected_packages":{"one_day":["Wine Lovers Tasting","Miliaraki Collection Wine Lovers Tasting","Impetus Experience","SIXTERIA in the Cellar"],"two_days":["Wine & Food Pairing Experience"]}}'::jsonb,
  'first_party_source',
  'https://www.fabrikaexperience.gr/en/book-your-visit',
  'Fabrika Experience — Packages & Prices',
  timestamptz '2026-09-19 19:15:00+03',
  'Selected premium packages publish explicit 1-day or 2-day notice requirements. Standard packages do not publish a separate advance-notice period.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='titakis-winery'
    and field_key='advance_notice'
    and verified_at=timestamptz '2026-09-19 19:15:00+03'
);
