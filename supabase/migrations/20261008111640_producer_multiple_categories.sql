-- Additive taxonomy support. Existing primary categories, identities and access facts remain authoritative.
begin;

alter table public.producers
  add column if not exists additional_categories text[] not null default '{}'::text[],
  add column if not exists visitor_features text[] not null default '{}'::text[],
  add column if not exists product_sections jsonb;

alter table public.producers
  add constraint producers_additional_categories_valid check (
    additional_categories <@ array[
      'winery', 'distillery', 'cidery', 'brewery', 'olive_mill',
      'olive_oil_producer', 'oil_mill', 'cheese_dairy', 'apiary',
      'confectionery', 'herb_farm', 'mushroom_farm', 'farm'
    ]::text[]
    and array_position(additional_categories, null) is null
    and coalesce(array_ndims(additional_categories), 1) = 1
    and not (category = any(additional_categories))
  ),
  add constraint producers_visitor_features_valid check (
    visitor_features <@ array['museum', 'tasting', 'guided_tour']::text[]
    and array_position(visitor_features, null) is null
    and coalesce(array_ndims(visitor_features), 1) = 1
  ),
  add constraint producers_product_sections_array check (
    product_sections is null or jsonb_typeof(product_sections) = 'array'
  );

create index if not exists producers_additional_categories_gin
  on public.producers using gin (additional_categories);

comment on column public.producers.additional_categories is
  'Verified additional maker activities. category is the stable primary classification; one producer remains one entity and map point.';
comment on column public.producers.visitor_features is
  'Confirmed visitor features, separate from maker categories and current visitability. Empty does not establish absence. Museum is a feature, not a maker category.';
comment on column public.producers.product_sections is
  'Optional category-grouped products: array of {category, specialties, varieties?, highlights?}. Missing uses legacy specialties and highlights.';

commit;
