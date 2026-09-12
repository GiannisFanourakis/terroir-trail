import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
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
  signInWithCredential,
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile as firebaseUpdateProfile,
  User as FirebaseUser,
  GoogleAuthProvider
} from 'firebase/auth';
import { DEMO_PROFILES, DEMO_PRODUCER_PROFILES } from '../data/demoProfiles';
import { formatAuthError } from '../utils/authErrors';
import { useExplorerPass } from './useExplorerPass';

export { DEMO_PROFILES, DEMO_PRODUCER_PROFILES };

const STORAGE_KEY = 'terroir_trail_user';


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
  const { pass, refreshExplorerPass } = useExplorerPass(user?.id);



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

      let firebaseUser: FirebaseUser;

      if (Capacitor.isNativePlatform()) {
        const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
        const nativeResult = await FirebaseAuthentication.signInWithGoogle();

        if (nativeResult.credential?.idToken) {
          const credential = GoogleAuthProvider.credential(nativeResult.credential.idToken);
          const authRes = await signInWithCredential(auth, credential);
          firebaseUser = authRes.user;
        } else if (auth.currentUser) {
          firebaseUser = auth.currentUser;
        } else {
          throw new Error('No credentials returned from Google Sign-In.');
        }
      } else {
        const result = await signInWithPopup(auth, googleProvider);
        firebaseUser = result.user;
      }

      const cloudProfile = await fetchUserProfileFromCloud(firebaseUser.uid);
      const mapped = mapFirebaseUser(firebaseUser, 'culinary_nomad', cloudProfile);

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
      if (Capacitor.isNativePlatform()) {
        try {
          const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
          await FirebaseAuthentication.signOut();
        } catch (e) {
          console.warn('Native sign out error:', e);
        }
      }
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

  return {
    // Cached profiles and demo accounts cannot grant paid entitlements.
    user: user ? {
      ...user,
      hasExplorerPass: !!pass,
      explorerPassUntil: pass?.expiresAt,
      explorerPassId: pass?.passId,
      explorerPassPlan: pass?.plan,
    } : null,
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
    refreshExplorerPass,
  };
};

