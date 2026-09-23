import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  trackIntent: vi.fn(async () => ({ success: true, clientEventId: 'evt-partner' })),
}));

vi.mock('./intentAnalytics', () => ({
  trackIntent: mocks.trackIntent,
}));

import {
  getActivePartnerAttribution,
  recordPartnerContactIfAttributed,
  recordPartnerOpen,
  recordPartnerSaveIfAttributed,
} from './partnerAttribution';

const storage = new Map<string, string>();

describe('partnerAttribution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storage.clear();
    vi.stubGlobal('window', {
      sessionStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
      },
    });
  });

  it('starts session attribution on Partner open and reuses it for downstream save/contact', async () => {
    const campaign = {
      campaignId: '11111111-1111-4111-8111-111111111111',
      producerId: 'producer-1',
      campaignType: 'regional_featured' as const,
      placement: 'region_discovery' as const,
      destination: 'crete',
      category: 'winery',
      headline: 'Harvest visits',
      message: null,
      startsAt: null,
      endsAt: null,
    };

    await recordPartnerOpen(campaign, 'region_planning');

    expect(mocks.trackIntent).toHaveBeenCalledWith({
      event: 'partner_open',
      sourceSurface: 'region_planning',
      producerId: 'producer-1',
      partnerCampaignId: campaign.campaignId,
      partnerPlacement: 'region_discovery',
    });

    const active = getActivePartnerAttribution('producer-1');
    expect(active?.campaignId).toBe(campaign.campaignId);

    await recordPartnerSaveIfAttributed('producer-1');
    expect(mocks.trackIntent).toHaveBeenCalledWith({
      event: 'partner_save',
      sourceSurface: 'producer_drawer',
      producerId: 'producer-1',
      partnerCampaignId: campaign.campaignId,
      partnerPlacement: 'region_discovery',
    });

    await recordPartnerContactIfAttributed('producer-1', 'directions', 'producer_drawer');
    expect(mocks.trackIntent).toHaveBeenCalledWith({
      event: 'partner_contact_action',
      sourceSurface: 'producer_drawer',
      producerId: 'producer-1',
      partnerCampaignId: campaign.campaignId,
      partnerPlacement: 'region_discovery',
      partnerAction: 'directions',
    });
  });

  it('fails closed when no attribution exists', async () => {
    await recordPartnerSaveIfAttributed('producer-2');
    expect(mocks.trackIntent).not.toHaveBeenCalled();
  });
});
