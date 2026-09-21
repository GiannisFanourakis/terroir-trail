import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { TripReadinessSummary } from './TripReadinessSummary';
import type { Producer } from '../../types/terroir';

const sampleProducer = (overrides: Partial<Producer> = {}): Producer => ({
  id: 'test-estate',
  name: 'Domaine Test',
  greekName: 'Δομέν Τεστ',
  category: 'winery',
  destination: 'crete',
  region: 'Heraklion',
  village: 'Peza',
  coordinates: [35.2, 25.1],
  coverImage: 'https://example.com/cover.jpg',
  gallery: [],
  tagLine: 'Artisanal wines',
  description: 'A historic estate',
  story: 'Long family heritage',
  indigenousVarieties: ['Vidiano'],
  tastingHighlights: ['Estate Reserve'],
  openingHours: 'Mon-Sat 10:00-18:00',
  ethos: ['organic'],
  ...overrides,
});

describe('TripReadinessSummary', () => {
  it('renders verified readiness facts accurately without inventing missing facts', () => {
    const producer = sampleProducer({
      visitStatus: 'public_visits',
      visitBookingRequirement: 'recommended',
      walkInStatus: 'accepted',
      parkingStatus: 'available',
      roadAccess: 'paved',
      roadAccessStatus: 'verified',
      visitabilityReviewedAt: '2026-05-10T12:00:00Z',
    });

    const html = renderToString(<TripReadinessSummary producer={producer} />);

    expect(html).toContain('Public visits');
    expect(html).toContain('Booking recommended');
    expect(html).toContain('Walk-ins accepted');
    expect(html).toContain('Dedicated parking');
    expect(html).toContain('Verified road access');
    expect(html).toContain('Visitability verified on 10 May 2026');
  });

  it('respects UNKNOWN IS NOT FALSE: shows "Parking not confirmed" when parking is null', () => {
    const producer = sampleProducer({
      visitStatus: 'appointment_only',
      visitBookingRequirement: 'required',
      walkInStatus: 'not_accepted',
      parkingStatus: undefined,
      roadAccess: undefined,
      roadAccessStatus: 'unreviewed',
    });

    const html = renderToString(<TripReadinessSummary producer={producer} />);

    expect(html).toContain('Appointment only');
    expect(html).toContain('Booking required');
    expect(html).toContain('No walk-ins');
    expect(html).toContain('Parking not confirmed');
    expect(html).toContain('Road access unverified');
  });

  it('displays road warnings and navigation pending when conditions require it', () => {
    const producer = sampleProducer({
      locationStatus: 'unresolved',
      roadAccess: '4x4_required',
      roadAccessStatus: 'verified',
    });

    const html = renderToString(<TripReadinessSummary producer={producer} />);

    expect(html).toContain('4x4 required');
    expect(html).toContain('4x4 access required. Do not attempt this approach in a standard rental car.');
    expect(html).toContain('Navigation is currently withheld');
  });

  it('renders compact mode with concise chips for workspace cards', () => {
    const producer = sampleProducer({
      visitStatus: 'seasonal_public',
      visitBookingRequirement: 'required',
      roadAccess: 'high_clearance_recommended',
      roadAccessStatus: 'verified',
    });

    const html = renderToString(<TripReadinessSummary producer={producer} compact />);

    expect(html).toContain('Seasonal public visits');
    expect(html).toContain('Booking required');
    expect(html).toContain('Access check needed');
  });
});
