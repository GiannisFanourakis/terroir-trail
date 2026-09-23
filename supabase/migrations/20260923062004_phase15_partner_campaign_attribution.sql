-- Phase 15 Block B: Partner campaign attribution.
-- Applied to production as Supabase migration 20260923062004.
-- Extends the existing first-party analytics contract without changing
-- organic producer ranking, safety facts or public catalogue authority.

alter table analytics.intent_events
  add column if not exists partner_campaign_id uuid,
  add column if not exists partner_placement text,
  add column if not exists partner_action text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'analytics.intent_events'::regclass
      and conname = 'intent_events_partner_campaign_fk'
  ) then
    alter table analytics.intent_events
      add constraint intent_events_partner_campaign_fk
      foreign key (partner_campaign_id)
      references public.commercial_partner_campaigns(id)
      on update cascade on delete restrict;
  end if;
end $$;

alter table analytics.intent_events
  drop constraint if exists intent_events_event_name,
  drop constraint if exists intent_events_auth_required,
  drop constraint if exists intent_events_producer_context,
  drop constraint if exists intent_events_source_surface_compatibility,
  drop constraint if exists intent_events_partner_placement,
  drop constraint if exists intent_events_partner_action,
  drop constraint if exists intent_events_partner_context;

alter table analytics.intent_events
  add constraint intent_events_event_name check (
    event_name = any (array[
      'producer_view','producer_share','region_open','region_producers_view',
      'producer_save','producer_unsave',
      'producer_website_click','producer_phone_click','producer_email_click','directions_click',
      'trip_created','trip_renamed','trip_producer_added','trip_producer_removed',
      'trip_item_reordered','trip_day_assigned','trip_opened',
      'passport_stamp_added','passport_stamp_removed',
      'affiliate_impression','affiliate_click',
      'partner_impression','partner_open','partner_save','partner_trip_add','partner_contact_action'
    ]::text[])
  ),
  add constraint intent_events_auth_required check (
    event_name <> all (array[
      'producer_save','producer_unsave',
      'trip_created','trip_renamed','trip_producer_added','trip_producer_removed',
      'trip_item_reordered','trip_day_assigned','trip_opened',
      'passport_stamp_added','passport_stamp_removed',
      'partner_save','partner_trip_add'
    ]::text[])
    or actor_scope = 'authenticated'
  ),
  add constraint intent_events_producer_context check (
    (
      event_name = any (array[
        'producer_view','producer_share','producer_save','producer_unsave',
        'producer_website_click','producer_phone_click','producer_email_click','directions_click',
        'trip_producer_added','trip_producer_removed',
        'passport_stamp_added','passport_stamp_removed',
        'partner_impression','partner_open','partner_save','partner_trip_add','partner_contact_action'
      ]::text[])
      and producer_id is not null
    )
    or
    (
      event_name <> all (array[
        'producer_view','producer_share','producer_save','producer_unsave',
        'producer_website_click','producer_phone_click','producer_email_click','directions_click',
        'trip_producer_added','trip_producer_removed',
        'passport_stamp_added','passport_stamp_removed',
        'partner_impression','partner_open','partner_save','partner_trip_add','partner_contact_action'
      ]::text[])
      and producer_id is null
    )
  ),
  add constraint intent_events_partner_placement check (
    partner_placement is null or partner_placement in ('region_discovery','trip_preparation')
  ),
  add constraint intent_events_partner_action check (
    partner_action is null or partner_action in ('website','phone','email','directions')
  ),
  add constraint intent_events_partner_context check (
    (
      event_name = any (array[
        'partner_impression','partner_open','partner_save','partner_trip_add','partner_contact_action'
      ]::text[])
      and partner_campaign_id is not null
      and partner_placement is not null
      and affiliate_campaign is null
      and (
        (event_name = 'partner_contact_action' and partner_action is not null)
        or
        (event_name <> 'partner_contact_action' and partner_action is null)
      )
    )
    or
    (
      event_name <> all (array[
        'partner_impression','partner_open','partner_save','partner_trip_add','partner_contact_action'
      ]::text[])
      and partner_campaign_id is null
      and partner_placement is null
      and partner_action is null
    )
  ),
  add constraint intent_events_source_surface_compatibility check (
    ((event_name = 'producer_view') and source_surface = any (array[
      'producer_list_card','map_marker','map_quick_card','deep_link','favorites','passport','region_drawer','trip_workspace'
    ]::text[]))
    or ((event_name = 'producer_share') and source_surface = any (array['producer_drawer','map_quick_card','trip_workspace']::text[]))
    or ((event_name = 'region_open') and source_surface = any (array['map_canvas','header_region_picker']::text[]))
    or ((event_name = 'region_producers_view') and source_surface = 'region_drawer')
    or ((event_name = 'producer_save') and source_surface = any (array['producer_drawer','producer_list_card','map_quick_card']::text[]))
    or ((event_name = 'producer_unsave') and source_surface = any (array['producer_drawer','favorites','producer_list_card','map_quick_card']::text[]))
    or ((event_name = any (array['producer_website_click','producer_phone_click','producer_email_click']::text[]))
        and source_surface = any (array['producer_drawer','trip_workspace']::text[]))
    or ((event_name = 'directions_click') and source_surface = any (array['producer_drawer','map_quick_card','trip_workspace']::text[]))
    or ((event_name = 'trip_created') and source_surface = any (array['trip_add_flow','my_trips','profile_menu']::text[]))
    or ((event_name = 'trip_renamed') and source_surface = 'trip_workspace')
    or ((event_name = 'trip_producer_added') and source_surface = any (array['trip_add_flow','producer_drawer','trip_workspace']::text[]))
    or ((event_name = any (array['trip_producer_removed','trip_item_reordered','trip_day_assigned']::text[]))
        and source_surface = 'trip_workspace')
    or ((event_name = 'trip_opened') and source_surface = any (array['my_trips','profile_menu']::text[]))
    or ((event_name = any (array['passport_stamp_added','passport_stamp_removed']::text[]))
        and source_surface = any (array['producer_drawer','passport']::text[]))
    or ((event_name = any (array['affiliate_impression','affiliate_click']::text[]))
        and source_surface = any (array['map_affiliate_banner','trip_preparation','region_planning']::text[]))
    or ((event_name = any (array['partner_impression','partner_open']::text[]))
        and source_surface = any (array['region_planning','trip_preparation']::text[]))
    or ((event_name = 'partner_save') and source_surface = 'producer_drawer')
    or ((event_name = 'partner_trip_add') and source_surface = 'trip_add_flow')
    or ((event_name = 'partner_contact_action') and source_surface = any (array['producer_drawer','trip_workspace']::text[]))
  );

