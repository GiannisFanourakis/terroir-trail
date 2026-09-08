import { useState, useEffect, useCallback } from 'react';
import { TastingBooking, BookingStatus } from '../types/booking';
import { 
  getLocalBookings, 
  createTastingBooking, 
  updateBookingStatus,
  isFirebaseConfigured,
  db 
} from '../services/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

export const useBookings = (userId?: string) => {
  const [bookings, setBookings] = useState<TastingBooking[]>(() => getLocalBookings());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync with Cloud Firestore if available, otherwise listen to local storage changes
  useEffect(() => {
    if (isFirebaseConfigured && db) {
      try {
        const bookingsQuery = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(
          bookingsQuery,
          (snapshot) => {
            const list: TastingBooking[] = [];
            snapshot.forEach((docSnap) => {
              list.push(docSnap.data() as TastingBooking);
            });
            if (list.length > 0) {
              setBookings(list);
            }
          },
          (error) => {
            console.warn('Firestore bookings snapshot error, relying on local state:', error);
          }
        );
        return () => unsubscribe();
      } catch (e) {
        console.warn('Could not establish Firestore bookings listener:', e);
      }
    }
  }, []);

  // Filter bookings for the active traveler
  const userBookings = bookings.filter((b) => !userId || b.userId === userId);

  // Filter bookings for a specific winery/brewery
  const getProducerBookings = useCallback(
    (producerId: string) => bookings.filter((b) => b.producerId === producerId),
    [bookings]
  );

  // Create new reservation
  const bookTasting = useCallback(
    async (
      bookingData: Omit<TastingBooking, 'id' | 'createdAt' | 'status'>
    ): Promise<TastingBooking> => {
      setIsLoading(true);
      try {
        const created = await createTastingBooking(bookingData);
        setBookings((prev) => [created, ...prev.filter((b) => b.id !== created.id)]);
        return created;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Update status (e.g. Host approves or declines)
  const setStatus = useCallback(
    async (bookingId: string, status: BookingStatus) => {
      await updateBookingStatus(bookingId, status);
      setBookings((prev) =>
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
    bookings,
    userBookings,
    getProducerBookings,
    bookTasting,
    setStatus,
    isLoading,
  };
};
