-- Puglia Visitability V1: Frantoio Muraglia.
-- Current first-party oleotourism page opens the Andria mill with 30- and
-- 50-minute experiences in Italian and English.

update public.producers
set
  visit_status = 'public_visits',
  visit_source_url = 'https://www.frantoiomuraglia.it/en/oil-is-first-encountered-olive-oil-tourism-at-our-mill-in-andria/',
  visit_notes = 'Current first-party Frantoio Muraglia oleotourism page explicitly opens the Andria mill to visitors with two experiences: a 30-minute guided tasting of four oils in the showroom and a 50-minute Journey in the Mill through the production departments followed by tasting. Both are offered in Italian and English. The site provides date/time booking flows but does not explicitly state that every visit requires advance booking or define general walk-in access. Parking details and general visitor hours are not published.',
  opening_hours = 'Bookable olive-oil experiences operate on selectable dates/times; no general visitor timetable published.',
  visit_booking_requirement = null,
  walk_in_status = null,
  parking_status = null,
  typical_visit_minutes = null,
  visitor_hours = null,
  seasonal_visit_notes = null,
  visitor_languages = array['it','en'],
  visitability_reviewed_at = now()
where id = 'frantoio-muraglia-puglia';

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'frantoio-muraglia-puglia','programme_durations',
  '{"four_oil_tasting_minutes":30,"journey_in_mill_minutes":50}'::jsonb,
  'first_party_source',
  'https://www.frantoiomuraglia.it/en/oil-is-first-encountered-olive-oil-tourism-at-our-mill-in-andria/',
  'Frantoio Muraglia — Olive oil tourism',
  now(),
  'The current official oleotourism page publishes 30-minute and 50-minute experiences at the Andria mill.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='frantoio-muraglia-puglia'
    and field_key='programme_durations'
    and source_url='https://www.frantoiomuraglia.it/en/oil-is-first-encountered-olive-oil-tourism-at-our-mill-in-andria/'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'frantoio-muraglia-puglia','visitor_languages',
  '{"languages":["it","en"],"scope":"oleotourism_experiences"}'::jsonb,
  'first_party_source',
  'https://www.frantoiomuraglia.it/en/oil-is-first-encountered-olive-oil-tourism-at-our-mill-in-andria/',
  'Frantoio Muraglia — Olive oil tourism',
  now(),
  'The current official page explicitly states both experiences are available in Italian and English.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='frantoio-muraglia-puglia'
    and field_key='visitor_languages'
    and source_url='https://www.frantoiomuraglia.it/en/oil-is-first-encountered-olive-oil-tourism-at-our-mill-in-andria/'
);

insert into public.producer_fact_evidence (
  producer_id,field_key,value_json,verification_type,source_url,source_label,verified_at,notes
)
select
  'frantoio-muraglia-puglia','visitor_offering',
  '{"guided_four_oil_tasting":true,"production_area_mill_tour":true,"showroom_tasting":true}'::jsonb,
  'first_party_source',
  'https://www.frantoiomuraglia.it/en/oil-is-first-encountered-olive-oil-tourism-at-our-mill-in-andria/',
  'Frantoio Muraglia — Olive oil tourism',
  now(),
  'The current first-party page explicitly describes both visitor experiences inside the Andria mill.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='frantoio-muraglia-puglia'
    and field_key='visitor_offering'
    and source_url='https://www.frantoiomuraglia.it/en/oil-is-first-encountered-olive-oil-tourism-at-our-mill-in-andria/'
);
