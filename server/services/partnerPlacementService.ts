import type { SupabaseClient } from '@supabase/supabase-js';
import { CANONICAL_DESTINATIONS, getSupabaseAdmin } from './analyticsIngestionService';

export const PARTNER_PUBLIC_PLACEMENTS = ['region_discovery', 'trip_preparation'] as const;
export type PartnerPublicPlacement = (typeof PARTNER_PUBLIC_PLACEMENTS)[number];

export interface ActivePartnerPlacement {
  campaignId: string;
  producerId: string;
  campaignType: 'regional_featured' | 'trip_contextual' | 'seasonal_notice';
  placement: PartnerPublicPlacement;
  destination: string;
  category: string;
  headline: string;
  message: string | null;
  startsAt: string | null;
  endsAt: string | null;
}

export class PartnerPlacementError extends Error {
  constructor(
    public readonly code: 'bad_request' | 'service_unavailable',
    message: string
  ) {
    super(message);
    this.name = 'PartnerPlacementError';
  }
}

const includes = <T extends readonly string[]>(values: T, value: string): value is T[number] =>
  (values as readonly string[]).includes(value);

const cleanOptional = (value: string | null | undefined, max: number): string | null => {
  if (value == null) return null;
  const clean = value.trim();
  if (!clean) return null;
  if (clean.length > max) {
    throw new PartnerPlacementError('bad_request', 'Partner placement context is too long.');
  }
  return clean;
};

export async function getActivePartnerPlacements(
  input: {
    placement: string;
    destination: string;
    category?: string | null;
    limit?: number;
    now?: Date;
  },
  supabase: SupabaseClient | null = getSupabaseAdmin()
): Promise<ActivePartnerPlacement[]> {
  if (!includes(PARTNER_PUBLIC_PLACEMENTS, input.placement)) {
    throw new PartnerPlacementError('bad_request', 'Invalid Partner placement.');
  }

  const destination = input.destination.trim();
  if (!destination || !CANONICAL_DESTINATIONS.has(destination)) {
    throw new PartnerPlacementError('bad_request', 'A valid destination is required.');
  }

  const category = cleanOptional(input.category, 80);
  const limit = Math.min(Math.max(Number(input.limit || 3), 1), 5);
  const now = input.now || new Date();

  if (!supabase) {
    throw new PartnerPlacementError('service_unavailable', 'Partner placement service is temporarily unavailable.');
  }

  const campaignResult = await supabase
    .from('commercial_partner_campaigns')
    .select('id, producer_id, campaign_type, destination, category, headline, message, starts_at, ends_at, created_at')
    .eq('status', 'active')
    .eq('destination', destination)
    .order('created_at', { ascending: true })
    .limit(25);

  if (campaignResult.error) {
    throw new PartnerPlacementError('service_unavailable', 'Partner placement service is temporarily unavailable.');
  }

  const campaigns = (campaignResult.data || []).filter((campaign: any) => {
    if (!campaign?.id || !campaign?.producer_id) return false;
    if (category && campaign.category !== category) return false;
    if (campaign.starts_at && Date.parse(campaign.starts_at) > now.getTime()) return false;
    if (campaign.ends_at && Date.parse(campaign.ends_at) <= now.getTime()) return false;
    return true;
  });

  if (!campaigns.length) return [];

  const campaignIds = campaigns.map((campaign: any) => String(campaign.id));
  const producerIds = Array.from(new Set(campaigns.map((campaign: any) => String(campaign.producer_id))));

  const [placementResult, partnerResult, producerResult] = await Promise.all([
    supabase
      .from('commercial_partner_campaign_placements')
      .select('campaign_id, placement')
      .in('campaign_id', campaignIds)
      .eq('placement', input.placement),
    supabase
      .from('commercial_partner_accounts')
      .select('producer_id')
      .in('producer_id', producerIds)
      .eq('status', 'active'),
    supabase
      .from('producers')
      .select('id')
      .in('id', producerIds)
      .eq('is_active', true),
  ]);

  if (placementResult.error || partnerResult.error || producerResult.error) {
    throw new PartnerPlacementError('service_unavailable', 'Partner placement service is temporarily unavailable.');
  }

  const allowedCampaignIds = new Set(
    (placementResult.data || []).map((row: any) => String(row.campaign_id))
  );
  const activePartnerProducerIds = new Set(
    (partnerResult.data || []).map((row: any) => String(row.producer_id))
  );
  const activeProducerIds = new Set(
    (producerResult.data || []).map((row: any) => String(row.id))
  );

  return campaigns
    .filter((campaign: any) =>
      allowedCampaignIds.has(String(campaign.id)) &&
      activePartnerProducerIds.has(String(campaign.producer_id)) &&
      activeProducerIds.has(String(campaign.producer_id))
    )
    .slice(0, limit)
    .map((campaign: any) => ({
      campaignId: String(campaign.id),
      producerId: String(campaign.producer_id),
      campaignType: campaign.campaign_type,
      placement: input.placement,
      destination: String(campaign.destination),
      category: String(campaign.category),
      headline: String(campaign.headline),
      message: campaign.message ? String(campaign.message) : null,
      startsAt: campaign.starts_at ? String(campaign.starts_at) : null,
      endsAt: campaign.ends_at ? String(campaign.ends_at) : null,
    }));
}
