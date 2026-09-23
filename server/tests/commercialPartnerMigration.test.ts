import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const migrationPath = path.resolve(
  process.cwd(),
  'supabase/migrations/20260923055613_phase15_partner_commercial_authority.sql'
);
const sql = fs.readFileSync(migrationPath, 'utf8');

const tables = [
  'commercial_partner_accounts',
  'commercial_partner_subscriptions',
  'commercial_partner_campaigns',
  'commercial_partner_campaign_placements',
  'commercial_partner_audit',
];

test('Phase 15 commercial tables are RLS protected and service-role only', () => {
  for (const table of tables) {
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`, 'i'));
    assert.match(
      sql,
      new RegExp(`revoke all on table public\\.${table} from anon, authenticated`, 'i')
    );
    assert.match(
      sql,
      new RegExp(`grant select, insert, update, delete on table public\\.${table} to service_role`, 'i')
    );
  }
});

test('Phase 15 authority RPCs are security invoker and not executable by browser roles', () => {
  const functions = [
    'set_commercial_partner_status_v1',
    'create_commercial_partner_campaign_v1',
    'transition_commercial_partner_campaign_v1',
  ];

  const securityInvokerMatches = sql.match(/security invoker/gi) || [];
  assert.ok(securityInvokerMatches.length >= functions.length);

  for (const fn of functions) {
    assert.match(
      sql,
      new RegExp(`revoke all on function public\\.${fn}\\([^;]+from public, anon, authenticated`, 'is')
    );
    assert.match(
      sql,
      new RegExp(`grant execute on function public\\.${fn}\\([^;]+to service_role`, 'is')
    );
  }
});

test('commercial authority is separate from legacy Pro-tier flags', () => {
  assert.doesNotMatch(sql, /isProTier|is_pro_tier/i);
  assert.match(sql, /activation_source in \('admin_pilot','stripe_subscription'\)/);
  assert.match(sql, /status in \('pending','active','suspended','ended'\)/);
});
