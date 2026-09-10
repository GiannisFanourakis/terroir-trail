import { useState, useEffect, useCallback } from 'react';
import { UserProfile, TravelerType, ProducerTaxDetails, HostClaimStatus } from '../types/auth';
import { 
  auth, 
  googleProvider, 
  appleProvider, 
  isFirebaseConfigured,
  saveUserProfileToCloud,
  fetchUserProfileFromCloud,
  sendPasswordReset,
  subscribeToCloudUserProfile
} from '../services/firebase';
import { 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile as firebaseUpdateProfile,
  User as FirebaseUser
} from 'firebase/auth';

const STORAGE_KEY = 'terroir_trail_user';

export const DEMO_PROFILES: Record<string, UserProfile> = {
  giannis: {
    id: 'user_john_smith',
    name: 'John Smith',
    email: 'john.smith@example.com',
    avatar: '🧭',
    hometown: 'Heraklion, Crete',
    travelerType: 'crete_local',
    visitedProducers: ['cretan-brewery-charma', 'domaine-paterianakis', 'gasparis-dairy'],
    personalNotes: {
      'cretan-brewery-charma': 'Fresh unpasteurized draft on the open-air deck is unbeatable on a warm afternoon.',
      'domaine-paterianakis': 'Indigenous organic Vidiano fermented in oak has incredible minerality.',
    },
    memberSince: '2026',
  },
  elena: {
    id: 'user_jane_doe',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    avatar: '🍷',
    hometown: 'Athens / Santorini',
    travelerType: 'wine_enthusiast',
    visitedProducers: ['vassaltis-santorini', 'skouras-nemea'],
    personalNotes: {
      'vassaltis-santorini': 'Pure volcanic salinity and razor-sharp acidity. World-class Assyrtiko.',
    },
    memberSince: '2026',
  },
  markos: {
    id: 'user_alex_miller',
    name: 'Alex Miller',
    email: 'alex.miller@example.com',
    avatar: '🍺',
    hometown: 'Chania, Crete',
    travelerType: 'craft_beer_explorer',
    visitedProducers: ['cretan-brewery-charma', 'santorini-brewing'],
    personalNotes: {
      'cretan-brewery-charma': 'Exceptional fresh unfiltered lager with local Cretan barley.',
    },
    memberSince: '2026',
  },
};

