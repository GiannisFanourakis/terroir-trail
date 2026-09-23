import { resolveApiBaseUrl } from './apiOrigin';
import type { PartnerPlacement } from './intentAnalytics';

export interface ActivePartnerPlacement {
  campaignId: string;
  producerId: string;
  campaignType: 'regional_featured' | 'trip_contextual' | 'seasonal_notice';
  placement: PartnerPlacement;
  destination: string;
  category: string;
  headline: string;
  message: string | null;
  startsAt: string | null;
  endsAt: string | null;
}

export async function fetchActivePartnerPlacements(input: {
  placement: PartnerPlacement;
  destination: string;
  category?: string | null;
  limit?: number;
  fetchImpl?: typeof fetch;
  apiBaseUrl?: string;
}): Promise<ActivePartnerPlacement[]> {
  const fetchFn = input.fetchImpl || fetch;
  const params = new URLSearchParams({
    placement: input.placement,
    destination: input.destination,
    limit: String(Math.min(Math.max(input.limit || 3, 1), 5)),
  });
  if (input.category) params.set('category', input.category);

  const response = await fetchFn(
    `${input.apiBaseUrl ?? resolveApiBaseUrl()}/api/commercial/placements?${params.toString()}`,
    { cache: 'no-store' }
  );

  if (!response.ok) return [];
  const body = await response.json().catch(() => ({}));
  return Array.isArray(body?.placements) ? body.placements : [];
}
