
update public.producers
set
  visit_status='public_visits',
  visit_source_url='https://moarhof-hofkaeserei.it/',
  visit_notes='Current first-party Moarhof page confirms direct farm sales and a show dairy, with Monday-Friday 08:00-11:00 and 17:00-18:00, Saturday 08:00-11:00 and Sunday closed. The official Ahrntal tourism listing also invites visitors to buy directly at the farm, observe animal care and milking, and look into the dairy, and explicitly states there is parking in front of the cheese dairy. No separate advance-booking requirement or guided-tour duration is published.',
  opening_hours='Direct farm sales: Mon-Fri 08:00-11:00 & 17:00-18:00; Sat 08:00-11:00; Sun closed.',
  visit_booking_requirement='not_required',
  walk_in_status='accepted',
  parking_status='available',
  typical_visit_minutes=null,
  visitor_hours='{"direct_farm_sales":{"monday_friday":["08:00-11:00","17:00-18:00"],"saturday":"08:00-11:00","sunday":"closed"}}'::jsonb,
  seasonal_visit_notes=null,
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='moarhof-cheese-dairy-south-tyrol';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'moarhof-cheese-dairy-south-tyrol','visitor_hours',
  '{"direct_farm_sales":{"monday_friday":["08:00-11:00","17:00-18:00"],"saturday":"08:00-11:00","sunday":"closed"}}'::jsonb,
  'first_party_source','https://moarhof-hofkaeserei.it/',
  'Moarhof Hofkäserei — official site',now(),
  'The current official site publishes these hours alongside the farm contact and direct-sales information.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='moarhof-cheese-dairy-south-tyrol' and field_key='visitor_hours'
    and source_url='https://moarhof-hofkaeserei.it/'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'moarhof-cheese-dairy-south-tyrol','visitor_offering',
  '{"direct_farm_sales":true,"show_dairy":true,"milking_observation":true,"dairy_view":true}'::jsonb,
  'public_listing','https://www.ahrntal.com/de/genuss/lokale-produkte/lokale-produkte-aus-eigener-produktion/rid-8A32EA72570E109532BFE59B7F2D1CA2-p-moarhof-hofkaeserei.html',
  'Ahrntal tourism — Moarhof Hofkäserei',now(),
  'The official local tourism listing explicitly invites visitors to buy at the farm and observe aspects of the farm and dairy.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='moarhof-cheese-dairy-south-tyrol' and field_key='visitor_offering'
    and source_url='https://www.ahrntal.com/de/genuss/lokale-produkte/lokale-produkte-aus-eigener-produktion/rid-8A32EA72570E109532BFE59B7F2D1CA2-p-moarhof-hofkaeserei.html'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'moarhof-cheese-dairy-south-tyrol','parking_status',
  '{"status":"available","location":"in_front_of_cheese_dairy"}'::jsonb,
  'public_listing','https://www.ahrntal.com/de/genuss/lokale-produkte/lokale-produkte-aus-eigener-produktion/rid-8A32EA72570E109532BFE59B7F2D1CA2-p-moarhof-hofkaeserei.html',
  'Ahrntal tourism — Moarhof Hofkäserei',now(),
  'The official local tourism listing explicitly states parking is available in front of the cheese dairy.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='moarhof-cheese-dairy-south-tyrol' and field_key='parking_status'
    and source_url='https://www.ahrntal.com/de/genuss/lokale-produkte/lokale-produkte-aus-eigener-produktion/rid-8A32EA72570E109532BFE59B7F2D1CA2-p-moarhof-hofkaeserei.html'
);
