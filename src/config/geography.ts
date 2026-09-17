import type { Destination, Producer } from '../types/terroir';

export type SupportedCountryScope =
  'GR' | 'IT' | 'FR' | 'ES' | 'PT' | 'HR' | 'SI' | 'NO';

export type CountryScope = 'all' | SupportedCountryScope;

export interface CountryConfig {
  code: SupportedCountryScope;
  name: string;
  nativeName: string;
  flag: string;
  giscoId: string;
  center: [number, number];
  zoom: number;
  nutsVersion: '2024';
  nutsLevel: 0;
  sourceUrl: string;
  boundaryAttribution: string;
}

export interface CountryLayer {
  id: CountryScope;
  label: string;
  flag: string;
  center: [number, number];
  zoom: number;
}

export interface DestinationGeography {
  countryCode: SupportedCountryScope;
  country: string;
  nutsVersion: '2021' | '2024';
  nutsLevel: 2 | 3 | 'mixed';
  nutsCodes: string[];
}

export const SUPPORTED_COUNTRY_CODES: readonly SupportedCountryScope[] = [
  'GR',
  'IT',
  'FR',
  'ES',
  'PT',
  'HR',
  'SI',
  'NO',
] as const;

export const SUPPORTED_COUNTRIES: Record<SupportedCountryScope, CountryConfig> =
  {
    GR: {
      code: 'GR',
      name: 'Greece',
      nativeName: 'Ελλάδα',
      flag: '🇬🇷',
      giscoId: 'EL',
      center: [39.1, 22.4],
      zoom: 6,
      nutsVersion: '2024',
      nutsLevel: 0,
      sourceUrl:
        'https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/NUTS_RG_10M_2024_4326_LEVL_0.geojson',
      boundaryAttribution:
        '&copy; <a href="https://ec.europa.eu/eurostat/web/gisco" target="_blank" rel="noopener noreferrer">Eurostat / GISCO</a> (NUTS 2024, 10M, CC BY 4.0)',
    },
    IT: {
      code: 'IT',
      name: 'Italy',
      nativeName: 'Italia',
      flag: '🇮🇹',
      giscoId: 'IT',
      center: [42.8, 12.5],
      zoom: 6,
      nutsVersion: '2024',
      nutsLevel: 0,
      sourceUrl:
        'https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/NUTS_RG_10M_2024_4326_LEVL_0.geojson',
      boundaryAttribution:
        '&copy; <a href="https://ec.europa.eu/eurostat/web/gisco" target="_blank" rel="noopener noreferrer">Eurostat / GISCO</a> (NUTS 2024, 10M, CC BY 4.0)',
    },
    FR: {
      code: 'FR',
      name: 'France',
      nativeName: 'France',
      flag: '🇫🇷',
      giscoId: 'FR',
      center: [46.6, 2.4],
      zoom: 6,
      nutsVersion: '2024',
      nutsLevel: 0,
      sourceUrl:
        'https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/NUTS_RG_10M_2024_4326_LEVL_0.geojson',
      boundaryAttribution:
        '&copy; <a href="https://ec.europa.eu/eurostat/web/gisco" target="_blank" rel="noopener noreferrer">Eurostat / GISCO</a> (NUTS 2024, 10M, CC BY 4.0)',
    },
    ES: {
      code: 'ES',
      name: 'Spain',
      nativeName: 'España',
      flag: '🇪🇸',
      giscoId: 'ES',
      center: [39.5, -3.5],
      zoom: 6,
      nutsVersion: '2024',
      nutsLevel: 0,
      sourceUrl:
        'https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/NUTS_RG_10M_2024_4326_LEVL_0.geojson',
      boundaryAttribution:
        '&copy; <a href="https://ec.europa.eu/eurostat/web/gisco" target="_blank" rel="noopener noreferrer">Eurostat / GISCO</a> (NUTS 2024, 10M, CC BY 4.0)',
    },
    PT: {
      code: 'PT',
      name: 'Portugal',
      nativeName: 'Portugal',
      flag: '🇵🇹',
      giscoId: 'PT',
      center: [39.6, -8.0],
      zoom: 7,
      nutsVersion: '2024',
      nutsLevel: 0,
      sourceUrl:
        'https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/NUTS_RG_10M_2024_4326_LEVL_0.geojson',
      boundaryAttribution:
        '&copy; <a href="https://ec.europa.eu/eurostat/web/gisco" target="_blank" rel="noopener noreferrer">Eurostat / GISCO</a> (NUTS 2024, 10M, CC BY 4.0)',
    },
    HR: {
      code: 'HR',
      name: 'Croatia',
      nativeName: 'Hrvatska',
      flag: '🇭🇷',
      giscoId: 'HR',
      center: [44.8, 16.0],
      zoom: 7,
      nutsVersion: '2024',
      nutsLevel: 0,
      sourceUrl:
        'https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/NUTS_RG_10M_2024_4326_LEVL_0.geojson',
      boundaryAttribution:
        '&copy; <a href="https://ec.europa.eu/eurostat/web/gisco" target="_blank" rel="noopener noreferrer">Eurostat / GISCO</a> (NUTS 2024, 10M, CC BY 4.0)',
    },
    SI: {
      code: 'SI',
      name: 'Slovenia',
      nativeName: 'Slovenija',
      flag: '🇸🇮',
      giscoId: 'SI',
      center: [46.15, 15.0],
      zoom: 8,
      nutsVersion: '2024',
      nutsLevel: 0,
      sourceUrl:
        'https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/NUTS_RG_10M_2024_4326_LEVL_0.geojson',
      boundaryAttribution:
        '&copy; <a href="https://ec.europa.eu/eurostat/web/gisco" target="_blank" rel="noopener noreferrer">Eurostat / GISCO</a> (NUTS 2024, 10M, CC BY 4.0)',
    },
    NO: {
      code: 'NO',
      name: 'Norway',
      nativeName: 'Norge',
      flag: '🇳🇴',
      giscoId: 'NO',
      center: [64.5, 13.0],
      zoom: 5,
      nutsVersion: '2024',
      nutsLevel: 0,
      sourceUrl:
        'https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/NUTS_RG_10M_2024_4326_LEVL_0.geojson',
      boundaryAttribution:
        '&copy; <a href="https://ec.europa.eu/eurostat/web/gisco" target="_blank" rel="noopener noreferrer">Eurostat / GISCO</a> (NUTS 2024, 10M, CC BY 4.0)',
    },
  };

