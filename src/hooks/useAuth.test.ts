import { describe, expect, it, vi, beforeEach } from 'vitest';

const { mockFirebaseState, authStateCallbacks } = vi.hoisted(() => {
  const authStateCallbacks: Array<(user: any) => Promise<void> | void> = [];
  const mockFirebaseState = {
    isConfigured: false,
    auth: null as any,
  };
  return { mockFirebaseState, authStateCallbacks };
});

// Lightweight React mock harness
let stateMap: any[] = [];
let stateIndex = 0;
let effectCleanups: Array<(() => void) | void> = [];

vi.mock('react', () => ({
  useState: (initial: any) => {
    const idx = stateIndex++;
    if (stateMap[idx] === undefined) {
      stateMap[idx] = typeof initial === 'function' ? initial() : initial;
    }
    const setState = (valOrFn: any) => {
      stateMap[idx] = typeof valOrFn === 'function' ? valOrFn(stateMap[idx]) : valOrFn;
    };
    return [stateMap[idx], setState];
  },
  useEffect: (effect: () => void | (() => void)) => {
    const cleanup = effect();
    if (cleanup) effectCleanups.push(cleanup);
  },
  useCallback: (fn: any) => fn,
  useRef: (initial: any) => ({ current: initial }),
}));

// Mock services/firebase as configurable
vi.mock('../services/firebase', () => ({
  get isFirebaseConfigured() {
    return mockFirebaseState.isConfigured;
  },
  get auth() {
    return mockFirebaseState.auth;
  },
  googleProvider: {},
  appleProvider: {},
  saveUserProfileToCloud: vi.fn(),
  fetchUserProfileFromCloud: vi.fn().mockResolvedValue(null),
  fetchUserProducerOwnership: vi.fn().mockResolvedValue(null),
  saveProducerRegistrationToCloud: vi.fn(),
  sendPasswordReset: vi.fn(),
  subscribeToCloudUserProfile: vi.fn(() => () => {}),
}));

vi.mock('firebase/auth', () => ({
  signInWithPopup: vi.fn(),
  signInWithCredential: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((_auth: any, callback: any) => {
    authStateCallbacks.push(callback);
    return () => {
      const idx = authStateCallbacks.indexOf(callback);
      if (idx !== -1) authStateCallbacks.splice(idx, 1);
    };
  }),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
  GoogleAuthProvider: { credential: vi.fn() },
  OAuthProvider: vi.fn(() => ({ credential: vi.fn() })),
}));

vi.mock('./useExplorerPass', () => ({
  useExplorerPass: vi.fn(() => ({ pass: null, refreshExplorerPass: vi.fn() })),
}));

const storage = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (k: string) => storage.get(k) ?? null,
  setItem: (k: string, v: string) => storage.set(k, v),
  removeItem: (k: string) => storage.delete(k),
  clear: () => storage.clear(),
});

import { useAuth } from './useAuth';

