import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  readStorage,
  writeStorage,
  removeStorage,
  isStorageAvailable,
  isStorageEnvelope,
  STORAGE_KEYS,
} from './browserStorage';
import { logger } from './logger';

describe('browserStorage service', () => {
  let warnSpy: any;

  beforeEach(() => {
    warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createMockStorage = (initialState: Record<string, string> = {}) => {
    const store = new Map<string, string>(Object.entries(initialState));
    return {
      store,
      getItem: vi.fn((key: string) => store.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store.set(key, value);
      }),
      removeItem: vi.fn((key: string) => {
        store.delete(key);
      }),
      clear: vi.fn(() => {
        store.clear();
      }),
      length: store.size,
      key: vi.fn(() => null),
    } as unknown as Storage;
  };

  describe('isStorageAvailable', () => {
    it('returns true when storage read/write/remove succeeds', () => {
      const mockStorage = createMockStorage();
      expect(isStorageAvailable(mockStorage)).toBe(true);
    });

    it('returns false when storage is null or undefined', () => {
      expect(isStorageAvailable(null)).toBe(false);
    });

    it('returns false when storage throws on write (e.g. private browsing)', () => {
      const mockStorage = {
        setItem: () => {
          throw new Error('SecurityError: The operation is insecure.');
        },
        getItem: () => null,
        removeItem: () => {},
      } as unknown as Storage;
      expect(isStorageAvailable(mockStorage)).toBe(false);
    });
  });

  describe('readStorage', () => {
    it('returns parsed typed object on valid JSON', () => {
      const mockStorage = createMockStorage({
        test_key: JSON.stringify({ name: 'Assyrtiko', year: 2022 }),
      });
      const result = readStorage('test_key', { name: '', year: 0 }, { storage: mockStorage });
      expect(result).toEqual({ name: 'Assyrtiko', year: 2022 });
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('returns fallback value when key is missing without logging warnings', () => {
      const mockStorage = createMockStorage();
      const result = readStorage('missing_key', ['default'], { storage: mockStorage });
      expect(result).toEqual(['default']);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('handles malformed JSON by returning fallback and logging structured warning without leaking content', () => {
      const secretPii = 'traveler.private@example.com';
      const mockStorage = createMockStorage({
        user_key: `{"email": "${secretPii}", INVALID_JSON`,
      });

      const result = readStorage('user_key', null, {
        storage: mockStorage,
        scope: 'Auth',
      });

      expect(result).toBeNull();
      expect(warnSpy).toHaveBeenCalledWith('Auth', 'storage_parse_failed', {
        key: 'user_key',
        errorType: 'syntax_error',
      });

      // Confirm secret PII from malformed string is never passed to logger
      const loggedMetadata = JSON.stringify(warnSpy.mock.calls);
      expect(loggedMetadata).not.toContain(secretPii);
      expect(loggedMetadata).not.toContain('INVALID_JSON');
    });

    it('catches access errors if getItem throws and logs access_error', () => {
      const mockStorage = {
        getItem: () => {
          throw new Error('Access denied');
        },
        setItem: () => {},
        removeItem: () => {},
      } as unknown as Storage;

      const result = readStorage('protected_key', 'fallback', {
        storage: mockStorage,
        scope: 'Test',
      });

      expect(result).toBe('fallback');
      expect(warnSpy).toHaveBeenCalledWith('Test', 'storage_read_failed', {
        key: 'protected_key',
        errorType: 'access_error',
      });
    });

    it('validates parsed data with validator option', () => {
      const mockStorage = createMockStorage({
        list_key: JSON.stringify({ notAnArray: true }),
      });

      const result = readStorage('list_key', ['safe_default'], {
        storage: mockStorage,
        scope: 'ListFeature',
        validator: (data) => Array.isArray(data),
      });

      expect(result).toEqual(['safe_default']);
      expect(warnSpy).toHaveBeenCalledWith('ListFeature', 'storage_validation_failed', {
        key: 'list_key',
        errorType: 'validation_error',
      });
    });
  });

  describe('Legacy and Versioned Envelope Compatibility', () => {
    it('unpacks versioned { version, data } envelope seamlessly', () => {
      const envelope = {
        version: 1,
        data: { preferences: ['organic', 'natural'] },
      };
      const mockStorage = createMockStorage({
        prefs_key: JSON.stringify(envelope),
      });

      expect(isStorageEnvelope(envelope)).toBe(true);

      const result = readStorage('prefs_key', { preferences: [] }, { storage: mockStorage });
      expect(result).toEqual({ preferences: ['organic', 'natural'] });
    });

    it('reads legacy unversioned data without envelope seamlessly', () => {
      const legacyData = { preferences: ['oak-aged'] };
      const mockStorage = createMockStorage({
        prefs_key: JSON.stringify(legacyData),
      });

      expect(isStorageEnvelope(legacyData)).toBe(false);

      const result = readStorage('prefs_key', { preferences: [] }, { storage: mockStorage });
      expect(result).toEqual({ preferences: ['oak-aged'] });
    });

    it('supports lazy schema migration callback for upgrading legacy format', () => {
      const legacyData = { tags: 'dry, crisp' };
      const mockStorage = createMockStorage({
        wine_key: JSON.stringify(legacyData),
      });

      const migrated = readStorage(
        'wine_key',
        { tags: [] as string[] },
        {
          storage: mockStorage,
          migrate: (data: any, version) => {
            if (version === undefined && typeof data.tags === 'string') {
              return { tags: data.tags.split(', ') };
            }
            return data;
          },
        }
      );

      expect(migrated).toEqual({ tags: ['dry', 'crisp'] });
    });
  });

  describe('writeStorage', () => {
    it('writes plain JSON by default', () => {
      const mockStorage = createMockStorage();
      const success = writeStorage('favs', ['monteraponi', 'douloufakis'], { storage: mockStorage });

      expect(success).toBe(true);
      expect(mockStorage.getItem('favs')).toBe(JSON.stringify(['monteraponi', 'douloufakis']));
    });

    it('writes versioned envelope when version option is provided', () => {
      const mockStorage = createMockStorage();
      const success = writeStorage('profile', { id: 'u1' }, { storage: mockStorage, version: 1 });

      expect(success).toBe(true);
      const raw = mockStorage.getItem('profile');
      expect(raw).toBe(JSON.stringify({ version: 1, data: { id: 'u1' } }));
    });

    it('catches quota exceeded errors and logs structured warning without throwing', () => {
      const quotaError = new Error('Quota exceeded');
      quotaError.name = 'QuotaExceededError';
      (quotaError as any).code = 22;

      const mockStorage = {
        setItem: () => {
          throw quotaError;
        },
        getItem: () => null,
        removeItem: () => {},
      } as unknown as Storage;

      const success = writeStorage('large_item', { data: 'overflow' }, {
        storage: mockStorage,
        scope: 'TestQuota',
      });

      expect(success).toBe(false);
      expect(warnSpy).toHaveBeenCalledWith('TestQuota', 'storage_write_failed', {
        key: 'large_item',
        errorType: 'quota_exceeded',
      });
    });

    it('handles unavailable storage safely on write', () => {
      const success = writeStorage('key', { data: 1 }, { storage: null, scope: 'App' });
      expect(success).toBe(false);
      expect(warnSpy).toHaveBeenCalledWith('App', 'storage_unavailable', {
        key: 'key',
        errorType: 'storage_unavailable',
      });
    });
  });

  describe('removeStorage', () => {
    it('removes key cleanly and returns true', () => {
      const mockStorage = createMockStorage({ to_delete: '1' });
      const success = removeStorage('to_delete', { storage: mockStorage });

      expect(success).toBe(true);
      expect(mockStorage.getItem('to_delete')).toBeNull();
    });

    it('catches remove failure and logs warning without throwing', () => {
      const mockStorage = {
        removeItem: () => {
          throw new Error('Remove failed');
        },
        getItem: () => null,
        setItem: () => {},
      } as unknown as Storage;

      const success = removeStorage('stuck_key', { storage: mockStorage, scope: 'Cleanup' });
      expect(success).toBe(false);
      expect(warnSpy).toHaveBeenCalledWith('Cleanup', 'storage_remove_failed', {
        key: 'stuck_key',
        errorType: 'remove_error',
      });
    });
  });

  describe('Sensitive PII Protection', () => {
    it('never includes PII from stored objects in logger warnings', () => {
      const sensitiveProfile = {
        id: 'user_real_999',
        email: 'private.winemaker@domain.gr',
        phone: '+30 699 999 8888',
        vat: 'EL098765432',
        notes: 'Secret cellar recipe notes',
      };

      const failingStorage = {
        getItem: () => {
          throw new Error('SecurityError: Locked');
        },
        setItem: () => {
          throw new Error('Quota');
        },
        removeItem: () => {
          throw new Error('Remove error');
        },
      } as unknown as Storage;

      readStorage(STORAGE_KEYS.AUTH_USER, sensitiveProfile, {
        storage: failingStorage,
        scope: 'Auth',
      });

      writeStorage(STORAGE_KEYS.AUTH_USER, sensitiveProfile, {
        storage: failingStorage,
        scope: 'Auth',
      });

      removeStorage(STORAGE_KEYS.AUTH_USER, {
        storage: failingStorage,
        scope: 'Auth',
      });

      const loggedCalls = JSON.stringify(warnSpy.mock.calls);
      expect(loggedCalls).not.toContain('private.winemaker@domain.gr');
      expect(loggedCalls).not.toContain('+30 699 999 8888');
      expect(loggedCalls).not.toContain('EL098765432');
      expect(loggedCalls).not.toContain('Secret cellar recipe notes');
    });
  });

  describe('Auth Cache Path Regression Verification', () => {
    it('restores a valid existing terroir_trail_user record with visitedProducers and notes', () => {
      const existingUser = {
        id: 'traveler_real_01',
        email: 'real.traveler@terroir.com',
        displayName: 'Real Traveler',
        role: 'traveler',
        isProducer: false,
        visitedProducers: ['monteraponi-tuscany', 'douloufakis-winery'],
        personalNotes: { 'monteraponi-tuscany': 'Exceptional Sangiovese' },
      };

      const mockStorage = createMockStorage({
        [STORAGE_KEYS.AUTH_USER]: JSON.stringify(existingUser),
      });

      const restored = readStorage<any>(STORAGE_KEYS.AUTH_USER, null, {
        storage: mockStorage,
        scope: 'Auth',
      });

      expect(restored).not.toBeNull();
      expect(restored.id).toBe('traveler_real_01');
      expect(restored.visitedProducers).toEqual(['monteraponi-tuscany', 'douloufakis-winery']);
      expect(restored.personalNotes).toEqual({ 'monteraponi-tuscany': 'Exceptional Sangiovese' });
    });

    it('fails safely to null when stored auth state is malformed JSON without corrupting state', () => {
      const mockStorage = createMockStorage({
        [STORAGE_KEYS.AUTH_USER]: '{bad-json-syntax',
      });

      const restored = readStorage<any>(STORAGE_KEYS.AUTH_USER, null, {
        storage: mockStorage,
        scope: 'Auth',
      });

      expect(restored).toBeNull();
      // Does not delete malformed key automatically unless explicitly handled
      expect(mockStorage.getItem(STORAGE_KEYS.AUTH_USER)).toBe('{bad-json-syntax');
    });

    it('logout removes the auth cache from storage completely', () => {
      const mockStorage = createMockStorage({
        [STORAGE_KEYS.AUTH_USER]: JSON.stringify({ id: 'active_uid' }),
      });

      expect(mockStorage.getItem(STORAGE_KEYS.AUTH_USER)).not.toBeNull();

      removeStorage(STORAGE_KEYS.AUTH_USER, { storage: mockStorage, scope: 'Auth' });

      expect(mockStorage.getItem(STORAGE_KEYS.AUTH_USER)).toBeNull();
    });

    it('ensures unauthenticated or empty user state is not converted to demo identity', () => {
      const mockStorage = createMockStorage();

      const userState = readStorage<any>(STORAGE_KEYS.AUTH_USER, null, {
        storage: mockStorage,
        scope: 'Auth',
      });

      expect(userState).toBeNull();
      // Must not be converted to demo-traveler or demo-host
      expect(userState).not.toEqual(expect.objectContaining({ id: 'demo-traveler' }));
      expect(userState).not.toEqual(expect.objectContaining({ id: 'demo-host' }));
    });
  });

  describe('Feature Storage Recovery & Persistence Verification', () => {
    it('persists and restores favorites correctly', () => {
      const mockStorage = createMockStorage();
      const favs = ['monteraponi-tuscany', 'douloufakis-winery'];

      writeStorage(STORAGE_KEYS.FAVORITES, favs, { storage: mockStorage, scope: 'Favorites' });
      const restored = readStorage<string[]>(STORAGE_KEYS.FAVORITES, [], {
        storage: mockStorage,
        scope: 'Favorites',
        validator: (d) => Array.isArray(d),
      });

      expect(restored).toEqual(favs);
    });

    it('recovers favorites safely to empty array when storage is malformed', () => {
      const mockStorage = createMockStorage({
        [STORAGE_KEYS.FAVORITES]: '{corrupt-json',
      });

      const restored = readStorage<string[]>(STORAGE_KEYS.FAVORITES, [], {
        storage: mockStorage,
        scope: 'Favorites',
        validator: (d) => Array.isArray(d),
      });

      expect(restored).toEqual([]);
      expect(warnSpy).toHaveBeenCalledWith('Favorites', 'storage_parse_failed', {
        key: STORAGE_KEYS.FAVORITES,
        errorType: 'syntax_error',
      });
    });

    it('recovers chauffeur bookings safely to empty array when storage is malformed', () => {
      const mockStorage = createMockStorage({
        [STORAGE_KEYS.CHAUFFEUR_BOOKINGS]: 'not valid json',
      });

      const restored = readStorage<any[]>(STORAGE_KEYS.CHAUFFEUR_BOOKINGS, [], {
        storage: mockStorage,
        scope: 'App',
        validator: (d) => Array.isArray(d),
      });

      expect(restored).toEqual([]);
      expect(warnSpy).toHaveBeenCalledWith('App', 'storage_parse_failed', {
        key: STORAGE_KEYS.CHAUFFEUR_BOOKINGS,
        errorType: 'syntax_error',
      });
    });

    it('recovers producer overrides safely to empty record when storage is malformed', () => {
      const mockStorage = createMockStorage({
        [STORAGE_KEYS.PRODUCER_OVERRIDES]: '[invalid-overrides-format]',
      });

      const restored = readStorage<Record<string, any>>(STORAGE_KEYS.PRODUCER_OVERRIDES, {}, {
        storage: mockStorage,
        scope: 'Firebase',
        validator: (d) => typeof d === 'object' && d !== null && !Array.isArray(d),
      });

      expect(restored).toEqual({});
      expect(warnSpy).toHaveBeenCalledWith('Firebase', 'storage_parse_failed', {
        key: STORAGE_KEYS.PRODUCER_OVERRIDES,
        errorType: 'syntax_error',
      });
    });

    it('recovers producer registrations safely to empty record when storage is malformed', () => {
      const mockStorage = createMockStorage({
        [STORAGE_KEYS.PRODUCER_REGISTRATIONS]: 'malformed{',
      });

      const restored = readStorage<Record<string, any>>(STORAGE_KEYS.PRODUCER_REGISTRATIONS, {}, {
        storage: mockStorage,
        scope: 'Firebase',
        validator: (d) => typeof d === 'object' && d !== null && !Array.isArray(d),
      });

      expect(restored).toEqual({});
      expect(warnSpy).toHaveBeenCalledWith('Firebase', 'storage_parse_failed', {
        key: STORAGE_KEYS.PRODUCER_REGISTRATIONS,
        errorType: 'syntax_error',
      });
    });
  });
});
