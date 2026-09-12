import { describe, expect, it, vi, beforeEach } from 'vitest';
import { producerService } from './producerService';
import { CRETAN_PRODUCERS } from '../data/producers';
import { ALL_EXPERIENCES } from '../data/experiences';

// Mock Supabase module
const { mockSupabaseState } = vi.hoisted(() => {
  const mockSupabaseState = {
    isConfigured: true,
    queryResults: new Map<string, { data: any; error: any }>(),
    singleResults: new Map<string, { data: any; error: any }>(),
  };
  return { mockSupabaseState };
});

vi.mock('./supabase', () => ({
  get isSupabaseConfigured() {
    return mockSupabaseState.isConfigured;
  },
  get supabase() {
    if (!mockSupabaseState.isConfigured) return null;
    return {
      from: (table: string) => {
        let currentFilterId: string | null = null;

        const queryObj: any = {
          select: vi.fn(() => queryObj),
          eq: vi.fn((col: string, val: any) => {
            if (col === 'id' || col === 'producer_id') {
              currentFilterId = String(val);
            }
            return queryObj;
          }),
          gte: vi.fn(() => queryObj),
          lte: vi.fn(() => queryObj),
          or: vi.fn(() => queryObj),
          range: vi.fn(() => queryObj),
          single: vi.fn(() => {
            const key = currentFilterId ? `${table}:${currentFilterId}` : table;
            const res = mockSupabaseState.singleResults.get(key) || mockSupabaseState.queryResults.get(table) || { data: null, error: null };
            return Promise.resolve(res);
          }),
          maybeSingle: vi.fn(() => {
            const key = currentFilterId ? `${table}:${currentFilterId}` : table;
            const res = mockSupabaseState.singleResults.get(key) || mockSupabaseState.queryResults.get(table) || { data: null, error: null };
            return Promise.resolve(res);
          }),
          then: (resolve: any, reject: any) => {
            const key = currentFilterId ? `${table}:${currentFilterId}` : table;
            const res = mockSupabaseState.queryResults.get(key) || mockSupabaseState.queryResults.get(table) || { data: [], error: null };
            return Promise.resolve(res).then(resolve, reject);
          },
        };
        return queryObj;
      },
    };
  },
}));

