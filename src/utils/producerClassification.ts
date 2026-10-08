import type { Category, ProducerProductSection, VisitorFeature } from '../types/terroir';
import { isProducerCategory, isVisitorFeature } from './producerCategory';

const stringList = (value: unknown): string[] =>
  Array.isArray(value) ? [...new Set(value.filter(
    (item): item is string => typeof item === 'string' && item.trim().length > 0
  ).map((item) => item.trim()))] : [];

export const parseAdditionalCategories = (value: unknown, primary: Category): Category[] =>
  Array.isArray(value) ? [...new Set(value.filter(
    (item): item is Category => isProducerCategory(item) && item !== primary
  ))] : [];

export const parseVisitorFeatures = (value: unknown): VisitorFeature[] =>
  Array.isArray(value) ? [...new Set(value.filter(isVisitorFeature))] : [];

export function parseProductSections(
  value: unknown, categories: readonly Category[]
): ProducerProductSection[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const sections = new Map<Category, ProducerProductSection>();
  for (const item of value) {
    if (!item || typeof item !== 'object' || !isProducerCategory(item.category) ||
        !categories.includes(item.category) || sections.has(item.category)) continue;
    const specialties = stringList(item.specialties);
    const varieties = stringList(item.varieties);
    const highlights = stringList(item.highlights);
    if (!specialties.length && !varieties.length && !highlights.length) continue;
    sections.set(item.category, {
      category: item.category,
      specialties,
      ...(varieties.length ? { varieties } : {}),
      ...(highlights.length ? { highlights } : {}),
    });
  }
  return categories.flatMap((category) => {
    const section = sections.get(category);
    return section ? [section] : [];
  });
}
