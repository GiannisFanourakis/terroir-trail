begin;
set local lock_timeout = '5s';
set local statement_timeout = '30s';

alter table public.producers
  drop constraint if exists producers_category_check;

update public.producers
set category = 'distillery',
    updated_at = now()
where category = 'kazani';

update public.experiences
set category = 'distillery'
where category = 'kazani';

alter table public.producers
  add constraint producers_category_check
  check (
    category = any (
      array[
        'winery'::text,
        'distillery'::text,
        'cidery'::text,
        'confectionery'::text,
        'olive_mill'::text,
        'olive_oil_producer'::text,
        'oil_mill'::text,
        'cheese_dairy'::text,
        'apiary'::text,
        'brewery'::text,
        'farm'::text,
        'herb_farm'::text,
        'mushroom_farm'::text
      ]
    )
  );

do $$
begin
  if exists (select 1 from public.producers where category = 'kazani') then
    raise exception 'Legacy producer category kazani still exists';
  end if;

  if exists (select 1 from public.experiences where category = 'kazani') then
    raise exception 'Legacy experience category kazani still exists';
  end if;
end
$$;

commit;
