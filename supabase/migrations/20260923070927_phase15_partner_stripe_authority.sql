-- Phase 15 Block D: Stripe subscription authority for Producer Partner.
-- Applied to production as Supabase migration 20260923070927.
-- No Stripe customer, subscription, Partner or campaign rows are seeded here.

create table if not exists public.commercial_partner_stripe_events (
  event_id text primary key,
  event_type text not null check (char_length(event_type) between 1 and 120),
  provider_created_at timestamptz,
  producer_id text references public.producers(id) on update cascade on delete restrict,
  provider_customer_id text,
  provider_subscription_id text,
  processed_at timestamptz not null default now()
);

alter table public.commercial_partner_stripe_events enable row level security;
revoke all on table public.commercial_partner_stripe_events from public, anon, authenticated;
grant select, insert, update, delete on table public.commercial_partner_stripe_events to service_role;

create index if not exists commercial_partner_stripe_events_producer_idx
  on public.commercial_partner_stripe_events (producer_id, processed_at desc);

create index if not exists intent_events_partner_campaign_idx
  on analytics.intent_events (partner_campaign_id)
  where partner_campaign_id is not null;

create index if not exists partner_campaign_intent_daily_campaign_idx
  on analytics.partner_campaign_intent_daily (campaign_id, day desc);

create or replace function public.prepare_commercial_partner_checkout_v1(
  p_producer_id text,
  p_actor_uid text
)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_partner public.commercial_partner_accounts%rowtype;
begin
  if p_actor_uid is null or btrim(p_actor_uid) = '' then raise exception 'actor_uid_required'; end if;
  if p_producer_id is null or btrim(p_producer_id) = '' then raise exception 'producer_id_required'; end if;
  if not exists (select 1 from public.producers where id = p_producer_id and is_active = true) then
    raise exception 'active_producer_required';
  end if;

  select * into v_partner
  from public.commercial_partner_accounts
  where producer_id = p_producer_id
  for update;

  if found then
    if v_partner.status = 'active' and v_partner.activation_source = 'stripe_subscription' then
      raise exception 'partner_already_active';
    end if;
    if v_partner.status = 'active' and v_partner.activation_source = 'admin_pilot' then
      raise exception 'admin_pilot_active';
    end if;

    update public.commercial_partner_accounts
    set status = 'pending',
        activation_source = 'stripe_subscription',
        updated_by_uid = p_actor_uid,
        ended_at = null,
        updated_at = now()
    where producer_id = p_producer_id
    returning * into v_partner;
  else
    insert into public.commercial_partner_accounts (
      producer_id, status, activation_source, created_by_uid, updated_by_uid
    )
    values (p_producer_id, 'pending', 'stripe_subscription', p_actor_uid, p_actor_uid)
    returning * into v_partner;
  end if;

  insert into public.commercial_partner_audit (
    producer_id, entity_type, entity_id, event_type, actor_type, actor_uid,
    from_status, to_status, reason
  )
  values (
    p_producer_id, 'partner', p_producer_id, 'partner_checkout_prepared',
    'system', p_actor_uid, null, 'pending', 'Host initiated Partner checkout'
  );

  return to_jsonb(v_partner);
end;
$$;

create or replace function public.apply_stripe_partner_subscription_event_v1(
  p_event_id text,
  p_event_type text,
  p_provider_created_at timestamptz,
  p_producer_id text,
  p_provider_customer_id text,
  p_provider_subscription_id text,
  p_subscription_status text,
  p_current_period_start timestamptz,
  p_current_period_end timestamptz,
  p_grace_until timestamptz,
  p_cancel_at_period_end boolean
)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_existing_event text;
  v_old_subscription_status text;
  v_subscription public.commercial_partner_subscriptions%rowtype;
  v_partner public.commercial_partner_accounts%rowtype;
  v_target_partner_status text;
