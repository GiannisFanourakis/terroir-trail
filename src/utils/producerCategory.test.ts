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

  it('preserves genuine distilleries as distillery', () => {
    const distilleryProducer: Pick<Producer, 'category'> = {
      category: 'distillery',
    };

    expect(getEffectiveProducerCategory(distilleryProducer)).toBe('distillery');
  });

  it('preserves producer categories without coercing their entity type', () => {
    const categories: Category[] = [
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
