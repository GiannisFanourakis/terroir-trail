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

describe('Google Places UI Kit & Allowlist', () => {
  beforeEach(() => {
    _resetGooglePlacesUiKitStateForTesting();
    vi.resetModules();
  });

  afterEach(() => {
    _resetGooglePlacesUiKitStateForTesting();
  });

  describe('Allowlist Verification', () => {
    it('has exactly 5 audited producers across diverse categories', () => {
      expect(GOOGLE_PLACES_PROTOTYPE_ITEMS).toHaveLength(5);
      expect(GOOGLE_PLACES_PROTOTYPE_ALLOWLIST).toHaveLength(5);

      const categories = GOOGLE_PLACES_PROTOTYPE_ITEMS.map((item) => item.category);
      expect(categories).toContain('winery');
      expect(categories).toContain('farm');
      expect(categories).toContain('brewery');
      expect(categories).toContain('olive_mill');
      expect(categories).toContain('apiary');
    });

    it('identifies allowlisted producers correctly', () => {
      expect(isGooglePlacesEligible('lyrarakis-winery')).toBe(true);
      expect(isGooglePlacesEligible('peskesi-farm-kazani')).toBe(true);
      expect(isGooglePlacesEligible('cretan-brewery-charma')).toBe(true);
      expect(isGooglePlacesEligible('biolea-estate')).toBe(true);
      expect(isGooglePlacesEligible('stathakis-honey-park')).toBe(true);
    });

    it('rejects unlisted producers', () => {
      expect(isGooglePlacesEligible('unknown-winery')).toBe(false);
      expect(isGooglePlacesEligible('random-producer-id')).toBe(false);
      expect(isGooglePlacesEligible('')).toBe(false);
    });

    it('retrieves config with coordinates', () => {
      const config = getGooglePlacesPrototypeEntry('lyrarakis-winery');
      expect(config).toBeDefined();
      expect(config?.producerId).toBe('lyrarakis-winery');
      expect(config?.coordinates).toEqual([35.183416, 25.176466]);
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
  });

  describe('UI Kit Loader with Configured Key in Browser Environment', () => {
    let prevWindow: unknown;
    let prevDocument: unknown;

    beforeEach(() => {
      prevWindow = (globalThis as unknown as { window: unknown }).window;
      prevDocument = (globalThis as unknown as { document: unknown }).document;
    });

    afterEach(() => {
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
          return appendedScripts.find((s) => (s as { id: string }).id === id) || null;
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
