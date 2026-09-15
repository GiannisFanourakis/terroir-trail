import { describe, expect, it } from 'vitest';
import type { Category, Producer } from '../types/terroir';
import { getProducerPlaceholderPhoto } from './googlePlacesPhotos';

const producerForCategory = (
  id: string,
  category: Category
): Producer =>
  ({
    id,
    name: id,
    greekName: id,
    category,
    destination: 'crete',
    country: 'Greece',
    countryCode: 'GR',
    region: 'Test Region',
    village: 'Test Village',
    locality: 'Test Village',
    coordinates: [35, 25],
    coverImage: '',
    gallery: [],
    tagLine: '',
    description: '',
    story: '',
    indigenousVarieties: [],
    tastingHighlights: [],
    openingHours: '',
    ethos: [],
  }) as Producer;

describe('getProducerPlaceholderPhoto', () => {
  it('keeps the fallback photo reference stable across renders for the same category', () => {
    const first = getProducerPlaceholderPhoto(
      producerForCategory('producer-a', 'winery')
    );
    const second = getProducerPlaceholderPhoto(
      producerForCategory('producer-b', 'winery')
    );

    expect(second).toBe(first);
    expect(second.url).toBe(first.url);
  });

  it('uses separate stable placeholders for different producer categories', () => {
    const winery = getProducerPlaceholderPhoto(
      producerForCategory('producer-a', 'winery')
    );
    const brewery = getProducerPlaceholderPhoto(
      producerForCategory('producer-b', 'brewery')
    );

    expect(brewery).not.toBe(winery);
  });
});