describe('useAuth - Production Safety & Fallback Removal', () => {
  beforeEach(() => {
    storage.clear();
    stateMap = [];
    stateIndex = 0;
    effectCleanups = [];
    authStateCallbacks.length = 0;
    mockFirebaseState.isConfigured = false;
    mockFirebaseState.auth = null;
    vi.clearAllMocks();
  });

  it('fails closed with configuration error on email login when Firebase is not configured', async () => {
    const hook = useAuth();

    await expect(
      hook.loginWithEmail('traveler@example.com', 'secret123')
    ).rejects.toThrow('FIREBASE_NOT_CONFIGURED');

    // stateMap: [0] user, [1] isLoading, [2] authError
    expect(stateMap[2]).toBe('Sign-in is temporarily unavailable. Please try again later.');
    expect(stateMap[2]).not.toContain('Firebase Console');
    expect(stateMap[2]).not.toContain('.env');
    expect(stateMap[2]).not.toContain('authorized domains');
    expect(stateMap[2]).not.toContain('Apple Developer');
    expect(stateMap[0]).toBeNull();
  });

  it('fails closed with configuration error on account signup when Firebase is not configured', async () => {
    const hook = useAuth();

    await expect(
      hook.signupWithEmail('New Traveler', 'new@example.com', 'secret123')
    ).rejects.toThrow('FIREBASE_NOT_CONFIGURED');

    expect(stateMap[2]).toBe('Sign-in is temporarily unavailable. Please try again later.');
    expect(stateMap[2]).not.toContain('Firebase Console');
    expect(stateMap[2]).not.toContain('.env');
    expect(stateMap[0]).toBeNull();
  });

  it('fails closed with configuration error on producer login when Firebase is not configured', async () => {
    const hook = useAuth();

    await expect(
      hook.loginAsProducer('winery@estate.gr', 'secret123', 'winery-1', 'Boutique Winery')
    ).rejects.toThrow('FIREBASE_NOT_CONFIGURED');

    expect(stateMap[2]).toBe('Sign-in is temporarily unavailable. Please try again later.');
    expect(stateMap[2]).not.toContain('Firebase Console');
    expect(stateMap[2]).not.toContain('.env');
    expect(stateMap[0]).toBeNull();
  });

  it('fails closed with configuration error on producer registration when Firebase is not configured', async () => {
    const hook = useAuth();

    await expect(
      hook.claimAndRegisterProducer(
        'winery-1',
        'Boutique Winery',
        'Host Name',
        'winery@estate.gr',
        'secret123'
      )
    ).rejects.toThrow('FIREBASE_NOT_CONFIGURED');

    expect(stateMap[2]).toBe('Sign-in is temporarily unavailable. Please try again later.');
    expect(stateMap[2]).not.toContain('Firebase Console');
    expect(stateMap[2]).not.toContain('.env');
    expect(stateMap[0]).toBeNull();
  });

  it('fails closed with sanitized error on password reset when Firebase is not configured', async () => {
    const hook = useAuth();

    await expect(
      hook.sendPasswordResetLink('traveler@example.com')
    ).rejects.toThrow('FIREBASE_NOT_CONFIGURED');

    expect(stateMap[2]).toBe('Sign-in is temporarily unavailable. Please try again later.');
    expect(stateMap[2]).not.toContain('Firebase Console');
    expect(stateMap[2]).not.toContain('.env');
  });

  it('fails closed when attempting Google sign in without Firebase configuration', async () => {
    const hook = useAuth();

    await expect(hook.loginWithGoogle()).rejects.toThrow('FIREBASE_NOT_CONFIGURED');
    expect(stateMap[0]).toBeNull();
  });

  it('fails closed when attempting Apple sign in without Firebase configuration', async () => {
    const hook = useAuth();

    await expect(hook.loginWithApple()).rejects.toThrow('FIREBASE_NOT_CONFIGURED');
    expect(stateMap[0]).toBeNull();
  });

  it('allows demo traveler fixture in unconfigured test/dev mode', () => {
    mockFirebaseState.isConfigured = false;
    const hook = useAuth();

    const profile = hook.loginAsDemo('giannis');

    expect(profile).not.toBeNull();
    expect(profile.name).toBe('John Smith');
    expect(profile.isProducer).toBeFalsy();
    expect(stateMap[0]?.name).toBe('John Smith');
  });

  it('allows demo producer fixture in unconfigured test/dev mode', () => {
    mockFirebaseState.isConfigured = false;
    const hook = useAuth();

    const profile = hook.loginAsDemoProducer('paterianakis');

    expect(profile).not.toBeNull();
    expect(profile.role).toBe('producer');
    expect(profile.isProducer).toBe(true);
    expect(stateMap[0]?.role).toBe('producer');
  });

  it('ordinary users cannot become producers from demo fixture state when Firebase is configured', () => {
    mockFirebaseState.isConfigured = true;
    const hook = useAuth();

    expect(() => hook.loginAsDemoProducer('paterianakis')).toThrow('DEMO_AUTH_DISABLED');
  });

  it('fails closed when attempting demo traveler login while Firebase is configured', () => {
    mockFirebaseState.isConfigured = true;
    const hook = useAuth();

    expect(() => hook.loginAsDemo('giannis')).toThrow('DEMO_AUTH_DISABLED');
  });
});

