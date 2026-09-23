import { auth } from './firebase';
import { resolveApiBaseUrl } from './apiOrigin';

export type CommercialPartnerStatus = 'pending' | 'active' | 'suspended' | 'ended';
export type CommercialActivationSource = 'admin_pilot' | 'stripe_subscription';
export type CommercialSubscriptionStatus =
  | 'pending'
  | 'active'
  | 'past_due'
  | 'grace'
  | 'cancelled'
  | 'expired';
export type CommercialCampaignType =
  | 'regional_featured'
  | 'trip_contextual'
  | 'seasonal_notice';
export type CommercialCampaignStatus =
  | 'draft'
  | 'awaiting_review'
  | 'approved'
  | 'scheduled'
  | 'active'
  | 'paused'
  | 'completed'
  | 'withdrawn'
  | 'rejected';
export type CommercialPlacement = 'region_discovery' | 'trip_preparation';

export interface CommercialPartnerAccount {
  producer_id: string;
  status: CommercialPartnerStatus;
  activation_source: CommercialActivationSource;
  activated_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommercialPartnerSubscription {
  id: string;
  producer_id: string;
  plan_code: 'partner_annual_v1';
  provider: 'stripe';
  status: CommercialSubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  grace_until: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
  provider_customer_id?: string | null;
  provider_subscription_id?: string | null;
}

export interface CommercialPartnerCampaign {
  id: string;
  producer_id: string;
  campaign_type: CommercialCampaignType;
  status: CommercialCampaignStatus;
  destination: string | null;
  category: string | null;
  headline: string;
  message: string | null;
  starts_at: string | null;
  ends_at: string | null;
  review_note: string | null;
  approved_at: string | null;
  paused_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommercialCampaignPlacement {
  campaign_id: string;
  placement: CommercialPlacement;
}

export interface CommercialCampaignResult {
  campaign_id: string;
  producer_id: string;
  qualified_impressions: number;
  opens: number;
  saves: number;
  trip_additions: number;
  website_clicks: number;
  phone_clicks: number;
  email_clicks: number;
  directions_clicks: number;
  first_day: string | null;
  data_through: string | null;
}

export interface HostCommercialState {
  producerIds: string[];
  partners: CommercialPartnerAccount[];
  subscriptions: CommercialPartnerSubscription[];
  campaigns: CommercialPartnerCampaign[];
  placements: CommercialCampaignPlacement[];
  campaignResults: CommercialCampaignResult[];
}

export interface PartnerBillingAvailability {
  checkoutEnabled: boolean;
  portalEnabled: boolean;
  planCode: 'partner_annual_v1';
}

export interface CommercialAuditEntry {
  id: string;
  producer_id: string;
  entity_type: 'partner' | 'subscription' | 'campaign';
  entity_id: string;
  event_type: string;
  actor_type: 'admin' | 'stripe' | 'system';
  actor_uid: string | null;
  from_status: string | null;
  to_status: string | null;
  reason: string | null;
  occurred_at: string;
}

export interface AdminCommercialState {
  partners: CommercialPartnerAccount[];
  subscriptions: CommercialPartnerSubscription[];
  campaigns: CommercialPartnerCampaign[];
  placements: CommercialCampaignPlacement[];
  audit: CommercialAuditEntry[];
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  await auth?.authStateReady();
  if (!auth?.currentUser) throw new Error('Sign in to access Partner features.');

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${await auth.currentUser.getIdToken()}`);
  if (init.body) headers.set('Content-Type', 'application/json');

  const response = await fetch(`${resolveApiBaseUrl()}/api${path}`, {
    ...init,
    headers,
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof body?.error === 'string' ? body.error : 'Partner request failed.');
  }
  return body as T;
}

export const fetchHostCommercialState = () =>
  request<{ state: HostCommercialState; billing: PartnerBillingAvailability }>('/producer/commercial');

export const startPartnerCheckout = (producerId: string) =>
  request<{ url: string }>(
    `/producer/commercial/${encodeURIComponent(producerId)}/checkout`,
    { method: 'POST', body: JSON.stringify({}) }
  );

export const openPartnerBillingPortal = (producerId: string) =>
  request<{ url: string }>(
    `/producer/commercial/${encodeURIComponent(producerId)}/billing-portal`,
    { method: 'POST', body: JSON.stringify({}) }
  );

export const fetchAdminCommercialState = () =>
  request<{ state: AdminCommercialState }>('/admin/commercial');

export const setCommercialPartnerStatus = (
  producerId: string,
  status: CommercialPartnerStatus,
  reason: string,
  activationSource: CommercialActivationSource = 'admin_pilot'
) =>
  request<{ partner: CommercialPartnerAccount }>(
    `/admin/commercial/partners/${encodeURIComponent(producerId)}/status`,
    {
      method: 'POST',
      body: JSON.stringify({ status, reason, activationSource }),
    }
  );

export const createCommercialCampaign = (input: {
  producerId: string;
  campaignType: CommercialCampaignType;
  headline: string;
  message?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  placements: CommercialPlacement[];
}) =>
  request<{ campaign: CommercialPartnerCampaign; placements: CommercialPlacement[] }>(
    '/admin/commercial/campaigns',
    { method: 'POST', body: JSON.stringify(input) }
  );

export const updateCommercialCampaign = (
  campaignId: string,
  input: {
    headline: string;
    message?: string | null;
    startsAt?: string | null;
    endsAt?: string | null;
    placements: CommercialPlacement[];
  }
) =>
  request<{ campaign: CommercialPartnerCampaign; placements: CommercialPlacement[] }>(
    `/admin/commercial/campaigns/${encodeURIComponent(campaignId)}`,
    { method: 'PATCH', body: JSON.stringify(input) }
  );

export const transitionCommercialCampaign = (
  campaignId: string,
  status: CommercialCampaignStatus,
  reason?: string
) =>
  request<{ campaign: CommercialPartnerCampaign; placements: CommercialPlacement[] }>(
    `/admin/commercial/campaigns/${encodeURIComponent(campaignId)}/status`,
    { method: 'POST', body: JSON.stringify({ status, reason: reason || null }) }
  );
