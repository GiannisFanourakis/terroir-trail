import { Producer, FilterState } from '../types/terroir';
import { getEffectiveProducerCategory } from './producerCategory';
import {
  getActiveCountryScope,
  producerMatchesCountry,
} from '../config/geography';

const normalizeSearchText = (value: unknown): string =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .trim();

/**
 * Pure function to filter a list of producers based on user filter criteria,
 * search term, and favorite status.
 * Search stays client-side so maker, locality, variety, and specialty fields
 * behave consistently for live and fallback catalogue data.
 * Preserves existing catalogue ordering and filter rules exactly.
 */
export function filterProducers(
  producers: Producer[],
  filters: FilterState,
  isFavorite: (id: string) => boolean = () => false
): Producer[] {
  const activeCountryScope = getActiveCountryScope();

  return producers.filter((producer) => {
    // Use the discovery-facing category so legacy rows do not leak incorrect
    // taxonomy while their persisted source is being migrated.
    if (
      filters.category !== 'all' &&
      getEffectiveProducerCategory(producer) !== filters.category
    ) {
      return false;
    }

    // Country scope applies only while no specific terroir destination is selected.
    // A region selection is already more specific than its parent country.
    if (
      filters.destination === 'all' &&
      activeCountryScope !== 'all' &&
      !producerMatchesCountry(producer, activeCountryScope)
    ) {
      return false;
    }

    // Destination filter (Macro-Region: Crete, Santorini, Peloponnese, etc.)
    if (
      filters.destination !== 'all' &&
      producer.destination !== filters.destination
    ) {
      return false;
    }

    // Road Access filter — never treat an unreviewed/uncertain classification as verified.
    if (filters.roadAccess !== 'all') {
      if (
        producer.roadAccessStatus !== 'verified' ||
        producer.roadAccess !== filters.roadAccess
      ) {
        return false;
      }
    }

    // Ethos filter
    if (filters.ethos !== 'all' && !producer.ethos.includes(filters.ethos)) {
      return false;
    }

    // Food Option filter
    if (
      filters.foodOption !== 'all' &&
      producer.foodOption !== filters.foodOption
    ) {
      return false;
    }

    // Dog friendly
    if (filters.dogFriendlyOnly && !producer.dogFriendly) {
      return false;
    }

    // Walk-in friendly
    if (filters.walkInOnly && !producer.walkInFriendly) {
      return false;
    }

    // Campervan friendly
    if (filters.campervanOnly && !producer.campervanFriendly) {
      return false;
    }

    // Favorites only
    if (filters.favoritesOnly && !isFavorite(producer.id)) {
      return false;
    }

    // Search Query filter. Keep this null-safe because live catalogue rows can
    // legitimately omit optional locality/marketing fields.
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = normalizeSearchText(filters.searchQuery);
      const searchableValues: unknown[] = [
        producer.name,
        producer.greekName,
        producer.region,
        producer.village,
        producer.locality,
        producer.country,
        producer.tagLine,
        ...(producer.indigenousVarieties || []),
        ...(producer.productSpecialties || []),
      ];

      return searchableValues.some((value) =>
        normalizeSearchText(value).includes(q)
      );
    }

    return true;
  });
}
