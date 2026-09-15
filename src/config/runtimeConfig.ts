/**
 * TerroirTrail Centralized Runtime Configuration
 *
 * Provides typed, predictable, normalized runtime configuration for
 * Supabase, Firebase, API gateways, launch feature controls, and public URLs.
 * Never logs raw secrets or credentials.
 */

import { logger } from '../services/logger';

export interface FirebaseRuntimeConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface SupabaseRuntimeConfig {
  url: string;
  anonKey: string;
}

export interface ApiRuntimeConfig {
  baseUrl: string;
}

export interface ExplorerPassRuntimeConfig {
  purchasesEnabled: boolean;
}

export interface AdvertisingRuntimeConfig {
  enabled: boolean;
  client: string;
  slot: string;
}

export interface AppRuntimeConfig {
  publicUrl: string;
}

export interface RuntimeConfigDiagnostics {
  firebaseConfigured: boolean;
  supabaseConfigured: boolean;
  explorerPassPurchasesEnabled: boolean;
  advertisingEnabled: boolean;
  apiBaseConfigured: boolean;
  publicAppUrlConfigured: boolean;
}

/**
 * Safely reads a raw environment string from either custom overrides, import.meta.env,
 * or global process.env (for tests and SSR/Node tooling).
 */
export function getRawEnv(
  key: string,
  customEnv?: Record<string, string | undefined>
): string {
  if (customEnv !== undefined) {
    return (customEnv[key] ?? '').trim();
  }
  if (
    typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env[key] !== undefined
  ) {
    return String(import.meta.env[key] ?? '').trim();
  }
  const proc = (globalThis as any).process;
  if (proc?.env && proc.env[key] !== undefined) {
    return String(proc.env[key] ?? '').trim();
  }
  return '';
}

/**
 * Normalizes Firebase client SDK configuration parameters.
 */
export function getFirebaseConfig(
  customEnv?: Record<string, string | undefined>
): FirebaseRuntimeConfig {
  return {
    apiKey: getRawEnv('VITE_FIREBASE_API_KEY', customEnv),
    authDomain: getRawEnv('VITE_FIREBASE_AUTH_DOMAIN', customEnv),
    projectId:
      getRawEnv('VITE_FIREBASE_PROJECT_ID', customEnv) ||
      getRawEnv('FIREBASE_PROJECT_ID', customEnv),
    storageBucket: getRawEnv('VITE_FIREBASE_STORAGE_BUCKET', customEnv),
    messagingSenderId: getRawEnv(
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      customEnv
    ),
    appId: getRawEnv('VITE_FIREBASE_APP_ID', customEnv),
  };
}

/**
 * Returns true only when all essential Firebase client SDK parameters are present.
 */
export function checkIsFirebaseConfigured(
  customEnv?: Record<string, string | undefined>
): boolean {
  const cfg = getFirebaseConfig(customEnv);
  return Boolean(cfg.apiKey && cfg.authDomain && cfg.projectId);
}

/**
 * Normalizes Supabase public client configuration parameters.
 */
export function getSupabaseConfig(
  customEnv?: Record<string, string | undefined>
): SupabaseRuntimeConfig {
  return {
    url: getRawEnv('VITE_SUPABASE_URL', customEnv),
    anonKey: getRawEnv('VITE_SUPABASE_ANON_KEY', customEnv),
  };
}

/**
 * Returns true only when Supabase URL and anon key are present, valid HTTP URL,
 * and not a placeholder template.
 */
export function checkIsSupabaseConfigured(
  customEnv?: Record<string, string | undefined>
): boolean {
  const cfg = getSupabaseConfig(customEnv);
  return Boolean(
    cfg.url &&
    cfg.anonKey &&
    cfg.url.startsWith('http') &&
    !cfg.url.includes('your-project')
  );
}

/**
 * Normalizes API gateway base URL. Trailing slashes are stripped.
 */
export function getApiConfig(
  customEnv?: Record<string, string | undefined>
): ApiRuntimeConfig {
  const raw = getRawEnv('VITE_API_BASE_URL', customEnv);
  return {
    baseUrl: raw ? raw.replace(/\/+$/, '') : '',
  };
}

/**
 * Strict boolean parser for Explorer Pass purchase controls.
 * Enabled only when the environment value is strictly the string 'true'.
 */
export function isExplorerPassPurchasesEnabled(
  customEnv?: Record<string, string | undefined>
): boolean {
  return getRawEnv('VITE_ENABLE_EXPLORER_PASS_PURCHASES', customEnv) === 'true';
}

/**
 * Advertising is a deliberate launch decision and therefore fails closed.
 * Configured publisher and slot IDs do not enable it without this strict gate.
 */
export function isAdvertisingEnabled(
  customEnv?: Record<string, string | undefined>
): boolean {
  return getRawEnv('VITE_ENABLE_ADVERTISING', customEnv) === 'true';
}

