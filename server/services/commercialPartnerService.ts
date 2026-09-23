import type { SupabaseClient } from '@supabase/supabase-js';
import { adminDb } from '../firebaseAdmin';
import { getTrustedAccountCapabilities } from './accountAuthorization';
import { getSupabaseAdmin } from './analyticsIngestionService';

export const COMMERCIAL_PARTNER_STATUSES = ['pending', 'active', 'suspended', 'ended'] as const;
export type CommercialPartnerStatus = (typeof COMMERCIAL_PARTNER_STATUSES)[number];

export const COMMERCIAL_ACTIVATION_SOURCES = ['admin_pilot', 'stripe_subscription'] as const;
export type CommercialActivationSource = (typeof COMMERCIAL_ACTIVATION_SOURCES)[number];

export const COMMERCIAL_SUBSCRIPTION_STATUSES = [
  'pending',
  'active',
  'past_due',
  'grace',
  'cancelled',
  'expired',
] as const;
export type CommercialSubscriptionStatus = (typeof COMMERCIAL_SUBSCRIPTION_STATUSES)[number];

export const COMMERCIAL_CAMPAIGN_TYPES = [
  'regional_featured',
  'trip_contextual',
  'seasonal_notice',
] as const;
export type CommercialCampaignType = (typeof COMMERCIAL_CAMPAIGN_TYPES)[number];

export const COMMERCIAL_CAMPAIGN_STATUSES = [
  'draft',
  'awaiting_review',
  'approved',
  'scheduled',
  'active',
  'paused',
  'completed',
  'withdrawn',
  'rejected',
] as const;
export type CommercialCampaignStatus = (typeof COMMERCIAL_CAMPAIGN_STATUSES)[number];

export const COMMERCIAL_PLACEMENTS = ['region_discovery', 'trip_preparation'] as const;
export type CommercialPlacement = (typeof COMMERCIAL_PLACEMENTS)[number];

export interface CommercialPartnerAccount {
  producer_id: string;
  status: CommercialPartnerStatus;
  activation_source: CommercialActivationSource;
  created_by_uid: string | null;
  updated_by_uid: string | null;
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
  provider_customer_id?: string | null;
  provider_subscription_id?: string | null;
  status: CommercialSubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  grace_until: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
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
  created_by_uid: string;
  reviewed_by_uid: string | null;
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
  created_at?: string;
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

export interface HostCommercialState {
  producerIds: string[];
  partners: CommercialPartnerAccount[];
  subscriptions: Array<Omit<CommercialPartnerSubscription, 'provider_customer_id' | 'provider_subscription_id'>>;
  campaigns: CommercialPartnerCampaign[];
  placements: CommercialCampaignPlacement[];
  campaignResults: CommercialCampaignResult[];
}

export interface AdminCommercialState {
  partners: CommercialPartnerAccount[];
  subscriptions: CommercialPartnerSubscription[];
  campaigns: CommercialPartnerCampaign[];
  placements: CommercialCampaignPlacement[];
  audit: CommercialAuditEntry[];
}

export class CommercialPartnerError extends Error {
  constructor(
    public readonly code: 'bad_request' | 'forbidden' | 'not_found' | 'conflict' | 'service_unavailable',
    message: string
  ) {
    super(message);
    this.name = 'CommercialPartnerError';
  }
}

const includes = <T extends readonly string[]>(values: T, value: string): value is T[number] =>
  (values as readonly string[]).includes(value);

const normalizeOptionalText = (value: unknown, maxLength: number): string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') throw new CommercialPartnerError('bad_request', 'Invalid text value.');
  const clean = value.trim();
  if (!clean) return null;
  if (clean.length > maxLength) throw new CommercialPartnerError('bad_request', 'Text value is too long.');
  return clean;
};

const requireSupabase = (supabase: SupabaseClient | null): SupabaseClient => {
  if (!supabase) {
    throw new CommercialPartnerError('service_unavailable', 'Commercial Partner data is temporarily unavailable.');
  }
  return supabase;
};

