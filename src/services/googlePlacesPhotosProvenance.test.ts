import { describe, expect, it } from 'vitest';
import { getCuratedFallback } from './googlePlacesPhotos';
import { Producer } from '../types/terroir';

const createMockProducer = (overrides?: Partial<Producer>): Producer => ({
  id: 'test-producer',
  name: 'Test Estate',
  greekName: 'Δοκιμαστικό Κτήμα',
  category: 'winery',
  destination: 'crete',
  region: 'Heraklion',
  village: 'Peza',
  coordinates: [35.2, 25.1],
  coverImage: 'https://example.com/cover.jpg',
  gallery: ['https://example.com/gallery1.jpg'],
  tagLine: 'A test estate',
  description: 'Test description',
  story: 'Test story',
  indigenousVarieties: [],
  tastingHighlights: [],
  openingHours: '10:00 - 18:00',
  ethos: [],
  ...overrides,
});

describe('googlePlacesPhotos provenance verification', () => {
  it('does NOT fabricate Press Kit or Estate Media License when producer lacks photoCredit', () => {
    const producer = createMockProducer({
      photoCredit: undefined,
      galleryCredits: undefined,
    });

    const result = getCuratedFallback(producer);

    expect(result.source).toBe('curated_fallback');
    for (const photo of result.photos) {
      expect(photo.credit).toBeUndefined();
      for (const attr of photo.attributions) {
        expect(attr.displayName).not.toContain('Media Archive');
        expect(attr.displayName).not.toContain('Official Estate Press Kit');
        expect(attr.displayName).not.toContain('Estate Media License');
        expect(attr.displayName).toBe('TerroirTrail listing image');
        expect(attr.uri).toBeUndefined();
      }
    }
  });

  it('preserves genuine producer photo credits when provided', () => {
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
    expect(result.photos[0].credit).toEqual(genuineCredit);
    expect(result.photos[0].attributions[0].displayName).toContain('Eleni Papadakis');
    expect(result.photos[0].attributions[0].displayName).toContain('Wikimedia Commons');
    expect(result.photos[0].attributions[0].displayName).toContain('(CC BY-SA 4.0)');
  });
});
