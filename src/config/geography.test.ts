import { afterEach, describe, expect, it } from 'vitest';
import type { Producer } from '../types/terroir';
import { filterProducers } from '../utils/filterProducers';
import {
  DESTINATION_GEOGRAPHY,
  getDestinationCountry,
  producerMatchesCountry,
  setActiveCountryScope,
} from './geography';

const baseProducer = (overrides: Partial<Producer>): Producer => ({
  id: 'test-producer',
  name: 'Test Producer',
  greekName: 'Test Producer',
  category: 'winery',
  destination: 'crete',
  region: 'Test Region',
  village: 'Test Village',
  coordinates: [35, 25],
  coverImage: '/test.jpg',
  gallery: [],
  tagLine: 'Test',
  description: 'Test',
  story: 'Test',
  indigenousVarieties: [],
  tastingHighlights: [],
  openingHours: 'By appointment',
  ethos: [],
  ...overrides,
});

const baseFilters = {
  category: 'all' as const,
  destination: 'all' as const,
  roadAccess: 'all' as const,
  ethos: 'all' as const,
  foodOption: 'all' as const,
  searchQuery: '',
  dogFriendlyOnly: false,
  walkInOnly: false,
  campervanOnly: false,
  favoritesOnly: false,
};

afterEach(() => {
  setActiveCountryScope('all');
});

describe('country and NUTS geography', () => {
  it('maps current destinations to their parent countries', () => {
    expect(getDestinationCountry('crete')).toBe('GR');
    expect(getDestinationCountry('santorini')).toBe('GR');
    expect(getDestinationCountry('peloponnese')).toBe('GR');
    expect(getDestinationCountry('northern_greece')).toBe('GR');
    expect(getDestinationCountry('thessaly')).toBe('GR');
    expect(getDestinationCountry('tuscany')).toBe('IT');
    expect(getDestinationCountry('piedmont')).toBe('IT');
  });

  it('keeps the current NUTS identifiers explicit', () => {
    expect(DESTINATION_GEOGRAPHY.crete.nutsCodes).toEqual(['EL43']);
    expect(DESTINATION_GEOGRAPHY.santorini.nutsCodes).toEqual(['EL422']);
    expect(DESTINATION_GEOGRAPHY.peloponnese.nutsCodes).toEqual(['EL65']);
    expect(DESTINATION_GEOGRAPHY.thessaly.nutsCodes).toEqual(['EL61']);
    expect(DESTINATION_GEOGRAPHY.tuscany.nutsCodes).toEqual(['ITI1']);
    expect(DESTINATION_GEOGRAPHY.piedmont.nutsCodes).toEqual(['ITC1']);
    expect(DESTINATION_GEOGRAPHY.northern_greece.nutsCodes).toContain('EL521');
    expect(DESTINATION_GEOGRAPHY.northern_greece.nutsCodes).toContain('EL533');
  });

  it('matches producer country from explicit countryCode or destination fallback', () => {
    const greekProducer = baseProducer({
      destination: 'crete',
      countryCode: 'GR',
    });
    const italianProducer = baseProducer({
      destination: 'tuscany',
      countryCode: 'IT',
    });
    const italianFallback = baseProducer({
      destination: 'tuscany',
      countryCode: undefined,
    });

    expect(producerMatchesCountry(greekProducer, 'GR')).toBe(true);
    expect(producerMatchesCountry(greekProducer, 'IT')).toBe(false);
    expect(producerMatchesCountry(italianProducer, 'IT')).toBe(true);
    expect(producerMatchesCountry(italianFallback, 'IT')).toBe(true);
  });

  it('filters the all-destinations catalogue by the active country scope', () => {
    const greekProducer = baseProducer({
      id: 'gr',
      destination: 'crete',
      countryCode: 'GR',
    });
    const italianProducer = baseProducer({
      id: 'it',
      destination: 'tuscany',
      countryCode: 'IT',
    });

    setActiveCountryScope('IT');
    expect(
      filterProducers([greekProducer, italianProducer], baseFilters).map(
        (p) => p.id
      )
    ).toEqual(['it']);

    setActiveCountryScope('GR');
    expect(
      filterProducers([greekProducer, italianProducer], baseFilters).map(
        (p) => p.id
      )
    ).toEqual(['gr']);
  });
});
