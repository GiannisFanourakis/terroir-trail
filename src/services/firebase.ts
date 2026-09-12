import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider, Auth, sendPasswordResetEmail } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
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
    // Paid pass records are written only by the API to explorerPasses.
    if (profile.memberSince !== undefined) dataToSave.memberSince = profile.memberSince;
    if (profile.claimStatus !== undefined) dataToSave.claimStatus = profile.claimStatus;
    if (profile.taxDetails !== undefined) dataToSave.taxDetails = profile.taxDetails;

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

// =========================================================
// SCENARIO C: Producer Fiscal & Logistics Database Registry
// =========================================================

const PRODUCER_REGISTRATIONS_KEY = 'terroir_trail_producer_registrations';

export { SEEDED_PRODUCER_REGISTRATIONS };


/**
 * Saves complete producer registration record to Cloud Firestore database and local cache
 */
export const saveProducerRegistrationToCloud = async (
  record: ProducerRegistrationRecord
): Promise<ProducerRegistrationRecord> => {
  const updatedRecord: ProducerRegistrationRecord = {
    ...record,
    updatedAt: new Date().toISOString(),
    status: record.isVatVerified ? 'verified_active' : 'pending_verification',
  };

  // 1. Persist to localStorage
  try {
    const saved = localStorage.getItem(PRODUCER_REGISTRATIONS_KEY);
    const existing: Record<string, ProducerRegistrationRecord> = saved ? JSON.parse(saved) : {};
    existing[record.producerId] = updatedRecord;
    localStorage.setItem(PRODUCER_REGISTRATIONS_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('Error persisting producer registration to localStorage:', e);
  }

  // 2. Persist to Cloud Firestore (collection: 'producer_registrations')
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'producer_registrations', record.producerId);
      await setDoc(docRef, updatedRecord, { merge: true });
    } catch (e) {
      console.warn('Firestore producer registration write error, preserved locally:', e);
    }
  }

  // 3. Automatically link with user profile if userId provided
  if (record.userId) {
    await saveUserProfileToCloud({
      id: record.userId,
      isProducer: true,
      claimedProducerId: record.producerId,
      producerName: record.tradeBrandName,
      claimStatus: updatedRecord.status === 'verified_active' ? 'verified_host' : 'pending_verification',
      taxDetails: {
        vatNumber: record.vatNumber,
        legalBusinessName: record.legalBusinessName,
        taxOffice: record.taxOffice,
        registeredAddress: `${record.logistics.streetAddress}, ${record.logistics.cityOrVillage}, ${record.logistics.postalCode}`,
        dispatchContactPhone: record.logistics.dispatchPhone,
        countryCode: record.countryCode,
        isVatVerified: record.isVatVerified,
        vatVerificationDate: record.vatVerificationDate,
        eoriNumber: record.eoriNumber,
        gemiNumber: record.permits.gemiNumber,
        iban: record.banking.iban,
        registrationRecord: updatedRecord,
      },
    });
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
        // Sanitize legacy cache entries that might have real winery names
        const legalName = existing[producerId].legalBusinessName || '';
        if (
          legalName.toUpperCase().includes('PATERIANAKIS') ||
          legalName.toUpperCase().includes('MANOUSAKIS') ||
          legalName.toUpperCase().includes('MONTERAPONI')
        ) {
          delete existing[producerId];
          localStorage.setItem(PRODUCER_REGISTRATIONS_KEY, JSON.stringify(existing));
          return null;
        }
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

