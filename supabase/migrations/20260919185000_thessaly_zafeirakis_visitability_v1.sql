-- Thessaly Visitability V1: Domaine Zafeirakis.
-- Current first-party tour pages explicitly state Monday-Sunday 11:00-19:00
-- by appointment and publish guided vineyard/winery tours with 5- or 8-wine tastings.

update public.producers
set
  visit_status = 'appointment_only',
  visit_source_url = 'https://www.domainezafeirakis.com/winetourism',
  visit_notes = 'Current first-party wine-tourism pages offer guided vineyard and winery tours with wine tastings and explicitly state Monday-Sunday 11:00-19:00 by appointment. Two tasting formats are currently published: 5 wines and 8 wines. The current site does not publish a standard visit duration, parking details, or actual visitor languages.',
  opening_hours = 'Mon-Sun 11:00-19:00 by appointment.',
  visit_booking_requirement = 'required',
  walk_in_status = 'not_accepted',
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = '{"monday_sunday":"11:00-19:00","booking":"appointment"}'::jsonb,
  seasonal_visit_notes = null,
  visitor_languages = null,
  visitability_reviewed_at = timestamptz '2026-09-19 20:29:00+03'
where id = 'domaine-zafeirakis-thessaly';

insert into public.producer_fact_evidence (producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'domaine-zafeirakis-thessaly','booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted"}'::jsonb,
  'first_party_source',
  'https://www.domainezafeirakis.com/projects-1/winery-tour-%26-wine-tasting-of-5-wines-%7C-%E2%82%AC15',
  'Domaine Zafeirakis — Winery Tour & Wine Tasting',
  timestamptz '2026-09-19 20:29:00+03',
  'The current first-party tour page explicitly states visits are by appointment.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='domaine-zafeirakis-thessaly' and field_key='booking_requirement'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);

insert into public.producer_fact_evidence (producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'domaine-zafeirakis-thessaly','visitor_hours',
  '{"monday_sunday":"11:00-19:00","booking":"appointment"}'::jsonb,
  'first_party_source',
  'https://www.domainezafeirakis.com/projects-1/winery-tour-%26-wine-tasting-of-8-wines-%7C-%E2%82%AC30',
  'Domaine Zafeirakis — Winery Tour & Wine Tasting',
  timestamptz '2026-09-19 20:29:00+03',
  'Current official tour pages publish Monday-Sunday 11:00-19:00 by appointment.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='domaine-zafeirakis-thessaly' and field_key='visitor_hours'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);

insert into public.producer_fact_evidence (producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'domaine-zafeirakis-thessaly','visitor_offering',
  '{"vineyard_tour":true,"winery_tour":true,"wine_tasting":true,"published_tasting_sizes":[5,8]}'::jsonb,
  'first_party_source',
  'https://www.domainezafeirakis.com/winetourism',
  'Domaine Zafeirakis — Winery Tours & Wine Tastings',
  timestamptz '2026-09-19 20:29:00+03',
  'The current first-party wine-tourism page publishes vineyard/winery tours and 5-wine and 8-wine tasting options.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='domaine-zafeirakis-thessaly' and field_key='visitor_offering'
    and verified_at=timestamptz '2026-09-19 20:29:00+03'
);
