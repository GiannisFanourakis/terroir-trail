/**
 * TerroirTrail Cross-Platform PWA Update Manager
 *
 * Provides production-safe, cross-platform application deployment detection
 * and guarded automatic reload across Android, iOS/iPadOS, macOS, Windows,
 * and standard desktop/mobile browsers.
 *
 * Design principles:
 * 1. Authoritative deployment: Compares running compile-time build ID against /version.json.
 * 2. Network-only service worker preserved: sw.js remains network-only; no offline bundle caching.
 * 3. Lifecycle-driven: Checks on startup, visibilitychange (resume), pageshow (bfcache),
 *    window focus, online transition, and conservative periodic intervals.
 * 4. Throttling & deduplication: Debounces rapid lifecycle triggers and guards against concurrent requests.
 * 5. Reload-loop protection: Uses sessionStorage to guarantee the app never reloads repeatedly for the same target build.
 * 6. User interaction safety: Avoids disruptive reloads while a user is actively editing forms/inputs.
 * 7. Clean deep-link preservation: Preserves current path, hash, and parameters (such as ?producer=<id>).
 */

import { logger } from './logger';

export interface AppBuildMetadata {
  buildId: string;
  builtAt?: string;
  commit?: string;
}

export interface AppUpdateOptions {
  enabled?: boolean;
  currentBuildId?: string;
  throttleIntervalMs?: number;
  periodicIntervalMs?: number;
  fetchFn?: typeof fetch;
  windowObj?: Window;
  documentObj?: Document;
  storageObj?: Storage | null;
  onReloadRequested?: (targetBuildId: string) => void;
}

export const RELOAD_GUARD_SESSION_KEY = 'terroirtrail:update:last_reload_target';
export const DEFAULT_THROTTLE_INTERVAL_MS = 45_000; // 45 seconds between non-forced checks
export const DEFAULT_PERIODIC_INTERVAL_MS = 300_000; // 5 minutes periodic check while visible
export const RELOAD_GUARD_COOLDOWN_MS = 120_000; // Retry a failed CDN/update handoff after 2 minutes

/**
 * Returns the compile-time build identifier baked into the running bundle.
 */
export function getRunningBuildId(): string {
  if (typeof __APP_BUILD_ID__ !== 'undefined' && __APP_BUILD_ID__) {
    return __APP_BUILD_ID__;
  }
  return 'dev';
}

/**
 * Safely reads the target build ID recorded before the most recent reload in this session.
 */
export interface ReloadGuardRecord {
  targetBuildId: string;
  attemptedAt: number;
}

export function getReloadGuardRecord(storage: Storage | null): ReloadGuardRecord | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(RELOAD_GUARD_SESSION_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as Partial<ReloadGuardRecord>;
      if (
        typeof parsed.targetBuildId === 'string' &&
        parsed.targetBuildId &&
        typeof parsed.attemptedAt === 'number'
      ) {
        return {
          targetBuildId: parsed.targetBuildId,
          attemptedAt: parsed.attemptedAt,
        };
      }
    } catch {
      // Older builds stored only the target string. Treat that legacy guard as
      // expired so it cannot suppress retries for an entire browser session.
      return { targetBuildId: raw, attemptedAt: 0 };
    }
    return null;
  } catch {
    return null;
  }
}

export function getReloadGuardTarget(storage: Storage | null): string | null {
  return getReloadGuardRecord(storage)?.targetBuildId ?? null;
}

/**
 * Safely records the target build ID before triggering an application reload.
 */
export function setReloadGuardTarget(
  storage: Storage | null,
  targetBuildId: string,
  attemptedAt = Date.now()
): void {
  if (!storage) return;
  try {
    storage.setItem(
      RELOAD_GUARD_SESSION_KEY,
      JSON.stringify({ targetBuildId, attemptedAt })
    );
  } catch {
    // Quota or access error in strict environments — handled safely
  }
}

/**
 * Clears the reload guard once the running application successfully matches the target build.
 */
export function clearReloadGuard(storage: Storage | null): void {
  if (!storage) return;
  try {
    storage.removeItem(RELOAD_GUARD_SESSION_KEY);
  } catch {
    // Handled safely
  }
}

/**
 * Determines whether the user is currently focused on an active editable form field.
 */
