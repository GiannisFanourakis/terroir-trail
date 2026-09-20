
update public.producers
set
  visit_status='public_visits',
  visit_source_url='https://nougats-silvain.fr/pages/le-magasin-de-saint-didier',
  visit_notes='Current first-party Silvain material confirms a year-round public shop at the Saint-Didier production location and publishes 2026 seasonal opening hours. The shop is normally open seven days a week with a midday break, subject to the published January annual closure and Christmas closures. Guided or gourmet activities are separate from ordinary shop access.',
  opening_hours='2026: Jan 10:00-12:00 & 14:00-18:00, with annual closure Jan 16-Feb 2 inclusive; Feb-May 10:00-12:00 & 14:00-18:00; Jun-Aug 10:00-12:00 & 15:00-19:00; Sep-Dec 10:00-12:00 & 14:00-18:00. Normally 7/7; Dec 25-26 closed.',
  visit_booking_requirement='not_required',
  walk_in_status='accepted',
  parking_status=null,
  typical_visit_minutes=null,
  visitor_hours='{"january":["10:00-12:00","14:00-18:00"],"annual_closure_2026":"january_16_february_2_inclusive","february_may":["10:00-12:00","14:00-18:00"],"june_august":["10:00-12:00","15:00-19:00"],"september_december":["10:00-12:00","14:00-18:00"],"usual_days":"daily","december_25_26":"closed"}'::jsonb,
  seasonal_visit_notes='2026 annual closure runs January 16 through February 2 inclusive. December 25-26 are closed. Recheck annually published hours for future travel.',
  visitor_languages=null,
  visitability_reviewed_at=now()
where id='nougats-silvain-provence';

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'nougats-silvain-provence','visitor_hours',
  '{"january":["10:00-12:00","14:00-18:00"],"annual_closure_2026":"january_16_february_2_inclusive","february_may":["10:00-12:00","14:00-18:00"],"june_august":["10:00-12:00","15:00-19:00"],"september_december":["10:00-12:00","14:00-18:00"],"usual_days":"daily","december_25_26":"closed"}'::jsonb,
  'first_party_source','https://nougats-silvain.fr/pages/infos-pratiques','Silvain — Infos pratiques',now(),
  'The current official practical-information page publishes the 2026 seasonal shop schedule and closures.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='nougats-silvain-provence' and field_key='visitor_hours'
    and source_url='https://nougats-silvain.fr/pages/infos-pratiques'
);

insert into public.producer_fact_evidence
(producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes)
select 'nougats-silvain-provence','booking_requirement',
  '{"general_shop_access":"not_required","walk_in_status":"accepted","guided_activities":"separate"}'::jsonb,
  'first_party_source','https://nougats-silvain.fr/pages/le-magasin-de-saint-didier','Silvain — Magasin de Saint-Didier',now(),
  'The producer publishes regular public shop access at the production location; guided activities are presented separately.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='nougats-silvain-provence' and field_key='booking_requirement'
    and source_url='https://nougats-silvain.fr/pages/le-magasin-de-saint-didier'
);
