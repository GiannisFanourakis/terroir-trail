import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const authoritySql = fs.readFileSync(
  path.resolve(process.cwd(), 'supabase/migrations/20260923070927_phase15_partner_stripe_authority.sql'),
  'utf8'
);
const orderingSql = fs.readFileSync(
  path.resolve(process.cwd(), 'supabase/migrations/20260923071920_phase15_partner_stripe_event_ordering.sql'),
  'utf8'
);

test('Partner Stripe event ledger is RLS protected and service-role only', () => {
  assert.match(authoritySql, /create table if not exists public\.commercial_partner_stripe_events/i);
  assert.match(authoritySql, /alter table public\.commercial_partner_stripe_events enable row level security/i);
  assert.match(
    authoritySql,
    /revoke all on table public\.commercial_partner_stripe_events from public, anon, authenticated/i
  );
  assert.match(
    authoritySql,
    /grant select, insert, update, delete on table public\.commercial_partner_stripe_events to service_role/i
  );
});

test('Partner billing RPCs are not browser executable and grace expiry is scheduled', () => {
  for (const fn of [
    'prepare_commercial_partner_checkout_v1',
    'apply_stripe_partner_subscription_event_v1',
    'expire_commercial_partner_grace_v1',
  ]) {
    assert.match(authoritySql, new RegExp(`revoke all on function public\\.${fn}\\(`, 'i'));
    assert.match(authoritySql, new RegExp(`grant execute on function public\\.${fn}\\(`, 'i'));
  }
  assert.match(authoritySql, /terroirtrail-partner-grace-expiry-hourly/);
  assert.match(authoritySql, /Payment recovery grace period expired/);
});

test('Stripe event ordering guard records stale events without changing entitlement', () => {
  assert.match(orderingSql, /max\(e\.provider_created_at\)/i);
  assert.match(orderingSql, /p_provider_created_at < v_latest_provider_created_at/i);
  assert.match(orderingSql, /'processed', false, 'duplicate', false, 'stale', true/i);
  assert.match(orderingSql, /v_old_subscription_status in \('cancelled','expired'\)/i);
});

test('Partner Stripe authority never mutates free catalogue publication or trust facts', () => {
  assert.doesNotMatch(authoritySql + orderingSql, /update\s+public\.producers/i);
  assert.doesNotMatch(authoritySql + orderingSql, /set\s+(?:[^;]*\b)?(?:visit_status|road_access_status|location_status|is_active)\s*=/i);
  assert.doesNotMatch(authoritySql + orderingSql, /isProTier|is_pro_tier/i);
});
