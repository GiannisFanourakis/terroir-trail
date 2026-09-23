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
    expect(html).toContain('Trip readiness');
    expect(html).toContain('Preparation checklist');
    expect(html).toContain('Trip overview map');
    expect(html).toContain('Day 1 · 1 Jun');
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
    expect(html).toContain('current producer locations are withheld');
    // Shows producer details unavailable notice instead of fallback facts
    expect(html).toContain('Producer details are temporarily unavailable');
    // Does not expose live unverified facts
    expect(html).not.toContain('Domaine de Test');
    expect(html).not.toContain('Archanes');
    // Structural items remain intact: position 1 and controls
    expect(html).toContain('Remove producer from trip');
    expect(html).toContain('Unassigned');
  });

  describe('Phase 14.7 Contextual Affiliate Pilot', () => {
    it('renders non-rotating contextual travel utility separated after producer items', () => {
      vi.stubEnv('VITE_ENABLE_TRAVEL_AFFILIATES', 'true');

      const html = renderToString(
        <TripWorkspace
          tripId="trip-1"
          onBack={vi.fn()}
          onSelectProducer={vi.fn()}
          publicProducers={[mockProducer]}
          catalogueIsLive={true}
          hasExplorerPass={false}
          initialTrip={mockTrip}
          initialProducerStates={{ 'prod-1': mockProducerState }}
        />
      );

      // Clearly labelled affiliate utility
      expect(html).toContain('Affiliate · Travel Utility');
      expect(html).toContain('Trip Logistics &amp; Connectivity');
      expect(html).toContain('4 services');

      // Contains the 4 allowed utilities
      expect(html).toContain('Localrent');
      expect(html).toContain('Welcome Pickups');
      expect(html).toContain('GetTransfer');
      expect(html).toContain('Yesim');

      // Offers are separated after producer information
      const producerPos = html.indexOf('Domaine de Test');
      const affiliatePos = html.indexOf('Trip Logistics &amp; Connectivity');
      expect(producerPos).toBeGreaterThan(-1);
      expect(affiliatePos).toBeGreaterThan(producerPos);

      // Excludes Klook
      expect(html).not.toContain('klook');
    });

    it('suppresses contextual affiliate section when user has Explorer Pass', () => {
      vi.stubEnv('VITE_ENABLE_TRAVEL_AFFILIATES', 'true');

      const html = renderToString(
        <TripWorkspace
          tripId="trip-1"
          onBack={vi.fn()}
          onSelectProducer={vi.fn()}
          publicProducers={[mockProducer]}
          catalogueIsLive={true}
          hasExplorerPass={true}
          initialTrip={mockTrip}
          initialProducerStates={{ 'prod-1': mockProducerState }}
        />
      );

      expect(html).not.toContain('Affiliate · Travel Utility');
      expect(html).not.toContain('Trip Logistics &amp; Connectivity');
    });
  });

  it('opens the paid Optimize My Day review mode on an assigned multi-stop day', () => {
    const secondProducer: Producer = {
      ...mockProducer,
      id: 'prod-2',
      name: 'Olive Mill Test',
      greekName: 'Ελαιοτριβείο Τεστ',
      category: 'olive_mill',
      coordinates: [35.28, 25.22],
    };
    const multiStopTrip: TripWithItems = {
      ...mockTrip,
      itemCount: 2,
      items: [
        mockTrip.items[0],
        {
          producerId: 'prod-2',
          position: 1,
          dayNumber: 1,
          createdAt: '2026-03-01T00:00:00Z',
          updatedAt: '2026-03-01T00:00:00Z',
        },
      ],
    } as TripWithItems;

    const html = renderToString(
      <TripWorkspace
        tripId="trip-1"
        onBack={vi.fn()}
        onSelectProducer={vi.fn()}
        publicProducers={[mockProducer, secondProducer]}
        catalogueIsLive={true}
        hasExplorerPass={true}
        initialOptimizationMode={true}
        initialTrip={multiStopTrip}
        initialProducerStates={{
          'prod-1': 'active',
          'prod-2': 'active',
        }}
      />
    );

    expect(html).toContain('Optimize My Day');
    expect(html).toContain('Route estimates only');
    expect(html).toContain('Select an assigned day with at least two stops.');
  });
});
