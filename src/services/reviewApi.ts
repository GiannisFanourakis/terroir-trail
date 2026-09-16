import { auth } from './firebase';
import { resolveApiBaseUrl } from './apiOrigin';
import type { PublicProducerReview, ReviewReportReason } from '../types/review';

async function request<T>(
  path: string,
  options: RequestInit = {},
  authMode: 'optional' | 'required' = 'optional'
): Promise<T> {
  await auth?.authStateReady();

  if (authMode === 'required' && !auth?.currentUser) {
    throw new Error('Sign in to participate in community reviews.');
  }

  const headers = new Headers(options.headers);
  if (auth?.currentUser) {
    headers.set('Authorization', `Bearer ${await auth.currentUser.getIdToken()}`);
  }
  if (options.body) headers.set('Content-Type', 'application/json');

  const response = await fetch(`${resolveApiBaseUrl()}/api${path}`, {
    ...options,
    headers,
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  });

  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('Community reviews are temporarily unavailable.');
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Community review request failed.');
  }
  return data as T;
}

export const fetchProducerReviews = (producerId: string) =>
  request<{ reviews: PublicProducerReview[] }>(
    `/producers/${encodeURIComponent(producerId)}/reviews`
  );

export const saveMyProducerReview = (
  producerId: string,
  rating: number,
  comment: string
) =>
  request<{ review: PublicProducerReview }>(
    `/producers/${encodeURIComponent(producerId)}/reviews/me`,
    { method: 'PUT', body: JSON.stringify({ rating, comment }) },
    'required'
  );

export const deleteMyProducerReview = (producerId: string) =>
  request<{ deleted: true; reviewId: string }>(
    `/producers/${encodeURIComponent(producerId)}/reviews/me`,
    { method: 'DELETE' },
    'required'
  );

export const saveHostReviewReply = (reviewId: string, comment: string) =>
  request<{ review: PublicProducerReview }>(
    `/reviews/${encodeURIComponent(reviewId)}/host-reply`,
    { method: 'PUT', body: JSON.stringify({ comment }) },
    'required'
  );

export const reportReview = (reviewId: string, reason: ReviewReportReason) =>
  request<{ report: { reported: true; reviewId: string } }>(
    `/reviews/${encodeURIComponent(reviewId)}/report`,
    { method: 'POST', body: JSON.stringify({ reason }) },
    'required'
  );
