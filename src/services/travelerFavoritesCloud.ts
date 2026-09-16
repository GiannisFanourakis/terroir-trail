import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';

const MAX_FAVORITES = 500;

export const normalizeFavoriteProducerIds = (ids: unknown): string[] => {
  if (!Array.isArray(ids)) return [];
  const unique = new Set<string>();
  for (const value of ids) {
    if (typeof value !== 'string') continue;
    const id = value.trim();
    if (!id || id.length > 200) continue;
    unique.add(id);
    if (unique.size >= MAX_FAVORITES) break;
  }
  return Array.from(unique);
};

export const saveTravelerFavoritesToCloud = async (
  userId: string,
  favoriteProducerIds: string[]
): Promise<void> => {
  if (!isFirebaseConfigured || !db) return;
  await auth?.authStateReady();
  if (!auth?.currentUser || auth.currentUser.uid !== userId) {
    throw new Error('The signed-in account changed before saved producers could sync.');
  }

  await setDoc(
    doc(db, 'users', userId),
    {
      favoriteProducerIds: normalizeFavoriteProducerIds(favoriteProducerIds),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
};

export const subscribeToTravelerFavorites = (
  userId: string,
  onUpdate: (favoriteProducerIds: string[] | null) => void,
  onError?: (error: unknown) => void
): (() => void) => {
  if (!isFirebaseConfigured || !db || !userId) return () => {};

  return onSnapshot(
    doc(db, 'users', userId),
    (snapshot) => {
      if (!snapshot.exists()) {
        onUpdate(null);
        return;
      }
      const data = snapshot.data();
      if (!Object.prototype.hasOwnProperty.call(data, 'favoriteProducerIds')) {
        onUpdate(null);
        return;
      }
      onUpdate(normalizeFavoriteProducerIds(data.favoriteProducerIds));
    },
    (error) => onError?.(error)
  );
};
