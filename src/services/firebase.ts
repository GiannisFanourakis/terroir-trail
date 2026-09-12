import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider, Auth, sendPasswordResetEmail } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  collection,
  updateDoc,
  query,
  where,
  orderBy,
  Firestore,
} from 'firebase/firestore';
import { TastingBooking, ProducerOverride } from '../types/booking';
import { UserProfile, ProducerRegistrationRecord } from '../types/auth';
import { SEEDED_PRODUCER_REGISTRATIONS } from '../data/seededRegistrations';

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
    try {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache(),
      });
    } catch {
      db = getFirestore(app);
    }
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
// SCENARIO A: Cloud Firestore Traveler Profile Sync
// =========================================================

/**
 * Saves ordinary traveler profile fields to Cloud Firestore.
 * Privileged fields (roles, claims, tax, passes) are strictly excluded from client writes.
 */
export const saveUserProfileToCloud = async (profile: Partial<UserProfile> & { id: string }) => {
  if (!isFirebaseConfigured || !db || !profile.id) return;
  const userRef = doc(db, 'users', profile.id);
  const dataToSave: Record<string, any> = {
    updatedAt: new Date().toISOString(),
  };
  if (profile.name !== undefined) dataToSave.name = profile.name;
  if (profile.email !== undefined) dataToSave.email = profile.email;
  if (profile.avatar !== undefined) dataToSave.avatar = profile.avatar;
  if (profile.hometown !== undefined) dataToSave.hometown = profile.hometown;
  if (profile.travelerType !== undefined) dataToSave.travelerType = profile.travelerType;
  if (profile.visitedProducers !== undefined) dataToSave.visitedProducers = profile.visitedProducers;
  if (profile.personalNotes !== undefined) dataToSave.personalNotes = profile.personalNotes;
  if (profile.memberSince !== undefined) dataToSave.memberSince = profile.memberSince;

  await setDoc(userRef, dataToSave, { merge: true });
};

export interface ProducerOwnershipRecord {
  producerId: string;
  ownerUid: string;
  status: 'active';
  approvedAt: string;
}

/**
 * Fetches trusted producer ownership from Cloud Firestore producer_owners collection
 */
