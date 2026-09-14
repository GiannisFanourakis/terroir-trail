import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { formatAuthError } from '../utils/authErrors';

const read = (file: string) => readFileSync(file, 'utf8');

describe('Phase 7 traveler state boundaries', () => {
  it('scopes browser-local favorites to the authenticated account', () => {
    const app = read('src/App.tsx');
    const favorites = read('src/hooks/useFavorites.ts');

    expect(app).toContain('useFavorites(user?.id)');
    expect(app).not.toContain('useFavorites();');
    expect(favorites).toContain('const getFavoritesStorageKey = (ownerId?: string | null) =>');
    expect(favorites).toContain('GUEST_FAVORITES_KEY');
  });

  it('does not claim that local favorites sync across devices', () => {
    const authModal = read('src/components/Auth/AuthModal.tsx');

    expect(authModal).not.toContain('favorites and personal notes across devices');
    expect(authModal).toContain('Saved favorites remain on this device.');
  });

  it('propagates tasting-note deletions from the authoritative cloud profile', () => {
    const authHook = read('src/hooks/useAuth.ts');

    expect(authHook).toContain('personalNotes: cloudData.personalNotes ?? prev.personalNotes');
    expect(authHook).not.toContain('personalNotes: { ...prev.personalNotes, ...(cloudData.personalNotes || {}) }');
  });

  it('builds Passport progress from the stable producer catalogue', () => {
    const passport = read('src/components/Auth/PassportModal.tsx');

    expect(passport).toContain('producerService.getCachedProducers()');
    expect(passport).toContain('const totalCount = passportProducers.length;');
    expect(passport).toContain('totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0');
  });
});

describe('Phase 7 traveler authentication and account lifecycle', () => {
  it('does not expose a misleading "Remember me" control or unused state', () => {
    const authModal = read('src/components/Auth/AuthModal.tsx');

    expect(authModal).not.toContain('rememberMe');
    expect(authModal).not.toContain('Remember me');
  });

  it('AuthModal panel has accessible dialog semantics, title id and state attributes', () => {
    const authModal = read('src/components/Auth/AuthModal.tsx');

    expect(authModal).toContain('role="dialog"');
    expect(authModal).toContain('aria-modal="true"');
    expect(authModal).toContain('aria-labelledby="auth-modal-title"');
    expect(authModal).toContain('id="auth-modal-title"');
    expect(authModal).toContain('role="alert"');
    expect(authModal).toContain('role="status"');
    expect(authModal).toContain('aria-live="polite"');
    expect(authModal).toContain("aria-label={showPassword ? 'Hide password' : 'Show password'}");
    expect(authModal).toContain("aria-pressed={accountType === 'traveler'}");
    expect(authModal).toContain("aria-pressed={accountType === 'producer'}");
    expect(authModal).toContain('aria-label="Close"');
  });

  it('sanitizes public authentication error messages without leaking developer configuration', () => {
    const forbidden = [
      'Firebase Console',
      '.env',
      'authorized domains',
      'Apple Developer credentials',
    ];

    const testErrors = [
      { code: 'auth/unauthorized-domain', message: 'Domain not authorized in Firebase Console' },
      { code: 'auth/configuration-not-found', message: 'Missing configuration in .env or Firebase Console' },
      { code: 'auth/operation-not-allowed', message: 'Enable in Firebase Console requires Apple Developer credentials' },
      { code: 'auth/network-request-failed', message: 'Network request failed' },
      { code: 'FIREBASE_NOT_CONFIGURED', message: 'FIREBASE_NOT_CONFIGURED' },
      new Error('FIREBASE_NOT_CONFIGURED'),
      new Error('Check your .env file and authorized domains'),
    ];

    for (const err of testErrors) {
      const formatted = formatAuthError(err);
      for (const phrase of forbidden) {
        expect(formatted).not.toContain(phrase);
      }
    }

    expect(formatAuthError({ code: 'auth/unauthorized-domain' })).toBe(
      'Sign-in is temporarily unavailable for this site. Please try another sign-in method.'
    );
    expect(formatAuthError({ code: 'auth/configuration-not-found' })).toBe(
      'Sign-in is temporarily unavailable. Please try again later.'
    );
    expect(formatAuthError({ code: 'auth/operation-not-allowed' })).toBe(
      'This sign-in option is currently unavailable. Please try another sign-in method.'
    );
    expect(formatAuthError(new Error('Firebase: Error (auth/operation-not-allowed).'))).toBe(
      'This sign-in option is currently unavailable. Please try another sign-in method.'
    );
    expect(formatAuthError(new Error('Internal provider bootstrap failed: tenant=production'))).toBe(
      'Authentication failed. Please try again.'
    );
    expect(formatAuthError({ code: 'auth/network-request-failed' })).toBe(
      'Unable to connect to the sign-in service. Check your connection and try again.'
    );
    expect(formatAuthError({ code: 'FIREBASE_NOT_CONFIGURED' })).toBe(
      'Sign-in is temporarily unavailable. Please try again later.'
    );

    // Preserves legitimate user-correctable errors
    expect(formatAuthError({ code: 'auth/wrong-password' })).toBe(
      'Incorrect email or password. Please verify your credentials.'
    );
    expect(formatAuthError({ code: 'auth/email-already-in-use' })).toBe(
      'An account with this email address already exists. Please sign in instead.'
    );
    expect(formatAuthError({ code: 'auth/invalid-email' })).toBe(
      'Please enter a valid email address.'
    );
    expect(formatAuthError({ code: 'auth/weak-password' })).toBe(
      'Password is too weak. Please choose at least 6 characters.'
    );
    expect(formatAuthError({ code: 'auth/too-many-requests' })).toBe(
      'Access has been temporarily disabled due to many failed attempts. Please reset your password or try again later.'
    );
    expect(formatAuthError({ code: 'auth/popup-closed-by-user' })).toBe(
      'The sign-in popup was closed before completing.'
    );
  });

  it('Phase 7 audit correctly characterizes Apple sign-in as unverified/dormant and account deletion as manual', () => {
    const audit = read('reports/product-readiness/phase7_audit.md');

    expect(audit).toContain(
      'Email/password and Google are currently exposed traveler sign-in paths. Apple authentication infrastructure exists but is not part of the currently verified public traveler sign-in surface.'
    );
    expect(audit).not.toContain('Apple Sign-In is launch-ready');
    expect(audit).not.toContain('Apple sign-in is launch-ready');
    expect(audit).toContain('Account deletion remains a manual/operational privacy process');
    expect(audit).toContain('| Traveler authentication (Email/password, Google; dormant Apple infrastructure) | Needs work |');
  });
});
