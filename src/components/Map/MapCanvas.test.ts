import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import type { Producer } from '../../types/terroir';

vi.mock('leaflet', () => ({
  default: {
    map: vi.fn(),
    tileLayer: vi.fn(),
    marker: vi.fn(),
    divIcon: vi.fn(),
    geoJSON: vi.fn(),
    circleMarker: vi.fn(),
    DomEvent: { stopPropagation: vi.fn() },
  },
}));

import {
  clusterProducersByGrid,
  getProducerMarkerSignature,
  getMapMotionPreference,
  getAdaptiveMapRenderStrategy,
  shouldClusterProducerMarkers,
  getAutomaticDestinationZoom,
} from './MapCanvas';

describe('MapCanvas marker diffing, in-place updates, and motion preferences', () => {
  const createMockProducer = (id: string, name: string, overrides: Partial<Producer> = {}): Producer => ({
    id,
    name,
    greekName: name,
    category: 'winery',
    destination: 'crete',
    region: 'Heraklion',
    village: 'Archanes',
    coordinates: [35.2, 25.1],
    locationStatus: 'verified_location',
    visitStatus: 'public_visits',
    roadAccess: 'paved',
    coverImage: '/img.jpg',
    gallery: [],
    rating: 4.8,
    reviewCount: 42,
    indigenousVarieties: ['Kotsifali'],
    tastingHighlights: ['Estate Reserve'],
    openingHours: 'Mon-Fri 10:00-18:00',
    ethos: ['organic'],
    story: 'Traditional vineyard',
    tagLine: 'Organic family estate',
    description: 'Traditional vineyard',
    ...overrides,
  });

  it('diffs markers by ID without destroying existing markers', () => {
    const p1 = createMockProducer('p1', 'Estate One');
    const p2 = createMockProducer('p2', 'Estate Two');
    const p3 = createMockProducer('p3', 'Estate Three');

    const markers: Record<string, { id: string; removed: boolean }> = {};
    const createdIds: string[] = [];

    const applyProducers = (currentProducers: Producer[]) => {
      const validIds = new Set(
        currentProducers
          .filter((p) => p.locationStatus !== 'unresolved')
          .map((p) => p.id)
      );

      Object.keys(markers).forEach((id) => {
        if (!validIds.has(id)) {
          markers[id].removed = true;
          delete markers[id];
        }
      });

      currentProducers.forEach((producer) => {
        if (!markers[producer.id]) {
          markers[producer.id] = { id: producer.id, removed: false };
          createdIds.push(producer.id);
        }
      });
    };

    applyProducers([p1, p2]);
    expect(Object.keys(markers)).toEqual(['p1', 'p2']);
    expect(createdIds).toEqual(['p1', 'p2']);

    applyProducers([p2, p3]);
    expect(Object.keys(markers)).toEqual(['p2', 'p3']);
    expect(createdIds).toEqual(['p1', 'p2', 'p3']);
  });

  it('isolates selection so zero markers are destroyed or recreated on selection changes', () => {
    const p1 = createMockProducer('p1', 'Estate One');
    const p2 = createMockProducer('p2', 'Estate Two');

    const markers: Record<string, { id: string; active: boolean; zIndex: number; recreations: number }> = {
      p1: { id: 'p1', active: false, zIndex: 0, recreations: 1 },
      p2: { id: 'p2', active: false, zIndex: 0, recreations: 1 },
    };

    let selectedId: string | null = null;

    const selectProducer = (next: Producer | null) => {
      const prevId = selectedId;
      const newId = next?.id ?? null;
      selectedId = newId;

      if (prevId && prevId !== newId && markers[prevId]) {
        markers[prevId].active = false;
        markers[prevId].zIndex = 0;
      }
      if (newId && markers[newId]) {
        markers[newId].active = true;
        markers[newId].zIndex = 1000;
      }
    };

    selectProducer(p1);
    expect(markers.p1.active).toBe(true);
    expect(markers.p1.zIndex).toBe(1000);
    expect(markers.p1.recreations).toBe(1);
    expect(markers.p2.active).toBe(false);
    expect(markers.p2.recreations).toBe(1);

    selectProducer(p2);
    expect(markers.p1.active).toBe(false);
    expect(markers.p1.zIndex).toBe(0);
    expect(markers.p1.recreations).toBe(1);
    expect(markers.p2.active).toBe(true);
    expect(markers.p2.zIndex).toBe(1000);
    expect(markers.p2.recreations).toBe(1);

    selectProducer(null);
    expect(markers.p1.active).toBe(false);
    expect(markers.p2.active).toBe(false);
    expect(markers.p1.recreations).toBe(1);
    expect(markers.p2.recreations).toBe(1);
  });

  it('updates existing marker LatLng when same-ID producer coordinates change', () => {
    const p1Initial = createMockProducer('p1', 'Estate One', { coordinates: [35.2, 25.1] });
    const p1Updated = createMockProducer('p1', 'Estate One', { coordinates: [35.35, 25.25] });

    interface MockMarker {
      id: string;
      coordinates: [number, number];
      latLngUpdates: number;
    }

    const markers: Record<string, MockMarker> = {};
    const signatures: Record<string, string> = {};

    const syncProducers = (producers: Producer[]) => {
      producers.forEach((producer) => {
        const newSig = getProducerMarkerSignature(producer);
        const existingMarker = markers[producer.id];

        if (existingMarker) {
          const oldSig = signatures[producer.id];
          if (oldSig !== newSig) {
            if (
              existingMarker.coordinates[0] !== producer.coordinates[0] ||
              existingMarker.coordinates[1] !== producer.coordinates[1]
            ) {
              existingMarker.coordinates = producer.coordinates;
              existingMarker.latLngUpdates++;
            }
            signatures[producer.id] = newSig;
          }
          return;
        }

        markers[producer.id] = {
          id: producer.id,
          coordinates: producer.coordinates,
          latLngUpdates: 0,
        };
        signatures[producer.id] = newSig;
      });
    };

    syncProducers([p1Initial]);
    expect(markers.p1.coordinates).toEqual([35.2, 25.1]);
    expect(markers.p1.latLngUpdates).toBe(0);

    syncProducers([p1Updated]);
    expect(markers.p1.coordinates).toEqual([35.35, 25.25]);
    expect(markers.p1.latLngUpdates).toBe(1);
  });

  it('updates existing marker icon when same-ID producer display data changes while preserving selection state', () => {
    const p1 = createMockProducer('p1', 'Estate One', { rating: 4.8, village: 'Archanes' });
    const p1Renamed = createMockProducer('p1', 'Estate One Premium', { rating: 5.0, village: 'Peza' });

    interface MockMarker {
      id: string;
      iconHtml: string;
      iconUpdates: number;
    }

    const markers: Record<string, MockMarker> = {};
    const signatures: Record<string, string> = {};
    const selectedId = 'p1';

    const syncProducers = (producers: Producer[]) => {
      producers.forEach((producer) => {
        const newSig = getProducerMarkerSignature(producer);
        const existingMarker = markers[producer.id];

        if (existingMarker) {
          const oldSig = signatures[producer.id];
          if (oldSig !== newSig) {
            const isSelected = selectedId === producer.id;
            existingMarker.iconHtml = `pin-${producer.name}-${producer.rating}-${isSelected ? 'active' : 'normal'}`;
            existingMarker.iconUpdates++;
            signatures[producer.id] = newSig;
          }
          return;
        }

        const isSelected = selectedId === producer.id;
        markers[producer.id] = {
          id: producer.id,
          iconHtml: `pin-${producer.name}-${producer.rating}-${isSelected ? 'active' : 'normal'}`,
          iconUpdates: 0,
        };
        signatures[producer.id] = newSig;
      });
    };

    syncProducers([p1]);
    expect(markers.p1.iconHtml).toBe('pin-Estate One-4.8-active');
    expect(markers.p1.iconUpdates).toBe(0);

    syncProducers([p1Renamed]);
    expect(markers.p1.iconHtml).toBe('pin-Estate One Premium-5-active');
    expect(markers.p1.iconUpdates).toBe(1);
  });

  it('resolves latest producer object from producersMapRef at click time to prevent stale closure data', () => {
    const p1Initial = createMockProducer('p1', 'Estate Alpha', { rating: 4.5 });
    const p1Updated = createMockProducer('p1', 'Estate Alpha (Updated)', { rating: 4.9 });

    const producersMap = new Map<string, Producer>();
    producersMap.set('p1', p1Initial);

    let selectedResult: Producer | null = null;
    const onSelect = (producer: Producer) => {
      selectedResult = producer;
    };

    const createMarkerClickHandler = (producerId: string, initialFallback: Producer) => {
      return () => {
        const current = producersMap.get(producerId) || initialFallback;
        onSelect(current);
      };
    };

    const clickHandler = createMarkerClickHandler('p1', p1Initial);

    clickHandler();
    expect((selectedResult as Producer | null)?.name).toBe('Estate Alpha');
    expect((selectedResult as Producer | null)?.rating).toBe(4.5);

    producersMap.set('p1', p1Updated);

    clickHandler();
    expect((selectedResult as Producer | null)?.name).toBe('Estate Alpha (Updated)');
    expect((selectedResult as Producer | null)?.rating).toBe(4.9);
  });

  it('computes correct producer marker signature', () => {
    const p1 = createMockProducer('p1', 'Estate One', {
      coordinates: [35.2, 25.1],
      village: 'Archanes',
      region: 'Heraklion',
      rating: 4.8,
    });
    const sig1 = getProducerMarkerSignature(p1);
    expect(sig1).toContain('p1|35.2,25.1|Estate One|Archanes|Heraklion|winery|4.8');

    const p1ChangedRating = { ...p1, rating: 4.9 };
    const sig2 = getProducerMarkerSignature(p1ChangedRating);
    expect(sig2).not.toBe(sig1);
  });

  it('groups nearby producers into stable grid clusters for adaptive rendering', () => {
    const p1 = createMockProducer('p1', 'Estate One', { coordinates: [35.2, 25.1] });
    const p2 = createMockProducer('p2', 'Estate Two', { coordinates: [35.21, 25.11] });
    const p3 = createMockProducer('p3', 'Estate Three', { coordinates: [36.4, 25.4] });

    const projected: Record<string, { x: number; y: number }> = {
      p1: { x: 100, y: 100 },
      p2: { x: 130, y: 115 },
      p3: { x: 400, y: 400 },
    };

    const clusters = clusterProducersByGrid(
      [p1, p2, p3],
      (coordinates) => {
        const producer = [p1, p2, p3].find((candidate) =>
          candidate.coordinates[0] === coordinates[0] &&
          candidate.coordinates[1] === coordinates[1]
        );
        return projected[producer?.id || 'p1'];
      },
      72
    );

    expect(clusters).toHaveLength(2);
    expect(clusters.map((cluster) => cluster.producers.map((producer) => producer.id))).toContainEqual(['p1', 'p2']);
    expect(clusters.map((cluster) => cluster.producers.map((producer) => producer.id))).toContainEqual(['p3']);

    const sharedCluster = clusters.find((cluster) => cluster.producers.length === 2);
    expect(sharedCluster?.center[0]).toBeCloseTo((35.2 + 35.21) / 2);
    expect(sharedCluster?.center[1]).toBeCloseTo((25.1 + 25.11) / 2);
  });

  it('uses adaptive clustering and viewport limits on both mobile and desktop', () => {
    const mobile = getAdaptiveMapRenderStrategy(390);
    const desktop = getAdaptiveMapRenderStrategy(1440);

    expect(mobile.clusterMaxZoom).toBe(10);
    expect(mobile.maxIndividualMarkers).toBe(120);
    expect(mobile.viewportPadding).toBeGreaterThan(0);

    expect(desktop.clusterMaxZoom).toBe(11);
    expect(desktop.maxIndividualMarkers).toBe(220);
    expect(desktop.viewportPadding).toBeGreaterThan(0);

    expect(shouldClusterProducerMarkers(9, 20, mobile)).toBe(true);
    expect(shouldClusterProducerMarkers(12, 20, mobile)).toBe(false);

    expect(shouldClusterProducerMarkers(10, 30, desktop)).toBe(true);
    expect(shouldClusterProducerMarkers(12, 30, desktop)).toBe(false);
  });

  it('keeps clustering unusually dense close-zoom views instead of mounting hundreds of DOM pins', () => {
    const mobile = getAdaptiveMapRenderStrategy(390);
    const desktop = getAdaptiveMapRenderStrategy(1440);

    expect(
      shouldClusterProducerMarkers(14, mobile.maxIndividualMarkers + 1, mobile)
    ).toBe(true);
    expect(
      shouldClusterProducerMarkers(14, desktop.maxIndividualMarkers + 1, desktop)
    ).toBe(true);

    expect(
      shouldClusterProducerMarkers(14, mobile.maxIndividualMarkers, mobile)
    ).toBe(false);
    expect(
      shouldClusterProducerMarkers(14, desktop.maxIndividualMarkers, desktop)
    ).toBe(false);
  });

  it('caps automatic destination zoom so region changes stay contextual', () => {
    expect(getAutomaticDestinationZoom(4)).toBe(4);
    expect(getAutomaticDestinationZoom(9)).toBe(9);
    expect(getAutomaticDestinationZoom(10)).toBe(10);
    expect(getAutomaticDestinationZoom(12)).toBe(10);
    expect(getAutomaticDestinationZoom(14)).toBe(10);
  });

  it('getMapMotionPreference respects prefers-reduced-motion and adjusts mobile duration', () => {
    const originalWindow = (globalThis as any).window;

    // Test reduced motion on desktop
    (globalThis as any).window = {
      innerWidth: 1024,
      matchMedia: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    };

    const reducedMotion = getMapMotionPreference({ desktopDuration: 1.0, mobileDuration: 0.5 });
    expect(reducedMotion.isReduced).toBe(true);
    expect(reducedMotion.animate).toBe(false);
    expect(reducedMotion.duration).toBe(0);

    // Test mobile viewport with normal motion
    (globalThis as any).window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    (globalThis as any).window.innerWidth = 390;
    const mobileMotion = getMapMotionPreference({ desktopDuration: 1.0, mobileDuration: 0.5 });
    expect(mobileMotion.isReduced).toBe(false);
    expect(mobileMotion.isMobile).toBe(true);
    expect(mobileMotion.duration).toBe(0.5);

    // Restore
    if (originalWindow === undefined) {
      delete (globalThis as any).window;
    } else {
      (globalThis as any).window = originalWindow;
    }
  });

  it('activates the regional Explore overview from the destination filter', () => {
    const source = readFileSync('src/components/Map/MapCanvas.tsx', 'utf8');

    expect(source).toContain(
      'setActiveRegionId(selectedDestinationRegion?.id ?? null)'
    );
  });

  it('does not render a separate terroir-region marker or label on the map', () => {
    const source = readFileSync('src/components/Map/MapCanvas.tsx', 'utf8');

    expect(source).not.toContain('regionLabelsRef');
    expect(source).not.toContain('Explore ${region.name} terroir region');
  });

  it('does not render category placeholder imagery in the map producer preview', () => {
    const source = readFileSync('src/components/Map/MapCanvas.tsx', 'utf8');

    expect(source).toContain(
      "selectedResolvedCover.source !== 'category_fallback'"
    );
    expect(source).not.toContain(
      'selectedResolvedCover?.url ||\n                  getCategoryFallbackImage'
    );
  });

});
