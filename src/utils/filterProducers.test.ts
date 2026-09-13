import { describe, expect, it } from 'vitest';
import { filterProducers } from './filterProducers';
import { Producer, FilterState } from '../types/terroir';

const createMockProducer = (overrides: Partial<Producer> = {}): Producer => ({
  id: 'producer-default',
  name: 'Default Producer',
  greekName: 'Προεπιλεγμένος Παραγωγός',
  category: 'winery',
  destination: 'crete',
  region: 'Heraklion',
  village: 'Dafnes',
  coordinates: [35.2, 25.1],
  coverImage: 'https://example.com/cover.jpg',
  gallery: [],
  tagLine: 'Artisanal organic winemaking in Crete',
  description: 'A great producer in Crete',
  story: 'Generations of winemaking tradition',
  indigenousVarieties: ['Vidiano', 'Liatiko'],
  tastingHighlights: ['Cellar Tour', 'Tasting Flight'],
  openingHours: 'Mon-Sat 10:00-18:00',
  bestSeason: 'Apr - Nov',
  phone: '+30 2810 123456',
  website: 'https://default.gr',
  googleMapsUrl: 'https://maps.google.com/?q=35.2,25.1',
  ethos: ['organic', 'family_estate'],
  foodOption: 'tasting_board',
  roadAccess: 'paved',
  roadAccessStatus: 'verified',
  dogFriendly: true,
  kidFriendly: true,
  walkInFriendly: true,
  campervanFriendly: false,
  priceLevel: '€€',
  rating: 4.8,
  reviewCount: 42,
  ...overrides,
});