describe('producerService — Supabase / Fallback Data Ownership', () => {
  beforeEach(() => {
    producerService.resetCacheForTesting();
    mockSupabaseState.isConfigured = true;
    mockSupabaseState.queryResults.clear();
    mockSupabaseState.singleResults.clear();
  });

  it('Supabase successful response replaces seed catalogue', async () => {
    const liveRows = [
      {
        id: 'live-winery-1',
        name: 'Live Remote Winery Alpha',
        category: 'winery',
        destination: 'crete',
        region: 'Chania',
        village: 'Vatolakki',
        lat: 35.45,
        lng: 23.95,
        cover_image: 'https://example.com/alpha.jpg',
      },
      {
        id: 'live-brewery-2',
        name: 'Live Remote Brewery Beta',
        category: 'brewery',
        destination: 'crete',
        region: 'Chania',
        village: 'Zounaki',
        lat: 35.48,
        lng: 23.88,
        cover_image: 'https://example.com/beta.jpg',
      },
    ];

    mockSupabaseState.queryResults.set('producers', { data: liveRows, error: null });

    const producers = await producerService.getProducers();

    expect(producers).toHaveLength(2);
    expect(producers.map((p) => p.id)).toEqual(['live-winery-1', 'live-brewery-2']);
    expect(producerService.getCachedProducers()).toHaveLength(2);
    expect(producerService.getCacheProvenance()).toBe('live');

    // Bundled seed catalogue should be completely replaced, not merged
    expect(producerService.getCachedProducer('domaine-paterianakis')).toBeUndefined();
  });

  it('Supabase successful empty response returns empty (zero rows means zero rows)', async () => {
    mockSupabaseState.queryResults.set('producers', { data: [], error: null });

    const producers = await producerService.getProducers();

    expect(producers).toEqual([]);
    expect(producerService.getCachedProducers()).toEqual([]);
    expect(producerService.getCacheProvenance()).toBe('live');

    // Must NOT fall back to static seed data when Supabase successfully returned empty array
    expect(producers).not.toHaveLength(CRETAN_PRODUCERS.length);
  });

  it('Supabase request failure falls back to static seed', async () => {
    mockSupabaseState.queryResults.set('producers', {
      data: null,
      error: new Error('PostgreSQL connection timeout: 504 Gateway Timeout'),
    });

    const producers = await producerService.getProducers();

    expect(producers.length).toBe(CRETAN_PRODUCERS.length);
    expect(producers[0].id).toBe(CRETAN_PRODUCERS[0].id);
    expect(producerService.getCacheProvenance()).toBe('fallback');
  });

  it('Updated Supabase producer wins over stale bundled producer with same ID', async () => {
    const bundledPaterianakis = CRETAN_PRODUCERS.find((p) => p.id === 'domaine-paterianakis');
    expect(bundledPaterianakis).toBeDefined();

    const updatedRow = {
      id: 'domaine-paterianakis',
      name: 'Domaine Paterianakis (Updated Grand Bio Vintage)',
      category: 'winery',
      destination: 'crete',
      region: 'Heraklion',
      village: 'Melesses',
      lat: 35.195,
      lng: 25.188,
      cover_image: 'https://example.com/updated.jpg',
      rating: 4.98,
      review_count: 142,
    };

    mockSupabaseState.queryResults.set('producers', { data: [updatedRow], error: null });
    mockSupabaseState.singleResults.set('producers:domaine-paterianakis', { data: updatedRow, error: null });

    const producers = await producerService.getProducers();
    expect(producers).toHaveLength(1);
    expect(producers[0].name).toBe('Domaine Paterianakis (Updated Grand Bio Vintage)');
    expect(producers[0].reviewCount).toBe(142);

    // Direct by-id lookup must also return the updated live record
    const single = await producerService.getProducerById('domaine-paterianakis');
    expect(single).not.toBeNull();
    expect(single?.name).toBe('Domaine Paterianakis (Updated Grand Bio Vintage)');
  });

  it('A bundled-only producer does not remain visible after successful live catalogue reconciliation', async () => {
    // solo-craft-brewery is present in bundled data
    const bundledSolo = CRETAN_PRODUCERS.find((p) => p.id === 'solo-craft-brewery');
    expect(bundledSolo).toBeDefined();

    // Live catalogue returns only a different producer
    const liveRows = [
      {
        id: 'cretan-brewery-charma',
        name: 'Cretan Brewery Charma',
        category: 'brewery',
        destination: 'crete',
        region: 'Chania',
        village: 'Zounaki',
        lat: 35.48,
        lng: 23.88,
      },
    ];

    mockSupabaseState.queryResults.set('producers', { data: liveRows, error: null });
    mockSupabaseState.singleResults.set('producers:solo-craft-brewery', { data: null, error: null });

    // Reconcile live catalogue
    const producers = await producerService.getProducers();
    expect(producers.map((p) => p.id)).toEqual(['cretan-brewery-charma']);

    // Bundled-only producer must NOT remain in cache
    expect(producerService.getCachedProducer('solo-craft-brewery')).toBeUndefined();
    expect(producerService.getCachedProducers().some((p) => p.id === 'solo-craft-brewery')).toBe(false);

    // By-id lookup queries Supabase, receives null, and does NOT fall back to bundled data
    const byId = await producerService.getProducerById('solo-craft-brewery');
    expect(byId).toBeNull();
  });

  describe('Experiences Data Ownership', () => {
    it('live: Supabase successful experiences response is authoritative', async () => {
      const mockExperiences = [
        {
          id: 'live-exp-1',
          producer_id: 'live-winery-1',
          title: 'Biodynamic Amphora Tasting',
          duration_minutes: 75,
          price_per_person: 28.5,
          category: 'winery',
          destination: 'crete',
          is_active: true,
        },
      ];

      mockSupabaseState.queryResults.set('experiences', { data: mockExperiences, error: null });

      const exps = await producerService.getExperiences();
      expect(exps).toHaveLength(1);
      expect(exps[0].id).toBe('live-exp-1');
      expect(exps[0].title).toBe('Biodynamic Amphora Tasting');
      expect(exps[0].pricePerPerson).toBe(28.5);
      expect(producerService.getExperienceProvenance()).toBe('live');
    });

    it('empty-live: Supabase successful zero rows returns empty array', async () => {
      mockSupabaseState.queryResults.set('experiences', { data: [], error: null });

      const exps = await producerService.getExperiences('some-producer');
      expect(exps).toEqual([]);
      // Must NOT fall back to ALL_EXPERIENCES
      expect(exps).not.toEqual(ALL_EXPERIENCES);
    });

    it('failed-live: Supabase request failure falls back to ALL_EXPERIENCES', async () => {
      mockSupabaseState.queryResults.set('experiences', {
        data: null,
        error: new Error('Database unreachable'),
      });

      const exps = await producerService.getExperiences();
      expect(exps).toHaveLength(ALL_EXPERIENCES.length);
      expect(exps[0].id).toBe(ALL_EXPERIENCES[0].id);
    });
  });
});
