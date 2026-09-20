
update public.producers
set
  visit_status='appointment_only',
  visit_source_url='https://esporao.com/en/tourism/herdade-do-esporao-visit',
  visit_notes='Current first-party Esporão page publishes a two-hour guided Herdade do Esporão vineyard/winery visit with tasting. Classic visits are scheduled at 11:00 in English and 12:00/16:00 in Portuguese; Premium tasting visits at 15:00. Reservations are made by email and are explicitly subject to confirmation of availability.',
  opening_hours='Guided visits: Classic 11:00 EN, 12:00 & 16:00 PT; Premium 15:00. Reservation required and subject to confirmation.',
  visit_booking_requirement='required',
  walk_in_status='not_accepted',
  parking_status=null,
  typical_visit_minutes=120,
  visitor_hours='{"classic":{"english":"11:00","portuguese":["12:00","16:00"]},"premium":"15:00"}'::jsonb,
  seasonal_visit_notes=null,
  visitor_languages=array['en','pt'],
  visitability_reviewed_at=now()
where id='herdade-do-esporao-alentejo';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'herdade-do-esporao-alentejo','booking_requirement',
  '{"required":true,"walk_in_status":"not_accepted","subject_to_confirmation":true}'::jsonb,
  'first_party_source','https://esporao.com/en/tourism/herdade-do-esporao-visit','Esporão — Herdade do Esporão Visit',now(),
  'The current official page directs reservations by email and states booking is subject to confirmation of availability.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='herdade-do-esporao-alentejo' and field_key='booking_requirement'
    and source_url='https://esporao.com/en/tourism/herdade-do-esporao-visit'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'herdade-do-esporao-alentejo','typical_visit_minutes',
  '{"minutes":120,"scope":"guided_estate_winery_visit"}'::jsonb,
  'first_party_source','https://esporao.com/en/tourism/herdade-do-esporao-visit','Esporão — Herdade do Esporão Visit',now(),
  'The current official page publishes a two-hour duration.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='herdade-do-esporao-alentejo' and field_key='typical_visit_minutes'
    and source_url='https://esporao.com/en/tourism/herdade-do-esporao-visit'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'herdade-do-esporao-alentejo','visitor_languages',
  '{"languages":["en","pt"],"scope":"published_classic_visit_slots"}'::jsonb,
  'first_party_source','https://esporao.com/en/tourism/herdade-do-esporao-visit','Esporão — Herdade do Esporão Visit',now(),
  'The current official schedule explicitly labels English and Portuguese visit slots.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='herdade-do-esporao-alentejo' and field_key='visitor_languages'
    and source_url='https://esporao.com/en/tourism/herdade-do-esporao-visit'
);