const defaultFilters: FilterState = {
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

describe('filterProducers pure utility', () => {
  const p1 = createMockProducer({
    id: 'p1',
    name: 'Douloufakis Winery',
    greekName: 'Οινοποιείο Δουλουφάκη',
    category: 'winery',
    destination: 'crete',
    region: 'Heraklion',
    village: 'Dafnes',
    indigenousVarieties: ['Vidiano', 'Liatiko'],
    tagLine: 'Organic Vidiano pioneers',
    ethos: ['organic'],
    foodOption: 'tasting_board',
    roadAccess: 'paved',
    dogFriendly: true,
    walkInFriendly: true,
    campervanFriendly: false,
  });

  const p2 = createMockProducer({
    id: 'p2',
    name: 'Charma Beer Brewery',
    greekName: 'Κρητική Ζυθοποιία Χάρμα',
    category: 'brewery',
    destination: 'crete',
    region: 'Chania',
    village: 'Zounaki',
    indigenousVarieties: ['Cretan Ale', 'Dunkel'],
    tagLine: 'Fresh craft beer from the tank',
    ethos: ['craft_batch'],
    foodOption: 'full_taverna',
    roadAccess: 'paved',
    dogFriendly: false,
    walkInFriendly: true,
    campervanFriendly: true,
  });

  const p3 = createMockProducer({
    id: 'p3',
    name: 'Estate Argyros',
    greekName: 'Κτήμα Αργυρού',
    category: 'winery',
    destination: 'santorini',
    region: 'Episkopi',
    village: 'Thira',
    indigenousVarieties: ['Assyrtiko', 'Aidani'],
    tagLine: 'Century-old ungrafted basket vines',
    ethos: ['biodynamic'],
    foodOption: 'byo_picnic',
    roadAccess: '4x4_required',
    dogFriendly: false,
    walkInFriendly: false,
    campervanFriendly: false,
  });

  const sampleProducers = [p1, p2, p3];

  it('returns all producers with default filters, preserving ordering', () => {
    const result = filterProducers(sampleProducers, defaultFilters);
    expect(result).toEqual([p1, p2, p3]);
  });

  it('filters by category', () => {
    const result = filterProducers(sampleProducers, {
      ...defaultFilters,
      category: 'brewery',
    });
    expect(result).toEqual([p2]);
  });

  it('filters by destination (macro-region)', () => {
    const result = filterProducers(sampleProducers, {
      ...defaultFilters,
      destination: 'santorini',
    });
    expect(result).toEqual([p3]);
  });

  it('filters by verified roadAccess', () => {
    const result = filterProducers(sampleProducers, {
      ...defaultFilters,
      roadAccess: '4x4_required',
    });
    expect(result).toEqual([p3]);
  });

  it(
    'does not expose unreviewed road access through a verified road filter',
    () => {
      const unreviewed = createMockProducer({
        id: 'unreviewed-road',
        roadAccess: 'paved',
        roadAccessStatus: 'unreviewed',
      });
      const result = filterProducers([p1, unreviewed], {
        ...defaultFilters,
        roadAccess: 'paved',
      });
      expect(result).toEqual([p1]);
    }
  );

  it('filters by ethos', () => {
    const result = filterProducers(sampleProducers, {
      ...defaultFilters,
      ethos: 'organic',
    });
    expect(result).toEqual([p1]);
  });

  it('filters by foodOption', () => {
    const result = filterProducers(sampleProducers, {
      ...defaultFilters,
      foodOption: 'full_taverna',
    });
    expect(result).toEqual([p2]);
  });

  it('filters by dogFriendlyOnly', () => {
    const result = filterProducers(sampleProducers, {
      ...defaultFilters,
      dogFriendlyOnly: true,
    });
    expect(result).toEqual([p1]);
  });

  it('filters by walkInOnly', () => {
    const result = filterProducers(sampleProducers, {
      ...defaultFilters,
      walkInOnly: true,
    });
    expect(result).toEqual([p1, p2]);
  });

  it('filters by campervanOnly', () => {
    const result = filterProducers(sampleProducers, {
      ...defaultFilters,
      campervanOnly: true,
    });
    expect(result).toEqual([p2]);
  });

  describe('favoritesOnly filtering', () => {
    it('filters using isFavorite callback when favoritesOnly is true', () => {
      const isFavorite = (id: string) => id === 'p3';
      const result = filterProducers(
        sampleProducers,
        { ...defaultFilters, favoritesOnly: true },
        isFavorite
      );
      expect(result).toEqual([p3]);
    });

    it('returns empty array if no favorites match', () => {
      const isFavorite = () => false;
      const result = filterProducers(
        sampleProducers,
        { ...defaultFilters, favoritesOnly: true },
        isFavorite
      );
      expect(result).toEqual([]);
    });
  });

  describe('Search query matching', () => {
    it('matches by english name case-insensitively', () => {
      const result = filterProducers(sampleProducers, {
        ...defaultFilters,
        searchQuery: 'douloufakis',
      });
      expect(result).toEqual([p1]);
    });

    it('matches by greekName', () => {
      const result = filterProducers(sampleProducers, {
        ...defaultFilters,
        searchQuery: 'Χάρμα',
      });
      expect(result).toEqual([p2]);
    });

    it('matches by region', () => {
      const result = filterProducers(sampleProducers, {
        ...defaultFilters,
        searchQuery: 'chania',
      });
      expect(result).toEqual([p2]);
    });

    it('matches by village', () => {
      const result = filterProducers(sampleProducers, {
        ...defaultFilters,
        searchQuery: 'dafnes',
      });
      expect(result).toEqual([p1]);
    });

    it('matches by indigenousVarieties', () => {
      const result = filterProducers(sampleProducers, {
        ...defaultFilters,
        searchQuery: 'assyrtiko',
      });
      expect(result).toEqual([p3]);
    });

    it('matches by tagLine', () => {
      const result = filterProducers(sampleProducers, {
        ...defaultFilters,
        searchQuery: 'ungrafted',
      });
      expect(result).toEqual([p3]);
    });

    it('ignores leading/trailing whitespace in search query', () => {
      const result = filterProducers(sampleProducers, {
        ...defaultFilters,
        searchQuery: '   argyros   ',
      });
      expect(result).toEqual([p3]);
    });

    it('returns empty array when search query matches nothing', () => {
      const result = filterProducers(sampleProducers, {
        ...defaultFilters,
        searchQuery: 'nonexistent-winery',
      });
      expect(result).toEqual([]);
    });
  });

  describe('Combined filters & edge cases', () => {
    it('handles multiple criteria simultaneously', () => {
      const result = filterProducers(sampleProducers, {
        ...defaultFilters,
        category: 'winery',
        destination: 'crete',
        dogFriendlyOnly: true,
        searchQuery: 'Vidiano',
      });
      expect(result).toEqual([p1]);
    });

    it('returns empty array when input producers array is empty', () => {
      const result = filterProducers([], defaultFilters);
      expect(result).toEqual([]);
    });
  });
});
