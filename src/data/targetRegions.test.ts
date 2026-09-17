import { describe, expect, it } from 'vitest';
import { AUDITED_PRODUCERS } from './auditedProducers';
import { TERROIR_REGIONS } from './terroirRegionCatalogue';
import { TERROIR_REGION_STORIES } from './terroirRegionStories';
import { DESTINATION_GEOGRAPHY } from '../config/geography';
import type { Destination } from '../types/terroir';
import { PUGLIA_TERROIR_REGION } from './regions/pugliaRegion';
import { SICILY_TERROIR_REGION } from './regions/sicilyRegion';
import { SOUTH_TYROL_TERROIR_REGION } from './regions/southTyrolRegion';
import { PROVENCE_TERROIR_REGION } from './regions/provenceRegion';
import { CATALONIA_TERROIR_REGION } from './regions/cataloniaRegion';
import { ALENTEJO_TERROIR_REGION } from './regions/alentejoRegion';
import { ISTRIA_TERROIR_REGION } from './regions/istriaRegion';
import { POMURSKA_TERROIR_REGION } from './regions/pomurskaRegion';
import { SOUTHEAST_SLOVENIA_TERROIR_REGION } from './regions/southeastSloveniaRegion';
import { CENTRAL_SLOVENIA_TERROIR_REGION } from './regions/centralSloveniaRegion';
import { GORISKA_TERROIR_REGION } from './regions/goriskaRegion';
import { TRONDELAG_TERROIR_REGION } from './regions/trondelagRegion';
import { MORE_OG_ROMSDAL_TERROIR_REGION } from './regions/moreOgRomsdalRegion';
import { BUSKERUD_TERROIR_REGION } from './regions/buskerudRegion';
import { VESTLAND_TERROIR_REGION } from './regions/vestlandRegion';

