import { useState, useEffect, useCallback, useRef } from 'react';
import { Producer } from '../types/terroir';

/**
 * Google Maps Platform (Places API New) Integration
 * Compliant with Google Maps Terms of Service & Agentskills Directives:
 * - Mandatory Tracking Solution ID: gmp_git_agentskills_v1
 * - No Permanent Caching: Photos retrieved dynamically per session
 * - Author Attribution: Full attribution data preserved and rendered alongside imagery
 * - Resizable URIs: Generated via photo.getURI({ maxWidth, maxHeight })
 */

export const GMP_SOLUTION_ID = 'gmp_git_agentskills_v1';

export interface PhotoAuthorAttribution {
  displayName: string;
  uri?: string;
  photoURI?: string;
}

export interface EstatePlacePhoto {
  url: string;
  thumbUrl: string;
  attributions: PhotoAuthorAttribution[];
}

export interface EstatePhotosResult {
  producerId: string;
  placeId?: string;
  displayName?: string;
  photos: EstatePlacePhoto[];
  source: 'google_places' | 'curated_fallback';
}

// In-memory session cache (adheres to ToS Section 3.2.3(b): zero permanent disk storage)
const sessionPhotosCache = new Map<string, EstatePhotosResult>();

let mapsLoaderPromise: Promise<void> | null = null;

/**
 * Dynamically loads Google Maps JavaScript SDK with the modern Places library
 */
export function loadGoogleMapsPlacesApi(apiKey: string): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window is not defined'));
  }

  // Already loaded
  if (typeof window.google?.maps?.importLibrary === 'function') {
    return Promise.resolve();
  }

  if (mapsLoaderPromise) {
    return mapsLoaderPromise;
  }

  mapsLoaderPromise = new Promise<void>((resolve, reject) => {
    // Official Google Maps JS dynamic bootstrap loader
    const w = window as unknown as {
      google?: {
        maps?: {
          __ib__?: () => void;
          importLibrary?: unknown;
        };
      };
    };

    w.google = w.google || {};
    w.google.maps = w.google.maps || {};

    const script = document.createElement('script');
    const params = new URLSearchParams({
      key: apiKey,
      libraries: 'places',
      v: 'weekly',
      callback: 'google.maps.__ib__',
    });

    script.src = "https://maps.googleapis.com/maps/api/js?" + params.toString();
    script.async = true;
    script.defer = true;

    w.google.maps.__ib__ = () => {
      resolve();
    };

    script.onerror = (err) => {
      mapsLoaderPromise = null;
      reject(new Error("Google Maps JavaScript API could not load: " + String(err)));
    };

    document.head.appendChild(script);
  });

  return mapsLoaderPromise;
}

/**
 * Returns the effective API key for Google Maps Platform calls:
 * Checks VITE_GOOGLE_MAPS_API_KEY first, then falls back to VITE_FIREBASE_API_KEY
 */
export function getEffectiveGoogleApiKey(): string | null {
  const explicitKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (explicitKey && typeof explicitKey === 'string' && explicitKey.trim().length > 0) {
    return explicitKey.trim();
  }

  const firebaseKey = import.meta.env.VITE_FIREBASE_API_KEY;
  if (firebaseKey && typeof firebaseKey === 'string' && firebaseKey.trim().length > 0) {
    return firebaseKey.trim();
  }

  return null;
}

/**
 * Formats curated fallback images into EstatePlacePhoto format
 */
export function getCuratedFallback(producer: Producer): EstatePhotosResult {
  const images = [producer.coverImage, ...(producer.gallery || [])].filter(
    (img, index, self) => img && self.indexOf(img) === index
  );

  return {
    producerId: producer.id,
    displayName: producer.name,
    photos: images.map((url) => ({
      url,
      thumbUrl: url,
      attributions: [
        {
          displayName: producer.name + " Archival Portfolio",
          uri: producer.website || producer.googleMapsUrl,
        },
      ],
    })),
    source: 'curated_fallback',
  };
}

/**
 * Fetches real estate photos from Google Places API (New) using Place.searchByText
 */
