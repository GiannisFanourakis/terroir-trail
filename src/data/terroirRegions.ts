import type { Destination } from '../types/terroir';

export interface TerroirRegionSource {
  label: string;
  url: string;
}

export interface TerroirRegion {
  id: string;
  name: string;
  destination: Destination;
  eyebrow: string;
  summary: string;
  highlights: string[];
  center: [number, number];
  /** GeoJSON geometry coordinates use [longitude, latitude]. */
  geometry: {
    type: 'MultiPolygon';
    coordinates: number[][][][];
  };
  sources: TerroirRegionSource[];
}

/**
 * Phase 13 reference region.
 *
 * Boundary geometry is the simplified 1:10 Greece regional geometry derived
 * from Eurostat/GISCO by the public `dimitris1ps/Geojson` dataset. Keeping the
 * geometry local makes the map deterministic and avoids a runtime GIS request.
 * Editorial claims are intentionally concise and sourced from the Region of
 * Crete's own regional/geographic and agricultural-sector material.
 */
export const CRETE_TERROIR_REGION: TerroirRegion = {
  id: 'crete',
  name: 'Crete',
  destination: 'crete',
  eyebrow: 'Island terroir · Greece',
  summary:
    'High mountain massifs, plateaus, valleys and a long coastline shape sharply varied landscapes across Crete. Olive oil, vineyards and wine, dairy, honey and other crops remain important parts of the island’s agricultural identity.',
  highlights: [
    'Mountain massifs & plateaus',
    'Olive groves & vineyards',
    'Dairy, honey & regional produce',
  ],
  center: [35.2401, 24.8093],
  geometry: {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [24.31741, 35.35377],
          [24.54771, 35.37621],
          [24.68662, 35.42387],
          [24.928, 35.40691],
          [25.00325, 35.42006],
          [25.07314, 35.34276],
          [25.36684, 35.33605],
          [25.4907, 35.29833],
          [25.64031, 35.3402],
          [25.73225, 35.33158],
          [25.74853, 35.27197],
          [25.72646, 35.15785],
          [25.79069, 35.12174],
          [26.05063, 35.2261],
          [26.12118, 35.21183],
          [26.1586, 35.20427],
          [26.24539, 35.26551],
          [26.2918, 35.19507],
          [26.25885, 35.08675],
          [26.16803, 35.01394],
          [26.12118, 35.01788],
          [25.94516, 35.03266],
          [25.55057, 34.99076],
          [24.76755, 34.92741],
          [24.72252, 35.09254],
          [24.56836, 35.1043],
          [24.38125, 35.19042],
          [24.28752, 35.17601],
          [23.84374, 35.24054],
          [23.67453, 35.24348],
          [23.60572, 35.24468],
          [23.54334, 35.29425],
          [23.5409, 35.3745],
          [23.58522, 35.53901],
          [23.67453, 35.52788],
          [23.69521, 35.5253],
          [23.74133, 35.66262],
          [23.85225, 35.535],
          [23.98803, 35.52252],
          [24.08985, 35.57921],
          [24.14517, 35.57942],
          [24.17313, 35.53633],
          [24.14477, 35.48545],
          [24.22869, 35.4557],
          [24.31741, 35.35377],
        ],
      ],
      [
        [
          [24.11839, 34.85153],
          [24.10968, 34.81738],
          [24.07261, 34.82483],
          [24.04278, 34.85371],
          [24.07261, 34.87158],
          [24.11839, 34.85153],
        ],
      ],
      [
        [
          [26.1995, 35.3568],
          [26.19418, 35.30395],
          [26.14429, 35.33051],
          [26.16993, 35.36549],
          [26.1995, 35.3568],
        ],
      ],
      [
        [
          [25.2529, 35.4542],
          [25.24779, 35.41806],
          [25.18837, 35.44706],
          [25.21144, 35.47656],
          [25.2529, 35.4542],
        ],
      ],
    ],
  },
  sources: [
    {
      label: 'Region of Crete — regional geography',
      url: 'https://www.crete.gov.gr/perifereia/',
    },
    {
      label: 'Region of Crete — agricultural priorities',
      url: 'https://www.crete.gov.gr/dimosia-diavoyleysi-gia-ti-nea-koini-agrotiki-politiki-kap-2028-2034-stin-perifereia-kritis/',
    },
    {
      label: 'Eurostat/GISCO regional boundary source',
      url: 'https://ec.europa.eu/eurostat/web/gisco/geodata/reference-data/administrative-units-statistical-units/nuts',
    },
  ],
};

export const TERROIR_REGIONS: TerroirRegion[] = [CRETE_TERROIR_REGION];