const requireAdmin = async (actorUid: string, db: any) => {
  const capabilities = await getTrustedAccountCapabilities(actorUid, db);
  if (!capabilities.isAdmin) {
    throw new CommercialPartnerError('forbidden', 'Admin authority is required to manage commercial Partner state.');
  }
  return capabilities;
};

const mapRpcError = (message: string): CommercialPartnerError => {
  if (
    message.includes('producer_id_required') ||
    message.includes('invalid_partner_status') ||
    message.includes('invalid_activation_source') ||
    message.includes('invalid_actor_type') ||
    message.includes('reason_too_long') ||
    message.includes('invalid_initial_partner_status') ||
    message.includes('actor_uid_required') ||
    message.includes('invalid_campaign_type') ||
    message.includes('invalid_headline') ||
    message.includes('message_too_long') ||
    message.includes('invalid_campaign_window') ||
    message.includes('invalid_campaign_placements') ||
    message.includes('invalid_campaign_placement') ||
    message.includes('invalid_campaign_status')
  ) {
    return new CommercialPartnerError('bad_request', 'Commercial Partner request failed validation.');
  }
  if (message.includes('active_producer_required') || message.includes('campaign_not_found')) {
    return new CommercialPartnerError('not_found', 'The requested active producer or campaign was not found.');
  }
  if (
    message.includes('invalid_partner_status_transition') ||
    message.includes('partner_account_required') ||
    message.includes('invalid_campaign_status_transition') ||
    message.includes('campaign_not_editable')
  ) {
    return new CommercialPartnerError('conflict', 'The requested commercial state transition is not allowed.');
  }
  return new CommercialPartnerError('service_unavailable', 'Commercial Partner data is temporarily unavailable.');
};

const assertNoError = (error: { message?: string } | null): void => {
  if (error) throw mapRpcError(String(error.message || 'unknown_commercial_error'));
};

const toDateOrNull = (value: unknown, field: string): string | null => {
  const clean = normalizeOptionalText(value, 64);
  if (!clean) return null;
  const parsed = new Date(clean);
  if (Number.isNaN(parsed.getTime())) {
    throw new CommercialPartnerError('bad_request', `${field} must be a valid date/time.`);
  }
  return parsed.toISOString();
};

