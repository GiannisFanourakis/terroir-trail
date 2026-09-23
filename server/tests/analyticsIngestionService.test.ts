import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  deleteIntentEventsForFirebaseUid,
  exportIntentEventsForFirebaseUid,
  ingestIntentEvent,
} from '../services/analyticsIngestionService';

test('ingestIntentEvent calls the deployed v2 RPC while preserving legacy events', async () => {
  let rpcName = '';
  let rpcArgs: Record<string, unknown> | null = null;

  const fakeSupabase = {
    rpc: async (name: string, args: Record<string, unknown>) => {
      rpcName = name;
      rpcArgs = args;
      return { data: [{ event_id: '00000000-0000-4000-8000-000000000001', inserted: true }], error: null };
    },
  } as unknown as SupabaseClient;

  const result = await ingestIntentEvent(
    {
      clientEventId: '11111111-1111-4111-8111-111111111111',
      eventName: 'producer_view',
      actorScope: 'anonymous',
      actorKey: null,
      sessionKey: `v1:${'a'.repeat(64)}`,
      producerId: 'example-producer',
      destination: null,
      countryCode: 'GR',
      category: 'winery',
      sourceSurface: 'map_quick_card',
      affiliateCampaign: null,
      schemaVersion: 1,
    },
    fakeSupabase
  );

  assert.equal(result.success, true);
  assert.equal(rpcName, 'ingest_intent_event_v2');
  assert.deepEqual(Object.keys(rpcArgs ?? {}).sort(), [
    'p_actor_key',
    'p_actor_scope',
    'p_affiliate_campaign',
    'p_client_event_id',
    'p_destination',
    'p_event_name',
    'p_partner_action',
    'p_partner_campaign_id',
    'p_partner_placement',
    'p_producer_id',
    'p_schema_version',
    'p_session_key',
    'p_source_surface',
  ]);
  const capturedArgs = rpcArgs as unknown as Record<string, unknown>;
  assert.equal(capturedArgs.p_client_event_id, '11111111-1111-4111-8111-111111111111');
  assert.equal(capturedArgs.p_event_name, 'producer_view');
  assert.equal(capturedArgs.p_destination, null);
  assert.equal('country_code' in capturedArgs, false);
  assert.equal('category' in capturedArgs, false);
  assert.equal(capturedArgs.p_partner_campaign_id, null);
  assert.equal(capturedArgs.p_partner_placement, null);
  assert.equal(capturedArgs.p_partner_action, null);
});

test('ingestIntentEvent forwards allowlisted Partner attribution fields to v2', async () => {
  let rpcName = '';
  let rpcArgs: Record<string, unknown> | null = null;

  const fakeSupabase = {
    rpc: async (name: string, args: Record<string, unknown>) => {
      rpcName = name;
      rpcArgs = args;
      return { data: [{ event_id: '00000000-0000-4000-8000-000000000002', inserted: true }], error: null };
    },
  } as unknown as SupabaseClient;

  const result = await ingestIntentEvent(
    {
      clientEventId: '22222222-2222-4222-8222-222222222222',
      eventName: 'partner_contact_action',
      actorScope: 'anonymous',
      actorKey: null,
      sessionKey: `v1:${'b'.repeat(64)}`,
      producerId: 'producer-1',
      destination: 'crete',
      countryCode: 'GR',
      category: 'winery',
      sourceSurface: 'producer_drawer',
      affiliateCampaign: null,
      partnerCampaignId: '33333333-3333-4333-8333-333333333333',
      partnerPlacement: 'region_discovery',
      partnerAction: 'website',
      schemaVersion: 1,
    },
    fakeSupabase
  );

  assert.equal(result.success, true);
  assert.equal(rpcName, 'ingest_intent_event_v2');
  const args = rpcArgs as unknown as Record<string, unknown>;
  assert.equal(args.p_partner_campaign_id, '33333333-3333-4333-8333-333333333333');
  assert.equal(args.p_partner_placement, 'region_discovery');
  assert.equal(args.p_partner_action, 'website');
});


test('analytics privacy helpers use service-only RPC contracts with derived actor keys', async () => {
  const calls: Array<{ name: string; args: Record<string, unknown> }> = [];
  const fakeSupabase = {
    rpc: async (name: string, args: Record<string, unknown>) => {
      calls.push({ name, args });
      if (name === 'export_intent_events_v1') {
        return { data: [{ event_name: 'producer_view' }], error: null };
      }
      return { data: 2, error: null };
    },
  } as unknown as SupabaseClient;

  const secret = 'x'.repeat(32);
  const exported = await exportIntentEventsForFirebaseUid('firebase-user-1', fakeSupabase, secret);
  const deleted = await deleteIntentEventsForFirebaseUid('firebase-user-1', fakeSupabase, secret);

  assert.deepEqual(exported, [{ event_name: 'producer_view' }]);
  assert.equal(deleted, 2);
  assert.equal(calls[0].name, 'export_intent_events_v1');
  assert.equal(calls[1].name, 'delete_intent_actor_v1');
  assert.deepEqual(Object.keys(calls[0].args), ['p_actor_key']);
  assert.deepEqual(Object.keys(calls[1].args), ['p_actor_key']);
  assert.match(String(calls[0].args.p_actor_key), /^v1:[0-9a-f]{64}$/);
  assert.equal(calls[0].args.p_actor_key, calls[1].args.p_actor_key);
});
