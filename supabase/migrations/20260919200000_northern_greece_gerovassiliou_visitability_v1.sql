-- Northern Greece Visitability V1: Ktima Gerovassiliou.
-- Current first-party visitor pages publish public opening hours and fixed tour
-- times. General visits do not require reservations; groups over 10 and certain
-- special experiences do, while weekends are first come, first served.

update public.producers
set
  visit_status = 'public_visits',
  visit_source_url = 'https://gerovassiliou.gr/en/visits/useful-information',
  visit_notes = 'Current first-party visitor pages publish open public access to Ktima Gerovassiliou and the Wine Museum: Monday, Thursday and Friday 10:00-16:00; Wednesday 13:00-19:00; Saturday-Sunday 11:00-17:00; Tuesday closed, with additional published holiday closures. General guided tours run at fixed times and last approximately 45-60 minutes. Booking is required for groups over 10 people and for certain special experiences such as Harmony; weekends operate on a first-come, first-served basis. All visitor areas are stated to be accessible to people with disabilities.',
  opening_hours = 'Mon, Thu, Fri 10:00-16:00; Wed 13:00-19:00; Sat-Sun 11:00-17:00; Tue closed. Additional holiday closures apply.',
  visit_booking_requirement = 'not_required',
  walk_in_status = 'accepted',
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{
    "monday":"10:00-16:00",
    "tuesday":"closed",
    "wednesday":"13:00-19:00",
    "thursday_friday":"10:00-16:00",
    "saturday_sunday":"11:00-17:00"
  }'::jsonb,
  seasonal_visit_notes = 'General guided tours last approximately 45-60 minutes. Groups over 10 require booking; some special experiences require reservations. Weekends operate first come, first served. See the official page for holiday and summer closure dates.',
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 20:29:00+03'
where id = 'ktima-gerovassiliou';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'ktima-gerovassiliou','visitor_hours',
  '{"monday":"10:00-16:00","tuesday":"closed","wednesday":"13:00-19:00","thursday_friday":"10:00-16:00","saturday_sunday":"11:00-17:00"}'::jsonb,
  'first_party_source',
  'https://gerovassiliou.gr/en/visits/useful-information',
  'Ktima Gerovassiliou — Useful information',
  timestamptz '2026-09-19 20:29:00+03',
  'The current official visitor page publishes the estate and Wine Museum opening schedule.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='ktima-gerovassiliou' and field_key='visitor_hours'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'ktima-gerovassiliou','booking_requirement',
  '{"requirement":"not_required","walk_in_status":"accepted","group_booking_required_over":10,"weekends":"first_come_first_served"}'::jsonb,
  'first_party_source',
  'https://gerovassiliou.gr/en/visits/tours',
  'Ktima Gerovassiliou — Guided tours & wine tastings',
  timestamptz '2026-09-19 20:29:00+03',
  'The current official page requires bookings for groups over 10, allows bookings on weekdays, and explicitly operates first come, first served on weekends; ordinary general visits therefore do not require a reservation.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='ktima-gerovassiliou' and field_key='booking_requirement'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'ktima-gerovassiliou','programme_durations',
  '{"minutes_min":45,"minutes_max":60,"scope":"guided_tour"}'::jsonb,
  'first_party_source',
  'https://gerovassiliou.gr/en/visits/tours',
  'Ktima Gerovassiliou — Guided tours & wine tastings',
  timestamptz '2026-09-19 20:29:00+03',
  'The current official page states that the guided tour lasts approximately 45-60 minutes.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='ktima-gerovassiliou' and field_key='programme_durations'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'ktima-gerovassiliou','wheelchair_accessible',
  '{"accessible":true,"scope":"all_visitor_areas"}'::jsonb,
  'first_party_source',
  'https://gerovassiliou.gr/en/visits/useful-information',
  'Ktima Gerovassiliou — Useful information',
  timestamptz '2026-09-19 20:29:00+03',
  'The current official visitor page explicitly states that all areas are accessible to people with disabilities.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='ktima-gerovassiliou' and field_key='wheelchair_accessible'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'ktima-gerovassiliou','tour_schedule',
  '{"monday_thursday_friday":["10:30","12:00","13:30","15:00"],"wednesday":["13:30","15:00","16:30","18:00"],"saturday_sunday":["11:30","13:00","14:30","16:00"]}'::jsonb,
  'first_party_source',
  'https://gerovassiliou.gr/en/visits/useful-information',
  'Ktima Gerovassiliou — Tour times',
  timestamptz '2026-09-19 20:29:00+03',
  'The current official visitor page publishes fixed general guided-tour start times.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='ktima-gerovassiliou' and field_key='tour_schedule'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);
