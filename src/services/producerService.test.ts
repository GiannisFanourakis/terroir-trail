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
          neq: vi.fn(() => queryObj),
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

  describe('Producer Verification and Visitability Integrity', () => {
    it('maps all verification fields and retains explicit status values from database', async () => {
      const liveRow = {
        id: 'verified-producer-1',
        name: 'Alpha Organic Winery',
        category: 'winery',
        destination: 'crete',
        region: 'Chania',
        village: 'Vatolakki',
        lat: 35.45,
        lng: 23.95,
        location_status: 'verified_entrance',
        location_source_url: 'https://www.openstreetmap.org/node/12345',
        location_notes: 'Main gate on the east vineyard road',
        visit_status: 'public_visits',
        visit_source_url: 'https://alpha-winery.gr/visiting',
        visit_notes: 'Tasting room open Mon-Sat 10:00-18:00',
        google_maps_url: 'https://maps.google.com/?cid=987654',
      };

      mockSupabaseState.queryResults.set('producers', { data: [liveRow], error: null });

      const [producer] = await producerService.getProducers();

      expect(producer.locationStatus).toBe('verified_entrance');
      expect(producer.locationSourceUrl).toBe('https://www.openstreetmap.org/node/12345');
      expect(producer.locationNotes).toBe('Main gate on the east vineyard road');
      expect(producer.visitStatus).toBe('public_visits');
      expect(producer.visitSourceUrl).toBe('https://alpha-winery.gr/visiting');
      expect(producer.visitNotes).toBe('Tasting room open Mon-Sat 10:00-18:00');
      expect(producer.googleMapsUrl).toBe('https://maps.google.com/?cid=987654');
    });

    it('does not convert null/undefined DB values into fabricated defaults', async () => {
      const sparseRow = {
        id: 'sparse-producer-2',
        name: 'Sparse Heritage Distiller',
        category: 'distillery',
        destination: 'crete',
        region: 'Rethymno',
        village: 'Amari',
        lat: 35.25,
        lng: 24.65,
        road_access: null,
        food_option: null,
        price_level: null,
        rating: null,
        review_count: null,
        dog_friendly: null,
        kid_friendly: null,
        campervan_friendly: null,
        walk_in_friendly: null,
        location_status: 'verified_location',
        visit_status: 'appointment_only',
        google_maps_url: null,
      };

      mockSupabaseState.queryResults.set('producers', { data: [sparseRow], error: null });

      const [producer] = await producerService.getProducers();

      // Explicitly check that fabricated defaults were NOT applied
      expect(producer.roadAccess).toBeUndefined();
      expect(producer.foodOption).toBeUndefined();
      expect(producer.priceLevel).toBeUndefined();
      expect(producer.rating).toBeUndefined();
      expect(producer.reviewCount).toBeUndefined();
      expect(producer.dogFriendly).toBeUndefined();
      expect(producer.kidFriendly).toBeUndefined();
      expect(producer.campervanFriendly).toBeUndefined();
      expect(producer.walkInFriendly).toBeUndefined();

      // Does NOT synthesize a Google Maps URL when google_maps_url is null
      expect(producer.googleMapsUrl).toBeUndefined();
    });

    it('suppresses Google Maps URL and bounds inclusion when location_status is unresolved', async () => {
      const unresolvedRow = {
        id: 'unresolved-producer-3',
        name: 'Unresolved Mountain Apiary',
        category: 'wild_honey',
        destination: 'crete',
        region: 'Chania',
        village: 'Omalos',
        lat: 35.33,
        lng: 23.90,
        location_status: 'unresolved',
        google_maps_url: 'https://maps.google.com/?q=35.33,23.90',
        visit_status: 'not_publicly_confirmed',
      };

      mockSupabaseState.queryResults.set('producers', { data: [unresolvedRow], error: null });

      const [producer] = await producerService.getProducers();

      expect(producer.locationStatus).toBe('unresolved');
      // Must NOT expose a Google Maps URL for unresolved locations even if URL or coordinates exist
      expect(producer.googleMapsUrl).toBeUndefined();
    });
  });

  describe('Phase 5 — Offline / Fallback Data Synchronization Integrity', () => {
    it('bundled CRETAN_PRODUCERS contains exactly 27 audited Crete records with no synthetic material', () => {
      expect(CRETAN_PRODUCERS).toHaveLength(27);

      // Verify all are Crete
      expect(CRETAN_PRODUCERS.every((p) => p.destination === 'crete')).toBe(true);

      // Verify NO synthetic ratings or review counts exist
      expect(CRETAN_PRODUCERS.every((p) => p.rating === undefined)).toBe(true);
      expect(CRETAN_PRODUCERS.every((p) => p.reviewCount === undefined)).toBe(true);

      // Verify NO synthetic price levels or food options exist
      expect(CRETAN_PRODUCERS.every((p) => p.priceLevel === undefined)).toBe(true);
      expect(CRETAN_PRODUCERS.every((p) => p.foodOption === undefined)).toBe(true);

      // Verify NO synthetic road access claims exist
      expect(CRETAN_PRODUCERS.every((p) => p.roadAccess === undefined)).toBe(true);

      // Verify NO synthetic tasting packages exist
      expect(CRETAN_PRODUCERS.every((p) => !p.tastingHighlights || p.tastingHighlights.length === 0)).toBe(true);

      // Verify location and visit status are defined on every producer
      expect(CRETAN_PRODUCERS.every((p) => p.locationStatus !== undefined)).toBe(true);
      expect(CRETAN_PRODUCERS.every((p) => p.visitStatus !== undefined)).toBe(true);
    });

    it('verifies critical live corrections in fallback data', () => {
      const lafkas = CRETAN_PRODUCERS.find((p) => p.id === 'lafkas-brewery');
      expect(lafkas).toBeDefined();
      expect(lafkas?.coordinates).toEqual([35.494636, 23.986088]);
      expect(lafkas?.locationStatus).toBe('verified_location');
      expect(lafkas?.visitStatus).toBe('appointment_only');

      const wildHerbs = CRETAN_PRODUCERS.find((p) => p.id === 'wild-herbs-kallikratis');
      expect(wildHerbs).toBeDefined();
      expect(wildHerbs?.coordinates).toEqual([35.2378367, 24.2565003]);
      expect(wildHerbs?.locationStatus).toBe('verified_location');
      expect(wildHerbs?.visitStatus).toBe('seasonal_public');

      const aerakis = CRETAN_PRODUCERS.find((p) => p.id === 'aerakis-dairy-anogeia');
      expect(aerakis).toBeDefined();
      expect(aerakis?.coordinates).toEqual([35.065803, 25.106932]);
      expect(aerakis?.locationStatus).toBe('verified_location');
      expect(aerakis?.visitStatus).toBe('not_publicly_confirmed');
      expect(aerakis?.village).toBe('Sokaras (Gortyna)');

      const tzourmpakis = CRETAN_PRODUCERS.find((p) => p.id === 'tzourmpakis-dairy-amari');
      expect(tzourmpakis).toBeDefined();
      expect(tzourmpakis?.coordinates).toEqual([35.2211278, 24.4979202]);
      expect(tzourmpakis?.locationStatus).toBe('verified_location');
      expect(tzourmpakis?.visitStatus).toBe('current_access_uncertain');
      expect(tzourmpakis?.village).toBe('Mixorrouma (Agios Vasileios)');

      const stilianou = CRETAN_PRODUCERS.find((p) => p.id === 'kazani-stilianou');
      expect(stilianou).toBeDefined();
      expect(stilianou?.name).toBe('Stilianou Winery');
      expect(stilianou?.greekName).toBe('Οινοποιείο Στυλιανού');
      expect(stilianou?.category).toBe('winery');

      const spiridi = CRETAN_PRODUCERS.find((p) => p.id === 'cretan-olive-oil-farm');
      expect(spiridi).toBeDefined();
      expect(spiridi?.name).toBe('Spiridi Olive Oil Farm');

      const paraschakis = CRETAN_PRODUCERS.find((p) => p.id === 'parasiris-olive-mill');
      expect(paraschakis).toBeDefined();
      expect(paraschakis?.name).toBe('Paraschakis Family Olive Oil Factory');
      expect(paraschakis?.phone).toBe('+30 28340 22039');

      const zacharioudakis = CRETAN_PRODUCERS.find((p) => p.id === 'zacharioudakis-winery');
      expect(zacharioudakis).toBeDefined();
      expect(zacharioudakis?.visitStatus).toBe('seasonal_public');

      const toplou = CRETAN_PRODUCERS.find((p) => p.id === 'toplou-monastery-winery');
      expect(toplou).toBeDefined();
      expect(toplou?.visitStatus).toBe('public_visits');

      const peskesi = CRETAN_PRODUCERS.find((p) => p.id === 'peskesi-farm-kazani');
      expect(peskesi).toBeDefined();
      expect(peskesi?.name).toBe('Peskesi Organic Farm');
      expect(peskesi?.greekName).toBe('Αγρόκτημα Πεσκέσι');
      expect(peskesi?.category).toBe('kazani');
    });

    it('offline / fallback path provides complete verified catalogue without resurrecting synthetic data', async () => {
      // Simulate offline / unconfigured Supabase
      mockSupabaseState.isConfigured = false;

      const producers = await producerService.getProducers();
      expect(producers).toHaveLength(27);
      expect(producerService.getCacheProvenance()).toBe('fallback');

      // Verify no synthetic ratings or reviews returned
      expect(producers.every((p) => p.rating === undefined)).toBe(true);
      expect(producers.every((p) => p.reviewCount === undefined)).toBe(true);

      // Verify single producer fetch
      const single = await producerService.getProducerById('lafkas-brewery');
      expect(single).not.toBeNull();
      expect(single?.name).toBe('Lafkas Brewery');
      expect(single?.visitStatus).toBe('appointment_only');
    });
  });
});


