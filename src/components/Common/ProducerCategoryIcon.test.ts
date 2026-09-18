import { describe, expect, it } from 'vitest';
import type { Category } from '../../types/terroir';
import {
  getProducerCategoryIconMarkup,
  type ProducerCategoryIconKey,
} from './ProducerCategoryIcon';

const categories: ProducerCategoryIconKey[] = [
  'all',
  'producer',
  'winery',
  'brewery',
  'distillery',
  'cidery',
  'olive_mill',
  'olive_oil_producer',
  'oil_mill',
  'cheese_dairy',
  'apiary',
  'confectionery',
  'herb_farm',
  'mushroom_farm',
  'farm',
] satisfies Array<Category | 'all' | 'producer'>;

describe('ProducerCategoryIcon', () => {
  it('renders every producer category as a monochrome SVG glyph', () => {
    categories.forEach((category) => {
      const markup = getProducerCategoryIconMarkup(category);

      expect(markup).toContain('<svg');
      expect(markup).toContain('stroke="currentColor"');
      expect(markup).not.toMatch(/[🍇🍺🥃🍎🫒🌻🧀🍯🍫🌿🍄🌱]/u);
    });
  });

  it('keeps category glyphs meaningfully distinct', () => {
    const uniqueGlyphs = new Set(categories.map(getProducerCategoryIconMarkup));
    expect(uniqueGlyphs.size).toBe(categories.length);
  });
});