describe('useAuth - Firebase Session Reconciliation & Stale Account Invalidation', () => {
  beforeEach(() => {
    storage.clear();
    stateMap = [];
    stateIndex = 0;
    effectCleanups = [];
    authStateCallbacks.length = 0;
    mockFirebaseState.isConfigured = true;
    mockFirebaseState.auth = { currentUser: null };
    vi.clearAllMocks();
  });

  it('clears cached normal user when Firebase auth-state callback fires with null', async () => {
    const cachedUser = {
      id: 'cached_traveler_123',
      name: 'Cached Traveler',
      email: 'traveler@example.com',
      avatar: 'JS',
      hometown: 'Athens',
      role: 'traveler',
      isProducer: false,
      travelerType: 'culinary_nomad',
      visitedProducers: [],
      personalNotes: {},
      memberSince: '2026',
    };
    storage.set('terroir_trail_user', JSON.stringify(cachedUser));

    stateIndex = 0;
    let hook = useAuth();

    // Verify cached normal user initially exists
    expect(hook.user).not.toBeNull();
    expect(hook.user?.id).toBe('cached_traveler_123');
    expect(hook.isAuthenticated).toBe(true);
    expect(authStateCallbacks.length).toBeGreaterThan(0);

    // Fire Firebase auth-state callback with null
    const authCallback = authStateCallbacks[authStateCallbacks.length - 1];
    await authCallback(null);

    // Re-render hook
    stateIndex = 0;
    hook = useAuth();

    // Verify cached user state becomes null and isAuthenticated becomes false
    expect(hook.user).toBeNull();
    expect(hook.isAuthenticated).toBe(false);
    expect(storage.get('terroir_trail_user')).toBeUndefined();
  });

  it('clears cached stale producer and strips verified host status when Firebase fires with null', async () => {
    const cachedProducer = {
      id: 'stale_producer_999',
      name: 'Stale Host',
      email: 'host@stale-estate.gr',
      role: 'producer',
      isProducer: true,
      claimedProducerId: 'stale-winery',
      claimStatus: 'verified_host',
      visitedProducers: [],
      personalNotes: {},
      memberSince: '2025',
    };
    storage.set('terroir_trail_user', JSON.stringify(cachedProducer));

    stateIndex = 0;
    let hook = useAuth();

    expect(hook.user?.isProducer).toBe(true);
    expect(hook.isAuthenticated).toBe(true);

    // Fire Firebase auth-state callback with null
    const authCallback = authStateCallbacks[authStateCallbacks.length - 1];
    await authCallback(null);

    // Re-render hook
    stateIndex = 0;
    hook = useAuth();

    expect(hook.user).toBeNull();
    expect(hook.isAuthenticated).toBe(false);
    expect(storage.get('terroir_trail_user')).toBeUndefined();
  });

  it('restores valid Firebase user session normally when callback fires with a Firebase user', async () => {
    stateIndex = 0;
    let hook = useAuth();

    expect(hook.user).toBeNull();
    expect(hook.isAuthenticated).toBe(false);

    const mockFbUser = {
      uid: 'firebase_valid_uid_777',
      email: 'valid@example.com',
      displayName: 'Active Explorer',
      photoURL: 'https://example.com/avatar.jpg',
    };

    const authCallback = authStateCallbacks[authStateCallbacks.length - 1];
    await authCallback(mockFbUser);

    // Re-render hook
    stateIndex = 0;
    hook = useAuth();

    expect(hook.user).not.toBeNull();
    expect(hook.user?.id).toBe('firebase_valid_uid_777');
    expect(hook.user?.name).toBe('Active Explorer');
    expect(hook.user?.email).toBe('valid@example.com');
    expect(hook.isAuthenticated).toBe(true);
  });

  it('purges cached demo user state on initial load when ID exactly matches a known historical demo profile ID', () => {
    const demoCached = {
      id: 'user_giannis',
      name: 'John Smith',
      email: 'john.smith@example.com',
      role: 'traveler',
      isProducer: false,
    };
    storage.set('terroir_trail_user', JSON.stringify(demoCached));

    stateIndex = 0;
    const hook = useAuth();

    expect(hook.user).toBeNull();
    expect(hook.isAuthenticated).toBe(false);
    expect(storage.get('terroir_trail_user')).toBeUndefined();
  });

  it('preserves a legitimate cached user such as user_real_customer_123 intact even though ID begins with user_', () => {
    const legitUser = {
      id: 'user_real_customer_123',
      name: 'Real Customer',
      email: 'customer@example.com',
      avatar: 'JS',
      hometown: 'Heraklion',
      role: 'traveler',
      isProducer: false,
      visitedProducers: ['domaine-paterianakis'],
      personalNotes: {},
    };
    storage.set('terroir_trail_user', JSON.stringify(legitUser));

    stateIndex = 0;
    const hook = useAuth();

    expect(hook.user).not.toBeNull();
    expect(hook.user?.id).toBe('user_real_customer_123');
    expect(hook.user?.name).toBe('Real Customer');
    expect(hook.isAuthenticated).toBe(true);
    expect(storage.get('terroir_trail_user')).toBeDefined();
  });

  it('preserves an arbitrary demo_real_customer_123 user intact unless it matches a known demo fixture', () => {
    const legitPrefixedUser = {
      id: 'demo_real_customer_123',
      name: 'Prefix Customer',
      email: 'prefix.customer@example.com',
      avatar: 'JD',
      hometown: 'Chania',
      role: 'traveler',
      isProducer: false,
      visitedProducers: [],
      personalNotes: {},
    };
    storage.set('terroir_trail_user', JSON.stringify(legitPrefixedUser));

    stateIndex = 0;
    const hook = useAuth();

    expect(hook.user).not.toBeNull();
    expect(hook.user?.id).toBe('demo_real_customer_123');
    expect(hook.user?.name).toBe('Prefix Customer');
    expect(hook.isAuthenticated).toBe(true);
    expect(storage.get('terroir_trail_user')).toBeDefined();
  });

  it('clears user state on logout', async () => {
    mockFirebaseState.isConfigured = false;
    stateIndex = 0;
    const hook = useAuth();
    hook.loginAsDemo('giannis');
    expect(stateMap[0]).not.toBeNull();

    await hook.logout();
    expect(stateMap[0]).toBeNull();
  });
});
