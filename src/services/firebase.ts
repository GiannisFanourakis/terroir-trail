import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider, Auth, sendPasswordResetEmail } from 'firebase/auth';
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
import { UserProfile } from '../types/auth';

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
// SCENARIO A: Cloud Firestore Traveler & Host Profile Sync
// =========================================================

/**
 * Saves complete user profile (traveler or verified estate host) to Cloud Firestore
 */
export const saveUserProfileToCloud = async (profile: Partial<UserProfile> & { id: string }) => {
  if (!isFirebaseConfigured || !db || !profile.id) return;
  try {
    const userRef = doc(db, 'users', profile.id);
    const dataToSave: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };
    if (profile.name !== undefined) dataToSave.name = profile.name;
    if (profile.email !== undefined) dataToSave.email = profile.email;
    if (profile.avatar !== undefined) dataToSave.avatar = profile.avatar;
    if (profile.hometown !== undefined) dataToSave.hometown = profile.hometown;
    if (profile.role !== undefined) dataToSave.role = profile.role;
    if (profile.isProducer !== undefined) dataToSave.isProducer = profile.isProducer;
    if (profile.claimedProducerId !== undefined) dataToSave.claimedProducerId = profile.claimedProducerId;
    if (profile.producerName !== undefined) dataToSave.producerName = profile.producerName;
    if (profile.travelerType !== undefined) dataToSave.travelerType = profile.travelerType;
    if (profile.visitedProducers !== undefined) dataToSave.visitedProducers = profile.visitedProducers;
    if (profile.personalNotes !== undefined) dataToSave.personalNotes = profile.personalNotes;
    if (profile.hasExplorerPass !== undefined) dataToSave.hasExplorerPass = profile.hasExplorerPass;
    if (profile.explorerPassUntil !== undefined) dataToSave.explorerPassUntil = profile.explorerPassUntil;
    if (profile.memberSince !== undefined) dataToSave.memberSince = profile.memberSince;

    await setDoc(userRef, dataToSave, { merge: true });
  } catch (error) {
    console.error('Error saving user profile to Firestore:', error);
  }
};

/**
 * Fetches user profile document from Cloud Firestore
 */
export const fetchUserProfileFromCloud = async (userId: string): Promise<Partial<UserProfile> | null> => {
  if (!isFirebaseConfigured || !db || !userId) return null;
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as Partial<UserProfile>;
    }
  } catch (error) {
    console.warn('Error fetching user profile from Firestore:', error);
  }
  return null;
};

/**
 * Sends a real password reset link to user's registered email
 */
export const sendPasswordReset = async (userEmail: string): Promise<void> => {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase authentication is not configured.');
  }
  await sendPasswordResetEmail(auth, userEmail);
};

/**
 * Backwards-compatible helper for visited stamps and notes sync
 */
export const syncUserProfileToCloud = async (
  userId: string,
  visitedProducers: string[],
  personalNotes: Record<string, string>
) => {
  return saveUserProfileToCloud({
    id: userId,
    visitedProducers,
    personalNotes,
  });
};

/**
 * Real-time listener for remote user updates (e.g. stamped on phone, updates on laptop)
 */
export const subscribeToCloudUserProfile = (
  userId: string,
  onUpdate: (data: Partial<UserProfile>) => void
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
          const data = docSnap.data() as Partial<UserProfile>;
          onUpdate(data);
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
    id: 'book_paterianakis_01',
    producerId: 'domaine-paterianakis',
    producerName: 'Domaine Paterianakis',
    producerCategory: 'winery',
    producerLocation: 'Melesses (Peza), Heraklion',
    userId: 'user_elena',
    userName: 'Jane Doe',
    userEmail: 'jane.doe@example.com',
    userPhone: '+30 697 123 4567',
    date: '2026-05-20',
    timeSlot: '04:30 PM',
    experienceId: 'paterianakis_amphora',
    experienceTitle: 'Amphora & Organic Vidiano Masterclass',
    pricePerPerson: 35,
    guestsCount: 2,
    totalEstimated: 70,
    specialRequests: 'Interested in seeing your clay amphora cellar and tasting older Vidiano vintages.',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'book_manousakis_01',
    producerId: 'manousakis-winery',
    producerName: 'Manousakis Winery',
    producerCategory: 'winery',
    producerLocation: 'Vatolakkos, Chania',
    userId: 'user_giannis',
    userName: 'John Smith',
    userEmail: 'john.smith@example.com',
    userPhone: '+30 694 555 7890',
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
    id: 'book_charma_01',
    producerId: 'cretan-brewery-charma',
    producerName: 'Cretan Brewery (Charma Beer)',
    producerCategory: 'brewery',
    producerLocation: 'Zounaki, Chania',
    userId: 'user_markos',
    userName: 'Alex Miller',
    userEmail: 'alex.miller@example.com',
    userPhone: '+30 698 888 2211',
    date: '2026-05-22',
    timeSlot: '02:00 PM',
    experienceId: 'charma_brewery_tour',
    experienceTitle: 'Brewery Tour & Fresh Draft Taproom Tasting',
    pricePerPerson: 20,
    guestsCount: 4,
    totalEstimated: 80,
    specialRequests: 'Group of homebrewers visiting Chania.',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'book_monteraponi_01',
    producerId: 'monteraponi-tuscany',
    producerName: 'Azienda Agricola Monteraponi',
    producerCategory: 'winery',
    producerLocation: 'Radda in Chianti, Tuscany',
    userId: 'user_elena',
    userName: 'Jane Doe',
    userEmail: 'jane.doe@example.com',
    userPhone: '+30 697 123 4567',
    date: '2026-06-10',
    timeSlot: '11:00 AM',
    experienceId: 'monteraponi_tasting',
    experienceTitle: 'Historic Cellar Tour & Pure Sangiovese Flight',
    pricePerPerson: 40,
    guestsCount: 2,
    totalEstimated: 80,
    specialRequests: 'Sommelier visit; excited to taste your Chianti Classico Riserva Baron Ugo.',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    confirmedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'book_douloufakis_01',
    producerId: 'douloufakis-winery',
    producerName: 'Douloufakis Winery',
    producerCategory: 'winery',
    producerLocation: 'Dafnes, Heraklion',
    userId: 'user_giannis',
    userName: 'John Smith',
    userEmail: 'john.smith@example.com',
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
    producerId: 'solo-craft-brewery',
    producerName: 'Solo Artisanal Microbrewery',
    producerCategory: 'brewery',
    producerLocation: 'Alikarnassos, Heraklion',
    userId: 'user_markos',
    userName: 'Alex Miller',
    userEmail: 'alex.brewer@example.com',
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
