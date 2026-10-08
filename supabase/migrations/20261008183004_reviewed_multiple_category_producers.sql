-- Reviewed maker classifications for existing active catalogue IDs. No new listings or access changes.
-- Canava museum uses a dated public listing; its current visitability is unchanged.
begin;

do $guard$
declare expected record;
begin
  for expected in select * from (values
    ('anoskeli-estate', 'winery'),
    ('tyrnavos-winery-cooperative-thessaly', 'winery'),
    ('tsililis-theopetra-thessaly', 'winery'),
    ('hardanger-saft-siderfabrikk-vestland', 'cidery'),
    ('ipsa-istria', 'olive_mill'),
    ('herdade-do-esporao-alentejo', 'winery'),
    ('kazani-stilianou', 'winery'),
    ('fattoria-corzano-e-paterno-tuscany', 'winery'),
    ('cascina-barroero-piedmont', 'farm'),
    ('la-vinyeta-catalonia', 'winery'),
    ('canava-santorini-distillery', 'distillery')
  ) as reviewed(id, primary_category) loop
    perform 1 from public.producers
      where id = expected.id and category = expected.primary_category and is_active = true
      for update;
    if not found then
      raise exception 'Reviewed classification requires active producer % with primary category %', expected.id, expected.primary_category;
    end if;
  end loop;
end;
$guard$;

update public.producers as p set
  additional_categories = array(select value from unnest(p.additional_categories || array['olive_mill']::text[]) with ordinality as members(value, ordinal) where value <> p.category group by value order by min(ordinal)),
  visitor_features = array(select value from unnest(p.visitor_features || array['tasting']::text[]) with ordinality as features(value, ordinal) group by value order by min(ordinal)),
  product_sections = '[{"category":"winery","specialties":["Estate-grown wines"]},{"category":"olive_mill","specialties":["Extra virgin olive oil"]}]'::jsonb,
  updated_at = now()
where p.id = 'anoskeli-estate';

insert into public.producer_fact_evidence
  (producer_id, field_key, value_json, verification_type, source_url, source_label, verified_at, notes)
select 'anoskeli-estate', 'additional_categories.olive_mill', '"olive_mill"'::jsonb, 'first_party_source', 'https://anoskeli.gr/', 'Producer official website', '2026-10-08T00:00:00Z'::timestamptz, 'Maker classification reviewed 2026-10-08; primary category, location and visiting facts are unchanged.'
where not exists (select 1 from public.producer_fact_evidence where producer_id = 'anoskeli-estate' and field_key = 'additional_categories.olive_mill' and value_json = '"olive_mill"'::jsonb and source_url = 'https://anoskeli.gr/');

insert into public.producer_fact_evidence
  (producer_id, field_key, value_json, verification_type, source_url, source_label, verified_at, notes)
select 'anoskeli-estate', 'visitor_features.tasting', '"tasting"'::jsonb, 'first_party_source', 'https://anoskeli.gr/experiences', 'Producer official website', '2026-10-08T00:00:00Z'::timestamptz, 'Visitor feature reviewed 2026-10-08; existing visitability and booking status are unchanged.'
where not exists (select 1 from public.producer_fact_evidence where producer_id = 'anoskeli-estate' and field_key = 'visitor_features.tasting' and value_json = '"tasting"'::jsonb and source_url = 'https://anoskeli.gr/experiences');

update public.producers as p set
  additional_categories = array(select value from unnest(p.additional_categories || array['distillery']::text[]) with ordinality as members(value, ordinal) where value <> p.category group by value order by min(ordinal)),
  product_sections = '[{"category":"winery","specialties":["PGI Tyrnavos wines","Moschato Tyrnavou wines","Grape must products"],"varieties":["Moschato Tyrnavou","Roditis","Assyrtiko","Bantiki","Malagousia","Limniona","Xinomavro"]},{"category":"distillery","specialties":["Tsipouro of Tyrnavos","Ouzo of Tyrnavos","Oak-aged tsipouro"]}]'::jsonb,
  updated_at = now()
where p.id = 'tyrnavos-winery-cooperative-thessaly';

