/**
 * TerroirTrail Structured Frontend Logger
 *
 * Lightweight internal logger with structured formatting, level gating,
 * safe error normalization, and strict PII/secret redaction.
 */

export interface NormalizedError {
  name: string;
  message: string;
  code?: string | number;
  stack?: string;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Sensitive keys whose values must always be redacted
const SENSITIVE_KEY_REGEX =
  /^(password|passwd|secret|token|id_?token|auth|authorization|bearer|credential|api[-_]?key|email|phone|telephone|mobile|tel|vat|tax_?id|tasting[-_]?note|personal[-_]?note|notes)$/i;

const SENSITIVE_KEY_SUBSTRING_REGEX =
  /password|passwd|secret|token|credential|authorization|bearer|email|phone|telephone|mobile|tel|vat|note/i;

// Regex patterns to detect and mask secrets, tokens, emails within strings
const BEARER_PATTERN = /(?:Bearer\s+)[a-zA-Z0-9._~+/-]+=*/gi;
const JWT_PATTERN = /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]+/g;
const STRIPE_SECRET_PATTERN = /(?:sk_live_|sk_test_|rk_live_|rk_test_|cs_live_|cs_test_|pi_[a-zA-Z0-9]+_secret_)[a-zA-Z0-9]+/g;
const EMAIL_PATTERN = /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g;
const URL_PASSWORD_PATTERN = /(?:password|pwd|pass)=([^&]+)/gi;

/**
 * Redacts known sensitive patterns (tokens, secrets, credentials, emails) from string values.
 */
export function sanitizeString(val: string): string {
  if (typeof val !== 'string') return String(val);
  return val
    .replace(BEARER_PATTERN, 'Bearer [REDACTED]')
    .replace(JWT_PATTERN, '[REDACTED_TOKEN]')
    .replace(STRIPE_SECRET_PATTERN, '[REDACTED_SECRET]')
    .replace(EMAIL_PATTERN, '[REDACTED_EMAIL]')
    .replace(URL_PASSWORD_PATTERN, 'password=[REDACTED]');
}

let forcedProductionMode: boolean | null = null;

/**
 * Checks if the current runtime environment is production.
 * Respects testing overrides when configured.
 */
export function isProduction(): boolean {
  if (forcedProductionMode !== null) {
    return forcedProductionMode;
  }
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (typeof import.meta.env.PROD === 'boolean') {
      return import.meta.env.PROD;
    }
    if (import.meta.env.MODE === 'production') {
      return true;
    }
  }
  const proc = (globalThis as any).process;
  if (proc?.env?.NODE_ENV === 'production') {
    return true;
  }
  return false;
}

/**
 * Testing helper to simulate development or production environments.
 */
export function setProductionModeForTesting(isProd: boolean | null): void {
  forcedProductionMode = isProd;
}

/**
 * Safely extracts diagnostic information from an unknown caught value
 * without exposing arbitrary nested objects, credentials, or PII.
 */
export function normalizeError(error: unknown, isDev = !isProduction()): NormalizedError {
  if (error === null || error === undefined) {
    return { name: 'Error', message: 'Unknown error' };
  }

  if (error instanceof Error) {
    const norm: NormalizedError = {
      name: error.name || 'Error',
      message: sanitizeString(error.message || 'Error occurred'),
    };
    if ('code' in error && (typeof (error as any).code === 'string' || typeof (error as any).code === 'number')) {
      norm.code = (error as any).code;
    }
    if (isDev && error.stack) {
      norm.stack = sanitizeString(error.stack);
    }
    return norm;
  }

  if (typeof error === 'string') {
    return {
      name: 'Error',
      message: sanitizeString(error),
    };
  }

  if (typeof error === 'object') {
    const errObj = error as Record<string, unknown>;
    const name = typeof errObj.name === 'string' ? errObj.name : (error.constructor?.name || 'ObjectError');
    const message = typeof errObj.message === 'string'
      ? sanitizeString(errObj.message)
      : 'Non-error object thrown';
    const norm: NormalizedError = {
      name,
      message,
    };
    if (typeof errObj.code === 'string' || typeof errObj.code === 'number') {
      norm.code = errObj.code;
    }
    return norm;
  }

  return {
    name: 'Error',
    message: sanitizeString(String(error)),
  };
}

