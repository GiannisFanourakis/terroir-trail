import { describe, expect, it, vi, beforeEach } from 'vitest';

// Lightweight React mock harness
let stateMap: any[] = [];
let stateIndex = 0;

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
  useEffect: vi.fn(),
  useCallback: (fn: any) => fn,
}));

// Mock services/firebase as unconfigured
vi.mock('../services/firebase', () => ({
  auth: null,
  isFirebaseConfigured: false,
  googleProvider: {},
  appleProvider: {},
  saveUserProfileToCloud: vi.fn(),
  fetchUserProfileFromCloud: vi.fn(),
  fetchUserProducerOwnership: vi.fn(),
  saveProducerRegistrationToCloud: vi.fn(),
  sendPasswordReset: vi.fn(),
  subscribeToCloudUserProfile: vi.fn(() => () => {}),
}));

vi.mock('firebase/auth', () => ({
  signInWithPopup: vi.fn(),
  signInWithCredential: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(() => () => {}),
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
    vi.clearAllMocks();
  });

  it('fails closed with configuration error on email login when Firebase is not configured', async () => {
    const hook = useAuth();

    await expect(
      hook.loginWithEmail('traveler@example.com', 'secret123')
    ).rejects.toThrow('FIREBASE_NOT_CONFIGURED');

    // stateMap: [0] user, [1] isLoading, [2] authError
    expect(stateMap[2]).toContain('Authentication service is not configured');
    expect(stateMap[0]).toBeNull();
  });

  it('fails closed with configuration error on account signup when Firebase is not configured', async () => {
    const hook = useAuth();

    await expect(
      hook.signupWithEmail('New Traveler', 'new@example.com', 'secret123')
    ).rejects.toThrow('FIREBASE_NOT_CONFIGURED');

    expect(stateMap[2]).toContain('Authentication service is not configured');
    expect(stateMap[0]).toBeNull();
  });

  it('fails closed with configuration error on producer login when Firebase is not configured', async () => {
    const hook = useAuth();

    await expect(
      hook.loginAsProducer('winery@estate.gr', 'secret123', 'winery-1', 'Boutique Winery')
    ).rejects.toThrow('FIREBASE_NOT_CONFIGURED');

    expect(stateMap[2]).toContain('Authentication service is not configured');
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

    expect(stateMap[2]).toContain('Authentication service is not configured');
    expect(stateMap[0]).toBeNull();
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

  it('preserves intentional demo traveler action loginAsDemo', () => {
    const hook = useAuth();

    const profile = hook.loginAsDemo('giannis');

    expect(profile).not.toBeNull();
    expect(profile.name).toBe('John Smith');
    expect(profile.isProducer).toBeFalsy();
    expect(stateMap[0]?.name).toBe('John Smith');
  });

  it('preserves intentional demo producer action loginAsDemoProducer', () => {
    const hook = useAuth();

    const profile = hook.loginAsDemoProducer('paterianakis');

    expect(profile).not.toBeNull();
    expect(profile.role).toBe('producer');
    expect(profile.isProducer).toBe(true);
    expect(stateMap[0]?.role).toBe('producer');
  });
});
