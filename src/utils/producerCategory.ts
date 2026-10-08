import type { Category, Producer, VisitorFeature } from '../types/terroir';

export const PRODUCER_CATEGORIES: readonly Category[] = [
  'winery', 'distillery', 'cidery', 'brewery', 'olive_mill',
  'olive_oil_producer', 'oil_mill', 'cheese_dairy', 'apiary',
  'confectionery', 'herb_farm', 'mushroom_farm', 'farm',
];

export const VISITOR_FEATURES: readonly VisitorFeature[] = ['museum', 'tasting', 'guided_tour'];

export const isProducerCategory = (value: unknown): value is Category =>
  typeof value === 'string' && PRODUCER_CATEGORIES.includes(value as Category);

export const isVisitorFeature = (value: unknown): value is VisitorFeature =>
  typeof value === 'string' && VISITOR_FEATURES.includes(value as VisitorFeature);

/** The primary category controls the canonical identity and fallback imagery. */
export function getEffectiveProducerCategory(producer: Pick<Producer, 'category'>): Category {
  return producer.category;
}

/** Stable primary-first membership; never duplicate a producer for each activity. */
export function getProducerCategories(
  producer: Pick<Producer, 'category' | 'additionalCategories'>
): Category[] {
  return [...new Set([
    producer.category,
    ...(Array.isArray(producer.additionalCategories)
      ? producer.additionalCategories.filter(isProducerCategory)
      : []),
  ])];
}

export function producerMatchesCategory(
  producer: Pick<Producer, 'category' | 'additionalCategories'>,
  category: Category | 'all'
): boolean {
  return category === 'all' || getProducerCategories(producer).includes(category);
}

export const getProducerVisitorFeatures = (
  producer: Pick<Producer, 'visitorFeatures'>
): VisitorFeature[] => [...new Set(
  Array.isArray(producer.visitorFeatures) ? producer.visitorFeatures.filter(isVisitorFeature) : []
)];

const DETAILS: Record<Category, { label: string; color: string; markerColor: string }> = {
  winery: { label: 'Winery', color: 'text-rose-300 bg-rose-500/15 border-rose-500/30', markerColor: 'bg-rose-500/20 text-rose-200 border-rose-500/45' },
  brewery: { label: 'Brewery', color: 'text-amber-300 bg-amber-400/15 border-amber-400/30', markerColor: 'bg-amber-400/20 text-amber-200 border-amber-400/50' },
  distillery: { label: 'Distillery', color: 'text-amber-300 bg-amber-600/15 border-amber-600/30', markerColor: 'bg-amber-600/20 text-amber-200 border-amber-600/45' },
  cidery: { label: 'Cidery', color: 'text-lime-300 bg-lime-500/15 border-lime-500/30', markerColor: 'bg-lime-600/20 text-lime-200 border-lime-600/45' },
  olive_mill: { label: 'Olive Mill', color: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30', markerColor: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/45' },
  olive_oil_producer: { label: 'Olive Oil Producer', color: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30', markerColor: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/45' },
  oil_mill: { label: 'Oil Mill', color: 'text-yellow-300 bg-yellow-600/15 border-yellow-600/30', markerColor: 'bg-yellow-600/20 text-yellow-200 border-yellow-600/45' },
  cheese_dairy: { label: 'Cheese Dairy', color: 'text-yellow-300 bg-yellow-500/15 border-yellow-500/30', markerColor: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/45' },
  apiary: { label: 'Apiary / Honey', color: 'text-orange-300 bg-orange-500/15 border-orange-500/30', markerColor: 'bg-orange-500/20 text-orange-200 border-orange-500/45' },
  confectionery: { label: 'Confectionery', color: 'text-amber-300 bg-amber-700/15 border-amber-700/30', markerColor: 'bg-amber-700/20 text-amber-200 border-amber-700/45' },
  herb_farm: { label: 'Herb Farm', color: 'text-green-300 bg-green-500/15 border-green-500/30', markerColor: 'bg-green-600/20 text-green-200 border-green-600/45' },
  mushroom_farm: { label: 'Mushroom Farm', color: 'text-stone-300 bg-stone-500/15 border-stone-500/30', markerColor: 'bg-stone-600/20 text-stone-200 border-stone-500/45' },
  farm: { label: 'Farm', color: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30', markerColor: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/45' },
};

export const getProducerCategoryDetails = (category: Category) => DETAILS[category];

export const formatProducerCategories = (
  producer: Pick<Producer, 'category' | 'additionalCategories'>
): string => getProducerCategories(producer).map((category) => DETAILS[category].label).join(' · ');

export const producerHasAlcoholCategory = (
  producer: Pick<Producer, 'category' | 'additionalCategories'>
): boolean => getProducerCategories(producer).some(
  (category) => ['winery', 'brewery', 'distillery', 'cidery'].includes(category)
);
