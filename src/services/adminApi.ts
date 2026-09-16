import { auth } from './firebase';
import { resolveApiBaseUrl } from './apiOrigin';
import type { ProducerListingChanges } from '../types/producerListingChange';

export type TrustedAccountRole = 'traveler' | 'producer_host' | 'admin';
export type AdminLevel = 'owner' | 'admin';
export type ProducerBusinessVerificationStatus =
  | 'verified'
  | 'needs_review'
  | 'failed'
  | 'manual_required'
  | 'unavailable';
export type ProducerContactVerificationStatus =
  | 'not_started'
  | 'pending'
  | 'verified'
  | 'unavailable';

export interface AccountCapabilities {
  uid: string;
  roles: TrustedAccountRole[];
  primaryRole: TrustedAccountRole;
  isAdmin: boolean;
  adminLevel: AdminLevel | null;
  isPlatformOwner: boolean;
  producerIds: string[];
  canManageOwnedListings: boolean;
  canReviewProducerClaims: boolean;
  canAssignProducerOwnership: boolean;
  canModerateProducerContent: boolean;
  canManageUserAccounts: boolean;
  canManageAdmins: boolean;
}

export interface AdminAccountSummary {
  uid: string;
  email?: string;
  displayName?: string;
  disabled: boolean;
  emailVerified: boolean;
  roles: TrustedAccountRole[];
  adminLevel: AdminLevel | null;
  isPlatformOwner: boolean;
  producerIds: string[];
  canDisable: boolean;
}

export interface PendingProducerClaim {
  producerId: string;
  tradeBrandName: string;
  producerCategory?: string;
  officialEmail: string;
  representativeName?: string;
  representativeRole?: string;
  countryCode?: string;
  submittedAt?: string;
  notesFromProducer?: string;
  legalBusinessName?: string;
  vatNumber?: string;
  registeredAddress?: string;
  businessVerificationStatus?: ProducerBusinessVerificationStatus;
  businessVerificationProvider?: 'vies' | 'manual';
  businessVerificationCheckedAt?: string;
  businessVerificationVatValid?: boolean | null;
  businessVerificationRegistryName?: string;
  businessVerificationRegistryAddress?: string;
  businessVerificationNameMatch?: 'match' | 'mismatch' | 'unavailable';
  businessVerificationReason?: string;
  contactVerificationStatus?: ProducerContactVerificationStatus;
  contactVerifiedAt?: string;
  verificationReadyForAdminReview?: boolean;
}

export interface PendingProducerMediaItem {
  producerId: string;
  producerName: string;
  imageId: string;
  url: string;
  thumbnailUrl?: string;
  storagePath?: string;
  type: 'cover' | 'gallery';
  caption?: string;
  uploadedAt: string;
  rightsConfirmed: boolean;
}

export interface PendingProducerListingChange {
  id: string;
  producerId: string;
  producerName: string;
  requesterUid: string;
  requesterEmail?: string;
  status: 'pending_review';
  changes: ProducerListingChanges;
  submittedAt: string;
}

export interface ActiveProducerOwnership {
  producerId: string;
  producerName: string;
  ownerUid: string;
  ownerEmail?: string;
  ownerDisplayName?: string;
  approvedAt?: string;
  assignedAt?: string;
}

export interface AdminDashboardMetrics {
  generatedAt: string;
  requests: {
    pending: number;
    oldestPendingAt: string | null;
    oldestPendingAgeDays: number | null;
    approved30d: number;
    rejected30d: number;
    averageReviewHours30d: number | null;
  };
  accounts: {
    total: number;
    new30d: number;
    disabled: number;
    activeProducerHosts: number;
    activeAdmins: number;
  };
  audit: {
    recent: Array<{
      eventType: string;
      occurredAt: string;
      actorUid?: string;
      targetUid?: string;
      producerId?: string;
    }>;
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  await auth?.authStateReady();
  if (!auth?.currentUser) throw new Error('Sign in to access account administration.');

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
    throw new Error('Account administration is temporarily unavailable.');
  }

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Account administration request failed.');
  return data as T;
}

export const fetchAccountCapabilities = () =>
  request<{ capabilities: AccountCapabilities }>('/account/capabilities');

export const fetchAdminDashboardMetrics = () =>
  request<{ metrics: AdminDashboardMetrics }>('/admin/metrics');

