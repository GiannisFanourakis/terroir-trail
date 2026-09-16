import { describe, expect, it } from 'vitest';
import { CRETE_TERROIR_REGION, TERROIR_REGIONS } from './terroirRegions';

describe('Interactive terroir region data', () => {
  it('uses Crete as the Phase 13 reference region', () => {
    expect(TERROIR_REGIONS).toHaveLength(1);
    expect(CRETE_TERROIR_REGION.id).toBe('crete');
    expect(CRETE_TERROIR_REGION.destination).toBe('crete');
    expect(CRETE_TERROIR_REGION.name).toBe('Crete');
  });

  it('stores a valid closed multipolygon ring in GeoJSON longitude/latitude order', () => {
    expect(CRETE_TERROIR_REGION.geometry.type).toBe('MultiPolygon');
    expect(CRETE_TERROIR_REGION.geometry.coordinates.length).toBeGreaterThan(0);

    const mainRing = CRETE_TERROIR_REGION.geometry.coordinates[0][0];
    expect(mainRing.length).toBeGreaterThan(20);
    expect(mainRing[0]).toEqual(mainRing[mainRing.length - 1]);

    const [lng, lat] = mainRing[0];
    expect(lng).toBeGreaterThan(23);
    expect(lng).toBeLessThan(27);
    expect(lat).toBeGreaterThan(34);
    expect(lat).toBeLessThan(36);
  });

  it('keeps editorial and boundary provenance attached to the region', () => {
    expect(CRETE_TERROIR_REGION.summary.length).toBeGreaterThan(80);
    expect(CRETE_TERROIR_REGION.highlights.length).toBeGreaterThanOrEqual(3);
    expect(CRETE_TERROIR_REGION.sources.some((source) => source.url.includes('crete.gov.gr'))).toBe(true);
    expect(CRETE_TERROIR_REGION.sources.some((source) => source.url.includes('eurostat'))).toBe(true);
  });
});