insert into public.producer_fact_evidence
  (producer_id, field_key, value_json, verification_type, source_url, source_label, verified_at, notes)
select 'tyrnavos-winery-cooperative-thessaly', 'additional_categories.distillery', '"distillery"'::jsonb, 'first_party_source', 'https://www.tirnavoswinery.gr/en/the-cooperative/', 'Producer official website', '2026-10-08T00:00:00Z'::timestamptz, 'Maker classification reviewed 2026-10-08; primary category, location and visiting facts are unchanged.'
where not exists (select 1 from public.producer_fact_evidence where producer_id = 'tyrnavos-winery-cooperative-thessaly' and field_key = 'additional_categories.distillery' and value_json = '"distillery"'::jsonb and source_url = 'https://www.tirnavoswinery.gr/en/the-cooperative/');

update public.producers as p set
  additional_categories = array(select value from unnest(p.additional_categories || array['distillery']::text[]) with ordinality as members(value, ordinal) where value <> p.category group by value order by min(ordinal)),
  product_sections = '[{"category":"winery","specialties":["Theopetra Estate wines"],"varieties":["Limniona","Xinomavro","Malagousia","Assyrtiko"]},{"category":"distillery","specialties":["Tsililis Tsipouro","Dark Cave aged grape distillate","Greek grape spirits"]}]'::jsonb,
  updated_at = now()
where p.id = 'tsililis-theopetra-thessaly';

insert into public.producer_fact_evidence
  (producer_id, field_key, value_json, verification_type, source_url, source_label, verified_at, notes)
select 'tsililis-theopetra-thessaly', 'additional_categories.distillery', '"distillery"'::jsonb, 'first_party_source', 'https://www.tsililis.gr/english/episkepsi5bee.html?cat=0&id=1055', 'Producer official website', '2026-10-08T00:00:00Z'::timestamptz, 'Maker classification reviewed 2026-10-08; primary category, location and visiting facts are unchanged.'
where not exists (select 1 from public.producer_fact_evidence where producer_id = 'tsililis-theopetra-thessaly' and field_key = 'additional_categories.distillery' and value_json = '"distillery"'::jsonb and source_url = 'https://www.tsililis.gr/english/episkepsi5bee.html?cat=0&id=1055');

update public.producers as p set
  additional_categories = array(select value from unnest(p.additional_categories || array['distillery']::text[]) with ordinality as members(value, ordinal) where value <> p.category group by value order by min(ordinal)),
  product_sections = '[{"category":"cidery","specialties":["Hardanger cider","Spontaneously fermented cider","Apple juice","Alcohol-free cider"],"varieties":["Gravenstein","Summerred","Discovery","Aroma"]},{"category":"distillery","specialties":["Apple brandy","Aquavit"]}]'::jsonb,
  updated_at = now()
where p.id = 'hardanger-saft-siderfabrikk-vestland';

insert into public.producer_fact_evidence
  (producer_id, field_key, value_json, verification_type, source_url, source_label, verified_at, notes)
select 'hardanger-saft-siderfabrikk-vestland', 'additional_categories.distillery', '"distillery"'::jsonb, 'first_party_source', 'https://hardangersider.no/om-oss/', 'Producer official website', '2026-10-08T00:00:00Z'::timestamptz, 'Maker classification reviewed 2026-10-08; primary category, location and visiting facts are unchanged.'
where not exists (select 1 from public.producer_fact_evidence where producer_id = 'hardanger-saft-siderfabrikk-vestland' and field_key = 'additional_categories.distillery' and value_json = '"distillery"'::jsonb and source_url = 'https://hardangersider.no/om-oss/');

update public.producers as p set
  additional_categories = array(select value from unnest(p.additional_categories || array['winery']::text[]) with ordinality as members(value, ordinal) where value <> p.category group by value order by min(ordinal)),
  product_sections = '[{"category":"olive_mill","specialties":["Frantoio EVOO","Leccino EVOO","Istarska Bjelica EVOO","Ipša Selekcija EVOO"],"varieties":["Istarska bjelica","Buža","Rosinjola","Karbonaca"]},{"category":"winery","specialties":["Istrian wines","Malvazija wines","Teran wines"],"varieties":["Istarska malvazija","Teran","Refošk"]}]'::jsonb,
  updated_at = now()
