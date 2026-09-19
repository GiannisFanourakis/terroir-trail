-- Crete Visitability V1: Douloufakis Winery.
-- Current first-party material clearly supports advance booking, scheduled tasting
-- slots and on-site parking. The current YAMAS duration conflicts between 80 and
-- approximately 90 minutes, so duration remains unset.

update public.producers
set
  visit_status = 'appointment_only',
  visit_source_url = 'https://douloufakis.wine/en/opening-hours/',
  visit_notes = 'Current first-party pages require advance booking for wine and olive-oil tasting experiences. The winery publishes weekday and seasonal Saturday tasting slots and explicitly provides on-site parking. The current site conflicts on the standard YAMAS duration (80 vs about 90 minutes), so duration remains unset pending clarification. Experience pages explicitly list Greek and English, while the general visitor-information page lists Greek, English, German and French as languages spoken; visitor_languages remains unset until TerroirTrail defines whether this field means experience language or on-site spoken language.',
  opening_hours = 'Wine cellar: Mon-Fri 10:00-15:30. Tours/tastings: Mon-Fri 10:00, 12:00, 14:00 all year; Sat 12:00 and 14:00 in Jun-Sep. Advance booking required.',
  visit_booking_requirement = 'required',
  walk_in_status = 'not_accepted',
  parking_status = 'available',
  typical_visit_minutes = null,
  visitor_hours = '{
    "monday_friday":{"wine_cellar":"10:00-15:30","tour_tasting_starts":["10:00","12:00","14:00"]},
    "saturday_june_september":{"tour_tasting_starts":["12:00","14:00"]}
  }'::jsonb,
  seasonal_visit_notes = 'Saturday tastings are published for June through September. Public-holiday closures apply; available slots may vary by season and availability.',
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 19:55:00+03'
where id = 'douloufakis-winery';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'douloufakis-winery',
  'booking_requirement',
  '{"required":true}'::jsonb,
  'first_party_source',
  'https://douloufakis.wine/en/wine-tasting-experience-tour/',
  'Douloufakis Winery — Wine Tasting Experiences',
  timestamptz '2026-09-19 19:55:00+03',
  'The current official FAQ states that all wine and olive-oil tasting experiences are available by reservation only.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='douloufakis-winery'
    and field_key='booking_requirement'
    and verified_at=timestamptz '2026-09-19 19:55:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'douloufakis-winery',
  'parking_status',
  '{"status":"available","on_site":true}'::jsonb,
  'first_party_source',
  'https://douloufakis.wine/en/opening-hours/',
  'Douloufakis Winery — Opening Hours',
  timestamptz '2026-09-19 19:55:00+03',
  'The current official visitor-information page explicitly states that on-site parking is available.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='douloufakis-winery'
    and field_key='parking_status'
    and verified_at=timestamptz '2026-09-19 19:55:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'douloufakis-winery',
  'duration_conflict',
  '{"yamas_minutes":[80,90]}'::jsonb,
  'first_party_source',
  'https://douloufakis.wine/en/wine-tasting-in-crete-near-heraklion/',
  'Douloufakis Winery — YAMAS',
  timestamptz '2026-09-19 19:55:00+03',
  'Current first-party content conflicts: the YAMAS page header states 80 minutes while an FAQ on the same current English page states approximately 90 minutes. Greek current content states 80 minutes. Do not promote a single duration until resolved.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='douloufakis-winery'
    and field_key='duration_conflict'
);
