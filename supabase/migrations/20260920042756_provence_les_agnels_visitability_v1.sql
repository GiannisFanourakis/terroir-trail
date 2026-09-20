
update public.producers
set
  visit_status='seasonal_public',
  visit_source_url='https://www.lesagnels.com/',
  visit_notes='Current first-party Les Agnels material publishes free public access to the distillery exhibition and producer shop from April through October with seasonal opening hours. November-March group access is by appointment. Separate July-August guided distillery visits run on scheduled French and English slots and require reservation.',
  opening_hours='Apr-May: Mon-Fri 10:00-13:00 / 14:00-17:30, Sat 10:00-13:00. Jun & Sep: Mon-Sat 10:00-13:00 / 14:00-18:00. Jul-Aug: daily 10:00-19:00. Oct: Mon-Fri 10:00-13:00 / 14:00-17:30, Sat 10:00-13:00. Nov-Mar: groups by appointment.',
  visit_booking_requirement='not_required',
  walk_in_status='accepted',
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours='{"april_may":{"monday_friday":["10:00-13:00","14:00-17:30"],"saturday":"10:00-13:00"},"june_september":{"monday_saturday":["10:00-13:00","14:00-18:00"]},"july_august":{"daily":"10:00-19:00"},"october":{"monday_friday":["10:00-13:00","14:00-17:30"],"saturday":"10:00-13:00"},"november_march":"groups_by_appointment"}'::jsonb,
  seasonal_visit_notes='Regular public exhibition/shop access is April-October. November-March groups are appointment-only. July-August guided visits require reservation and last about 60 minutes.',
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='les-agnels-provence';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'les-agnels-provence','visitor_hours',
  '{"april_may":{"monday_friday":["10:00-13:00","14:00-17:30"],"saturday":"10:00-13:00"},"june_september":{"monday_saturday":["10:00-13:00","14:00-18:00"]},"july_august":{"daily":"10:00-19:00"},"october":{"monday_friday":["10:00-13:00","14:00-17:30"],"saturday":"10:00-13:00"},"november_march":"groups_by_appointment"}'::jsonb,
  'first_party_source','https://www.lesagnels.com/','Les Agnels — official site',now(),
  'The current official site publishes these seasonal public shop/exhibition hours and winter group arrangement.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='les-agnels-provence' and field_key='visitor_hours'
    and source_url='https://www.lesagnels.com/'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'les-agnels-provence','booking_requirement',
  '{"april_october_public_access":"not_required","walk_in_status":"accepted","november_march_groups":"appointment","july_august_guided_visit":"required"}'::jsonb,
  'first_party_source','https://www.lesagnels.com/','Les Agnels — official site',now(),
  'The official material distinguishes free seasonal public access from appointment-led winter groups and reservation-required summer guided tours.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='les-agnels-provence' and field_key='booking_requirement'
    and source_url='https://www.lesagnels.com/'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'les-agnels-provence','programme_durations',
  '{"july_august_guided_visit_minutes":60}'::jsonb,
  'first_party_source','https://www.lesagnels.com/','Les Agnels — official site',now(),
  'The current summer guided-visit information states a duration of about one hour.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='les-agnels-provence' and field_key='programme_durations'
    and source_url='https://www.lesagnels.com/'
);
