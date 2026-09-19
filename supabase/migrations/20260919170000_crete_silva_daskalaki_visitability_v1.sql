-- Crete Visitability V1: Silva Daskalaki Winery.
-- Current first-party visitor page lists five guided-tour/tasting programmes,
-- requires arrangement one day in advance, and publishes Greek/English tours.
-- Programme durations vary, so no single typical visit duration is stored.

update public.producers
set
  visit_status = 'appointment_only',
  visit_source_url = 'https://www.silvawines.gr/en/guided-tours-tasting-amp-wine-tips',
  visit_notes = 'Current first-party visitor page lists five guided-tour/tasting programmes. Arrangement one day in advance is required. Tours are offered in Greek and English. Published programme durations vary from 45 to 120 minutes, so no single typical visit duration is stored. Food can be arranged with tastings on request. Parking is not explicitly documented on the current visitor page.',
  opening_hours = 'Apr-Oct: Mon-Sat 10:30-17:30; Nov-Mar: Mon-Fri 10:30-17:30. Closed on holidays. Appointment required one day ahead.',
  visit_booking_requirement = 'required',
  walk_in_status = 'not_accepted',
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{
    "april_october":{"monday_saturday":"10:30-17:30"},
    "november_march":{"monday_friday":"10:30-17:30"},
    "holidays":"closed"
  }'::jsonb,
  seasonal_visit_notes = 'Last tasting time varies by programme: 15:00-16:00. Appointment must be arranged one day in advance.',
  visitor_languages = array['el','en'],
  visitability_reviewed_at = timestamptz '2026-09-19 00:00:00+03'
where id = 'silva-daskalaki-winery';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'silva-daskalaki-winery',
  'booking_requirement',
  '{"required":true,"lead_time":"one_day"}'::jsonb,
  'first_party_source',
  'https://www.silvawines.gr/en/guided-tours-tasting-amp-wine-tips',
  'Silva Wines — Guided Tours / Tasting & Wine Tips',
  timestamptz '2026-09-19 00:00:00+03',
  'The current first-party page says appointments must be arranged one day in advance for the five guided-tour programmes.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='silva-daskalaki-winery'
    and field_key='booking_requirement'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'silva-daskalaki-winery',
  'visitor_languages',
  '{"languages":["el","en"],"scope":"guided_tours"}'::jsonb,
  'first_party_source',
  'https://www.silvawines.gr/en/guided-tours-tasting-amp-wine-tips',
  'Silva Wines — Guided Tours / Tasting & Wine Tips',
  timestamptz '2026-09-19 00:00:00+03',
  'Every currently published tour programme lists Greek and English as tour languages.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='silva-daskalaki-winery'
    and field_key='visitor_languages'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'silva-daskalaki-winery',
  'programme_durations',
  '{"minutes":[45,60,50,120,100]}'::jsonb,
  'first_party_source',
  'https://www.silvawines.gr/en/guided-tours-tasting-amp-wine-tips',
  'Silva Wines — Guided Tours / Tasting & Wine Tips',
  timestamptz '2026-09-19 00:00:00+03',
  'Published programme durations vary by selected experience. No single typical visit duration is promoted.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='silva-daskalaki-winery'
    and field_key='programme_durations'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);