async function getCanonicalProducerContext(
  producerId: string,
  supabase: SupabaseClient
): Promise<{ destination: string; category: string }> {
  const { data, error } = await supabase
    .from('producers')
    .select('destination, category')
    .eq('id', producerId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw new CommercialPartnerError('service_unavailable', 'Producer catalogue lookup is temporarily unavailable.');
  if (!data) throw new CommercialPartnerError('not_found', 'An active producer is required for Partner campaigns.');

  return {
    destination: String((data as any).destination),
    category: String((data as any).category),
  };
}

export async function getOwnedCommercialState(
  actorUid: string,
  db = adminDb(),
  supabase: SupabaseClient | null = getSupabaseAdmin()
): Promise<HostCommercialState> {
  const capabilities = await getTrustedAccountCapabilities(actorUid, db);
  if (!capabilities.producerIds.length) {
    throw new CommercialPartnerError('forbidden', 'Verified Host ownership is required to view Partner status.');
  }

  const client = requireSupabase(supabase);
  const producerIds = capabilities.producerIds;

  const [partnersResult, subscriptionsResult, campaignsResult, resultsResult] = await Promise.all([
    client.from('commercial_partner_accounts').select('*').in('producer_id', producerIds),
    client
      .from('commercial_partner_subscriptions')
      .select('id, producer_id, plan_code, provider, status, current_period_start, current_period_end, grace_until, cancel_at_period_end, created_at, updated_at')
      .in('producer_id', producerIds),
    client.from('commercial_partner_campaigns').select('*').in('producer_id', producerIds),
    client.rpc('get_partner_campaign_results_v1', { p_producer_ids: producerIds }),
  ]);

  for (const result of [partnersResult, subscriptionsResult, campaignsResult, resultsResult]) {
    if (result.error) {
      throw new CommercialPartnerError('service_unavailable', 'Commercial Partner data is temporarily unavailable.');
    }
  }

  const campaigns = (campaignsResult.data || []) as CommercialPartnerCampaign[];
  const campaignIds = campaigns.map((campaign) => campaign.id);
  let placements: CommercialCampaignPlacement[] = [];

  if (campaignIds.length) {
    const placementResult = await client
      .from('commercial_partner_campaign_placements')
      .select('campaign_id, placement')
      .in('campaign_id', campaignIds);
    if (placementResult.error) {
      throw new CommercialPartnerError('service_unavailable', 'Commercial Partner placements are temporarily unavailable.');
    }
    placements = (placementResult.data || []) as CommercialCampaignPlacement[];
  }

  return {
    producerIds,
    partners: (partnersResult.data || []) as CommercialPartnerAccount[],
    subscriptions: (subscriptionsResult.data || []) as HostCommercialState['subscriptions'],
    campaigns,
    placements,
    campaignResults: (resultsResult.data || []).map((row: any) => ({
      campaign_id: String(row.campaign_id),
      producer_id: String(row.producer_id),
      qualified_impressions: Number(row.qualified_impressions || 0),
      opens: Number(row.opens || 0),
      saves: Number(row.saves || 0),
      trip_additions: Number(row.trip_additions || 0),
      website_clicks: Number(row.website_clicks || 0),
      phone_clicks: Number(row.phone_clicks || 0),
      email_clicks: Number(row.email_clicks || 0),
      directions_clicks: Number(row.directions_clicks || 0),
      first_day: row.first_day ? String(row.first_day) : null,
      data_through: row.data_through ? String(row.data_through) : null,
    })),
  };
}

export async function getAdminCommercialState(
  actorUid: string,
  db = adminDb(),
  supabase: SupabaseClient | null = getSupabaseAdmin()
): Promise<AdminCommercialState> {
  await requireAdmin(actorUid, db);
  const client = requireSupabase(supabase);

  const [partnersResult, subscriptionsResult, campaignsResult, placementsResult, auditResult] = await Promise.all([
    client.from('commercial_partner_accounts').select('*').order('updated_at', { ascending: false }),
    client.from('commercial_partner_subscriptions').select('*').order('updated_at', { ascending: false }),
    client.from('commercial_partner_campaigns').select('*').order('updated_at', { ascending: false }).limit(250),
    client.from('commercial_partner_campaign_placements').select('*'),
    client.from('commercial_partner_audit').select('*').order('occurred_at', { ascending: false }).limit(250),
  ]);

  for (const result of [partnersResult, subscriptionsResult, campaignsResult, placementsResult, auditResult]) {
    if (result.error) {
      throw new CommercialPartnerError('service_unavailable', 'Commercial Partner administration is temporarily unavailable.');
    }
  }

  return {
    partners: (partnersResult.data || []) as CommercialPartnerAccount[],
    subscriptions: (subscriptionsResult.data || []) as CommercialPartnerSubscription[],
    campaigns: (campaignsResult.data || []) as CommercialPartnerCampaign[],
    placements: (placementsResult.data || []) as CommercialCampaignPlacement[],
    audit: (auditResult.data || []) as CommercialAuditEntry[],
  };
}

export async function setCommercialPartnerStatus(
  actorUid: string,
  producerId: string,
  input: {
    status: string;
    activationSource?: string;
    reason?: string | null;
  },
  db = adminDb(),
  supabase: SupabaseClient | null = getSupabaseAdmin()
): Promise<CommercialPartnerAccount> {
  await requireAdmin(actorUid, db);
  const client = requireSupabase(supabase);

  const cleanProducerId = producerId.trim();
  if (!cleanProducerId) throw new CommercialPartnerError('bad_request', 'Producer ID is required.');
  if (!includes(COMMERCIAL_PARTNER_STATUSES, input.status)) {
    throw new CommercialPartnerError('bad_request', 'Invalid Partner status.');
  }

  const activationSource = input.activationSource || 'admin_pilot';
  if (!includes(COMMERCIAL_ACTIVATION_SOURCES, activationSource)) {
    throw new CommercialPartnerError('bad_request', 'Invalid Partner activation source.');
  }
  const reason = normalizeOptionalText(input.reason, 500);

  const { data, error } = await client.rpc('set_commercial_partner_status_v1', {
    p_producer_id: cleanProducerId,
    p_status: input.status,
    p_actor_uid: actorUid,
    p_reason: reason,
    p_activation_source: activationSource,
    p_actor_type: 'admin',
  });

  assertNoError(error);
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new CommercialPartnerError('service_unavailable', 'Commercial Partner status could not be confirmed.');
  }

  return data as CommercialPartnerAccount;
}

