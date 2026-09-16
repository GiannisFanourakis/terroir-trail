import { Producer } from '../types/terroir';

/**
 * Prefer the category-neutral, source-backed product taxonomy introduced in
 * Phase 13. Legacy indigenousVarieties remains as a compatibility fallback for
 * existing winery and older catalogue records until each category is migrated.
 */
export function getProducerDisplaySpecialties(producer: Producer): string[] {
  if (producer.productSpecialties !== undefined) {
    return producer.productSpecialties;
  }

  return producer.indigenousVarieties;
}
