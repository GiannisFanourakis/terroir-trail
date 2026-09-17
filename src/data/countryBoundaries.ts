import type { SupportedCountryScope } from '../config/geography';
import { SUPPORTED_COUNTRIES } from '../config/geography';

export type { SupportedCountryScope };

// Use official Eurostat / GISCO 10M NUTS 2024 geometry (EPSG:4326) so coastlines
// and islands remain accurate for interactive country hover/selection while
// aligning with the regional NUTS 2024 dataset.
export const NUTS_LEVEL_0_URL =
  'https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/NUTS_RG_10M_2024_4326_LEVL_0.geojson';

export const NUTS_LEVEL_0_ID: Record<SupportedCountryScope, string> = {
  // Eurostat NUTS uses EL for Greece; ISO-2 for other European countries.
  GR: 'EL',
  IT: 'IT',
  FR: 'FR',
  ES: 'ES',
  PT: 'PT',
  HR: 'HR',
  SI: 'SI',
  NO: 'NO',
};

export const COUNTRY_BOUNDARY_ATTRIBUTION =
  '&copy; <a href="https://ec.europa.eu/eurostat/web/gisco" target="_blank" rel="noopener noreferrer">Eurostat / GISCO</a> (NUTS 2024, 10M, CC BY 4.0)';

let nutsLevel0Promise: Promise<any> | null = null;

export const _resetCountryBoundariesCache = (): void => {
  nutsLevel0Promise = null;
};

const loadNutsLevel0 = async (): Promise<any> => {
  if (typeof fetch !== 'function') return null;

  if (!nutsLevel0Promise) {
    nutsLevel0Promise = fetch(NUTS_LEVEL_0_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Unable to load NUTS 0 boundaries (${response.status})`
          );
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
 * Load the official NUTS 2024 level-0 feature for a supported country.
 * The full level-0 collection is fetched once and cached for the session.
 */
export const loadCountryBoundary = async (
  country: SupportedCountryScope
): Promise<any | null> => {
  const collection = await loadNutsLevel0();
  if (!collection?.features || !Array.isArray(collection.features)) return null;

  const nutsId =
    NUTS_LEVEL_0_ID[country] || SUPPORTED_COUNTRIES[country]?.giscoId;
  if (!nutsId) return null;

  const feature = collection.features.find((f: any) => {
    const properties = f?.properties || {};
    return properties.NUTS_ID === nutsId || properties.CNTR_CODE === nutsId;
  });

  if (!feature) return null;

  // For France, isolate European territory (Metropolitan France + Corsica + coastal islands)
  // to prevent distant overseas departments (DOMs in South America and Indian Ocean)
  // from distorting European navigation and map framing.
  if (country === 'FR' && feature.geometry?.coordinates) {
    const europeanPolygons = feature.geometry.coordinates.filter(
      (poly: any) => {
        const [lng, lat] = poly[0][0];
        return lat > 40 && lat < 55 && lng > -10 && lng < 15;
      }
    );
    return {
      ...feature,
      geometry: {
        ...feature.geometry,
        coordinates: europeanPolygons,
      },
    };
  }

  return feature;
};
