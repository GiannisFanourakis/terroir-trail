import { describe, expect, it } from 'vitest';
import type { Producer } from '../types/terroir';
import {
  classifyTripStopReadiness,
  getTripDayLabel,
} from './tripReadiness';

const baseProducer: Producer = {
  id: 'producer-1',
  name: 'Test Producer',
  greekName: 'Test Producer',
  category: 'winery',
  destination: 'crete',
  region: 'Heraklion',
  village: 'Archanes',
  coordinates: [35.23, 25.16],
  coverImage: '',
  gallery: [],
  tagLine: '',
  description: '',
  story: '',
  indigenousVarieties: [],
  tastingHighlights: [],
  openingHours: 'Mon-Sat 10:00-18:00',
  ethos: [],
  locationStatus: 'verified_entrance',
  visitStatus: 'public_visits',
  visitBookingRequirement: 'not_required',
  walkInStatus: 'accepted',
  roadAccessStatus: 'verified',
  roadAccess: 'paved',
  visitabilityReviewedAt: '2026-09-01T00:00:00Z',
};

describe('trip readiness helpers', () => {
  it('marks a fully evidenced public visit as ready', () => {
    expect(
      classifyTripStopReadiness(baseProducer, 'active', true)
    ).toEqual({
      bucket: 'ready',
      reasons: [
        'Current TerroirTrail evidence supports straightforward visit preparation.',
      ],
    });
  });

  it('prioritizes known contact requirements over ready state', () => {
    const producer: Producer = {
      ...baseProducer,
      visitStatus: 'appointment_only',
      visitBookingRequirement: 'required',
      walkInStatus: 'not_accepted',
    };

    const result = classifyTripStopReadiness(producer, 'active', true);
    expect(result.bucket).toBe('contact');
    expect(result.reasons).toContain('Visits are by appointment.');
    expect(result.reasons).toContain('Booking is required.');
  });

  it('fails closed when evidence is incomplete', () => {
    const producer: Producer = {
      ...baseProducer,
      locationStatus: 'unresolved',
      roadAccessStatus: 'unreviewed',
      roadAccess: undefined,
      visitabilityReviewedAt: undefined,
    };

    const result = classifyTripStopReadiness(producer, 'active', true);
    expect(result.bucket).toBe('gap');
    expect(result.reasons).toContain('Exact visitor location is not fully verified.');
    expect(result.reasons).toContain('Road/access suitability is not fully verified.');
  });

  it('does not expose fallback readiness while the live catalogue is unavailable', () => {
    const result = classifyTripStopReadiness(baseProducer, 'active', false);
    expect(result.bucket).toBe('gap');
    expect(result.reasons).toEqual([
      'Current producer details are temporarily unavailable.',
    ]);
  });

  it('keeps delisted/unavailable state ahead of catalogue facts', () => {
    const delisted = classifyTripStopReadiness(
      baseProducer,
      'no_longer_listed',
      true
    );
    expect(delisted.bucket).toBe('unavailable');

    const unavailable = classifyTripStopReadiness(
      baseProducer,
      'unavailable',
      true
    );
    expect(unavailable.bucket).toBe('unavailable');
  });

  it('labels trip days using the trip start date without local-time drift', () => {
    expect(getTripDayLabel(1, '2026-06-01')).toBe('Day 1 · 1 Jun');
    expect(getTripDayLabel(3, '2026-06-01')).toBe('Day 3 · 3 Jun');
    expect(getTripDayLabel(2, null)).toBe('Day 2');
  });
});
