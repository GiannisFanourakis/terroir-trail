create or replace function public.get_analytics_reliability_v1(
  p_start_date date,
  p_end_date date
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if p_start_date is null or p_end_date is null or p_end_date < p_start_date then
    raise exception 'Invalid analytics reliability date range';
  end if;

  if p_end_date >= current_date then
    raise exception 'Analytics reliability checks require closed UTC days';
  end if;

  if (p_end_date - p_start_date) > 180 then
    raise exception 'Analytics reliability date range exceeds 180 days';
  end if;

  with raw as (
    select
      count(*)::bigint as total_events,
      count(*) filter (where e.event_name = 'producer_view')::bigint as producer_views,
      count(*) filter (where e.event_name = 'producer_save')::bigint as saves,
      count(*) filter (where e.event_name = 'trip_producer_added')::bigint as trip_additions,
      count(*) filter (where e.event_name = 'producer_website_click')::bigint as website_clicks,
      count(*) filter (where e.event_name = 'producer_phone_click')::bigint as phone_clicks,
      count(*) filter (where e.event_name = 'producer_email_click')::bigint as email_clicks,
      count(*) filter (where e.event_name = 'directions_click')::bigint as directions_clicks,
      count(*) filter (where e.event_name = 'passport_stamp_added')::bigint as passport_stamps_added,
      count(*) filter (where e.event_name = 'region_open')::bigint as region_opens,
      count(*) filter (where e.event_name = 'region_producers_view')::bigint as region_producers_views,
      count(*) filter (where e.event_name = 'affiliate_impression')::bigint as affiliate_impressions,
      count(*) filter (where e.event_name = 'affiliate_click')::bigint as affiliate_clicks
    from analytics.intent_events e
    where e.occurred_at >= p_start_date::timestamptz
      and e.occurred_at < (p_end_date + 1)::timestamptz
  ),
  producer_agg as (
    select
      coalesce(sum(a.producer_views), 0)::bigint as producer_views,
      coalesce(sum(a.saves), 0)::bigint as saves,
      coalesce(sum(a.trip_additions), 0)::bigint as trip_additions,
      coalesce(sum(a.website_clicks), 0)::bigint as website_clicks,
      coalesce(sum(a.phone_clicks), 0)::bigint as phone_clicks,
      coalesce(sum(a.email_clicks), 0)::bigint as email_clicks,
      coalesce(sum(a.directions_clicks), 0)::bigint as directions_clicks,
      coalesce(sum(a.passport_stamps_added), 0)::bigint as passport_stamps_added
    from analytics.producer_intent_daily a
    where a.day between p_start_date and p_end_date
  ),
  region_agg as (
    select
      coalesce(sum(a.region_opens), 0)::bigint as region_opens,
      coalesce(sum(a.region_producers_views), 0)::bigint as region_producers_views
    from analytics.region_intent_daily a
    where a.day between p_start_date and p_end_date
  ),
  affiliate_agg as (
    select
      coalesce(sum(a.impressions), 0)::bigint as affiliate_impressions,
      coalesce(sum(a.clicks), 0)::bigint as affiliate_clicks
    from analytics.affiliate_intent_daily a
    where a.day between p_start_date and p_end_date
  ),
  duplicates as (
    select count(*)::bigint as duplicate_client_event_ids
    from (
      select e.client_event_id
      from analytics.intent_events e
      where e.occurred_at >= p_start_date::timestamptz
        and e.occurred_at < (p_end_date + 1)::timestamptz
      group by e.client_event_id
      having count(*) > 1
    ) d
  ),
  integrity as (
    select
      count(*) filter (where e.session_key is null or btrim(e.session_key) = '')::bigint as missing_session_key,
      count(*) filter (
        where e.actor_scope = 'authenticated'
          and (e.actor_key is null or btrim(e.actor_key) = '')
      )::bigint as authenticated_missing_actor_key,
      count(*) filter (
        where e.actor_scope = 'anonymous' and e.actor_key is not null
      )::bigint as anonymous_with_actor_key,
      count(*) filter (
        where e.event_name in (
          'producer_view','producer_share','producer_save','producer_unsave',
          'producer_website_click','producer_phone_click','producer_email_click',
          'directions_click','trip_producer_added','trip_producer_removed',
          'passport_stamp_added','passport_stamp_removed','partner_impression',
          'partner_open','partner_save','partner_trip_add','partner_contact_action'
        )
        and (
          e.producer_id is null or e.destination is null
          or e.category is null or e.country_code is null
        )
      )::bigint as producer_event_missing_dimensions,
      count(*) filter (
        where e.event_name not in (
          'producer_view','producer_share','region_open','region_producers_view',
          'producer_save','producer_unsave','producer_website_click',
          'producer_phone_click','producer_email_click','directions_click',
          'trip_created','trip_renamed','trip_producer_added',
          'trip_producer_removed','trip_item_reordered','trip_day_assigned',
          'trip_opened','passport_stamp_added','passport_stamp_removed',
          'affiliate_impression','affiliate_click','partner_impression',
          'partner_open','partner_save','partner_trip_add','partner_contact_action'
        )
      )::bigint as unexpected_event_name
    from analytics.intent_events e
    where e.occurred_at >= p_start_date::timestamptz
      and e.occurred_at < (p_end_date + 1)::timestamptz
  ),
  compared as (
    select
      r.*,
      p.producer_views as agg_producer_views,
      p.saves as agg_saves,
      p.trip_additions as agg_trip_additions,
      p.website_clicks as agg_website_clicks,
      p.phone_clicks as agg_phone_clicks,
      p.email_clicks as agg_email_clicks,
      p.directions_clicks as agg_directions_clicks,
      p.passport_stamps_added as agg_passport_stamps_added,
      rg.region_opens as agg_region_opens,
      rg.region_producers_views as agg_region_producers_views,
      af.affiliate_impressions as agg_affiliate_impressions,
      af.affiliate_clicks as agg_affiliate_clicks,
      d.duplicate_client_event_ids,
      i.missing_session_key,
      i.authenticated_missing_actor_key,
      i.anonymous_with_actor_key,
      i.producer_event_missing_dimensions,
      i.unexpected_event_name
    from raw r
    cross join producer_agg p
    cross join region_agg rg
    cross join affiliate_agg af
    cross join duplicates d
    cross join integrity i
  ),
  evaluated as (
    select
      c.*,
      (
        c.producer_views = c.agg_producer_views
        and c.saves = c.agg_saves
        and c.trip_additions = c.agg_trip_additions
        and c.website_clicks = c.agg_website_clicks
        and c.phone_clicks = c.agg_phone_clicks
        and c.email_clicks = c.agg_email_clicks
        and c.directions_clicks = c.agg_directions_clicks
        and c.passport_stamps_added = c.agg_passport_stamps_added
        and c.region_opens = c.agg_region_opens
        and c.region_producers_views = c.agg_region_producers_views
        and c.affiliate_impressions = c.agg_affiliate_impressions
        and c.affiliate_clicks = c.agg_affiliate_clicks
      ) as aggregates_match,
      (
        c.duplicate_client_event_ids = 0
        and c.missing_session_key = 0
        and c.authenticated_missing_actor_key = 0
        and c.anonymous_with_actor_key = 0
        and c.producer_event_missing_dimensions = 0
        and c.unexpected_event_name = 0
      ) as integrity_clean
    from compared c
  )
  select jsonb_build_object(
    'checked_at', now(),
    'start_date', p_start_date,
    'end_date', p_end_date,
    'status', case when e.aggregates_match and e.integrity_clean then 'healthy' else 'attention' end,
    'closed_day_reporting', true,
    'raw_event_count', e.total_events,
    'aggregates_match', e.aggregates_match,
    'integrity_clean', e.integrity_clean,
    'checks', jsonb_build_array(
      jsonb_build_object('metric','Producer views','raw',e.producer_views,'aggregate',e.agg_producer_views,'matches',e.producer_views=e.agg_producer_views),
      jsonb_build_object('metric','Saves','raw',e.saves,'aggregate',e.agg_saves,'matches',e.saves=e.agg_saves),
      jsonb_build_object('metric','Trip additions','raw',e.trip_additions,'aggregate',e.agg_trip_additions,'matches',e.trip_additions=e.agg_trip_additions),
      jsonb_build_object('metric','Website clicks','raw',e.website_clicks,'aggregate',e.agg_website_clicks,'matches',e.website_clicks=e.agg_website_clicks),
      jsonb_build_object('metric','Phone actions','raw',e.phone_clicks,'aggregate',e.agg_phone_clicks,'matches',e.phone_clicks=e.agg_phone_clicks),
      jsonb_build_object('metric','Email actions','raw',e.email_clicks,'aggregate',e.agg_email_clicks,'matches',e.email_clicks=e.agg_email_clicks),
      jsonb_build_object('metric','Directions','raw',e.directions_clicks,'aggregate',e.agg_directions_clicks,'matches',e.directions_clicks=e.agg_directions_clicks),
      jsonb_build_object('metric','Passport stamps','raw',e.passport_stamps_added,'aggregate',e.agg_passport_stamps_added,'matches',e.passport_stamps_added=e.agg_passport_stamps_added),
      jsonb_build_object('metric','Region opens','raw',e.region_opens,'aggregate',e.agg_region_opens,'matches',e.region_opens=e.agg_region_opens),
      jsonb_build_object('metric','Region producer views','raw',e.region_producers_views,'aggregate',e.agg_region_producers_views,'matches',e.region_producers_views=e.agg_region_producers_views),
      jsonb_build_object('metric','Affiliate impressions','raw',e.affiliate_impressions,'aggregate',e.agg_affiliate_impressions,'matches',e.affiliate_impressions=e.agg_affiliate_impressions),
      jsonb_build_object('metric','Affiliate clicks','raw',e.affiliate_clicks,'aggregate',e.agg_affiliate_clicks,'matches',e.affiliate_clicks=e.agg_affiliate_clicks)
    ),
    'integrity', jsonb_build_object(
      'duplicate_client_event_ids', e.duplicate_client_event_ids,
      'missing_session_key', e.missing_session_key,
      'authenticated_missing_actor_key', e.authenticated_missing_actor_key,
      'anonymous_with_actor_key', e.anonymous_with_actor_key,
      'producer_event_missing_dimensions', e.producer_event_missing_dimensions,
      'unexpected_event_name', e.unexpected_event_name
    ),
    'note', 'Closed UTC days only. Raw first-party intent events are reconciled against reporting aggregates; this does not convert intent into bookings, visits or purchases.'
  )
  into v_result
  from evaluated e;

  return v_result;
end;
$$;

revoke all on function public.get_analytics_reliability_v1(date, date) from public;
revoke all on function public.get_analytics_reliability_v1(date, date) from anon;
revoke all on function public.get_analytics_reliability_v1(date, date) from authenticated;
grant execute on function public.get_analytics_reliability_v1(date, date) to service_role;
