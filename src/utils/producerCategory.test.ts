import { describe, expect, it } from 'vitest';
import {
  getEffectiveProducerCategory,
  LEGACY_PESKESI_FARM_ID,
} from './producerCategory';
import { Category, Producer } from '../types/terroir';

describe('producerCategory taxonomy helper', () => {
  it('maps legacy peskesi-farm-kazani from kazani to farm', () => {
    const legacyPeskesi: Pick<Producer, 'id' | 'category'> = {
      id: LEGACY_PESKESI_FARM_ID,
      category: 'kazani',
    };

    expect(getEffectiveProducerCategory(legacyPeskesi)).toBe('farm');
  });

  it('keeps peskesi-farm-kazani as farm when already farm', () => {
    const migratedPeskesi: Pick<Producer, 'id' | 'category'> = {
      id: LEGACY_PESKESI_FARM_ID,
      category: 'farm',
    };

    expect(getEffectiveProducerCategory(migratedPeskesi)).toBe('farm');
  });

  it('preserves other rakokazana as kazani', () => {
    const otherKazani: Pick<Producer, 'id' | 'category'> = {
      id: 'traditional-mountain-kazani',
      category: 'kazani',
    };

    expect(getEffectiveProducerCategory(otherKazani)).toBe('kazani');
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
          id: 'any-producer-id',
          category: cat,
        })
      ).toBe(cat);
    }
  });
});
