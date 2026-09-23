create or replace function public.guard_commercial_partner_campaign_public_state_v1()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  if new.status is distinct from old.status and new.status in ('scheduled','active') then
    if not exists (
      select 1 from public.commercial_partner_accounts a
      where a.producer_id = new.producer_id
        and a.status = 'active'
    ) then
      raise exception 'active_partner_required';
    end if;

    if new.status = 'scheduled' then
      if new.starts_at is null or new.starts_at <= now() then
        raise exception 'future_start_required_for_scheduled_campaign';
      end if;
      if new.ends_at is not null and new.ends_at <= new.starts_at then
        raise exception 'invalid_campaign_window';
      end if;
    end if;

    if new.status = 'active' then
      if new.starts_at is not null and new.starts_at > now() then
        raise exception 'campaign_not_started';
      end if;
      if new.ends_at is not null and new.ends_at <= now() then
        raise exception 'campaign_already_ended';
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists commercial_partner_campaign_public_state_guard
  on public.commercial_partner_campaigns;

create trigger commercial_partner_campaign_public_state_guard
before update of status on public.commercial_partner_campaigns
for each row
execute function public.guard_commercial_partner_campaign_public_state_v1();

create or replace function public.update_commercial_partner_campaign_v1(
  p_campaign_id uuid,
  p_headline text,
  p_message text,
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
  v_old_status text;
  v_new_status text;
  v_placement text;
begin
  if p_actor_uid is null or btrim(p_actor_uid) = '' then
    raise exception 'actor_uid_required';
  end if;

  select * into v_campaign
  from public.commercial_partner_campaigns
  where id = p_campaign_id
  for update;

  if not found then
    raise exception 'campaign_not_found';
  end if;

  if v_campaign.status not in ('draft','rejected') then
    raise exception 'campaign_not_editable';
  end if;

  if p_headline is null or char_length(btrim(p_headline)) not between 1 and 120 then
    raise exception 'invalid_headline';
  end if;

  if p_message is not null and char_length(p_message) > 500 then
    raise exception 'message_too_long';
  end if;

  if p_ends_at is not null and p_starts_at is not null and p_ends_at <= p_starts_at then
    raise exception 'invalid_campaign_window';
  end if;

  if coalesce(cardinality(p_placements), 0) < 1 or cardinality(p_placements) > 2 then
    raise exception 'invalid_campaign_placements';
  end if;

  foreach v_placement in array p_placements loop
    if v_placement not in ('region_discovery','trip_preparation') then
      raise exception 'invalid_campaign_placement';
    end if;
  end loop;

  v_old_status := v_campaign.status;
  v_new_status := case when v_old_status = 'rejected' then 'draft' else v_old_status end;

  update public.commercial_partner_campaigns
  set
    headline = btrim(p_headline),
    message = nullif(btrim(coalesce(p_message,'')), ''),
    starts_at = p_starts_at,
    ends_at = p_ends_at,
    status = v_new_status,
    reviewed_by_uid = case when v_old_status = 'rejected' then null else reviewed_by_uid end,
    review_note = case when v_old_status = 'rejected' then null else review_note end,
    approved_at = case when v_old_status = 'rejected' then null else approved_at end,
    paused_at = null,
    completed_at = null,
    updated_at = now()
  where id = p_campaign_id
  returning * into v_campaign;

  delete from public.commercial_partner_campaign_placements
  where campaign_id = p_campaign_id;

  insert into public.commercial_partner_campaign_placements (campaign_id, placement)
  select p_campaign_id, distinct_placement
  from (
    select distinct unnest(p_placements) as distinct_placement
  ) placements;

  insert into public.commercial_partner_audit (
    producer_id,
    entity_type,
    entity_id,
    event_type,
    actor_type,
    actor_uid,
    from_status,
    to_status,
    reason
  )
  values (
    v_campaign.producer_id,
    'campaign',
    v_campaign.id::text,
    'campaign_updated',
    'admin',
    p_actor_uid,
    v_old_status,
    v_new_status,
    case when v_old_status = 'rejected' then 'Rejected campaign edited and returned to draft.' else null end
  );

  return jsonb_build_object(
    'campaign', to_jsonb(v_campaign),
    'placements', (
      select coalesce(jsonb_agg(placement order by placement), '[]'::jsonb)
      from public.commercial_partner_campaign_placements
      where campaign_id = p_campaign_id
    )
  );
end;
$$;

revoke all on function public.update_commercial_partner_campaign_v1(
  uuid,text,text,timestamptz,timestamptz,text[],text
) from public, anon, authenticated;
grant execute on function public.update_commercial_partner_campaign_v1(
  uuid,text,text,timestamptz,timestamptz,text[],text
) to service_role;

create or replace function public.get_partner_campaign_report_v1(
  p_producer_ids text[]
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if p_producer_ids is null or coalesce(cardinality(p_producer_ids), 0) = 0 then
    return jsonb_build_object(
      'generated_at', now(),
      'campaigns', '[]'::jsonb
    );
  end if;

  if cardinality(p_producer_ids) > 250 then
    raise exception 'producer_scope_too_large';
  end if;

  with metrics as (
    select
      a.campaign_id,
      a.producer_id,
      min(a.day) as first_activity_day,
      max(a.day) as last_activity_day,
      sum(a.qualified_impressions)::bigint as qualified_impressions,
      sum(a.opens)::bigint as opens,
      sum(a.saves)::bigint as saves,
      sum(a.trip_additions)::bigint as trip_additions,
      sum(a.website_clicks)::bigint as website_clicks,
      sum(a.phone_clicks)::bigint as phone_clicks,
      sum(a.email_clicks)::bigint as email_clicks,
      sum(a.directions_clicks)::bigint as directions_clicks
    from analytics.partner_campaign_intent_daily a
    where a.producer_id = any(p_producer_ids)
    group by a.campaign_id, a.producer_id
  )
  select jsonb_build_object(
    'generated_at', now(),
    'campaigns',
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'campaign_id', c.id,
          'producer_id', c.producer_id,
          'first_activity_day', m.first_activity_day,
          'last_activity_day', m.last_activity_day,
          'qualified_impressions', coalesce(m.qualified_impressions, 0),
          'opens', coalesce(m.opens, 0),
          'saves', coalesce(m.saves, 0),
          'trip_additions', coalesce(m.trip_additions, 0),
          'website_clicks', coalesce(m.website_clicks, 0),
          'phone_clicks', coalesce(m.phone_clicks, 0),
          'email_clicks', coalesce(m.email_clicks, 0),
          'directions_clicks', coalesce(m.directions_clicks, 0)
        )
        order by c.created_at desc
      ),
      '[]'::jsonb
    )
  )
  into v_result
  from public.commercial_partner_campaigns c
  left join metrics m on m.campaign_id = c.id
  where c.producer_id = any(p_producer_ids);

  return coalesce(
    v_result,
    jsonb_build_object('generated_at', now(), 'campaigns', '[]'::jsonb)
  );
