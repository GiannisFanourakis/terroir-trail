import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  readStorage,
  writeStorage,
  STORAGE_KEYS,
} from '../services/browserStorage';

const GUEST_FAVORITES_KEY = STORAGE_KEYS.FAVORITES;

const getFavoritesStorageKey = (ownerId?: string | null) =>
  ownerId ? `${GUEST_FAVORITES_KEY}:${ownerId}` : GUEST_FAVORITES_KEY;

const readFavorites = (storageKey: string) =>
  readStorage<string[]>(storageKey, [], {
    scope: 'Favorites',
    validator: (data) => Array.isArray(data),
  });

export function useFavorites(ownerId?: string | null) {
  const storageKey = useMemo(() => getFavoritesStorageKey(ownerId), [ownerId]);
  const activeStorageKeyRef = useRef(storageKey);
  const [favorites, setFavorites] = useState<string[]>(() => readFavorites(storageKey));

  // Persist only after state has been loaded for the active account/guest key.
  // Keeping this effect before the key-switch effect prevents guest favorites from
  // being copied into a newly signed-in account during the transition render.
  useEffect(() => {
    if (activeStorageKeyRef.current !== storageKey) return;
    writeStorage(storageKey, favorites, { scope: 'Favorites' });
  }, [favorites, storageKey]);

  // Swap to the correct local favorites collection whenever account identity changes.
  useEffect(() => {
    if (activeStorageKeyRef.current === storageKey) return;
    const nextFavorites = readFavorites(storageKey);
    activeStorageKeyRef.current = storageKey;
    setFavorites(nextFavorites);
  }, [storageKey]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  );

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
  };
}
