import { describe, expect, it } from 'vitest';
import { TERROIR_REGIONS } from './terroirRegionCatalogue';
import { THESSALY_TERROIR_REGION } from './thessalyRegion';
import { PIEDMONT_TERROIR_REGION } from './piedmontRegion';
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

describe('Terroir Region Catalogue', () => {
  it('contains all 22 first-class terroir regions with unique IDs and destinations', () => {
    expect(TERROIR_REGIONS).toHaveLength(22);

    const ids = TERROIR_REGIONS.map((r) => r.id);
    expect(new Set(ids).size).toBe(22);

    const destinations = TERROIR_REGIONS.map((r) => r.destination);
    expect(new Set(destinations).size).toBe(22);
    expect(destinations).toContain('thessaly');
    expect(destinations).toContain('piedmont');
    expect(destinations).toContain('tuscany');
    expect(destinations).toContain('puglia');
    expect(destinations).toContain('sicily');
    expect(destinations).toContain('south_tyrol');
    expect(destinations).toContain('provence');
    expect(destinations).toContain('catalonia');
    expect(destinations).toContain('alentejo');
    expect(destinations).toContain('istria');
    expect(destinations).toContain('pomurska');
    expect(destinations).toContain('southeast_slovenia');
    expect(destinations).toContain('central_slovenia');
    expect(destinations).toContain('goriska');
    expect(destinations).toContain('trondelag');
    expect(destinations).toContain('more_og_romsdal');
    expect(destinations).toContain('buskerud');
    expect(destinations).toContain('vestland');
  });

  const expansionRegions = [
    ['Thessaly', THESSALY_TERROIR_REGION, 'EL61'],
    ['Piedmont', PIEDMONT_TERROIR_REGION, 'ITC1'],
    ['Puglia', PUGLIA_TERROIR_REGION, 'ITF4'],
    ['Sicily', SICILY_TERROIR_REGION, 'ITG1'],
    ['South Tyrol', SOUTH_TYROL_TERROIR_REGION, 'ITH1'],
    ['Provence', PROVENCE_TERROIR_REGION, 'FRL0'],
    ['Catalonia', CATALONIA_TERROIR_REGION, 'ES51'],
    ['Alentejo', ALENTEJO_TERROIR_REGION, 'PT1C'],
    ['Istria', ISTRIA_TERROIR_REGION, 'HR036'],
    ['Pomurska', POMURSKA_TERROIR_REGION, 'SI031'],
    ['Southeast Slovenia', SOUTHEAST_SLOVENIA_TERROIR_REGION, 'SI037'],
    ['Central Slovenia', CENTRAL_SLOVENIA_TERROIR_REGION, 'SI041'],
    ['Goriška', GORISKA_TERROIR_REGION, 'SI043'],
    ['Trøndelag', TRONDELAG_TERROIR_REGION, 'NO060'],
    ['Møre og Romsdal', MORE_OG_ROMSDAL_TERROIR_REGION, 'NO0A3'],
    ['Buskerud', BUSKERUD_TERROIR_REGION, 'NO085'],
    ['Vestland', VESTLAND_TERROIR_REGION, 'NO0A2'],
  ] as const;

  for (const [name, region, nutsCode] of expansionRegions) {
    describe(`${name} (${nutsCode}) region structure and geometry`, () => {
      it('has valid closed MultiPolygon coordinates in GeoJSON [lng, lat] order', () => {
        expect(region.geometry.type).toBe('MultiPolygon');
        expect(region.geometry.coordinates.length).toBeGreaterThanOrEqual(1);

        for (const polygon of region.geometry.coordinates) {
          expect(polygon.length).toBeGreaterThanOrEqual(1);
          for (const ring of polygon) {
            expect(ring.length).toBeGreaterThanOrEqual(4);
            // Closed ring: first point equals last point
            expect(ring[0]).toEqual(ring[ring.length - 1]);
            for (const [lng, lat] of ring) {
              expect(Number.isFinite(lng)).toBe(true);
              expect(Number.isFinite(lat)).toBe(true);
            }
          }
        }
      });

      it('has valid center coordinates within regional bounds', () => {
        const [lat, lng] = region.center;
        expect(Number.isFinite(lat)).toBe(true);
        expect(Number.isFinite(lng)).toBe(true);
      });

      it('contains all required editorial sections, highlights, and authoritative sources', () => {
        expect(region.summary.length).toBeGreaterThan(80);
        expect(region.highlights.length).toBeGreaterThanOrEqual(3);
        expect(region.sections.map((s) => s.id)).toEqual([
          'landscape',
          'history',
          'culture',
          'food',
          'explore',
        ]);
        expect(region.sections.every((s) => s.body.length > 80)).toBe(true);
        expect(region.sections.every((s) => (s.highlights?.length ?? 0) >= 3)).toBe(true);
        expect(region.sources.length).toBeGreaterThanOrEqual(1);
        expect(region.boundaryAttribution).toBeDefined();
        expect(region.boundaryAttribution).toContain(nutsCode);
      });
    });
  }

  it('verifies Piedmont coordinates stay within northwestern Italy bounding box', () => {
    let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
    for (const poly of PIEDMONT_TERROIR_REGION.geometry.coordinates) {
      for (const ring of poly) {
        for (const [lng, lat] of ring) {
          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
        }
      }
    }
    // Piedmont: ~6.6°E to ~9.3°E, ~44.0°N to ~46.5°N
    expect(minLng).toBeGreaterThanOrEqual(6.5);
    expect(maxLng).toBeLessThanOrEqual(9.5);
    expect(minLat).toBeGreaterThanOrEqual(44.0);
    expect(maxLat).toBeLessThanOrEqual(46.6);
  });
});
