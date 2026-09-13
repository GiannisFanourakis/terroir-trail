import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  logger,
  normalizeError,
  sanitizeString,
  sanitizeMetadata,
  setProductionModeForTesting,
} from './logger';

describe('Logger Foundation', () => {
  let debugSpy: any;
  let infoSpy: any;
  let warnSpy: any;
  let errorSpy: any;

  beforeEach(() => {
    setProductionModeForTesting(null);
    debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    setProductionModeForTesting(null);
    vi.restoreAllMocks();
  });

  describe('sanitizeString', () => {
    it('redacts Bearer authorization headers', () => {
      const sanitized = sanitizeString('Failed with Bearer secret-auth-token-12345');
      expect(sanitized).toBe('Failed with Bearer [REDACTED]');
    });

    it('redacts JWT tokens', () => {
      const sampleJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.doNotLeakSignature';
      const sanitized = sanitizeString(`User token: ${sampleJwt}`);
      expect(sanitized).toBe('User token: [REDACTED_TOKEN]');
    });

    it('redacts Stripe secret keys and client secrets', () => {
      const sanitized = sanitizeString('Payment failed with sk_live_51AbcDefGh1234567890');
      expect(sanitized).toBe('Payment failed with [REDACTED_SECRET]');
    });

    it('redacts emails from strings', () => {
      const sanitized = sanitizeString('User traveler@example.com cannot login');
      expect(sanitized).toBe('User [REDACTED_EMAIL] cannot login');
    });

    it('redacts password parameters', () => {
      const sanitized = sanitizeString('URL: https://api.terroir.com?password=supersecret&other=1');
      expect(sanitized).toContain('password=[REDACTED]');
    });
  });

  describe('normalizeError', () => {
    it('normalizes standard Error objects and extracts code if present', () => {
      const err = new Error('Database query timed out');
      (err as any).code = 'TIMEOUT_408';

      const normalized = normalizeError(err, false);
      expect(normalized.name).toBe('Error');
      expect(normalized.message).toBe('Database query timed out');
      expect(normalized.code).toBe('TIMEOUT_408');
      expect(normalized.stack).toBeUndefined();
    });

    it('includes sanitized stack trace only in development mode', () => {
      const err = new Error('Render crash at test@example.com');
      err.stack = 'Error: Render crash at test@example.com\n at Component (file.tsx:10:5)';

      const devNormalized = normalizeError(err, true);
      expect(devNormalized.stack).toBeDefined();
      expect(devNormalized.stack).toContain('[REDACTED_EMAIL]');

      const prodNormalized = normalizeError(err, false);
      expect(prodNormalized.stack).toBeUndefined();
    });

    it('safely normalizes string errors', () => {
      const normalized = normalizeError('Plain string error message');
      expect(normalized).toEqual({
        name: 'Error',
        message: 'Plain string error message',
      });
    });

    it('safely normalizes unknown non-Error objects without exposing arbitrary nested properties', () => {
      const complexObject = {
        name: 'CustomException',
        message: 'Custom error occurred',
        code: 404,
        secretInternalState: { token: '12345' },
      };

      const normalized = normalizeError(complexObject, false);
      expect(normalized.name).toBe('CustomException');
      expect(normalized.message).toBe('Custom error occurred');
      expect(normalized.code).toBe(404);
      expect((normalized as any).secretInternalState).toBeUndefined();
    });

    it('handles null and undefined gracefully without throwing', () => {
      expect(normalizeError(null, false)).toEqual({
        name: 'Error',
        message: 'Unknown error',
      });
      expect(normalizeError(undefined, false)).toEqual({
        name: 'Error',
        message: 'Unknown error',
      });
    });
  });

  describe('sanitizeMetadata', () => {
    it('redacts sensitive keys including password, token, email, vat, and notes', () => {
      const meta = {
        safeField: 'active',
        password: 'my-password',
        id_token: 'xyz-token',
        userEmail: 'traveler@test.com',
        vat: 'EL123456789',
        personalNotes: 'Loved the Assyrtiko vintage 2021',
      };

      const sanitized = sanitizeMetadata(meta);
      expect(sanitized?.safeField).toBe('active');
      expect(sanitized?.password).toBe('[REDACTED]');
      expect(sanitized?.id_token).toBe('[REDACTED]');
      expect(sanitized?.userEmail).toBe('[REDACTED]');
      expect(sanitized?.vat).toBe('[REDACTED]');
      expect(sanitized?.personalNotes).toBe('[REDACTED]');
    });

    it('does not blindly serialize arbitrary class instances', () => {
      class SupabaseResponseMock {
        public data = [{ id: 'prod-1' }];
      }

      const meta = {
        response: new SupabaseResponseMock(),
      };

      const sanitized = sanitizeMetadata(meta);
      expect(sanitized?.response).toBe('[SupabaseResponseMock]');
    });
  });

  describe('Development vs Production Logging Behavior', () => {
    it('outputs debug and info logs in development mode', () => {
      setProductionModeForTesting(false);

      logger.debug('TestScope', 'debug_event', { step: 1 });
      expect(debugSpy).toHaveBeenCalledWith('[TestScope] debug_event', { step: 1 });

      logger.info('TestScope', 'info_event');
      expect(infoSpy).toHaveBeenCalledWith('[TestScope] info_event');
    });

    it('suppresses debug and info logs in production mode', () => {
      setProductionModeForTesting(true);

      logger.debug('TestScope', 'debug_event', { step: 1 });
      expect(debugSpy).not.toHaveBeenCalled();

      logger.info('TestScope', 'info_event');
      expect(infoSpy).not.toHaveBeenCalled();
    });

    it('keeps warn and error logs visible in production mode', () => {
      setProductionModeForTesting(true);

      logger.warn('Catalogue', 'fetch_warning', { reason: 'network timeout' });
      expect(warnSpy).toHaveBeenCalledWith('[Catalogue] fetch_warning', { reason: 'network timeout' });

      const err = new Error('Connection refused');
      logger.error('Firebase', 'init_error', err, { context: 'auth' });
      expect(errorSpy).toHaveBeenCalledWith(
        '[Firebase] init_error',
        expect.objectContaining({ name: 'Error', message: 'Connection refused' }),
        { context: 'auth' }
      );
    });
  });
});
