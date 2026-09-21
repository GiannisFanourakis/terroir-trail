import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { TripRecordV1 } from '../../services/tripApi';
import { MyTripsModal } from './MyTripsModal';

const sampleTrips: TripRecordV1[] = [
  {
    id: 'trip-1',
    ownerUid: 'user-123',
    title: 'Santorini Wine Explorer',
    startDate: '2026-06-01',
    endDate: '2026-06-05',
    itemCount: 4,
    revision: 1,
    schemaVersion: 1,
    createdAt: '2026-05-01T10:00:00Z',
    updatedAt: '2026-05-01T10:00:00Z',
  },
  {
    id: 'trip-2',
    ownerUid: 'user-123',
    title: 'Crete Olive Oil Tour',
    startDate: null,
    endDate: null,
    itemCount: 2,
    revision: 2,
    schemaVersion: 1,
    createdAt: '2026-05-02T10:00:00Z',
    updatedAt: '2026-05-02T10:00:00Z',
  },
];

describe('MyTripsModal', () => {
  it('returns null when isOpen is false', () => {
    const html = renderToString(
      <MyTripsModal
        isOpen={false}
        onClose={vi.fn()}
        onSelectProducer={vi.fn()}
        publicProducers={[]}
        initialTrips={[]}
      />
    );
    expect(html).toBe('');
  });

  it('renders empty state when user has no trips', () => {
    const html = renderToString(
      <MyTripsModal
        isOpen={true}
        onClose={vi.fn()}
        onSelectProducer={vi.fn()}
        publicProducers={[]}
        initialTrips={[]}
      />
    );

    expect(html).toContain('My Trips');
    expect(html).toContain('Start planning a producer trail.');
    expect(html).toContain('Create Your First Trip');
    expect(html).toContain('0 / 25 trips');
  });

  it('renders list of trips with titles, dates, and stop counts', () => {
    const html = renderToString(
      <MyTripsModal
        isOpen={true}
        onClose={vi.fn()}
        onSelectProducer={vi.fn()}
        publicProducers={[]}
        initialTrips={sampleTrips}
      />
    );

    expect(html).toContain('Santorini Wine Explorer');
    expect(html).toContain('4 producers');
    expect(html).toContain('Crete Olive Oil Tour');
    expect(html).toContain('2 producers');
    expect(html).toContain('No dates set');
    expect(html).toContain('2 / 25 trips');
    expect(html).toContain('aria-label="Delete Santorini Wine Explorer"');
  });

  it('disables Create Trip and warns user when quota of 25 trips is reached', () => {
    const maxTrips: TripRecordV1[] = Array.from({ length: 25 }, (_, i) => ({
      id: `trip-${i + 1}`,
      ownerUid: 'user-123',
      title: `Trip ${i + 1}`,
      startDate: null,
      endDate: null,
      itemCount: 0,
      revision: 1,
      schemaVersion: 1,
      createdAt: '2026-05-01T10:00:00Z',
      updatedAt: '2026-05-01T10:00:00Z',
    }));

    const html = renderToString(
      <MyTripsModal
        isOpen={true}
        onClose={vi.fn()}
        onSelectProducer={vi.fn()}
        publicProducers={[]}
        initialTrips={maxTrips}
      />
    );

    expect(html).toContain('25 / 25 trips');
    expect(html).toContain('You have reached the maximum of 25 trips per account');
    // Create button should have disabled attribute
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>.*?Create Trip.*?<\/button>/s);
  });

  it('renders create trip form when initialCreating is true', () => {
    const html = renderToString(
      <MyTripsModal
        isOpen={true}
        onClose={vi.fn()}
        onSelectProducer={vi.fn()}
        publicProducers={[]}
        initialTrips={sampleTrips}
        initialCreating={true}
      />
    );

    expect(html).toContain('Create New Trip');
    expect(html).toContain('placeholder="e.g. Nemea Wine &amp; Olive Trail"');
    expect(html).toContain('Start Date (optional)');
    expect(html).toContain('End Date (optional)');
  });
});
