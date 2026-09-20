
update public.producers
set
  visit_status='appointment_only',
  visit_source_url='https://kocbek.si/en/kocbek-oil-mill-tasting-dosivettes-and-tours',
  visit_notes='Current first-party Kocbek experience page publishes guided oil-mill tours, tastings and culinary experiences and explicitly states that groups are accepted Monday-Saturday mornings by prior arrangement. Booking is required by phone or email. General business hours on the contact page are kept separate from the tour schedule.',
  opening_hours='Guided mill experiences: Mon-Sat mornings by prior arrangement.',
  visit_booking_requirement='required',
  walk_in_status='not_accepted',
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours='{"guided_experiences":{"monday_saturday":"morning","booking":"required"}}'::jsonb,
  seasonal_visit_notes=null,
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='oljarna-kocbek-pomurska';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'oljarna-kocbek-pomurska','booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted","mechanism":["phone","email"]}'::jsonb,
  'first_party_source','https://kocbek.si/en/kocbek-oil-mill-tasting-dosivettes-and-tours',
  'Oljarna Kocbek — Tasting experiences and tours',now(),
  'The current official page explicitly states booking is required.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='oljarna-kocbek-pomurska' and field_key='booking_requirement'
    and source_url='https://kocbek.si/en/kocbek-oil-mill-tasting-dosivettes-and-tours'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'oljarna-kocbek-pomurska','visitor_hours',
  '{"guided_experiences":{"monday_saturday":"morning","booking":"required"}}'::jsonb,
  'first_party_source','https://kocbek.si/en/kocbek-oil-mill-tasting-dosivettes-and-tours',
  'Oljarna Kocbek — Tasting experiences and tours',now(),
  'The current official page states groups are accepted Monday-Saturday mornings by prior arrangement.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='oljarna-kocbek-pomurska' and field_key='visitor_hours'
    and source_url='https://kocbek.si/en/kocbek-oil-mill-tasting-dosivettes-and-tours'
);
