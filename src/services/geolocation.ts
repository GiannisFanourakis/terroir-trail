import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

export interface UserCoordinates {
  latitude: number;
  longitude: number;
}

export const formatLocationError = (err: any): string => {
  if (!err) return 'Location unavailable.';
  const message = (err.message || '').toLowerCase();
  
  if (err.code === 1 || message.includes('denied') || message.includes('not allowed')) {
    return 'Location permission denied. Please allow location access in your device/app settings.';
  }
  if (err.code === 3 || message.includes('timeout') || message.includes('timed out')) {
    return 'Location request timed out. Please check your GPS signal and try again.';
  }
  if (err.code === 2 || message.includes('unavailable') || message.includes('position')) {
    return 'Current location unavailable. Please ensure location services are enabled.';
  }
  return err.message || 'Unable to determine location. Please try again.';
};

/**
 * Platform-aware Geolocation Resolver:
 * - Native (Android/iOS): Uses @capacitor/geolocation with explicit permission flow.
 * - Browser: Uses standard navigator.geolocation with user prompt.
 * 
 * Never called on startup; only on explicit user interaction ("Locate Me").
 */
export const getUserCoordinates = async (): Promise<UserCoordinates> => {
  if (Capacitor.isNativePlatform()) {
    try {
      const checkResult = await Geolocation.checkPermissions();
      if (checkResult.location !== 'granted') {
        const reqResult = await Geolocation.requestPermissions({ permissions: ['location'] });
        if (reqResult.location !== 'granted') {
          throw new Error('Location permission denied. Please allow location access in your device/app settings.');
        }
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch (err: any) {
      throw new Error(formatLocationError(err));
    }
  }

  // Web Browser fallback
  return new Promise<UserCoordinates>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        reject(new Error(formatLocationError(err)));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000,
      }
    );
  });
};