export function getAdvertisingConfig(
  customEnv?: Record<string, string | undefined>
): AdvertisingRuntimeConfig {
  return {
    enabled: isAdvertisingEnabled(customEnv),
    client: getRawEnv('VITE_ADSENSE_CLIENT_ID', customEnv),
    slot: getRawEnv('VITE_ADSENSE_SLOT_ID', customEnv),
  };
}

/**
 * Google Places UI Kit media prototype is an experimental / pre-GA feature.
 * Fails closed (false) by default so external Google media is never requested
 * unless explicitly enabled alongside a valid API key.
 */
export function isGooglePlacesMediaEnabled(
  customEnv?: Record<string, string | undefined>
): boolean {
  return getRawEnv('VITE_ENABLE_GOOGLE_PLACES_MEDIA', customEnv) === 'true';
}

/**
 * Legacy helper retained for old blob-media quarantine logic. It remains
 * opt-in so legacy temporary blob URLs never become trusted public media.
 */
export function isHostMediaPrototypeEnabled(
  customEnv?: Record<string, string | undefined>
): boolean {
  return getRawEnv('VITE_ENABLE_HOST_MEDIA_PROTOTYPE', customEnv) === 'true';
}

/**
 * Normalizes public-facing web app URL for pass QR codes and links.
 * Defaults to https://terroir-trail.web.app without trailing slash.
 */
export function getPublicAppUrl(
  customEnv?: Record<string, string | undefined>
): string {
  const raw = getRawEnv('VITE_PUBLIC_APP_URL', customEnv);
  if (!raw) {
    return 'https://terroir-trail.web.app';
  }
  return raw.replace(/\/+$/, '');
}

/**
 * Returns safe boolean status flags for diagnostics.
 * Contains only booleans — never raw keys, tokens, or URLs containing credentials.
 */
export function getRuntimeDiagnostics(
  customEnv?: Record<string, string | undefined>
): RuntimeConfigDiagnostics {
  return {
    firebaseConfigured: checkIsFirebaseConfigured(customEnv),
    supabaseConfigured: checkIsSupabaseConfigured(customEnv),
    explorerPassPurchasesEnabled: isExplorerPassPurchasesEnabled(customEnv),
    advertisingEnabled: isAdvertisingEnabled(customEnv),
    apiBaseConfigured: Boolean(getRawEnv('VITE_API_BASE_URL', customEnv)),
    publicAppUrlConfigured: Boolean(
      getRawEnv('VITE_PUBLIC_APP_URL', customEnv)
    ),
  };
}

let diagnosticsLogged = false;

/**
 * Emits diagnostic warnings at most once during initialization if core services
 * are partially configured (some keys present, but missing required parameters).
 */
export function logRuntimeDiagnosticsOnce(
  customEnv?: Record<string, string | undefined>
): void {
  if (diagnosticsLogged) return;
  diagnosticsLogged = true;

  const fb = getFirebaseConfig(customEnv);
  const hasAnyFb = Boolean(
    fb.apiKey || fb.authDomain || fb.projectId || fb.appId
  );
  const isFbComplete = checkIsFirebaseConfigured(customEnv);
  if (hasAnyFb && !isFbComplete) {
    logger.warn('Config', 'firebase_partial_configuration', {
      configured: false,
    });
  }

  const sb = getSupabaseConfig(customEnv);
  const hasAnySb = Boolean(sb.url || sb.anonKey);
  const isSbComplete = checkIsSupabaseConfigured(customEnv);
  if (hasAnySb && !isSbComplete) {
    logger.warn('Config', 'supabase_partial_configuration', {
      configured: false,
    });
  }
}

export function _resetDiagnosticsLoggedForTesting(): void {
  diagnosticsLogged = false;
}

// Automatically emit one-time diagnostic warnings when module is loaded
logRuntimeDiagnosticsOnce();

/**
 * Dynamic configuration object with lazy getters to ensure test overrides
 * (e.g. vi.stubEnv) are reflected when properties are accessed.
 */
export const runtimeConfig = {
  get firebase(): FirebaseRuntimeConfig {
    return getFirebaseConfig();
  },
  get supabase(): SupabaseRuntimeConfig {
    return getSupabaseConfig();
  },
  get api(): ApiRuntimeConfig {
    return getApiConfig();
  },
  get explorerPass(): ExplorerPassRuntimeConfig {
    return { purchasesEnabled: isExplorerPassPurchasesEnabled() };
  },
  get advertising(): AdvertisingRuntimeConfig {
    return getAdvertisingConfig();
  },
  get googlePlacesMedia(): { enabled: boolean } {
    return { enabled: isGooglePlacesMediaEnabled() };
  },
  // Producer image upload is now a launch feature. The legacy property name is
  // retained so existing portal code can transition without another flag.
  get hostMediaPrototype(): { enabled: boolean } {
    return { enabled: true };
  },
  get app(): AppRuntimeConfig {
    return { publicUrl: getPublicAppUrl() };
  },
};

/**
 * Top-level status booleans for consumers.
 */
export const isFirebaseConfigured = checkIsFirebaseConfigured();
export const isSupabaseConfigured = checkIsSupabaseConfigured();
