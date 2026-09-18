import type { Destination, Producer } from '../types/terroir';

export type SupportedCountryScope =
  'GR' | 'IT' | 'FR' | 'ES' | 'PT' | 'HR' | 'SI' | 'NO';

export type CountryScope = 'all' | SupportedCountryScope;

export interface CountryConfig {
  code: SupportedCountryScope;
  name: string;
  nativeName: string;
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
  center: [number, number];
  zoom: number;
}

export interface DestinationGeography {
  countryCode: SupportedCountryScope;
  country: string;
  classificationType?: 'NUTS' | 'Statistical Region';
  officialName?: string;
  nativeName?: string;
  nutsVersion?: '2021' | '2024';
  nutsLevel?: 2 | 3 | 'mixed';
  nutsCodes?: string[];
  srVersion?: '2024';
  srLevel?: 2 | 3;
  srCodes?: string[];
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
  { id: 'all', label: 'Europe', center: [47.0, 10.0], zoom: 4 },
  ...SUPPORTED_COUNTRY_CODES.map((code) => {
    const config = SUPPORTED_COUNTRIES[code];
    return {
      id: config.code,
      label: config.name,
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
      classificationType: 'NUTS',
      nutsVersion: '2024',
      nutsLevel: 2,
      nutsCodes: ['ITC1'],
    },
    puglia: {
      countryCode: 'IT',
      country: 'Italy',
      classificationType: 'NUTS',
      officialName: 'Puglia',
      nativeName: 'Puglia',
      nutsVersion: '2024',
      nutsLevel: 2,
      nutsCodes: ['ITF4'],
    },
    sicily: {
      countryCode: 'IT',
      country: 'Italy',
      classificationType: 'NUTS',
      officialName: 'Sicilia',
      nativeName: 'Sicilia',
      nutsVersion: '2024',
      nutsLevel: 2,
      nutsCodes: ['ITG1'],
    },
    south_tyrol: {
      countryCode: 'IT',
      country: 'Italy',
      classificationType: 'NUTS',
      officialName: 'Provincia Autonoma di Bolzano/Bozen',
      nativeName: 'Südtirol / Alto Adige',
      nutsVersion: '2024',
      nutsLevel: 2,
      nutsCodes: ['ITH1'],
    },
    provence: {
      countryCode: 'FR',
      country: 'France',
      classificationType: 'NUTS',
      officialName: "Provence-Alpes-Côte d'Azur",
      nativeName: "Provence-Alpes-Côte d'Azur",
      nutsVersion: '2024',
      nutsLevel: 2,
      nutsCodes: ['FRL0'],
    },
    catalonia: {
      countryCode: 'ES',
      country: 'Spain',
      classificationType: 'NUTS',
      officialName: 'Cataluña',
      nativeName: 'Catalunya / Cataluña',
      nutsVersion: '2024',
      nutsLevel: 2,
      nutsCodes: ['ES51'],
    },
    alentejo: {
      countryCode: 'PT',
      country: 'Portugal',
      classificationType: 'NUTS',
      officialName: 'Alentejo',
      nativeName: 'Alentejo',
      nutsVersion: '2024',
      nutsLevel: 2,
      nutsCodes: ['PT1C'],
    },
    istria: {
      countryCode: 'HR',
      country: 'Croatia',
      classificationType: 'NUTS',
      officialName: 'Istarska županija',
      nativeName: 'Istra',
      nutsVersion: '2024',
      nutsLevel: 3,
      nutsCodes: ['HR036'],
    },
    pomurska: {
      countryCode: 'SI',
      country: 'Slovenia',
      classificationType: 'NUTS',
      officialName: 'Pomurska',
      nativeName: 'Pomurska regija',
      nutsVersion: '2024',
      nutsLevel: 3,
      nutsCodes: ['SI031'],
    },
    southeast_slovenia: {
      countryCode: 'SI',
      country: 'Slovenia',
      classificationType: 'NUTS',
      officialName: 'Jugovzhodna Slovenija',
      nativeName: 'Jugovzhodna Slovenija',
      nutsVersion: '2024',
      nutsLevel: 3,
      nutsCodes: ['SI037'],
    },
    central_slovenia: {
      countryCode: 'SI',
      country: 'Slovenia',
      classificationType: 'NUTS',
      officialName: 'Osrednjeslovenska',
      nativeName: 'Osrednjeslovenska regija',
      nutsVersion: '2024',
      nutsLevel: 3,
      nutsCodes: ['SI041'],
    },
    goriska: {
      countryCode: 'SI',
      country: 'Slovenia',
      classificationType: 'NUTS',
      officialName: 'Goriška',
      nativeName: 'Goriška regija',
      nutsVersion: '2024',
      nutsLevel: 3,
      nutsCodes: ['SI043'],
    },
    trondelag: {
      countryCode: 'NO',
      country: 'Norway',
      classificationType: 'Statistical Region',
      officialName: 'Trøndelag/Trööndelage',
      nativeName: 'Trøndelag',
      srVersion: '2024',
      srLevel: 3,
      srCodes: ['NO060'],
      nutsCodes: ['NO060'],
    },
    more_og_romsdal: {
      countryCode: 'NO',
      country: 'Norway',
      classificationType: 'Statistical Region',
      officialName: 'Møre og Romsdal',
      nativeName: 'Møre og Romsdal',
      srVersion: '2024',
      srLevel: 3,
      srCodes: ['NO0A3'],
      nutsCodes: ['NO0A3'],
    },
    buskerud: {
      countryCode: 'NO',
      country: 'Norway',
      classificationType: 'Statistical Region',
      officialName: 'Buskerud',
      nativeName: 'Buskerud',
      srVersion: '2024',
      srLevel: 3,
      srCodes: ['NO085'],
      nutsCodes: ['NO085'],
    },
    vestland: {
      countryCode: 'NO',
      country: 'Norway',
      classificationType: 'Statistical Region',
      officialName: 'Vestland',
      nativeName: 'Vestland',
      srVersion: '2024',
      srLevel: 3,
      srCodes: ['NO0A2'],
      nutsCodes: ['NO0A2'],
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