export const DEMO_PRODUCER_PROFILES: Record<string, UserProfile> = {
  paterianakis: {
    id: 'producer_fake_winery',
    name: 'John Smith',
    email: 'producer@fake-winery.com',
    avatar: '🍇',
    hometown: 'Peza Valley, Crete',
    role: 'producer',
    isProducer: true,
    claimedProducerId: 'domaine-paterianakis',
    producerName: 'Domaine Paterianakis (Organic Winery)',
    claimStatus: 'verified_host',
    taxDetails: {
      vatNumber: 'EL999999991',
      legalBusinessName: 'DOMAINE PATERIANAKIS PARTNERSHIP (DEMO)',
      taxOffice: 'Heraklion Tax Office',
      registeredAddress: 'Melesses (Peza), Heraklion, GR-70100, Crete',
      dispatchContactPhone: '+30 2810 000001',
      countryCode: 'GR',
      isVatVerified: true,
      vatVerificationDate: '2026-01-15',
      eoriNumber: 'EL999999991',
    },
    travelerType: 'wine_enthusiast',
    visitedProducers: ['domaine-paterianakis'],
    personalNotes: {},
    memberSince: '2024',
  },
  manousakis: {
    id: 'producer_valley_vineyard',
    name: 'Jane Miller',
    email: 'host@demo-vineyard.com',
    avatar: '🍷',
    hometown: 'Vatolakkos, Chania',
    role: 'producer',
    isProducer: true,
    claimedProducerId: 'manousakis-winery',
    producerName: 'Manousakis Winery (Nostos Wines)',
    claimStatus: 'verified_host',
    taxDetails: {
      vatNumber: 'EL999999992',
      legalBusinessName: 'MANOUSAKIS WINERY SINGLE MEMBER P.C. (DEMO)',
      taxOffice: 'Chania Tax Office',
      registeredAddress: 'Vatolakkos, Platanias, Chania, GR-73005, Crete',
      dispatchContactPhone: '+30 28210 000002',
      countryCode: 'GR',
      isVatVerified: true,
      vatVerificationDate: '2025-11-20',
      eoriNumber: 'EL999999992',
    },
    travelerType: 'wine_enthusiast',
    visitedProducers: ['manousakis-winery'],
    personalNotes: {},
    memberSince: '2023',
  },
  charma: {
    id: 'producer_craft_brewery',
    name: 'David Wilson',
    email: 'brewer@demo-brewery.com',
    avatar: '🍺',
    hometown: 'Zounaki, Chania',
    role: 'producer',
    isProducer: true,
    claimedProducerId: 'cretan-brewery-charma',
    producerName: 'Cretan Brewery (Charma Beer)',
    claimStatus: 'verified_host',
    taxDetails: {
      vatNumber: 'EL999999993',
      legalBusinessName: 'CRETAN BREWERY S.A. (DEMO)',
      taxOffice: 'Chania Tax Office',
      registeredAddress: 'Zounaki, Platanias, Chania, GR-73002, Crete',
      dispatchContactPhone: '+30 28210 000003',
      countryCode: 'GR',
      isVatVerified: true,
      vatVerificationDate: '2025-09-10',
      eoriNumber: 'EL999999993',
    },
    travelerType: 'craft_beer_explorer',
    visitedProducers: ['cretan-brewery-charma'],
    personalNotes: {},
    memberSince: '2025',
  },
  monteraponi: {
    id: 'producer_tuscan_estate',
    name: 'Marco Rossi',
    email: 'host@tuscany-estate-demo.it',
    avatar: '🏰',
    hometown: 'Radda in Chianti, Tuscany',
    role: 'producer',
    isProducer: true,
    claimedProducerId: 'monteraponi-tuscany',
    producerName: 'Azienda Agricola Monteraponi',
    claimStatus: 'verified_host',
    taxDetails: {
      vatNumber: 'IT99999999990',
      legalBusinessName: 'AZIENDA AGRICOLA MONTERAPONI (DEMO)',
      taxOffice: 'Ufficio di Siena',
      registeredAddress: 'Località Monteraponi, 53017 Radda in Chianti (SI), Tuscany, Italy',
      dispatchContactPhone: '+39 055 0000000',
      countryCode: 'IT',
      isVatVerified: true,
      vatVerificationDate: '2025-08-01',
      eoriNumber: 'IT99999999990',
    },
    travelerType: 'wine_enthusiast',
    visitedProducers: ['monteraponi-tuscany'],
    personalNotes: {},
    memberSince: '2024',
  },
};

