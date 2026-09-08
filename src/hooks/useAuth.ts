import { useState, useEffect, useCallback } from 'react';
import { UserProfile, TravelerType } from '../types/auth';
import { 
  auth, 
  googleProvider, 
  appleProvider, 
  isFirebaseConfigured,
  syncUserProfileToCloud,
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
    id: 'user_giannis',
    name: 'Giannis Fanourakis',
    email: 'giannis@terroirtrail.gr',
    avatar: '🇬🇷',
    hometown: 'Heraklion, Crete',
    travelerType: 'crete_local',
    visitedProducers: ['charma-brewery', 'paterianakis', 'gasparis-dairy', 'biolea-astrikas'],
    personalNotes: {
      'charma-brewery': 'Unpasteurized draft on the open-air deck is unbeatable on a warm Cretan afternoon.',
      'paterianakis': 'Their indigenous organic Vidiano fermented in oak has incredible minerality.',
    },
    memberSince: '2026',
  },
  elena: {
    id: 'user_elena',
    name: 'Elena Kazantzaki',
    email: 'elena.wine@sommelier.eu',
    avatar: '🍷',
    hometown: 'Athens / Santorini',
    travelerType: 'wine_enthusiast',
    visitedProducers: ['vassaltis-santorini', 'skouras-nemea', 'thymiopoulos-naoussa'],
    personalNotes: {
      'vassaltis-santorini': 'Pure basalt salinity and razor-sharp acidity. World-class Assyrtiko.',
    },
    memberSince: '2026',
  },
  markos: {
    id: 'user_markos',
    name: 'Markos V.',
    email: 'markos@craftbrews.gr',
    avatar: '🍺',
    hometown: 'Chania, Crete',
    travelerType: 'craft_beer_explorer',
    visitedProducers: ['solo-brewery', 'lafkas-brewery', 'santorini-brewing'],
    personalNotes: {
      'solo-brewery': 'Fourtouna Black IPA is arguably one of the best craft beers in Southern Europe.',
    },
    memberSince: '2026',
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

const saveUserData = (userId: string, visitedProducers: string[], personalNotes: Record<string, string>) => {
  try {
    localStorage.setItem(
      `terroir_data_${userId}`,
      JSON.stringify({ visitedProducers, personalNotes })
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

  // Helper to map a Firebase User to our UserProfile model
  const mapFirebaseUser = (fbUser: FirebaseUser, customType?: TravelerType): UserProfile => {
    const existing = getUserData(fbUser.uid);
    return {
      id: fbUser.uid,
      name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Terroir Explorer',
      email: fbUser.email || '',
      avatar: fbUser.photoURL || (customType === 'craft_beer_explorer' ? '🍺' : '🍇'),
      hometown: 'Explorer',
      travelerType: customType || 'culinary_nomad',
      visitedProducers: existing.visitedProducers,
      personalNotes: existing.personalNotes,
      memberSince: '2026',
    };
  };

  // Listen to Firebase Auth state changes if Firebase is configured
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setUser((prev) => {
          // If we already have this user, merge their current in-memory notes
          const mapped = mapFirebaseUser(fbUser, prev?.travelerType);
          return {
            ...mapped,
            visitedProducers: prev?.id === fbUser.uid ? prev.visitedProducers : mapped.visitedProducers,
            personalNotes: prev?.id === fbUser.uid ? prev.personalNotes : mapped.personalNotes,
          };
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync current user state to localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        saveUserData(user.id, user.visitedProducers, user.personalNotes);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Error syncing auth to localStorage:', e);
    }
  }, [user]);

  // Scenario A: Real-Time Cross-Device Sync (Phone <-> Laptop) via Cloud Firestore
  useEffect(() => {
    if (!user?.id || !isFirebaseConfigured) return;

    const unsubscribe = subscribeToCloudUserProfile(user.id, (cloudData) => {
      setUser((prev) => {
        if (!prev || prev.id !== user.id) return prev;
        const currentVisitedSet = new Set(prev.visitedProducers);
        const cloudVisited = cloudData.visitedProducers || [];
        const hasNewStamps = cloudVisited.some((id) => !currentVisitedSet.has(id));
        
        const mergedNotes = { ...prev.personalNotes, ...(cloudData.personalNotes || {}) };
        const mergedStamps = Array.from(new Set([...prev.visitedProducers, ...cloudVisited]));

        if (hasNewStamps || Object.keys(cloudData.personalNotes || {}).length > 0) {
          saveUserData(prev.id, mergedStamps, mergedNotes);
          return {
            ...prev,
            visitedProducers: mergedStamps,
            personalNotes: mergedNotes,
          };
        }
        return prev;
      });
    });

    return () => unsubscribe();
  }, [user?.id]);

  // 1. Google (Gmail) Sign-In
  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      if (!isFirebaseConfigured || !auth) {
        throw new Error('FIREBASE_NOT_CONFIGURED');
      }
      const result = await signInWithPopup(auth, googleProvider);
      const mapped = mapFirebaseUser(result.user, 'culinary_nomad');
      setUser(mapped);
      return mapped;
    } catch (error: any) {
      console.error('Google Sign-in error:', error);
      const message = error.code === 'auth/popup-closed-by-user'
        ? 'Sign in popup was closed.'
        : error.code === 'auth/unauthorized-domain'
        ? 'Unauthorized domain. Please add localhost to Firebase authorized domains.'
        : error.message || 'Google sign-in failed.';
      setAuthError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. Apple Sign-In
  const loginWithApple = useCallback(async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      if (!isFirebaseConfigured || !auth) {
        throw new Error('FIREBASE_NOT_CONFIGURED');
      }
      const result = await signInWithPopup(auth, appleProvider);
      const mapped = mapFirebaseUser(result.user, 'culinary_nomad');
      setUser(mapped);
      return mapped;
    } catch (error: any) {
      console.error('Apple Sign-in error:', error);
      const message = error.code === 'auth/popup-closed-by-user'
        ? 'Sign in popup was closed.'
        : error.message || 'Apple sign-in failed.';
      setAuthError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 3. Email & Password Sign-In
  const loginWithEmail = useCallback(async (email: string, password?: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      if (isFirebaseConfigured && auth && password) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const mapped = mapFirebaseUser(cred.user);
        setUser(mapped);
        return mapped;
      } else {
        // Local fallback if Firebase is not yet configured
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
      const msg = error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential'
        ? 'Invalid email or password.'
        : error.message || 'Failed to sign in.';
      setAuthError(msg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 4. Email & Password Registration
  const signupWithEmail = useCallback(async (name: string, email: string, password?: string, travelerType: TravelerType = 'culinary_nomad') => {
    setIsLoading(true);
    setAuthError(null);
    try {
      if (isFirebaseConfigured && auth && password) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await firebaseUpdateProfile(cred.user, { displayName: name });
        const mapped = mapFirebaseUser(cred.user, travelerType);
        setUser(mapped);
        return mapped;
      } else {
        // Local fallback
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
      const msg = error.code === 'auth/email-already-in-use'
        ? 'This email is already registered.'
        : error.message || 'Failed to register account.';
      setAuthError(msg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 5. 1-Click Demo Profiles (Giannis, Elena, Markos)
  const loginAsDemo = useCallback((demoKey: 'giannis' | 'elena' | 'markos') => {
    const profile = DEMO_PROFILES[demoKey] || DEMO_PROFILES.giannis;
    setUser({ ...profile });
  }, []);

  // 6. Sign Out
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
      saveUserData(newProfile.id, updated, newProfile.personalNotes);
      syncUserProfileToCloud(newProfile.id, updated, newProfile.personalNotes);
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
      saveUserData(newProfile.id, newProfile.visitedProducers, newNotes);
      syncUserProfileToCloud(newProfile.id, newProfile.visitedProducers, newNotes);
      return newProfile;
    });
  }, []);

  const getTastingNote = useCallback((producerId: string) => {
    return user?.personalNotes[producerId] || '';
  }, [user]);

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
    loginAsDemo,
    logout,
    toggleVisited,
    isVisited,
    saveTastingNote,
    getTastingNote,
  };
};

