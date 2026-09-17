import { describe, expect, it } from 'vitest';
import { CRETE_TERROIR_REGION, TERROIR_REGIONS } from './terroirRegions';

describe('Interactive terroir region data', () => {
  it('uses Crete as the reference region', () => {
    expect(TERROIR_REGIONS).toHaveLength(1);
    expect(CRETE_TERROIR_REGION.id).toBe('crete');
    expect(CRETE_TERROIR_REGION.destination).toBe('crete');
    expect(CRETE_TERROIR_REGION.name).toBe('Crete');
  });

  it('stores valid closed multipolygon rings in GeoJSON longitude/latitude order with offshore islands', () => {
    expect(CRETE_TERROIR_REGION.geometry.type).toBe('MultiPolygon');
    // Must contain multiple polygons (mainland Crete + offshore islands such as Gavdos, Dia, Chrissi)
    expect(CRETE_TERROIR_REGION.geometry.coordinates.length).toBeGreaterThanOrEqual(2);

    let totalVertices = 0;
    let minLng = Infinity;
    let maxLng = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;

    for (const polygon of CRETE_TERROIR_REGION.geometry.coordinates) {
      expect(polygon.length).toBeGreaterThanOrEqual(1);
      for (const ring of polygon) {
        expect(ring.length).toBeGreaterThanOrEqual(4);
        // Rings must be closed
        expect(ring[0]).toEqual(ring[ring.length - 1]);

        for (const [lng, lat] of ring) {
          totalVertices++;
          expect(Number.isFinite(lng)).toBe(true);
          expect(Number.isFinite(lat)).toBe(true);

          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);

          // All points must fall within realistic geographic bounds of Crete region
          expect(lng).toBeGreaterThan(23);
          expect(lng).toBeLessThan(27);
          expect(lat).toBeGreaterThan(34);
          expect(lat).toBeLessThan(36);
        }
      }
    }

    // Mainland Crete polygon ring must have materially greater detail than old 45-point representation
    const mainRing = CRETE_TERROIR_REGION.geometry.coordinates[0][0];
    expect(mainRing.length).toBeGreaterThan(500);

    // Total vertex count reflects full regional coverage
    expect(totalVertices).toBeGreaterThan(700);

    // Crete bounding box verification (lon ~23.5 to ~26.3, lat ~34.8 to ~35.7)
    expect(minLng).toBeGreaterThanOrEqual(23.5);
    expect(maxLng).toBeLessThanOrEqual(26.4);
    expect(minLat).toBeGreaterThanOrEqual(34.8);
    expect(maxLat).toBeLessThanOrEqual(35.7);
  });

  it('contains the editorial sections needed by the Explore Crete drawer', () => {
    expect(CRETE_TERROIR_REGION.sections.map((section) => section.id)).toEqual([
      'landscape',
      'history',
      'culture',
      'food',
      'explore',
    ]);
    expect(CRETE_TERROIR_REGION.sections.every((section) => section.body.length > 80)).toBe(true);
  });

  it('keeps editorial and boundary provenance attached to the region', () => {
    expect(CRETE_TERROIR_REGION.summary.length).toBeGreaterThan(80);
    expect(CRETE_TERROIR_REGION.highlights.length).toBeGreaterThanOrEqual(3);
    expect(CRETE_TERROIR_REGION.sources.some((source) => source.url.includes('crete.gov.gr'))).toBe(true);
    expect(CRETE_TERROIR_REGION.sources.some((source) => source.url.includes('whc.unesco.org'))).toBe(true);
    expect(CRETE_TERROIR_REGION.sources.some((source) => source.url.includes('visitgreece.gr'))).toBe(true);
    // Boundary provenance must reference geoBoundaries
    expect(
      CRETE_TERROIR_REGION.sources.some(
        (source) => source.url.includes('geoboundaries.org') && source.label.includes('geoBoundaries')
      )
    ).toBe(true);
    // Obsolete eurostat source should no longer be present
    expect(CRETE_TERROIR_REGION.sources.some((source) => source.url.includes('eurostat'))).toBe(false);
  });
});
