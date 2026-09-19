-- Crete Visitability V1: Ktima Toplou.
-- Public tastings take place at Toplou Fabrica in the monastery courtyard,
-- open daily 10:00-18:00. The production winery has separate contact hours
-- and explicitly does not host the tastings.

update public.producers
set
  visit_status = 'public_visits',
  visit_source_url = 'https://www.ktimatoplou.gr/en/toplou-fabrica-tasting-room-315',
  visit_notes = 'Current first-party pages confirm that public tastings and visitor experiences take place at Toplou Fabrica inside the courtyard of the Holy Monastery of Toplou, open daily 10:00-18:00. Ktima Toplou explicitly states that wine tastings do not take place at the production winery. The winery publishes separate contact hours Mon-Fri 08:30-16:30. Booking availability exists through the Fabrica request/contact flow, but a general mandatory-booking or walk-in rule is not explicitly stated.',
  opening_hours = 'Toplou Fabrica visitor/tasting room: daily 10:00-18:00. Production winery contact hours: Mon-Fri 08:30-16:30; tastings do not take place at the winery.',
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{
    "toplou_fabrica":{"daily":"10:00-18:00","location":"Toplou Monastery courtyard"},
    "production_winery_contact":{"monday_friday":"08:30-16:30","public_tastings":false}
  }'::jsonb,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 19:05:00+03'
where id = 'toplou-monastery-winery';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'toplou-monastery-winery',
  'visitor_hours',
  '{"toplou_fabrica":{"daily":"10:00-18:00"}}'::jsonb,
  'first_party_source',
  'https://www.ktimatoplou.gr/en/toplou-fabrica-tasting-room-315',
  'Ktima Toplou — Toplou Fabrica Tasting Room',
  timestamptz '2026-09-19 19:05:00+03',
  'The current official Fabrica page states that Toplou Fabrica is open daily 10:00-18:00.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='toplou-monastery-winery'
    and field_key='visitor_hours'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'toplou-monastery-winery',
  'visitor_location_scope',
  '{"tastings_location":"Toplou Fabrica, Holy Monastery courtyard","production_winery_tastings":false}'::jsonb,
  'first_party_source',
  'https://www.ktimatoplou.gr/en/contact-us-285',
  'Ktima Toplou — Contact Us',
  timestamptz '2026-09-19 19:05:00+03',
  'The official contact page explicitly says wine tastings take place at Toplou Fabrica and do not take place at the winery.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='toplou-monastery-winery'
    and field_key='visitor_location_scope'
    and verified_at=timestamptz '2026-09-19 19:05:00+03'
);