end;
$$;

revoke all on function public.get_partner_campaign_report_v1(text[])
  from public, anon, authenticated;
grant execute on function public.get_partner_campaign_report_v1(text[])
  to service_role;

create or replace function public.reconcile_commercial_partner_campaigns_v1()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_campaign record;
  v_new_status text;
  v_count integer := 0;
begin
  for v_campaign in
    select
      c.id,
      c.producer_id,
      c.status,
      c.starts_at,
      c.ends_at
    from public.commercial_partner_campaigns c
    where
      (
        c.status = 'scheduled'
        and (c.ends_at is null or c.ends_at > now())
        and (c.starts_at is null or c.starts_at <= now())
        and exists (
          select 1
          from public.commercial_partner_accounts a
          where a.producer_id = c.producer_id
            and a.status = 'active'
        )
      )
      or
      (
        c.status in ('scheduled','active')
        and c.ends_at is not null
        and c.ends_at <= now()
      )
    order by c.updated_at, c.id
    for update of c skip locked
  loop
    if v_campaign.ends_at is not null and v_campaign.ends_at <= now() then
      v_new_status := 'completed';
    else
      v_new_status := 'active';
    end if;

    if v_new_status = v_campaign.status then
      continue;
    end if;

    update public.commercial_partner_campaigns
    set
      status = v_new_status,
      paused_at = case when v_new_status = 'active' then null else paused_at end,
      completed_at = case when v_new_status = 'completed' then now() else completed_at end,
      updated_at = now()
    where id = v_campaign.id;

    insert into public.commercial_partner_audit (
      producer_id,
      entity_type,
      entity_id,
      event_type,
      actor_type,
      actor_uid,
      from_status,
      to_status,
      reason
    )
    values (
      v_campaign.producer_id,
      'campaign',
      v_campaign.id::text,
      'campaign_status_changed',
      'system',
      null,
      v_campaign.status,
      v_new_status,
      case
        when v_new_status = 'active' then 'Scheduled campaign start reached.'
        else 'Campaign end reached.'
      end
    );

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

revoke all on function public.reconcile_commercial_partner_campaigns_v1()
  from public, anon, authenticated;
grant execute on function public.reconcile_commercial_partner_campaigns_v1()
  to service_role;

do $$
declare
  v_jobid bigint;
begin
  select jobid into v_jobid
  from cron.job
  where jobname = 'terroirtrail-partner-campaign-reconcile';

  if v_jobid is not null then
    perform cron.unschedule(v_jobid);
  end if;

  perform cron.schedule(
    'terroirtrail-partner-campaign-reconcile',
    '*/5 * * * *',
    'select public.reconcile_commercial_partner_campaigns_v1();'
  );
end $$;

notify pgrst, 'reload schema';