where p.id = 'ipsa-istria';

insert into public.producer_fact_evidence
  (producer_id, field_key, value_json, verification_type, source_url, source_label, verified_at, notes)
select 'ipsa-istria', 'additional_categories.winery', '"winery"'::jsonb, 'first_party_source', 'https://ipsa-maslinovaulja.com/en/proizvodnja/', 'Producer official website', '2026-10-08T00:00:00Z'::timestamptz, 'Maker classification reviewed 2026-10-08; primary category, location and visiting facts are unchanged.'
where not exists (select 1 from public.producer_fact_evidence where producer_id = 'ipsa-istria' and field_key = 'additional_categories.winery' and value_json = '"winery"'::jsonb and source_url = 'https://ipsa-maslinovaulja.com/en/proizvodnja/');

update public.producers as p set
  additional_categories = array(select value from unnest(p.additional_categories || array['olive_mill']::text[]) with ordinality as members(value, ordinal) where value <> p.category group by value order by min(ordinal)),
  product_sections = '[{"category":"winery","specialties":["Alentejo wines","Organic estate wines","Single-variety wines"]},{"category":"olive_mill","specialties":["Estate extra virgin olive oil"]}]'::jsonb,
  updated_at = now()
where p.id = 'herdade-do-esporao-alentejo';

insert into public.producer_fact_evidence
  (producer_id, field_key, value_json, verification_type, source_url, source_label, verified_at, notes)
select 'herdade-do-esporao-alentejo', 'additional_categories.olive_mill', '"olive_mill"'::jsonb, 'first_party_source', 'https://esporao.com/en/the-olive-groves', 'Producer official website', '2026-10-08T00:00:00Z'::timestamptz, 'Maker classification reviewed 2026-10-08; primary category, location and visiting facts are unchanged.'
where not exists (select 1 from public.producer_fact_evidence where producer_id = 'herdade-do-esporao-alentejo' and field_key = 'additional_categories.olive_mill' and value_json = '"olive_mill"'::jsonb and source_url = 'https://esporao.com/en/the-olive-groves');

update public.producers as p set
  additional_categories = array(select value from unnest(p.additional_categories || array['olive_oil_producer']::text[]) with ordinality as members(value, ordinal) where value <> p.category group by value order by min(ordinal)),
  product_sections = '[{"category":"winery","specialties":["Natural and bio-organic wines","Cretan indigenous grape varieties"],"varieties":["Vidiano","Thrapsathiri","Vilana","Kotsifali","Mandilari"]},{"category":"olive_oil_producer","specialties":["Organic extra virgin olive oil"]}]'::jsonb,
  updated_at = now()
where p.id = 'kazani-stilianou';

insert into public.producer_fact_evidence
  (producer_id, field_key, value_json, verification_type, source_url, source_label, verified_at, notes)
select 'kazani-stilianou', 'additional_categories.olive_oil_producer', '"olive_oil_producer"'::jsonb, 'first_party_source', 'https://stilianouwinery.com/', 'Producer official website', '2026-10-08T00:00:00Z'::timestamptz, 'Maker classification reviewed 2026-10-08; primary category, location and visiting facts are unchanged.'
where not exists (select 1 from public.producer_fact_evidence where producer_id = 'kazani-stilianou' and field_key = 'additional_categories.olive_oil_producer' and value_json = '"olive_oil_producer"'::jsonb and source_url = 'https://stilianouwinery.com/');

update public.producers as p set
  additional_categories = array(select value from unnest(p.additional_categories || array['cheese_dairy', 'olive_oil_producer']::text[]) with ordinality as members(value, ordinal) where value <> p.category group by value order by min(ordinal)),
  product_sections = '[{"category":"winery","specialties":["Estate wines"],"varieties":["Sangiovese","Canaiolo","Malvasia","Trebbiano"]},{"category":"cheese_dairy","specialties":["Artisan sheep''s-milk cheeses"]},{"category":"olive_oil_producer","specialties":["Extra virgin olive oil"]}]'::jsonb,
  updated_at = now()
