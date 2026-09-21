import React from 'react';
import { renderToString } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TripItemRecordV1 } from '../../services/tripApi';
import type { Producer } from '../../types/terroir';

const mocks = vi.hoisted(() => ({
  trackIntent: vi.fn(async () => ({ success: true, clientEventId: 'evt-1' })),
}));

vi.mock('../../services/intentAnalytics', () => ({
  trackIntent: mocks.trackIntent,
}));

import { TripProducerItem, handleTripProducerAction } from './TripProducerItem';

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
  phone: '+30 22860 71644',
  email: 'sigalas@example.com',
  website: 'https://sigalas.example.com',
  locationStatus: 'verified_location',
  visitBookingRequirement: 'recommended',
  walkInStatus: 'accepted',
  parkingStatus: 'available',
  visitabilityReviewedAt: '2026-05-10T12:00:00Z',
};

const sampleItem: TripItemRecordV1 = {
  producerId: 'prod-active-1',
  position: 0,
  dayNumber: 1,
  createdAt: '2026-05-10T12:00:00Z',
  updatedAt: '2026-05-10T12:00:00Z',
};

describe('TripProducerItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it('does NOT emit directions_click merely because the link renders', () => {
    renderToString(
      <TripProducerItem
        item={sampleItem}
        position={0}
        totalCount={1}
        producerState="active"
        producer={sampleProducer}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
        onAssignDay={vi.fn()}
        onRemove={vi.fn()}
        onSelectProducer={vi.fn()}
      />
    );

    expect(mocks.trackIntent).not.toHaveBeenCalled();
  });

  it('emits directions_click with trip_workspace source surface when clicked', () => {
    handleTripProducerAction('directions', 'prod-active-1');

    expect(mocks.trackIntent).toHaveBeenCalledWith({
      event: 'directions_click',
      sourceSurface: 'trip_workspace',
      producerId: 'prod-active-1',
    });
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

  it('fails closed when live catalogue is unavailable (catalogueIsLive = false)', () => {
    // Even though producerState is 'active' and producer object is present in memory,
    // when catalogueIsLive is false, fallback facts MUST NOT be rendered as current truth.
    const html = renderToString(
      <TripProducerItem
        item={sampleItem}
        position={0}
        totalCount={1}
        producerState="active"
        producer={sampleProducer}
        catalogueIsLive={false}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
        onAssignDay={vi.fn()}
        onRemove={vi.fn()}
        onSelectProducer={vi.fn()}
      />
    );

    expect(html).toContain('Producer details are temporarily unavailable.');
    expect(html).toContain('Live catalogue is currently unavailable.');
    // Must NOT expose fallback facts:
    expect(html).not.toContain('Domaine Sigalas');
    expect(html).not.toContain('winery');
    expect(html).not.toContain('Oia');
    expect(html).not.toContain('title="Get directions"');
    expect(html).not.toContain('Mon-Sat');
    expect(html).not.toContain('Public visits');
    expect(html).not.toContain('+30 22860');
    // Structural items remain intact:
    expect(html).toContain('Unassigned');
    expect(html).toContain('Remove');
  });

  it('renders safe neutral unavailable notice without leaking internal reasons or maps links', () => {
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

    expect(html).toContain('This producer is not currently available on TerroirTrail.');
    expect(html).toContain('Your planning reference is retained in this trip.');
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

  it('preserves no_longer_listed precedence over catalogue outage (catalogueIsLive = false)', () => {
    const html = renderToString(
      <TripProducerItem
        item={sampleItem}
        position={0}
        totalCount={1}
        producerState="no_longer_listed"
        producer={sampleProducer}
        catalogueIsLive={false}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
        onAssignDay={vi.fn()}
        onRemove={vi.fn()}
        onSelectProducer={vi.fn()}
      />
    );

    // Trusted delisting must outrank catalogue outage
    expect(html).toContain('Producer no longer listed on TerroirTrail');
    expect(html).not.toContain('Producer details are temporarily unavailable.');
    // Historical/sensitive facts are not rendered
    expect(html).not.toContain('Domaine Sigalas');
    expect(html).not.toContain('winery');
    expect(html).not.toContain('Santorini');
    expect(html).not.toContain('Oia');
    expect(html).not.toContain('title="Get directions"');
    expect(html).not.toContain('Mon-Sat');
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

    expect(html).toContain('Producer details are temporarily unavailable.');
    expect(html).toContain('Your trip item is preserved');
  });

  it('renders full visit readiness and contact options when expanded', () => {
    const html = renderToString(
      <TripProducerItem
        item={sampleItem}
        position={0}
        totalCount={1}
        producerState="active"
        producer={sampleProducer}
        initialExpanded={true}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
        onAssignDay={vi.fn()}
        onRemove={vi.fn()}
        onSelectProducer={vi.fn()}
      />
    );

    expect(html).toContain('Visit Readiness &amp; Details');
    expect(html).toContain('Verified location');
    expect(html).toContain('Public visits');
    expect(html).toContain('Booking recommended');
    expect(html).toContain('Walk-ins accepted');
    expect(html).toContain('Dedicated parking');
    expect(html).toContain('Visitability verified on 10 May 2026');
    expect(html).toContain('Mon-Sat 10:00 - 18:00');
    // Direct contact actions
    expect(html).toContain('+30 22860 71644');
    expect(html).toContain('sigalas@example.com');
    expect(html).toContain('Website');
    expect(html).toContain('Full profile');
  });

  it('instruments direct phone, email, and website clicks from trip_workspace surface', () => {
    handleTripProducerAction('phone', 'prod-active-1');
    expect(mocks.trackIntent).toHaveBeenCalledWith({
      event: 'producer_phone_click',
      sourceSurface: 'trip_workspace',
      producerId: 'prod-active-1',
    });

    handleTripProducerAction('email', 'prod-active-1');
    expect(mocks.trackIntent).toHaveBeenCalledWith({
      event: 'producer_email_click',
      sourceSurface: 'trip_workspace',
      producerId: 'prod-active-1',
    });

    handleTripProducerAction('website', 'prod-active-1');
    expect(mocks.trackIntent).toHaveBeenCalledWith({
      event: 'producer_website_click',
      sourceSurface: 'trip_workspace',
      producerId: 'prod-active-1',
    });
  });
});
