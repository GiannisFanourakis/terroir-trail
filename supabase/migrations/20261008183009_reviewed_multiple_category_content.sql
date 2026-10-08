-- Align the reviewed maker classifications with source-backed copy and product fields.
-- Existing identity, coordinates, visitability and road-access facts remain authoritative.
-- The guards abort if another edit has changed a targeted field since this review.
begin;

do $guard$
declare
  expected record;
  current_value jsonb;
begin
  for expected in select * from (values
    ('la-vinyeta-catalonia', 'winery', 'tag_line', '"A young Empordà estate where vineyards and century-old olive trees form one working farm landscape"'::jsonb, '"An Empordà family estate making wine, olive oil, cheese and honey"'::jsonb),
    ('la-vinyeta-catalonia', 'winery', 'description', '"La Vinyeta is a DO Empordà winery and farm in Mollet de Peralada, surrounded by vineyards and old olive trees. The estate produces wine and olive oil and opens the property through guided tastings, vineyard visits and food-focused experiences."'::jsonb, '"La Vinyeta is a DO Empordà winery and farm in Mollet de Peralada, where vineyards, old olive trees, sheep and beehives form one working agricultural landscape. The estate makes wine, olive oil, cheese and honey; its visitor offer includes guided tastings, vineyard visits and food-focused experiences."'::jsonb),
    ('la-vinyeta-catalonia', 'winery', 'story', '"Josep and Marta began La Vinyeta while still in their early twenties, building a small estate around a commitment to the land and the Tramuntana-shaped landscape of the Empordà. Their project grew from vineyards into a broader farm identity that also includes olive oil and visitor experiences."'::jsonb, '"Josep and Marta began La Vinyeta while still in their early twenties, building a small estate around a commitment to the land and the Tramuntana-shaped landscape of the Empordà. Alongside wine, their farm produces olive oil, cheese and honey, with sheep grazing the vineyards and bees contributing to the estate''s biodiversity."'::jsonb),
    ('la-vinyeta-catalonia', 'winery', 'product_specialties', '["DO Empordà wines","Estate olive oil","Small-production and native-variety wines"]'::jsonb, '["DO Empordà wines","Estate olive oil","Small-production and native-variety wines","Estate-made cheese","Estate-made honey"]'::jsonb),
    ('kazani-stilianou', 'winery', 'tag_line', '"Five generations of natural and organic wine in Kounavoi"'::jsonb, '"Five generations of family winemaking and organic olive oil in Kounavoi"'::jsonb),
    ('kazani-stilianou', 'winery', 'story', '"The family dates its domain to 1922 and describes five generations of winemakers. The continuity is less about reproducing the past unchanged than keeping native varieties, vineyards and family-scale production at the centre while working in a contemporary natural-wine style."'::jsonb, '"The family dates its domain to 1922 and describes five generations of winemakers. Native Cretan grapes and family-scale production remain central to its natural-wine approach, alongside organically cultivated olive groves and organic extra virgin olive oil."'::jsonb),
    ('kazani-stilianou', 'winery', 'tasting_highlights', '["4-wine tasting (€10 per person)","6-wine tasting (€12 per person)","Organic olive oil tasting (€3 per person)","Cheese platter available","Local pies platter available"]'::jsonb, '["4-wine tasting (€10 per person)","6-wine tasting (€12 per person)","Organic olive oil tasting","Cheese platter available","Local pies platter available"]'::jsonb),
    ('anoskeli-estate', 'winery', 'product_specialties', 'null'::jsonb, '["Estate-grown wines","Extra virgin olive oil"]'::jsonb),
    ('anoskeli-estate', 'winery', 'tasting_highlights', 'null'::jsonb, '["Wine and olive oil from one family estate"]'::jsonb),
    ('canava-santorini-distillery', 'distillery', 'product_specialties', 'null'::jsonb, '["Ouzo","Tsikoudia"]'::jsonb),
    ('canava-santorini-distillery', 'distillery', 'tasting_highlights', '[]'::jsonb, '["Family distilling tradition since 1974","Traditional copper-still distillation"]'::jsonb),
    ('canava-santorini-distillery', 'distillery', 'product_sections', 'null'::jsonb, '[{"category":"distillery","specialties":["Ouzo","Tsikoudia"]}]'::jsonb)
  ) as reviewed(id, primary_category, field_key, previous_value, next_value) loop
    select coalesce(to_jsonb(p)->expected.field_key, 'null'::jsonb) into current_value
    from public.producers p
    where p.id = expected.id and p.category = expected.primary_category and p.is_active = true
    for update;
    if not found then
      raise exception 'Reviewed content requires active producer % with primary category %', expected.id, expected.primary_category;
    end if;
    if current_value is distinct from expected.previous_value and current_value is distinct from expected.next_value then
      raise exception 'Reviewed content changed since review: %.%', expected.id, expected.field_key;
    end if;
  end loop;
end;
$guard$;

update public.producers set
  tag_line = 'An Empordà family estate making wine, olive oil, cheese and honey',
  description = 'La Vinyeta is a DO Empordà winery and farm in Mollet de Peralada, where vineyards, old olive trees, sheep and beehives form one working agricultural landscape. The estate makes wine, olive oil, cheese and honey; its visitor offer includes guided tastings, vineyard visits and food-focused experiences.',
  story = 'Josep and Marta began La Vinyeta while still in their early twenties, building a small estate around a commitment to the land and the Tramuntana-shaped landscape of the Empordà. Alongside wine, their farm produces olive oil, cheese and honey, with sheep grazing the vineyards and bees contributing to the estate''s biodiversity.',
  product_specialties = array['DO Empordà wines', 'Estate olive oil', 'Small-production and native-variety wines', 'Estate-made cheese', 'Estate-made honey']::text[],
  updated_at = now()
