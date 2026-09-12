import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockAuth,
  mockDb,
  mockSetDoc,
  mockUpdateDoc,
  mockGetDoc,
  mockGetDocs,
  mockDoc,
  mockCollection,
  mockQuery,
  mockWhere,
  mockOrderBy,
} = vi.hoisted(() => {
  const mockSetDoc = vi.fn();
  const mockUpdateDoc = vi.fn();
  const mockGetDoc = vi.fn();
  const mockGetDocs = vi.fn();
  const mockDoc = vi.fn((_db: any, col: string, id: string) => ({ path: `${col}/${id}`, id }));
  const mockCollection = vi.fn((_db: any, name: string) => ({ name }));
  const mockQuery = vi.fn((...args: any[]) => ({ type: 'query', args }));
  const mockWhere = vi.fn((field: string, op: string, val: any) => ({ field, op, val }));
  const mockOrderBy = vi.fn((field: string, dir: string) => ({ field, dir }));

  const mockAuth = {
    currentUser: null as null | { uid: string; email: string },
    authStateReady: vi.fn().mockResolvedValue(undefined),
  };

  const mockDb = { name: 'mockFirestoreDb' };

  return {
    mockAuth,
    mockDb,
    mockSetDoc,
    mockUpdateDoc,
    mockGetDoc,
    mockGetDocs,
    mockDoc,
    mockCollection,
    mockQuery,
    mockWhere,
    mockOrderBy,
  };
});

const storage = new Map<string, string>();
const mockLocalStorage = {
  getItem: vi.fn((k: string) => storage.get(k) ?? null),
  setItem: vi.fn((k: string, v: string) => { storage.set(k, v); }),
  removeItem: vi.fn((k: string) => { storage.delete(k); }),
  clear: vi.fn(() => { storage.clear(); }),
  length: 0,
  key: vi.fn(() => null),
};
vi.stubGlobal('localStorage', mockLocalStorage);

vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-api-key');
vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'test.firebaseapp.com');
vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'test-project');

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({ name: '[DEFAULT]' })),
  getApps: vi.fn(() => [{ name: '[DEFAULT]' }]),
  getApp: vi.fn(() => ({ name: '[DEFAULT]' })),
}));

vi.mock('firebase/auth', () => {
  class MockGoogleAuthProvider {
    setCustomParameters = vi.fn();
  }
  class MockOAuthProvider {
    addScope = vi.fn();
  }
  return {
    getAuth: vi.fn(() => mockAuth),
    initializeAuth: vi.fn(() => mockAuth),
    indexedDBLocalPersistence: {},
    signInWithPopup: vi.fn(),
    GoogleAuthProvider: MockGoogleAuthProvider,
    OAuthProvider: MockOAuthProvider,
    sendPasswordResetEmail: vi.fn(),
  };
});

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => mockDb),
  initializeFirestore: vi.fn(() => mockDb),
  persistentLocalCache: vi.fn(),
  doc: mockDoc,
  collection: mockCollection,
  query: mockQuery,
  where: mockWhere,
  orderBy: mockOrderBy,
  setDoc: mockSetDoc,
  updateDoc: mockUpdateDoc,
  getDoc: mockGetDoc,
  getDocs: mockGetDocs,
  onSnapshot: vi.fn(),
}));

import {
  createTastingBooking,
  cancelTastingBookingByTraveler,
  updateBookingStatusByHost,
  saveUserProfileToCloud,
  saveProducerOverride,
  saveProducerRegistrationToCloud,
  fetchUserProducerOwnership,
} from './firebase';

