import { auth } from './firebase';
import { resolveApiBaseUrl } from './apiOrigin';
import type { ProducerListingChangeRequest, ProducerListingChanges } from '../types/producerListingChange';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  await auth?.authStateReady();
  if (!auth?.currentUser) throw new Error('Sign in with your verified Host account.');

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${await auth.currentUser.getIdToken()}`);
  if (options.body) headers.set('Content-Type', 'application/json');

  const response = await fetch(`${resolveApiBaseUrl()}/api${path}`, {
    ...options,
    headers,
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  });
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('Producer listing review is temporarily unavailable.');
  }
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Producer listing review request failed.');
  return data as T;
}

export const fetchLatestProducerListingChange = (producerId: string) =>
  request<{ request: ProducerListingChangeRequest | null }>(
    `/producer/listing-changes/${encodeURIComponent(producerId)}`
  );

export const submitProducerListingChanges = (producerId: string, changes: ProducerListingChanges) =>
  request<{ request: ProducerListingChangeRequest }>(
    `/producer/listing-changes/${encodeURIComponent(producerId)}`,
    { method: 'POST', body: JSON.stringify({ changes }) }
  );
