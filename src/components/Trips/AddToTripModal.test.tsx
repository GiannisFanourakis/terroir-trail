import React from 'react';
import { renderToString } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TripRecordV1, TripWithItems } from '../../services/tripApi';
import type { Producer } from '../../types/terroir';
import { AddToTripModal, reconcileAddProducer } from './AddToTripModal';

const mockTripApi = vi.hoisted(() => ({
  getTrip: vi.fn(),
  addProducerToTrip: vi.fn(),
  createTrip: vi.fn(),
  listTrips: vi.fn(),
}));

vi.mock('../../services/tripApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/tripApi')>();
  return {
    ...actual,
    getTrip: mockTripApi.getTrip,
    addProducerToTrip: mockTripApi.addProducerToTrip,
    createTrip: mockTripApi.createTrip,
    listTrips: mockTripApi.listTrips,
  };
});

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
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it('renders partial failure state gracefully without allowing duplicate trip creation on retry', () => {
    const createdTrip: TripRecordV1 = {
      id: 'trip-created-1',
      ownerUid: 'user-123',
      title: 'Crete Highlands',
      startDate: '2026-07-01',
      endDate: '2026-07-05',
      itemCount: 0,
      revision: 1,
      schemaVersion: 1,
      createdAt: '2026-06-01T10:00:00Z',
      updatedAt: '2026-06-01T10:00:00Z',
    };

    const html = renderToString(
      <AddToTripModal
        isOpen={true}
        onClose={vi.fn()}
        producer={sampleProducer}
        initialTrips={[createdTrip]}
        initialCreatingNew={true}
        initialCreatedTrip={createdTrip}
        initialCreateError={`Trip “${createdTrip.title}” was created, but adding “${sampleProducer.name}” failed: Network timeout. Please retry.`}
      />
    );

    // Displays clear notification that trip was created
    expect(html).toContain('Trip “Crete Highlands” was created. Retry adding “Vassaltis Vineyards” below.');
    // Displays retry error message
    expect(html).toContain('Trip “Crete Highlands” was created, but adding “Vassaltis Vineyards” failed: Network timeout. Please retry.');
    // Button changes to retry adding stop
    expect(html).toContain('Retry Adding Stop');
    // Inputs are disabled to prevent editing already-created trip
    expect(html).toContain('value="Crete Highlands"');
    expect(html).toMatch(/<input[^>]*disabled=""[^>]*value="Crete Highlands"/);
    // Does not use raw HTML entities like &ldquo; in error strings
    expect(html).not.toContain('&amp;ldquo;');
  });

  describe('authoritative reconciliation of ambiguous add outcome', () => {
    it('returns { status: "added" } when producer is present in authoritative trip (Outcome A)', async () => {
      const authoritativeTrip: TripWithItems = {
        ...sampleTrips[0],
        itemCount: 4,
        revision: 2,
        items: [
          {
            producerId: sampleProducer.id,
            position: 3,
            dayNumber: null,
            createdAt: '2026-05-01T12:00:00Z',
            updatedAt: '2026-05-01T12:00:00Z',
          },
        ],
      };
      mockTripApi.getTrip.mockResolvedValueOnce(authoritativeTrip);

      const result = await reconcileAddProducer('trip-1', sampleProducer.id);

      expect(mockTripApi.getTrip).toHaveBeenCalledWith('trip-1');
      expect(result.status).toBe('added');
      if (result.status === 'added') {
        expect(result.trip.id).toBe('trip-1');
        expect(result.trip.revision).toBe(2);
        expect(result.trip.items).toHaveLength(1);
      }
    });

    it('returns { status: "absent" } when producer is absent from authoritative trip (Outcome B)', async () => {
      const authoritativeTrip: TripWithItems = {
        ...sampleTrips[0],
        itemCount: 3,
        revision: 2,
        items: [
          {
            producerId: 'other-prod',
            position: 0,
            dayNumber: null,
            createdAt: '2026-05-01T10:00:00Z',
            updatedAt: '2026-05-01T10:00:00Z',
          },
        ],
      };
      mockTripApi.getTrip.mockResolvedValueOnce(authoritativeTrip);

      const result = await reconcileAddProducer('trip-1', sampleProducer.id);

      expect(mockTripApi.getTrip).toHaveBeenCalledWith('trip-1');
      expect(result.status).toBe('absent');
      if (result.status === 'absent') {
        expect(result.trip.id).toBe('trip-1');
        expect(result.trip.revision).toBe(2);
      }
    });

    it('returns { status: "unconfirmed" } when reconciliation fails (Outcome C)', async () => {
      const networkError = new Error('503 Service Unavailable');
      mockTripApi.getTrip.mockRejectedValueOnce(networkError);

      const result = await reconcileAddProducer('trip-1', sampleProducer.id);

      expect(mockTripApi.getTrip).toHaveBeenCalledWith('trip-1');
      expect(result.status).toBe('unconfirmed');
      if (result.status === 'unconfirmed') {
        expect(result.error).toBe(networkError);
      }
    });

    it('renders ambiguous add state for create-trip flow with explicit reload prompt and locked inputs', () => {
      const createdTrip: TripRecordV1 = {
        id: 'trip-created-1',
        ownerUid: 'user-123',
        title: 'Crete Highlands',
        startDate: '2026-07-01',
        endDate: '2026-07-05',
        itemCount: 0,
        revision: 1,
        schemaVersion: 1,
        createdAt: '2026-06-01T10:00:00Z',
        updatedAt: '2026-06-01T10:00:00Z',
      };

      const html = renderToString(
        <AddToTripModal
          isOpen={true}
          onClose={vi.fn()}
          producer={sampleProducer}
          initialTrips={[createdTrip]}
          initialCreatingNew={true}
          initialCreatedTrip={createdTrip}
          initialAmbiguousCreate={true}
        />
      );

      // Amber banner explains unconfirmed status with explicit reload instruction
      expect(html).toMatch(
        /We couldn(&#x27;|')t confirm whether “Vassaltis Vineyards” was added to “Crete Highlands”\. Reload the trip before trying again\./
      );
      // Button offers reload action rather than a blind second mutation
      expect(html).toContain('Reload Trip');
      expect(html).not.toContain('Retry Adding Stop');
      expect(html).not.toContain('Create &amp; Add Stop');
      // Inputs remain disabled to prevent duplicate trip creation
      expect(html).toMatch(/<input[^>]*disabled=""[^>]*value="Crete Highlands"/);
      // No claim of addition is made
      expect(html).not.toContain('Added to Trip!');
    });

    it('renders ambiguous add state for existing-trip flow with explicit reload controls and reload badge', () => {
      const html = renderToString(
        <AddToTripModal
          isOpen={true}
          onClose={vi.fn()}
          producer={sampleProducer}
          initialTrips={sampleTrips}
          initialAmbiguousTripId="trip-1"
        />
      );

      // Error banner renders ambiguous notice with reload action
      expect(html).toMatch(
        /We couldn(&#x27;|')t confirm whether this stop was added\. Reload the trip before trying again\./
      );
      expect(html).toContain('Reload Trip');

      // Trip row displays ambiguous prompt and reload badge instead of standard add button
      expect(html).toContain('Tap to reload &amp; verify');
      expect(html).toContain('Reload');
      expect(html).not.toContain('Added to Trip!');
    });

    it('renders success state without retry or reload controls when stop is confirmed added', () => {
      const html = renderToString(
        <AddToTripModal
          isOpen={true}
          onClose={vi.fn()}
          producer={sampleProducer}
          initialTrips={sampleTrips}
          initialSuccessTrip={sampleTrips[0]}
        />
      );

      expect(html).toContain('Added to Trip!');
      expect(html).toContain('Vassaltis Vineyards');
      expect(html).toContain('was added to');
      expect(html).toContain('Santorini Wine Weekend');
      expect(html).toContain('Close');
      expect(html).not.toContain('Retry');
      expect(html).not.toContain('Reload Trip');
    });
  });
});
