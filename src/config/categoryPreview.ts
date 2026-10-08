import type { Producer } from '../types/terroir';
import { REVIEWED_PRODUCER_CLASSIFICATIONS } from '../data/reviewedProducerClassifications';

export const isCategoryPreview = (): boolean =>
  typeof window !== 'undefined' &&
  import.meta.env.DEV &&
  new URLSearchParams(window.location.search).get('preview') === 'categories';

/** Development-only review overlay; production never changes live or fallback authority. */
export function applyCategoryPreview(producer: Producer): Producer {
  if (
    typeof window === 'undefined' ||
    !import.meta.env.DEV ||
    !isCategoryPreview()
  )
    return producer;
  const reviewed = REVIEWED_PRODUCER_CLASSIFICATIONS.find(
    (item) => item.id === producer.id
  );
  if (!reviewed || reviewed.primaryCategory !== producer.category)
    return producer;
  return {
    ...producer,
    additionalCategories: reviewed.additionalCategories,
    visitorFeatures: reviewed.visitorFeatures || producer.visitorFeatures,
    productSections: reviewed.productSections || producer.productSections,
  };
}
