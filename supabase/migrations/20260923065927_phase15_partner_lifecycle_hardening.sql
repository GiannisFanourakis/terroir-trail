revoke all on function public.guard_commercial_partner_campaign_public_state_v1()
  from public, anon, authenticated;
grant execute on function public.guard_commercial_partner_campaign_public_state_v1()
  to service_role;

create or replace function public.withdraw_campaigns_when_partner_ends_v1()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_campaign record;
begin
  if new.status = 'ended' and old.status is distinct from 'ended' then
    for v_campaign in
      select c.id, c.producer_id, c.status
      from public.commercial_partner_campaigns c
      where c.producer_id = new.producer_id
        and c.status not in ('completed','withdrawn')
      order by c.created_at, c.id
      for update
    loop
      update public.commercial_partner_campaigns
      set
        status = 'withdrawn',
        completed_at = now(),
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
        'withdrawn',
        'Commercial Partner relationship ended.'
      );
    end loop;
  end if;

  return new;
end;
$$;

revoke all on function public.withdraw_campaigns_when_partner_ends_v1()
  from public, anon, authenticated;
grant execute on function public.withdraw_campaigns_when_partner_ends_v1()
  to service_role;

drop trigger if exists commercial_partner_end_withdraw_campaigns
  on public.commercial_partner_accounts;

create trigger commercial_partner_end_withdraw_campaigns
after update of status on public.commercial_partner_accounts
for each row
execute function public.withdraw_campaigns_when_partner_ends_v1();

notify pgrst, 'reload schema';
