-- Phase 10B taxonomy refinement: add a general olive-oil producer category.
-- This category does not imply that a mapped public point is an olive mill or a farm.

alter table public.producers
  drop constraint if exists producers_category_check;

alter table public.producers
  add constraint producers_category_check
  check (category = any (array[
    'winery'::text,
    'kazani'::text,
    'olive_mill'::text,
    'olive_oil_producer'::text,
    'cheese_dairy'::text,
    'apiary'::text,
    'brewery'::text,
    'farm'::text
  ]));

update public.producers
set category = 'olive_oil_producer'
where id = 'liokareas-olive-estate'
  and destination = 'peloponnese';
