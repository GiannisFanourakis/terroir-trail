import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth, 
  indexedDBLocalPersistence, 
  GoogleAuthProvider, 
  OAuthProvider, 
  Auth, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
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
import { logger } from './logger';
import { runtimeConfig, checkIsFirebaseConfigured } from '../config/runtimeConfig';
import { readStorage, writeStorage, STORAGE_KEYS } from './browserStorage';
import {
  cleanupRemovedProducerMedia,
  persistProducerOverrideMedia,
} from './producerMediaStorage';
import { replaceProducerMedia } from './producerMediaApi';

const firebaseConfig = runtimeConfig.firebase;

export const isFirebaseConfigured = checkIsFirebaseConfigured();

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    if (Capacitor.isNativePlatform()) {
      try {
        auth = initializeAuth(app, {
          persistence: indexedDBLocalPersistence,
        });
      } catch {
        auth = getAuth(app);
      }
    } else {
      auth = getAuth(app);
    }
    try {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache(),
      });
    } catch {
      db = getFirestore(app);
    }
  } catch (error) {
    logger.error('Firebase', 'initialization_failed', error);
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
  if (profile.interests !== undefined) dataToSave.interests = profile.interests;
  // travelerType is retained only for backwards compatibility with older profiles.
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
  approvedAt?: string;
  assignedAt?: string;
}

/**
 * Fetches every active producer listing owned by this account. One account may
 * manage multiple listings, but each listing must still have a trusted
 * producer_owners record created by TerroirTrail administration.
 */
export const fetchUserProducerOwnerships = async (userId: string): Promise<ProducerOwnershipRecord[]> => {
  if (!isFirebaseConfigured || !db || !userId) return [];
  try {
    const q = query(
      collection(db, 'producer_owners'),
      where('ownerUid', '==', userId),
      where('status', '==', 'active')
    );
    const snap = await getDocs(q);
    return snap.docs.map((ownershipDoc) => ({
      ...(ownershipDoc.data() as ProducerOwnershipRecord),
      producerId: String(ownershipDoc.data().producerId || ownershipDoc.id),
    }));
  } catch (error) {
    console.warn('Error fetching producer ownerships from Firestore:', error);
    return [];
  }
};

/**
 * Backwards-compatible single-listing helper. New code should use
 * fetchUserProducerOwnerships and the trusted producerIds array.
 */
