import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SUPPORTED_COUNTRY_CODES } from '../config/geography';
import {
  _resetCountryBoundariesCache,
  COUNTRY_BOUNDARY_ATTRIBUTION,
  loadCountryBoundary,
  NUTS_LEVEL_0_ID,
  NUTS_LEVEL_0_URL,
} from './countryBoundaries';

const createMockGeoJson = () => ({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { NUTS_ID: 'EL', CNTR_CODE: 'EL', NAME_LATN: 'Elláda' },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [23.7, 38.0],
              [23.8, 38.1],
              [23.7, 38.2],
              [23.7, 38.0],
            ],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { NUTS_ID: 'IT', CNTR_CODE: 'IT', NAME_LATN: 'Italia' },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [12.5, 41.9],
              [12.6, 42.0],
              [12.5, 42.1],
              [12.5, 41.9],
            ],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { NUTS_ID: 'FR', CNTR_CODE: 'FR', NAME_LATN: 'France' },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          // Metropolitan France polygon (inside lat 40..55, lng -10..15)
          [
            [
              [2.3, 48.8],
              [2.4, 48.9],
              [2.3, 49.0],
              [2.3, 48.8],
            ],
          ],
          // Corsica polygon (inside lat 40..55, lng -10..15)
          [
            [
              [9.1, 42.0],
              [9.2, 42.1],
              [9.1, 42.2],
              [9.1, 42.0],
            ],
          ],
          // French Guiana overseas territory (DOM) in South America (-52.6, 2.3)
          [
            [
              [-52.6, 2.3],
              [-52.5, 2.4],
              [-52.6, 2.5],
              [-52.6, 2.3],
            ],
          ],
          // Réunion overseas territory (DOM) in Indian Ocean (55.8, -21.3)
          [
            [
              [55.8, -21.3],
              [55.9, -21.2],
              [55.8, -21.1],
              [55.8, -21.3],
            ],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { NUTS_ID: 'ES', CNTR_CODE: 'ES', NAME_LATN: 'España' },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [-3.7, 40.4],
              [-3.6, 40.5],
              [-3.7, 40.6],
              [-3.7, 40.4],
            ],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { NUTS_ID: 'PT', CNTR_CODE: 'PT', NAME_LATN: 'Portugal' },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [-9.1, 38.7],
              [-9.0, 38.8],
              [-9.1, 38.9],
              [-9.1, 38.7],
            ],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { NUTS_ID: 'HR', CNTR_CODE: 'HR', NAME_LATN: 'Hrvatska' },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [15.9, 45.8],
              [16.0, 45.9],
              [15.9, 46.0],
              [15.9, 45.8],
            ],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { NUTS_ID: 'SI', CNTR_CODE: 'SI', NAME_LATN: 'Slovenija' },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [14.5, 46.0],
              [14.6, 46.1],
              [14.5, 46.2],
              [14.5, 46.0],
            ],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { NUTS_ID: 'NO', CNTR_CODE: 'NO', NAME_LATN: 'Norge' },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [10.7, 59.9],
              [10.8, 60.0],
              [10.7, 60.1],
              [10.7, 59.9],
            ],
          ],
        ],
      },
    },
  ],
});

describe('countryBoundaries data module', () => {
  beforeEach(() => {
    _resetCountryBoundariesCache();
    vi.restoreAllMocks();
  });

  it('configures official Eurostat GISCO NUTS 2024 Level 0 URL and attribution', () => {
    expect(NUTS_LEVEL_0_URL).toBe(
      'https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/NUTS_RG_10M_2024_4326_LEVL_0.geojson'
    );
    expect(COUNTRY_BOUNDARY_ATTRIBUTION).toContain('Eurostat / GISCO');
    expect(COUNTRY_BOUNDARY_ATTRIBUTION).toContain('NUTS 2024');
    expect(COUNTRY_BOUNDARY_ATTRIBUTION).toContain('10M');
    expect(COUNTRY_BOUNDARY_ATTRIBUTION).toContain('CC BY 4.0');
  });

  it('maps all 8 supported countries in NUTS_LEVEL_0_ID', () => {
    expect(Object.keys(NUTS_LEVEL_0_ID)).toHaveLength(8);
    expect(NUTS_LEVEL_0_ID.GR).toBe('EL');
    expect(NUTS_LEVEL_0_ID.IT).toBe('IT');
    expect(NUTS_LEVEL_0_ID.FR).toBe('FR');
    expect(NUTS_LEVEL_0_ID.ES).toBe('ES');
    expect(NUTS_LEVEL_0_ID.PT).toBe('PT');
    expect(NUTS_LEVEL_0_ID.HR).toBe('HR');
    expect(NUTS_LEVEL_0_ID.SI).toBe('SI');
    expect(NUTS_LEVEL_0_ID.NO).toBe('NO');
  });

  it('loads boundaries for each of the 8 supported countries', async () => {
    const mockData = createMockGeoJson();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });
    vi.stubGlobal('fetch', fetchMock);

    for (const code of SUPPORTED_COUNTRY_CODES) {
      const boundary = await loadCountryBoundary(code);
      expect(boundary).not.toBeNull();
      expect(boundary.geometry.type).toBe('MultiPolygon');
      expect(boundary.geometry.coordinates.length).toBeGreaterThan(0);
    }

    // Single fetch was cached across all calls
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(NUTS_LEVEL_0_URL);
  });

  it('sanitizes France boundaries by excluding distant DOMs and retaining European polygons', async () => {
    const mockData = createMockGeoJson();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      })
    );

    const boundary = await loadCountryBoundary('FR');
    expect(boundary).not.toBeNull();

    // Raw mock had 4 polygons (2 European, 2 overseas); filtered must have exactly 2
    expect(boundary.geometry.coordinates).toHaveLength(2);

    for (const polygon of boundary.geometry.coordinates) {
      const [firstLng, firstLat] = polygon[0][0];
      expect(firstLat).toBeGreaterThan(40);
      expect(firstLat).toBeLessThan(55);
      expect(firstLng).toBeGreaterThan(-10);
      expect(firstLng).toBeLessThan(15);
    }
  });

  it('resets cache on fetch error to allow retry on subsequent requests', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('GISCO network timeout'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => createMockGeoJson(),
      });
    vi.stubGlobal('fetch', fetchMock);

    await expect(loadCountryBoundary('GR')).rejects.toThrow(
      'GISCO network timeout'
    );

    // Subsequent call should retry and succeed
    const boundary = await loadCountryBoundary('GR');
    expect(boundary).not.toBeNull();
    expect(boundary.properties.NUTS_ID).toBe('EL');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('returns null when the country feature is missing from the dataset', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          type: 'FeatureCollection',
          features: [],
        }),
      })
    );

    const boundary = await loadCountryBoundary('GR');
    expect(boundary).toBeNull();
  });
});