describe('Target 15 Regional Foundation', () => {
  it('strictly preserves the audited producer count at exactly 62 (zero new producers)', () => {
    expect(AUDITED_PRODUCERS).toHaveLength(62);
  });

  it('aggregates exactly 22 first-class terroir regions in the catalogue', () => {
    expect(TERROIR_REGIONS).toHaveLength(22);
    const destinationSet = new Set(TERROIR_REGIONS.map((r) => r.destination));
    expect(destinationSet.size).toBe(22);
  });

  const targetRegions = [
    {
      name: 'Puglia',
      region: PUGLIA_TERROIR_REGION,
      destination: 'puglia' as Destination,
      country: 'IT',
      countryName: 'Italy',
      nutsCode: 'ITF4',
      nutsLevel: 2,
      geographyType: 'NUTS',
      bbox: { minLng: 14.8, maxLng: 18.6, minLat: 39.7, maxLat: 42.1 },
    },
    {
      name: 'Sicily',
      region: SICILY_TERROIR_REGION,
      destination: 'sicily' as Destination,
      country: 'IT',
      countryName: 'Italy',
      nutsCode: 'ITG1',
      nutsLevel: 2,
      geographyType: 'NUTS',
      bbox: { minLng: 11.8, maxLng: 15.7, minLat: 35.4, maxLat: 38.9 },
    },
    {
      name: 'South Tyrol',
      region: SOUTH_TYROL_TERROIR_REGION,
      destination: 'south_tyrol' as Destination,
      country: 'IT',
      countryName: 'Italy',
      nutsCode: 'ITH1',
      nutsLevel: 2,
      geographyType: 'NUTS',
      bbox: { minLng: 10.3, maxLng: 12.5, minLat: 46.2, maxLat: 47.1 },
    },
    {
      name: 'Provence-Alpes-Côte d\'Azur',
      region: PROVENCE_TERROIR_REGION,
      destination: 'provence' as Destination,
      country: 'FR',
      countryName: 'France',
      nutsCode: 'FRL0',
      nutsLevel: 2,
      geographyType: 'NUTS',
      bbox: { minLng: 4.2, maxLng: 7.8, minLat: 42.9, maxLat: 45.2 },
    },
    {
      name: 'Catalonia',
      region: CATALONIA_TERROIR_REGION,
      destination: 'catalonia' as Destination,
      country: 'ES',
      countryName: 'Spain',
      nutsCode: 'ES51',
      nutsLevel: 2,
      geographyType: 'NUTS',
      bbox: { minLng: 0.15, maxLng: 3.4, minLat: 40.5, maxLat: 42.9 },
    },
    {
      name: 'Alentejo',
      region: ALENTEJO_TERROIR_REGION,
      destination: 'alentejo' as Destination,
      country: 'PT',
      countryName: 'Portugal',
      nutsCode: 'PT1C',
      nutsLevel: 2,
      geographyType: 'NUTS',
      bbox: { minLng: -9.1, maxLng: -6.8, minLat: 37.3, maxLat: 39.7 },
    },
    {
      name: 'Istria',
      region: ISTRIA_TERROIR_REGION,
      destination: 'istria' as Destination,
      country: 'HR',
      countryName: 'Croatia',
      nutsCode: 'HR036',
      nutsLevel: 3,
      geographyType: 'NUTS',
      bbox: { minLng: 13.4, maxLng: 14.3, minLat: 44.7, maxLat: 45.6 },
    },
    {
      name: 'Pomurska',
      region: POMURSKA_TERROIR_REGION,
      destination: 'pomurska' as Destination,
      country: 'SI',
      countryName: 'Slovenia',
      nutsCode: 'SI031',
      nutsLevel: 3,
      geographyType: 'NUTS',
      bbox: { minLng: 15.7, maxLng: 16.6, minLat: 46.4, maxLat: 46.9 },
    },
    {
      name: 'Southeast Slovenia',
      region: SOUTHEAST_SLOVENIA_TERROIR_REGION,
      destination: 'southeast_slovenia' as Destination,
      country: 'SI',
      countryName: 'Slovenia',
      nutsCode: 'SI037',
      nutsLevel: 3,
      geographyType: 'NUTS',
      bbox: { minLng: 14.5, maxLng: 15.6, minLat: 45.4, maxLat: 46.1 },
    },
    {
      name: 'Central Slovenia',
      region: CENTRAL_SLOVENIA_TERROIR_REGION,
      destination: 'central_slovenia' as Destination,
      country: 'SI',
      countryName: 'Slovenia',
      nutsCode: 'SI041',
      nutsLevel: 3,
      geographyType: 'NUTS',
      bbox: { minLng: 14.1, maxLng: 15.0, minLat: 45.7, maxLat: 46.4 },
    },
    {
      name: 'Goriška',
      region: GORISKA_TERROIR_REGION,
      destination: 'goriska' as Destination,
      country: 'SI',
      countryName: 'Slovenia',
      nutsCode: 'SI043',
      nutsLevel: 3,
      geographyType: 'NUTS',
      bbox: { minLng: 13.3, maxLng: 14.2, minLat: 45.7, maxLat: 46.5 },
    },
    {
      name: 'Trøndelag',
      region: TRONDELAG_TERROIR_REGION,
      destination: 'trondelag' as Destination,
      country: 'NO',
      countryName: 'Norway',
      nutsCode: 'NO060',
      nutsLevel: 3,
      geographyType: 'Statistical Region',
      bbox: { minLng: 8.0, maxLng: 14.5, minLat: 62.2, maxLat: 65.4 },
    },
    {
      name: 'Møre og Romsdal',
      region: MORE_OG_ROMSDAL_TERROIR_REGION,
      destination: 'more_og_romsdal' as Destination,
      country: 'NO',
      countryName: 'Norway',
      nutsCode: 'NO0A3',
      nutsLevel: 3,
      geographyType: 'Statistical Region',
      bbox: { minLng: 5.0, maxLng: 9.5, minLat: 61.9, maxLat: 63.6 },
    },
    {
      name: 'Buskerud',
      region: BUSKERUD_TERROIR_REGION,
      destination: 'buskerud' as Destination,
      country: 'NO',
      countryName: 'Norway',
      nutsCode: 'NO085',
      nutsLevel: 3,
      geographyType: 'Statistical Region',
      bbox: { minLng: 7.4, maxLng: 10.7, minLat: 59.4, maxLat: 61.2 },
    },
    {
      name: 'Vestland',
      region: VESTLAND_TERROIR_REGION,
      destination: 'vestland' as Destination,
      country: 'NO',
      countryName: 'Norway',
      nutsCode: 'NO0A2',
      nutsLevel: 3,
      geographyType: 'Statistical Region',
      bbox: { minLng: 4.3, maxLng: 8.5, minLat: 59.4, maxLat: 62.4 },
    },
  ] as const;

  for (const target of targetRegions) {
    describe(`${target.name} (${target.nutsCode}) Foundation`, () => {
      it('has valid metadata, country code, and statistical classification', () => {
        const { region } = target;
        expect(region.destination).toBe(target.destination);
        expect(region.countryCode).toBe(target.country);
        expect(region.nutsCode).toBe(target.nutsCode);
        expect(region.nutsLevel).toBe(target.nutsLevel);
        expect(region.geographyType).toBe(target.geographyType);
        expect(region.classificationVersion).toBe('2024');
      });

      it('has valid GeoJSON MultiPolygon coordinates with closed linear rings', () => {
        const { region, bbox } = target;
        expect(region.geometry.type).toBe('MultiPolygon');
        expect(region.geometry.coordinates.length).toBeGreaterThanOrEqual(1);

        let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;

        for (const polygon of region.geometry.coordinates) {
          expect(polygon.length).toBeGreaterThanOrEqual(1);
          for (const ring of polygon) {
            expect(ring.length).toBeGreaterThanOrEqual(4);
            // Linear ring closure: first point equals last point
            expect(ring[0]).toEqual(ring[ring.length - 1]);
            for (const [lng, lat] of ring) {
              expect(Number.isFinite(lng)).toBe(true);
              expect(Number.isFinite(lat)).toBe(true);
              minLng = Math.min(minLng, lng);
              maxLng = Math.max(maxLng, lng);
              minLat = Math.min(minLat, lat);
              maxLat = Math.max(maxLat, lat);
            }
          }
        }

        // Bounding box assertion
        expect(minLng).toBeGreaterThanOrEqual(bbox.minLng);
        expect(maxLng).toBeLessThanOrEqual(bbox.maxLng);
        expect(minLat).toBeGreaterThanOrEqual(bbox.minLat);
        expect(maxLat).toBeLessThanOrEqual(bbox.maxLat);
      });

      it('has a calibrated center coordinate within the region bounding box', () => {
        const { region, bbox } = target;
        const [lat, lng] = region.center;
        expect(Number.isFinite(lat)).toBe(true);
        expect(Number.isFinite(lng)).toBe(true);
        expect(lng).toBeGreaterThanOrEqual(bbox.minLng);
        expect(lng).toBeLessThanOrEqual(bbox.maxLng);
        expect(lat).toBeGreaterThanOrEqual(bbox.minLat);
        expect(lat).toBeLessThanOrEqual(bbox.maxLat);
      });

      it('provides institutional source attribution and Eurostat/GISCO provenance', () => {
        const { region } = target;
        expect(region.sources.length).toBeGreaterThanOrEqual(1);
        for (const source of region.sources) {
          expect(source.url).toMatch(/^https:\/\//);
          expect(source.label.length).toBeGreaterThan(3);
        }
        expect(region.boundaryAttribution).toBeDefined();
        expect(region.boundaryAttribution).toContain(target.nutsCode);
      });

      it('features a full 5-section editorial story with highlights', () => {
        const { destination } = target;
        const story = TERROIR_REGION_STORIES[destination];
        expect(story).toBeDefined();
        expect(story.summary.length).toBeGreaterThan(80);
        expect(story.highlights.length).toBeGreaterThanOrEqual(3);
        expect(story.sections.map((s) => s.id)).toEqual([
          'landscape',
          'history',
          'culture',
          'food',
          'explore',
        ]);
        for (const section of story.sections) {
          expect(section.title.length).toBeGreaterThan(4);
          expect(section.body.length).toBeGreaterThan(80);
          expect(section.highlights?.length ?? 0).toBeGreaterThanOrEqual(3);
        }
      });

      it('matches centralized DESTINATION_GEOGRAPHY configuration', () => {
        const geo = DESTINATION_GEOGRAPHY[target.destination];
        expect(geo).toBeDefined();
        expect(geo.countryCode).toBe(target.country);
        expect(geo.country).toBe(target.countryName);
        expect(geo.nutsCodes).toEqual([target.nutsCode]);
      });
    });
  }
});
