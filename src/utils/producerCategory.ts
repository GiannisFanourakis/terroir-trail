import { Category, Producer } from '../types/terroir';

/**
 * Returns the effective category for a producer across discovery and presentation surfaces.
 */
export function getEffectiveProducerCategory(
  producer: Pick<Producer, 'category'>
): Category {
  return producer.category;
}