export async function createCommercialPartnerCampaign(
  actorUid: string,
  input: {
    producerId: string;
    campaignType: string;
    headline: string;
    message?: string | null;
    destination?: string | null;
    category?: string | null;
    startsAt?: string | null;
    endsAt?: string | null;
    placements: string[];
  },
  db = adminDb(),
  supabase: SupabaseClient | null = getSupabaseAdmin()
): Promise<{ campaign: CommercialPartnerCampaign; placements: CommercialPlacement[] }> {
  await requireAdmin(actorUid, db);
  const client = requireSupabase(supabase);

  const producerId = input.producerId.trim();
  if (!producerId) throw new CommercialPartnerError('bad_request', 'Producer ID is required.');
  if (!includes(COMMERCIAL_CAMPAIGN_TYPES, input.campaignType)) {
    throw new CommercialPartnerError('bad_request', 'Invalid Partner campaign type.');
  }

  const headline = input.headline.trim();
  if (!headline || headline.length > 120) {
    throw new CommercialPartnerError('bad_request', 'Campaign headline must be between 1 and 120 characters.');
  }
  const message = normalizeOptionalText(input.message, 500);
  const requestedDestination = normalizeOptionalText(input.destination, 80);
  const requestedCategory = normalizeOptionalText(input.category, 80);
  const startsAt = toDateOrNull(input.startsAt, 'startsAt');
  const endsAt = toDateOrNull(input.endsAt, 'endsAt');

  if (startsAt && endsAt && Date.parse(endsAt) <= Date.parse(startsAt)) {
    throw new CommercialPartnerError('bad_request', 'Campaign end must be after its start.');
  }

  const placements = Array.from(new Set(input.placements || []));
  if (!placements.length || placements.length > COMMERCIAL_PLACEMENTS.length) {
    throw new CommercialPartnerError('bad_request', 'Choose at least one valid Partner placement.');
  }
  for (const placement of placements) {
    if (!includes(COMMERCIAL_PLACEMENTS, placement)) {
      throw new CommercialPartnerError('bad_request', 'Invalid Partner placement.');
    }
  }

  const canonical = await getCanonicalProducerContext(producerId, client);
  if (requestedDestination && requestedDestination !== canonical.destination) {
    throw new CommercialPartnerError('bad_request', 'Partner campaigns cannot target a different destination from the producer.');
  }
  if (requestedCategory && requestedCategory !== canonical.category) {
    throw new CommercialPartnerError('bad_request', 'Partner campaigns cannot target a different category from the producer.');
  }

  const { data, error } = await client.rpc('create_commercial_partner_campaign_v1', {
    p_producer_id: producerId,
    p_campaign_type: input.campaignType,
    p_headline: headline,
    p_message: message,
    p_destination: canonical.destination,
    p_category: canonical.category,
    p_starts_at: startsAt,
    p_ends_at: endsAt,
    p_placements: placements,
    p_actor_uid: actorUid,
  });

  assertNoError(error);
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new CommercialPartnerError('service_unavailable', 'Partner campaign creation could not be confirmed.');
  }

  const result = data as { campaign?: CommercialPartnerCampaign; placements?: CommercialPlacement[] };
  if (!result.campaign || !Array.isArray(result.placements)) {
    throw new CommercialPartnerError('service_unavailable', 'Partner campaign creation returned an invalid response.');
  }
  return { campaign: result.campaign, placements: result.placements };
}

