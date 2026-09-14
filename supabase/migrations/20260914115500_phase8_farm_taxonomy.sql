-- Phase 8: introduce first-class farm taxonomy and migrate Peskesi.
-- This migration changes only the producer category. Existing location, visit,
-- and road-access evidence remains untouched.

alter table public.producers
  drop constraint if exists producers_category_check;

alter table public.producers
  add constraint producers_category_check
  check (
    category = any (
      array[
        'winery'::text,
        'kazani'::text,
        'olive_mill'::text,
        'cheese_dairy'::text,
        'apiary'::text,
        'brewery'::text,
        'farm'::text
      ]
    )
  );

update public.producers
set category = 'farm'
where id = 'peskesi-farm-kazani'
  and category = 'kazani';