export const isSupportedCountryCode = (
  code: string
): code is SupportedCountryScope =>
  (SUPPORTED_COUNTRY_CODES as readonly string[]).includes(code);

export const getCountryConfig = (code: SupportedCountryScope): CountryConfig =>
  SUPPORTED_COUNTRIES[code];

export const getCountryName = (code: SupportedCountryScope): string =>
  SUPPORTED_COUNTRIES[code].name;

/**
 * Country/continent navigation is intentionally separate from Destination.
 * Producers keep their regional Destination values while the UI can move
 * through Europe -> country -> NUTS-backed terroir region -> producer.
 */
export const COUNTRY_LAYERS: CountryLayer[] = [
  { id: 'all', label: 'Europe', flag: '🌍', center: [47.0, 10.0], zoom: 4 },
  ...SUPPORTED_COUNTRY_CODES.map((code) => {
    const config = SUPPORTED_COUNTRIES[code];
    return {
      id: config.code,
      label: config.name,
      flag: config.flag,
      center: config.center,
      zoom: config.zoom,
    };
  }),
];

/**
 * NUTS metadata follows the authoritative Eurostat/GISCO boundaries bundled
 * with each terroir-region geometry. Existing regions remain on their audited
 * NUTS 2021 boundaries; Thessaly uses the current NUTS 2024 EL61 geometry.
 */
export const DESTINATION_GEOGRAPHY: Record<Destination, DestinationGeography> =
  {
    crete: {
      countryCode: 'GR',
      country: 'Greece',
      nutsVersion: '2021',
      nutsLevel: 2,
      nutsCodes: ['EL43'],
    },
    santorini: {
      countryCode: 'GR',
      country: 'Greece',
      nutsVersion: '2021',
      nutsLevel: 3,
      nutsCodes: ['EL422'],
    },
    peloponnese: {
      countryCode: 'GR',
      country: 'Greece',
      nutsVersion: '2021',
      nutsLevel: 2,
      nutsCodes: ['EL65'],
    },
    thessaly: {
      countryCode: 'GR',
      country: 'Greece',
      nutsVersion: '2024',
      nutsLevel: 2,
      nutsCodes: ['EL61'],
    },
    northern_greece: {
      countryCode: 'GR',
      country: 'Greece',
      nutsVersion: '2021',
      nutsLevel: 'mixed',
      nutsCodes: [
        'EL514',
        'EL515',
        'EL521',
        'EL522',
        'EL523',
        'EL524',
        'EL525',
        'EL526',
        'EL527',
        'EL531',
        'EL532',
        'EL533',
      ],
    },
    tuscany: {
      countryCode: 'IT',
      country: 'Italy',
      nutsVersion: '2021',
      nutsLevel: 2,
      nutsCodes: ['ITI1'],
    },
    piedmont: {
      countryCode: 'IT',
      country: 'Italy',
      nutsVersion: '2024',
      nutsLevel: 2,
      nutsCodes: ['ITC1'],
    },
  };

let activeCountryScope: CountryScope = 'all';

export const readCountryFromUrl = (): CountryScope | null => {
  if (typeof window === 'undefined') return null;
  const value = new URLSearchParams(window.location.search).get('country');
  if (!value) return null;
  if (value === 'all') return 'all';
  return isSupportedCountryCode(value) ? value : null;
};

export const getActiveCountryScope = (): CountryScope => {
  const urlScope = readCountryFromUrl();
  if (urlScope) activeCountryScope = urlScope;
  return activeCountryScope;
};

export const setActiveCountryScope = (scope: CountryScope): void => {
  activeCountryScope = scope;
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  if (scope === 'all') {
    url.searchParams.delete('country');
  } else {
    url.searchParams.set('country', scope);
  }
  window.history.replaceState(
    window.history.state,
    '',
    `${url.pathname}${url.search}${url.hash}`
  );
};

export const getDestinationCountry = (
  destination: Destination
): Exclude<CountryScope, 'all'> =>
  DESTINATION_GEOGRAPHY[destination].countryCode;

export const getCountryLayer = (scope: CountryScope): CountryLayer =>
  COUNTRY_LAYERS.find((layer) => layer.id === scope) || COUNTRY_LAYERS[0];

export const producerMatchesCountry = (
  producer: Producer,
  scope: CountryScope
): boolean => {
  if (scope === 'all') return true;
  const explicit = producer.countryCode?.trim().toUpperCase();
  if (explicit) return explicit === scope;
  return getDestinationCountry(producer.destination) === scope;
};
