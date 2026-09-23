import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const migrationPath = path.resolve(
  process.cwd(),
  'supabase/migrations/20260923064747_phase15_partner_host_admin_commercial.sql'
);
const sql = fs.readFileSync(migrationPath, 'utf8');

test('Host campaign results RPC is service-role only and reads aggregate analytics', () => {
  assert.match(sql, /create or replace function public\.get_partner_campaign_results_v1/i);
  assert.match(sql, /security definer/i);
  assert.match(sql, /analytics\.partner_campaign_intent_daily/i);
  assert.match(
    sql,
    /revoke all on function public\.get_partner_campaign_results_v1\(text\[\]\) from public, anon, authenticated/i
  );
  assert.match(
    sql,
    /grant execute on function public\.get_partner_campaign_results_v1\(text\[\]\) to service_role/i
  );
});

test('Admin campaign editing is pre-public, audited and service-role only', () => {
  assert.match(sql, /create or replace function public\.update_commercial_partner_campaign_v1/i);
  assert.match(sql, /security invoker/i);
  assert.match(sql, /status not in \('draft','rejected'\)/i);
  assert.match(sql, /campaign_not_editable/i);
  assert.match(sql, /'campaign_updated'/i);
  assert.match(
    sql,
    /revoke all on function public\.update_commercial_partner_campaign_v1\([\s\S]+?from public, anon, authenticated/i
  );
  assert.match(
    sql,
    /grant execute on function public\.update_commercial_partner_campaign_v1\([\s\S]+?to service_role/i
  );
});