export const searchAdminAccounts = (query: string) =>
  request<{ accounts: AdminAccountSummary[] }>(`/admin/accounts?q=${encodeURIComponent(query)}`);

export const setAdminAccountDisabled = (uid: string, disabled: boolean, reason: string) =>
  request<{ account: { targetUid: string; disabled: boolean; occurredAt: string } }>(
    `/admin/accounts/${encodeURIComponent(uid)}/access`,
    { method: 'POST', body: JSON.stringify({ disabled, reason }) }
  );

export const fetchPendingProducerClaims = () =>
  request<{ claims: PendingProducerClaim[] }>('/admin/claims');

export const fetchPendingProducerMedia = () =>
  request<{ media: PendingProducerMediaItem[] }>('/admin/media');

export const fetchPendingProducerListingChanges = () =>
  request<{ requests: PendingProducerListingChange[] }>('/admin/listing-changes');

export const approveProducerListingChange = (requestId: string) =>
  request<{ request: { requestId: string; producerId: string; status: 'approved'; occurredAt: string } }>(
    `/admin/listing-changes/${encodeURIComponent(requestId)}/approve`,
    { method: 'POST', body: JSON.stringify({}) }
  );

export const rejectProducerListingChange = (requestId: string, reason: string) =>
  request<{ request: { requestId: string; producerId: string; status: 'rejected'; occurredAt: string } }>(
    `/admin/listing-changes/${encodeURIComponent(requestId)}/reject`,
    { method: 'POST', body: JSON.stringify({ reason }) }
  );

export const approveProducerMedia = (producerId: string, imageId: string) =>
  request<{
    media: {
      producerId: string;
      imageId: string;
      status: 'approved';
      occurredAt: string;
    };
  }>(
    `/admin/media/${encodeURIComponent(producerId)}/${encodeURIComponent(imageId)}/approve`,
    { method: 'POST', body: JSON.stringify({}) }
  );

export const rejectProducerMedia = (producerId: string, imageId: string, reason: string) =>
  request<{
    media: {
      producerId: string;
      imageId: string;
      status: 'rejected';
      occurredAt: string;
    };
  }>(
    `/admin/media/${encodeURIComponent(producerId)}/${encodeURIComponent(imageId)}/reject`,
    { method: 'POST', body: JSON.stringify({ reason }) }
  );

export const approveProducerClaim = (producerId: string) =>
  request<{ claim: { producerId: string; status: 'verified_active'; occurredAt: string } }>(
    `/admin/claims/${encodeURIComponent(producerId)}/approve`,
    { method: 'POST', body: JSON.stringify({}) }
  );

export const rejectProducerClaim = (producerId: string, reason: string) =>
  request<{ claim: { producerId: string; status: 'rejected'; occurredAt: string } }>(
    `/admin/claims/${encodeURIComponent(producerId)}/reject`,
    { method: 'POST', body: JSON.stringify({ reason }) }
  );

export const fetchActiveProducerOwnerships = () =>
  request<{ ownerships: ActiveProducerOwnership[] }>('/admin/ownerships');

export const revokeProducerOwnership = (producerId: string, reason: string) =>
  request<{
    ownership: {
      producerId: string;
      previousOwnerUid: string;
      status: 'revoked';
      occurredAt: string;
    };
  }>(`/admin/ownerships/${encodeURIComponent(producerId)}/revoke`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });

export const reassignProducerOwnership = (
  producerId: string,
  email: string,
  reason: string
) => request<{
  ownership: {
    producerId: string;
    previousOwnerUid: string;
    ownerUid: string;
    ownerEmail: string;
    status: 'active';
    occurredAt: string;
  };
}>(`/admin/ownerships/${encodeURIComponent(producerId)}/reassign`, {
  method: 'POST',
  body: JSON.stringify({ email, reason }),
});

export const changeAdminAuthority = (
  action: 'grant' | 'revoke',
  email: string
) => request<{
  authority: {
    action: 'grant' | 'revoke';
    actorUid: string;
    targetUid: string;
    level: 'admin';
    status: 'active' | 'revoked';
    occurredAt: string;
  };
}>('/admin/authority', {
  method: 'POST',
  body: JSON.stringify({ action, email }),
});