export async function fetchProducerGooglePhotos(producer: Producer): Promise<EstatePhotosResult> {
  // Check in-memory session cache first
  const cached = sessionPhotosCache.get(producer.id);
  if (cached) {
    return cached;
  }

  const apiKey = getEffectiveGoogleApiKey();
  if (!apiKey) {
    const fallback = getCuratedFallback(producer);
    sessionPhotosCache.set(producer.id, fallback);
    return fallback;
  }

  try {
    // 1. Ensure Google Maps Places library is loaded
    await loadGoogleMapsPlacesApi(apiKey);

    // 2. Import modern Places library
    const { Place } = (await google.maps.importLibrary('places')) as google.maps.PlacesLibrary;

    // 3. Construct SearchByTextRequest with mandatory tracking solution ID
    // Optimize text query by combining estate name with locality for high-precision matching
    const query = producer.name + ", " + (producer.village || producer.region || '');
    const searchLocation = {
      lat: producer.coordinates[0],
      lng: producer.coordinates[1],
    };

    const request: google.maps.places.SearchByTextRequest = {
      textQuery: query,
      fields: ['id', 'displayName', 'photos', 'formattedAddress'],
      locationBias: searchLocation,
      maxResultCount: 1,
      // Mandatory attribution ID for compliance
      internalUsageAttributionIds: [GMP_SOLUTION_ID],
    };

    const { places } = await Place.searchByText(request);

    if (places && places.length > 0) {
      const place = places[0];
      const placePhotos = place.photos;

      if (placePhotos && placePhotos.length > 0) {
        const photos: EstatePlacePhoto[] = placePhotos.map((p) => {
          // Get responsive URIs
          const url = p.getURI({ maxWidth: 1200, maxHeight: 900 }) || '';
          const thumbUrl = p.getURI({ maxWidth: 240, maxHeight: 180 }) || url;

          // Mandatory author attributions
          const rawAttributions = p.authorAttributions || [];
          const attributions: PhotoAuthorAttribution[] = rawAttributions.map((a) => ({
            displayName: a.displayName || 'Google Maps Contributor',
            uri: a.uri || undefined,
            photoURI: a.photoURI || undefined,
          }));

          return {
            url,
            thumbUrl,
            attributions: attributions.length > 0 ? attributions : [
              {
                displayName: 'Google Maps Contributor',
                uri: producer.googleMapsUrl,
              },
            ],
          };
        }).filter((item) => Boolean(item.url));

        if (photos.length > 0) {
          const result: EstatePhotosResult = {
            producerId: producer.id,
            placeId: place.id,
            displayName: place.displayName || producer.name,
            photos,
            source: 'google_places',
          };
          sessionPhotosCache.set(producer.id, result);
          return result;
        }
      }
    }

    // If no place or photos found, gracefully fall back to curated portfolio
    const fallback = getCuratedFallback(producer);
    sessionPhotosCache.set(producer.id, fallback);
    return fallback;
  } catch (err) {
    console.warn("[Google Places] Fallback to curated imagery for " + producer.name + ":", err);
    const fallback = getCuratedFallback(producer);
    sessionPhotosCache.set(producer.id, fallback);
    return fallback;
  }
}

/**
 * React Hook for seamless estate imagery loading with Google Places & Fallback
 */
export function useProducerPhotos(producer: Producer | null) {
  const [photosResult, setPhotosResult] = useState<EstatePhotosResult | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const activeProducerIdRef = useRef<string | null>(null);

  const loadPhotos = useCallback(async (p: Producer) => {
    activeProducerIdRef.current = p.id;

    // Check cache synchronously to avoid flicker
    const cached = sessionPhotosCache.get(p.id);
    if (cached) {
      setPhotosResult(cached);
      setActivePhotoIndex(0);
      setIsLoading(false);
      return;
    }

    // Set immediate curated fallback while fetching Google Places
    setPhotosResult(getCuratedFallback(p));
    setActivePhotoIndex(0);
    setIsLoading(true);

    try {
      const result = await fetchProducerGooglePhotos(p);
      // Ensure we only apply if the drawer is still open on this producer
      if (activeProducerIdRef.current === p.id) {
        setPhotosResult(result);
        setActivePhotoIndex(0);
      }
    } catch {
      if (activeProducerIdRef.current === p.id) {
        setPhotosResult(getCuratedFallback(p));
      }
    } finally {
      if (activeProducerIdRef.current === p.id) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (producer) {
      loadPhotos(producer);
    } else {
      setPhotosResult(null);
      activeProducerIdRef.current = null;
      setActivePhotoIndex(0);
      setIsLoading(false);
    }
  }, [producer, loadPhotos]);

  const photos = photosResult?.photos || [];
  const activePhoto = photos[activePhotoIndex] || (producer ? {
    url: producer.coverImage,
    thumbUrl: producer.coverImage,
    attributions: [{ displayName: producer.name, uri: producer.website }],
  } : null);

  const isGooglePlaces = photosResult?.source === 'google_places';

  return {
    photos,
    activePhoto,
    activePhotoIndex,
    setActivePhotoIndex,
    isGooglePlaces,
    isLoading,
    displayName: photosResult?.displayName || producer?.name,
    refetch: () => producer && loadPhotos(producer),
  };
}