begin
  if p_event_id is null or btrim(p_event_id) = '' then raise exception 'stripe_event_id_required'; end if;
  if p_event_type is null or btrim(p_event_type) = '' then raise exception 'stripe_event_type_required'; end if;
  if p_producer_id is null or btrim(p_producer_id) = '' then raise exception 'producer_id_required'; end if;
  if p_provider_customer_id is null or btrim(p_provider_customer_id) = '' then raise exception 'stripe_customer_required'; end if;
  if p_provider_subscription_id is null or btrim(p_provider_subscription_id) = '' then raise exception 'stripe_subscription_required'; end if;
  if p_subscription_status not in ('pending','active','past_due','grace','cancelled','expired') then
    raise exception 'invalid_subscription_status';
  end if;
  if not exists (select 1 from public.producers where id = p_producer_id and is_active = true) then
    raise exception 'active_producer_required';
  end if;

  select event_id into v_existing_event
  from public.commercial_partner_stripe_events
  where event_id = p_event_id;

  if found then
    return jsonb_build_object('processed', false, 'duplicate', true);
  end if;

  select status into v_old_subscription_status
  from public.commercial_partner_subscriptions
  where provider_subscription_id = p_provider_subscription_id
  for update;

  if not found then
    select status into v_old_subscription_status
    from public.commercial_partner_subscriptions
    where producer_id = p_producer_id
      and status in ('pending','active','past_due','grace')
    order by created_at desc
    limit 1
    for update;
  end if;

  insert into public.commercial_partner_accounts (
    producer_id, status, activation_source, created_by_uid, updated_by_uid
  )
  values (p_producer_id, 'pending', 'stripe_subscription', null, null)
  on conflict (producer_id) do nothing;

  if v_old_subscription_status is null then
    insert into public.commercial_partner_subscriptions (
      producer_id, plan_code, provider, provider_customer_id, provider_subscription_id,
      status, current_period_start, current_period_end, grace_until, cancel_at_period_end
    )
    values (
      p_producer_id, 'partner_annual_v1', 'stripe', p_provider_customer_id,
      p_provider_subscription_id, p_subscription_status, p_current_period_start,
      p_current_period_end, p_grace_until, coalesce(p_cancel_at_period_end,false)
    )
    returning * into v_subscription;
  else
    update public.commercial_partner_subscriptions
    set provider_customer_id = p_provider_customer_id,
        provider_subscription_id = p_provider_subscription_id,
        status = p_subscription_status,
        current_period_start = p_current_period_start,
        current_period_end = p_current_period_end,
        grace_until = p_grace_until,
        cancel_at_period_end = coalesce(p_cancel_at_period_end,false),
        updated_at = now()
    where (
      provider_subscription_id = p_provider_subscription_id
      or (
        producer_id = p_producer_id
        and status in ('pending','active','past_due','grace')
      )
    )
    returning * into v_subscription;
  end if;

  if v_subscription.id is null then raise exception 'subscription_upsert_failed'; end if;

  v_target_partner_status :=
    case
      when p_subscription_status in ('active','grace') then 'active'
      when p_subscription_status in ('past_due','pending') then 'pending'
      else 'ended'
    end;

  update public.commercial_partner_accounts
  set status = v_target_partner_status,
      activation_source = 'stripe_subscription',
      activated_at = case
        when v_target_partner_status = 'active' then coalesce(activated_at, now())
        else activated_at
      end,
      ended_at = case when v_target_partner_status = 'ended' then now() else null end,
      updated_at = now()
  where producer_id = p_producer_id
  returning * into v_partner;

  insert into public.commercial_partner_stripe_events (
    event_id, event_type, provider_created_at, producer_id,
    provider_customer_id, provider_subscription_id
  )
  values (
    p_event_id, p_event_type, p_provider_created_at, p_producer_id,
    p_provider_customer_id, p_provider_subscription_id
  );

  insert into public.commercial_partner_audit (
    producer_id, entity_type, entity_id, event_type, actor_type,
    from_status, to_status, reason
  )
  values (
    p_producer_id, 'subscription', v_subscription.id::text,
    'stripe_' || left(regexp_replace(p_event_type, '[^a-zA-Z0-9_]+', '_', 'g'), 60),
    'stripe', v_old_subscription_status, p_subscription_status,
    case when p_cancel_at_period_end then 'Subscription set to cancel at period end' else null end
  );

  return jsonb_build_object(
    'processed', true,
    'duplicate', false,
    'subscription', to_jsonb(v_subscription),
    'partner', to_jsonb(v_partner)
  );
end;
$$;

create or replace function public.expire_commercial_partner_grace_v1()
returns bigint
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_count bigint := 0;
  v_row record;
begin
  for v_row in
    select s.id, s.producer_id, s.status
    from public.commercial_partner_subscriptions s
    where s.status = 'grace'
      and s.grace_until is not null
      and s.grace_until <= now()
    for update
  loop
    update public.commercial_partner_subscriptions
    set status = 'expired', updated_at = now()
    where id = v_row.id;

    update public.commercial_partner_accounts
    set status = 'ended', ended_at = now(), updated_at = now()
    where producer_id = v_row.producer_id
      and activation_source = 'stripe_subscription';

    insert into public.commercial_partner_audit (
      producer_id, entity_type, entity_id, event_type, actor_type,
      from_status, to_status, reason
    )
    values (
      v_row.producer_id, 'subscription', v_row.id::text,
      'subscription_grace_expired', 'system', 'grace', 'expired',
      'Payment recovery grace period expired'
    );

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

revoke all on function public.prepare_commercial_partner_checkout_v1(text,text) from public, anon, authenticated;
revoke all on function public.apply_stripe_partner_subscription_event_v1(
  text,text,timestamptz,text,text,text,text,timestamptz,timestamptz,timestamptz,boolean
) from public, anon, authenticated;
revoke all on function public.expire_commercial_partner_grace_v1() from public, anon, authenticated;

grant execute on function public.prepare_commercial_partner_checkout_v1(text,text) to service_role;
grant execute on function public.apply_stripe_partner_subscription_event_v1(
  text,text,timestamptz,text,text,text,text,timestamptz,timestamptz,timestamptz,boolean
) to service_role;
grant execute on function public.expire_commercial_partner_grace_v1() to service_role;

do $$
declare
  v_jobid bigint;
begin
  select jobid into v_jobid
  from cron.job
  where jobname = 'terroirtrail-partner-grace-expiry-hourly';

  if v_jobid is not null then
    perform cron.unschedule(v_jobid);
  end if;

  perform cron.schedule(
    'terroirtrail-partner-grace-expiry-hourly',
    '37 * * * *',
    'select public.expire_commercial_partner_grace_v1();'
  );
end $$;

notify pgrst, 'reload schema';
