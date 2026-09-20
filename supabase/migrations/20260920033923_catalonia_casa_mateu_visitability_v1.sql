
update public.producers
set
  visit_status='public_visits',
  visit_source_url='https://www.formatgeriacasamateu.com/es/',
  visit_notes='Current first-party Casa Mateu site confirms an on-site shop in Surp. The current Spanish page publishes July-August shop hours Monday-Saturday 10:00-14:00 and 17:00-20:00. This supports public shop access only; no public dairy-production tour, tasting programme or unrestricted production access is published. Hours outside July-August are not currently stated.',
  opening_hours='On-site shop: Jul-Aug Mon-Sat 10:00-14:00 and 17:00-20:00. Other-season hours not currently published.',
  visit_booking_requirement='not_required',
  walk_in_status='accepted',
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours='{"shop":{"july_august":{"monday_saturday":["10:00-14:00","17:00-20:00"]}}}'::jsonb,
  seasonal_visit_notes='Public access confirmed for the on-site shop only; production-area visits are not published.',
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='formatgeria-casa-mateu-catalonia';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'formatgeria-casa-mateu-catalonia','visitor_hours',
  '{"shop":{"july_august":{"monday_saturday":["10:00-14:00","17:00-20:00"]}}}'::jsonb,
  'first_party_source','https://www.formatgeriacasamateu.com/es/',
  'Formatgeria Casa Mateu — on-site shop',now(),
  'The current Spanish first-party page publishes these July-August shop hours.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='formatgeria-casa-mateu-catalonia' and field_key='visitor_hours'
    and source_url='https://www.formatgeriacasamateu.com/es/'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'formatgeria-casa-mateu-catalonia','booking_requirement',
  '{"general_shop_access":"not_required","walk_in_status":"accepted","production_access":"not_published"}'::jsonb,
  'first_party_source','https://www.formatgeriacasamateu.com/es/',
  'Formatgeria Casa Mateu — on-site shop',now(),
  'Published shop hours support ordinary shop access; no production-tour access is claimed.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='formatgeria-casa-mateu-catalonia' and field_key='booking_requirement'
    and source_url='https://www.formatgeriacasamateu.com/es/'
);
