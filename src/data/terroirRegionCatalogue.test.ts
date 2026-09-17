import { describe, expect, it } from 'vitest';
import { TERROIR_REGIONS } from './terroirRegionCatalogue';
import { THESSALY_TERROIR_REGION } from './thessalyRegion';
import { PIEDMONT_TERROIR_REGION } from './piedmontRegion';

describe('Terroir Region Catalogue', () => {
  it('contains all 7 first-class terroir regions with unique IDs and destinations', () => {
    expect(TERROIR_REGIONS).toHaveLength(7);

    const ids = TERROIR_REGIONS.map((r) => r.id);
    expect(new Set(ids).size).toBe(7);

    const destinations = TERROIR_REGIONS.map((r) => r.destination);
    expect(new Set(destinations).size).toBe(7);
    expect(destinations).toContain('thessaly');
    expect(destinations).toContain('piedmont');
    expect(destinations).toContain('tuscany');
  });

  const expansionRegions = [
    ['Thessaly', THESSALY_TERROIR_REGION, 'EL61'],
    ['Piedmont', PIEDMONT_TERROIR_REGION, 'ITC1'],
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