create or replace function analytics.enrich_intent_event_context()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_destination text;
  v_country_code text;
  v_category text;
  v_campaign_active boolean;
  v_partner_producer_id text;
  v_partner_campaign_status text;
  v_partner_account_status text;
  v_partner_starts_at timestamptz;
  v_partner_ends_at timestamptz;
begin
  if new.producer_id is not null then
    select p.destination, p.country_code, p.category
      into v_destination, v_country_code, v_category
    from public.producers p
    where p.id = new.producer_id
      and p.is_active = true;

    if not found then
      raise exception 'Unknown or inactive producer_id'
        using errcode = '23503';
    end if;

    new.destination := v_destination;
    new.country_code := v_country_code;
    new.category := v_category;
  elsif new.destination is not null then
    select r.country_code
      into v_country_code
    from public.terroir_regions r
    where r.destination = new.destination;

    if not found then
      raise exception 'Unknown destination'
        using errcode = '23503';
    end if;

    new.country_code := v_country_code;
    new.category := null;
  else
    new.country_code := null;
    new.category := null;
  end if;

  if new.affiliate_campaign is not null then
    select c.is_active
      into v_campaign_active
    from analytics.affiliate_campaigns c
    where c.id = new.affiliate_campaign;

    if not found then
      raise exception 'Unknown affiliate campaign'
        using errcode = '23503';
    end if;

    if not v_campaign_active then
      raise exception 'Inactive affiliate campaign'
        using errcode = '23514';
    end if;
  end if;

  if new.partner_campaign_id is not null then
    select c.producer_id, c.status, a.status, c.starts_at, c.ends_at
    into v_partner_producer_id, v_partner_campaign_status, v_partner_account_status,
         v_partner_starts_at, v_partner_ends_at
    from public.commercial_partner_campaigns c
    join public.commercial_partner_accounts a on a.producer_id = c.producer_id
    where c.id = new.partner_campaign_id;

    if not found then
      raise exception 'Unknown Partner campaign'
        using errcode = '23503';
    end if;

    if new.producer_id is distinct from v_partner_producer_id then
      raise exception 'Partner campaign producer mismatch'
        using errcode = '23514';
    end if;

    if v_partner_campaign_status <> 'active' or v_partner_account_status <> 'active' then
      raise exception 'Inactive Partner campaign'
        using errcode = '23514';
    end if;

    if v_partner_starts_at is not null and v_partner_starts_at > now() then
      raise exception 'Partner campaign has not started'
        using errcode = '23514';
    end if;

    if v_partner_ends_at is not null and v_partner_ends_at <= now() then
      raise exception 'Partner campaign has ended'
        using errcode = '23514';
    end if;

    if not exists (
      select 1
      from public.commercial_partner_campaign_placements cp
      where cp.campaign_id = new.partner_campaign_id
        and cp.placement = new.partner_placement
    ) then
      raise exception 'Partner campaign placement mismatch'
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

