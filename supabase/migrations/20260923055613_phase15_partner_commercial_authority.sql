-- Phase 15 Block A: trusted Producer Partner commercial authority.
-- Applied to production as Supabase migration 20260923055613.
-- Public Data API access is intentionally service-role only; Hosts/Admins reach
-- this state exclusively through the trusted TerroirTrail API.

create table if not exists public.commercial_partner_accounts (
  producer_id text primary key references public.producers(id) on update cascade on delete restrict,
  status text not null default 'pending'
    check (status in ('pending','active','suspended','ended')),
  activation_source text not null default 'admin_pilot'
    check (activation_source in ('admin_pilot','stripe_subscription')),
  created_by_uid text,
  updated_by_uid text,
  activated_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.commercial_partner_subscriptions (
  id uuid primary key default gen_random_uuid(),
  producer_id text not null references public.commercial_partner_accounts(producer_id) on update cascade on delete restrict,
  plan_code text not null default 'partner_annual_v1'
    check (plan_code in ('partner_annual_v1')),
  provider text not null default 'stripe'
    check (provider in ('stripe')),
  provider_customer_id text,
  provider_subscription_id text unique,
  status text not null default 'pending'
    check (status in ('pending','active','past_due','grace','cancelled','expired')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  grace_until timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (current_period_end is null or current_period_start is null or current_period_end > current_period_start),
  check (grace_until is null or current_period_end is null or grace_until >= current_period_end)
);

create unique index if not exists commercial_partner_one_live_subscription_idx
  on public.commercial_partner_subscriptions (producer_id)
  where status in ('pending','active','past_due','grace');

create index if not exists commercial_partner_subscriptions_producer_idx
  on public.commercial_partner_subscriptions (producer_id, created_at desc);

create table if not exists public.commercial_partner_campaigns (
  id uuid primary key default gen_random_uuid(),
  producer_id text not null references public.commercial_partner_accounts(producer_id) on update cascade on delete restrict,
  campaign_type text not null
    check (campaign_type in ('regional_featured','trip_contextual','seasonal_notice')),
  status text not null default 'draft'
    check (status in ('draft','awaiting_review','approved','scheduled','active','paused','completed','withdrawn','rejected')),
  destination text,
  category text,
  headline text not null check (char_length(headline) between 1 and 120),
  message text check (message is null or char_length(message) <= 500),
  starts_at timestamptz,
  ends_at timestamptz,
  created_by_uid text not null,
  reviewed_by_uid text,
  review_note text check (review_note is null or char_length(review_note) <= 500),
  approved_at timestamptz,
  paused_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create index if not exists commercial_partner_campaigns_producer_status_idx
  on public.commercial_partner_campaigns (producer_id, status, created_at desc);

create index if not exists commercial_partner_campaigns_target_idx
  on public.commercial_partner_campaigns (destination, category, status)
  where status in ('approved','scheduled','active');

create table if not exists public.commercial_partner_campaign_placements (
  campaign_id uuid not null references public.commercial_partner_campaigns(id) on delete cascade,
  placement text not null
    check (placement in ('region_discovery','trip_preparation')),
  created_at timestamptz not null default now(),
  primary key (campaign_id, placement)
);

create table if not exists public.commercial_partner_audit (
  id uuid primary key default gen_random_uuid(),
  producer_id text not null references public.producers(id) on update cascade on delete restrict,
  entity_type text not null
    check (entity_type in ('partner','subscription','campaign')),
  entity_id text not null,
  event_type text not null check (char_length(event_type) between 1 and 80),
  actor_type text not null
    check (actor_type in ('admin','stripe','system')),
  actor_uid text,
  from_status text,
  to_status text,
  reason text check (reason is null or char_length(reason) <= 500),
  occurred_at timestamptz not null default now()
);

create index if not exists commercial_partner_audit_producer_idx
  on public.commercial_partner_audit (producer_id, occurred_at desc);

alter table public.commercial_partner_accounts enable row level security;
alter table public.commercial_partner_subscriptions enable row level security;
alter table public.commercial_partner_campaigns enable row level security;
alter table public.commercial_partner_campaign_placements enable row level security;
alter table public.commercial_partner_audit enable row level security;

revoke all on table public.commercial_partner_accounts from anon, authenticated;
revoke all on table public.commercial_partner_subscriptions from anon, authenticated;
revoke all on table public.commercial_partner_campaigns from anon, authenticated;
revoke all on table public.commercial_partner_campaign_placements from anon, authenticated;
revoke all on table public.commercial_partner_audit from anon, authenticated;

grant select, insert, update, delete on table public.commercial_partner_accounts to service_role;
grant select, insert, update, delete on table public.commercial_partner_subscriptions to service_role;
grant select, insert, update, delete on table public.commercial_partner_campaigns to service_role;
grant select, insert, update, delete on table public.commercial_partner_campaign_placements to service_role;
grant select, insert, update, delete on table public.commercial_partner_audit to service_role;

create or replace function public.set_commercial_partner_status_v1(
  p_producer_id text,
  p_status text,
  p_actor_uid text,
  p_reason text default null,
  p_activation_source text default 'admin_pilot',
  p_actor_type text default 'admin'
)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_old_status text;
  v_row public.commercial_partner_accounts%rowtype;
begin
  if p_producer_id is null or btrim(p_producer_id) = '' then raise exception 'producer_id_required'; end if;
  if p_status not in ('pending','active','suspended','ended') then raise exception 'invalid_partner_status'; end if;
  if p_activation_source not in ('admin_pilot','stripe_subscription') then raise exception 'invalid_activation_source'; end if;
  if p_actor_type not in ('admin','stripe','system') then raise exception 'invalid_actor_type'; end if;
  if p_reason is not null and char_length(p_reason) > 500 then raise exception 'reason_too_long'; end if;
  if not exists (select 1 from public.producers where id = p_producer_id and is_active = true) then
    raise exception 'active_producer_required';
  end if;

  select status into v_old_status
  from public.commercial_partner_accounts
  where producer_id = p_producer_id
  for update;

  if v_old_status is null then
    if p_status not in ('pending','active') then raise exception 'invalid_initial_partner_status'; end if;
  elsif not (
    (v_old_status = 'pending' and p_status in ('pending','active','suspended','ended')) or
    (v_old_status = 'active' and p_status in ('active','suspended','ended')) or
    (v_old_status = 'suspended' and p_status in ('suspended','active','ended')) or
    (v_old_status = 'ended' and p_status in ('ended','pending'))
  ) then
    raise exception 'invalid_partner_status_transition';
  end if;

  insert into public.commercial_partner_accounts (
    producer_id, status, activation_source, created_by_uid, updated_by_uid, activated_at, ended_at
  )
  values (
    p_producer_id, p_status, p_activation_source, p_actor_uid, p_actor_uid,
    case when p_status = 'active' then now() else null end,
    case when p_status = 'ended' then now() else null end
  )
  on conflict (producer_id) do update
  set status = excluded.status,
      activation_source = excluded.activation_source,
      updated_by_uid = excluded.updated_by_uid,
      activated_at = case
        when excluded.status = 'active' then coalesce(public.commercial_partner_accounts.activated_at, now())
        else public.commercial_partner_accounts.activated_at
      end,
      ended_at = case
        when excluded.status = 'ended' then now()
        when excluded.status in ('pending','active') then null
        else public.commercial_partner_accounts.ended_at
      end,
      updated_at = now()
  returning * into v_row;

  insert into public.commercial_partner_audit (
    producer_id, entity_type, entity_id, event_type, actor_type, actor_uid, from_status, to_status, reason
  )
  values (
    p_producer_id, 'partner', p_producer_id, 'partner_status_changed', p_actor_type,
    p_actor_uid, v_old_status, p_status, nullif(btrim(coalesce(p_reason,'')), '')
  );

  return to_jsonb(v_row);
end;
$$;

create or replace function public.create_commercial_partner_campaign_v1(
  p_producer_id text,
  p_campaign_type text,
  p_headline text,
  p_message text,
  p_destination text,
  p_category text,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_placements text[],
  p_actor_uid text
)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_campaign public.commercial_partner_campaigns%rowtype;
  v_placement text;
begin
  if p_actor_uid is null or btrim(p_actor_uid) = '' then raise exception 'actor_uid_required'; end if;
  if not exists (
    select 1 from public.commercial_partner_accounts
    where producer_id = p_producer_id and status in ('pending','active')
  ) then raise exception 'partner_account_required'; end if;
  if p_campaign_type not in ('regional_featured','trip_contextual','seasonal_notice') then raise exception 'invalid_campaign_type'; end if;
  if p_headline is null or char_length(btrim(p_headline)) not between 1 and 120 then raise exception 'invalid_headline'; end if;
  if p_message is not null and char_length(p_message) > 500 then raise exception 'message_too_long'; end if;
  if p_ends_at is not null and p_starts_at is not null and p_ends_at <= p_starts_at then raise exception 'invalid_campaign_window'; end if;
  if coalesce(cardinality(p_placements),0) < 1 or cardinality(p_placements) > 2 then raise exception 'invalid_campaign_placements'; end if;

  foreach v_placement in array p_placements loop
    if v_placement not in ('region_discovery','trip_preparation') then raise exception 'invalid_campaign_placement'; end if;
  end loop;

  insert into public.commercial_partner_campaigns (
    producer_id, campaign_type, status, destination, category, headline, message,
    starts_at, ends_at, created_by_uid
  )
  values (
    p_producer_id, p_campaign_type, 'draft',
    nullif(btrim(coalesce(p_destination,'')), ''),
    nullif(btrim(coalesce(p_category,'')), ''),
    btrim(p_headline), nullif(btrim(coalesce(p_message,'')), ''),
    p_starts_at, p_ends_at, p_actor_uid
  )
  returning * into v_campaign;

  insert into public.commercial_partner_campaign_placements (campaign_id, placement)
  select v_campaign.id, distinct_placement
  from (select distinct unnest(p_placements) as distinct_placement) placements;

  insert into public.commercial_partner_audit (
    producer_id, entity_type, entity_id, event_type, actor_type, actor_uid, to_status
  )
  values (
    p_producer_id, 'campaign', v_campaign.id::text, 'campaign_created',
    'admin', p_actor_uid, 'draft'
  );

  return jsonb_build_object(
    'campaign', to_jsonb(v_campaign),
    'placements', (
      select coalesce(jsonb_agg(placement order by placement), '[]'::jsonb)
      from public.commercial_partner_campaign_placements
      where campaign_id = v_campaign.id
    )
  );
end;
$$;

create or replace function public.transition_commercial_partner_campaign_v1(
  p_campaign_id uuid,
  p_status text,
  p_actor_uid text,
  p_reason text default null
)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_campaign public.commercial_partner_campaigns%rowtype;
  v_old_status text;
begin
  if p_actor_uid is null or btrim(p_actor_uid) = '' then raise exception 'actor_uid_required'; end if;
  if p_status not in ('draft','awaiting_review','approved','scheduled','active','paused','completed','withdrawn','rejected') then
    raise exception 'invalid_campaign_status';
  end if;
  if p_reason is not null and char_length(p_reason) > 500 then raise exception 'reason_too_long'; end if;

  select * into v_campaign
  from public.commercial_partner_campaigns
  where id = p_campaign_id
  for update;

  if not found then raise exception 'campaign_not_found'; end if;
  v_old_status := v_campaign.status;

  if not (
    (v_old_status = 'draft' and p_status in ('draft','awaiting_review','withdrawn')) or
    (v_old_status = 'awaiting_review' and p_status in ('awaiting_review','approved','rejected','draft','withdrawn')) or
    (v_old_status = 'approved' and p_status in ('approved','scheduled','active','withdrawn')) or
    (v_old_status = 'scheduled' and p_status in ('scheduled','active','paused','withdrawn')) or
    (v_old_status = 'active' and p_status in ('active','paused','completed','withdrawn')) or
    (v_old_status = 'paused' and p_status in ('paused','active','completed','withdrawn')) or
    (v_old_status = 'rejected' and p_status in ('rejected','draft','withdrawn')) or
    (v_old_status = 'completed' and p_status = 'completed') or
    (v_old_status = 'withdrawn' and p_status = 'withdrawn')
  ) then raise exception 'invalid_campaign_status_transition'; end if;

  update public.commercial_partner_campaigns
  set status = p_status,
      reviewed_by_uid = case when p_status in ('approved','rejected') then p_actor_uid else reviewed_by_uid end,
      review_note = case
        when p_status in ('approved','rejected') then nullif(btrim(coalesce(p_reason,'')), '')
        else review_note
      end,
      approved_at = case when p_status = 'approved' then coalesce(approved_at, now()) else approved_at end,
      paused_at = case when p_status = 'paused' then now() when p_status = 'active' then null else paused_at end,
      completed_at = case when p_status in ('completed','withdrawn') then now() else completed_at end,
      updated_at = now()
  where id = p_campaign_id
  returning * into v_campaign;

  insert into public.commercial_partner_audit (
    producer_id, entity_type, entity_id, event_type, actor_type, actor_uid, from_status, to_status, reason
  )
  values (
    v_campaign.producer_id, 'campaign', v_campaign.id::text, 'campaign_status_changed',
    'admin', p_actor_uid, v_old_status, p_status, nullif(btrim(coalesce(p_reason,'')), '')
  );

  return jsonb_build_object(
    'campaign', to_jsonb(v_campaign),
    'placements', (
      select coalesce(jsonb_agg(placement order by placement), '[]'::jsonb)
      from public.commercial_partner_campaign_placements
      where campaign_id = v_campaign.id
    )
  );
end;
$$;

revoke all on function public.set_commercial_partner_status_v1(text,text,text,text,text,text) from public, anon, authenticated;
revoke all on function public.create_commercial_partner_campaign_v1(text,text,text,text,text,text,timestamptz,timestamptz,text[],text) from public, anon, authenticated;
revoke all on function public.transition_commercial_partner_campaign_v1(uuid,text,text,text) from public, anon, authenticated;

grant execute on function public.set_commercial_partner_status_v1(text,text,text,text,text,text) to service_role;
grant execute on function public.create_commercial_partner_campaign_v1(text,text,text,text,text,text,timestamptz,timestamptz,text[],text) to service_role;
grant execute on function public.transition_commercial_partner_campaign_v1(uuid,text,text,text) to service_role;

notify pgrst, 'reload schema';
