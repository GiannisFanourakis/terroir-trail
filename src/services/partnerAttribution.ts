import {
  trackIntent,
  type PartnerAction,
  type PartnerPlacement,
  type SourceSurface,
} from './intentAnalytics';
import type { ActivePartnerPlacement } from './partnerPlacementApi';

const STORAGE_KEY = 'terroir_partner_attribution_v1';
const ATTRIBUTION_TTL_MS = 30 * 60 * 1000;

export interface PartnerAttribution {
  campaignId: string;
  producerId: string;
  placement: PartnerPlacement;
  openedAt: number;
}

const readMap = (): Record<string, PartnerAttribution> => {
  try {
    if (typeof window === 'undefined') return {};
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const writeMap = (value: Record<string, PartnerAttribution>) => {
  try {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    }
  } catch {}
};

export function rememberPartnerAttribution(
  placement: Pick<ActivePartnerPlacement, 'campaignId' | 'producerId' | 'placement'>,
  now = Date.now()
): void {
  const map = readMap();
  map[placement.producerId] = {
    campaignId: placement.campaignId,
    producerId: placement.producerId,
    placement: placement.placement,
    openedAt: now,
  };
  writeMap(map);
}

export function getActivePartnerAttribution(
  producerId: string,
  now = Date.now()
): PartnerAttribution | null {
  const map = readMap();
  const entry = map[producerId];
  if (!entry) return null;

  if (
    !entry.campaignId ||
    entry.producerId !== producerId ||
    (entry.placement !== 'region_discovery' && entry.placement !== 'trip_preparation') ||
    !Number.isFinite(entry.openedAt) ||
    now - entry.openedAt > ATTRIBUTION_TTL_MS ||
    now < entry.openedAt
  ) {
    delete map[producerId];
    writeMap(map);
    return null;
  }

  return entry;
}

export function recordPartnerImpression(
  placement: ActivePartnerPlacement,
  sourceSurface: 'region_planning' | 'trip_preparation'
) {
  return trackIntent({
    event: 'partner_impression',
    sourceSurface,
    producerId: placement.producerId,
    partnerCampaignId: placement.campaignId,
    partnerPlacement: placement.placement,
  });
}

export function recordPartnerOpen(
  placement: ActivePartnerPlacement,
  sourceSurface: 'region_planning' | 'trip_preparation'
) {
  rememberPartnerAttribution(placement);
  return trackIntent({
    event: 'partner_open',
    sourceSurface,
    producerId: placement.producerId,
    partnerCampaignId: placement.campaignId,
    partnerPlacement: placement.placement,
  });
}

export function recordPartnerSaveIfAttributed(producerId: string) {
  const attribution = getActivePartnerAttribution(producerId);
  if (!attribution) return Promise.resolve(null);
  return trackIntent({
    event: 'partner_save',
    sourceSurface: 'producer_drawer',
    producerId,
    partnerCampaignId: attribution.campaignId,
    partnerPlacement: attribution.placement,
  });
}

export function recordPartnerTripAddIfAttributed(producerId: string) {
  const attribution = getActivePartnerAttribution(producerId);
  if (!attribution) return Promise.resolve(null);
  return trackIntent({
    event: 'partner_trip_add',
    sourceSurface: 'trip_add_flow',
    producerId,
    partnerCampaignId: attribution.campaignId,
    partnerPlacement: attribution.placement,
  });
}

export function recordPartnerContactIfAttributed(
  producerId: string,
  action: PartnerAction,
  sourceSurface: Extract<SourceSurface, 'producer_drawer' | 'trip_workspace'>
) {
  const attribution = getActivePartnerAttribution(producerId);
  if (!attribution) return Promise.resolve(null);
  return trackIntent({
    event: 'partner_contact_action',
    sourceSurface,
    producerId,
    partnerCampaignId: attribution.campaignId,
    partnerPlacement: attribution.placement,
    partnerAction: action,
  });
}
