import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { TripRecordV1 } from '../../services/tripApi';
import type { Producer } from '../../types/terroir';
import { AddToTripModal } from './AddToTripModal';

const sampleProducer: Producer = {
  id: 'prod-1',
  name: 'Vassaltis Vineyards',
  greekName: 'Βασάλτης',
  category: 'winery',
  destination: 'santorini',
  region: 'Cyclades',
  village: 'Vourvoulos',
  coordinates: [36.44, 25.43],
  description: 'Modern artisanal winery on Santorini.',
  story: 'Single vineyard expressions of volcanic terroir.',
  coverImage: '/images/estates/vassaltis.jpg',
  gallery: [],
  indigenousVarieties: ['Assyrtiko'],
  tastingHighlights: ['Artisanal Tasting'],
  ethos: ['organic'],
  tagLine: 'Volcanic Assyrtiko',
  openingHours: 'Mon-Sat 10:00 - 18:00',
  visitStatus: 'public_visits',
  roadAccessStatus: 'verified',
  roadAccess: 'paved',
};

const sampleTrips: TripRecordV1[] = [
  {
    id: 'trip-1',
    ownerUid: 'user-123',
    title: 'Santorini Wine Weekend',
    startDate: '2026-06-01',
    endDate: '2026-06-03',
    itemCount: 3,
    revision: 1,
    schemaVersion: 1,
    createdAt: '2026-05-01T10:00:00Z',
    updatedAt: '2026-05-01T10:00:00Z',
  },
  {
    id: 'trip-full',
    ownerUid: 'user-123',
    title: 'Epic Grand Tour',
    startDate: null,
    endDate: null,
    itemCount: 50,
    revision: 5,
    schemaVersion: 1,
    createdAt: '2026-05-01T10:00:00Z',
    updatedAt: '2026-05-01T10:00:00Z',
  },
];

describe('AddToTripModal', () => {
  it('returns null when isOpen is false or producer is null', () => {
    const htmlClosed = renderToString(
      <AddToTripModal
        isOpen={false}
        onClose={vi.fn()}
        producer={sampleProducer}
        initialTrips={sampleTrips}
      />
    );
    expect(htmlClosed).toBe('');

    const htmlNoProducer = renderToString(
      <AddToTripModal
        isOpen={true}
        onClose={vi.fn()}
        producer={null}
        initialTrips={sampleTrips}
      />
    );
    expect(htmlNoProducer).toBe('');
  });

  it('renders selected producer preview card', () => {
    const html = renderToString(
      <AddToTripModal
        isOpen={true}
        onClose={vi.fn()}
        producer={sampleProducer}
        initialTrips={sampleTrips}
      />
    );

    expect(html).toContain('Add to Trip');
    expect(html).toContain('Vassaltis Vineyards');
    expect(html).toContain('winery');
    expect(html).toContain('santorini');
  });

  it('renders list of available trips and disables trips at maximum capacity (50)', () => {
    const html = renderToString(
      <AddToTripModal
        isOpen={true}
        onClose={vi.fn()}
        producer={sampleProducer}
        initialTrips={sampleTrips}
      />
    );

    expect(html).toContain('Santorini Wine Weekend');
    expect(html).toContain('3 / 50 stops');
    expect(html).toContain('Epic Grand Tour');
    expect(html).toContain('50 / 50 stops');
    expect(html).toContain('Full');

    // The full trip button should be disabled
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>.*?Epic Grand Tour.*?<\/button>/s);
  });

  it('automatically opens create form when user has no existing trips', () => {
    const html = renderToString(
      <AddToTripModal
        isOpen={true}
        onClose={vi.fn()}
        producer={sampleProducer}
        initialTrips={[]}
      />
    );

    expect(html).toContain('New Trip Details');
    expect(html).toContain('placeholder="e.g. Aegean Coast &amp; Highlands"');
    expect(html).toContain('Create &amp; Add Stop');
  });

  it('renders create form explicitly when initialCreatingNew is true', () => {
    const html = renderToString(
      <AddToTripModal
        isOpen={true}
        onClose={vi.fn()}
        producer={sampleProducer}
        initialTrips={sampleTrips}
        initialCreatingNew={true}
      />
    );

    expect(html).toContain('New Trip Details');
    expect(html).toContain('Choose existing trip');
    expect(html).toContain('Create &amp; Add Stop');
  });
});
