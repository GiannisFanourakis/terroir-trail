import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { FilterState, Producer } from '../types/terroir';
import { LIVE_CATALOGUE_PRODUCERS } from '../data/liveCatalogue.generated';
import { REVIEWED_PRODUCER_CLASSIFICATIONS } from '../data/reviewedProducerClassifications';
import {
  applyCategoryPreview,
  isCategoryPreview,
} from '../config/categoryPreview';
import {
  getProducerCategories,
  producerMatchesCategory,
  producerHasAlcoholCategory,
} from './producerCategory';
import {
  parseAdditionalCategories,
  parseVisitorFeatures,
  parseProductSections,
} from './producerClassification';
import {
  getProducerMarkerHtml,
  getProducerMarkerDimensions,
} from './producerMapPins';
import { filterProducers } from './filterProducers';
import { ProducerCategoryBadges } from '../components/Common/ProducerCategoryBadges';
import { ProducerProductSections } from '../components/Common/ProducerProductSections';
import { groupProducersByMembership } from '../../scripts/producerGroups';
import { buildCatalogueState } from '../../scripts/catalogueState';

const original = LIVE_CATALOGUE_PRODUCERS.find(
  (producer) => producer.id === 'la-vinyeta-catalonia'
)!;
const reviewed = REVIEWED_PRODUCER_CLASSIFICATIONS.find(
  (producer) => producer.id === original.id
)!;
const producer: Producer = {
  ...original,
  additionalCategories: reviewed.additionalCategories,
  productSections: reviewed.productSections,
};
const filters: FilterState = {
  category: 'all',
  destination: 'all',
  searchQuery: '',
  roadAccess: 'all',
  ethos: 'all',
  foodOption: 'all',
  dogFriendlyOnly: false,
  walkInOnly: false,
  campervanOnly: false,
  favoritesOnly: false,
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('multiple producer categories', () => {
  it('keeps a primary-first unique membership and ignores unrecognized secondary values', () => {
    const value = {
      category: 'winery' as const,
      additionalCategories: [
        'apiary',
        'winery',
        'museum',
        'apiary',
      ] as Producer['additionalCategories'],
    };
    expect(getProducerCategories(value)).toEqual(['winery', 'apiary']);
    expect(producerMatchesCategory(value, 'apiary')).toBe(true);
    expect(producerMatchesCategory(value, 'distillery')).toBe(false);
    expect(
      producerHasAlcoholCategory({
        category: 'olive_mill',
        additionalCategories: ['winery'],
      })
    ).toBe(true);
  });

  it('returns one listing under each of its categories and preserves distinct producer totals', () => {
    for (const category of getProducerCategories(producer)) {
      expect(filterProducers([producer], { ...filters, category })).toEqual([
        producer,
      ]);
    }
    expect(filterProducers([producer], filters)).toHaveLength(1);
    const groups = groupProducersByMembership(
      [producer, producer],
      getProducerCategories
    );
    expect(groups.size).toBe(4);
    for (const group of groups.values())
      expect(group.map((item) => item.id)).toEqual([producer.id]);
    expect(buildCatalogueState([producer])).toMatchObject({
      producers: 1,
      categories: 4,
    });
  });

  it('requires an explicit museum feature and does not infer visitor access from it', () => {
    const museum: Producer = {
      ...producer,
      visitorFeatures: ['museum'],
      visitStatus: 'not_publicly_confirmed',
    };
    expect(
      filterProducers([producer, museum], { ...filters, museumOnly: true })
    ).toEqual([museum]);
    expect(museum.visitStatus).toBe('not_publicly_confirmed');
    const html = renderToStaticMarkup(
      React.createElement(ProducerCategoryBadges, { producer: museum })
    );
    expect(html).not.toContain('data-visitor-feature=');
    expect(html).not.toContain('data-maker-category="museum"');
  });

  it('finds specialties in a secondary maker section', () => {
    const value: Producer = {
      ...producer,
      productSections: [
        { category: 'apiary', specialties: ['Distinctive mountain honey'] },
      ],
    };
    expect(
      filterProducers([value], {
        ...filters,
        category: 'apiary',
        searchQuery: 'mountain honey',
      })
    ).toEqual([value]);
  });

  it('parses malformed metadata without creating classifications or products', () => {
    expect(
      parseAdditionalCategories(
        ['winery', 'museum', 'apiary', 'apiary', null],
        'winery'
      )
    ).toEqual(['apiary']);
    expect(parseAdditionalCategories('apiary', 'winery')).toEqual([]);
    expect(parseVisitorFeatures(['museum', 'winery', null, 'museum'])).toEqual([
      'museum',
    ]);
    expect(parseProductSections(null, ['winery'])).toBeUndefined();
    expect(
      parseProductSections(
        [
          null,
          { category: 'museum', specialties: ['Invalid maker'] },
          { category: 'distillery', specialties: ['Unclassified activity'] },
          { category: 'apiary', specialties: [' Honey ', '', 'Honey', 3] },
          { category: 'apiary', specialties: ['Duplicate section'] },
          { category: 'winery', specialties: [], varieties: ['Carinyena'] },
        ],
        ['winery', 'apiary']
      )
    ).toEqual([
      { category: 'winery', specialties: [], varieties: ['Carinyena'] },
      { category: 'apiary', specialties: ['Honey'] },
    ]);
  });

  it('shows three maker icons and an overflow count with all categories in the accessible name', () => {
    const html = getProducerMarkerHtml(producer, false, true);
    expect(html.match(/data-maker-category=/g) ?? []).toHaveLength(3);
    expect(html).toContain('>+1</span>');
    expect(html).toContain('Apiary / Honey');
    expect(html).toContain('data-category-count="4"');
    const compact = getProducerMarkerDimensions(producer, true);
    const detailed = getProducerMarkerDimensions(producer, false);
    expect(compact.iconAnchor[0]).toBe(detailed.iconAnchor[0]);
    expect(compact.iconSize[0]).toBeLessThan(detailed.iconSize[0]);
  });

  it('escapes producer text in Leaflet HTML and keeps the museum symbol separate', () => {
    const unsafe: Producer = {
      ...producer,
      id: 'evil"><img src=x onerror=alert(1)>',
      name: '<script>alert(1)</script>',
      village: 'Town <svg onload=alert(2)>',
      visitorFeatures: ['museum'],
    };
    const html = getProducerMarkerHtml(unsafe, true);
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('data-visitor-feature="museum"');
    expect(html).not.toContain('data-maker-category="museum"');
  });

  it('renders every badge and groups products under their maker category', () => {
    const badges = renderToStaticMarkup(
      React.createElement(ProducerCategoryBadges, { producer })
    );
    for (const category of getProducerCategories(producer))
      expect(badges).toContain('data-maker-category="' + category + '"');
    const products = renderToStaticMarkup(
      React.createElement(ProducerProductSections, {
        sections: producer.productSections!,
      })
    );
    for (const section of producer.productSections!)
      expect(products).toContain(
        'data-product-category="' + section.category + '"'
      );
  });

  it('requires an explicit development preview and preserves authoritative identity and access', () => {
    vi.stubGlobal('window', { location: { search: '?preview=categories' } });
    vi.stubEnv('DEV', false);
    expect(isCategoryPreview()).toBe(false);
    expect(applyCategoryPreview(original)).toBe(original);
    vi.stubEnv('DEV', true);
    expect(isCategoryPreview()).toBe(true);
    const preview = applyCategoryPreview(original);
    expect(getProducerCategories(preview)).toHaveLength(4);
    for (const key of [
      'id',
      'category',
      'coordinates',
      'locationStatus',
      'roadAccessStatus',
      'visitStatus',
    ] as const) {
      expect(preview[key]).toBe(original[key]);
    }
    vi.stubGlobal('window', { location: { search: '' } });
    expect(applyCategoryPreview(original)).toBe(original);
  });
});