where id = 'la-vinyeta-catalonia';

update public.producers set
  tag_line = 'Five generations of family winemaking and organic olive oil in Kounavoi',
  story = 'The family dates its domain to 1922 and describes five generations of winemakers. Native Cretan grapes and family-scale production remain central to its natural-wine approach, alongside organically cultivated olive groves and organic extra virgin olive oil.',
  tasting_highlights = array['4-wine tasting (€10 per person)', '6-wine tasting (€12 per person)', 'Organic olive oil tasting', 'Cheese platter available', 'Local pies platter available']::text[],
  updated_at = now()
where id = 'kazani-stilianou';

update public.producers set
  product_specialties = array['Estate-grown wines', 'Extra virgin olive oil']::text[],
  tasting_highlights = array['Wine and olive oil from one family estate']::text[],
  updated_at = now()
where id = 'anoskeli-estate';

update public.producers set
  product_specialties = array['Ouzo', 'Tsikoudia']::text[],
  tasting_highlights = array['Family distilling tradition since 1974', 'Traditional copper-still distillation']::text[],
  product_sections = '[{"category":"distillery","specialties":["Ouzo","Tsikoudia"]}]'::jsonb,
  updated_at = now()
where id = 'canava-santorini-distillery';

insert into public.producer_fact_evidence
  (producer_id, field_key, value_json, verification_type, source_url, source_label, verified_at, notes)
select reviewed.producer_id, reviewed.field_key, reviewed.value_json,
       reviewed.verification_type, reviewed.source_url, reviewed.source_label, now(),
       'Content reviewed 2026-10-08. Product and narrative fields only; no change to current visitor access or road safety. Stilianou olive-oil tasting has no quoted price because official pages conflict.'
from (values
  ('la-vinyeta-catalonia', 'tag_line', '"An Empordà family estate making wine, olive oil, cheese and honey"'::jsonb, 'first_party_source', 'https://www.lavinyeta.es/ca/noticia/12', 'Producer official website'),
  ('la-vinyeta-catalonia', 'description', '"La Vinyeta is a DO Empordà winery and farm in Mollet de Peralada, where vineyards, old olive trees, sheep and beehives form one working agricultural landscape. The estate makes wine, olive oil, cheese and honey; its visitor offer includes guided tastings, vineyard visits and food-focused experiences."'::jsonb, 'first_party_source', 'https://www.lavinyeta.es/ca/noticia/12', 'Producer official website'),
  ('la-vinyeta-catalonia', 'story', '"Josep and Marta began La Vinyeta while still in their early twenties, building a small estate around a commitment to the land and the Tramuntana-shaped landscape of the Empordà. Alongside wine, their farm produces olive oil, cheese and honey, with sheep grazing the vineyards and bees contributing to the estate''s biodiversity."'::jsonb, 'first_party_source', 'https://www.lavinyeta.es/ca/noticia/12', 'Producer official website'),
  ('la-vinyeta-catalonia', 'product_specialties', '["DO Empordà wines","Estate olive oil","Small-production and native-variety wines","Estate-made cheese","Estate-made honey"]'::jsonb, 'first_party_source', 'https://www.lavinyeta.es/ca/noticia/12', 'Producer official website'),
  ('kazani-stilianou', 'tag_line', '"Five generations of family winemaking and organic olive oil in Kounavoi"'::jsonb, 'first_party_source', 'https://stilianouwinery.com/', 'Producer official website'),
  ('kazani-stilianou', 'story', '"The family dates its domain to 1922 and describes five generations of winemakers. Native Cretan grapes and family-scale production remain central to its natural-wine approach, alongside organically cultivated olive groves and organic extra virgin olive oil."'::jsonb, 'first_party_source', 'https://stilianouwinery.com/', 'Producer official website'),
  ('kazani-stilianou', 'tasting_highlights', '["4-wine tasting (€10 per person)","6-wine tasting (€12 per person)","Organic olive oil tasting","Cheese platter available","Local pies platter available"]'::jsonb, 'first_party_source', 'https://stilianouwinery.com/', 'Producer official website'),
  ('anoskeli-estate', 'product_specialties', '["Estate-grown wines","Extra virgin olive oil"]'::jsonb, 'first_party_source', 'https://anoskeli.gr/', 'Producer official website'),
  ('anoskeli-estate', 'tasting_highlights', '["Wine and olive oil from one family estate"]'::jsonb, 'first_party_source', 'https://anoskeli.gr/', 'Producer official website'),
  ('canava-santorini-distillery', 'product_specialties', '["Ouzo","Tsikoudia"]'::jsonb, 'public_listing', 'https://www.santorini.net/canava-santorini-where-distillation-meets-history/', 'Dated public listing'),
  ('canava-santorini-distillery', 'tasting_highlights', '["Family distilling tradition since 1974","Traditional copper-still distillation"]'::jsonb, 'public_listing', 'https://www.santorini.net/canava-santorini-where-distillation-meets-history/', 'Dated public listing'),
  ('canava-santorini-distillery', 'product_sections', '[{"category":"distillery","specialties":["Ouzo","Tsikoudia"]}]'::jsonb, 'public_listing', 'https://www.santorini.net/canava-santorini-where-distillation-meets-history/', 'Dated public listing')
) as reviewed(producer_id, field_key, value_json, verification_type, source_url, source_label)
where not exists (
  select 1 from public.producer_fact_evidence existing
  where existing.producer_id = reviewed.producer_id and existing.field_key = reviewed.field_key
    and existing.value_json = reviewed.value_json and existing.source_url = reviewed.source_url
);

commit;
