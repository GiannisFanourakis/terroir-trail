import { describe, expect, it } from 'vitest';
import { getCuratedFallback } from './googlePlacesPhotos';
import { Producer } from '../types/terroir';

const createMockProducer = (
  overrides?: Partial<Producer>
): Producer => ({
  id: 'test-producer',
  name: 'Test Estate',
  greekName: 'Δοκιμαστικό Κτήμα',
  category: 'winery',
  destination: 'crete',
  region: 'Heraklion',
  village: 'Peza',
  coordinates: [35.2, 25.1],
  coverImage: 'https://images.unsplash.com/example-stock-cover',
  gallery: ['https://images.unsplash.com/example-stock-gallery'],
  tagLine: 'A test estate',
  description: 'Test description',
  story: 'Test story',
  indigenousVarieties: [],
  tastingHighlights: [],
  openingHours: '10:00 - 18:00',
  ethos: [],
  ...overrides,
});

describe('producer imagery provenance', () => {
  it('quarantines uncredited stock/listing imagery', () => {
    const producer = createMockProducer({
      photoCredit: undefined,
      galleryCredits: undefined,
    });

    const result = getCuratedFallback(producer);

    expect(result.source).toBe('curated_fallback');
    expect(result.photos).toHaveLength(0);
  });

  it('preserves explicitly credited imagery', () => {
    const genuineCredit = {
      author: 'Eleni Papadakis',
      source: 'Wikimedia Commons',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Test.jpg',
    };

    const producer = createMockProducer({
      photoCredit: genuineCredit,
    });

    const result = getCuratedFallback(producer);

    expect(result.source).toBe('verified_estate_media');
    expect(result.photos.length).toBeGreaterThan(0);
    expect(result.photos[0].credit).toEqual(genuineCredit);
    expect(
      result.photos[0].attributions[0].displayName
    ).toContain('Eleni Papadakis');
    expect(
      result.photos[0].attributions[0].displayName
    ).toContain('Wikimedia Commons');
    expect(
      result.photos[0].attributions[0].displayName
    ).toContain('CC BY-SA 4.0');
  });
});
