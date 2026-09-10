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
import { UserProfile, ProducerRegistrationRecord } from '../types/auth';

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

export const SEEDED_PRODUCER_REGISTRATIONS: Record<string, ProducerRegistrationRecord> = {
  'domaine-paterianakis': {
    id: 'domaine-paterianakis',
    producerId: 'domaine-paterianakis',
    userId: 'producer_fake_winery',
    tradeBrandName: 'Domaine Paterianakis',
    producerCategory: 'winery',
    legalBusinessName: 'ΚΤΗΜΑ ΠΑΤΕΡΙΑΝΑΚΗ Ο.Ε. (DEMO)',
    legalEntityType: 'general_partnership_oe',
    vatNumber: 'EL999999991',
    taxOffice: 'Δ.Ο.Υ. Ηρακλείου',
    countryCode: 'GR',
    isVatVerified: true,
    vatVerificationDate: '2026-01-15',
    eoriNumber: 'EL999999991',
    logistics: {
      facilityName: 'Domaine Paterianakis Organic Cellar & Tasting Center',
      streetAddress: 'Melesses (Peza)',
      postalCode: '70100',
      cityOrVillage: 'Heraklion',
      region: 'Crete',
      countryCode: 'GR',
      accessType: 'standard_courier_van',
      contactPersonName: 'Giorgos Paterianakis',
      dispatchPhone: '+30 2810 000001',
      dispatchEmail: 'dispatch@fake-winery.com',
      pickupTimeWindow: '09:00 - 15:30 Mon-Fri',
      loadingNotes: 'Wine cellar dispatch loading bay at main entrance courtyard.',
    },
    packaging: {
      supportsWineBottles: true,
      maxDailyParcels: 30,
      dispatchLeadTime: 'same_day',
    },
    banking: {
      accountHolderName: 'ΚΤΗΜΑ ΠΑΤΕΡΙΑΝΑΚΗ Ο.Ε.',
      bankName: 'National Bank of Greece',
      iban: 'GR96 0110 1250 0000 0001 2345 678',
      swiftBic: 'ETHNGRAA',
      payoutCurrency: 'EUR',
    },
    permits: {
      gemiNumber: '123456789001',
      excisePermitNumber: 'GR-EIDIK-2026-0012',
      sanitaryPermitNumber: 'EFET-HER-8899',
      organicCertificationBody: 'BIO Hellas',
      organicCertNumber: 'BIO-GR-2026-7788',
    },
    representativeName: 'Emmanuela Paterianaki',
    representativeRole: 'Owner & Winemaker',
    officialEmail: 'producer@fake-winery.com',
    websiteStoreUrl: 'https://paterianakis.gr/shop',
    status: 'verified_active',
    submittedAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
    termsAccepted: true,
  },
  'manousakis-winery': {
    id: 'manousakis-winery',
    producerId: 'manousakis-winery',
    tradeBrandName: 'Manousakis Winery (Nostos)',
    producerCategory: 'winery',
    legalBusinessName: 'MANOUSAKIS WINERY SINGLE MEMBER P.C. (DEMO)',
    legalEntityType: 'private_company_ike',
    vatNumber: 'EL999999992',
    taxOffice: 'Δ.Ο.Υ. Χανίων',
    countryCode: 'GR',
    isVatVerified: true,
    vatVerificationDate: '2025-11-20',
    eoriNumber: 'EL999999992',
    logistics: {
      facilityName: 'Manousakis Cellar & Tasting Terrace',
      streetAddress: 'Vatolakkos, Platanias',
      postalCode: '73005',
      cityOrVillage: 'Chania',
      region: 'Crete',
      countryCode: 'GR',
      accessType: 'large_truck_ramp',
      contactPersonName: 'Alexandra Manousakis',
      dispatchPhone: '+30 28210 000002',
      dispatchEmail: 'dispatch@fake-manousakis.com',
      pickupTimeWindow: '09:00 - 16:00 Mon-Fri',
      loadingNotes: 'Dedicated loading dock at winery rear gate.',
    },
    packaging: {
      supportsWineBottles: true,
      maxDailyParcels: 50,
      dispatchLeadTime: 'same_day',
    },
    banking: {
      accountHolderName: 'MANOUSAKIS WINERY P.C.',
      bankName: 'Piraeus Bank',
      iban: 'GR44 0172 0120 0050 1234 5678 901',
      swiftBic: 'PIRAGRAA',
      payoutCurrency: 'EUR',
    },
    permits: {
      gemiNumber: '123456789002',
      excisePermitNumber: 'GR-EIDIK-2026-0013',
      sanitaryPermitNumber: 'EFET-CHA-4411',
      organicCertificationBody: 'DIO Organic',
      organicCertNumber: 'DIO-GR-2025-1102',
    },
    representativeName: 'Alexandra Manousakis',
    representativeRole: 'Managing Director',
    officialEmail: 'info@fake-manousakis.com',
    websiteStoreUrl: 'https://nostoswines.com/shop',
    status: 'verified_active',
    submittedAt: '2025-11-20T10:00:00Z',
    updatedAt: '2025-11-20T10:00:00Z',
    termsAccepted: true,
  },
  'cretan-brewery-charma': {
    id: 'cretan-brewery-charma',
    producerId: 'cretan-brewery-charma',
    tradeBrandName: 'Cretan Brewery (Charma Beer)',
    producerCategory: 'brewery',
    legalBusinessName: 'CRETAN BREWERY S.A. (DEMO)',
    legalEntityType: 'corporation_ae',
    vatNumber: 'EL999999993',
    taxOffice: 'Δ.Ο.Υ. Χανίων',
    countryCode: 'GR',
    isVatVerified: true,
    vatVerificationDate: '2025-09-10',
    eoriNumber: 'EL999999993',
    logistics: {
      facilityName: 'Cretan Brewery Brewhouse & Logistics Hub',
      streetAddress: 'Zounaki, Platanias',
      postalCode: '73002',
      cityOrVillage: 'Chania',
      region: 'Crete',
      countryCode: 'GR',
      accessType: 'large_truck_ramp',
      contactPersonName: 'Ioannis Lionakis',
      dispatchPhone: '+30 28210 000003',
      dispatchEmail: 'dispatch@fake-charma.com',
      pickupTimeWindow: '08:30 - 15:00 Mon-Fri',
      loadingNotes: 'Forklift available on site for freight pallet and parcel loading.',
    },
    packaging: {
      supportsBeerBottles: true,
      maxDailyParcels: 60,
      dispatchLeadTime: 'same_day',
    },
    banking: {
      accountHolderName: 'CRETAN BREWERY S.A.',
      bankName: 'Alpha Bank',
      iban: 'GR16 0140 1030 1030 0200 3004 005',
      swiftBic: 'CRBAGRAA',
      payoutCurrency: 'EUR',
    },
    permits: {
      gemiNumber: '123456789003',
      excisePermitNumber: 'GR-ZYTH-2026-0005',
      sanitaryPermitNumber: 'EFET-CHA-7722',
    },
    representativeName: 'Ioannis Lionakis',
    representativeRole: 'Founder & Brewmaster',
    officialEmail: 'info@fake-charma.com',
    websiteStoreUrl: 'https://cretanbeer.gr/store',
    status: 'verified_active',
    submittedAt: '2025-09-10T10:00:00Z',
    updatedAt: '2025-09-10T10:00:00Z',
    termsAccepted: true,
  },
  'monteraponi-tuscany': {
    id: 'monteraponi-tuscany',
    producerId: 'monteraponi-tuscany',
    tradeBrandName: 'Azienda Agricola Monteraponi',
    producerCategory: 'winery',
    legalBusinessName: 'AZIENDA AGRICOLA MONTERAPONI (DEMO)',
    legalEntityType: 'italian_srl',
    vatNumber: 'IT99999999990',
    taxOffice: 'Ufficio di Siena',
    countryCode: 'IT',
    isVatVerified: true,
    vatVerificationDate: '2025-08-01',
    eoriNumber: 'IT99999999990',
    logistics: {
      facilityName: 'Monteraponi Cellar & Cantina',
      streetAddress: 'Località Monteraponi',
      postalCode: '53017',
      cityOrVillage: 'Radda in Chianti (SI)',
      region: 'Tuscany',
      countryCode: 'IT',
      accessType: 'standard_courier_van',
      contactPersonName: 'Michele Braganti',
      dispatchPhone: '+39 055 0000000',
      dispatchEmail: 'logistica@fake-monteraponi.it',
      pickupTimeWindow: '09:00 - 16:30 Mon-Fri',
      loadingNotes: 'Historic medieval estate driveway; standard sprinter vans and courier trucks welcome.',
    },
    packaging: {
      supportsWineBottles: true,
      maxDailyParcels: 35,
      dispatchLeadTime: 'same_day',
    },
    banking: {
      accountHolderName: 'AZIENDA AGRICOLA MONTERAPONI',
      bankName: 'Intesa Sanpaolo / UniCredit',
      iban: 'IT60 X054 2811 1010 0000 0123 456',
      swiftBic: 'UNCRITM1',
      payoutCurrency: 'EUR',
    },
    permits: {
      gemiNumber: 'REA-SI-999999',
      excisePermitNumber: 'IT-ACC-2026-0089',
      organicCertificationBody: 'ICEA Bio',
      organicCertNumber: 'ICEA-TUS-2025-4422',
    },
    representativeName: 'Michele Braganti',
    representativeRole: 'Owner & Vignaiolo',
    officialEmail: 'info@fake-monteraponi.it',
    websiteStoreUrl: 'https://monteraponi.it/store',
    status: 'verified_active',
    submittedAt: '2025-08-01T10:00:00Z',
    updatedAt: '2025-08-01T10:00:00Z',
    termsAccepted: true,
  },
};

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
    const existing: Record<string, ProducerRegistrationRecord> = saved ? JSON.parse(saved) : { ...SEEDED_PRODUCER_REGISTRATIONS };
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

  // 2. Fallback to localStorage or Seed Data
  try {
    const saved = localStorage.getItem(PRODUCER_REGISTRATIONS_KEY);
    const existing: Record<string, ProducerRegistrationRecord> = saved
      ? JSON.parse(saved)
      : SEEDED_PRODUCER_REGISTRATIONS;

    if (existing[producerId]) {
      return existing[producerId];
    }
  } catch (e) {
    console.error('Error reading producer registration from localStorage:', e);
  }

  return SEEDED_PRODUCER_REGISTRATIONS[producerId] || null;
};

/**
 * Returns all producer registration records from database/cache
 */
export const getAllProducerRegistrations = async (): Promise<Record<string, ProducerRegistrationRecord>> => {
  try {
    const saved = localStorage.getItem(PRODUCER_REGISTRATIONS_KEY);
    if (!saved) {
      localStorage.setItem(PRODUCER_REGISTRATIONS_KEY, JSON.stringify(SEEDED_PRODUCER_REGISTRATIONS));
      return SEEDED_PRODUCER_REGISTRATIONS;
    }
    return JSON.parse(saved);
  } catch (e) {
    console.error('Error reading all producer registrations:', e);
    return SEEDED_PRODUCER_REGISTRATIONS;
  }
};

export { app, auth, db };

