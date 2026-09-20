
update public.producers
set
  visit_status='public_visits',
  visit_source_url='https://agrolaguna.hr/festigia-taste-shop/',
  visit_notes='Current first-party Agrolaguna material confirms the Festigia Taste & Shop at the verified Poreč address as a public tasting room and shop for Vina Laguna/Festigia wines, Ol Istria olive oils and Špin cheeses. Official Istrian tourism material independently lists the tasting room and free parking. Current routine opening hours and a universal booking rule are not published in the reviewed sources, so they remain unknown.',
  opening_hours='Public Festigia Taste & Shop confirmed at the mapped Poreč point; current routine hours not published in the reviewed sources.',
  visit_booking_requirement=null,
  walk_in_status=null,
  parking_status='available',
  typical_visit_minutes=null,
  visitor_hours=null,
  seasonal_visit_notes=null,
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='vina-laguna-istria';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'vina-laguna-istria','visitor_offering',
  '{"taste_and_shop":true,"wine_tasting":true,"producer_shop":true,"wine":true,"olive_oil":true,"cheese":true}'::jsonb,
  'first_party_source','https://agrolaguna.hr/festigia-taste-shop/','Agrolaguna — Festigia Taste & Shop',now(),
  'The current first-party page confirms a public tasting room and shop at Mate Vlašića 34 in Poreč.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='vina-laguna-istria' and field_key='visitor_offering'
    and source_url='https://agrolaguna.hr/festigia-taste-shop/'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'vina-laguna-istria','parking_status',
  '{"status":"available","wording":"free_parking"}'::jsonb,
  'public_listing','https://www.istra.hr/en/gourmet/wine/wine-makers/59','Istria Tourist Board — Vina Laguna / Festigia',now(),
  'The official regional wine-road listing explicitly states free parking.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='vina-laguna-istria' and field_key='parking_status'
    and source_url='https://www.istra.hr/en/gourmet/wine/wine-makers/59'
);
