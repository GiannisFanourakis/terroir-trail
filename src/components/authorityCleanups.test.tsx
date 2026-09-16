import { describe, expect, it, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ProducerRegistrationForm } from './Portal/ProducerRegistrationForm';
import { ChauffeurBookingModal } from './Monetization/ChauffeurBookingModal';
import { producerService } from '../services/producerService';
import { CRETAN_PRODUCERS } from '../data/producers';
import { DayTripLoop } from '../types/terroir';

// Mock Supabase module to control live DB state
const { mockSupabaseState } = vi.hoisted(() => {
  const mockSupabaseState = {
    isConfigured: true,
    queryResults: new Map<string, { data: any; error: any }>(),
    singleResults: new Map<string, { data: any; error: any }>(),
  };
  return { mockSupabaseState };
});

vi.mock('../services/supabase', () => ({
  get isSupabaseConfigured() {
    return mockSupabaseState.isConfigured;
  },
  get supabase() {
    if (!mockSupabaseState.isConfigured) return null;
    return {
      from: (table: string) => {
        const queryObj: any = {
          select: vi.fn(() => queryObj),
          eq: vi.fn(() => queryObj),
          gte: vi.fn(() => queryObj),
          lte: vi.fn(() => queryObj),
          or: vi.fn(() => queryObj),
          range: vi.fn(() => queryObj),
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
          then: (resolve: any, reject: any) => {
            const res = mockSupabaseState.queryResults.get(table) || { data: [], error: null };
            return Promise.resolve(res).then(resolve, reject);
          },
        };
        return queryObj;
      },
    };
  },
}));

// Mock Firebase service dependencies used in ProducerRegistrationForm
vi.mock('../services/firebase', () => ({
  isFirebaseConfigured: false,
  fetchProducerRegistrationFromCloud: vi.fn(async () => null),
  saveProducerRegistrationToCloud: vi.fn(async () => {}),
  SEEDED_PRODUCER_REGISTRATIONS: {},
}));

describe('Static-data Authority Leaks Cleanup', () => {
  beforeEach(() => {
    producerService.resetCacheForTesting();
    mockSupabaseState.isConfigured = true;
    mockSupabaseState.queryResults.clear();
    mockSupabaseState.singleResults.clear();
  });

  describe('ProducerRegistrationForm authority', () => {
    it('live authoritative empty producer catalogue does not cause ProducerRegistrationForm to repopulate from seed data', async () => {
      // 1. Simulate Supabase responding with an authoritative zero rows
      mockSupabaseState.queryResults.set('producers', { data: [], error: null });
      const liveProducers = await producerService.getProducers({ destination: 'all' });
      expect(liveProducers).toEqual([]);
      expect(producerService.getCacheProvenance()).toBe('live');
      expect(producerService.getCachedProducers()).toEqual([]);

      // 2. Render ProducerRegistrationForm without passing producersList (relies on producerService.getCachedProducers())
      let html = '';
      expect(() => {
        html = renderToString(React.createElement(ProducerRegistrationForm, {}));
      }).not.toThrow();

      // 3. Confirm empty directory message is rendered
      expect(html).toContain('No producer listings are currently available to claim.');

      // 4. Confirm bundled static seed producers are NOT resurrected in the rendered HTML
      for (const p of CRETAN_PRODUCERS.slice(0, 10)) {
        expect(html).not.toContain(`<option value="${p.id}"`);
        expect(html).not.toContain(`>${p.name} (`);
      }

      // 5. Also verify when passing an explicit empty producersList={[]} prop
      let htmlWithEmptyProp = '';
      expect(() => {
        htmlWithEmptyProp = renderToString(
          React.createElement(ProducerRegistrationForm, { producersList: [] })
        );
      }).not.toThrow();

      expect(htmlWithEmptyProp).toContain('No producer listings are currently available to claim.');
      expect(htmlWithEmptyProp).not.toContain('Domaine Paterianakis');
    });
  });

  describe('ChauffeurBookingModal authority', () => {
    it('missing live producer in chauffeur route does not resurrect static producer data', async () => {
      // 1. Establish live provenance where only a single distinct producer exists (e.g. 'custom-estate')
      mockSupabaseState.queryResults.set('producers', {
        data: [
          {
            id: 'live-winery-1',
            name: 'Live Verified Winery',
            greek_name: 'Ζωντανό Οινοποιείο',
            category: 'winery',
            destination: 'crete',
            region: 'Heraklion',
            village: 'Peza',
            description: 'Live test producer',
            coordinates: [35.2, 25.2],
            contact: {},
            features: {},
            tags: [],
            indigenous_varieties: [],
            price_tier: '€€',
          },
        ],
        error: null,
      });

      await producerService.getProducers({ destination: 'all' });
      expect(producerService.getCacheProvenance()).toBe('live');
      // Verify that 'domaine-paterianakis' (a bundled static producer) is NOT in live cache
      expect(producerService.getCachedProducer('domaine-paterianakis')).toBeUndefined();

      // 2. Create a circuit referencing 'domaine-paterianakis' as a stop producerId
      const testCircuit: DayTripLoop = {
        id: 'test-circuit-1',
        title: 'Peza & Archanes Route',
        greekTitle: 'Διαδρομή Πεζών',
        subtitle: 'Wine tasting day trip',
        destination: 'crete',
        region: 'Heraklion',
        totalDuration: '4 hours',
        drivingDistance: '35 km',
        stops: [
          {
            producerId: 'domaine-paterianakis',
            suggestedTime: '10:00 AM',
            activity: 'Estate Tasting',
          },
          {
            producerId: 'unknown-stop-producer',
            suggestedTime: '12:00 PM',
            activity: 'Vineyard Walk',
          },
        ],
        description: 'Circuit for testing live authority',
        highlightPointers: ['Ancient vines'],
      };

      // 3. Render ChauffeurBookingModal
      const html = renderToString(
        React.createElement(ChauffeurBookingModal, {
          isOpen: true,
          onClose: () => {},
          initialCircuit: testCircuit,
        })
      );

      // 4. Assert: missing live producer displays the stop's fallback identifier
      expect(html).toContain('domaine-paterianakis');
      expect(html).toContain('unknown-stop-producer');

      // 5. Assert: static seed data for Domaine Paterianakis (e.g., specific Greek name, village 'Melesses')
      // is NOT resurrected from CRETAN_PRODUCERS
      const bundledPaterianakis = CRETAN_PRODUCERS.find((p) => p.id === 'domaine-paterianakis')!;
      expect(html).not.toContain(bundledPaterianakis.name + ' (');
      expect(html).not.toContain(bundledPaterianakis.village + ', Heraklion');
    });
  });
});