create table if not exists analytics.partner_campaign_intent_daily (
  day date not null,
  campaign_id uuid not null references public.commercial_partner_campaigns(id) on update cascade on delete restrict,
  producer_id text not null references public.producers(id) on update cascade on delete restrict,
  placement text not null check (placement in ('region_discovery','trip_preparation')),
  source_surface text not null,
  qualified_impressions bigint not null default 0,
  opens bigint not null default 0,
  saves bigint not null default 0,
  trip_additions bigint not null default 0,
  website_clicks bigint not null default 0,
  phone_clicks bigint not null default 0,
  email_clicks bigint not null default 0,
  directions_clicks bigint not null default 0,
  primary key (day, campaign_id, placement, source_surface)
);

alter table analytics.partner_campaign_intent_daily enable row level security;
revoke all on table analytics.partner_campaign_intent_daily from public, anon, authenticated;
grant select, insert, update, delete on table analytics.partner_campaign_intent_daily to service_role;

create index if not exists partner_campaign_intent_daily_producer_idx
  on analytics.partner_campaign_intent_daily (producer_id, day desc);

create or replace function analytics.refresh_partner_campaign_aggregates(
  p_start_date date default (current_date - 1),
  p_end_date date default current_date
)
returns void
language plpgsql
set search_path = ''
as $$
begin
  if p_start_date is null or p_end_date is null or p_end_date < p_start_date then
    raise exception 'Invalid Partner aggregate date range';
  end if;
  if (p_end_date - p_start_date) > 400 then
    raise exception 'Partner aggregate refresh range exceeds 400 days';
  end if;

  delete from analytics.partner_campaign_intent_daily
  where day between p_start_date and p_end_date;

  insert into analytics.partner_campaign_intent_daily (
    day, campaign_id, producer_id, placement, source_surface,
    qualified_impressions, opens, saves, trip_additions,
    website_clicks, phone_clicks, email_clicks, directions_clicks
  )
  select
    e.occurred_at::date,
    e.partner_campaign_id,
    e.producer_id,
    e.partner_placement,
    e.source_surface,
    count(distinct e.session_key) filter (where e.event_name = 'partner_impression'),
    count(*) filter (where e.event_name = 'partner_open'),
    count(*) filter (where e.event_name = 'partner_save'),
    count(*) filter (where e.event_name = 'partner_trip_add'),
    count(*) filter (where e.event_name = 'partner_contact_action' and e.partner_action = 'website'),
    count(*) filter (where e.event_name = 'partner_contact_action' and e.partner_action = 'phone'),
    count(*) filter (where e.event_name = 'partner_contact_action' and e.partner_action = 'email'),
    count(*) filter (where e.event_name = 'partner_contact_action' and e.partner_action = 'directions')
  from analytics.intent_events e
  where e.partner_campaign_id is not null
    and e.occurred_at >= p_start_date::timestamptz
    and e.occurred_at < (p_end_date + 1)::timestamptz
  group by e.occurred_at::date, e.partner_campaign_id, e.producer_id,
           e.partner_placement, e.source_surface;
