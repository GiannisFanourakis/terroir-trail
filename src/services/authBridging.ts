import { GoogleAuthProvider, OAuthProvider, AuthCredential } from 'firebase/auth';

export interface NativeAuthCredentialPayload {
  idToken?: string;
  nonce?: string;
  accessToken?: string;
}

/**
 * Bridges native Google Sign-In credentials to Firebase JS AuthCredential.
 */
export const createGoogleWebCredential = (payload: NativeAuthCredentialPayload): AuthCredential => {
  if (!payload.idToken) {
    throw new Error('Google Sign-In credential did not return an idToken.');
  }
  return GoogleAuthProvider.credential(payload.idToken);
};

/**
 * Bridges native Apple Sign-In credentials to Firebase JS AuthCredential,
 * preserving the cryptographic nonce for token verification.
 */
export const createAppleWebCredential = (payload: NativeAuthCredentialPayload): AuthCredential => {
  if (!payload.idToken) {
    throw new Error('Apple Sign-In credential did not return an idToken.');
  }
  const provider = new OAuthProvider('apple.com');
  return provider.credential({
    idToken: payload.idToken,
    rawNonce: payload.nonce,
  });
};
