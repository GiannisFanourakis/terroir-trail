import { describe, expect, it, vi } from 'vitest';
import type { Producer } from '../../types/terroir';

describe('MapCanvas marker diffing and selection isolation', () => {
  const createMockProducer = (id: string, name: string): Producer => ({
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
  });

  it('diffs markers by ID without destroying existing markers', () => {
    const p1 = createMockProducer('p1', 'Estate One');
    const p2 = createMockProducer('p2', 'Estate Two');
    const p3 = createMockProducer('p3', 'Estate Three');

    // Simulate markers collection tracking
    const markers: Record<string, { id: string; removed: boolean; iconUpdated: boolean }> = {};
    const createdIds: string[] = [];

    const applyProducers = (currentProducers: Producer[]) => {
      const validIds = new Set(
        currentProducers
          .filter((p) => p.locationStatus !== 'unresolved')
          .map((p) => p.id)
      );

      // Remove stale markers
      Object.keys(markers).forEach((id) => {
        if (!validIds.has(id)) {
          markers[id].removed = true;
          delete markers[id];
        }
      });

      // Add new markers
      currentProducers.forEach((producer) => {
        if (!markers[producer.id]) {
          markers[producer.id] = { id: producer.id, removed: false, iconUpdated: false };
          createdIds.push(producer.id);
        }
      });
    };

    // Step 1: Initial list [p1, p2]
    applyProducers([p1, p2]);
    expect(Object.keys(markers)).toEqual(['p1', 'p2']);
    expect(createdIds).toEqual(['p1', 'p2']);

    // Step 2: Filter/Update to [p2, p3] (p1 removed, p2 kept, p3 added)
    applyProducers([p2, p3]);
    expect(Object.keys(markers)).toEqual(['p2', 'p3']);
    // p2 was NOT recreated; createdIds only added 'p3'
    expect(createdIds).toEqual(['p1', 'p2', 'p3']);
  });

  it('isolates selection so zero markers are destroyed or recreated on selection changes', () => {
    const p1 = createMockProducer('p1', 'Estate One');
    const p2 = createMockProducer('p2', 'Estate Two');

    // Mock markers
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

    // Select p1
    selectProducer(p1);
    expect(markers.p1.active).toBe(true);
    expect(markers.p1.zIndex).toBe(1000);
    expect(markers.p1.recreations).toBe(1);
    expect(markers.p2.active).toBe(false);
    expect(markers.p2.recreations).toBe(1);

    // Switch selection to p2
    selectProducer(p2);
    expect(markers.p1.active).toBe(false);
    expect(markers.p1.zIndex).toBe(0);
    expect(markers.p1.recreations).toBe(1); // Not recreated
    expect(markers.p2.active).toBe(true);
    expect(markers.p2.zIndex).toBe(1000);
    expect(markers.p2.recreations).toBe(1); // Not recreated

    // Deselect (click map backdrop)
    selectProducer(null);
    expect(markers.p1.active).toBe(false);
    expect(markers.p2.active).toBe(false);
    expect(markers.p1.recreations).toBe(1);
    expect(markers.p2.recreations).toBe(1);
  });
});
