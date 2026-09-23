import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { Producer } from '../../types/terroir';
import type { ActivePartnerPlacement } from '../../services/partnerPlacementApi';

vi.mock('../../services/partnerAttribution', () => ({
  recordPartnerImpression: vi.fn(async () => null),
  recordPartnerOpen: vi.fn(async () => null),
}));

import { PartnerPlacementCard } from './PartnerPlacement';

const producer: Producer = {
  id: 'producer-1',
  name: 'Family Estate',
  greekName: 'Family Estate',
  category: 'winery',
  destination: 'crete',
  region: 'Heraklion',
  village: 'Archanes',
  coordinates: [35.23, 25.16],
  coverImage: '',
  gallery: [],
  tagLine: 'Small family winery',
  description: '',
  story: '',
  indigenousVarieties: [],
  tastingHighlights: [],
  openingHours: '',
  ethos: ['family_estate'],
};

const campaign: ActivePartnerPlacement = {
  campaignId: '11111111-1111-4111-8111-111111111111',
  producerId: producer.id,
  campaignType: 'regional_featured',
  placement: 'region_discovery',
  destination: 'crete',
  category: 'winery',
  headline: 'Harvest visits this week',
  message: 'Family-hosted tastings during the harvest period.',
  startsAt: null,
  endsAt: null,
};

describe('PartnerPlacementCard', () => {
  it('renders explicit paid disclosure without trust or safety claims', () => {
    const html = renderToString(
      <PartnerPlacementCard
        campaign={campaign}
        producer={producer}
        sourceSurface="region_planning"
        onOpenProducer={vi.fn()}
      />
    );

    expect(html).toContain('Featured Partner');
    expect(html).toContain('Paid placement');
    expect(html).toContain('Family Estate');
    expect(html).toContain('Harvest visits this week');
    expect(html).toContain('Payment does not change TerroirTrail verification');
    expect(html).toContain('organic producer ordering');
    expect(html).not.toContain('safer');
    expect(html).not.toContain('verified Partner');
  });
});
