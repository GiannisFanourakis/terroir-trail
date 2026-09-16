import { onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';
import {
  readStorage,
  removeStorage,
  STORAGE_KEYS,
} from './browserStorage';

const clearAccountDeviceCache = (userId: string) => {
  removeStorage(`${STORAGE_KEYS.USER_DATA_PREFIX}${userId}`, { scope: 'AccountPrivacy' });
  removeStorage(`${STORAGE_KEYS.FAVORITES}:${userId}`, { scope: 'AccountPrivacy' });

  // Booking caches can contain traveler contact details. They are cloud-backed in
  // production, so remove the shared device cache whenever an authenticated
  // session ends rather than leaving another user’s data on the device.
  removeStorage(STORAGE_KEYS.TASTING_BOOKINGS, { scope: 'AccountPrivacy' });
  removeStorage(STORAGE_KEYS.CHAUFFEUR_BOOKINGS, { scope: 'AccountPrivacy' });
};

export const installAccountCachePrivacyGuard = (): (() => void) => {
  if (!isFirebaseConfigured || !auth) return () => {};

  const cachedUser = readStorage<{ id?: string } | null>(
    STORAGE_KEYS.AUTH_USER,
    null,
    { scope: 'AccountPrivacy' }
  );
  let lastAuthenticatedUid = cachedUser?.id || auth.currentUser?.uid || null;

  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      lastAuthenticatedUid = firebaseUser.uid;
      return;
    }

    if (lastAuthenticatedUid) {
      clearAccountDeviceCache(lastAuthenticatedUid);
      lastAuthenticatedUid = null;
    }
  });
};
