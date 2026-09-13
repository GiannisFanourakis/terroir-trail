import { useState, useEffect, useCallback } from 'react';
import {
  readStorage,
  writeStorage,
  STORAGE_KEYS,
} from '../services/browserStorage';

const STORAGE_KEY = STORAGE_KEYS.FAVORITES;

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    return readStorage<string[]>(STORAGE_KEY, [], {
      scope: 'Favorites',
      validator: (data) => Array.isArray(data),
    });
  });

  // Keep localStorage synced
  useEffect(() => {
    writeStorage(STORAGE_KEY, favorites, { scope: 'Favorites' });
  }, [favorites]);

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
