import type { Producer, Category, ProducerProductSection } from '../types/terroir';
import type { ProducerOverride } from '../types/booking';
import { parseAdditionalCategories, parseProductSections } from './producerClassification';
import { getProducerCategories } from './producerCategory';

type Classification = Pick<Producer, 'id' | 'category' | 'additionalCategories' | 'productSections'>;

/** Only an admin-reviewed classification for the current canonical primary may replace the base fields. */
export function applyApprovedClassification<T extends Classification>(producer: T, override?: ProducerOverride): T {
  if (!override || override.producerId !== producer.id ||
      !override.listingContentReviewedAt || !Number.isFinite(Date.parse(override.listingContentReviewedAt)) ||
      override.classificationPrimaryCategory !== producer.category) return producer;
  const additionalCategories = override.additionalCategories === undefined
    ? producer.additionalCategories
    : parseAdditionalCategories(override.additionalCategories, producer.category);
  const productSections = parseProductSections(
    override.productSections === undefined ? producer.productSections : override.productSections,
    getProducerCategories({ category: producer.category, additionalCategories })
  );
  return { ...producer, additionalCategories, productSections };
}

export const applyApprovedListingOverride = (
  producer: Producer,
  override?: ProducerOverride
): Producer => {
  if (!override || override.producerId !== producer.id) return producer;
  const classified = applyApprovedClassification(producer, override);
  if (classified !== producer && override.productSections !== undefined) {
    producer = {
      ...classified,
      productSpecialties: (classified.productSections || []).flatMap(section => section.specialties),
      indigenousVarieties: classified.productSections?.find(section => section.category === producer.category)?.varieties || [],
    };
  } else {
    producer = classified;
  }
  const published = { ...producer };
  for (const field of ['tagLine', 'description', 'story', 'tastingHighlights',
    'dogFriendly', 'kidFriendly', 'campervanFriendly'] as const) {
    if (override[field] !== undefined) Object.assign(published, { [field]: override[field] });
  }
  if (override.website !== undefined) published.website = override.website || undefined;
  if (override.foodOption !== undefined) published.foodOption = override.foodOption || undefined;
  if (override.walkIn !== undefined) published.walkInFriendly = override.walkIn;
  return published;
};

export interface ClassificationDraft {
  additionalCategories: Category[];
  productSections: ProducerProductSection[];
}

export function createClassificationDraft(producer: Producer): ClassificationDraft {
  const categories = getProducerCategories(producer);
  const productSections = parseProductSections(producer.productSections, categories);
  return {
    additionalCategories: categories.slice(1),
    productSections: productSections?.length ? productSections : [{
      category: producer.category,
      specialties: producer.productSpecialties || [],
      ...(producer.indigenousVarieties.length ? { varieties: producer.indigenousVarieties } : {}),
    }],
  };
}

/** Compare normalized groups so whitespace-only edits and untouched legacy products submit no changes. */
export function buildClassificationChanges(primary: Category, published: ClassificationDraft, draft: ClassificationDraft) {
  const normalize = (value: ClassificationDraft) => {
    const additionalCategories = parseAdditionalCategories(value.additionalCategories, primary);
    return {
      additionalCategories,
      productSections: parseProductSections(value.productSections, [primary, ...additionalCategories]) || [],
    };
  };
  const before = normalize(published);
  const after = normalize(draft);
  return JSON.stringify(before) === JSON.stringify(after) ? {} : after;
}
