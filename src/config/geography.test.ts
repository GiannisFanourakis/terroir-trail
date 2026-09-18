import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Producer } from '../types/terroir';
import { filterProducers } from '../utils/filterProducers';
import {
  COUNTRY_LAYERS,
  DESTINATION_GEOGRAPHY,
  getActiveCountryScope,
  getCountryConfig,
  getCountryLayer,
  getCountryName,
  getDestinationCountry,
  isSupportedCountryCode,
  producerMatchesCountry,
  readCountryFromUrl,
  setActiveCountryScope,
  SUPPORTED_COUNTRIES,
  SUPPORTED_COUNTRY_CODES,
  type SupportedCountryScope,
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
  it('supports exactly the 8 defined European countries', () => {
    expect(SUPPORTED_COUNTRY_CODES).toHaveLength(8);
    expect(SUPPORTED_COUNTRY_CODES).toEqual([
      'GR',
      'IT',
      'FR',
      'ES',
      'PT',
      'HR',
      'SI',
      'NO',
    ]);
  });

  it('defines comprehensive CountryConfig for each supported country', () => {
    for (const code of SUPPORTED_COUNTRY_CODES) {
      const config = SUPPORTED_COUNTRIES[code];
      expect(config).toBeDefined();
      expect(config.code).toBe(code);
      expect(typeof config.name).toBe('string');
      expect(config.name.length).toBeGreaterThan(0);
      expect(typeof config.nativeName).toBe('string');
      expect(config.nativeName.length).toBeGreaterThan(0);
      expect(config.nutsVersion).toBe('2024');
      expect(config.nutsLevel).toBe(0);
      expect(config.sourceUrl).toContain(
        'NUTS_RG_10M_2024_4326_LEVL_0.geojson'
      );
      expect(config.boundaryAttribution).toContain('Eurostat / GISCO');
      expect(Array.isArray(config.center)).toBe(true);
      expect(config.center).toHaveLength(2);
      expect(Number.isFinite(config.center[0])).toBe(true);
      expect(Number.isFinite(config.center[1])).toBe(true);
      expect(config.zoom).toBeGreaterThanOrEqual(4);
      expect(config.zoom).toBeLessThanOrEqual(10);
    }

    // Greece uses Eurostat NUTS Level 0 code 'EL'
    expect(SUPPORTED_COUNTRIES.GR.giscoId).toBe('EL');

    // All other 7 countries use their ISO-2 code as giscoId
    const otherCodes: SupportedCountryScope[] = [
      'IT',
      'FR',
      'ES',
      'PT',
      'HR',
      'SI',
      'NO',
    ];
    for (const code of otherCodes) {
      expect(SUPPORTED_COUNTRIES[code].giscoId).toBe(code);
    }
  });

  it('generates COUNTRY_LAYERS starting with Europe and including all 8 countries', () => {
    expect(COUNTRY_LAYERS).toHaveLength(9);
    expect(COUNTRY_LAYERS[0]).toEqual({
      id: 'all',
      label: 'Europe',
      center: [47.0, 10.0],
      zoom: 4,
    });

    for (const code of SUPPORTED_COUNTRY_CODES) {
      const config = SUPPORTED_COUNTRIES[code];
      const layer = COUNTRY_LAYERS.find((l) => l.id === code);
      expect(layer).toBeDefined();
      expect(layer?.label).toBe(config.name);
      expect(layer?.center).toEqual(config.center);
      expect(layer?.zoom).toBe(config.zoom);
    }
  });

  it('validates country codes with isSupportedCountryCode helper', () => {
    for (const code of SUPPORTED_COUNTRY_CODES) {
      expect(isSupportedCountryCode(code)).toBe(true);
    }
    expect(isSupportedCountryCode('DE')).toBe(false);
    expect(isSupportedCountryCode('US')).toBe(false);
    expect(isSupportedCountryCode('all')).toBe(false);
    expect(isSupportedCountryCode('')).toBe(false);
  });

  it('provides getCountryConfig and getCountryName helpers', () => {
    expect(getCountryConfig('FR').name).toBe('France');
    expect(getCountryConfig('ES').name).toBe('Spain');
    expect(getCountryConfig('PT').name).toBe('Portugal');
    expect(getCountryConfig('HR').name).toBe('Croatia');
    expect(getCountryConfig('SI').name).toBe('Slovenia');
    expect(getCountryConfig('NO').name).toBe('Norway');
    expect(getCountryConfig('GR').name).toBe('Greece');
    expect(getCountryConfig('IT').name).toBe('Italy');

    expect(getCountryName('FR')).toBe('France');
    expect(getCountryName('NO')).toBe('Norway');
  });

  it('retrieves country layers correctly with fallback', () => {
    expect(getCountryLayer('FR').id).toBe('FR');
    expect(getCountryLayer('NO').id).toBe('NO');
    expect(getCountryLayer('all').id).toBe('all');
    // Unknown scope falls back to Europe
    expect(getCountryLayer('UNKNOWN' as any).id).toBe('all');
  });

  it('reads country scope from URL parameters and sets active scope', () => {
    const mockWindow = {
      location: {
        href: 'https://terroir-trail.web.app/',
        search: '',
      },
      history: {
        state: null,
        replaceState: (_state: unknown, _title: string, url: string) => {
          mockWindow.location.href = `https://terroir-trail.web.app${url}`;
          mockWindow.location.search = url.includes('?')
            ? url.slice(url.indexOf('?'))
            : '';
        },
      },
    };
    vi.stubGlobal('window', mockWindow);

    try {
      for (const code of SUPPORTED_COUNTRY_CODES) {
        setActiveCountryScope(code);
        expect(readCountryFromUrl()).toBe(code);
        expect(getActiveCountryScope()).toBe(code);
      }

      setActiveCountryScope('all');
      expect(readCountryFromUrl()).toBe(null);
      expect(getActiveCountryScope()).toBe('all');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('maps current destinations to their parent countries', () => {
    expect(getDestinationCountry('crete')).toBe('GR');
    expect(getDestinationCountry('santorini')).toBe('GR');
    expect(getDestinationCountry('peloponnese')).toBe('GR');
    expect(getDestinationCountry('northern_greece')).toBe('GR');
    expect(getDestinationCountry('thessaly')).toBe('GR');
    expect(getDestinationCountry('tuscany')).toBe('IT');
    expect(getDestinationCountry('piedmont')).toBe('IT');
    expect(getDestinationCountry('puglia')).toBe('IT');
    expect(getDestinationCountry('sicily')).toBe('IT');
    expect(getDestinationCountry('south_tyrol')).toBe('IT');
    expect(getDestinationCountry('provence')).toBe('FR');
    expect(getDestinationCountry('catalonia')).toBe('ES');
    expect(getDestinationCountry('alentejo')).toBe('PT');
    expect(getDestinationCountry('istria')).toBe('HR');
    expect(getDestinationCountry('pomurska')).toBe('SI');
    expect(getDestinationCountry('southeast_slovenia')).toBe('SI');
    expect(getDestinationCountry('central_slovenia')).toBe('SI');
    expect(getDestinationCountry('goriska')).toBe('SI');
    expect(getDestinationCountry('trondelag')).toBe('NO');
    expect(getDestinationCountry('more_og_romsdal')).toBe('NO');
    expect(getDestinationCountry('buskerud')).toBe('NO');
    expect(getDestinationCountry('vestland')).toBe('NO');
  });

  it('keeps the current NUTS and Statistical Region identifiers explicit', () => {
    expect(DESTINATION_GEOGRAPHY.crete.nutsCodes).toEqual(['EL43']);
    expect(DESTINATION_GEOGRAPHY.santorini.nutsCodes).toEqual(['EL422']);
    expect(DESTINATION_GEOGRAPHY.peloponnese.nutsCodes).toEqual(['EL65']);
    expect(DESTINATION_GEOGRAPHY.thessaly.nutsCodes).toEqual(['EL61']);
    expect(DESTINATION_GEOGRAPHY.tuscany.nutsCodes).toEqual(['ITI1']);
    expect(DESTINATION_GEOGRAPHY.piedmont.nutsCodes).toEqual(['ITC1']);
    expect(DESTINATION_GEOGRAPHY.northern_greece.nutsCodes).toContain('EL521');
    expect(DESTINATION_GEOGRAPHY.northern_greece.nutsCodes).toContain('EL533');
    expect(DESTINATION_GEOGRAPHY.puglia.nutsCodes).toEqual(['ITF4']);
    expect(DESTINATION_GEOGRAPHY.sicily.nutsCodes).toEqual(['ITG1']);
    expect(DESTINATION_GEOGRAPHY.south_tyrol.nutsCodes).toEqual(['ITH1']);
    expect(DESTINATION_GEOGRAPHY.provence.nutsCodes).toEqual(['FRL0']);
    expect(DESTINATION_GEOGRAPHY.catalonia.nutsCodes).toEqual(['ES51']);
    expect(DESTINATION_GEOGRAPHY.alentejo.nutsCodes).toEqual(['PT1C']);
    expect(DESTINATION_GEOGRAPHY.istria.nutsCodes).toEqual(['HR036']);
    expect(DESTINATION_GEOGRAPHY.pomurska.nutsCodes).toEqual(['SI031']);
    expect(DESTINATION_GEOGRAPHY.southeast_slovenia.nutsCodes).toEqual([
      'SI037',
    ]);
    expect(DESTINATION_GEOGRAPHY.central_slovenia.nutsCodes).toEqual(['SI041']);
    expect(DESTINATION_GEOGRAPHY.goriska.nutsCodes).toEqual(['SI043']);
    expect(DESTINATION_GEOGRAPHY.trondelag.nutsCodes).toEqual(['NO060']);
    expect(DESTINATION_GEOGRAPHY.more_og_romsdal.nutsCodes).toEqual(['NO0A3']);
    expect(DESTINATION_GEOGRAPHY.buskerud.nutsCodes).toEqual(['NO085']);
    expect(DESTINATION_GEOGRAPHY.vestland.nutsCodes).toEqual(['NO0A2']);
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

    // Matches explicit countryCode for each of the new 6 countries
    const newCountryCodes: SupportedCountryScope[] = [
      'FR',
      'ES',
      'PT',
      'HR',
      'SI',
      'NO',
    ];
    for (const code of newCountryCodes) {
      const p = baseProducer({
        destination: 'crete', // existing destination dummy
        countryCode: code,
      });
      expect(producerMatchesCountry(p, code)).toBe(true);
      expect(producerMatchesCountry(p, 'GR')).toBe(false);
      expect(producerMatchesCountry(p, 'all')).toBe(true);
    }
  });

  it('filters the all-destinations catalogue by the active country scope across all 8 countries', () => {
    const producers = SUPPORTED_COUNTRY_CODES.map((code, index) =>
      baseProducer({
        id: `producer-${code.toLowerCase()}`,
        destination: index % 2 === 0 ? 'crete' : 'tuscany',
        countryCode: code,
      })
    );

    // When scope is 'all', all 8 are included
    setActiveCountryScope('all');
    expect(filterProducers(producers, baseFilters)).toHaveLength(8);

    // Filter by each supported country
    for (const code of SUPPORTED_COUNTRY_CODES) {
      setActiveCountryScope(code);
      const filtered = filterProducers(producers, baseFilters);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe(`producer-${code.toLowerCase()}`);
    }
  });
});