where p.id = 'fattoria-corzano-e-paterno-tuscany';

insert into public.producer_fact_evidence
  (producer_id, field_key, value_json, verification_type, source_url, source_label, verified_at, notes)
select 'fattoria-corzano-e-paterno-tuscany', 'additional_categories.cheese_dairy', '"cheese_dairy"'::jsonb, 'first_party_source', 'https://www.corzanoepaterno.com/en/cheese/', 'Producer official website', '2026-10-08T00:00:00Z'::timestamptz, 'Maker classification reviewed 2026-10-08; primary category, location and visiting facts are unchanged.'
where not exists (select 1 from public.producer_fact_evidence where producer_id = 'fattoria-corzano-e-paterno-tuscany' and field_key = 'additional_categories.cheese_dairy' and value_json = '"cheese_dairy"'::jsonb and source_url = 'https://www.corzanoepaterno.com/en/cheese/');

insert into public.producer_fact_evidence
  (producer_id, field_key, value_json, verification_type, source_url, source_label, verified_at, notes)
select 'fattoria-corzano-e-paterno-tuscany', 'additional_categories.olive_oil_producer', '"olive_oil_producer"'::jsonb, 'first_party_source', 'https://www.corzanoepaterno.com/vendita-olio-extra-vergine-di-oliva/', 'Producer official website', '2026-10-08T00:00:00Z'::timestamptz, 'Maker classification reviewed 2026-10-08; primary category, location and visiting facts are unchanged.'
where not exists (select 1 from public.producer_fact_evidence where producer_id = 'fattoria-corzano-e-paterno-tuscany' and field_key = 'additional_categories.olive_oil_producer' and value_json = '"olive_oil_producer"'::jsonb and source_url = 'https://www.corzanoepaterno.com/vendita-olio-extra-vergine-di-oliva/');

update public.producers as p set
  additional_categories = array(select value from unnest(p.additional_categories || array['confectionery', 'apiary']::text[]) with ordinality as members(value, ordinal) where value <> p.category group by value order by min(ordinal)),
  product_sections = '[{"category":"farm","specialties":["Nocciola Piemonte IGP","Roasted hazelnuts","Hazelnut flour","Hazelnut granella","100% hazelnut paste"]},{"category":"confectionery","specialties":["Gianduja creams","Hazelnut pastries"]},{"category":"apiary","specialties":["Seasonal honey"]}]'::jsonb,
  updated_at = now()
where p.id = 'cascina-barroero-piedmont';

insert into public.producer_fact_evidence
  (producer_id, field_key, value_json, verification_type, source_url, source_label, verified_at, notes)
select 'cascina-barroero-piedmont', 'additional_categories.confectionery', '"confectionery"'::jsonb, 'first_party_source', 'https://www.barroero.it/en/patisserie/', 'Producer official website', '2026-10-08T00:00:00Z'::timestamptz, 'Maker classification reviewed 2026-10-08; primary category, location and visiting facts are unchanged.'
where not exists (select 1 from public.producer_fact_evidence where producer_id = 'cascina-barroero-piedmont' and field_key = 'additional_categories.confectionery' and value_json = '"confectionery"'::jsonb and source_url = 'https://www.barroero.it/en/patisserie/');

insert into public.producer_fact_evidence
  (producer_id, field_key, value_json, verification_type, source_url, source_label, verified_at, notes)
select 'cascina-barroero-piedmont', 'additional_categories.apiary', '"apiary"'::jsonb, 'first_party_source', 'https://www.barroero.it/', 'Producer official website', '2026-10-08T00:00:00Z'::timestamptz, 'Maker classification reviewed 2026-10-08; primary category, location and visiting facts are unchanged.'
where not exists (select 1 from public.producer_fact_evidence where producer_id = 'cascina-barroero-piedmont' and field_key = 'additional_categories.apiary' and value_json = '"apiary"'::jsonb and source_url = 'https://www.barroero.it/');

