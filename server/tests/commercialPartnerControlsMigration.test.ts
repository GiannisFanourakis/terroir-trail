import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read = (name: string) =>
  fs.readFileSync(path.resolve(process.cwd(), 'supabase/migrations', name), 'utf8');

const controls = read('20260923065035_phase15_partner_controls_reporting.sql');
const hardening = read('20260923065927_phase15_partner_lifecycle_hardening.sql');

test('Block C commercial RPCs remain service-role only', () => {
  for (const fn of [
    'update_commercial_partner_campaign_v1',
    'get_partner_campaign_report_v1',
    'reconcile_commercial_partner_campaigns_v1',
  ]) {
    assert.match(
      controls,
      new RegExp(`revoke all on function public\\.${fn}\\([^;]+from public, anon, authenticated`, 'is')
    );
    assert.match(
      controls,
      new RegExp(`grant execute on function public\\.${fn}\\([^;]+to service_role`, 'is')
    );
  }

  for (const fn of [
    'guard_commercial_partner_campaign_public_state_v1',
    'withdraw_campaigns_when_partner_ends_v1',
  ]) {
    assert.match(
      hardening,
      new RegExp(`revoke all on function public\\.${fn}\\([^;]*\\)[^;]*from public, anon, authenticated`, 'is')
    );
    assert.match(
      hardening,
      new RegExp(`grant execute on function public\\.${fn}\\([^;]*\\)[^;]*to service_role`, 'is')
    );
  }
});

test('Block C scheduled campaign lifecycle fails closed and reconciles automatically', () => {
  assert.match(controls, /active_partner_required/);
  assert.match(controls, /future_start_required_for_scheduled_campaign/);
  assert.match(controls, /campaign_not_started/);
  assert.match(controls, /campaign_already_ended/);
  assert.match(controls, /terroirtrail-partner-campaign-reconcile/);
  assert.match(controls, /\*\/5 \* \* \* \*/);
  assert.match(controls, /Scheduled campaign start reached\./);
  assert.match(controls, /Campaign end reached\./);
});

test('ending a Partner relationship withdraws unfinished campaigns without touching the free listing', () => {
  assert.match(hardening, /commercial_partner_end_withdraw_campaigns/);
  assert.match(hardening, /status not in \('completed','withdrawn'\)/);
  assert.match(hardening, /status = 'withdrawn'/);
  assert.match(hardening, /Commercial Partner relationship ended\./);
  assert.doesNotMatch(hardening, /update\s+public\.producers/i);
});

test('Block C stays separate from legacy Pro-tier authority', () => {
  assert.doesNotMatch(controls, /isProTier|is_pro_tier/i);
  assert.doesNotMatch(hardening, /isProTier|is_pro_tier/i);
});