end;
$$;

create or replace function analytics.purge_expired_partner_campaign_aggregates(
  p_cutoff date default ((current_date - interval '2 years'))::date
)
returns bigint
language plpgsql
set search_path = ''
as $$
declare
  v_deleted bigint;
begin
  delete from analytics.partner_campaign_intent_daily where day < p_cutoff;
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

create or replace function analytics.run_retention_maintenance()
returns void
language plpgsql
set search_path = ''
as $$
begin
  perform analytics.purge_expired_intent_events();
  perform analytics.purge_expired_aggregates();
  perform analytics.purge_expired_partner_campaign_aggregates();
end;
$$;

create or replace function public.ingest_intent_event_v2(
  p_schema_version smallint,
  p_client_event_id uuid,
  p_event_name text,
  p_actor_scope text,
  p_actor_key text,
  p_session_key text,
  p_producer_id text,
  p_destination text,
  p_source_surface text,
  p_affiliate_campaign text,
  p_partner_campaign_id uuid,
  p_partner_placement text,
  p_partner_action text
)
returns table(event_id uuid, inserted boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_id uuid;
begin
  insert into analytics.intent_events (
    schema_version, client_event_id, event_name, actor_scope, actor_key, session_key,
    producer_id, destination, source_surface, affiliate_campaign,
    partner_campaign_id, partner_placement, partner_action
  )
  values (
    p_schema_version, p_client_event_id, p_event_name, p_actor_scope, p_actor_key, p_session_key,
    p_producer_id, p_destination, p_source_surface, p_affiliate_campaign,
    p_partner_campaign_id, p_partner_placement, p_partner_action
  )
  on conflict (client_event_id) do nothing
  returning id into v_event_id;

  if v_event_id is not null then
    return query select v_event_id, true;
    return;
  end if;

  select e.id into v_event_id
  from analytics.intent_events e
  where e.client_event_id = p_client_event_id;

  if v_event_id is null then raise exception 'Idempotency lookup failed'; end if;
  return query select v_event_id, false;
end;
$$;

revoke all on function public.ingest_intent_event_v2(
  smallint,uuid,text,text,text,text,text,text,text,text,uuid,text,text
) from public, anon, authenticated;
grant execute on function public.ingest_intent_event_v2(
  smallint,uuid,text,text,text,text,text,text,text,text,uuid,text,text
) to service_role;

do $$
declare
  v_jobid bigint;
begin
  select jobid into v_jobid from cron.job
  where jobname = 'terroirtrail-partner-analytics-hourly-aggregate';
  if v_jobid is not null then perform cron.unschedule(v_jobid); end if;

  perform cron.schedule(
    'terroirtrail-partner-analytics-hourly-aggregate',
    '19 * * * *',
    'select analytics.refresh_partner_campaign_aggregates(current_date - 1, current_date);'
  );
end $$;
