-- Extend admin producer insight reporting with distinct producer-view sessions
-- and first-touch acquisition attribution. No new tracking infrastructure is added:
-- this reuses analytics.intent_events.session_key and analytics.session_acquisition.
--
-- Important evidence semantics:
-- * "unique_view_sessions" means distinct analytics sessions that viewed a producer,
--   not unique human visitors.
-- * acquisition is first-touch, coarse and allowlisted.
-- * sessions without a session_acquisition row remain explicitly unattributed;
--   they are never silently classified as direct.

create or replace function public.get_intent_baseline_v2(
  p_start_date date,
  p_end_date date
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_result jsonb;
  v_window_days integer;
begin
  if p_start_date is null or p_end_date is null or p_end_date < p_start_date then
    raise exception 'Invalid report date range';
  end if;

  if (p_end_date - p_start_date) > 730 then
    raise exception 'Report date range exceeds 730 days';
  end if;

  v_window_days := (p_end_date - p_start_date) + 1;

  with
  producer_rows as (
    select
      a.producer_id,
      coalesce(p.name, a.producer_id) as producer_name,
      a.destination,
      max(a.country_code) as country_code,
      a.category,
      sum(a.producer_views)::bigint as producer_views,
      sum(a.saves)::bigint as saves,
      sum(a.trip_additions)::bigint as trip_additions,
      sum(a.website_clicks)::bigint as website_clicks,
      sum(a.phone_clicks)::bigint as phone_clicks,
      sum(a.email_clicks)::bigint as email_clicks,
      sum(a.website_clicks + a.phone_clicks + a.email_clicks)::bigint as direct_producer_actions,
      sum(a.directions_clicks)::bigint as directions_clicks,
      sum(a.passport_stamps_added)::bigint as passport_stamps_added
    from analytics.producer_intent_daily a
    left join public.producers p on p.id = a.producer_id
    where a.day between p_start_date and p_end_date
    group by a.producer_id, p.name, a.destination, a.category
  ),
  previous_producer_rows as (
    select
      a.producer_id,
      sum(a.producer_views)::bigint as producer_views,
      sum(a.saves)::bigint as saves,
      sum(a.trip_additions)::bigint as trip_additions,
      sum(a.website_clicks)::bigint as website_clicks,
      sum(a.phone_clicks)::bigint as phone_clicks,
      sum(a.email_clicks)::bigint as email_clicks,
      sum(a.directions_clicks)::bigint as directions_clicks
    from analytics.producer_intent_daily a
    where a.day between (p_start_date - v_window_days) and (p_start_date - 1)
    group by a.producer_id
  ),
  producer_view_sessions as (
    select
      e.producer_id,
      count(distinct e.session_key)::bigint as unique_view_sessions
    from analytics.intent_events e
    where e.event_name = 'producer_view'
      and e.producer_id is not null
      and e.occurred_at >= p_start_date::timestamptz
      and e.occurred_at < (p_end_date + 1)::timestamptz
    group by e.producer_id
  ),
  previous_producer_view_sessions as (
    select
      e.producer_id,
      count(distinct e.session_key)::bigint as unique_view_sessions
    from analytics.intent_events e
    where e.event_name = 'producer_view'
      and e.producer_id is not null
      and e.occurred_at >= (p_start_date - v_window_days)::timestamptz
      and e.occurred_at < p_start_date::timestamptz
    group by e.producer_id
  ),
  producer_acquisition_rows as (
    select
      e.producer_id,
      a.external_source,
      a.external_channel,
      count(distinct e.session_key)::bigint as sessions
    from analytics.intent_events e
    join analytics.session_acquisition a on a.session_key = e.session_key
    where e.event_name = 'producer_view'
      and e.producer_id is not null
      and e.occurred_at >= p_start_date::timestamptz
      and e.occurred_at < (p_end_date + 1)::timestamptz
    group by e.producer_id, a.external_source, a.external_channel
  ),
  producer_attributed_sessions as (
    select
      producer_id,
      sum(sessions)::bigint as attributed_view_sessions
    from producer_acquisition_rows
    group by producer_id
  ),
  platform_view_sessions as (
    select
      count(distinct e.session_key)::bigint as unique_view_sessions,
      count(distinct e.session_key) filter (where a.session_key is not null)::bigint as attributed_view_sessions
    from analytics.intent_events e
    left join analytics.session_acquisition a on a.session_key = e.session_key
    where e.event_name = 'producer_view'
      and e.occurred_at >= p_start_date::timestamptz
      and e.occurred_at < (p_end_date + 1)::timestamptz
  ),
  region_rows as (
    select
      a.destination,
      max(a.country_code) as country_code,
      sum(a.region_opens)::bigint as region_opens,
      sum(a.region_producers_views)::bigint as region_producers_views,
      sum(a.producer_views)::bigint as producer_views,
      sum(a.saves)::bigint as saves,
      sum(a.trip_additions)::bigint as trip_additions,
      sum(a.direct_producer_actions)::bigint as direct_producer_actions,
      sum(a.directions_clicks)::bigint as directions_clicks,
      sum(a.passport_stamps_added)::bigint as passport_stamps_added
    from analytics.region_intent_daily a
    where a.day between p_start_date and p_end_date
    group by a.destination
  ),
  category_rows as (
    select
      a.category,
      sum(a.producer_views)::bigint as producer_views,
      sum(a.saves)::bigint as saves,
      sum(a.trip_additions)::bigint as trip_additions,
      sum(a.direct_producer_actions)::bigint as direct_producer_actions,
      sum(a.directions_clicks)::bigint as directions_clicks
    from analytics.category_intent_daily a
    where a.day between p_start_date and p_end_date
    group by a.category
  ),
  affiliate_rows as (
    select
      a.affiliate_campaign,
      max(c.label) as campaign_label,
      a.source_surface,
      nullif(a.destination_key, '') as destination,
      sum(a.impressions)::bigint as impressions,
      sum(a.clicks)::bigint as clicks
    from analytics.affiliate_intent_daily a
    left join analytics.affiliate_campaigns c on c.id = a.affiliate_campaign
    where a.day between p_start_date and p_end_date
    group by a.affiliate_campaign, a.source_surface, a.destination_key
  ),
  totals as (
    select
      coalesce(sum(producer_views), 0)::bigint as producer_views,
      coalesce(sum(saves), 0)::bigint as saves,
      coalesce(sum(trip_additions), 0)::bigint as trip_additions,
      coalesce(sum(website_clicks), 0)::bigint as website_clicks,
      coalesce(sum(phone_clicks), 0)::bigint as phone_clicks,
      coalesce(sum(email_clicks), 0)::bigint as email_clicks,
      coalesce(sum(direct_producer_actions), 0)::bigint as direct_producer_actions,
      coalesce(sum(directions_clicks), 0)::bigint as directions_clicks,
      coalesce(sum(passport_stamps_added), 0)::bigint as passport_stamps_added
    from producer_rows
  ),
  affiliate_totals as (
    select
      coalesce(sum(impressions), 0)::bigint as impressions,
      coalesce(sum(clicks), 0)::bigint as clicks
    from affiliate_rows
  )
  select jsonb_build_object(
    'generated_at', now(),
    'start_date', p_start_date,
    'end_date', p_end_date,
    'aggregate_data_through',
      (select max(day) from (
        select day from analytics.producer_intent_daily
        union all select day from analytics.region_intent_daily
        union all select day from analytics.category_intent_daily
        union all select day from analytics.affiliate_intent_daily
      ) d where day between p_start_date and p_end_date),
    'acquisition_coverage_start',
      (select (min(a.first_seen_at) at time zone 'UTC')::date from analytics.session_acquisition a),
    'comparison_policy', jsonb_build_object(
      'minimum_active_producers', 5,
      'minimum_producer_views', 100,
      'previous_window_days', v_window_days
    ),
    'totals', jsonb_build_object(
      'producer_views', t.producer_views,
      'unique_view_sessions', pvs.unique_view_sessions,
      'attributed_view_sessions', pvs.attributed_view_sessions,
      'unattributed_view_sessions', greatest(pvs.unique_view_sessions - pvs.attributed_view_sessions, 0),
      'saves', t.saves,
      'trip_additions', t.trip_additions,
      'website_clicks', t.website_clicks,
      'phone_clicks', t.phone_clicks,
      'email_clicks', t.email_clicks,
      'direct_producer_actions', t.direct_producer_actions,
      'directions_clicks', t.directions_clicks,
      'passport_stamps_added', t.passport_stamps_added,
      'affiliate_impressions', at.impressions,
      'affiliate_clicks', at.clicks
    ),
    'producers', coalesce((
      select jsonb_agg(jsonb_build_object(
        'producer_id', r.producer_id,
        'producer_name', r.producer_name,
        'destination', r.destination,
        'country_code', r.country_code,
        'category', r.category,
        'producer_views', r.producer_views,
        'unique_view_sessions', coalesce(vs.unique_view_sessions, 0),
        'attributed_view_sessions', coalesce(pas.attributed_view_sessions, 0),
        'unattributed_view_sessions', greatest(
          coalesce(vs.unique_view_sessions, 0) - coalesce(pas.attributed_view_sessions, 0),
          0
        ),
        'acquisition', coalesce((
          select jsonb_agg(jsonb_build_object(
            'source', ar.external_source,
            'channel', ar.external_channel,
            'sessions', ar.sessions
          ) order by ar.sessions desc, ar.external_channel, ar.external_source)
          from producer_acquisition_rows ar
          where ar.producer_id = r.producer_id
        ), '[]'::jsonb),
        'saves', r.saves,
        'trip_additions', r.trip_additions,
        'website_clicks', r.website_clicks,
        'phone_clicks', r.phone_clicks,
        'email_clicks', r.email_clicks,
        'direct_producer_actions', r.direct_producer_actions,
        'directions_clicks', r.directions_clicks,
        'passport_stamps_added', r.passport_stamps_added,
        'previous', jsonb_build_object(
          'producer_views', coalesce(pr.producer_views, 0),
          'unique_view_sessions', coalesce(pvs_prev.unique_view_sessions, 0),
          'saves', coalesce(pr.saves, 0),
          'trip_additions', coalesce(pr.trip_additions, 0),
          'website_clicks', coalesce(pr.website_clicks, 0),
          'phone_clicks', coalesce(pr.phone_clicks, 0),
          'email_clicks', coalesce(pr.email_clicks, 0),
          'directions_clicks', coalesce(pr.directions_clicks, 0)
        )
      ) order by r.producer_views desc, r.saves desc, r.producer_name)
      from producer_rows r
      left join previous_producer_rows pr on pr.producer_id = r.producer_id
      left join producer_view_sessions vs on vs.producer_id = r.producer_id
      left join previous_producer_view_sessions pvs_prev on pvs_prev.producer_id = r.producer_id
      left join producer_attributed_sessions pas on pas.producer_id = r.producer_id
    ), '[]'::jsonb),
    'regions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'destination', r.destination,
        'country_code', r.country_code,
        'producer_count', (select count(*) from producer_rows p where p.destination = r.destination),
        'region_opens', r.region_opens,
        'region_producers_views', r.region_producers_views,
        'producer_views', r.producer_views,
        'saves', r.saves,
        'trip_additions', r.trip_additions,
        'direct_producer_actions', r.direct_producer_actions,
        'directions_clicks', r.directions_clicks,
        'passport_stamps_added', r.passport_stamps_added
      ) order by r.producer_views desc, r.region_opens desc, r.destination)
      from region_rows r
    ), '[]'::jsonb),
    'categories', coalesce((
      select jsonb_agg(jsonb_build_object(
        'category', r.category,
        'producer_count', (select count(*) from producer_rows p where p.category = r.category),
        'producer_views', r.producer_views,
        'saves', r.saves,
        'trip_additions', r.trip_additions,
        'direct_producer_actions', r.direct_producer_actions,
        'directions_clicks', r.directions_clicks
      ) order by r.producer_views desc, r.saves desc, r.category)
      from category_rows r
    ), '[]'::jsonb),
    'affiliates', coalesce((
      select jsonb_agg(jsonb_build_object(
        'affiliate_campaign', r.affiliate_campaign,
        'campaign_label', r.campaign_label,
        'source_surface', r.source_surface,
        'destination', r.destination,
        'impressions', r.impressions,
        'clicks', r.clicks,
        'ctr', case
          when r.impressions > 0
            then round((r.clicks::numeric / r.impressions::numeric) * 100, 2)
          else null
        end
      ) order by r.impressions desc, r.clicks desc, r.affiliate_campaign)
      from affiliate_rows r
    ), '[]'::jsonb)
  )
  into v_result
  from totals t
  cross join affiliate_totals at
  cross join platform_view_sessions pvs;

  return v_result;
end;
$function$;

revoke all on function public.get_intent_baseline_v2(date, date)
  from public, anon, authenticated;
grant execute on function public.get_intent_baseline_v2(date, date)
  to service_role;
