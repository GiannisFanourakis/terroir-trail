import { describe, expect, it, vi } from 'vitest';
import { createGoogleWebCredential, createAppleWebCredential } from './authBridging';
import { GoogleAuthProvider, OAuthProvider } from 'firebase/auth';

describe('authBridging helpers', () => {
  it('bridges native Google credential idToken into Firebase JS credential', () => {
    const cred = createGoogleWebCredential({ idToken: 'mock-google-id-token' });
    expect(cred).toBeDefined();
    expect(cred.providerId).toBe('google.com');
  });

  it('throws error when native Google credential lacks an idToken', () => {
    expect(() => createGoogleWebCredential({})).toThrow(
      'Google Sign-In credential did not return an idToken.'
    );
  });

  it('bridges native Apple credential with idToken and rawNonce into Firebase JS credential', () => {
    const cred = createAppleWebCredential({
      idToken: 'mock-apple-id-token',
      nonce: 'mock-crypto-nonce',
    });
    expect(cred).toBeDefined();
    expect(cred.providerId).toBe('apple.com');
    expect((cred as any).nonce).toBe('mock-crypto-nonce');
    expect((cred as any).idToken).toBe('mock-apple-id-token');
  });

  it('throws error when native Apple credential lacks an idToken', () => {
    expect(() => createAppleWebCredential({})).toThrow(
      'Apple Sign-In credential did not return an idToken.'
    );
  });
});
