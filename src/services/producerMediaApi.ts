import type { ProducerUploadedImage } from '../types/producerMedia';
import { resolveApiBaseUrl } from './apiOrigin';

export async function replaceProducerMedia(
  idToken: string,
  producerId: string,
  images: ProducerUploadedImage[]
): Promise<void> {
  if (!idToken) {
    throw new Error('Sign in with an approved producer account to manage photos.');
  }

  const response = await fetch(
    `${resolveApiBaseUrl()}/api/producer/media/${encodeURIComponent(producerId)}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ images }),
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    }
  );

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;
  if (!response.ok) {
    throw new Error(data?.error || 'Producer photo submission failed.');
  }
}
