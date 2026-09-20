
update public.producers
set
  visit_status='seasonal_public',
  visit_source_url='https://www.schmiedthof.com/de/produkte.html',
  visit_notes='Current first-party Schmiedthof page states that farm products are sold on-site from mid-May through the end of September every Thursday afternoon. Visits/purchases at other times are available by telephone arrangement. This confirms seasonal public farm-gate sales, not unrestricted production-area access.',
  opening_hours='Mid-May to end-Sep: farm sales Thu afternoon. Other times by telephone arrangement.',
  visit_booking_requirement='not_required',
  walk_in_status='accepted',
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours='{"mid_may_end_september":{"thursday":"afternoon"},"other_times":"telephone_appointment"}'::jsonb,
  seasonal_visit_notes='Regular on-site sales are seasonal from mid-May through the end of September; other times require telephone arrangement.',
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='schmiedthof-herb-farm-south-tyrol';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'schmiedthof-herb-farm-south-tyrol','visitor_hours',
  '{"mid_may_end_september":{"thursday":"afternoon"},"other_times":"telephone_appointment"}'::jsonb,
  'first_party_source','https://www.schmiedthof.com/de/produkte.html',
  'Schmiedthof — Produkte',now(),
  'The current official page publishes seasonal Thursday-afternoon farm sales and telephone-arranged access at other times.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='schmiedthof-herb-farm-south-tyrol' and field_key='visitor_hours'
    and source_url='https://www.schmiedthof.com/de/produkte.html'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'schmiedthof-herb-farm-south-tyrol','booking_requirement',
  '{"seasonal_public_sales":"not_required","walk_in_status":"accepted","other_times":"telephone_appointment"}'::jsonb,
  'first_party_source','https://www.schmiedthof.com/de/produkte.html',
  'Schmiedthof — Produkte',now(),
  'The current official page distinguishes regular seasonal farm sales from telephone-arranged access at other times.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='schmiedthof-herb-farm-south-tyrol' and field_key='booking_requirement'
    and source_url='https://www.schmiedthof.com/de/produkte.html'
);
