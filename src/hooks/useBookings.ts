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

  const { userId, trustedProducerId } = options;

  const [travelerBookings, setTravelerBookings] = useState<TastingBooking[]>(() => {
    const all = getLocalBookings();
    return userId ? all.filter((b) => b.userId === userId) : all;
  });

  const [hostBookings, setHostBookings] = useState<TastingBooking[]>(() => {
    const all = getLocalBookings();
    return trustedProducerId ? all.filter((b) => b.producerId === trustedProducerId) : [];
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 1. Scoped Traveler Bookings Query (where("userId", "==", uid), orderBy("createdAt", "desc"))
  useEffect(() => {
    if (!isFirebaseConfigured || !db || !userId) {
      if (userId?.startsWith('user_')) {
        // Local demo traveler
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
            snapshot.forEach((docSnap) => {
              list.push(docSnap.data() as TastingBooking);
            });
            // Empty snapshots must clear stale local/seed data
            setTravelerBookings(list);
          },
          (error) => {
            console.warn('Firestore traveler bookings snapshot error:', error);
          }
        );
        return () => unsubscribe();
      } catch (e) {
        console.warn('Could not establish traveler bookings query listener:', e);
      }
    }
  }, [userId]);

  // 2. Scoped Host Bookings Query (where("producerId", "==", trustedProducerId), orderBy("createdAt", "desc"))
  useEffect(() => {
    if (!isFirebaseConfigured || !db || !trustedProducerId) {
      if (trustedProducerId) {
        // Local demo host
        const local = getLocalBookings().filter((b) => b.producerId === trustedProducerId);
        setHostBookings(local);
      }
      return;
    }

    if (auth?.currentUser) {
      try {
        const hostQuery = query(
          collection(db, 'bookings'),
          where('producerId', '==', trustedProducerId),
          orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(
          hostQuery,
          (snapshot) => {
            const list: TastingBooking[] = [];
            snapshot.forEach((docSnap) => {
              list.push(docSnap.data() as TastingBooking);
            });
            // Empty snapshots must clear stale local/seed data
            setHostBookings(list);
          },
          (error) => {
            console.warn('Firestore host bookings snapshot error:', error);
          }
        );
        return () => unsubscribe();
      } catch (e) {
        console.warn('Could not establish host bookings query listener:', e);
      }
    }
  }, [trustedProducerId]);

  // Create new reservation (derives userId inside service from auth.currentUser.uid)
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

  // Traveler cancellation: pending -> cancelled only
  const cancelBooking = useCallback(
    async (bookingId: string) => {
      await cancelTastingBookingByTraveler(bookingId);
      setTravelerBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' as const } : b))
      );
    },
    []
  );

  // Host status transition: pending -> confirmed/cancelled, confirmed -> completed/cancelled
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
