import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockAuth, mockDb, mockSetDoc, mockOnSnapshot } = vi.hoisted(() => ({
  mockAuth: {
    currentUser: { uid: 'traveler-a' } as null | { uid: string },
    authStateReady: vi.fn().mockResolvedValue(undefined),
  },
  mockDb: { name: 'mock-db' },
  mockSetDoc: vi.fn().mockResolvedValue(undefined),
  mockOnSnapshot: vi.fn(),
}));

vi.mock('./firebase', () => ({
  auth: mockAuth,
  db: mockDb,
  isFirebaseConfigured: true,
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db: any, collectionName: string, id: string) => ({ collectionName, id })),
  setDoc: mockSetDoc,
  onSnapshot: mockOnSnapshot,
}));

import {
  normalizeFavoriteProducerIds,
  saveTravelerFavoritesToCloud,
  subscribeToTravelerFavorites,
} from './travelerFavoritesCloud';

describe('travelerFavoritesCloud', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.currentUser = { uid: 'traveler-a' };
    mockAuth.authStateReady.mockResolvedValue(undefined);
    mockSetDoc.mockResolvedValue(undefined);
  });

  it('normalizes, deduplicates and bounds saved producer IDs', () => {
    const noisy = [' producer-a ', 'producer-a', '', 42, ...Array.from({ length: 600 }, (_, index) => `p-${index}`)];
    const normalized = normalizeFavoriteProducerIds(noisy);

    expect(normalized[0]).toBe('producer-a');
    expect(new Set(normalized).size).toBe(normalized.length);
    expect(normalized.length).toBe(500);
  });

  it('writes only to the currently authenticated traveler profile', async () => {
    await saveTravelerFavoritesToCloud('traveler-a', [' producer-a ', 'producer-a', 'producer-b']);

    expect(mockSetDoc).toHaveBeenCalledTimes(1);
    expect(mockSetDoc.mock.calls[0][0]).toEqual({ collectionName: 'users', id: 'traveler-a' });
    expect(mockSetDoc.mock.calls[0][1].favoriteProducerIds).toEqual(['producer-a', 'producer-b']);
    expect(mockSetDoc.mock.calls[0][2]).toEqual({ merge: true });

    await expect(saveTravelerFavoritesToCloud('traveler-b', ['producer-b']))
      .rejects.toThrow('signed-in account changed');
  });

  it('distinguishes an absent cloud favorites field from an intentionally empty list', () => {
    const updates: Array<string[] | null> = [];
    mockOnSnapshot.mockImplementationOnce((_ref: any, success: (snapshot: any) => void) => {
      success({ exists: () => true, data: () => ({ name: 'Traveler A' }) });
      return () => {};
    });
    subscribeToTravelerFavorites('traveler-a', value => updates.push(value));
    expect(updates).toEqual([null]);

    mockOnSnapshot.mockImplementationOnce((_ref: any, success: (snapshot: any) => void) => {
      success({ exists: () => true, data: () => ({ favoriteProducerIds: [] }) });
      return () => {};
    });
    subscribeToTravelerFavorites('traveler-a', value => updates.push(value));
    expect(updates).toEqual([null, []]);
  });
});
