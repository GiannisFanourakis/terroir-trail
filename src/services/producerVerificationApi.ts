import { auth } from './firebase';
import { resolveApiBaseUrl } from './apiOrigin';

export async function requestProducerClaimVerification(producerId: string) {
  await auth?.authStateReady();
  if (!auth?.currentUser) {
    throw new Error('Sign in before verifying a producer claim.');
  }

  const response = await fetch(
    `${resolveApiBaseUrl()}/api/account/producer-claims/${encodeURIComponent(producerId)}/verify`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(20000),
    }
  );

  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('Producer verification is temporarily unavailable.');
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Producer verification could not start.');
  }
  return data;
}