export function isUserActivelyEditing(doc: Document): boolean {
  try {
    const active = doc.activeElement;
    if (!active) return false;

    const tagName = active.tagName.toLowerCase();
    if (tagName === 'input') {
      const inputType = (active as HTMLInputElement).type?.toLowerCase() || 'text';
      const nonTypingTypes = ['button', 'submit', 'reset', 'checkbox', 'radio', 'hidden', 'image', 'range', 'color'];
      return !nonTypingTypes.includes(inputType);
    }
    if (tagName === 'textarea' || tagName === 'select') {
      return true;
    }
    if ((active as HTMLElement).isContentEditable) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Fetches and validates the deployed /version.json manifest defensively.
 * Never throws and returns null if unreachable, malformed, or offline.
 */
export async function fetchDeployedVersion(
  fetchFn: typeof fetch = fetch
): Promise<AppBuildMetadata | null> {
  try {
    const response = await fetchFn(`/version.json?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as unknown;
    if (
      data &&
      typeof data === 'object' &&
      'buildId' in data &&
      typeof (data as { buildId: unknown }).buildId === 'string' &&
      (data as { buildId: string }).buildId.trim().length > 0
    ) {
      return {
        buildId: (data as { buildId: string }).buildId.trim(),
        builtAt:
          'builtAt' in data && typeof (data as { builtAt: unknown }).builtAt === 'string'
            ? (data as { builtAt: string }).builtAt
            : undefined,
        commit:
          'commit' in data && typeof (data as { commit: unknown }).commit === 'string'
            ? (data as { commit: string }).commit
            : undefined,
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Triggers an application reload while preserving session state, URL parameters, and loop guards.
 */
export function performAppReload(
  targetBuildId: string,
  windowObj: Window,
  storageObj: Storage | null,
  customReload?: (targetBuildId: string) => void
): void {
  setReloadGuardTarget(storageObj, targetBuildId);

  if (customReload) {
    customReload(targetBuildId);
    return;
  }

  try {
    windowObj.location.reload();
  } catch (err) {
    logger.warn('AppUpdate', 'location_reload_failed', {
      targetBuildId,
      error: String(err),
    });
  }
}

let activeTeardown: (() => void) | null = null;

/**
 * Installs the global application update manager.
 * Returns a teardown function that unregisters all lifecycle listeners and timers.
 */
export function installAppUpdateManager(options?: AppUpdateOptions): () => void {
  const isProd = typeof import.meta !== 'undefined' && Boolean(import.meta.env?.PROD);
  const enabled = options?.enabled ?? isProd;

  if (!enabled) {
    return () => {};
  }

  // Clean up any previously installed instance to prevent duplicate handlers
  if (activeTeardown) {
    activeTeardown();
    activeTeardown = null;
  }

  const windowObj = options?.windowObj ?? (typeof window !== 'undefined' ? window : null);
  const documentObj = options?.documentObj ?? (typeof document !== 'undefined' ? document : null);

  if (!windowObj || !documentObj) {
    return () => {};
  }

  let storageObj: Storage | null = null;
  if (options?.storageObj !== undefined) {
    storageObj = options.storageObj;
  } else {
    try {
      storageObj = windowObj.sessionStorage;
    } catch {
      storageObj = null;
    }
  }

  const runningBuildId = options?.currentBuildId ?? getRunningBuildId();
  const fetchFn = options?.fetchFn ?? (windowObj.fetch ? windowObj.fetch.bind(windowObj) : fetch);
  const throttleIntervalMs = options?.throttleIntervalMs ?? DEFAULT_THROTTLE_INTERVAL_MS;
  const periodicIntervalMs = options?.periodicIntervalMs ?? DEFAULT_PERIODIC_INTERVAL_MS;
  const onReloadRequested = options?.onReloadRequested;

  // If the running application build matches the last reload guard target, the reload succeeded
  const lastTarget = getReloadGuardTarget(storageObj);
  if (lastTarget && lastTarget === runningBuildId) {
    clearReloadGuard(storageObj);
  }

  let lastCheckAt = 0;
  let inFlightCheck: Promise<boolean> | null = null;
  let pendingReloadTarget: string | null = null;
  let activeElementBlurListener: (() => void) | null = null;

  const detachBlurListener = () => {
    if (activeElementBlurListener) {
      activeElementBlurListener();
      activeElementBlurListener = null;
    }
  };

  const scheduleDeferredReloadOnBlur = (targetBuildId: string) => {
    detachBlurListener();
    pendingReloadTarget = targetBuildId;

    const activeEl = documentObj.activeElement;
    const triggerReloadIfSafe = () => {
      detachBlurListener();
      if (pendingReloadTarget && !isUserActivelyEditing(documentObj)) {
        const target = pendingReloadTarget;
        pendingReloadTarget = null;
        performAppReload(target, windowObj, storageObj, onReloadRequested);
      }
    };

    if (activeEl && typeof activeEl.addEventListener === 'function') {
      activeEl.addEventListener('blur', triggerReloadIfSafe, { once: true });
      activeElementBlurListener = () => {
        try {
          activeEl.removeEventListener('blur', triggerReloadIfSafe);
        } catch {
          // Ignored
        }
      };
    } else {
      windowObj.addEventListener('focusout', triggerReloadIfSafe, { once: true });
      activeElementBlurListener = () => {
        try {
          windowObj.removeEventListener('focusout', triggerReloadIfSafe);
        } catch {
          // Ignored
        }
      };
    }
  };

  /**
   * Evaluates deployment version and reloads if a new build is deployed.
   */
  const checkForAppUpdate = async (params?: { force?: boolean }): Promise<boolean> => {
    const force = Boolean(params?.force);
    const now = Date.now();

    if (!force && now - lastCheckAt < throttleIntervalMs) {
      return false;
    }

    if (inFlightCheck) {
      return inFlightCheck;
    }

    inFlightCheck = (async () => {
      try {
        lastCheckAt = Date.now();

        // Optionally request service worker to check for script updates
        if ('serviceWorker' in windowObj.navigator && windowObj.navigator.serviceWorker) {
          void windowObj.navigator.serviceWorker
            .getRegistration()
            .then((registration) => {
              if (registration) {
                void registration.update().catch(() => {});
              }
            })
            .catch(() => {});
        }

        const deployed = await fetchDeployedVersion(fetchFn);
        if (!deployed) {
          return false;
        }

        if (deployed.buildId === runningBuildId) {
          // Deployed build matches current running build; ensure reload guard is clear
          clearReloadGuard(storageObj);
          pendingReloadTarget = null;
          detachBlurListener();
          return false;
        }

        // Newer build detected: check loop protection guard
        const attempted = getReloadGuardRecord(storageObj);
        if (
          attempted?.targetBuildId === deployed.buildId &&
          Date.now() - attempted.attemptedAt < RELOAD_GUARD_COOLDOWN_MS
        ) {
          logger.warn('AppUpdate', 'update_reload_loop_suppressed', {
            runningBuildId,
            targetBuildId: deployed.buildId,
          });
          return false;
        }

        // Check if user is actively typing in a form
        if (isUserActivelyEditing(documentObj)) {
          scheduleDeferredReloadOnBlur(deployed.buildId);
          return false;
        }

        // Safe to execute guarded reload
        performAppReload(deployed.buildId, windowObj, storageObj, onReloadRequested);
        return true;
      } finally {
        inFlightCheck = null;
      }
    })();

    return inFlightCheck;
  };

  // Event handlers
  const handleResume = (): Promise<boolean> => {
    if (pendingReloadTarget && !isUserActivelyEditing(documentObj)) {
      const target = pendingReloadTarget;
      pendingReloadTarget = null;
      detachBlurListener();
      performAppReload(target, windowObj, storageObj, onReloadRequested);
      return Promise.resolve(true);
    }
    return checkForAppUpdate();
  };

  const handleVisibilityChange = (): Promise<boolean> => {
    if (documentObj.visibilityState === 'visible') {
      return handleResume();
    }
    return Promise.resolve(false);
  };

  const handlePageShow = (): Promise<boolean> => {
    return handleResume();
  };

  const handleFocus = (): Promise<boolean> => {
    return checkForAppUpdate();
  };

  const handleOnline = (): Promise<boolean> => {
    return checkForAppUpdate({ force: true });
  };

  const handleControllerChange = (): Promise<boolean> => {
    // When service worker controller changes, perform a centralized version comparison
    return checkForAppUpdate({ force: true });
  };

  documentObj.addEventListener('visibilitychange', handleVisibilityChange);
  windowObj.addEventListener('pageshow', handlePageShow);
  windowObj.addEventListener('focus', handleFocus);
  windowObj.addEventListener('online', handleOnline);

  if ('serviceWorker' in windowObj.navigator && windowObj.navigator.serviceWorker) {
    windowObj.navigator.serviceWorker.addEventListener?.('controllerchange', handleControllerChange);
  }

  // Periodic check while document is visible
  const periodicTimer = setInterval(() => {
    if (documentObj.visibilityState === 'visible') {
      void checkForAppUpdate();
    }
  }, periodicIntervalMs);

  // Initial non-blocking startup check
  const startupTimer = setTimeout(() => {
    void checkForAppUpdate();
  }, 1500);

  const teardown = () => {
    clearTimeout(startupTimer);
    clearInterval(periodicTimer);
    detachBlurListener();

    documentObj.removeEventListener('visibilitychange', handleVisibilityChange);
    windowObj.removeEventListener('pageshow', handlePageShow);
    windowObj.removeEventListener('focus', handleFocus);
    windowObj.removeEventListener('online', handleOnline);

    if ('serviceWorker' in windowObj.navigator && windowObj.navigator.serviceWorker) {
      windowObj.navigator.serviceWorker.removeEventListener?.('controllerchange', handleControllerChange);
    }
  };

  activeTeardown = teardown;
  return teardown;
}