update public.producers as p set
  additional_categories = array(select value from unnest(p.additional_categories || array['olive_oil_producer', 'cheese_dairy', 'apiary']::text[]) with ordinality as members(value, ordinal) where value <> p.category group by value order by min(ordinal)),
  product_sections = '[{"category":"winery","specialties":["DO Empordà wines","Small-production and native-variety wines"],"varieties":["Carinyena"]},{"category":"olive_oil_producer","specialties":["Estate olive oil"]},{"category":"cheese_dairy","specialties":["Estate-made cheese"]},{"category":"apiary","specialties":["Estate-made honey"]}]'::jsonb,
  updated_at = now()
where p.id = 'la-vinyeta-catalonia';

insert into public.producer_fact_evidence
  (producer_id, field_key, value_json, verification_type, source_url, source_label, verified_at, notes)
select 'la-vinyeta-catalonia', 'additional_categories.olive_oil_producer', '"olive_oil_producer"'::jsonb, 'first_party_source', 'https://www.lavinyeta.es/ca/lots/5/lot-costa-brava', 'Producer official website', '2026-10-08T00:00:00Z'::timestamptz, 'Maker classification reviewed 2026-10-08; primary category, location and visiting facts are unchanged.'
where not exists (select 1 from public.producer_fact_evidence where producer_id = 'la-vinyeta-catalonia' and field_key = 'additional_categories.olive_oil_producer' and value_json = '"olive_oil_producer"'::jsonb and source_url = 'https://www.lavinyeta.es/ca/lots/5/lot-costa-brava');

insert into public.producer_fact_evidence
  (producer_id, field_key, value_json, verification_type, source_url, source_label, verified_at, notes)
select 'la-vinyeta-catalonia', 'additional_categories.cheese_dairy', '"cheese_dairy"'::jsonb, 'first_party_source', 'https://www.lavinyeta.es/ca/lots/5/lot-costa-brava', 'Producer official website', '2026-10-08T00:00:00Z'::timestamptz, 'Maker classification reviewed 2026-10-08; primary category, location and visiting facts are unchanged.'
where not exists (select 1 from public.producer_fact_evidence where producer_id = 'la-vinyeta-catalonia' and field_key = 'additional_categories.cheese_dairy' and value_json = '"cheese_dairy"'::jsonb and source_url = 'https://www.lavinyeta.es/ca/lots/5/lot-costa-brava');

insert into public.producer_fact_evidence
  (producer_id, field_key, value_json, verification_type, source_url, source_label, verified_at, notes)
select 'la-vinyeta-catalonia', 'additional_categories.apiary', '"apiary"'::jsonb, 'first_party_source', 'https://www.lavinyeta.es/ca/noticia/12', 'Producer official website', '2026-10-08T00:00:00Z'::timestamptz, 'Maker classification reviewed 2026-10-08; primary category, location and visiting facts are unchanged.'
where not exists (select 1 from public.producer_fact_evidence where producer_id = 'la-vinyeta-catalonia' and field_key = 'additional_categories.apiary' and value_json = '"apiary"'::jsonb and source_url = 'https://www.lavinyeta.es/ca/noticia/12');

update public.producers as p set
  additional_categories = array(select value from unnest(p.additional_categories || array[]::text[]) with ordinality as members(value, ordinal) where value <> p.category group by value order by min(ordinal)),
  visitor_features = array(select value from unnest(p.visitor_features || array['museum']::text[]) with ordinality as features(value, ordinal) group by value order by min(ordinal)),
  updated_at = now()
where p.id = 'canava-santorini-distillery';

insert into public.producer_fact_evidence
  (producer_id, field_key, value_json, verification_type, source_url, source_label, verified_at, notes)
select 'canava-santorini-distillery', 'visitor_features.museum', '"museum"'::jsonb, 'public_listing', 'https://www.santorini.net/canava-santorini-where-distillation-meets-history/', 'Dated public listing', '2026-10-08T00:00:00Z'::timestamptz, 'Museum documented in public listing published 2025-07-17. This does not establish current opening hours or visitor access.'
where not exists (select 1 from public.producer_fact_evidence where producer_id = 'canava-santorini-distillery' and field_key = 'visitor_features.museum' and value_json = '"museum"'::jsonb and source_url = 'https://www.santorini.net/canava-santorini-where-distillation-meets-history/');

commit;
