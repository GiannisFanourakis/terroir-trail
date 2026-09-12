import { describe, expect, it, vi, beforeEach } from 'vitest';
import { formatLocationError, getUserCoordinates } from './geolocation';

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn(() => false),
  },
}));

vi.mock('@capacitor/geolocation', () => ({
  Geolocation: {
    checkPermissions: vi.fn(),
    requestPermissions: vi.fn(),
    getCurrentPosition: vi.fn(),
  },
}));

import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

describe('geolocation service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('formatLocationError', () => {
    it('formats permission denied errors concisely', () => {
      expect(formatLocationError({ code: 1, message: 'User denied geolocation' })).toBe(
        'Location permission denied. Please allow location access in your device/app settings.'
      );
    });

    it('formats timeout errors concisely', () => {
      expect(formatLocationError({ code: 3, message: 'Timeout expired' })).toBe(
        'Location request timed out. Please check your GPS signal and try again.'
      );
    });

    it('formats position unavailable errors concisely', () => {
      expect(formatLocationError({ code: 2, message: 'Position unavailable' })).toBe(
        'Current location unavailable. Please ensure location services are enabled.'
      );
    });

    it('formats generic fallback errors', () => {
      expect(formatLocationError({ message: 'GPS hardware error' })).toBe('GPS hardware error');
    });
  });

  describe('getUserCoordinates on web browser', () => {
    it('uses navigator.geolocation on web and resolves coordinates', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);

      const mockGetCurrentPosition = vi.fn((success) => {
        success({
          coords: {
            latitude: 35.3387,
            longitude: 25.1442,
          },
        });
      });

      vi.stubGlobal('navigator', {
        geolocation: {
          getCurrentPosition: mockGetCurrentPosition,
        },
      });

      const coords = await getUserCoordinates();
      expect(coords).toEqual({ latitude: 35.3387, longitude: 25.1442 });
      expect(mockGetCurrentPosition).toHaveBeenCalledTimes(1);
    });

    it('rejects with formatted error when browser denies permission', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);

      const mockGetCurrentPosition = vi.fn((_success, error) => {
        error({ code: 1, message: 'Permission denied' });
      });

      vi.stubGlobal('navigator', {
        geolocation: {
          getCurrentPosition: mockGetCurrentPosition,
        },
      });

      await expect(getUserCoordinates()).rejects.toThrow(
        'Location permission denied. Please allow location access in your device/app settings.'
      );
    });
  });

  describe('getUserCoordinates on native platforms', () => {
    it('requests permissions if not already granted and retrieves coordinates', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      vi.mocked(Geolocation.checkPermissions).mockResolvedValue({ location: 'prompt' } as any);
      vi.mocked(Geolocation.requestPermissions).mockResolvedValue({ location: 'granted' } as any);
      vi.mocked(Geolocation.getCurrentPosition).mockResolvedValue({
        coords: {
          latitude: 37.9838,
          longitude: 23.7275,
        },
      } as any);

      const coords = await getUserCoordinates();
      expect(coords).toEqual({ latitude: 37.9838, longitude: 23.7275 });
      expect(Geolocation.checkPermissions).toHaveBeenCalledTimes(1);
      expect(Geolocation.requestPermissions).toHaveBeenCalledWith({ permissions: ['location'] });
      expect(Geolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
    });

    it('throws concise error if native user rejects permission request', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      vi.mocked(Geolocation.checkPermissions).mockResolvedValue({ location: 'prompt' } as any);
      vi.mocked(Geolocation.requestPermissions).mockResolvedValue({ location: 'denied' } as any);

      await expect(getUserCoordinates()).rejects.toThrow(
        'Location permission denied. Please allow location access in your device/app settings.'
      );
    });
  });
});
