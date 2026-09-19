-- Peloponnese Visitability V1: GAIA Wines Nemea.
-- Current September 2026 first-party page confirms year-round Wed-Sun access,
-- recommended booking, walk-ins subject to availability, 60-minute visits and
-- Greek/English guided tours.

update public.producers
set
  visit_status = 'public_visits',
  visit_source_url = 'https://gaiawines.gr/en/visit-nemea-en/',
  visit_notes = 'Current first-party Nemea visitor page, updated in September 2026, states that the winery welcomes visitors all year Wednesday-Sunday 10:30-16:30, with Monday and Tuesday closed. Guided visits last approximately one hour. Advance online booking is recommended, especially on weekends, while walk-ins may be accommodated depending on availability. Guided visits are offered in Greek and English. A lower package blurb on the same page contains older conflicting weekend wording; the current top-level hours and FAQ are used.',
  opening_hours = 'Year-round: Wed-Sun 10:30-16:30; Mon-Tue closed.',
  visit_booking_requirement = 'recommended',
  walk_in_status = 'subject_to_availability',
  parking_status = null,
  typical_visit_minutes = 60,
  visitor_hours = '{
    "year_round":true,
    "wednesday_sunday":"10:30-16:30",
    "monday":"closed",
    "tuesday":"closed"
  }'::jsonb,
  seasonal_visit_notes = null,
  visitor_languages = array['el','en'],
  visitability_reviewed_at = timestamptz '2026-09-19 00:00:00+03'
where id = 'gaia-wines-nemea';

insert into public.producer_fact_evidence (producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'gaia-wines-nemea','visitor_hours',
  '{"year_round":true,"wednesday_sunday":"10:30-16:30","monday":"closed","tuesday":"closed"}'::jsonb,
  'first_party_source','https://gaiawines.gr/en/visit-nemea-en/',
  'GAIA Wines — Nemea Winery Tours & Wine Tasting',timestamptz '2026-09-19 00:00:00+03',
  'The current page, updated September 2026, publishes year-round Wednesday-Sunday hours and Monday/Tuesday closure.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='gaia-wines-nemea' and field_key='visitor_hours'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'gaia-wines-nemea','booking_requirement',
  '{"requirement":"recommended","walk_in_status":"subject_to_availability"}'::jsonb,
  'first_party_source','https://gaiawines.gr/en/visit-nemea-en/',
  'GAIA Wines — Nemea FAQ',timestamptz '2026-09-19 00:00:00+03',
  'The current FAQ recommends advance booking and says walk-ins may be accommodated depending on availability.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='gaia-wines-nemea' and field_key='booking_requirement'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'gaia-wines-nemea','typical_visit_minutes',
  '{"minutes":60,"scope":"guided_visit"}'::jsonb,
  'first_party_source','https://gaiawines.gr/en/visit-nemea-en/',
  'GAIA Wines — Nemea Winery Tours & Wine Tasting',timestamptz '2026-09-19 00:00:00+03',
  'The current visitor page states each standard guided visit lasts approximately one hour.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='gaia-wines-nemea' and field_key='typical_visit_minutes'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'gaia-wines-nemea','visitor_languages',
  '{"languages":["el","en"],"scope":"guided_visits"}'::jsonb,
  'first_party_source','https://gaiawines.gr/en/visit-nemea-en/',
  'GAIA Wines — Nemea FAQ',timestamptz '2026-09-19 00:00:00+03',
  'The current FAQ explicitly states fully guided tours are offered in Greek and English.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='gaia-wines-nemea' and field_key='visitor_languages'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);

insert into public.producer_fact_evidence (producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'gaia-wines-nemea','stale_hours_conflict',
  '{"current_top_level":"Wed-Sun 10:30-16:30; Mon-Tue closed","older_package_blurb":"all year except weekends upon appointment","selected":"current_top_level"}'::jsonb,
  'first_party_source','https://gaiawines.gr/en/visit-nemea-en/',
  'GAIA Wines — current-page internal wording conflict',timestamptz '2026-09-19 00:00:00+03',
  'A lower package description contains older conflicting wording. The recently updated top-level visitor section and FAQ are used as current operational information.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='gaia-wines-nemea' and field_key='stale_hours_conflict'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);
