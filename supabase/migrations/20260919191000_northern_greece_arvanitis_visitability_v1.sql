-- Northern Greece Visitability V1: Arvanitis Dairy.
-- Current first-party pages verify the Neochorouda production site but do not
-- publish public factory access. The separate Thessaloniki Experience Store is
-- intentionally not used to classify factory visitability.

update public.producers
set
  visit_status = 'not_publicly_confirmed',
  visit_source_url = 'https://arvanitis.gr/en/company/the-company/',
  visit_notes = 'Current first-party Arvanitis pages confirm the active Neochorouda dairy production site and publish direct factory contact details, but they do not publish a current public factory visitor programme, tour/tasting procedure, visitor timetable, booking rule, or walk-in policy. Keep the Neochorouda production site not publicly confirmed. The separate Thessaloniki Experience Store is a different public point and is not used to classify factory access.',
  opening_hours = null,
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 20:29:00+03'
where id = 'arvanitis-dairy-neochorouda';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'arvanitis-dairy-neochorouda','visit_status',
  '{"status":"not_publicly_confirmed","scope":"neochorouda_production_site","separate_public_store_not_used":true}'::jsonb,
  'first_party_source',
  'https://arvanitis.gr/en/company/the-company/',
  'Arvanitis Dairy — official company/contact pages',
  timestamptz '2026-09-19 20:29:00+03',
  'The current official site verifies the Neochorouda dairy production site but publishes no current factory visitor programme or access procedure.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='arvanitis-dairy-neochorouda'
    and field_key='visit_status'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);
