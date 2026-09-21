import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { TripItemRecordV1 } from '../../services/tripApi';
import type { Producer } from '../../types/terroir';
import { TripProducerItem } from './TripProducerItem';

const sampleProducer: Producer = {
  id: 'prod-active-1',
  name: 'Domaine Sigalas',
  greekName: 'Κτήμα Σιγάλα',
  category: 'winery',
  destination: 'santorini',
  region: 'Cyclades',
  village: 'Oia',
  coordinates: [36.462, 25.375],
  description: 'Volcanic wines of Santorini.',
  story: 'Cultivating native vines in black volcanic pumice.',
  coverImage: '/images/estates/sigalas.jpg',
  gallery: [],
  indigenousVarieties: ['Assyrtiko'],
  tastingHighlights: ['Volcanic Assyrtiko Flight'],
  ethos: ['organic'],
  googleMapsUrl: 'https://maps.google.com/?cid=12345',
  visitStatus: 'public_visits',
  roadAccessStatus: 'verified',
  roadAccess: 'paved',
  tagLine: 'Volcanic terroir wines from Santorini',
  openingHours: 'Mon-Sat 10:00 - 18:00',
};

const sampleItem: TripItemRecordV1 = {
  producerId: 'prod-active-1',
  position: 0,
  dayNumber: 1,
  createdAt: '2026-05-10T12:00:00Z',
  updatedAt: '2026-05-10T12:00:00Z',
};

describe('TripProducerItem', () => {
  it('renders active producer with directions and day selector', () => {
    const html = renderToString(
      <TripProducerItem
        item={sampleItem}
        position={0}
        totalCount={3}
        producerState="active"
        producer={sampleProducer}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
        onAssignDay={vi.fn()}
        onRemove={vi.fn()}
        onSelectProducer={vi.fn()}
      />
    );

    expect(html).toContain('Domaine Sigalas');
    expect(html).toContain('Santorini');
    expect(html).toContain('Oia');
    expect(html).toContain('winery');
    expect(html).toContain('title="Get directions"');
    expect(html).toContain('Day 1');
    expect(html).toContain('aria-label="Remove Domaine Sigalas from trip"');
    // First item: Move Up is disabled
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*aria-label="Move item 1 up"/);
    // Not last item: Move Down is enabled
    expect(html).not.toMatch(/<button[^>]*disabled=""[^>]*aria-label="Move item 1 down"/);
  });

  it('suppresses direct navigation when road access requires 4x4 or high clearance', () => {
    const roughRoadProducer: Producer = {
      ...sampleProducer,
      roadAccess: '4x4_required',
    };

    const html = renderToString(
      <TripProducerItem
        item={sampleItem}
        position={1}
        totalCount={3}
        producerState="active"
        producer={roughRoadProducer}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
        onAssignDay={vi.fn()}
        onRemove={vi.fn()}
        onSelectProducer={vi.fn()}
      />
    );

    expect(html).toContain('Domaine Sigalas');
    // Directions link should be completely suppressed for safety
    expect(html).not.toContain('title="Get directions"');
    expect(html).not.toContain('title="Open in Google Maps"');
  });

  it('renders safe unavailable notice without leaking internal reasons or maps links', () => {
    const html = renderToString(
      <TripProducerItem
        item={sampleItem}
        position={1}
        totalCount={3}
        producerState="unavailable"
        producer={sampleProducer}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
        onAssignDay={vi.fn()}
        onRemove={vi.fn()}
        onSelectProducer={vi.fn()}
      />
    );

    expect(html).toContain('Producer currently unavailable on TerroirTrail');
    expect(html).not.toContain('title="Get directions"');
    expect(html).not.toContain('Domaine Sigalas');
  });

  it('renders safe delisted notice when producer is no_longer_listed', () => {
    const html = renderToString(
      <TripProducerItem
        item={sampleItem}
        position={2}
        totalCount={3}
        producerState="no_longer_listed"
        producer={undefined}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
        onAssignDay={vi.fn()}
        onRemove={vi.fn()}
        onSelectProducer={vi.fn()}
      />
    );

    expect(html).toContain('Producer no longer listed on TerroirTrail');
    // Last item of 3: Move Down is disabled
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*aria-label="Move item 3 down"/);
    expect(html).not.toMatch(/<button[^>]*disabled=""[^>]*aria-label="Move item 3 up"/);
  });

  it('renders preserved fallback message when state check encounters an error', () => {
    const html = renderToString(
      <TripProducerItem
        item={sampleItem}
        position={0}
        totalCount={1}
        isStateError={true}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
        onAssignDay={vi.fn()}
        onRemove={vi.fn()}
        onSelectProducer={vi.fn()}
      />
    );

    expect(html).toContain('Producer details are temporarily unavailable');
    expect(html).toContain('Your trip item is preserved');
  });
});
