import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getActivePartnerPlacements,
  PartnerPlacementError,
} from '../services/partnerPlacementService';

function makeSupabase(dataByTable: Record<string, unknown[]>) {
  return {
    from(table: string) {
      const builder: any = {
        select: () => builder,
        eq: () => builder,
        in: () => builder,
        order: () => builder,
        limit: () => builder,
        then(resolve: (value: any) => void) {
          resolve({ data: dataByTable[table] || [], error: null });
        },
      };
      return builder;
    },
  };
}

test('Partner placement serving returns only date-valid, placement-valid active producer campaigns', async () => {
  const now = new Date('2026-09-23T12:00:00Z');
  const supabase = makeSupabase({
    commercial_partner_campaigns: [
      {
        id: '11111111-1111-4111-8111-111111111111',
        producer_id: 'producer-good',
        campaign_type: 'regional_featured',
        destination: 'crete',
        category: 'winery',
        headline: 'Harvest visits',
        message: 'Open for autumn visits.',
        starts_at: '2026-09-22T00:00:00Z',
        ends_at: '2026-09-25T00:00:00Z',
        created_at: '2026-09-20T00:00:00Z',
      },
      {
        id: '22222222-2222-4222-8222-222222222222',
        producer_id: 'producer-future',
        campaign_type: 'regional_featured',
        destination: 'crete',
        category: 'winery',
        headline: 'Future',
        message: null,
        starts_at: '2026-09-24T00:00:00Z',
        ends_at: null,
        created_at: '2026-09-20T00:00:00Z',
      },
      {
        id: '33333333-3333-4333-8333-333333333333',
        producer_id: 'producer-expired',
        campaign_type: 'regional_featured',
        destination: 'crete',
        category: 'winery',
        headline: 'Expired',
        message: null,
        starts_at: '2026-09-20T00:00:00Z',
        ends_at: '2026-09-23T11:59:59Z',
        created_at: '2026-09-20T00:00:00Z',
      },
      {
        id: '44444444-4444-4444-8444-444444444444',
        producer_id: 'producer-wrong-category',
        campaign_type: 'regional_featured',
        destination: 'crete',
        category: 'apiary',
        headline: 'Wrong category',
        message: null,
        starts_at: null,
        ends_at: null,
        created_at: '2026-09-20T00:00:00Z',
      },
      {
        id: '55555555-5555-4555-8555-555555555555',
        producer_id: 'producer-inactive-partner',
        campaign_type: 'regional_featured',
        destination: 'crete',
        category: 'winery',
        headline: 'Inactive partner',
        message: null,
        starts_at: null,
        ends_at: null,
        created_at: '2026-09-20T00:00:00Z',
      },
    ],
    commercial_partner_campaign_placements: [
      { campaign_id: '11111111-1111-4111-8111-111111111111', placement: 'region_discovery' },
      { campaign_id: '55555555-5555-4555-8555-555555555555', placement: 'region_discovery' },
    ],
    commercial_partner_accounts: [
      { producer_id: 'producer-good' },
    ],
    producers: [
      { id: 'producer-good' },
      { id: 'producer-inactive-partner' },
    ],
  });

  const result = await getActivePartnerPlacements(
    {
      placement: 'region_discovery',
      destination: 'crete',
      category: 'winery',
      now,
      limit: 5,
    },
    supabase as any
  );

  assert.deepEqual(result, [{
    campaignId: '11111111-1111-4111-8111-111111111111',
    producerId: 'producer-good',
    campaignType: 'regional_featured',
    placement: 'region_discovery',
    destination: 'crete',
    category: 'winery',
    headline: 'Harvest visits',
    message: 'Open for autumn visits.',
    startsAt: '2026-09-22T00:00:00Z',
    endsAt: '2026-09-25T00:00:00Z',
  }]);
});

test('Partner placement serving rejects unknown placement and destination context', async () => {
  const supabase = makeSupabase({});

  await assert.rejects(
    getActivePartnerPlacements(
      { placement: 'organic_rank', destination: 'crete' },
      supabase as any
    ),
    (error: unknown) =>
      error instanceof PartnerPlacementError && error.code === 'bad_request'
  );

  await assert.rejects(
    getActivePartnerPlacements(
      { placement: 'region_discovery', destination: 'unknown_region' },
      supabase as any
    ),
    (error: unknown) =>
      error instanceof PartnerPlacementError && error.code === 'bad_request'
  );
});
