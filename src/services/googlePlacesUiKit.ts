import { useEffect, useState } from 'react';
import { runtimeConfig } from '../config/runtimeConfig';

export type GooglePlacesUiKitStatus = 'unavailable' | 'loading' | 'ready' | 'error';

let currentStatus: GooglePlacesUiKitStatus = 'unavailable';
let loadPromise: Promise<GooglePlacesUiKitStatus> | null = null;

const SCRIPT_ID = 'google-maps-places-ui-kit-script';

export function getGoogleMapsApiKey(): string | undefined {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  return typeof key === 'string' && key.trim().length > 0 ? key.trim() : undefined;
}

/**
 * Returns true only when BOTH the feature flag is explicitly enabled AND an API key is configured.
 */
export function isGooglePlacesMediaActive(): boolean {
  return runtimeConfig.googlePlacesMedia.enabled && Boolean(getGoogleMapsApiKey());
}

/**
 * Lazy loads the Google Maps JavaScript API (weekly) with Places library.
 * Safe for zero-config environments: returns 'unavailable' immediately if no key is configured
 * or if the feature flag VITE_ENABLE_GOOGLE_PLACES_MEDIA is not explicitly true.
 */
export function loadGooglePlacesUiKit(): Promise<GooglePlacesUiKitStatus> {
  const isEnabled = runtimeConfig.googlePlacesMedia.enabled;
  const apiKey = getGoogleMapsApiKey();
  if (!isEnabled || !apiKey) {
    currentStatus = 'unavailable';
    return Promise.resolve('unavailable');
  }

  // Already loaded and library available
  if (currentStatus === 'ready' && typeof window !== 'undefined' && typeof window.google?.maps?.importLibrary === 'function') {
    return Promise.resolve('ready');
  }

  // If already in flight, return existing promise to avoid duplicate scripts
  if (loadPromise) {
    return loadPromise;
  }

  currentStatus = 'loading';

  loadPromise = new Promise<GooglePlacesUiKitStatus>((resolve) => {
    if (typeof window === 'undefined') {
      currentStatus = 'unavailable';
      resolve('unavailable');
      return;
    }

    // Check if script tag already exists in DOM
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    const onScriptLoaded = async () => {
      try {
        if (typeof window.google?.maps?.importLibrary === 'function') {
          const placesLib = (await window.google.maps.importLibrary('places')) as Record<string, any>;
          // React 19 compatibility: React 19 assigns properties rather than attributes on custom elements
          // when the property exists on the prototype. Google's web component setter expects a LatLng or { lat, lng }
          // object and throws InvalidValueError on strings. Coerce string "lat,lng" to { lat, lng }.
          const LocationReqProto = placesLib?.PlaceDetailsLocationRequestElement?.prototype;
          if (LocationReqProto) {
            const desc = Object.getOwnPropertyDescriptor(LocationReqProto, 'location');
            if (desc && desc.set) {
              const originalSet = desc.set;
              Object.defineProperty(LocationReqProto, 'location', {
                get: desc.get,
                set(val: unknown) {
                  if (typeof val === 'string') {
                    const [lat, lng] = val.split(',').map(Number);
                    if (!isNaN(lat) && !isNaN(lng)) {
                      return originalSet.call(this, { lat, lng });
                    }
                  }
                  return originalSet.call(this, val);
                },
                configurable: true,
                enumerable: desc.enumerable,
              });
            }
          }
          currentStatus = 'ready';
          resolve('ready');
        } else {
          currentStatus = 'error';
          resolve('error');
        }
      } catch (err) {
        console.warn('[GooglePlacesUiKit] Failed to import places library:', err);
        currentStatus = 'error';
        resolve('error');
      }
    };

    const onScriptError = (err: Event | string) => {
      console.warn('[GooglePlacesUiKit] Maps script failed to load:', err);
      currentStatus = 'error';
      resolve('error');
    };

    if (script) {
      if (typeof window.google?.maps?.importLibrary === 'function') {
        void onScriptLoaded();
      } else {
        script.addEventListener('load', () => void onScriptLoaded());
        script.addEventListener('error', onScriptError);
      }
      return;
    }

    script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.type = 'text/javascript';
    script.async = true;
    script.defer = true;
    // Places UI Kit Essentials requires Places library in modern Maps JS API
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&libraries=places`;

    script.addEventListener('load', () => void onScriptLoaded());
    script.addEventListener('error', onScriptError);

    document.head.appendChild(script);
  });

  return loadPromise;
}

/**
 * React Hook for lazy-loading Google Places UI Kit on-demand (e.g. when an eligible drawer opens).
 */
export function useGooglePlacesUiKit(enabled: boolean = false): {
  status: GooglePlacesUiKitStatus;
  isReady: boolean;
} {
  const [status, setStatus] = useState<GooglePlacesUiKitStatus>(() => {
    const isFeatureEnabled = runtimeConfig.googlePlacesMedia.enabled;
    const key = getGoogleMapsApiKey();
    if (!isFeatureEnabled || !key) return 'unavailable';
    return currentStatus;
  });

  useEffect(() => {
    if (!enabled) return;

    const isFeatureEnabled = runtimeConfig.googlePlacesMedia.enabled;
    const key = getGoogleMapsApiKey();
    if (!isFeatureEnabled || !key) {
      setStatus('unavailable');
      return;
    }

    let isMounted = true;
    void loadGooglePlacesUiKit().then((res) => {
      if (isMounted) {
        setStatus(res);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [enabled]);

  return {
    status,
    isReady: status === 'ready',
  };
}

/** Test helper to reset internal loader state */
export function _resetGooglePlacesUiKitStateForTesting(): void {
  currentStatus = 'unavailable';
  loadPromise = null;
  if (typeof document !== 'undefined') {
    const s = document.getElementById(SCRIPT_ID);
    if (s && s.parentNode) {
      s.parentNode.removeChild(s);
    }
  }
}