export const fetchUserProducerOwnership = async (userId: string): Promise<ProducerOwnershipRecord | null> => {
  const ownerships = await fetchUserProducerOwnerships(userId);
  return ownerships[0] || null;
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

const BOOKINGS_LOCAL_KEY = STORAGE_KEYS.TASTING_BOOKINGS;
const OVERRIDES_LOCAL_KEY = STORAGE_KEYS.PRODUCER_OVERRIDES;

// Exact historical fake identifiers retained strictly to clean legacy browser storage
export const LEGACY_DEMO_BOOKING_IDS = new Set([
  'book_paterianakis_01',
  'book_manousakis_01',
  'book_charma_01',
  'book_monteraponi_01',
  'book_douloufakis_01',
  'book_solo_01',
]);

export const LEGACY_DEMO_USER_IDS = new Set([
  'user_elena',
  'user_giannis',
  'user_markos',
  'user_demo_sommelier',
  'user_john_smith',
  'user_jane_doe',
  'user_alex_miller',
]);

export const getLocalBookings = (): TastingBooking[] => {
  const saved = readStorage<TastingBooking[] | null>(BOOKINGS_LOCAL_KEY, null, {
    scope: 'Firebase',
    validator: (d) => Array.isArray(d),
  });
  if (!saved) {
    return [];
  }
  // Remove only bookings matching exact known historical fake identifiers
  const cleaned = saved.filter(
    (b) => !LEGACY_DEMO_BOOKING_IDS.has(b.id) && !(b.userId && LEGACY_DEMO_USER_IDS.has(b.userId))
  );
  if (cleaned.length !== saved.length) {
    writeStorage(BOOKINGS_LOCAL_KEY, cleaned, { scope: 'Firebase' });
  }
  return cleaned;
};

export const saveLocalBookings = (bookings: TastingBooking[]) => {
  writeStorage(BOOKINGS_LOCAL_KEY, bookings, { scope: 'Firebase' });
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
 * Save producer-controlled operational overrides. Moderated media is submitted
 * through the trusted API so a host cannot self-approve image metadata by
 * writing Firestore directly.
 */
const updateLocalProducerOverride = (override: ProducerOverride) => {
  const existing = readStorage<Record<string, ProducerOverride>>(OVERRIDES_LOCAL_KEY, {}, {
    scope: 'Firebase',
    validator: (d) => typeof d === 'object' && d !== null && !Array.isArray(d),
  });
  existing[override.producerId] = override;
  writeStorage(OVERRIDES_LOCAL_KEY, existing, { scope: 'Firebase' });
};

export const getLocalProducerOverrides = (): Record<string, ProducerOverride> => {
  return readStorage<Record<string, ProducerOverride>>(OVERRIDES_LOCAL_KEY, {}, {
    scope: 'Firebase',
    validator: (d) => typeof d === 'object' && d !== null && !Array.isArray(d),
  });
};

const mediaSetsEqual = (a: ProducerOverride['uploadedImages'] = [], b: ProducerOverride['uploadedImages'] = []) =>
  JSON.stringify(a) === JSON.stringify(b);

export const saveProducerOverride = async (override: ProducerOverride): Promise<void> => {
  if (isFirebaseConfigured && db) {
    if (!auth?.currentUser) {
      // Demo host identity: persist to local cache only without cloud writes
      updateLocalProducerOverride(override);
      return;
    }
    if (!app) {
      throw new Error('Firebase application is not initialized.');
    }

    const previousOverride = getLocalProducerOverrides()[override.producerId];
    const persistedOverride = await persistProducerOverrideMedia(app, auth, override);
    const mediaChanged = !mediaSetsEqual(
      previousOverride?.uploadedImages || [],
      persistedOverride.uploadedImages || []
    );

    const hostWritableOverride: Record<string, unknown> = {
      producerId: persistedOverride.producerId,
      isAcceptingBookings: persistedOverride.isAcceptingBookings,
      updatedAt: persistedOverride.updatedAt,
    };
    if (persistedOverride.customNotice !== undefined) hostWritableOverride.customNotice = persistedOverride.customNotice;
    if (persistedOverride.customHours !== undefined) hostWritableOverride.customHours = persistedOverride.customHours;
    if (persistedOverride.contactEmail !== undefined) hostWritableOverride.contactEmail = persistedOverride.contactEmail;
    if (persistedOverride.contactPhone !== undefined) hostWritableOverride.contactPhone = persistedOverride.contactPhone;

    const docRef = doc(db, 'producer_overrides', persistedOverride.producerId);
    try {
      // Only operational fields are client-writable. Moderated/admin-controlled
      // fields such as uploadedImages, isProTier and partnership metadata are
      // deliberately excluded from this Firestore write.
      await setDoc(docRef, hostWritableOverride, { merge: true });

      if (mediaChanged) {
        await replaceProducerMedia(
          persistedOverride.producerId,
          persistedOverride.uploadedImages || [],
          await auth.currentUser.getIdToken()
        );
      }
    } catch (error) {
      // If a newly uploaded object cannot be registered, remove it so the
      // failed operation does not leave orphaned producer media.
      await cleanupRemovedProducerMedia(
        app,
        persistedOverride.uploadedImages || [],
        previousOverride?.uploadedImages || []
      );
      throw error;
    }

    updateLocalProducerOverride(persistedOverride);
    await cleanupRemovedProducerMedia(
      app,
      previousOverride?.uploadedImages || [],
      persistedOverride.uploadedImages || []
    );
    return;
  }

  // Firebase not configured: fallback local cache
  updateLocalProducerOverride(override);
};

// =========================================================
// SCENARIO C: Producer Fiscal & Logistics Database Registry
// =========================================================

const PRODUCER_REGISTRATIONS_KEY = STORAGE_KEYS.PRODUCER_REGISTRATIONS;

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
    const existing = readStorage<Record<string, ProducerRegistrationRecord>>(PRODUCER_REGISTRATIONS_KEY, {}, {
      scope: 'Firebase',
      validator: (d) => typeof d === 'object' && d !== null && !Array.isArray(d),
    });
    existing[record.producerId] = updatedRecord;
    writeStorage(PRODUCER_REGISTRATIONS_KEY, existing, { scope: 'Firebase' });

    return updatedRecord;
  }

  // Fallback for unconfigured / demo mode
  const existing = readStorage<Record<string, ProducerRegistrationRecord>>(PRODUCER_REGISTRATIONS_KEY, {}, {
    scope: 'Firebase',
    validator: (d) => typeof d === 'object' && d !== null && !Array.isArray(d),
  });
  existing[record.producerId] = updatedRecord;
  writeStorage(PRODUCER_REGISTRATIONS_KEY, existing, { scope: 'Firebase' });

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
  const existing = readStorage<Record<string, ProducerRegistrationRecord>>(PRODUCER_REGISTRATIONS_KEY, {}, {
    scope: 'Firebase',
    validator: (d) => typeof d === 'object' && d !== null && !Array.isArray(d),
  });
  if (existing[producerId]) {
    return existing[producerId];
  }

  return null;
};

/**
 * Returns all producer registration records from database/cache
 */
export const getAllProducerRegistrations = async (): Promise<Record<string, ProducerRegistrationRecord>> => {
  return readStorage<Record<string, ProducerRegistrationRecord>>(PRODUCER_REGISTRATIONS_KEY, {}, {
    scope: 'Firebase',
    validator: (d) => typeof d === 'object' && d !== null && !Array.isArray(d),
  });
};

export { app, auth, db };
