-- Production migration 20260923064747.
-- This migration appeared concurrently during Phase 15 Block C work and is
-- retained in Git so Supabase migration history remains reproducible.
-- The later 20260923065035 migration intentionally supersedes the draft-edit
-- behavior below with stricter rejected->draft reset and lifecycle guards.

create or replace function public.get_partner_campaign_results_v1(
  p_producer_ids text[]
)
returns table(
  campaign_id uuid,
  producer_id text,
  qualified_impressions bigint,
  opens bigint,
  saves bigint,
  trip_additions bigint,
  website_clicks bigint,
  phone_clicks bigint,
  email_clicks bigint,
  directions_clicks bigint,
  first_day date,
  data_through date
)
language sql
security definer
set search_path = ''
as $$
  select
    d.campaign_id,
    d.producer_id,
    coalesce(sum(d.qualified_impressions),0)::bigint,
    coalesce(sum(d.opens),0)::bigint,
    coalesce(sum(d.saves),0)::bigint,
    coalesce(sum(d.trip_additions),0)::bigint,
    coalesce(sum(d.website_clicks),0)::bigint,
    coalesce(sum(d.phone_clicks),0)::bigint,
    coalesce(sum(d.email_clicks),0)::bigint,
    coalesce(sum(d.directions_clicks),0)::bigint,
    min(d.day),
    max(d.day)
  from analytics.partner_campaign_intent_daily d
  where coalesce(cardinality(p_producer_ids),0) between 1 and 100
    and d.producer_id = any(p_producer_ids)
  group by d.campaign_id, d.producer_id
  order by max(d.day) desc, d.campaign_id;
$$;

revoke all on function public.get_partner_campaign_results_v1(text[]) from public, anon, authenticated;
grant execute on function public.get_partner_campaign_results_v1(text[]) to service_role;

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
  v_placement text;
begin
  if p_actor_uid is null or btrim(p_actor_uid) = '' then raise exception 'actor_uid_required'; end if;
  if p_headline is null or char_length(btrim(p_headline)) not between 1 and 120 then raise exception 'invalid_headline'; end if;
  if p_message is not null and char_length(p_message) > 500 then raise exception 'message_too_long'; end if;
  if p_ends_at is not null and p_starts_at is not null and p_ends_at <= p_starts_at then raise exception 'invalid_campaign_window'; end if;
  if coalesce(cardinality(p_placements),0) < 1 or cardinality(p_placements) > 2 then raise exception 'invalid_campaign_placements'; end if;

  foreach v_placement in array p_placements loop
    if v_placement not in ('region_discovery','trip_preparation') then
      raise exception 'invalid_campaign_placement';
    end if;
  end loop;

  select * into v_campaign
  from public.commercial_partner_campaigns
  where id = p_campaign_id
  for update;

  if not found then raise exception 'campaign_not_found'; end if;
  if v_campaign.status not in ('draft','rejected') then raise exception 'campaign_not_editable'; end if;

  update public.commercial_partner_campaigns
  set headline = btrim(p_headline),
      message = nullif(btrim(coalesce(p_message,'')), ''),
      starts_at = p_starts_at,
      ends_at = p_ends_at,
      updated_at = now()
  where id = p_campaign_id
  returning * into v_campaign;

  delete from public.commercial_partner_campaign_placements
  where campaign_id = p_campaign_id;

  insert into public.commercial_partner_campaign_placements (campaign_id, placement)
  select p_campaign_id, distinct_placement
  from (select distinct unnest(p_placements) as distinct_placement) placements;

  insert into public.commercial_partner_audit (
    producer_id, entity_type, entity_id, event_type, actor_type, actor_uid, from_status, to_status, reason
  )
  values (
    v_campaign.producer_id, 'campaign', v_campaign.id::text, 'campaign_updated',
    'admin', p_actor_uid, v_campaign.status, v_campaign.status, null
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

revoke all on function public.update_commercial_partner_campaign_v1(
  uuid,text,text,timestamptz,timestamptz,text[],text
) from public, anon, authenticated;
grant execute on function public.update_commercial_partner_campaign_v1(
  uuid,text,text,timestamptz,timestamptz,text[],text
) to service_role;

notify pgrst, 'reload schema';
