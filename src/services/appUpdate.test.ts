import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getRunningBuildId,
  getReloadGuardTarget,
  setReloadGuardTarget,
  clearReloadGuard,
  isUserActivelyEditing,
  fetchDeployedVersion,
  performAppReload,
  installAppUpdateManager,
  RELOAD_GUARD_SESSION_KEY,
  type AppBuildMetadata,
} from './appUpdate';

describe('appUpdate Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getRunningBuildId', () => {
    it('returns dev fallback when __APP_BUILD_ID__ is not set', () => {
      const id = getRunningBuildId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });
  });

  describe('Reload Guard Storage Helpers', () => {
    it('reads, writes, and clears target build in storage', () => {
      const mockStorage: Storage = {
        length: 0,
        clear: vi.fn(),
        getItem: vi.fn(),
        key: vi.fn(),
        removeItem: vi.fn(),
        setItem: vi.fn(),
      };

      const store: Record<string, string> = {};
      (mockStorage.getItem as any).mockImplementation((k: string) => store[k] ?? null);
      (mockStorage.setItem as any).mockImplementation((k: string, v: string) => {
        store[k] = v;
      });
      (mockStorage.removeItem as any).mockImplementation((k: string) => {
        delete store[k];
      });

      expect(getReloadGuardTarget(mockStorage)).toBeNull();

      setReloadGuardTarget(mockStorage, 'build-123');
      expect(getReloadGuardTarget(mockStorage)).toBe('build-123');
      expect(mockStorage.setItem).toHaveBeenCalledWith(RELOAD_GUARD_SESSION_KEY, 'build-123');

      clearReloadGuard(mockStorage);
      expect(getReloadGuardTarget(mockStorage)).toBeNull();
      expect(mockStorage.removeItem).toHaveBeenCalledWith(RELOAD_GUARD_SESSION_KEY);
    });

    it('handles null storage or throwing storage safely', () => {
      expect(getReloadGuardTarget(null)).toBeNull();
      expect(() => setReloadGuardTarget(null, 'build-123')).not.toThrow();
      expect(() => clearReloadGuard(null)).not.toThrow();

      const throwingStorage = {
        getItem: vi.fn().mockImplementation(() => {
          throw new Error('Access denied');
        }),
        setItem: vi.fn().mockImplementation(() => {
          throw new Error('Quota exceeded');
        }),
        removeItem: vi.fn().mockImplementation(() => {
          throw new Error('Access denied');
        }),
      } as unknown as Storage;

      expect(getReloadGuardTarget(throwingStorage)).toBeNull();
      expect(() => setReloadGuardTarget(throwingStorage, 'build-123')).not.toThrow();
      expect(() => clearReloadGuard(throwingStorage)).not.toThrow();
    });
  });

  describe('isUserActivelyEditing', () => {
    it('returns false when no active element or body is active', () => {
      const doc = {
        activeElement: { tagName: 'BODY' },
      } as unknown as Document;
      expect(isUserActivelyEditing(doc)).toBe(false);
    });

    it('returns true when activeElement is text input, textarea, or select', () => {
      const textInput = {
        tagName: 'INPUT',
        type: 'text',
      } as unknown as Document;
      expect(isUserActivelyEditing({ activeElement: textInput } as any)).toBe(true);

      const emailInput = {
        tagName: 'INPUT',
        type: 'email',
      } as unknown as Document;
      expect(isUserActivelyEditing({ activeElement: emailInput } as any)).toBe(true);

      const textarea = {
        tagName: 'TEXTAREA',
      } as unknown as Document;
      expect(isUserActivelyEditing({ activeElement: textarea } as any)).toBe(true);

      const select = {
        tagName: 'SELECT',
      } as unknown as Document;
      expect(isUserActivelyEditing({ activeElement: select } as any)).toBe(true);
    });

    it('returns false for non-text inputs like buttons or checkboxes', () => {
      const buttonInput = {
        tagName: 'INPUT',
        type: 'button',
      } as unknown as Document;
      expect(isUserActivelyEditing({ activeElement: buttonInput } as any)).toBe(false);

      const checkboxInput = {
        tagName: 'INPUT',
        type: 'checkbox',
      } as unknown as Document;
      expect(isUserActivelyEditing({ activeElement: checkboxInput } as any)).toBe(false);
    });

    it('returns true for contentEditable elements', () => {
      const editable = {
        tagName: 'DIV',
        isContentEditable: true,
      } as unknown as Document;
      expect(isUserActivelyEditing({ activeElement: editable } as any)).toBe(true);
    });
  });

  describe('fetchDeployedVersion', () => {
    it('returns parsed metadata on 200 response with valid buildId', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          buildId: 'commit123-1789790123',
          builtAt: '2026-09-19T05:00:00.000Z',
          commit: 'commit123',
        }),
      });

      const res = await fetchDeployedVersion(mockFetch as any);
      expect(res).toEqual<AppBuildMetadata>({
        buildId: 'commit123-1789790123',
        builtAt: '2026-09-19T05:00:00.000Z',
        commit: 'commit123',
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('/version.json?t=');
    });

    it('returns null when response is not ok (e.g. 404 or 500)', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      const res = await fetchDeployedVersion(mockFetch as any);
      expect(res).toBeNull();
    });

    it('returns null when network request rejects (offline / DNS failure)', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

      const res = await fetchDeployedVersion(mockFetch as any);
      expect(res).toBeNull();
    });

    it('returns null when json payload has missing or empty buildId', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ buildId: '   ' }),
      });

      const res = await fetchDeployedVersion(mockFetch as any);
      expect(res).toBeNull();
    });
  });

  describe('performAppReload', () => {
    it('sets reload guard target and invokes custom reload callback', () => {
      const store: Record<string, string> = {};
      const mockStorage = {
        getItem: (k: string) => store[k] ?? null,
        setItem: (k: string, v: string) => {
          store[k] = v;
        },
        removeItem: (k: string) => {
          delete store[k];
        },
      } as Storage;

      const mockReload = vi.fn();
      const mockWindow = {
        location: { reload: vi.fn(), href: 'https://terroir-trail.web.app/?producer=alpha' },
      } as unknown as Window;

      performAppReload('build-999', mockWindow, mockStorage, mockReload);

      expect(mockStorage.getItem(RELOAD_GUARD_SESSION_KEY)).toBe('build-999');
      expect(mockReload).toHaveBeenCalledWith('build-999');
      expect(mockWindow.location.reload).not.toHaveBeenCalled();
    });

    it('calls window.location.reload when no custom callback is supplied', () => {
      const mockReloadLocation = vi.fn();
      const mockWindow = {
        location: { reload: mockReloadLocation, href: 'https://terroir-trail.web.app/?producer=alpha' },
      } as unknown as Window;

      performAppReload('build-888', mockWindow, null);
      expect(mockReloadLocation).toHaveBeenCalled();
    });
  });

  describe('installAppUpdateManager Lifecycle & Loop Protection', () => {
    let mockStorage: Storage;
    let store: Record<string, string>;
    let mockFetch: ReturnType<typeof vi.fn>;
    let listeners: Record<string, (() => unknown)[]>;
    let mockWindow: any;
    let mockDocument: any;

    beforeEach(() => {
      store = {};
      mockStorage = {
        getItem: vi.fn((k: string) => store[k] ?? null),
        setItem: vi.fn((k: string, v: string) => {
          store[k] = v;
        }),
        removeItem: vi.fn((k: string) => {
          delete store[k];
        }),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      };

      listeners = {};
      mockWindow = {
        addEventListener: vi.fn((event: string, cb: () => unknown) => {
          listeners[event] = listeners[event] || [];
          listeners[event].push(cb);
        }),
        removeEventListener: vi.fn((event: string, cb: () => unknown) => {
          if (listeners[event]) {
            listeners[event] = listeners[event].filter((fn) => fn !== cb);
          }
        }),
        location: {
          reload: vi.fn(),
          href: 'https://terroir-trail.web.app/?producer=estate-argyros',
        },
        navigator: {
          serviceWorker: {
            getRegistration: vi.fn().mockResolvedValue(null),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
          },
        },
      };

      mockDocument = {
        visibilityState: 'visible',
        activeElement: { tagName: 'BODY' },
        addEventListener: vi.fn((event: string, cb: () => unknown) => {
          listeners[event] = listeners[event] || [];
          listeners[event].push(cb);
        }),
        removeEventListener: vi.fn((event: string, cb: () => unknown) => {
          if (listeners[event]) {
            listeners[event] = listeners[event].filter((fn) => fn !== cb);
          }
        }),
      };
    });

    it('does nothing when deployed build matches running build (no reload)', async () => {
      mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ buildId: 'build-A' }),
      });
      const onReloadRequested = vi.fn();

      const teardown = installAppUpdateManager({
        enabled: true,
        currentBuildId: 'build-A',
        fetchFn: mockFetch as any,
        windowObj: mockWindow,
        documentObj: mockDocument,
        storageObj: mockStorage,
        onReloadRequested,
        throttleIntervalMs: 0,
      });

      // Trigger resume (visibilitychange)
      const visCb = listeners['visibilitychange']?.[0];
      expect(visCb).toBeDefined();
      await visCb();

      expect(mockFetch).toHaveBeenCalled();
      expect(onReloadRequested).not.toHaveBeenCalled();
      teardown();
    });

    it('triggers guarded reload when deployed build differs from running build', async () => {
      mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ buildId: 'build-B' }),
      });
      const onReloadRequested = vi.fn();

      const teardown = installAppUpdateManager({
        enabled: true,
        currentBuildId: 'build-A',
        fetchFn: mockFetch as any,
        windowObj: mockWindow,
        documentObj: mockDocument,
        storageObj: mockStorage,
        onReloadRequested,
        throttleIntervalMs: 0,
      });

      const visCb = listeners['visibilitychange']?.[0];
      await visCb();

      expect(mockFetch).toHaveBeenCalled();
      expect(onReloadRequested).toHaveBeenCalledWith('build-B');
      expect(mockStorage.setItem).toHaveBeenCalledWith(RELOAD_GUARD_SESSION_KEY, 'build-B');
      teardown();
    });

    it('suppresses reload if this session already attempted reloading for target build (loop guard)', async () => {
      // Simulate session storage already having attempted reload for 'build-B'
      store[RELOAD_GUARD_SESSION_KEY] = 'build-B';

      mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ buildId: 'build-B' }),
      });
      const onReloadRequested = vi.fn();

      const teardown = installAppUpdateManager({
        enabled: true,
        currentBuildId: 'build-A', // Still running build-A
        fetchFn: mockFetch as any,
        windowObj: mockWindow,
        documentObj: mockDocument,
        storageObj: mockStorage,
        onReloadRequested,
        throttleIntervalMs: 0,
      });

      const visCb = listeners['visibilitychange']?.[0];
      await visCb();

      expect(mockFetch).toHaveBeenCalled();
      // Should NOT reload again because loop guard is active for build-B
      expect(onReloadRequested).not.toHaveBeenCalled();
      teardown();
    });

    it('clears reload guard when the running build reaches the target build', () => {
      // User successfully reloaded and is now on build-B
      store[RELOAD_GUARD_SESSION_KEY] = 'build-B';

      const teardown = installAppUpdateManager({
        enabled: true,
        currentBuildId: 'build-B',
        windowObj: mockWindow,
        documentObj: mockDocument,
        storageObj: mockStorage,
        throttleIntervalMs: 0,
      });

      expect(mockStorage.removeItem).toHaveBeenCalledWith(RELOAD_GUARD_SESSION_KEY);
      teardown();
    });

    it('throttles rapid checks so multiple events do not produce extra fetch calls', async () => {
      mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ buildId: 'build-A' }),
      });

      const teardown = installAppUpdateManager({
        enabled: true,
        currentBuildId: 'build-A',
        fetchFn: mockFetch as any,
        windowObj: mockWindow,
        documentObj: mockDocument,
        storageObj: mockStorage,
        throttleIntervalMs: 10_000, // 10s throttle
      });

      const visCb = listeners['visibilitychange']?.[0];
      const pageShowCb = listeners['pageshow']?.[0];
      const focusCb = listeners['focus']?.[0];

      await visCb();
      await pageShowCb();
      await focusCb();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      teardown();
    });

    it('bypasses throttle on online event (force: true)', async () => {
      mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ buildId: 'build-A' }),
      });

      const teardown = installAppUpdateManager({
        enabled: true,
        currentBuildId: 'build-A',
        fetchFn: mockFetch as any,
        windowObj: mockWindow,
        documentObj: mockDocument,
        storageObj: mockStorage,
        throttleIntervalMs: 60_000,
      });

      const visCb = listeners['visibilitychange']?.[0];
      const onlineCb = listeners['online']?.[0];

      await visCb();
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Online event forces a check even within throttle window
      await onlineCb();
      expect(mockFetch).toHaveBeenCalledTimes(2);

      teardown();
    });

    it('defers reload when user is actively editing, then executes reload on blur', async () => {
      mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ buildId: 'build-B' }),
      });
      const onReloadRequested = vi.fn();

      const textInput = {
        tagName: 'INPUT',
        type: 'text',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
      mockDocument.activeElement = textInput;

      let blurCallback: (() => void) | null = null;
      textInput.addEventListener.mockImplementation((event: string, cb: () => void) => {
        if (event === 'blur') blurCallback = cb;
      });

      const teardown = installAppUpdateManager({
        enabled: true,
        currentBuildId: 'build-A',
        fetchFn: mockFetch as any,
        windowObj: mockWindow,
        documentObj: mockDocument,
        storageObj: mockStorage,
        onReloadRequested,
        throttleIntervalMs: 0,
      });

      const visCb = listeners['visibilitychange']?.[0];
      await visCb();

      // Deployed build-B detected, but text input active: reload is deferred
      expect(onReloadRequested).not.toHaveBeenCalled();
      expect(textInput.addEventListener).toHaveBeenCalledWith('blur', expect.any(Function), { once: true });
      expect(blurCallback).toBeDefined();

      // Now user blurs the input
      mockDocument.activeElement = { tagName: 'BODY' };
      blurCallback!();

      // Reload executes now that editing has ended
      expect(onReloadRequested).toHaveBeenCalledWith('build-B');
      teardown();
    });

    it('shares in-flight check promise during concurrent calls', async () => {
      let resolveFetch: (val: any) => void;
      mockFetch = vi.fn().mockReturnValue(
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
      );

      const teardown = installAppUpdateManager({
        enabled: true,
        currentBuildId: 'build-A',
        fetchFn: mockFetch as any,
        windowObj: mockWindow,
        documentObj: mockDocument,
        storageObj: mockStorage,
        throttleIntervalMs: 0,
      });

      const visCb = listeners['visibilitychange']?.[0];
      const pageShowCb = listeners['pageshow']?.[0];

      // Initiate two asynchronous checks concurrently
      const promise1 = visCb();
      const promise2 = pageShowCb();

      expect(mockFetch).toHaveBeenCalledTimes(1);

      resolveFetch!({
        ok: true,
        json: async () => ({ buildId: 'build-A' }),
      });

      await Promise.all([promise1, promise2]);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      teardown();
    });

    it('continues gracefully without reload when network fails during update check', async () => {
      mockFetch = vi.fn().mockRejectedValue(new Error('Network offline'));
      const onReloadRequested = vi.fn();

      const teardown = installAppUpdateManager({
        enabled: true,
        currentBuildId: 'build-A',
        fetchFn: mockFetch as any,
        windowObj: mockWindow,
        documentObj: mockDocument,
        storageObj: mockStorage,
        onReloadRequested,
        throttleIntervalMs: 0,
      });

      const visCb = listeners['visibilitychange']?.[0];
      const result = await visCb();

      expect(result).toBe(false);
      expect(onReloadRequested).not.toHaveBeenCalled();
      teardown();
    });

    it('no-ops when enabled is false (e.g. dev environment default)', () => {
      const teardown = installAppUpdateManager({
        enabled: false,
        windowObj: mockWindow,
        documentObj: mockDocument,
      });

      expect(mockDocument.addEventListener).not.toHaveBeenCalled();
      expect(mockWindow.addEventListener).not.toHaveBeenCalled();
      teardown();
    });

    it('unregisters all listeners and timers on teardown', () => {
      const teardown = installAppUpdateManager({
        enabled: true,
        currentBuildId: 'build-A',
        windowObj: mockWindow,
        documentObj: mockDocument,
        storageObj: mockStorage,
      });

      expect(mockDocument.addEventListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
      expect(mockWindow.addEventListener).toHaveBeenCalledWith('pageshow', expect.any(Function));

      teardown();

      expect(mockDocument.removeEventListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
      expect(mockWindow.removeEventListener).toHaveBeenCalledWith('pageshow', expect.any(Function));
      expect(mockWindow.removeEventListener).toHaveBeenCalledWith('focus', expect.any(Function));
      expect(mockWindow.removeEventListener).toHaveBeenCalledWith('online', expect.any(Function));
    });
  });
});
