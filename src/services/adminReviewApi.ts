import { auth } from './firebase';
import { resolveApiBaseUrl } from './apiOrigin';

export interface PendingReviewReport {
  reportId: string;
  reviewId: string;
  producerId: string;
  reason: string;
  reportedAt: string;
  review: {
    travelerName: string;
    rating: number;
    comment: string;
    verifiedVisit: boolean;
    status: 'published' | 'hidden';
    hostReply?: {
      comment: string;
      createdAt?: string;
      updatedAt?: string;
    };
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  await auth?.authStateReady();
  if (!auth?.currentUser) throw new Error('Sign in to access review moderation.');

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
    throw new Error('Review moderation is temporarily unavailable.');
  }
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Review moderation request failed.');
  return data as T;
}

export const fetchPendingReviewReports = () =>
  request<{ reports: PendingReviewReport[] }>('/admin/review-reports');

export const moderateCommunityReview = (
  reviewId: string,
  action: 'hide' | 'restore',
  reason: string
) => request<{
  review: {
    reviewId: string;
    producerId: string;
    status: 'published' | 'hidden';
    occurredAt: string;
  };
}>(`/admin/reviews/${encodeURIComponent(reviewId)}/moderation`, {
  method: 'POST',
  body: JSON.stringify({ action, reason }),
});

export const dismissCommunityReviewReport = (reportId: string, reason: string) =>
  request<{
    report: {
      reportId: string;
      status: 'resolved';
      occurredAt: string;
    };
  }>(`/admin/review-reports/${encodeURIComponent(reportId)}/dismiss`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
