import { describe, expect, it } from 'vitest';
import { LIVE_CATALOGUE_PRODUCERS } from '../data/liveCatalogue.generated';
import type { ProducerOverride } from '../types/booking';
import { applyApprovedListingOverride, buildClassificationChanges, createClassificationDraft } from './approvedProducerListing';

const producer = LIVE_CATALOGUE_PRODUCERS.find(value => value.id === 'anoskeli-estate')!;
const approved: ProducerOverride = {
  producerId: producer.id, isAcceptingBookings: false,
  classificationPrimaryCategory: 'winery',
  additionalCategories: ['olive_mill', 'cheese_dairy'],
  productSections: [
    { category: 'winery', specialties: ['Estate wine'] },
    { category: 'olive_mill', specialties: ['Estate oil'] },
    { category: 'cheese_dairy', specialties: ['Estate cheese'] },
  ],
  classificationSourceUrl: 'https://example.test/products',
  listingContentReviewedAt: '2026-10-09T00:00:00Z', updatedAt: '2026-10-09T00:00:00Z',
};

describe('approved listing classification projection', () => {
  it('publishes reviewed groups without changing primary identity, location or visiting facts', () => {
    const projected = applyApprovedListingOverride(producer, approved);
    expect(projected.additionalCategories).toEqual(['olive_mill', 'cheese_dairy']);
    expect(projected.productSections?.map(value => value.category)).toEqual(['winery', 'olive_mill', 'cheese_dairy']);
    for (const field of ['id', 'name', 'category', 'coordinates', 'visitStatus', 'roadAccessStatus'] as const) {
      expect(projected[field]).toEqual(producer[field]);
    }
    expect(producer.additionalCategories).toEqual(['olive_mill']);
  });

  it('ignores unreviewed, mismatched listing and stale-primary classifications', () => {
    for (const override of [
      { ...approved, listingContentReviewedAt: undefined },
      { ...approved, listingContentReviewedAt: 'invalid' },
      { ...approved, producerId: 'another-producer' },
      { ...approved, classificationPrimaryCategory: 'farm' as const },
    ]) {
      expect(applyApprovedListingOverride(producer, override).additionalCategories).toEqual(producer.additionalCategories);
    }
  });

  it('supports clearing extra categories and removes orphaned product groups', () => {
    const projected = applyApprovedListingOverride(producer, { ...approved, additionalCategories: [], productSections: [] });
    expect(projected.additionalCategories).toEqual([]);
    expect(projected.productSections).toEqual([]);
    expect(projected.productSpecialties).toEqual([]);
    expect(projected.indigenousVarieties).toEqual([]);
  });
});

describe('classification drafts', () => {
  it('does not submit unchanged legacy products or whitespace-only edits', () => {
    const legacy = { ...producer, additionalCategories: [], productSections: undefined };
    const draft = createClassificationDraft(legacy);
    expect(buildClassificationChanges(legacy.category, draft, draft)).toEqual({});
    const changed = { ...draft, productSections: draft.productSections.map(group => ({
      ...group, specialties: group.specialties.map(value => ` ${value} `),
    })) };
    expect(buildClassificationChanges(legacy.category, draft, changed)).toEqual({});
  });

  it('submits categories and normalized groups together and removes deselected groups', () => {
    const before = createClassificationDraft(producer);
    const changes = buildClassificationChanges(producer.category, before, {
      additionalCategories: ['cheese_dairy'],
      productSections: [
        ...before.productSections,
        { category: 'cheese_dairy', specialties: [' Estate cheese ', 'Estate cheese', ''] },
      ],
    });
    expect(changes).toEqual({
      additionalCategories: ['cheese_dairy'],
      productSections: [
        before.productSections.find(value => value.category === 'winery'),
        { category: 'cheese_dairy', specialties: ['Estate cheese'] },
      ],
    });
  });
});
