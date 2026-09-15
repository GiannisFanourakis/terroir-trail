import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getGoogleMapsApiKey,
  loadGooglePlacesUiKit,
  _resetGooglePlacesUiKitStateForTesting,
} from './googlePlacesUiKit';
import {
  isGooglePlacesEligible,
  getGooglePlacesPrototypeEntry,
  GOOGLE_PLACES_PROTOTYPE_ALLOWLIST,
  GOOGLE_PLACES_PROTOTYPE_ITEMS,
} from '../config/googlePlacesAllowlist';
import { CRETAN_PRODUCERS } from '../data/producers';
import { SANTORINI_PRODUCERS } from '../data/santoriniProducers';

const AUDITED_REGIONAL_PRODUCERS = [
  ...CRETAN_PRODUCERS,
  ...SANTORINI_PRODUCERS,
];

describe('Google Places UI Kit & Allowlist', () => {
  beforeEach(() => {
    _resetGooglePlacesUiKitStateForTesting();
    vi.resetModules();
  });

  afterEach(() => {
    _resetGooglePlacesUiKitStateForTesting();
  });

  describe('Allowlist Verification', () => {
    it('covers all audited Crete and Santorini producers across supported categories', () => {
      expect(CRETAN_PRODUCERS).toHaveLength(27);
      expect(SANTORINI_PRODUCERS).toHaveLength(9);
      expect(GOOGLE_PLACES_PROTOTYPE_ITEMS).toHaveLength(36);
      expect(GOOGLE_PLACES_PROTOTYPE_ALLOWLIST).toHaveLength(36);

      const eligibleCategories = new Set(
        GOOGLE_PLACES_PROTOTYPE_ITEMS.map((item) => item.category)
      );

      const catalogueCategories = new Set(
        AUDITED_REGIONAL_PRODUCERS.map((producer) => producer.category)
      );

      expect([...eligibleCategories].sort()).toEqual(
        [...catalogueCategories].sort()
      );
    });

    it('identifies allowlisted producers correctly', () => {
      expect(isGooglePlacesEligible('lyrarakis-winery')).toBe(true);
      expect(isGooglePlacesEligible('peskesi-farm-kazani')).toBe(true);
      expect(isGooglePlacesEligible('cretan-brewery-charma')).toBe(true);
      expect(isGooglePlacesEligible('biolea-estate')).toBe(true);
      expect(isGooglePlacesEligible('stathakis-honey-park')).toBe(true);
      expect(isGooglePlacesEligible('domaine-sigalas-santorini')).toBe(true);
      expect(isGooglePlacesEligible('santorini-brewing-company')).toBe(true);
    });

    it('rejects unlisted producers', () => {
      expect(isGooglePlacesEligible('unknown-winery')).toBe(false);
      expect(isGooglePlacesEligible('random-producer-id')).toBe(false);
      expect(isGooglePlacesEligible('')).toBe(false);
    });

    it('retrieves config with current audited catalogue coordinates', () => {
      const config = getGooglePlacesPrototypeEntry('lyrarakis-winery');
      const producer = CRETAN_PRODUCERS.find(
        (p) => p.id === 'lyrarakis-winery'
      );

      expect(producer).toBeDefined();
      expect(config).toBeDefined();
      expect(config?.producerId).toBe('lyrarakis-winery');
      expect(config?.coordinates).toEqual(producer?.coordinates);
    });
  });

  describe('UI Kit Loader with Missing Key', () => {
    it('returns undefined from getGoogleMapsApiKey when env var is not set or empty', () => {
      const originalKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY = '';
      try {
        expect(getGoogleMapsApiKey()).toBeUndefined();
      } finally {
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY = originalKey;
      }
    });

    it('returns unavailable when API key is missing', async () => {
      const originalKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY = '';

      try {
        const status = await loadGooglePlacesUiKit();
        expect(status).toBe('unavailable');
      } finally {
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY = originalKey;
      }
    });

    it('returns unavailable when API key is configured but feature flag is false', async () => {
      vi.stubEnv('VITE_ENABLE_GOOGLE_PLACES_MEDIA', 'false');
      const originalKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY = 'test-api-key-12345';

      try {
        const status = await loadGooglePlacesUiKit();
        expect(status).toBe('unavailable');
      } finally {
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY = originalKey;
        vi.unstubAllEnvs();
      }
    });
  });

  describe('UI Kit Loader with Configured Key in Browser Environment', () => {
    let prevWindow: unknown;
    let prevDocument: unknown;

    beforeEach(() => {
      vi.stubEnv('VITE_ENABLE_GOOGLE_PLACES_MEDIA', 'true');
      prevWindow = (globalThis as unknown as { window: unknown }).window;
      prevDocument = (globalThis as unknown as { document: unknown }).document;
    });

    afterEach(() => {
      vi.unstubAllEnvs();
      (globalThis as unknown as { window: unknown }).window = prevWindow;
      (globalThis as unknown as { document: unknown }).document = prevDocument;
    });

    it('appends script with libraries=places and resolves when google.maps is ready', async () => {
      const originalKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY = 'test-api-key-12345';

      const scriptListeners: Record<string, ((e?: unknown) => void)[]> = {};
      const appendedScripts: unknown[] = [];

      const mockScript: Record<string, unknown> = {
        id: '',
        src: '',
        type: '',
        async: false,
        defer: false,
        addEventListener: vi.fn((event: string, cb: (e?: unknown) => void) => {
          if (!scriptListeners[event]) scriptListeners[event] = [];
          scriptListeners[event].push(cb);
        }),
      };

      const mockDoc = {
        getElementById: vi.fn((id: string) => {
          return (
            appendedScripts.find((s) => (s as { id: string }).id === id) || null
          );
        }),
        createElement: vi.fn((tag: string) => {
          if (tag === 'script') return mockScript;
          return {};
        }),
        head: {
          appendChild: vi.fn((node: unknown) => {
            appendedScripts.push(node);
            return node;
          }),
        },
      };

      const importLibraryMock = vi.fn().mockResolvedValue({});
      const mockWin = {
        google: {
          maps: {
            importLibrary: importLibraryMock,
          },
        },
      };

      (globalThis as unknown as { window: unknown }).window = mockWin;
      (globalThis as unknown as { document: unknown }).document = mockDoc;

      try {
        const loadPromise = loadGooglePlacesUiKit();

        expect(mockDoc.createElement).toHaveBeenCalledWith('script');
        expect(mockScript.id).toBe('google-maps-places-ui-kit-script');
        expect(mockScript.src).toContain('key=test-api-key-12345');
        expect(mockScript.src).toContain('libraries=places');
        expect(mockScript.src).toContain('v=weekly');

        // Trigger load event
        const loadListeners = scriptListeners['load'] || [];
        expect(loadListeners.length).toBeGreaterThan(0);
        await loadListeners[0]();

        const status = await loadPromise;
        expect(status).toBe('ready');
        expect(importLibraryMock).toHaveBeenCalledWith('places');
      } finally {
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY = originalKey;
      }
    });

    it('deduplicates simultaneous loader requests with same promise', async () => {
      const originalKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY = 'test-api-key-12345';

      const appendedScripts: unknown[] = [];
      const mockScript: Record<string, unknown> = {
        id: '',
        src: '',
        addEventListener: vi.fn(),
      };

      const mockDoc = {
        getElementById: vi.fn(() => null),
        createElement: vi.fn(() => mockScript),
        head: {
          appendChild: vi.fn((node: unknown) => {
            appendedScripts.push(node);
            return node;
          }),
        },
      };

      (globalThis as unknown as { window: unknown }).window = {};
      (globalThis as unknown as { document: unknown }).document = mockDoc;

      try {
        const p1 = loadGooglePlacesUiKit();
        const p2 = loadGooglePlacesUiKit();
        expect(p1).toBe(p2); // Exact same promise reference
        expect(appendedScripts.length).toBe(1);
      } finally {
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY = originalKey;
      }
    });
  });
});
