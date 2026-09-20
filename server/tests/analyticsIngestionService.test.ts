import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ingestIntentEvent } from '../services/analyticsIngestionService';

test('ingestIntentEvent calls the deployed RPC with the exact Phase 14.2 parameter contract', async () => {
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
  assert.equal(rpcName, 'ingest_intent_event_v1');
  assert.deepEqual(Object.keys(rpcArgs ?? {}).sort(), [
    'p_actor_key',
    'p_actor_scope',
    'p_affiliate_campaign',
    'p_client_event_id',
    'p_destination',
    'p_event_name',
    'p_producer_id',
    'p_schema_version',
    'p_session_key',
    'p_source_surface',
  ]);
  assert.equal(rpcArgs?.p_client_event_id, '11111111-1111-4111-8111-111111111111');
  assert.equal(rpcArgs?.p_event_name, 'producer_view');
  assert.equal(rpcArgs?.p_destination, null);
  assert.equal('country_code' in (rpcArgs ?? {}), false);
  assert.equal('category' in (rpcArgs ?? {}), false);
});
