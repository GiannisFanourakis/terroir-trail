import { describe, expect, it } from 'vitest';
import { DayTripLoop, Producer } from '../types/terroir';
import { evaluateRouteNavigation, getProducerRoadAccessWarning } from './routeSafety';

function producer(overrides: Partial<Producer> = {}): Producer {
  return {
    id: 'producer-a',
    name: 'Producer A',
    greekName: 'Producer A',
    category: 'winery',
    destination: 'crete',
    region: 'Heraklion',
    village: 'Village',
    coordinates: [35.2, 25.1],
    coverImage: '',
    gallery: [],
    tagLine: '',
    description: '',
    story: '',
    indigenousVarieties: [],
    tastingHighlights: [],
    openingHours: '',
    ethos: [],
    locationStatus: 'verified_location',
    roadAccess: 'paved',
    roadAccessStatus: 'verified',
    ...overrides,
  };
}

function route(overrides: Partial<DayTripLoop> = {}): DayTripLoop {
  return {
    id: 'route-a',
    title: 'Route A',
    greekTitle: 'Route A',
    subtitle: '',
    destination: 'crete',
    region: 'Heraklion',
    totalDuration: '2 hours',
    drivingDistance: '20 km',
    stops: [{ producerId: 'producer-a', suggestedTime: '10:00', activity: 'Visit' }],
    description: '',
    highlightPointers: [],
    verificationStatus: 'verified',
    ...overrides,
  };
}

describe('evaluateRouteNavigation', () => {
  it('builds navigation only when the route and every stop are fully verified', () => {
    const result = evaluateRouteNavigation(route(), [producer()]);
    expect(result.isSafe).toBe(true);
    expect(result.issues).toEqual([]);
    expect(result.url).toContain('https://www.google.com/maps/search/?api=1&query=35.2,25.1');
  });

  it('fails closed when the curated route itself has not been verified', () => {
    const result = evaluateRouteNavigation(route({ verificationStatus: 'draft' }), [producer()]);
    expect(result.isSafe).toBe(false);
    expect(result.url).toBeUndefined();
    expect(result.issues.some((issue) => issue.code === 'route_not_verified')).toBe(true);
  });

  it('fails closed instead of silently skipping a missing producer', () => {
    const result = evaluateRouteNavigation(route(), []);
    expect(result.isSafe).toBe(false);
    expect(result.url).toBeUndefined();
    expect(result.issues.some((issue) => issue.code === 'missing_producer')).toBe(true);
  });

  it('fails closed for unresolved locations', () => {
    const result = evaluateRouteNavigation(route(), [producer({ locationStatus: 'unresolved' })]);
    expect(result.isSafe).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'location_not_verified')).toBe(true);
  });

  it('fails closed while road access is unreviewed', () => {
    const result = evaluateRouteNavigation(route(), [
      producer({ roadAccess: undefined, roadAccessStatus: 'unreviewed' }),
    ]);
    expect(result.isSafe).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'road_access_unreviewed')).toBe(true);
  });

  it('fails closed after review when suitable road access is not publicly confirmed', () => {
    const result = evaluateRouteNavigation(route(), [
      producer({ roadAccess: undefined, roadAccessStatus: 'not_publicly_confirmed' }),
    ]);
    expect(result.isSafe).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'road_access_not_confirmed')).toBe(true);
  });

  it('fails closed when road access is currently uncertain', () => {
    const result = evaluateRouteNavigation(route(), [
      producer({ roadAccess: 'gravel_ok', roadAccessStatus: 'current_access_uncertain' }),
    ]);
    expect(result.isSafe).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'road_access_uncertain')).toBe(true);
  });

  it('does not generate standard-car navigation for high-clearance or 4x4 access', () => {
    for (const roadAccess of ['high_clearance_recommended', '4x4_required'] as const) {
      const result = evaluateRouteNavigation(route(), [producer({ roadAccess })]);
      expect(result.isSafe).toBe(false);
      expect(result.issues.some((issue) => issue.code === 'special_vehicle_required')).toBe(true);
    }
  });

  it('allows verified narrow paved, gravel, and passable unpaved classifications', () => {
    for (const roadAccess of ['narrow_paved', 'gravel_ok', 'unpaved_passable'] as const) {
      const result = evaluateRouteNavigation(route(), [producer({ roadAccess })]);
      expect(result.isSafe).toBe(true);
      expect(result.url).toBeTruthy();
    }
  });
});

describe('getProducerRoadAccessWarning', () => {
  it('warns without inventing a road type when access has not been reviewed', () => {
    expect(
      getProducerRoadAccessWarning(
        producer({ roadAccess: undefined, roadAccessStatus: 'unreviewed' })
      )
    ).toContain('not yet been independently verified');
  });

  it('distinguishes reviewed but unconfirmed road conditions', () => {
    expect(
      getProducerRoadAccessWarning(
        producer({ roadAccess: undefined, roadAccessStatus: 'not_publicly_confirmed' })
      )
    ).toContain('reviewed but are not publicly confirmed');
  });

  it('warns when verified access is passable but unpaved', () => {
    expect(
      getProducerRoadAccessWarning(
        producer({ roadAccess: 'unpaved_passable', roadAccessStatus: 'verified' })
      )
    ).toContain('passable unpaved');
  });

  it('warns standard-car users when special access is required', () => {
    expect(getProducerRoadAccessWarning(producer({ roadAccess: '4x4_required' }))).toContain('4x4');
  });
});