/**
 * Recursively sanitizes a metadata object, masking sensitive keys,
 * redacting tokens, and guarding against blind serialization of arbitrary complex objects.
 */
export function sanitizeMetadata(
  data?: Record<string, unknown>,
  depth = 0
): Record<string, unknown> | undefined {
  if (!data || typeof data !== 'object') return undefined;
  if (depth > 2) return { _truncated: '[MaxDepthReached]' };

  const sanitized: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(data)) {
    if (SENSITIVE_KEY_REGEX.test(key) || SENSITIVE_KEY_SUBSTRING_REGEX.test(key)) {
      sanitized[key] = '[REDACTED]';
      continue;
    }

    if (val === null || val === undefined) {
      sanitized[key] = val;
    } else if (typeof val === 'string') {
      sanitized[key] = sanitizeString(val);
    } else if (typeof val === 'number' || typeof val === 'boolean') {
      sanitized[key] = val;
    } else if (val instanceof Error) {
      sanitized[key] = normalizeError(val);
    } else if (Array.isArray(val)) {
      sanitized[key] = val.slice(0, 10).map((item) => {
        if (typeof item === 'string') return sanitizeString(item);
        if (typeof item === 'number' || typeof item === 'boolean') return item;
        if (item && typeof item === 'object') {
          return sanitizeMetadata(item as Record<string, unknown>, depth + 1);
        }
        return String(item);
      });
    } else if (typeof val === 'object') {
      const proto = Object.getPrototypeOf(val);
      const isPlainObject = proto === null || proto === Object.prototype;
      if (!isPlainObject) {
        const ctorName = val.constructor?.name || 'Object';
        if (ctorName === 'Event' || ctorName.endsWith('Event')) {
          sanitized[key] = { type: (val as any).type };
        } else {
          sanitized[key] = `[${ctorName}]`;
        }
      } else {
        sanitized[key] = sanitizeMetadata(val as Record<string, unknown>, depth + 1);
      }
    } else {
      sanitized[key] = typeof val;
    }
  }

  return sanitized;
}

/**
 * Structured logger API for TerroirTrail.
 */
export const logger = {
  debug(scope: string, event: string, metadata?: Record<string, unknown>): void {
    if (isProduction()) return;
    const cleanMeta = sanitizeMetadata(metadata);
    if (cleanMeta && Object.keys(cleanMeta).length > 0) {
      console.debug(`[${scope}] ${event}`, cleanMeta);
    } else {
      console.debug(`[${scope}] ${event}`);
    }
  },

  info(scope: string, event: string, metadata?: Record<string, unknown>): void {
    if (isProduction()) return;
    const cleanMeta = sanitizeMetadata(metadata);
    if (cleanMeta && Object.keys(cleanMeta).length > 0) {
      console.info(`[${scope}] ${event}`, cleanMeta);
    } else {
      console.info(`[${scope}] ${event}`);
    }
  },

  warn(scope: string, event: string, metadata?: Record<string, unknown>): void {
    const cleanMeta = sanitizeMetadata(metadata);
    if (cleanMeta && Object.keys(cleanMeta).length > 0) {
      console.warn(`[${scope}] ${event}`, cleanMeta);
    } else {
      console.warn(`[${scope}] ${event}`);
    }
  },

  error(scope: string, event: string, error?: unknown, metadata?: Record<string, unknown>): void {
    const cleanMeta = sanitizeMetadata(metadata);
    const hasMeta = cleanMeta && Object.keys(cleanMeta).length > 0;

    if (error !== undefined) {
      const safeError = normalizeError(error);
      if (hasMeta) {
        console.error(`[${scope}] ${event}`, safeError, cleanMeta);
      } else {
        console.error(`[${scope}] ${event}`, safeError);
      }
    } else {
      if (hasMeta) {
        console.error(`[${scope}] ${event}`, cleanMeta);
      } else {
        console.error(`[${scope}] ${event}`);
      }
    }
  },
};
