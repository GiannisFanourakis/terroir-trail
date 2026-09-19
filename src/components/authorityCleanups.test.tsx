import { describe, expect, it, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ProducerRegistrationForm } from './Portal/ProducerRegistrationForm';
import { ChauffeurBookingModal } from './Monetization/ChauffeurBookingModal';
import { producerService } from '../services/producerService';
import { CRETAN_PRODUCERS } from '../data/producers';
import { Producer } from '../types/terroir';

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
    it('renders initialProducer destination accurately when passed', () => {
      const testProducer = {
        id: 'domaine-paterianakis',
        name: 'Domaine Paterianakis',
        destination: 'crete',
        region: 'Heraklion',
        village: 'Melesses',
        category: 'winery',
        coordinates: [35.2, 25.1] as [number, number],
        description: 'Test producer',
      } as unknown as Producer;

      const html = renderToString(
        React.createElement(ChauffeurBookingModal, {
          isOpen: true,
          onClose: () => {},
          initialProducer: testProducer,
        })
      );

      expect(html).toContain('Target Destination for Your Driver');
      expect(html).toContain('Domaine Paterianakis');
      expect(html).toContain('Estate Visit');
      expect(html).toContain('Melesses');
      expect(html).toContain('Heraklion');
    });
  });
});