describe('Firebase Service Security & Data Isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storage.clear();
    mockAuth.currentUser = { uid: 'uid_alice', email: 'alice@example.com' };
    mockSetDoc.mockResolvedValue(undefined);
    mockUpdateDoc.mockResolvedValue(undefined);
    mockGetDoc.mockResolvedValue({ exists: () => false, data: () => ({}) });
    mockGetDocs.mockResolvedValue({ empty: true, docs: [] });
  });

  describe('createTastingBooking', () => {
    it('derives userId from authenticated currentUser and ignores client-provided userId', async () => {
      const spoofedInput: any = {
        userId: 'attacker_uid',
        producerId: 'winery-1',
        producerName: 'Test Winery',
        producerCategory: 'winery',
        producerLocation: 'Crete',
        userName: 'Alice',
        userEmail: 'alice@example.com',
        userPhone: '+30 690 000 0000',
        date: '2026-06-01',
        timeSlot: '11:00 AM',
        experienceId: 'tasting_1',
        experienceTitle: 'Wine Tasting',
        pricePerPerson: 25,
        guestsCount: 2,
        totalEstimated: 50,
      };

      const result = await createTastingBooking(spoofedInput);

      expect(result.userId).toBe('uid_alice');
      expect(result.status).toBe('pending');
      expect(mockSetDoc).toHaveBeenCalledTimes(1);
      const [, savedPayload] = mockSetDoc.mock.calls[0];
      expect(savedPayload.userId).toBe('uid_alice');
      expect(savedPayload.status).toBe('pending');
    });

    it('strips lifecycle fields (confirmedAt, completedAt) on creation', async () => {
      const maliciousInput: any = {
        producerId: 'winery-1',
        producerName: 'Test Winery',
        producerCategory: 'winery',
        producerLocation: 'Crete',
        userName: 'Alice',
        userEmail: 'alice@example.com',
        userPhone: '+30 690 000 0000',
        date: '2026-06-01',
        timeSlot: '11:00 AM',
        experienceId: 'tasting_1',
        experienceTitle: 'Wine Tasting',
        pricePerPerson: 25,
        guestsCount: 2,
        totalEstimated: 50,
        confirmedAt: '2026-05-01T00:00:00Z',
        completedAt: '2026-05-01T00:00:00Z',
      };

      const result = await createTastingBooking(maliciousInput);

      expect(result.confirmedAt).toBeUndefined();
      expect((result as any).completedAt).toBeUndefined();
      const [, savedPayload] = mockSetDoc.mock.calls[0];
      expect(savedPayload.confirmedAt).toBeUndefined();
      expect(savedPayload.completedAt).toBeUndefined();
    });

    it('surfaces Firestore write errors rather than silently succeeding', async () => {
      mockSetDoc.mockRejectedValueOnce(new Error('PERMISSION_DENIED'));

      const input: any = {
        producerId: 'winery-1',
        producerName: 'Test Winery',
        producerCategory: 'winery',
        producerLocation: 'Crete',
        userName: 'Alice',
        userEmail: 'alice@example.com',
        userPhone: '+30 690 000 0000',
        date: '2026-06-01',
        timeSlot: '11:00 AM',
        experienceId: 'tasting_1',
        experienceTitle: 'Wine Tasting',
        pricePerPerson: 25,
        guestsCount: 2,
        totalEstimated: 50,
      };

      await expect(createTastingBooking(input)).rejects.toThrow('PERMISSION_DENIED');
    });

    it('rejects unauthenticated booking creation in cloud mode', async () => {
      mockAuth.currentUser = null;

      const input: any = {
        producerId: 'winery-1',
        producerName: 'Test Winery',
        producerCategory: 'winery',
        producerLocation: 'Crete',
        userName: 'Guest',
        userEmail: 'guest@example.com',
        userPhone: '+30 690 000 0000',
        date: '2026-06-01',
        timeSlot: '11:00 AM',
        experienceId: 'tasting_1',
        experienceTitle: 'Wine Tasting',
        pricePerPerson: 25,
        guestsCount: 2,
        totalEstimated: 50,
      };

      await expect(createTastingBooking(input)).rejects.toThrow('Authentication required');
    });
  });

  describe('cancelTastingBookingByTraveler', () => {
    it('updates status to cancelled and surfaces errors if updateDoc fails', async () => {
      await cancelTastingBookingByTraveler('booking-123');

      expect(mockDoc).toHaveBeenCalledWith(mockDb, 'bookings', 'booking-123');
      expect(mockUpdateDoc).toHaveBeenCalledWith({ path: 'bookings/booking-123', id: 'booking-123' }, { status: 'cancelled' });

      mockUpdateDoc.mockRejectedValueOnce(new Error('PERMISSION_DENIED'));
      await expect(cancelTastingBookingByTraveler('booking-123')).rejects.toThrow('PERMISSION_DENIED');
    });
  });

  describe('updateBookingStatusByHost', () => {
    it('sets confirmed status with confirmedAt timestamp', async () => {
      await updateBookingStatusByHost('booking-123', 'confirmed');

      expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
      const [, updatePayload] = mockUpdateDoc.mock.calls[0];
      expect(updatePayload.status).toBe('confirmed');
      expect(updatePayload.confirmedAt).toBeDefined();
    });

    it('surfaces errors when updateDoc fails', async () => {
      mockUpdateDoc.mockRejectedValueOnce(new Error('PERMISSION_DENIED'));
      await expect(updateBookingStatusByHost('booking-123', 'completed')).rejects.toThrow('PERMISSION_DENIED');
    });
  });

  describe('saveUserProfileToCloud', () => {
    it('strips client attempts to escalate role, isProducer, claimedProducerId, and pass fields', async () => {
      const maliciousProfile: any = {
        id: 'uid_alice',
        name: 'Alice Traveler',
        role: 'producer',
        isProducer: true,
        claimedProducerId: 'domaine-paterianakis',
        producerName: 'Domaine Paterianakis',
        claimStatus: 'verified',
        taxDetails: { vatNumber: 'EL123456789' },
        hasExplorerPass: true,
        explorerPassId: 'fake-pass',
        explorerPassPlan: 'annual',
        explorerPassExpiresAt: '2099-01-01',
        personalNotes: { 'winery-1': 'Great wine!' },
      };

      await saveUserProfileToCloud(maliciousProfile);

      expect(mockSetDoc).toHaveBeenCalledTimes(1);
      const [, saved] = mockSetDoc.mock.calls[0];
      expect(saved.name).toBe('Alice Traveler');
      expect(saved.personalNotes).toEqual({ 'winery-1': 'Great wine!' });
      expect(saved.role).toBeUndefined();
      expect(saved.isProducer).toBeUndefined();
      expect(saved.claimedProducerId).toBeUndefined();
      expect(saved.producerName).toBeUndefined();
      expect(saved.claimStatus).toBeUndefined();
      expect(saved.taxDetails).toBeUndefined();
      expect(saved.hasExplorerPass).toBeUndefined();
      expect(saved.explorerPassId).toBeUndefined();
      expect(saved.explorerPassPlan).toBeUndefined();
      expect(saved.explorerPassExpiresAt).toBeUndefined();
    });
  });

  describe('saveProducerOverride', () => {
    it('strips isProTier and preserves ordinary override data', async () => {
      const override: any = {
        producerId: 'winery-1',
        announcement: 'Harvest festival next week',
        isProTier: true,
      };

      await saveProducerOverride(override);

      expect(mockSetDoc).toHaveBeenCalledTimes(1);
      const [, saved] = mockSetDoc.mock.calls[0];
      expect(saved.producerId).toBe('winery-1');
      expect(saved.announcement).toBe('Harvest festival next week');
      expect(saved.isProTier).toBeUndefined();
    });

    it('does not write to Firestore for unauthenticated / demo users', async () => {
      mockAuth.currentUser = null;

      const override: any = {
        producerId: 'winery-demo',
        announcement: 'Local demo only',
      };

      await saveProducerOverride(override);

      expect(mockSetDoc).not.toHaveBeenCalled();
    });

    it('does not update local cache if Firestore write fails', async () => {
      mockSetDoc.mockRejectedValueOnce(new Error('PERMISSION_DENIED'));

      const override: any = {
        producerId: 'winery-fail',
        announcement: 'Should not persist locally on cloud failure',
      };

      await expect(saveProducerOverride(override)).rejects.toThrow('PERMISSION_DENIED');
      expect(storage.has('terroir_trail_producer_overrides')).toBe(false);
    });
  });

  describe('saveProducerRegistrationToCloud', () => {
    it('forces status to pending_verification and isVatVerified to false, stripping approval fields', async () => {
      const registration: any = {
        producerId: 'winery-1',
        producerName: 'Winery 1',
        userId: 'uid_alice',
        status: 'verified_active',
        isVatVerified: true,
        approvedAt: '2026-01-01T00:00:00Z',
        approvedBy: 'admin',
        legalBusinessName: 'Winery 1 LLC',
        vatNumber: 'EL999999999',
      };

      const saved = await saveProducerRegistrationToCloud(registration);

      expect(saved.status).toBe('pending_verification');
      expect(saved.isVatVerified).toBe(false);
      expect((saved as any).approvedAt).toBeUndefined();
      expect((saved as any).approvedBy).toBeUndefined();

      expect(mockSetDoc).toHaveBeenCalledTimes(1);
      const [, cloudPayload] = mockSetDoc.mock.calls[0];
      expect(cloudPayload.status).toBe('pending_verification');
      expect(cloudPayload.isVatVerified).toBe(false);
      expect(cloudPayload.approvedAt).toBeUndefined();
      expect(cloudPayload.approvedBy).toBeUndefined();
    });

    it('propagates Firestore errors on registration failure and does not update local cache', async () => {
      mockSetDoc.mockRejectedValueOnce(new Error('PERMISSION_DENIED'));

      const registration: any = {
        producerId: 'winery-fail',
        producerName: 'Winery Fail',
        userId: 'uid_alice',
        legalBusinessName: 'Winery Fail LLC',
        vatNumber: 'EL999999999',
      };

      await expect(saveProducerRegistrationToCloud(registration)).rejects.toThrow('PERMISSION_DENIED');
      expect(storage.has('terroir_trail_producer_registrations')).toBe(false);
    });
  });

  describe('fetchUserProducerOwnership', () => {
    it('queries producer_owners for active ownership of the current user', async () => {
      mockGetDocs.mockResolvedValueOnce({
        empty: false,
        docs: [{ data: () => ({ producerId: 'winery-1', ownerUid: 'uid_alice', status: 'active' }) }],
      });

      const ownership = await fetchUserProducerOwnership('uid_alice');

      expect(ownership).toEqual({ producerId: 'winery-1', ownerUid: 'uid_alice', status: 'active' });
      expect(mockWhere).toHaveBeenCalledWith('ownerUid', '==', 'uid_alice');
      expect(mockWhere).toHaveBeenCalledWith('status', '==', 'active');
    });

    it('returns null if no active ownership record exists', async () => {
      mockGetDocs.mockResolvedValueOnce({ empty: true, docs: [] });

      const ownership = await fetchUserProducerOwnership('uid_bob');

      expect(ownership).toBeNull();
    });
  });
});
