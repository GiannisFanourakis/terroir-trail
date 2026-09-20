alter table public.producers
  add column if not exists is_active boolean not null default true;

comment on column public.producers.is_active is
  'Authoritative publication flag for the public catalogue. Only active rows are exposed to public clients and synchronized into SEO/AEO outputs.';

create index if not exists producers_active_destination_category_idx
  on public.producers (destination, category)
  where is_active = true;

drop policy if exists "Public can view all producers" on public.producers;
drop policy if exists "Public can view active producers" on public.producers;

create policy "Public can view active producers"
  on public.producers
  for select
  to anon, authenticated
  using (is_active = true);
