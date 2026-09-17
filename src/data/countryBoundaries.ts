import type { CountryScope } from '../config/geography';

export type SupportedCountryScope = Exclude<CountryScope, 'all'>;

const NUTS_LEVEL_0_URL =
  'https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/NUTS_RG_60M_2021_4326_LEVL_0.geojson';

const NUTS_LEVEL_0_ID: Record<SupportedCountryScope, string> = {
  // Eurostat NUTS uses EL for Greece and IT for Italy.
  GR: 'EL',
  IT: 'IT',
};

export const COUNTRY_BOUNDARY_ATTRIBUTION =
  '&copy; <a href="https://ec.europa.eu/eurostat/web/gisco" target="_blank" rel="noopener noreferrer">Eurostat / GISCO</a> (NUTS 2021, CC BY 4.0)';

let nutsLevel0Promise: Promise<any> | null = null;

const loadNutsLevel0 = async (): Promise<any> => {
  if (typeof fetch !== 'function') return null;

  if (!nutsLevel0Promise) {
    nutsLevel0Promise = fetch(NUTS_LEVEL_0_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to load NUTS 0 boundaries (${response.status})`);
        }
        return response.json();
      })
      .catch((error) => {
        // Allow a future retry after a temporary GISCO/network failure.
        nutsLevel0Promise = null;
        throw error;
      });
  }

  return nutsLevel0Promise;
};

/**
 * Load the official NUTS 2021 level-0 feature for a supported country.
 * The full level-0 collection is fetched once and cached for the session.
 */
export const loadCountryBoundary = async (
  country: SupportedCountryScope
): Promise<any | null> => {
  const collection = await loadNutsLevel0();
  if (!collection?.features || !Array.isArray(collection.features)) return null;

  const nutsId = NUTS_LEVEL_0_ID[country];
  return (
    collection.features.find((feature: any) => {
      const properties = feature?.properties || {};
      return properties.NUTS_ID === nutsId || properties.CNTR_CODE === nutsId;
    }) || null
  );
};
