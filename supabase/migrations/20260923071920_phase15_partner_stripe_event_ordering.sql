-- Phase 15 Block D hardening: ignore stale Stripe subscription events.
-- Applied to production as Supabase migration 20260923071920.

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
  v_latest_provider_created_at timestamptz;
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
    return jsonb_build_object('processed', false, 'duplicate', true, 'stale', false);
  end if;

  select max(e.provider_created_at)
  into v_latest_provider_created_at
  from public.commercial_partner_stripe_events e
  where e.provider_subscription_id = p_provider_subscription_id;

  select status into v_old_subscription_status
  from public.commercial_partner_subscriptions
  where provider_subscription_id = p_provider_subscription_id
  for update;

  if (
    v_latest_provider_created_at is not null
    and p_provider_created_at is not null
    and (
      p_provider_created_at < v_latest_provider_created_at
      or (
        p_provider_created_at = v_latest_provider_created_at
        and v_old_subscription_status in ('cancelled','expired')
        and p_subscription_status in ('pending','active','past_due','grace')
      )
    )
  ) then
    insert into public.commercial_partner_stripe_events (
      event_id, event_type, provider_created_at, producer_id,
      provider_customer_id, provider_subscription_id
    )
    values (
      p_event_id, p_event_type, p_provider_created_at, p_producer_id,
      p_provider_customer_id, p_provider_subscription_id
    );

    return jsonb_build_object('processed', false, 'duplicate', false, 'stale', true);
  end if;

  if v_old_subscription_status is null then
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
    'stale', false,
    'subscription', to_jsonb(v_subscription),
    'partner', to_jsonb(v_partner)
  );
end;
$$;

revoke all on function public.apply_stripe_partner_subscription_event_v1(
  text,text,timestamptz,text,text,text,text,timestamptz,timestamptz,timestamptz,boolean
) from public, anon, authenticated;
grant execute on function public.apply_stripe_partner_subscription_event_v1(
  text,text,timestamptz,text,text,text,text,timestamptz,timestamptz,timestamptz,boolean
) to service_role;

notify pgrst, 'reload schema';
