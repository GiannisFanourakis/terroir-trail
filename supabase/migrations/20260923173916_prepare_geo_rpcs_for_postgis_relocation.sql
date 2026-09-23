create or replace function public.get_nearby_producers(
  user_lat double precision,
  user_lng double precision,
  radius_km double precision default 30.0,
  filter_category text default null::text,
  filter_destination text default null::text,
  max_limit integer default 50
)
returns setof public.producers
language sql
stable
set search_path to 'public', 'extensions'
as $function$
  select *
  from public.producers p
  where p.location_status <> 'unresolved'
    and ST_DWithin(
      p.location::geography,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_km * 1000.0
    )
    and (filter_category is null or filter_category = 'all' or p.category = filter_category)
    and (filter_destination is null or filter_destination = 'all' or p.destination = filter_destination)
  order by ST_Distance(
    p.location::geography,
    ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
  ) asc
  limit max_limit;
$function$;

create or replace function public.get_producers_in_viewport(
  min_lat double precision,
  min_lng double precision,
  max_lat double precision,
  max_lng double precision,
  filter_category text default null::text,
  filter_destination text default null::text,
  max_limit integer default 200
)
returns setof public.producers
language sql
stable
set search_path to 'public', 'extensions'
as $function$
  select *
  from public.producers
  where location_status <> 'unresolved'
    and location && ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)
    and (filter_category is null or filter_category = 'all' or category = filter_category)
    and (filter_destination is null or filter_destination = 'all' or destination = filter_destination)
  order by rating desc, review_count desc
  limit max_limit;
$function$;
