import type { Destination, Producer } from '../types/terroir';

export type CountryScope = 'all' | 'GR' | 'IT';

export interface CountryLayer {
  id: CountryScope;
  label: string;
  flag: string;
  center: [number, number];
  zoom: number;
}

export interface DestinationGeography {
  countryCode: Exclude<CountryScope, 'all'>;
  country: string;
  nutsVersion: '2021' | '2024';
  nutsLevel: 2 | 3 | 'mixed';
  nutsCodes: string[];
}

/**
 * Country/continent navigation is intentionally separate from Destination.
 * Producers keep their regional Destination values while the UI can move
 * through Europe -> country -> NUTS-backed terroir region -> producer.
 */
export const COUNTRY_LAYERS: CountryLayer[] = [
  { id: 'all', label: 'Europe', flag: '🌍', center: [47.0, 10.0], zoom: 4 },
  { id: 'GR', label: 'Greece', flag: '🇬🇷', center: [39.1, 22.4], zoom: 6 },
  { id: 'IT', label: 'Italy', flag: '🇮🇹', center: [42.8, 12.5], zoom: 6 },
];

/**
 * NUTS metadata follows the authoritative Eurostat/GISCO boundaries bundled
 * with each terroir-region geometry. Existing regions remain on their audited
 * NUTS 2021 boundaries; Thessaly uses the current NUTS 2024 EL61 geometry.
 */
export const DESTINATION_GEOGRAPHY: Record<Destination, DestinationGeography> = {
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
      'EL514', 'EL515',
      'EL521', 'EL522', 'EL523', 'EL524', 'EL525', 'EL526', 'EL527',
      'EL531', 'EL532', 'EL533',
    ],
  },
  tuscany: {
    countryCode: 'IT',
    country: 'Italy',
    nutsVersion: '2021',
    nutsLevel: 2,
    nutsCodes: ['ITI1'],
  },
};

let activeCountryScope: CountryScope = 'all';

const readCountryFromUrl = (): CountryScope | null => {
  if (typeof window === 'undefined') return null;
  const value = new URLSearchParams(window.location.search).get('country');
  return value === 'GR' || value === 'IT' ? value : value === 'all' ? 'all' : null;
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

export const getDestinationCountry = (destination: Destination): Exclude<CountryScope, 'all'> =>
  DESTINATION_GEOGRAPHY[destination].countryCode;

export const getCountryLayer = (scope: CountryScope): CountryLayer =>
  COUNTRY_LAYERS.find((layer) => layer.id === scope) || COUNTRY_LAYERS[0];

export const producerMatchesCountry = (producer: Producer, scope: CountryScope): boolean => {
  if (scope === 'all') return true;
  const explicit = producer.countryCode?.trim().toUpperCase();
  if (explicit) return explicit === scope;
  return getDestinationCountry(producer.destination) === scope;
};
