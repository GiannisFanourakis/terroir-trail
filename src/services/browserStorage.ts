/**
 * TerroirTrail Browser Storage Service
 *
 * Safe, typed, predictable wrapper around browser localStorage.
 * Handles availability checks, JSON parsing, quota limits, schema/envelope versioning,
 * and structured diagnostic warnings. Never throws and never logs PII.
 */

import { logger } from './logger';

export const STORAGE_KEYS = {
  AUTH_USER: 'terroir_trail_user',
  USER_DATA_PREFIX: 'terroir_data_',
  FAVORITES: 'terroir_trail_favorites',
  CHAUFFEUR_BOOKINGS: 'terroir_chauffeur_bookings',
  TASTING_BOOKINGS: 'terroir_trail_bookings',
  PRODUCER_OVERRIDES: 'terroir_trail_producer_overrides',
  PRODUCER_REGISTRATIONS: 'terroir_trail_producer_registrations',
  FIRST_RUN_WELCOME: 'terroir_trail_first_run_welcome_v1',
} as const;

export interface StorageOptions {
  scope?: string;
  storage?: Storage | null;
}

export interface ReadStorageOptions<T> extends StorageOptions {
  version?: number;
  validator?: (data: unknown) => boolean;
  migrate?: (data: unknown, version?: number) => T;
}

export interface WriteStorageOptions extends StorageOptions {
  version?: number;
}

export interface StorageEnvelope<T = unknown> {
  version: number;
  data: T;
}

/**
 * Detects whether a parsed value is wrapped in a versioned envelope { version: number, data: ... }.
 */
export function isStorageEnvelope(val: unknown): val is StorageEnvelope {
  return (
    typeof val === 'object' &&
    val !== null &&
    !Array.isArray(val) &&
    typeof (val as any).version === 'number' &&
    'data' in (val as any)
  );
}

/**
 * Safely resolves the active localStorage instance without throwing.
 */
export function getLocalStorage(override?: Storage | null): Storage | null {
  if (override !== undefined) {
    return override;
  }
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
      return (globalThis as any).localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Returns true if localStorage is available and writable.
 */
export function isStorageAvailable(override?: Storage | null): boolean {
  try {
    const storage = getLocalStorage(override);
    if (!storage) return false;
    const testKey = '__terroir_storage_test__';
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely reads and parses a JSON value from storage.
 * Handles both legacy plain JSON and { version, data } envelopes.
 * Falls back safely without throwing and logs structured non-PII diagnostics on error.
 */
export function readStorage<T>(
  key: string,
  fallbackValue: T,
  options?: ReadStorageOptions<T>
): T {
  const scope = options?.scope || 'Storage';
  const storage = getLocalStorage(options?.storage);

  if (!storage) {
    return fallbackValue;
  }

  let raw: string | null = null;
  try {
    raw = storage.getItem(key);
  } catch {
    logger.warn(scope, 'storage_read_failed', {
      key,
      errorType: 'access_error',
    });
    return fallbackValue;
  }

  if (raw === null || raw === undefined || raw === '') {
    return fallbackValue;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    logger.warn(scope, 'storage_parse_failed', {
      key,
      errorType: 'syntax_error',
    });
    return fallbackValue;
  }

  let data: unknown = parsed;
  let version: number | undefined = undefined;

  if (isStorageEnvelope(parsed)) {
    data = parsed.data;
    version = parsed.version;
  }

  if (options?.migrate) {
    try {
      data = options.migrate(data, version);
    } catch {
      logger.warn(scope, 'storage_migration_failed', {
        key,
        errorType: 'migration_error',
      });
      return fallbackValue;
    }
  }

  if (options?.validator && !options.validator(data)) {
    logger.warn(scope, 'storage_validation_failed', {
      key,
      errorType: 'validation_error',
    });
    return fallbackValue;
  }

  return data as T;
}

/**
 * Safely writes a JSON value to storage.
 * Optionally wraps in a { version, data } envelope if version is specified.
 * Catches quota and write errors without throwing.
 */
export function writeStorage<T>(
  key: string,
  value: T,
  options?: WriteStorageOptions
): boolean {
  const scope = options?.scope || 'Storage';
  const storage = getLocalStorage(options?.storage);

  if (!storage) {
    logger.warn(scope, 'storage_unavailable', {
      key,
      errorType: 'storage_unavailable',
    });
    return false;
  }

  try {
    let payload: string;
    if (typeof options?.version === 'number') {
      const envelope: StorageEnvelope<T> = {
        version: options.version,
        data: value,
      };
      payload = JSON.stringify(envelope);
    } else {
      payload = JSON.stringify(value);
    }
    storage.setItem(key, payload);
    return true;
  } catch (err: any) {
    const isQuota =
      err?.name === 'QuotaExceededError' ||
      err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err?.code === 22 ||
      err?.code === 1014;

    logger.warn(scope, 'storage_write_failed', {
      key,
      errorType: isQuota ? 'quota_exceeded' : 'write_error',
    });
    return false;
  }
}

/**
 * Safely removes a key from storage without throwing.
 */
export function removeStorage(
  key: string,
  options?: StorageOptions
): boolean {
  const scope = options?.scope || 'Storage';
  const storage = getLocalStorage(options?.storage);

  if (!storage) {
    return false;
  }

  try {
    storage.removeItem(key);
    return true;
  } catch {
    logger.warn(scope, 'storage_remove_failed', {
      key,
      errorType: 'remove_error',
    });
    return false;
  }
}
