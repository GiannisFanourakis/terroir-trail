-- Phase 13: category-neutral producer product taxonomy.
-- Unknown remains NULL. No existing producer claim is inferred or backfilled.

alter table public.producers
  add column if not exists product_specialties text[];

comment on column public.producers.product_specialties is
  'Source-backed producer products or specialties. Nullable by design; do not infer from category, geography, or business name.';
