import { Capacitor } from '@capacitor/core';

/**
 * Deterministic API Origin Resolver for TerroirTrail.
 * 
 * - Web:
 *     If VITE_API_BASE_URL is blank -> same-origin relative base ('')
 *     If VITE_API_BASE_URL is set   -> configured origin (trimmed, trailing slashes removed)
 * 
 * - Native (Android / iOS Capacitor WebView):
 *     If VITE_API_BASE_URL is set   -> configured origin (trimmed, trailing slashes removed)
 *     Otherwise                     -> public HTTPS gateway ('https://terroir-trail.web.app')
 */
export const resolveApiBaseUrl = (
  envBaseUrl: string | undefined = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || undefined,
  isNative: boolean = Capacitor.isNativePlatform()
): string => {
  if (isNative) {
    if (envBaseUrl && envBaseUrl.trim() !== '') {
      return envBaseUrl.trim().replace(/\/+$/, '');
    }
    return 'https://terroir-trail.web.app';
  }

  return (envBaseUrl || '').trim().replace(/\/+$/, '');
};
