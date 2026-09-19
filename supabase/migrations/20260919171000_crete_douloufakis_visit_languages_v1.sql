-- Crete Visitability V1: Douloufakis visit languages.
-- Visitor languages represent languages in which the actual tasting/visit can
-- be delivered, not merely languages spoken generally on site.

update public.producers
set visitor_languages = array['el','en']
where id = 'douloufakis-winery';

insert into public.producer_fact_evidence (
  producer_id, field_key, value_json, verification_type,
  source_url, source_label, verified_at, notes
)
select
  'douloufakis-winery',
  'visitor_languages',
  '{"languages":["el","en"],"scope":"tasting_experiences"}'::jsonb,
  'first_party_source',
  'https://douloufakis.wine/en/wine-tasting-experience-tour/',
  'Douloufakis Winery — Wine Tasting Experiences',
  timestamptz '2026-09-19 00:00:00+03',
  'Current tasting-experience pages explicitly list Greek and English. General spoken-language information is not promoted into the visit-language field.'
where not exists (
  select 1 from public.producer_fact_evidence
  where producer_id='douloufakis-winery'
    and field_key='visitor_languages'
    and verified_at=timestamptz '2026-09-19 00:00:00+03'
);
