import { describe, expect, it } from 'vitest';
import type { Producer } from '../types/terroir';
import { buildAdminCatalogueMetrics } from './adminCatalogueMetrics';

const makeProducer = (overrides: Partial<Producer> = {}): Producer => ({
  id: 'producer-a',
  name: 'Producer A',
  greekName: 'Producer A',
  category: 'winery',
  destination: 'crete',
  country: 'Greece',
  countryCode: 'GR',
  region: 'Chania',
  village: 'Village',
  coordinates: [35, 24],
  coverImage: '/image.jpg',
  gallery: [],
  tagLine: '',
  description: '',
  story: '',
  indigenousVarieties: [],
  tastingHighlights: [],
  openingHours: '',
  ethos: [],
  googlePlaceId: 'ChIJtest',
  locationStatus: 'verified_location',
  visitStatus: 'public_visits',
  roadAccessStatus: 'verified',
  roadAccess: 'paved',
  ...overrides,
});

describe('buildAdminCatalogueMetrics', () => {
  it('keeps verification, visitability and road confidence as separate dimensions', () => {
    const producers = [
      makeProducer(),
      makeProducer({
        id: 'producer-b',
        category: 'cheese_dairy',
        region: 'Epirus',
        googlePlaceId: undefined,
        locationStatus: 'unresolved',
        visitStatus: 'not_publicly_confirmed',
        roadAccessStatus: 'not_publicly_confirmed',
        coverImage: '',
      }),
      makeProducer({
        id: 'producer-c',
        destination: 'tuscany',
        country: 'Italy',
        countryCode: 'IT',
        region: 'Tuscany',
      }),
    ];

    const metrics = buildAdminCatalogueMetrics(producers);

    expect(metrics.totalProducers).toBe(3);
    expect(metrics.needsVerification).toBe(1);
    expect(metrics.locationNeedsReview).toBe(1);
    expect(metrics.visitabilityNotConfirmed).toBe(1);
    expect(metrics.roadAccessNotConfirmed).toBe(1);
    expect(metrics.missingGooglePlaceIds).toBe(1);
    expect(metrics.missingBundledCoverImages).toBe(1);
    expect(metrics.greekProducers).toBe(2);
  });

  it('builds a Greece-only region by product-category coverage matrix', () => {
    const metrics = buildAdminCatalogueMetrics([
      makeProducer(),
      makeProducer({ id: 'producer-b', category: 'cheese_dairy', region: 'Chania' }),
      makeProducer({ id: 'producer-c', category: 'apiary', region: 'Epirus' }),
      makeProducer({ id: 'producer-d', destination: 'tuscany', country: 'Italy', countryCode: 'IT', region: 'Tuscany' }),
    ]);

    expect(metrics.categories).toEqual(['apiary', 'cheese_dairy', 'winery']);
    expect(metrics.coverageByRegion).toEqual([
      { region: 'Chania', total: 2, byCategory: { winery: 1, cheese_dairy: 1 } },
      { region: 'Epirus', total: 1, byCategory: { apiary: 1 } },
    ]);
  });
});
