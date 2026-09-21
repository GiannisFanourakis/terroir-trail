import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { TripWorkspace } from './TripWorkspace';
import type { Producer } from '../../types/terroir';
import type { TripWithItems, TripProducerState } from '../../services/tripApi';

describe('TripWorkspace', () => {
  const mockProducer: Producer = {
    id: 'prod-1',
    name: 'Domaine de Test',
    greekName: 'Κτήμα Τεστ',
    category: 'winery',
    destination: 'crete',
    region: 'Heraklion',
    village: 'Archanes',
    coordinates: [35.23, 25.16],
    description: 'Traditional family estate.',
    story: 'Traditional family estate story.',
    coverImage: '/images/estates/test.jpg',
    gallery: [],
    indigenousVarieties: ['Vidiano'],
    ethos: ['organic'],
    tastingHighlights: ['Estate Flight'],
    tagLine: 'Authentic Cretan wines',
    openingHours: 'Mon-Sat 10:00-18:00',
    googleMapsUrl: 'https://maps.google.com/?cid=123',
    website: 'https://domainedetest.com',
    phone: '+30 2810 123456',
    email: 'contact@domainedetest.com',
    locationStatus: 'verified_entrance',
    visitStatus: 'public_visits',
    visitBookingRequirement: 'not_required',
    walkInStatus: 'accepted',
    visitabilityReviewedAt: '2026-03-01',
    roadAccessStatus: 'verified',
    roadAccess: 'paved',
    parkingStatus: 'available',
  };

  const mockTrip: TripWithItems = {
    id: 'trip-1',
    ownerUid: 'anon-1',
    title: 'Crete Wine Tour',
    startDate: '2026-06-01',
    endDate: '2026-06-03',
    itemCount: 1,
    revision: 1,
    schemaVersion: 1,
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
    items: [
      {
        producerId: 'prod-1',
        position: 0,
        dayNumber: 1,
        createdAt: '2026-03-01T00:00:00Z',
        updatedAt: '2026-03-01T00:00:00Z',
      },
    ],
  };

  const mockProducerState: TripProducerState = 'active';

  it('renders workspace with trip items and live producer details', () => {
    const html = renderToString(
      <TripWorkspace
        tripId="trip-1"
        onBack={vi.fn()}
        onSelectProducer={vi.fn()}
        publicProducers={[mockProducer]}
        catalogueIsLive={true}
        initialTrip={mockTrip}
        initialProducerStates={{ 'prod-1': mockProducerState }}
      />
    );

    expect(html).toContain('Crete Wine Tour');
    expect(html).toContain('Domaine de Test');
    expect(html).toContain('winery');
    expect(html).toContain('Archanes');
    expect(html).toContain('Visit readiness');
  });

  it('fails closed when catalogueIsLive is false by showing offline notice and withholding fallback facts', () => {
    const html = renderToString(
      <TripWorkspace
        tripId="trip-1"
        onBack={vi.fn()}
        onSelectProducer={vi.fn()}
        publicProducers={[mockProducer]}
        catalogueIsLive={false}
        initialTrip={mockTrip}
        initialProducerStates={{ 'prod-1': mockProducerState }}
      />
    );

    // Shows catalogue offline banner
    expect(html).toContain('Live catalogue is currently unavailable');
    // Shows producer details unavailable notice instead of fallback facts
    expect(html).toContain('Producer details are temporarily unavailable');
    // Does not expose live unverified facts
    expect(html).not.toContain('Domaine de Test');
    expect(html).not.toContain('Archanes');
    // Structural items remain intact: position 1 and controls
    expect(html).toContain('Remove producer from trip');
    expect(html).toContain('Unassigned');
  });
});
