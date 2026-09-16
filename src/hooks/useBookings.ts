import { useState, useEffect, useCallback } from 'react';
import { TastingBooking, BookingStatus } from '../types/booking';
import { 
  getLocalBookings, 
  createTastingBooking, 
  cancelTastingBookingByTraveler,
  updateBookingStatusByHost,
  isFirebaseConfigured,
  auth,
  db 
} from '../services/firebase';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';

export interface UseBookingsOptions {
  userId?: string;
  /** Trusted listing IDs resolved by the account-capabilities API. */
  trustedProducerIds?: string[];
  /** @deprecated Compatibility for older callers. */
  trustedProducerId?: string;
}

export const useBookings = (
  userIdOrOptions?: string | UseBookingsOptions,
  maybeProducerId?: string
) => {
  const options: UseBookingsOptions =
    typeof userIdOrOptions === 'object' && userIdOrOptions !== null
      ? userIdOrOptions
      : { userId: userIdOrOptions, trustedProducerId: maybeProducerId };

  const { userId } = options;
  const trustedProducerIds = Array.from(new Set(
    (options.trustedProducerIds?.length
      ? options.trustedProducerIds
      : options.trustedProducerId
        ? [options.trustedProducerId]
        : [])
      .filter(Boolean)
  ));
  const trustedProducerIdsKey = trustedProducerIds.slice().sort().join('|');

  const [travelerBookings, setTravelerBookings] = useState<TastingBooking[]>(() => {
    const all = getLocalBookings();
    return userId ? all.filter((b) => b.userId === userId) : all;
  });

  const [hostBookings, setHostBookings] = useState<TastingBooking[]>(() => {
    const all = getLocalBookings();
    const trusted = new Set(trustedProducerIds);
    return trusted.size ? all.filter((b) => trusted.has(b.producerId)) : [];
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 1. Scoped Traveler Bookings Query
  useEffect(() => {
    if (!isFirebaseConfigured || !db || !userId) {
      if (userId?.startsWith('user_')) {
        const local = getLocalBookings().filter((b) => b.userId === userId);
        setTravelerBookings(local);
      }
      return;
    }

    if (auth?.currentUser && auth.currentUser.uid === userId) {
      try {
        const travelerQuery = query(
          collection(db, 'bookings'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(
          travelerQuery,
          (snapshot) => {
            const list: TastingBooking[] = [];
            snapshot.forEach((docSnap) => list.push(docSnap.data() as TastingBooking));
            setTravelerBookings(list);
          },
          (error) => console.warn('Firestore traveler bookings snapshot error:', error)
        );
        return () => unsubscribe();
      } catch (e) {
        console.warn('Could not establish traveler bookings query listener:', e);
      }
    }
  }, [userId]);

  // 2. One scoped listener per explicitly assigned producer. This avoids using
  // broad collection reads and supports one account managing multiple listings.
  useEffect(() => {
    if (trustedProducerIds.length === 0) {
      setHostBookings([]);
      return;
    }

    if (!isFirebaseConfigured || !db) {
      const trusted = new Set(trustedProducerIds);
      setHostBookings(getLocalBookings().filter((b) => trusted.has(b.producerId)));
      return;
    }

    if (!auth?.currentUser) return;

    const bookingsByProducer = new Map<string, TastingBooking[]>();
    const publish = () => {
      const merged = [...bookingsByProducer.values()].flat();
      merged.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      setHostBookings(merged);
    };

    const unsubscribers = trustedProducerIds.map((producerId) => {
      const hostQuery = query(
        collection(db!, 'bookings'),
        where('producerId', '==', producerId),
        orderBy('createdAt', 'desc')
      );
      return onSnapshot(
        hostQuery,
        (snapshot) => {
          const list: TastingBooking[] = [];
          snapshot.forEach((docSnap) => list.push(docSnap.data() as TastingBooking));
          bookingsByProducer.set(producerId, list);
          publish();
        },
        (error) => console.warn(`Firestore host bookings snapshot error for ${producerId}:`, error)
      );
    });

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [trustedProducerIdsKey]);

  const bookTasting = useCallback(
    async (
      bookingData: Omit<TastingBooking, 'id' | 'createdAt' | 'status'>
    ): Promise<TastingBooking> => {
      setIsLoading(true);
      try {
        const created = await createTastingBooking(bookingData);
        setTravelerBookings((prev) => [created, ...prev.filter((b) => b.id !== created.id)]);
        return created;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const cancelBooking = useCallback(
    async (bookingId: string) => {
      await cancelTastingBookingByTraveler(bookingId);
      setTravelerBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' as const } : b))
      );
    },
    []
  );

  const setHostStatus = useCallback(
    async (bookingId: string, status: BookingStatus) => {
      if (status === 'pending') {
        throw new Error('Invalid host status transition: cannot transition back to pending.');
      }
      await updateBookingStatusByHost(bookingId, status);
      setHostBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                status,
                ...(status === 'confirmed' ? { confirmedAt: new Date().toISOString() } : {}),
              }
            : b
        )
      );
    },
    []
  );

  return {
    travelerBookings,
    userBookings: travelerBookings,
    hostBookings,
    bookings: hostBookings,
    getProducerBookings: (prodId: string) => hostBookings.filter((b) => b.producerId === prodId),
    bookTasting,
    cancelBooking,
    setHostStatus,
    setStatus: setHostStatus,
    isLoading,
  };
};