// Helper to load user stamps and notes from local storage by user ID
const getUserData = (userId: string) => {
  try {
    const raw = localStorage.getItem(`terroir_data_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading user data:', e);
  }
  return { visitedProducers: [], personalNotes: {} };
};

const saveUserData = (
  userId: string, 
  visitedProducers: string[], 
  personalNotes: Record<string, string>,
  extra?: Partial<UserProfile>
) => {
  try {
    const prev = getUserData(userId);
    localStorage.setItem(
      `terroir_data_${userId}`,
      JSON.stringify({ ...prev, visitedProducers, personalNotes, ...extra })
    );
  } catch (e) {
    console.error('Error saving user data:', e);
  }
};

export const useAuth = () => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Error reading auth from localStorage:', e);
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Helper for human-readable Firebase Auth error messages
  const formatAuthError = (error: any): string => {
    if (!error) return 'An unexpected error occurred. Please try again.';
    const code = error.code || '';
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Incorrect email or password. Please verify your credentials.';
      case 'auth/email-already-in-use':
        return 'An account with this email address already exists. Please sign in instead.';
      case 'auth/weak-password':
        return 'Password is too weak. Please choose at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/popup-closed-by-user':
        return 'The sign-in popup was closed before completing.';
      case 'auth/popup-blocked':
        return 'The sign-in popup was blocked by your browser. Please allow popups for this site.';
      case 'auth/unauthorized-domain':
        return 'Unauthorized domain. Please add this domain to authorized domains in Firebase Console.';
      case 'auth/configuration-not-found':
        return 'Authentication is not yet enabled in Firebase Console. Go to Build ➔ Authentication to enable Email/Password and Google.';
      case 'auth/operation-not-allowed':
        return 'Apple Sign-In is not enabled yet in your Firebase Console. Please enable Apple in Firebase Console ➔ Authentication ➔ Sign-in method (requires Apple Developer credentials), or sign in with Google or Email.';
      case 'auth/too-many-requests':
        return 'Access has been temporarily disabled due to many failed attempts. Please reset your password or try again later.';
      case 'auth/network-request-failed':
        return 'Network connection error. Please check your internet connection.';
      default:
        return error.message || 'Authentication failed. Please try again.';
    }
  };

  // Helper to map a Firebase User + Cloud Firestore Profile to our UserProfile model
  const mapFirebaseUser = (
    fbUser: FirebaseUser, 
    customType?: TravelerType,
    cloudProfile?: Partial<UserProfile> | null
  ): UserProfile => {
    const existing = getUserData(fbUser.uid);
    const displayName = cloudProfile?.name || fbUser.displayName || existing.name || fbUser.email?.split('@')[0] || 'Terroir Explorer';
    const photo = fbUser.photoURL || cloudProfile?.avatar || existing.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=d97706&color=ffffff&bold=true&format=svg`;
    
    return {
      id: fbUser.uid,
      name: displayName,
      email: fbUser.email || cloudProfile?.email || existing.email || '',
      avatar: photo,
      hometown: cloudProfile?.hometown || existing.hometown || 'Explorer',
      role: cloudProfile?.role || existing.role || 'traveler',
      isProducer: cloudProfile?.isProducer ?? existing.isProducer ?? false,
      claimedProducerId: cloudProfile?.claimedProducerId || existing.claimedProducerId,
      producerName: cloudProfile?.producerName || existing.producerName,
      claimStatus: cloudProfile?.claimStatus || existing.claimStatus || (cloudProfile?.isProducer ? 'verified_host' : undefined),
      taxDetails: cloudProfile?.taxDetails || existing.taxDetails,
      travelerType: customType || cloudProfile?.travelerType || existing.travelerType || 'culinary_nomad',
      visitedProducers: cloudProfile?.visitedProducers || existing.visitedProducers || [],
      personalNotes: cloudProfile?.personalNotes || existing.personalNotes || {},
      memberSince: cloudProfile?.memberSince || existing.memberSince || '2026',
      hasExplorerPass: cloudProfile?.hasExplorerPass ?? existing.hasExplorerPass ?? false,
      explorerPassUntil: cloudProfile?.explorerPassUntil || existing.explorerPassUntil,
    };
  };

  // Listen to Firebase Auth state changes if Firebase is configured
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const cloudProfile = await fetchUserProfileFromCloud(fbUser.uid);
          const mapped = mapFirebaseUser(fbUser, undefined, cloudProfile);
          setUser(mapped);
          saveUserData(mapped.id, mapped.visitedProducers, mapped.personalNotes, mapped);
          if (!cloudProfile) {
            await saveUserProfileToCloud(mapped);
          }
        } catch (e) {
          console.warn('Error fetching cloud profile on auth change:', e);
          setUser((prev) => mapFirebaseUser(fbUser, prev?.travelerType));
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync current user state to localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        saveUserData(user.id, user.visitedProducers, user.personalNotes, user);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Error syncing auth to localStorage:', e);
    }
  }, [user]);

  // Real-Time Cross-Device Sync (Phone <-> Laptop) via Cloud Firestore
  useEffect(() => {
    if (!user?.id || !isFirebaseConfigured) return;

    const unsubscribe = subscribeToCloudUserProfile(user.id, (cloudData) => {
      setUser((prev) => {
        if (!prev || prev.id !== user.id) return prev;
        const merged: UserProfile = {
          ...prev,
          name: cloudData.name || prev.name,
          email: cloudData.email || prev.email,
          role: cloudData.role || prev.role,
          isProducer: cloudData.isProducer ?? prev.isProducer,
          claimedProducerId: cloudData.claimedProducerId || prev.claimedProducerId,
          producerName: cloudData.producerName || prev.producerName,
          claimStatus: cloudData.claimStatus || prev.claimStatus,
          taxDetails: cloudData.taxDetails || prev.taxDetails,
          travelerType: cloudData.travelerType || prev.travelerType,
          visitedProducers: cloudData.visitedProducers || prev.visitedProducers,
          personalNotes: { ...prev.personalNotes, ...(cloudData.personalNotes || {}) },
          hasExplorerPass: cloudData.hasExplorerPass ?? prev.hasExplorerPass,
          explorerPassUntil: cloudData.explorerPassUntil || prev.explorerPassUntil,
        };
        saveUserData(merged.id, merged.visitedProducers, merged.personalNotes, merged);
        return merged;
      });
    });

    return () => unsubscribe();
  }, [user?.id]);

  // 1. Google (Gmail) Sign-In
  const loginWithGoogle = useCallback(async (
    role: 'traveler' | 'producer' = 'traveler',
    claimedProducerId?: string,
    producerName?: string
  ) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      if (!isFirebaseConfigured || !auth) {
        throw new Error('FIREBASE_NOT_CONFIGURED');
      }
      const result = await signInWithPopup(auth, googleProvider);
      const cloudProfile = await fetchUserProfileFromCloud(result.user.uid);
      const mapped = mapFirebaseUser(result.user, 'culinary_nomad', cloudProfile);

      const isProducerRole = role === 'producer' || Boolean(cloudProfile?.isProducer);
      const resolvedProducerId = cloudProfile?.claimedProducerId || claimedProducerId;
      const resolvedProducerName = cloudProfile?.producerName || producerName;

      const finalUser: UserProfile = {
        ...mapped,
        role: isProducerRole ? 'producer' : (cloudProfile?.role || 'traveler'),
        isProducer: isProducerRole,
        claimedProducerId: resolvedProducerId,
        producerName: resolvedProducerName,
      };

      await saveUserProfileToCloud(finalUser);
      setUser(finalUser);
      saveUserData(finalUser.id, finalUser.visitedProducers, finalUser.personalNotes, finalUser);
      return finalUser;
    } catch (error: any) {
      console.error('Google Sign-in error:', error);
      const message = formatAuthError(error);
      setAuthError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. Apple Sign-In
  const loginWithApple = useCallback(async (
    role: 'traveler' | 'producer' = 'traveler',
    claimedProducerId?: string,
    producerName?: string
  ) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      if (!isFirebaseConfigured || !auth) {
        throw new Error('FIREBASE_NOT_CONFIGURED');
      }
      const result = await signInWithPopup(auth, appleProvider);
      const cloudProfile = await fetchUserProfileFromCloud(result.user.uid);
      const mapped = mapFirebaseUser(result.user, 'culinary_nomad', cloudProfile);

      const isProducerRole = role === 'producer' || Boolean(cloudProfile?.isProducer);
      const resolvedProducerId = cloudProfile?.claimedProducerId || claimedProducerId;
      const resolvedProducerName = cloudProfile?.producerName || producerName;

      const finalUser: UserProfile = {
        ...mapped,
        role: isProducerRole ? 'producer' : (cloudProfile?.role || 'traveler'),
        isProducer: isProducerRole,
        claimedProducerId: resolvedProducerId,
        producerName: resolvedProducerName,
      };

      await saveUserProfileToCloud(finalUser);
      setUser(finalUser);
      saveUserData(finalUser.id, finalUser.visitedProducers, finalUser.personalNotes, finalUser);
      return finalUser;
    } catch (error: any) {
      console.error('Apple Sign-in error:', error);
      const message = formatAuthError(error);
      setAuthError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 3. Email & Password Sign-In (Real Firebase Auth)
  const loginWithEmail = useCallback(async (email: string, password?: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      if (isFirebaseConfigured && auth && password) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const cloudProfile = await fetchUserProfileFromCloud(cred.user.uid);
        const mapped = mapFirebaseUser(cred.user, undefined, cloudProfile);
        setUser(mapped);
        saveUserData(mapped.id, mapped.visitedProducers, mapped.personalNotes, mapped);
        return mapped;
      } else {
        // Fallback local authentication
        const inferredName = email.split('@')[0];
        const newUser: UserProfile = {
          id: `user_${Date.now()}`,
          name: inferredName.charAt(0).toUpperCase() + inferredName.slice(1),
          email,
          avatar: '🧭',
          hometown: 'Explorer',
          travelerType: 'culinary_nomad',
          visitedProducers: [],
          personalNotes: {},
          memberSince: '2026',
        };
        setUser(newUser);
        return newUser;
      }
    } catch (error: any) {
      console.error('Email sign-in error:', error);
      const msg = formatAuthError(error);
      setAuthError(msg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 4. Email & Password Registration (Real Firebase Auth)
  const signupWithEmail = useCallback(async (
    name: string, 
    email: string, 
    password?: string, 
    travelerType: TravelerType = 'culinary_nomad'
  ) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      if (isFirebaseConfigured && auth && password) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await firebaseUpdateProfile(cred.user, { displayName: name });
        const mapped = mapFirebaseUser(cred.user, travelerType);
        mapped.name = name;
        await saveUserProfileToCloud(mapped);
        setUser(mapped);
        saveUserData(mapped.id, mapped.visitedProducers, mapped.personalNotes, mapped);
        return mapped;
      } else {
        // Fallback local
        const newUser: UserProfile = {
          id: `user_${Date.now()}`,
          name,
          email,
          avatar: travelerType === 'crete_local' ? '🇬🇷' : travelerType === 'craft_beer_explorer' ? '🍺' : '🍇',
          hometown: travelerType === 'crete_local' ? 'Crete, Greece' : 'World Traveler',
          travelerType,
          visitedProducers: [],
          personalNotes: {},
          memberSince: '2026',
        };
        setUser(newUser);
        return newUser;
      }
    } catch (error: any) {
      console.error('Email signup error:', error);
      const msg = formatAuthError(error);
      setAuthError(msg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 5. Send Real Password Reset Link
  const sendPasswordResetLink = useCallback(async (email: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      if (!isFirebaseConfigured || !auth) {
        throw new Error('Firebase authentication is not configured.');
      }
      await sendPasswordReset(email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      const msg = formatAuthError(error);
      setAuthError(msg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 6. 1-Click Demo Profiles (Giannis, Elena, Markos)
  const loginAsDemo = useCallback((demoKey: 'giannis' | 'elena' | 'markos') => {
    const profile = DEMO_PROFILES[demoKey] || DEMO_PROFILES.giannis;
    setUser({ ...profile });
    return profile;
  }, []);

  // 6b. 1-Click Demo Producer Profiles (Paterianakis, Manousakis, Charma, Monteraponi)
  const loginAsDemoProducer = useCallback((demoKey: 'paterianakis' | 'manousakis' | 'charma' | 'monteraponi') => {
    const profile = DEMO_PRODUCER_PROFILES[demoKey] || DEMO_PRODUCER_PROFILES.paterianakis;
    setUser({ ...profile });
    return profile;
  }, []);

  // 6c. Real Producer Sign In
  // Accepts (email, password) OR legacy (producerId, producerName, email, password)
  const loginAsProducer = useCallback(async (
    arg1: string,
    arg2?: string,
    arg3?: string,
    arg4?: string
  ) => {
    setIsLoading(true);
    setAuthError(null);

    // Resolve arguments
    let targetEmail = '';
    let targetPassword = '';
    let targetProducerId: string | undefined;
    let targetProducerName: string | undefined;

    if (arg1.includes('@')) {
      targetEmail = arg1;
      targetPassword = arg2 || '';
      targetProducerId = arg3;
      targetProducerName = arg4;
    } else {
      // Legacy: (producerId, producerName, email, password)
      targetProducerId = arg1;
      targetProducerName = arg2;
      targetEmail = arg3 || '';
      targetPassword = arg4 || '';
    }

    try {
      if (isFirebaseConfigured && auth && targetPassword) {
        const cred = await signInWithEmailAndPassword(auth, targetEmail, targetPassword);
        const cloudProfile = await fetchUserProfileFromCloud(cred.user.uid);
        const mapped = mapFirebaseUser(cred.user, undefined, cloudProfile);
        
        const resolvedProducerId = cloudProfile?.claimedProducerId || mapped.claimedProducerId || targetProducerId;
        const resolvedProducerName = cloudProfile?.producerName || mapped.producerName || targetProducerName;

        const producerUser: UserProfile = {
          ...mapped,
          role: 'producer',
          isProducer: true,
          claimedProducerId: resolvedProducerId,
          producerName: resolvedProducerName,
        };

        await saveUserProfileToCloud(producerUser);
        saveUserData(producerUser.id, producerUser.visitedProducers, producerUser.personalNotes, producerUser);
        setUser(producerUser);
        return producerUser;
      } else {
        // Fallback local authentication
        const inferredName = targetEmail.split('@')[0];
        const producerUser: UserProfile = {
          id: `producer_${targetProducerId || 'estate'}_${Date.now()}`,
          name: inferredName.charAt(0).toUpperCase() + inferredName.slice(1),
          email: targetEmail,
          avatar: '🏛️',
          hometown: targetProducerName || 'Wine Estate',
          role: 'producer',
          isProducer: true,
          claimedProducerId: targetProducerId,
          producerName: targetProducerName,
          travelerType: 'wine_enthusiast',
          visitedProducers: targetProducerId ? [targetProducerId] : [],
          personalNotes: {},
          memberSince: '2026',
        };
        saveUserData(producerUser.id, producerUser.visitedProducers, producerUser.personalNotes, producerUser);
        setUser(producerUser);
        return producerUser;
      }
    } catch (error: any) {
      console.error('Producer login error:', error);
      const msg = formatAuthError(error);
      setAuthError(msg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 6d. Real Claim & Register Estate Host with Fiscal / VAT Verification
  const claimAndRegisterProducer = useCallback(async (
    producerId: string,
    producerName: string,
    hostName: string,
    email: string,
    password?: string,
    taxDetails?: ProducerTaxDetails
  ) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const claimStatus: HostClaimStatus = taxDetails?.isVatVerified
        ? 'verified_host'
        : taxDetails?.vatNumber
        ? 'pending_verification'
        : 'pending_verification';

      if (isFirebaseConfigured && auth && password) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await firebaseUpdateProfile(cred.user, { displayName: hostName });
        const mapped = mapFirebaseUser(cred.user);
        const producerUser: UserProfile = {
          ...mapped,
          name: hostName,
          email,
          role: 'producer',
          isProducer: true,
          claimedProducerId: producerId,
          producerName,
          claimStatus,
          taxDetails,
          travelerType: 'wine_enthusiast',
          visitedProducers: [producerId],
        };
        await saveUserProfileToCloud(producerUser);
        saveUserData(producerUser.id, producerUser.visitedProducers, producerUser.personalNotes, producerUser);
        setUser(producerUser);
        return producerUser;
      } else {
        const producerUser: UserProfile = {
          id: `producer_${producerId}_${Date.now()}`,
          name: hostName,
          email,
          avatar: '🏛️',
          hometown: producerName,
          role: 'producer',
          isProducer: true,
          claimedProducerId: producerId,
          producerName,
          claimStatus,
          taxDetails,
          travelerType: 'wine_enthusiast',
          visitedProducers: [producerId],
          personalNotes: {},
          memberSince: '2026',
        };
        saveUserData(producerUser.id, producerUser.visitedProducers, producerUser.personalNotes, producerUser);
        setUser(producerUser);
        return producerUser;
      }
    } catch (error: any) {
      console.error('Producer registration error:', error);
      const msg = formatAuthError(error);
      setAuthError(msg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 6e. Update Producer Fiscal & Shipping Details
  const updateProducerTaxDetails = useCallback(async (taxDetails: ProducerTaxDetails) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated: UserProfile = {
        ...prev,
        taxDetails,
        claimStatus: taxDetails.isVatVerified ? 'verified_host' : (prev.claimStatus || 'pending_verification'),
      };
      saveUserData(updated.id, updated.visitedProducers, updated.personalNotes, updated);
      saveUserProfileToCloud(updated);
      return updated;
    });
  }, []);

  // 6f. Sign Out
  const logout = useCallback(async () => {
    try {
      if (isFirebaseConfigured && auth) {
        await firebaseSignOut(auth);
      }
    } catch (e) {
      console.error('Sign out error:', e);
    }
    setUser(null);
  }, []);

  // 7. Toggle Passport Visited Stamp
  const toggleVisited = useCallback((producerId: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const isAlready = prev.visitedProducers.includes(producerId);
      const updated = isAlready
        ? prev.visitedProducers.filter((id) => id !== producerId)
        : [...prev.visitedProducers, producerId];
      
      const newProfile = {
        ...prev,
        visitedProducers: updated,
      };
      saveUserData(newProfile.id, updated, newProfile.personalNotes, newProfile);
      saveUserProfileToCloud(newProfile);
      return newProfile;
    });
  }, []);

  const isVisited = useCallback((producerId: string) => {
    return user ? user.visitedProducers.includes(producerId) : false;
  }, [user]);

  // 8. Personal Tasting Notes
  const saveTastingNote = useCallback((producerId: string, note: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const newNotes = { ...prev.personalNotes };
      if (note.trim()) {
        newNotes[producerId] = note.trim();
      } else {
        delete newNotes[producerId];
      }
      const newProfile = {
        ...prev,
        personalNotes: newNotes,
      };
      saveUserData(newProfile.id, newProfile.visitedProducers, newNotes, newProfile);
      saveUserProfileToCloud(newProfile);
      return newProfile;
    });
  }, []);

  const getTastingNote = useCallback((producerId: string) => {
    return user?.personalNotes[producerId] || '';
  }, [user]);

  // 9. VIP Explorer Pass Activation
  const activateExplorerPass = useCallback((durationDays: number = 365) => {
    setUser((prev) => {
      if (!prev) return prev;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + durationDays);
      const newProfile: UserProfile = {
        ...prev,
        hasExplorerPass: true,
        explorerPassUntil: expiryDate.toISOString(),
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
        saveUserData(newProfile.id, newProfile.visitedProducers, newProfile.personalNotes, newProfile);
        saveUserProfileToCloud(newProfile);
      } catch (e) {
        console.error('Error saving updated explorer pass to localStorage:', e);
      }
      return newProfile;
    });
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isFirebaseConfigured,
    isLoading,
    authError,
    setAuthError,
    loginWithGoogle,
    loginWithApple,
    loginWithEmail,
    signupWithEmail,
    sendPasswordResetLink,
    loginAsDemo,
    loginAsDemoProducer,
    loginAsProducer,
    claimAndRegisterProducer,
    updateProducerTaxDetails,
    logout,
    toggleVisited,
    isVisited,
    saveTastingNote,
    getTastingNote,
    activateExplorerPass,
  };
};

