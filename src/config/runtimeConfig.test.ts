import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  getRawEnv,
  getFirebaseConfig,
  checkIsFirebaseConfigured,
  getSupabaseConfig,
  checkIsSupabaseConfigured,
  getApiConfig,
  isExplorerPassPurchasesEnabled,
  isTripOptimizationEnabled,
  getAdvertisingConfig,
  isAdvertisingEnabled,
  getPublicAppUrl,
  getRuntimeDiagnostics,
  logRuntimeDiagnosticsOnce,
  _resetDiagnosticsLoggedForTesting,
  runtimeConfig,
} from './runtimeConfig';
import { logger } from '../services/logger';

describe('runtimeConfig - Centralized Configuration Discipline', () => {
  let warnSpy: any;

  beforeEach(() => {
    _resetDiagnosticsLoggedForTesting();
    warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    _resetDiagnosticsLoggedForTesting();
    vi.restoreAllMocks();
  });

  describe('getRawEnv', () => {
    it('reads and trims values from customEnv dictionary', () => {
      const custom = { VITE_CUSTOM_KEY: '  hello-world  ' };
      expect(getRawEnv('VITE_CUSTOM_KEY', custom)).toBe('hello-world');
    });

    it('returns empty string when key is missing or undefined', () => {
      const custom = { VITE_OTHER: 'value' };
      expect(getRawEnv('VITE_MISSING', custom)).toBe('');
    });
  });

  describe('Firebase configuration', () => {
    it('evaluates to configured when apiKey, authDomain, and projectId are present', () => {
      const env = {
        VITE_FIREBASE_API_KEY: 'mock-api-key',
        VITE_FIREBASE_AUTH_DOMAIN: 'terroir-trail.firebaseapp.com',
        VITE_FIREBASE_PROJECT_ID: 'terroir-trail',
        VITE_FIREBASE_STORAGE_BUCKET: 'terroir-trail.appspot.com',
        VITE_FIREBASE_MESSAGING_SENDER_ID: '1234567890',
        VITE_FIREBASE_APP_ID: '1:1234567890:web:abcdef',
      };

      const cfg = getFirebaseConfig(env);
      expect(cfg.apiKey).toBe('mock-api-key');
      expect(cfg.authDomain).toBe('terroir-trail.firebaseapp.com');
      expect(cfg.projectId).toBe('terroir-trail');
      expect(checkIsFirebaseConfigured(env)).toBe(true);
    });

    it('falls back to FIREBASE_PROJECT_ID if VITE_FIREBASE_PROJECT_ID is empty', () => {
      const env = {
        VITE_FIREBASE_API_KEY: 'mock-key',
        VITE_FIREBASE_AUTH_DOMAIN: 'mock-domain',
        FIREBASE_PROJECT_ID: 'fallback-project',
      };
      const cfg = getFirebaseConfig(env);
      expect(cfg.projectId).toBe('fallback-project');
      expect(checkIsFirebaseConfigured(env)).toBe(true);
    });

    it('evaluates to not configured when apiKey is missing', () => {
      const env = {
        VITE_FIREBASE_AUTH_DOMAIN: 'terroir-trail.firebaseapp.com',
        VITE_FIREBASE_PROJECT_ID: 'terroir-trail',
      };
      expect(checkIsFirebaseConfigured(env)).toBe(false);
    });

    it('evaluates to not configured when authDomain is missing', () => {
      const env = {
        VITE_FIREBASE_API_KEY: 'mock-api-key',
        VITE_FIREBASE_PROJECT_ID: 'terroir-trail',
      };
      expect(checkIsFirebaseConfigured(env)).toBe(false);
    });

    it('evaluates to not configured when projectId is missing', () => {
      const env = {
        VITE_FIREBASE_API_KEY: 'mock-api-key',
        VITE_FIREBASE_AUTH_DOMAIN: 'terroir-trail.firebaseapp.com',
      };
      expect(checkIsFirebaseConfigured(env)).toBe(false);
    });

    it('evaluates to not configured when completely empty', () => {
      expect(checkIsFirebaseConfigured({})).toBe(false);
    });
  });

  describe('Supabase configuration', () => {
    it('evaluates to configured when URL and anonKey are valid HTTP and non-placeholder', () => {
      const env = {
        VITE_SUPABASE_URL: 'https://eoenugkkzmzsrzclvdhl.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'mock-anon-key',
      };
      const cfg = getSupabaseConfig(env);
      expect(cfg.url).toBe('https://eoenugkkzmzsrzclvdhl.supabase.co');
      expect(cfg.anonKey).toBe('mock-anon-key');
      expect(checkIsSupabaseConfigured(env)).toBe(true);
    });

    it('evaluates to not configured when URL is missing', () => {
      const env = {
        VITE_SUPABASE_ANON_KEY: 'mock-anon-key',
      };
      expect(checkIsSupabaseConfigured(env)).toBe(false);
    });

    it('evaluates to not configured when anonKey is missing', () => {
      const env = {
        VITE_SUPABASE_URL: 'https://eoenugkkzmzsrzclvdhl.supabase.co',
      };
      expect(checkIsSupabaseConfigured(env)).toBe(false);
    });

    it('evaluates to not configured if URL contains template "your-project"', () => {
      const env = {
        VITE_SUPABASE_URL: 'https://your-project.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'mock-anon-key',
      };
      expect(checkIsSupabaseConfigured(env)).toBe(false);
    });

    it('evaluates to not configured if URL does not start with http', () => {
      const env = {
        VITE_SUPABASE_URL: 'ftp://supabase.co',
        VITE_SUPABASE_ANON_KEY: 'mock-anon-key',
      };
      expect(checkIsSupabaseConfigured(env)).toBe(false);
    });
  });

  describe('Explorer Pass purchase feature flag (strict boolean)', () => {
    it('evaluates strictly "true" to true', () => {
      expect(
        isExplorerPassPurchasesEnabled({
          VITE_ENABLE_EXPLORER_PASS_PURCHASES: 'true',
        })
      ).toBe(true);
    });

    it('evaluates "TRUE" to false', () => {
      expect(
        isExplorerPassPurchasesEnabled({
          VITE_ENABLE_EXPLORER_PASS_PURCHASES: 'TRUE',
        })
      ).toBe(false);
    });

    it('evaluates "1" to false', () => {
      expect(
        isExplorerPassPurchasesEnabled({
          VITE_ENABLE_EXPLORER_PASS_PURCHASES: '1',
        })
      ).toBe(false);
    });

    it('evaluates "false" to false', () => {
      expect(
        isExplorerPassPurchasesEnabled({
          VITE_ENABLE_EXPLORER_PASS_PURCHASES: 'false',
        })
      ).toBe(false);
    });

    it('evaluates "yes" to false', () => {
      expect(
        isExplorerPassPurchasesEnabled({
          VITE_ENABLE_EXPLORER_PASS_PURCHASES: 'yes',
        })
      ).toBe(false);
    });

    it('evaluates undefined or empty string to false', () => {
      expect(isExplorerPassPurchasesEnabled({})).toBe(false);
      expect(
        isExplorerPassPurchasesEnabled({
          VITE_ENABLE_EXPLORER_PASS_PURCHASES: '',
        })
      ).toBe(false);
    });
  });

  describe('Trip optimization rollout gate', () => {
    it('fails closed unless explicitly set to true', () => {
      expect(isTripOptimizationEnabled({})).toBe(false);
      expect(
        isTripOptimizationEnabled({ VITE_ENABLE_TRIP_OPTIMIZATION: 'false' })
      ).toBe(false);
      expect(
        isTripOptimizationEnabled({ VITE_ENABLE_TRIP_OPTIMIZATION: 'TRUE' })
      ).toBe(false);
      expect(
        isTripOptimizationEnabled({ VITE_ENABLE_TRIP_OPTIMIZATION: 'true' })
      ).toBe(true);
    });
  });

  describe('Advertising launch gate', () => {
    it('stays disabled when publisher and slot IDs are configured without the gate', () => {
      const config = getAdvertisingConfig({
        VITE_ADSENSE_CLIENT_ID: 'ca-pub-configured',
        VITE_ADSENSE_SLOT_ID: 'configured-slot',
      });

      expect(config).toEqual({
        enabled: false,
        client: 'ca-pub-configured',
        slot: 'configured-slot',
      });
    });

    it('accepts only the strict string "true" as an advertising activation', () => {
      expect(isAdvertisingEnabled({ VITE_ENABLE_ADVERTISING: 'true' })).toBe(
        true
      );
      expect(isAdvertisingEnabled({ VITE_ENABLE_ADVERTISING: 'TRUE' })).toBe(
        false
      );
      expect(isAdvertisingEnabled({ VITE_ENABLE_ADVERTISING: '1' })).toBe(
        false
      );
      expect(isAdvertisingEnabled({})).toBe(false);
    });
  });

  describe('URL normalization', () => {
    it('strips accidental trailing slashes from API base URL', () => {
      expect(
        getApiConfig({ VITE_API_BASE_URL: 'https://api.terroir-trail.com/' })
          .baseUrl
      ).toBe('https://api.terroir-trail.com');
      expect(
        getApiConfig({ VITE_API_BASE_URL: 'https://api.terroir-trail.com///' })
          .baseUrl
      ).toBe('https://api.terroir-trail.com');
    });

    it('returns empty string if API base URL is unset', () => {
      expect(getApiConfig({}).baseUrl).toBe('');
    });

    it('strips trailing slashes from public app URL and preserves path', () => {
      expect(
        getPublicAppUrl({
          VITE_PUBLIC_APP_URL: 'https://app.terroir-trail.com/',
        })
      ).toBe('https://app.terroir-trail.com');
      expect(
        getPublicAppUrl({
          VITE_PUBLIC_APP_URL: 'https://app.terroir-trail.com/path/',
        })
      ).toBe('https://app.terroir-trail.com/path');
    });

    it('defaults public app URL to https://terroir-trail.web.app without trailing slash', () => {
      expect(getPublicAppUrl({})).toBe('https://terroir-trail.web.app');
      expect(getPublicAppUrl({ VITE_PUBLIC_APP_URL: '' })).toBe(
        'https://terroir-trail.web.app'
      );
    });
  });

  describe('Runtime Diagnostics summary object', () => {
    it('returns only status booleans and never exposes sensitive credentials', () => {
      const env = {
        VITE_FIREBASE_API_KEY: 'sensitive-firebase-key',
        VITE_FIREBASE_AUTH_DOMAIN: 'app.firebaseapp.com',
        VITE_FIREBASE_PROJECT_ID: 'app-project',
        VITE_SUPABASE_URL: 'https://secret-project.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'secret-anon-jwt',
        VITE_API_BASE_URL: 'https://gateway.terroir.com',
        VITE_ENABLE_EXPLORER_PASS_PURCHASES: 'true',
        VITE_ENABLE_ADVERTISING: 'true',
        VITE_PUBLIC_APP_URL: 'https://custom.app.com',
      };

      const diag = getRuntimeDiagnostics(env);

      expect(diag).toEqual({
        firebaseConfigured: true,
        supabaseConfigured: true,
        explorerPassPurchasesEnabled: true,
        advertisingEnabled: true,
        apiBaseConfigured: true,
        publicAppUrlConfigured: true,
      });

      // Confirm no string values or sensitive secrets leaked
      const serialized = JSON.stringify(diag);
      expect(serialized).not.toContain('sensitive-firebase-key');
      expect(serialized).not.toContain('secret-anon-jwt');
      expect(serialized).not.toContain('secret-project');
    });

    it('reflects unconfigured state correctly', () => {
      const diag = getRuntimeDiagnostics({});
      expect(diag).toEqual({
        firebaseConfigured: false,
        supabaseConfigured: false,
        explorerPassPurchasesEnabled: false,
        advertisingEnabled: false,
        apiBaseConfigured: false,
        publicAppUrlConfigured: false,
      });
    });
  });

  describe('Partial configuration logging', () => {
    it('warns when Firebase has partial configuration', () => {
      const env = {
        VITE_FIREBASE_API_KEY: 'some-key',
        // missing authDomain and projectId
      };

      logRuntimeDiagnosticsOnce(env);
      expect(warnSpy).toHaveBeenCalledWith(
        'Config',
        'firebase_partial_configuration',
        { configured: false }
      );
    });

    it('warns when Supabase has partial configuration', () => {
      const env = {
        VITE_SUPABASE_URL: 'https://eoenugkkzmzsrzclvdhl.supabase.co',
        // missing anonKey
      };

      logRuntimeDiagnosticsOnce(env);
      expect(warnSpy).toHaveBeenCalledWith(
        'Config',
        'supabase_partial_configuration',
        { configured: false }
      );
    });

    it('does not warn when services are completely unconfigured (clean demo mode)', () => {
      logRuntimeDiagnosticsOnce({});
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('does not warn when services are fully configured', () => {
      const env = {
        VITE_FIREBASE_API_KEY: 'key',
        VITE_FIREBASE_AUTH_DOMAIN: 'domain',
        VITE_FIREBASE_PROJECT_ID: 'project',
        VITE_SUPABASE_URL: 'https://test.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'anon-key',
      };

      logRuntimeDiagnosticsOnce(env);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('logs at most once (idempotent)', () => {
      const env = {
        VITE_FIREBASE_API_KEY: 'key-only',
      };

      logRuntimeDiagnosticsOnce(env);
      logRuntimeDiagnosticsOnce(env);
      expect(warnSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('runtimeConfig dynamic properties', () => {
    it('provides access to runtime configuration structures', () => {
      expect(runtimeConfig.firebase).toBeDefined();
      expect(runtimeConfig.supabase).toBeDefined();
      expect(runtimeConfig.api).toBeDefined();
      expect(typeof runtimeConfig.explorerPass.purchasesEnabled).toBe(
        'boolean'
      );
      expect(typeof runtimeConfig.advertising.enabled).toBe('boolean');
      expect(typeof runtimeConfig.advertising.client).toBe('string');
      expect(typeof runtimeConfig.advertising.slot).toBe('string');
      expect(typeof runtimeConfig.app.publicUrl).toBe('string');
    });
  });
});
