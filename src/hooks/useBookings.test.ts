import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockAuth, mockDb, mockCollection, mockQuery, mockWhere, mockOrderBy, mockOnSnapshot } = vi.hoisted(() => {
  const mockAuth = {
    currentUser: null as null | { uid: string },
  };
  const mockDb = { name: 'mockFirestore' };
  const mockCollection = vi.fn((_db: any, name: string) => ({ name }));
  const mockWhere = vi.fn((field: string, op: string, val: any) => ({ field, op, val }));
  const mockOrderBy = vi.fn((field: string, dir: string) => ({ field, dir }));
  const mockQuery = vi.fn((col: any, ...clauses: any[]) => ({ col, clauses }));
  const mockOnSnapshot = vi.fn();

  return {
    mockAuth,
    mockDb,
    mockCollection,
    mockQuery,
    mockWhere,
    mockOrderBy,
    mockOnSnapshot,
  };
});

vi.mock('firebase/firestore', () => ({
  collection: mockCollection,
  query: mockQuery,
  where: mockWhere,
  orderBy: mockOrderBy,
  onSnapshot: mockOnSnapshot,
}));

vi.mock('../services/firebase', () => ({
  isFirebaseConfigured: true,
  auth: mockAuth,
  db: mockDb,
  getLocalBookings: vi.fn(() => []),
  createTastingBooking: vi.fn(),
  cancelTastingBookingByTraveler: vi.fn(),
  updateBookingStatusByHost: vi.fn(),
}));

// Test harness for hook without needing full DOM
let stateMap: any[] = [];
let stateIndex = 0;
let effectCleanups: Array<(() => void) | void> = [];

vi.mock('react', () => {
  return {
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
  };
});

import { useBookings } from './useBookings';

describe('useBookings hook logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stateMap = [];
    stateIndex = 0;
    effectCleanups = [];
    mockAuth.currentUser = { uid: 'user_123' };
  });

  it('subscribes with scoped query where userId == auth.currentUser.uid and orders by createdAt desc', () => {
    useBookings({ userId: 'user_123' });

    expect(mockWhere).toHaveBeenCalledWith('userId', '==', 'user_123');
    expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
    expect(mockOnSnapshot).toHaveBeenCalledTimes(1);
  });

  it('subscribes with scoped query where producerId == trustedProducerId and orders by createdAt desc', () => {
    useBookings({ trustedProducerId: 'domaine-paterianakis' });

    expect(mockWhere).toHaveBeenCalledWith('producerId', '==', 'domaine-paterianakis');
    expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
    expect(mockOnSnapshot).toHaveBeenCalledTimes(1);
  });

  it('empty snapshot clears bookings state', () => {
    let snapshotCallback: ((snap: any) => void) | null = null;
    mockOnSnapshot.mockImplementation((_q: any, cb: any) => {
      snapshotCallback = cb;
      return vi.fn();
    });

    const hookResult = useBookings({ userId: 'user_123' });

    expect(snapshotCallback).not.toBeNull();
    // Simulate empty Firestore snapshot
    snapshotCallback!({
      forEach: vi.fn(), // no documents
    });

    // The state for travelerBookings should be updated to empty []
    expect(stateMap[0]).toEqual([]);
  });

  it('does not attach Firestore listener for demo traveler without cloud auth', () => {
    mockAuth.currentUser = null;
    useBookings({ userId: 'user_elena' });

    expect(mockOnSnapshot).not.toHaveBeenCalled();
  });

  it('rejects host status transition back to pending', async () => {
    const hookResult = useBookings({ trustedProducerId: 'domaine-paterianakis' });

    await expect(hookResult.setHostStatus('book_1', 'pending' as any)).rejects.toThrow(
      'cannot transition back to pending'
    );
  });
});
