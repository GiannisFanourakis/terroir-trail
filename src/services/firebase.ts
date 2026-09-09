import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider, Auth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  collection,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Firestore,
} from 'firebase/firestore';
import { TastingBooking, ProducerOverride } from '../types/booking';

const getEnv = (key: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  const globalProcess = (globalThis as any).process;
  if (globalProcess?.env?.[key]) {
    return globalProcess.env[key];
  }
  return '';
};

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID'),
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

// =========================================================
// SCENARIO A: Cloud Firestore Traveler Profile Sync (Phone <-> Laptop)
// =========================================================

/**
 * Saves visited stamps and personal tasting notes to Cloud Firestore
 */
export const syncUserProfileToCloud = async (
  userId: string,
  visitedProducers: string[],
  personalNotes: Record<string, string>
) => {
  if (!isFirebaseConfigured || !db || !userId) return;
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      {
        visitedProducers,
        personalNotes,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error syncing profile to Firestore:', error);
  }
};

/**
 * Real-time listener for remote user updates (e.g. stamped on phone, updates on laptop)
 */
export const subscribeToCloudUserProfile = (
  userId: string,
  onUpdate: (data: { visitedProducers?: string[]; personalNotes?: Record<string, string> }) => void
): (() => void) => {
  if (!isFirebaseConfigured || !db || !userId) {
    return () => {};
  }
  try {
    const userRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          onUpdate({
            visitedProducers: data.visitedProducers || [],
            personalNotes: data.personalNotes || {},
          });
        }
      },
      (error) => {
        console.warn('Firestore user profile snapshot listener error:', error);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.error('Failed to attach Firestore user profile listener:', error);
    return () => {};
  }
};

// =========================================================
// SCENARIO B: Tasting Bookings & Producer Portal Cloud Sync
// =========================================================

const BOOKINGS_LOCAL_KEY = 'terroir_trail_bookings';
const OVERRIDES_LOCAL_KEY = 'terroir_trail_producer_overrides';

// Seed authentic demo bookings so the portal immediately has realistic reservations
const SEED_BOOKINGS: TastingBooking[] = [
  {
    id: 'book_manousakis_01',
    producerId: 'manousakis',
    producerName: 'Manousakis Winery',
    producerCategory: 'winery',
    producerLocation: 'Vatolakkos, Chania',
    userId: 'user_demo_sommelier',
    userName: 'Elena Kazantzaki',
    userEmail: 'elena.sommelier@example.com',
    userPhone: '+30 697 123 4567',
    date: '2026-05-18',
    timeSlot: '05:30 PM Sunset',
    experienceId: 'wine_sunset',
    experienceTitle: 'Golden Hour Sunset & Terroir Pairing',
    pricePerPerson: 45,
    guestsCount: 2,
    totalEstimated: 90,
    specialRequests: 'Celebrating anniversary; table on panoramic deck preferred.',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'book_douloufakis_01',
    producerId: 'douloufakis',
    producerName: 'Douloufakis Winery',
    producerCategory: 'winery',
    producerLocation: 'Dafnes, Heraklion',
    userId: 'user_giannis',
    userName: 'Giannis Fanourakis',
    userEmail: 'giannis.crete@example.com',
    userPhone: '+30 694 555 7890',
    date: '2026-05-22',
    timeSlot: '11:30 AM',
    experienceId: 'wine_cellar',
    experienceTitle: 'Cellar Master & Single-Vineyard Tour',
    pricePerPerson: 28,
    guestsCount: 4,
    totalEstimated: 112,
    specialRequests: 'Interested in tasting older vintages of Aspros Lagos Vidiano.',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    confirmedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'book_solo_01',
    producerId: 'solo_beer',
    producerName: 'Solo Artisanal Microbrewery',
    producerCategory: 'brewery',
    producerLocation: 'Alikarnassos, Heraklion',
    userId: 'user_markos',
    userName: 'Markos V.',
    userEmail: 'markos.brewer@example.com',
    userPhone: '+30 698 888 2211',
    date: '2026-05-25',
    timeSlot: '04:00 PM',
    experienceId: 'beer_brewmaster',
    experienceTitle: 'Brewmaster Brewhouse Tour & Guided Flight',
    pricePerPerson: 22,
    guestsCount: 3,
    totalEstimated: 66,
    specialRequests: 'Excited to discuss hop profiles for Cretan craft brewing.',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

export const getLocalBookings = (): TastingBooking[] => {
  try {
    const saved = localStorage.getItem(BOOKINGS_LOCAL_KEY);
    if (!saved) {
      localStorage.setItem(BOOKINGS_LOCAL_KEY, JSON.stringify(SEED_BOOKINGS));
      return SEED_BOOKINGS;
    }
    return JSON.parse(saved);
  } catch (e) {
    console.error('Error reading bookings from localStorage:', e);
    return SEED_BOOKINGS;
  }
};

export const saveLocalBookings = (bookings: TastingBooking[]) => {
  try {
    localStorage.setItem(BOOKINGS_LOCAL_KEY, JSON.stringify(bookings));
  } catch (e) {
    console.error('Error saving bookings to localStorage:', e);
  }
};

/**
 * Creates a new tasting booking, persisting to Firestore if available and always updating local storage
 */
export const createTastingBooking = async (
  booking: Omit<TastingBooking, 'id' | 'createdAt' | 'status'>
): Promise<TastingBooking> => {
  const newBooking: TastingBooking = {
    ...booking,
    id: `book_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  // 1. Update local storage cache
  const localList = getLocalBookings();
  const updatedList = [newBooking, ...localList];
  saveLocalBookings(updatedList);

  // 2. Sync to Cloud Firestore if connected
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'bookings', newBooking.id);
      await setDoc(docRef, newBooking);
    } catch (e) {
      console.warn('Firestore booking save error, stored locally:', e);
    }
  }

  return newBooking;
};

/**
 * Updates the status of a tasting booking (e.g. winery owner confirms or declines)
 */
export const updateBookingStatus = async (
  bookingId: string,
  status: TastingBooking['status']
): Promise<void> => {
  const localList = getLocalBookings();
  const updated = localList.map((b) =>
    b.id === bookingId
      ? {
          ...b,
          status,
          ...(status === 'confirmed' ? { confirmedAt: new Date().toISOString() } : {}),
        }
      : b
  );
  saveLocalBookings(updated);

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'bookings', bookingId);
      await updateDoc(docRef, {
        status,
        ...(status === 'confirmed' ? { confirmedAt: new Date().toISOString() } : {}),
      });
    } catch (e) {
      console.warn('Firestore booking status update error, updated locally:', e);
    }
  }
};

/**
 * Save custom winery/brewery announcement or schedule override
 */
export const saveProducerOverride = async (override: ProducerOverride): Promise<void> => {
  try {
    const saved = localStorage.getItem(OVERRIDES_LOCAL_KEY);
    const existing: Record<string, ProducerOverride> = saved ? JSON.parse(saved) : {};
    existing[override.producerId] = override;
    localStorage.setItem(OVERRIDES_LOCAL_KEY, JSON.stringify(existing));

    if (isFirebaseConfigured && db) {
      const docRef = doc(db, 'producer_overrides', override.producerId);
      await setDoc(docRef, override, { merge: true });
    }
  } catch (e) {
    console.error('Error saving producer override:', e);
  }
};

export const getLocalProducerOverrides = (): Record<string, ProducerOverride> => {
  try {
    const saved = localStorage.getItem(OVERRIDES_LOCAL_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    console.error('Error reading producer overrides:', e);
    return {};
  }
};

export { app, auth, db };
