import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  readStorage,
  writeStorage,
  STORAGE_KEYS,
} from '../services/browserStorage';
import {
  normalizeFavoriteProducerIds,
  saveTravelerFavoritesToCloud,
  subscribeToTravelerFavorites,
} from '../services/travelerFavoritesCloud';
import { logger } from '../services/logger';
import { trackIntent, type SourceSurface } from '../services/intentAnalytics';

const GUEST_FAVORITES_KEY = STORAGE_KEYS.FAVORITES;

const getFavoritesStorageKey = (ownerId?: string | null) =>
  ownerId ? `${GUEST_FAVORITES_KEY}:${ownerId}` : GUEST_FAVORITES_KEY;

const readFavorites = (storageKey: string) =>
  normalizeFavoriteProducerIds(
    readStorage<string[]>(storageKey, [], {
      scope: 'Favorites',
      validator: (data) => Array.isArray(data),
    })
  );

export function useFavorites(ownerId?: string | null) {
  const storageKey = useMemo(() => getFavoritesStorageKey(ownerId), [ownerId]);
  const activeStorageKeyRef = useRef(storageKey);
  const migrationAttemptedForRef = useRef<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => readFavorites(storageKey));

  // Swap to the correct local cache whenever account identity changes. Guest
  // favorites deliberately remain separate and are never auto-copied into an account.
  useEffect(() => {
    if (activeStorageKeyRef.current === storageKey) return;
    activeStorageKeyRef.current = storageKey;
    migrationAttemptedForRef.current = null;
    setFavorites(readFavorites(storageKey));
  }, [storageKey]);

  // Signed-in favorites are authoritative in the private Firestore user profile.
  // The per-account browser key remains a cache/offline fallback. Older local-only
  // saved producers are migrated once if the cloud field does not exist yet.
  useEffect(() => {
    if (!ownerId) return;

    return subscribeToTravelerFavorites(
      ownerId,
      (remoteFavorites) => {
        if (activeStorageKeyRef.current !== storageKey) return;

        if (remoteFavorites === null) {
          const cached = readFavorites(storageKey);
          setFavorites(cached);
          if (
            cached.length > 0 &&
            migrationAttemptedForRef.current !== ownerId
          ) {
            migrationAttemptedForRef.current = ownerId;
            void saveTravelerFavoritesToCloud(ownerId, cached).catch((error) => {
              logger.warn('Favorites', 'cloud_migration_failed', {
                reason: error instanceof Error ? error.message : String(error),
              });
            });
          }
          return;
        }

        const normalized = normalizeFavoriteProducerIds(remoteFavorites);
        writeStorage(storageKey, normalized, { scope: 'Favorites' });
        setFavorites(normalized);
      },
      (error) => {
        logger.warn('Favorites', 'cloud_subscription_failed', {
          reason: error instanceof Error ? error.message : String(error),
        });
      }
    );
  }, [ownerId, storageKey]);

  const persist = useCallback((next: string[]) => {
    const normalized = normalizeFavoriteProducerIds(next);
    writeStorage(storageKey, normalized, { scope: 'Favorites' });
    if (ownerId) {
      void saveTravelerFavoritesToCloud(ownerId, normalized).catch((error) => {
        logger.warn('Favorites', 'cloud_write_failed', {
          reason: error instanceof Error ? error.message : String(error),
        });
      });
    }
    return normalized;
  }, [ownerId, storageKey]);

  const toggleFavorite = useCallback(
    (id: string, sourceSurface: SourceSurface = 'producer_drawer') => {
      setFavorites((prev) => {
        const isFavorited = prev.includes(id);
        const next = isFavorited ? prev.filter((item) => item !== id) : [...prev, id];
        const normalized = normalizeFavoriteProducerIds(next);
        writeStorage(storageKey, normalized, { scope: 'Favorites' });
        if (ownerId) {
          saveTravelerFavoritesToCloud(ownerId, normalized)
            .then(() => {
              void trackIntent({
                event: isFavorited ? 'producer_unsave' : 'producer_save',
                sourceSurface,
                producerId: id,
              });
            })
            .catch((error) => {
              logger.warn('Favorites', 'cloud_write_failed', {
                reason: error instanceof Error ? error.message : String(error),
              });
            });
        }
        return normalized;
      });
    },
    [ownerId, storageKey]
  );

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  );

  const clearFavorites = useCallback(() => {
    setFavorites(() => persist([]));
  }, [persist]);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
  };
}