export async function transitionCommercialPartnerCampaign(
  actorUid: string,
  campaignId: string,
  input: { status: string; reason?: string | null },
  db = adminDb(),
  supabase: SupabaseClient | null = getSupabaseAdmin()
): Promise<{ campaign: CommercialPartnerCampaign; placements: CommercialPlacement[] }> {
  await requireAdmin(actorUid, db);
  const client = requireSupabase(supabase);

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(campaignId)) {
    throw new CommercialPartnerError('bad_request', 'A valid campaign ID is required.');
  }
  if (!includes(COMMERCIAL_CAMPAIGN_STATUSES, input.status)) {
    throw new CommercialPartnerError('bad_request', 'Invalid Partner campaign status.');
  }
  const reason = normalizeOptionalText(input.reason, 500);

  const { data, error } = await client.rpc('transition_commercial_partner_campaign_v1', {
    p_campaign_id: campaignId,
    p_status: input.status,
    p_actor_uid: actorUid,
    p_reason: reason,
  });

  assertNoError(error);
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new CommercialPartnerError('service_unavailable', 'Partner campaign transition could not be confirmed.');
  }

  const result = data as { campaign?: CommercialPartnerCampaign; placements?: CommercialPlacement[] };
  if (!result.campaign || !Array.isArray(result.placements)) {
    throw new CommercialPartnerError('service_unavailable', 'Partner campaign transition returned an invalid response.');
  }
  return { campaign: result.campaign, placements: result.placements };
}


export async function updateCommercialPartnerCampaign(
  actorUid: string,
  campaignId: string,
  input: {
    headline: string;
    message?: string | null;
    startsAt?: string | null;
    endsAt?: string | null;
    placements: string[];
  },
  db = adminDb(),
  supabase: SupabaseClient | null = getSupabaseAdmin()
): Promise<{ campaign: CommercialPartnerCampaign; placements: CommercialPlacement[] }> {
  await requireAdmin(actorUid, db);
  const client = requireSupabase(supabase);

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(campaignId)) {
    throw new CommercialPartnerError('bad_request', 'A valid campaign ID is required.');
  }

  const headline = input.headline.trim();
  if (!headline || headline.length > 120) {
    throw new CommercialPartnerError('bad_request', 'Campaign headline must be between 1 and 120 characters.');
  }
  const message = normalizeOptionalText(input.message, 500);
  const startsAt = toDateOrNull(input.startsAt, 'startsAt');
  const endsAt = toDateOrNull(input.endsAt, 'endsAt');
  if (startsAt && endsAt && Date.parse(endsAt) <= Date.parse(startsAt)) {
    throw new CommercialPartnerError('bad_request', 'Campaign end must be after its start.');
  }

  const placements = Array.from(new Set(input.placements || []));
  if (!placements.length || placements.length > COMMERCIAL_PLACEMENTS.length) {
    throw new CommercialPartnerError('bad_request', 'Choose at least one valid Partner placement.');
  }
  for (const placement of placements) {
    if (!includes(COMMERCIAL_PLACEMENTS, placement)) {
      throw new CommercialPartnerError('bad_request', 'Invalid Partner placement.');
    }
  }

  const { data, error } = await client.rpc('update_commercial_partner_campaign_v1', {
    p_campaign_id: campaignId,
    p_headline: headline,
    p_message: message,
    p_starts_at: startsAt,
    p_ends_at: endsAt,
    p_placements: placements,
    p_actor_uid: actorUid,
  });

  assertNoError(error);
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new CommercialPartnerError('service_unavailable', 'Partner campaign update could not be confirmed.');
  }

  const result = data as { campaign?: CommercialPartnerCampaign; placements?: CommercialPlacement[] };
  if (!result.campaign || !Array.isArray(result.placements)) {
    throw new CommercialPartnerError('service_unavailable', 'Partner campaign update returned an invalid response.');
  }

  return { campaign: result.campaign, placements: result.placements };
}
