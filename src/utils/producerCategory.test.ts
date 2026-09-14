import { describe, expect, it } from 'vitest';
import { getEffectiveProducerCategory } from './producerCategory';
import { Category, Producer } from '../types/terroir';

describe('producerCategory taxonomy helper', () => {
  it('resolves a producer stored as farm as farm', () => {
    const farmProducer: Pick<Producer, 'category'> = {
      category: 'farm',
    };

    expect(getEffectiveProducerCategory(farmProducer)).toBe('farm');
  });

  it('preserves genuine rakokazana as kazani', () => {
    const kazaniProducer: Pick<Producer, 'category'> = {
      category: 'kazani',
    };

    expect(getEffectiveProducerCategory(kazaniProducer)).toBe('kazani');
  });

  it('preserves non-kazani categories for any producer', () => {
    const categories: Category[] = [
      'winery',
      'brewery',
      'olive_mill',
      'cheese_dairy',
      'apiary',
      'farm',
    ];

    for (const cat of categories) {
      expect(
        getEffectiveProducerCategory({
          category: cat,
        })
      ).toBe(cat);
    }
  });
});
