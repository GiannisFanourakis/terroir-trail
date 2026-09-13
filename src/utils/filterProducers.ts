import { Producer, FilterState } from '../types/terroir';

/**
 * Pure function to filter a list of producers based on user filter criteria,
 * search term, and favorite status.
 * Preserves existing catalogue ordering and filter rules exactly.
 */
export function filterProducers(
  producers: Producer[],
  filters: FilterState,
  isFavorite: (id: string) => boolean = () => false
): Producer[] {
  return producers.filter((producer) => {
    // Category filter
    if (filters.category !== 'all' && producer.category !== filters.category) {
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
    if (
      filters.roadAccess !== 'all' &&
      (producer.roadAccessStatus !== 'verified' ||
        producer.roadAccess !== filters.roadAccess)
    ) {
      return false;
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

    // Search Query filter (matches name, greek name, region, village, varieties, tagline)
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchesName = producer.name.toLowerCase().includes(q);
      const matchesGreekName = producer.greekName.toLowerCase().includes(q);
      const matchesRegion = producer.region.toLowerCase().includes(q);
      const matchesVillage = producer.village.toLowerCase().includes(q);
      const matchesVarieties = producer.indigenousVarieties.some((v) =>
        v.toLowerCase().includes(q)
      );
      const matchesTagline = producer.tagLine.toLowerCase().includes(q);

      return (
        matchesName ||
        matchesGreekName ||
        matchesRegion ||
        matchesVillage ||
        matchesVarieties ||
        matchesTagline
      );
    }

    return true;
  });
}
