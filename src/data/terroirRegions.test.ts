import { describe, expect, it } from 'vitest';
import {
  CRETE_TERROIR_REGION,
  SANTORINI_TERROIR_REGION,
  PELOPONNESE_TERROIR_REGION,
  MACEDONIA_TERROIR_REGION,
  TUSCANY_TERROIR_REGION,
  TERROIR_REGIONS,
  TerroirRegion,
} from './terroirRegions';

describe('Interactive terroir region data', () => {
  it('defines all 5 active destinations in TERROIR_REGIONS', () => {
    expect(TERROIR_REGIONS).toHaveLength(5);
    const ids = TERROIR_REGIONS.map((r) => r.id);
    expect(new Set(ids).size).toBe(5);

    const destinations = TERROIR_REGIONS.map((r) => r.destination);
    expect(destinations).toEqual([
      'crete',
      'santorini',
      'peloponnese',
      'northern_greece',
      'tuscany',
    ]);

    // User-facing name for northern_greece destination must be 'Macedonia, Greece'
    const macedoniaRegion = TERROIR_REGIONS.find((r) => r.destination === 'northern_greece');
    expect(macedoniaRegion).toBeDefined();
    expect(macedoniaRegion?.name).toBe('Macedonia, Greece');
    expect(macedoniaRegion?.id).toBe('macedonia-greece');
  });

  const regions: [string, TerroirRegion][] = [
    ['Crete', CRETE_TERROIR_REGION],
    ['Santorini', SANTORINI_TERROIR_REGION],
    ['Peloponnese', PELOPONNESE_TERROIR_REGION],
    ['Macedonia, Greece', MACEDONIA_TERROIR_REGION],
    ['Tuscany', TUSCANY_TERROIR_REGION],
  ];

  for (const [name, region] of regions) {
    describe(`${name} region geometry and metadata`, () => {
      it('stores valid closed MultiPolygon coordinates in GeoJSON [lng, lat] order', () => {
        expect(region.geometry.type).toBe('MultiPolygon');
        expect(region.geometry.coordinates.length).toBeGreaterThanOrEqual(1);

        for (const polygon of region.geometry.coordinates) {
          expect(polygon.length).toBeGreaterThanOrEqual(1);
          for (const ring of polygon) {
            expect(ring.length).toBeGreaterThanOrEqual(4);
            // Closed ring
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

      it('contains all required editorial sections and metadata', () => {
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
        expect(region.sources.length).toBeGreaterThanOrEqual(3);
        expect(region.boundaryAttribution).toBeDefined();
        expect(region.boundaryAttribution).toContain('CC BY 4.0');
      });
    });
  }

  it('verifies Crete bounding box and provenance', () => {
    let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
    for (const poly of CRETE_TERROIR_REGION.geometry.coordinates) {
      for (const ring of poly) {
        for (const [lng, lat] of ring) {
          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
        }
      }
    }
    expect(minLng).toBeGreaterThanOrEqual(23.5);
    expect(maxLng).toBeLessThanOrEqual(26.4);
    expect(minLat).toBeGreaterThanOrEqual(34.8);
    expect(maxLat).toBeLessThanOrEqual(35.7);
    expect(CRETE_TERROIR_REGION.boundaryAttribution).toContain('geoBoundaries');
  });

  it('verifies Santorini is isolated to the Thira island cluster and excludes outer Cyclades', () => {
    let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
    for (const poly of SANTORINI_TERROIR_REGION.geometry.coordinates) {
      for (const ring of poly) {
        for (const [lng, lat] of ring) {
          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
        }
      }
    }
    // Municipality of Thira cluster bounds (~25.33 to ~25.49 lon, ~36.33 to ~36.47 lat for main island, Christiana ~36.25 / 25.2)
    expect(minLng).toBeGreaterThanOrEqual(25.1);
    expect(maxLng).toBeLessThanOrEqual(25.6);
    expect(minLat).toBeGreaterThanOrEqual(36.2);
    expect(maxLat).toBeLessThanOrEqual(36.6);

    // Must not include Naxos / Paros (lat > 36.8) or Anafi (lng > 25.7) or Ios (lat > 36.65)
    expect(maxLat).toBeLessThan(36.7);
    expect(maxLng).toBeLessThan(25.6);
    expect(SANTORINI_TERROIR_REGION.boundaryAttribution).toContain('Eurostat / GISCO');
  });

  it('verifies Peloponnese spans west and east peninsula while excluding mainland Central Greece', () => {
    let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
    for (const poly of PELOPONNESE_TERROIR_REGION.geometry.coordinates) {
      for (const ring of poly) {
        for (const [lng, lat] of ring) {
          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
        }
      }
    }
    // Peloponnese peninsular bounds (~21.1 to ~23.5 lon, ~36.3 to ~38.35 lat)
    expect(minLng).toBeGreaterThanOrEqual(21.0);
    expect(maxLng).toBeLessThanOrEqual(23.6);
    expect(minLat).toBeGreaterThanOrEqual(36.3);
    expect(maxLat).toBeLessThanOrEqual(38.4);

    // Spans west coast (Kyllini/Messinia < 21.6) and east coast (Argolis/Monemvasia > 23.0)
    expect(minLng).toBeLessThan(21.3);
    expect(maxLng).toBeGreaterThan(23.2);
    // Excludes Central Greece mainland north of Gulf of Corinth (lat > 38.4)
    expect(maxLat).toBeLessThan(38.4);
    expect(PELOPONNESE_TERROIR_REGION.boundaryAttribution).toContain('Eurostat / GISCO');
  });

  it('verifies Macedonia spans Western, Central, and Eastern Macedonia while excluding Thrace', () => {
    let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
    for (const poly of MACEDONIA_TERROIR_REGION.geometry.coordinates) {
      for (const ring of poly) {
        for (const [lng, lat] of ring) {
          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
        }
      }
    }
    // Macedonia bounds: Kastoria/Florina in west (~20.7 lon) to Kavala/Thasos in east (~24.8 lon), lat ~39.8 to ~41.5
    expect(minLng).toBeGreaterThanOrEqual(20.7);
    expect(maxLng).toBeLessThanOrEqual(24.85);
    expect(minLat).toBeGreaterThanOrEqual(39.8);
    expect(maxLat).toBeLessThanOrEqual(41.6);

    // Reaches Western Macedonia (lng < 21.2) and Eastern Macedonia (lng > 24.3)
    expect(minLng).toBeLessThan(21.0);
    expect(maxLng).toBeGreaterThan(24.5);
    // Excludes Thrace (Xanthi/Rodopi/Evros with lng > 24.85)
    expect(maxLng).toBeLessThan(24.85);
    expect(MACEDONIA_TERROIR_REGION.boundaryAttribution).toContain('Eurostat / GISCO');
    expect(MACEDONIA_TERROIR_REGION.boundaryAttribution).toContain('geoBoundaries');
  });

  it('verifies Tuscany encompasses mainland Tuscany and Tuscan archipelago', () => {
    let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
    for (const poly of TUSCANY_TERROIR_REGION.geometry.coordinates) {
      for (const ring of poly) {
        for (const [lng, lat] of ring) {
          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
        }
      }
    }
    // Tuscany bounds (~9.7 to ~12.4 lon, ~42.2 to ~44.5 lat)
    expect(minLng).toBeGreaterThanOrEqual(9.6);
    expect(maxLng).toBeLessThanOrEqual(12.5);
    expect(minLat).toBeGreaterThanOrEqual(42.2);
    expect(maxLat).toBeLessThanOrEqual(44.5);
    expect(TUSCANY_TERROIR_REGION.boundaryAttribution).toContain('geoBoundaries');
  });
});
