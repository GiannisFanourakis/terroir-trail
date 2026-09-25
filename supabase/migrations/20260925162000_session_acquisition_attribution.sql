-- Session-level external acquisition attribution for first-party analytics.
-- Stores only coarse, allowlisted source/channel values and a bounded campaign slug.
-- Raw referrer URLs, arbitrary query parameters, IP addresses, and personal identifiers are not persisted.

create table if not exists analytics.session_acquisition (
  session_key text primary key
    check (session_key ~ '^v[1-9][0-9]*:[0-9a-f]{64}$'),
  external_source text not null
    check (external_source = any (array[
      'direct'::text,
      'instagram'::text,
      'facebook'::text,
      'threads'::text,
      'tiktok'::text,
      'reddit'::text,
      'youtube'::text,
      'linkedin'::text,
      'pinterest'::text,
      'x'::text,
      'google'::text,
      'bing'::text,
      'duckduckgo'::text,
      'email'::text,
      'other'::text
    ])),
  external_channel text not null
    check (external_channel = any (array[
      'direct'::text,
      'social'::text,
      'search'::text,
      'email'::text,
      'referral'::text,
      'other'::text
    ])),
  campaign text null
    check (
      campaign is null
      or (
        char_length(campaign) between 1 and 64
        and campaign ~ '^[a-z0-9][a-z0-9_-]{0,63}$'
      )
    ),
  attribution_method text not null
    check (attribution_method = any (array[
      'utm'::text,
      'referrer'::text,
      'direct'::text
    ])),
  first_seen_at timestamptz not null default now()
);

comment on table analytics.session_acquisition is
  'First-touch session acquisition attribution for TerroirTrail first-party analytics. Uses the same HMAC-pseudonymous session key as intent_events. Stores only coarse external source/channel, a bounded campaign slug, and attribution method. No raw referrer URL, arbitrary URL metadata, IP address, raw Firebase UID, or precise personal location. Raw retention: 180 days.';

comment on column analytics.session_acquisition.external_source is
  'Allowlisted coarse external source derived client-side from trusted UTM values or referrer hostname; never a raw hostname or URL.';

comment on column analytics.session_acquisition.external_channel is
  'Coarse acquisition channel: direct, social, search, email, referral, or other.';

comment on column analytics.session_acquisition.campaign is
  'Optional normalized campaign slug from utm_campaign; null unless it matches the strict bounded slug contract.';

comment on column analytics.session_acquisition.attribution_method is
  'How attribution was derived: explicit UTM parameters, coarse referrer classification, or direct.';

alter table analytics.session_acquisition enable row level security;

revoke all on table analytics.session_acquisition from public, anon, authenticated;
grant select, insert, update, delete on table analytics.session_acquisition to service_role;

create index if not exists session_acquisition_first_seen_idx
  on analytics.session_acquisition (first_seen_at desc);

create index if not exists session_acquisition_source_channel_idx
  on analytics.session_acquisition (external_source, external_channel, first_seen_at desc);

create index if not exists session_acquisition_campaign_idx
  on analytics.session_acquisition (campaign, first_seen_at desc)
  where campaign is not null;

create or replace function public.ingest_session_acquisition_v1(
  p_session_key text,
  p_external_source text,
  p_external_channel text,
  p_campaign text,
  p_attribution_method text
)
returns table(stored_session_key text, inserted boolean)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_rows bigint := 0;
begin
  insert into analytics.session_acquisition (
    session_key,
    external_source,
    external_channel,
    campaign,
    attribution_method
  )
  values (
    p_session_key,
    p_external_source,
    p_external_channel,
    p_campaign,
    p_attribution_method
  )
  on conflict (session_key) do nothing;

  get diagnostics v_rows = row_count;

  return query select p_session_key, (v_rows = 1);
end;
$function$;

revoke all on function public.ingest_session_acquisition_v1(text, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.ingest_session_acquisition_v1(text, text, text, text, text)
  to service_role;

create or replace function analytics.purge_expired_session_acquisition(
  p_cutoff timestamptz default (now() - interval '180 days')
)
returns bigint
language plpgsql
set search_path = ''
as $function$
declare
  v_deleted bigint;
begin
  delete from analytics.session_acquisition
  where first_seen_at < p_cutoff;

  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$function$;

create or replace function analytics.run_retention_maintenance()
returns void
language plpgsql
set search_path = ''
as $function$
begin
  perform analytics.purge_expired_intent_events();
  perform analytics.purge_expired_session_acquisition();
  perform analytics.purge_expired_aggregates();
  perform analytics.purge_expired_partner_campaign_aggregates();
end;
$function$;
