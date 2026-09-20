import { useState, useEffect, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { UserProfile, TravelerType, ProducerTaxDetails, ProducerRegistrationRecord } from '../types/auth';
import {
  auth,
  googleProvider,
  appleProvider,
  isFirebaseConfigured,
  saveUserProfileToCloud,
  fetchUserProfileFromCloud,
  fetchUserProducerOwnerships,
  ProducerOwnershipRecord,
  saveProducerRegistrationToCloud,
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
  User as FirebaseUser
} from 'firebase/auth';
import { DEMO_PROFILES, DEMO_PRODUCER_PROFILES } from '../data/demoProfiles';
import { formatAuthError } from '../utils/authErrors';
import { useExplorerPass } from './useExplorerPass';
import { createGoogleWebCredential, createAppleWebCredential } from '../services/authBridging';
import { logger } from '../services/logger';
import { requestTravelerWelcomeEmail } from '../services/accountEmailApi';

import {
  readStorage,
  writeStorage,
  removeStorage,
  STORAGE_KEYS,
} from '../services/browserStorage';
import {
  rotateAnalyticsSessionId,
  trackIntent,
  type SourceSurface,
} from '../services/intentAnalytics';

export { DEMO_PROFILES, DEMO_PRODUCER_PROFILES };

const STORAGE_KEY = STORAGE_KEYS.AUTH_USER;

const sendTravelerWelcomeSafely = async (name: string) => {
  try {
    await requestTravelerWelcomeEmail(name);
  } catch (error) {
    logger.warn('Auth', 'welcome_email_failed', {
      reason: error instanceof Error ? error.message : String(error),
    });
  }
};

const getUserData = (userId: string): Partial<UserProfile> & {
  visitedProducers: string[];
  personalNotes: Record<string, string>;
} => {
  const defaultData = { visitedProducers: [] as string[], personalNotes: {} as Record<string, string> };
  const raw = readStorage<Partial<UserProfile> & { visitedProducers?: string[]; personalNotes?: Record<string, string> }>(
    `${STORAGE_KEYS.USER_DATA_PREFIX}${userId}`,
    defaultData,
    { scope: 'Auth' }
  );
  return {
    ...raw,
    visitedProducers: Array.isArray(raw?.visitedProducers) ? raw.visitedProducers : [],
    personalNotes:
      raw?.personalNotes && typeof raw.personalNotes === 'object' ? raw.personalNotes : {},
  };
};

const saveUserData = (
  userId: string,
  visitedProducers: string[],
  personalNotes: Record<string, string>,
  extra?: Partial<UserProfile>
) => {
  const prev = getUserData(userId);
  writeStorage(
    `${STORAGE_KEYS.USER_DATA_PREFIX}${userId}`,
    { ...prev, visitedProducers, personalNotes, ...extra },
    { scope: 'Auth' }
  );
};

export const KNOWN_HISTORICAL_DEMO_USER_IDS = new Set([
  'user_john_smith',
  'user_jane_doe',
  'user_alex_miller',
  'user_giannis',
  'user_elena',
  'user_markos',
  'producer_fake_winery',
  'producer_valley_vineyard',
  'producer_craft_brewery',
  'producer_tuscan_estate',
  'producer_paterianakis',
  'producer_manousakis',
  'producer_charma',
  'producer_monteraponi',
]);

const isKnownDemoUserId = (id: string): boolean => {
  return (
    KNOWN_HISTORICAL_DEMO_USER_IDS.has(id) ||
    Object.values(DEMO_PROFILES).some((d) => d.id === id) ||
    Object.values(DEMO_PRODUCER_PROFILES).some((d) => d.id === id)
  );
};

export const useAuth = () => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const parsed = readStorage<any>(STORAGE_KEY, null, { scope: 'Auth' });
    if (!parsed || typeof parsed !== 'object' || !parsed.id) return null;
    if (isFirebaseConfigured && isKnownDemoUserId(parsed.id)) {
      removeStorage(STORAGE_KEY, { scope: 'Auth' });
      return null;
    }
    return {
      ...parsed,
      producerIds: Array.isArray(parsed.producerIds) ? parsed.producerIds : [],
      interests: Array.isArray(parsed.interests) ? parsed.interests : [],
      visitedProducers: Array.isArray(parsed.visitedProducers) ? parsed.visitedProducers : [],
      personalNotes: parsed.personalNotes && typeof parsed.personalNotes === 'object' ? parsed.personalNotes : {},
    };
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const prevAuthUidRef = useRef<string | null>(user?.id ?? null);
  const { pass, refreshExplorerPass } = useExplorerPass(user?.id);

  const mapFirebaseUser = (
    fbUser: FirebaseUser,
    customType?: TravelerType,
    cloudProfile?: Partial<UserProfile> | null,
    trustedOwnerships: ProducerOwnershipRecord[] = []
  ): UserProfile => {
    const existing = getUserData(fbUser.uid);
    const displayName = cloudProfile?.name || fbUser.displayName || existing.name || fbUser.email?.split('@')[0] || 'Terroir Explorer';
    const photo = fbUser.photoURL || cloudProfile?.avatar || existing.avatar || undefined;
    const producerIds = Array.from(new Set(
      trustedOwnerships
        .filter(ownership => ownership.status === 'active' && ownership.producerId)
        .map(ownership => ownership.producerId)
    ));
    const primaryProducerId = producerIds[0];
    const isTrustedHost = producerIds.length > 0;

    return {
      id: fbUser.uid,
      name: displayName,
      email: fbUser.email || cloudProfile?.email || existing.email || '',
      ...(photo ? { avatar: photo } : {}),
      ...(cloudProfile?.hometown || existing.hometown
        ? { hometown: cloudProfile?.hometown || existing.hometown }
        : {}),
      role: isTrustedHost ? 'producer' : 'traveler',
      isProducer: isTrustedHost,
      producerIds,
      claimedProducerId: primaryProducerId,
      producerName: isTrustedHost ? (cloudProfile?.producerName || existing.producerName) : undefined,
      claimStatus: isTrustedHost
        ? 'verified_host'
        : (existing.claimStatus === 'verified_host' ? 'unclaimed' : (existing.claimStatus || 'unclaimed')),
      taxDetails: isTrustedHost ? existing.taxDetails : undefined,
      interests: Array.isArray(cloudProfile?.interests)
        ? cloudProfile?.interests
        : (Array.isArray(existing.interests) ? existing.interests : []),
      travelerType: customType || cloudProfile?.travelerType || existing.travelerType || 'culinary_nomad',
      visitedProducers: cloudProfile?.visitedProducers || existing.visitedProducers || [],
      personalNotes: cloudProfile?.personalNotes || existing.personalNotes || {},
      memberSince: cloudProfile?.memberSince || existing.memberSince || '2026',
      hasExplorerPass: cloudProfile?.hasExplorerPass ?? existing.hasExplorerPass ?? false,
      explorerPassUntil: cloudProfile?.explorerPassUntil || existing.explorerPassUntil,
    };
  };

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      const currentUid = fbUser?.uid ?? null;
      if (prevAuthUidRef.current !== currentUid) {
        prevAuthUidRef.current = currentUid;
        rotateAnalyticsSessionId();
      }

      if (fbUser) {
        try {
          const [cloudProfile, trustedOwnerships] = await Promise.all([
            fetchUserProfileFromCloud(fbUser.uid),
            fetchUserProducerOwnerships(fbUser.uid),
          ]);
          const mapped = mapFirebaseUser(fbUser, undefined, cloudProfile, trustedOwnerships);
          setUser(mapped);
          saveUserData(mapped.id, mapped.visitedProducers, mapped.personalNotes, mapped);
          if (!cloudProfile) {
            await saveUserProfileToCloud(mapped);
          }
        } catch (e) {
          logger.warn('Auth', 'cloud_profile_fetch_failed', { reason: e instanceof Error ? e.message : String(e) });
          setUser((prev) => mapFirebaseUser(fbUser, prev?.travelerType));
        }
      } else {
        removeStorage(STORAGE_KEY, { scope: 'Auth' });
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      writeStorage(STORAGE_KEY, user, { scope: 'Auth' });
      saveUserData(user.id, user.visitedProducers, user.personalNotes, user);
    } else {
      removeStorage(STORAGE_KEY, { scope: 'Auth' });
    }
  }, [user]);

  useEffect(() => {
    if (!user?.id || !isFirebaseConfigured) return;

    const unsubscribe = subscribeToCloudUserProfile(user.id, (cloudData) => {
      setUser((prev) => {
        if (!prev || prev.id !== user.id) return prev;
        const merged: UserProfile = {
          ...prev,
          name: cloudData.name || prev.name,
          email: cloudData.email || prev.email,
          avatar: cloudData.avatar || prev.avatar,
          hometown: cloudData.hometown ?? prev.hometown,
          interests: Array.isArray(cloudData.interests) ? cloudData.interests : prev.interests,
          travelerType: cloudData.travelerType || prev.travelerType,
          visitedProducers: cloudData.visitedProducers || prev.visitedProducers,
          personalNotes: cloudData.personalNotes ?? prev.personalNotes,
        };
        saveUserData(merged.id, merged.visitedProducers, merged.personalNotes, merged);
        return merged;
      });
    });

    return () => unsubscribe();
  }, [user?.id]);

  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      if (!isFirebaseConfigured || !auth) throw new Error('FIREBASE_NOT_CONFIGURED');

      let firebaseUser: FirebaseUser;
      if (Capacitor.isNativePlatform()) {
        const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
        const nativeResult = await FirebaseAuthentication.signInWithGoogle({ skipNativeAuth: true });
        if (nativeResult.credential?.idToken) {
          const credential = createGoogleWebCredential({
            idToken: nativeResult.credential.idToken,
            accessToken: nativeResult.credential.accessToken,
          });
          firebaseUser = (await signInWithCredential(auth, credential)).user;
        } else if (auth.currentUser) {
          firebaseUser = auth.currentUser;
        } else {
          throw new Error('No credentials returned from Google Sign-In.');
        }
      } else {
        firebaseUser = (await signInWithPopup(auth, googleProvider)).user;
      }

      const [cloudProfile, trustedOwnerships] = await Promise.all([
        fetchUserProfileFromCloud(firebaseUser.uid),
        fetchUserProducerOwnerships(firebaseUser.uid),
      ]);
      const mapped = mapFirebaseUser(firebaseUser, 'culinary_nomad', cloudProfile, trustedOwnerships);
      await saveUserProfileToCloud(mapped);
      await sendTravelerWelcomeSafely(mapped.name);
      setUser(mapped);
      saveUserData(mapped.id, mapped.visitedProducers, mapped.personalNotes, mapped);
      return mapped;
    } catch (error: any) {
      console.error('Google Sign-in error:', error);
      setAuthError(formatAuthError(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithApple = useCallback(async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      if (!isFirebaseConfigured || !auth) throw new Error('FIREBASE_NOT_CONFIGURED');

      let firebaseUser: FirebaseUser;
      if (Capacitor.isNativePlatform()) {
        const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
        const nativeResult = await FirebaseAuthentication.signInWithApple({ skipNativeAuth: true });
        if (nativeResult.credential?.idToken) {
          const credential = createAppleWebCredential({
            idToken: nativeResult.credential.idToken,
            nonce: nativeResult.credential.nonce,
          });
          firebaseUser = (await signInWithCredential(auth, credential)).user;
        } else if (auth.currentUser) {
          firebaseUser = auth.currentUser;
        } else {
          throw new Error('No credentials returned from Apple Sign-In.');
        }
      } else {
        firebaseUser = (await signInWithPopup(auth, appleProvider)).user;
      }

      const [cloudProfile, trustedOwnerships] = await Promise.all([
        fetchUserProfileFromCloud(firebaseUser.uid),
        fetchUserProducerOwnerships(firebaseUser.uid),
      ]);
      const mapped = mapFirebaseUser(firebaseUser, 'culinary_nomad', cloudProfile, trustedOwnerships);
      await saveUserProfileToCloud(mapped);
      await sendTravelerWelcomeSafely(mapped.name);
      setUser(mapped);
      saveUserData(mapped.id, mapped.visitedProducers, mapped.personalNotes, mapped);
      return mapped;
    } catch (error: any) {
      console.error('Apple Sign-in error:', error);
      setAuthError(formatAuthError(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithEmail = useCallback(async (email: string, password?: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      if (!isFirebaseConfigured || !auth) throw new Error('FIREBASE_NOT_CONFIGURED');
      if (!password) throw new Error('Password is required.');
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const [cloudProfile, trustedOwnerships] = await Promise.all([
        fetchUserProfileFromCloud(cred.user.uid),
        fetchUserProducerOwnerships(cred.user.uid),
      ]);
      const mapped = mapFirebaseUser(cred.user, undefined, cloudProfile, trustedOwnerships);
      setUser(mapped);
      saveUserData(mapped.id, mapped.visitedProducers, mapped.personalNotes, mapped);
      return mapped;
    } catch (error: any) {
      console.error('Email sign-in error:', error);
      setAuthError(formatAuthError(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signupWithEmail = useCallback(async (
    name: string,
    email: string,
    password?: string,
    travelerType: TravelerType = 'culinary_nomad'
  ) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      if (!isFirebaseConfigured || !auth) throw new Error('FIREBASE_NOT_CONFIGURED');
      if (!password) throw new Error('Password is required.');
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await firebaseUpdateProfile(cred.user, { displayName: name });
      const mapped = mapFirebaseUser(cred.user, travelerType);
      mapped.name = name;
      await saveUserProfileToCloud(mapped);
      await sendTravelerWelcomeSafely(mapped.name);
      setUser(mapped);
      saveUserData(mapped.id, mapped.visitedProducers, mapped.personalNotes, mapped);
      return mapped;
    } catch (error: any) {
      console.error('Email signup error:', error);
      setAuthError(formatAuthError(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendPasswordResetLink = useCallback(async (email: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      if (!isFirebaseConfigured) throw new Error('FIREBASE_NOT_CONFIGURED');
      await sendPasswordReset(email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      setAuthError(formatAuthError(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginAsDemo = useCallback((demoKey: 'giannis' | 'elena' | 'markos') => {
    if (isFirebaseConfigured) {
      throw new Error('DEMO_AUTH_DISABLED: Demo traveler logins are disabled when cloud services are configured');
    }
    const profile = DEMO_PROFILES[demoKey] || DEMO_PROFILES.giannis;
    setUser({ ...profile });
    return profile;
  }, []);

  const loginAsDemoProducer = useCallback((demoKey: 'paterianakis' | 'manousakis' | 'charma' | 'monteraponi') => {
    if (isFirebaseConfigured) {
      throw new Error('DEMO_AUTH_DISABLED: Demo producer logins are disabled when cloud services are configured');
    }
    const profile = DEMO_PRODUCER_PROFILES[demoKey] || DEMO_PRODUCER_PROFILES.paterianakis;
    setUser({ ...profile });
    return profile;
  }, []);

  const loginAsProducer = useCallback(async (
    arg1: string,
    arg2?: string,
    arg3?: string,
    arg4?: string
  ) => {
    setIsLoading(true);
    setAuthError(null);

    let targetEmail = '';
    let targetPassword = '';
    if (arg1.includes('@')) {
      targetEmail = arg1;
      targetPassword = arg2 || '';
    } else {
      targetEmail = arg3 || '';
      targetPassword = arg4 || '';
    }

    try {
      if (!isFirebaseConfigured || !auth) throw new Error('FIREBASE_NOT_CONFIGURED');
      if (!targetPassword) throw new Error('Password is required for producer login.');
      const cred = await signInWithEmailAndPassword(auth, targetEmail, targetPassword);
      const [cloudProfile, trustedOwnerships] = await Promise.all([
        fetchUserProfileFromCloud(cred.user.uid),
        fetchUserProducerOwnerships(cred.user.uid),
      ]);
      const mapped = mapFirebaseUser(cred.user, undefined, cloudProfile, trustedOwnerships);
      saveUserData(mapped.id, mapped.visitedProducers, mapped.personalNotes, mapped);
      setUser(mapped);
      return mapped;
    } catch (error: any) {
      console.error('Producer login error:', error);
      setAuthError(formatAuthError(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const claimAndRegisterProducer = useCallback(async (
    producerId: string,
    producerName: string,
    hostName: string,
    email: string,
    password?: string,
    taxDetails?: ProducerTaxDetails,
    termsAccepted = false
  ) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      if (!isFirebaseConfigured || !auth) throw new Error('FIREBASE_NOT_CONFIGURED');
      if (!password) throw new Error('Password is required for producer registration.');
      if (!termsAccepted) throw new Error('You must accept the TerroirTrail Producer Terms before submitting a claim.');
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await firebaseUpdateProfile(cred.user, { displayName: hostName });
      const mapped = mapFirebaseUser(cred.user);
      mapped.name = hostName;
      mapped.email = email;
      mapped.claimStatus = 'pending_verification';
      const now = new Date().toISOString();
      const claimRecord: ProducerRegistrationRecord = {
        id: producerId,
        producerId,
        userId: cred.user.uid,
        tradeBrandName: producerName,
        isVatVerified: false,
        representativeName: hostName,
        officialEmail: email,
        status: 'pending_verification',
        submittedAt: now,
        updatedAt: now,
        termsAccepted: true,
        ...(taxDetails?.legalBusinessName ? { legalBusinessName: taxDetails.legalBusinessName } : {}),
        ...(taxDetails?.vatNumber ? { vatNumber: taxDetails.vatNumber } : {}),
        ...(taxDetails?.countryCode ? { countryCode: taxDetails.countryCode } : {}),
      };
      await saveProducerRegistrationToCloud(claimRecord);
      await saveUserProfileToCloud(mapped);
      await sendTravelerWelcomeSafely(mapped.name);
      saveUserData(mapped.id, mapped.visitedProducers, mapped.personalNotes, mapped);
      setUser(mapped);
      return mapped;
    } catch (error: any) {
      console.error('Producer registration error:', error);
      setAuthError(formatAuthError(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProducerTaxDetails = useCallback(async (taxDetails: ProducerTaxDetails) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated: UserProfile = {
        ...prev,
        taxDetails,
      };
      saveUserData(updated.id, updated.visitedProducers, updated.personalNotes, updated);
      return updated;
    });
  }, []);

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
    prevAuthUidRef.current = null;
    rotateAnalyticsSessionId();
    setUser(null);
  }, []);

  const toggleVisited = useCallback((producerId: string, sourceSurface: SourceSurface = 'passport') => {
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
      void saveUserProfileToCloud(newProfile)
        .then(() => {
          void trackIntent({
            event: isAlready ? 'passport_stamp_removed' : 'passport_stamp_added',
            sourceSurface,
            producerId,
          });
        })
        .catch((err) => {
          logger.warn('Auth', 'passport_cloud_sync_failed_analytics_suppressed', {
            reason: err instanceof Error ? err.message : String(err),
          });
        });
      return newProfile;
    });
  }, []);

  const isVisited = useCallback((producerId: string) => {
    return user ? user.visitedProducers.includes(producerId) : false;
  }, [user]);

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
      void saveUserProfileToCloud(newProfile);
      return newProfile;
    });
  }, []);

  const getTastingNote = useCallback((producerId: string) => {
    return user?.personalNotes[producerId] || '';
  }, [user]);

  return {
    user: user ? {
      ...user,
      producerIds: Array.isArray(user.producerIds) ? user.producerIds : [],
      interests: Array.isArray(user.interests) ? user.interests : [],
      visitedProducers: Array.isArray(user.visitedProducers) ? user.visitedProducers : [],
      personalNotes: user.personalNotes && typeof user.personalNotes === 'object' ? user.personalNotes : {},
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