export const fetchUserProducerOwnership = async (userId: string): Promise<ProducerOwnershipRecord | null> => {
  if (!isFirebaseConfigured || !db || !userId) return null;
  try {
    const q = query(
      collection(db, 'producer_owners'),
      where('ownerUid', '==', userId),
      where('status', '==', 'active')
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as ProducerOwnershipRecord;
    }
  } catch (error) {
    console.warn('Error fetching producer ownership from Firestore:', error);
  }
  return null;
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
 * Creates a new tasting booking.
 * In cloud mode: derives userId strictly from auth.currentUser.uid, enforces status 'pending',
 * strips any host lifecycle fields, and propagates Firestore errors.
 */
export const createTastingBooking = async (
  booking: Omit<TastingBooking, 'id' | 'createdAt' | 'status'>
): Promise<TastingBooking> => {
  if (isFirebaseConfigured && db) {
    if (!auth?.currentUser) {
      throw new Error('Authentication required to create a tasting reservation.');
    }
    const currentUid = auth.currentUser.uid;
    const newBooking: TastingBooking = {
      ...booking,
      id: `book_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId: currentUid,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    // Strip host lifecycle fields
    delete (newBooking as any).confirmedAt;
    delete (newBooking as any).completedAt;

    const docRef = doc(db, 'bookings', newBooking.id);
    await setDoc(docRef, newBooking);

    // Update local storage cache on success
    const localList = getLocalBookings();
    saveLocalBookings([newBooking, ...localList]);
    return newBooking;
  }

  // Fallback for demo mode
  const newBooking: TastingBooking = {
    ...booking,
    id: `book_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  const localList = getLocalBookings();
  saveLocalBookings([newBooking, ...localList]);
  return newBooking;
};

/**
 * Traveler cancellation: pending -> cancelled.
 * Propagates Firestore errors.
 */
export const cancelTastingBookingByTraveler = async (bookingId: string): Promise<void> => {
  if (isFirebaseConfigured && db) {
    if (!auth?.currentUser) {
      throw new Error('Authentication required to cancel a reservation.');
    }
    const docRef = doc(db, 'bookings', bookingId);
    await updateDoc(docRef, { status: 'cancelled' });
  }

  const localList = getLocalBookings();
  const updated = localList.map((b) =>
    b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
  );
  saveLocalBookings(updated);
};

/**
 * Approved host updates reservation status (pending -> confirmed/cancelled, confirmed -> completed/cancelled).
 * Propagates Firestore errors.
 */
export const updateBookingStatusByHost = async (
  bookingId: string,
  status: 'confirmed' | 'cancelled' | 'completed'
): Promise<void> => {
  if (isFirebaseConfigured && db) {
    if (!auth?.currentUser) {
      throw new Error('Authentication required to update reservation status.');
    }
    const docRef = doc(db, 'bookings', bookingId);
    const updates: Record<string, any> = { status };
    if (status === 'confirmed') {
      updates.confirmedAt = new Date().toISOString();
    }
    await updateDoc(docRef, updates);
  }

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
};

/**
 * Backwards-compatible alias for host booking updates
 */
export const updateBookingStatus = updateBookingStatusByHost;

/**
 * Save custom winery/brewery announcement or schedule override.
 * Omits isProTier from ordinary client writes.
 */
export const saveProducerOverride = async (override: ProducerOverride): Promise<void> => {
  const { isProTier: _ignoredProTier, ...cleanOverride } = override;

  if (isFirebaseConfigured && db) {
    if (!auth?.currentUser) {
      // Demo host identity: persist to local cache only without cloud writes
      try {
        const saved = localStorage.getItem(OVERRIDES_LOCAL_KEY);
        const existing: Record<string, ProducerOverride> = saved ? JSON.parse(saved) : {};
        existing[override.producerId] = override;
        localStorage.setItem(OVERRIDES_LOCAL_KEY, JSON.stringify(existing));
      } catch (e) {
        console.error('Error caching producer override:', e);
      }
      return;
    }

    // Authenticated cloud write first: only update local cache after Firestore succeeds
    const docRef = doc(db, 'producer_overrides', override.producerId);
    await setDoc(docRef, {
      ...cleanOverride,
      producerId: override.producerId,
    }, { merge: true });

    try {
      const saved = localStorage.getItem(OVERRIDES_LOCAL_KEY);
      const existing: Record<string, ProducerOverride> = saved ? JSON.parse(saved) : {};
      existing[override.producerId] = override;
      localStorage.setItem(OVERRIDES_LOCAL_KEY, JSON.stringify(existing));
    } catch (e) {
      console.error('Error caching producer override:', e);
    }
    return;
  }

  // Firebase not configured: fallback local cache
  try {
    const saved = localStorage.getItem(OVERRIDES_LOCAL_KEY);
    const existing: Record<string, ProducerOverride> = saved ? JSON.parse(saved) : {};
    existing[override.producerId] = override;
    localStorage.setItem(OVERRIDES_LOCAL_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('Error caching producer override:', e);
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

// =========================================================
// SCENARIO C: Producer Fiscal & Logistics Database Registry
// =========================================================

const PRODUCER_REGISTRATIONS_KEY = 'terroir_trail_producer_registrations';

export { SEEDED_PRODUCER_REGISTRATIONS };

/**
 * Saves complete producer registration record to Cloud Firestore database and local cache.
 * Cloud write is performed first; local cache is updated only after Firestore succeeds.
 * Status is submitted as 'pending_verification' and isVatVerified is false.
 * Does NOT self-promote the user profile.
 */
export const saveProducerRegistrationToCloud = async (
  record: ProducerRegistrationRecord
): Promise<ProducerRegistrationRecord> => {
  const currentUid = auth?.currentUser?.uid || record.userId;
  const updatedRecord: ProducerRegistrationRecord = {
    ...record,
    userId: currentUid,
    status: 'pending_verification',
    isVatVerified: false,
    updatedAt: new Date().toISOString(),
  };

  // Strip any authoritative approval fields
  delete (updatedRecord as any).approvedAt;
  delete (updatedRecord as any).approvedBy;

  // Perform Cloud Firestore write first if configured
  if (isFirebaseConfigured && db) {
    if (!auth?.currentUser) {
      throw new Error('Authentication required to submit producer registration.');
    }
    const docRef = doc(db, 'producer_registrations', record.producerId);
    await setDoc(docRef, updatedRecord, { merge: true });

    // Update local cache only after successful Firestore write
    try {
      const saved = localStorage.getItem(PRODUCER_REGISTRATIONS_KEY);
      const existing: Record<string, ProducerRegistrationRecord> = saved ? JSON.parse(saved) : {};
      existing[record.producerId] = updatedRecord;
      localStorage.setItem(PRODUCER_REGISTRATIONS_KEY, JSON.stringify(existing));
    } catch (e) {
      console.error('Error persisting producer registration to localStorage:', e);
    }

    return updatedRecord;
  }

  // Fallback for unconfigured / demo mode
  try {
    const saved = localStorage.getItem(PRODUCER_REGISTRATIONS_KEY);
    const existing: Record<string, ProducerRegistrationRecord> = saved ? JSON.parse(saved) : {};
    existing[record.producerId] = updatedRecord;
    localStorage.setItem(PRODUCER_REGISTRATIONS_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('Error persisting producer registration to localStorage:', e);
  }

  return updatedRecord;
};

/**
 * Fetches a producer registration record from Cloud Firestore or fallback local storage
 */
export const fetchProducerRegistrationFromCloud = async (
  producerId: string
): Promise<ProducerRegistrationRecord | null> => {
  // 1. Try Cloud Firestore
  if (isFirebaseConfigured && db && producerId) {
    try {
      const docRef = doc(db, 'producer_registrations', producerId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as ProducerRegistrationRecord;
      }
    } catch (e) {
      console.warn('Firestore fetch producer registration error, checking cache:', e);
    }
  }

  // 2. Fallback to localStorage if a saved registration exists
  try {
    const saved = localStorage.getItem(PRODUCER_REGISTRATIONS_KEY);
    if (saved) {
      const existing: Record<string, ProducerRegistrationRecord> = JSON.parse(saved);
      if (existing[producerId]) {
        return existing[producerId];
      }
    }
  } catch (e) {
    console.error('Error reading producer registration from localStorage:', e);
  }

  return null;
};

/**
 * Returns all producer registration records from database/cache
 */
export const getAllProducerRegistrations = async (): Promise<Record<string, ProducerRegistrationRecord>> => {
  try {
    const saved = localStorage.getItem(PRODUCER_REGISTRATIONS_KEY);
    if (!saved) {
      return {};
    }
    return JSON.parse(saved);
  } catch (e) {
    console.error('Error reading all producer registrations:', e);
    return {};
  }
};

export { app, auth, db };
