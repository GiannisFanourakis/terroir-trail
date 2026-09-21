import { auth } from './firebase';
import { resolveApiBaseUrl } from './apiOrigin';

export type IntentEventName =
  | 'producer_view'
  | 'producer_share'
  | 'region_open'
  | 'region_producers_view'
  | 'producer_save'
  | 'producer_unsave'
  | 'producer_website_click'
  | 'producer_phone_click'
  | 'producer_email_click'
  | 'directions_click'
  | 'trip_created'
  | 'trip_renamed'
  | 'trip_producer_added'
  | 'trip_producer_removed'
  | 'trip_item_reordered'
  | 'trip_day_assigned'
  | 'trip_opened'
  | 'passport_stamp_added'
  | 'passport_stamp_removed'
  | 'affiliate_impression'
  | 'affiliate_click';

export type SourceSurface =
  | 'producer_list_card'
  | 'map_canvas'
  | 'map_marker'
  | 'map_quick_card'
  | 'producer_drawer'
  | 'deep_link'
  | 'favorites'
  | 'passport'
  | 'region_drawer'
  | 'header_region_picker'
  | 'profile_menu'
  | 'trip_add_flow'
  | 'my_trips'
  | 'trip_workspace'
  | 'map_affiliate_banner'
  | 'trip_preparation'
  | 'region_planning';

export type AffiliateCampaignId =
  | 'klook-experiences'
  | 'localrent-cars'
  | 'welcome-pickups'
  | 'gettransfer-rides'
  | 'yesim-esim';

export interface TrackIntentParams {
  event: IntentEventName;
  sourceSurface: SourceSurface;
  producerId?: string | null;
  destination?: string | null;
  affiliateCampaignId?: AffiliateCampaignId | null;
}

export type IntentEventPayload = TrackIntentParams;

export interface TrackIntentResult {
  success: boolean;
  clientEventId: string;
}

export const SESSION_ID_STORAGE_KEY = 'terroir_analytics_session_id';

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isAllowedIntentSourceSurface(
  event: IntentEventName,
  sourceSurface: SourceSurface
): boolean {
  if (event === 'region_open') return sourceSurface === 'map_canvas' || sourceSurface === 'header_region_picker';
  if (event === 'trip_created') return 'trip_add_flow|my_trips|profile_menu'.includes(sourceSurface);
  if (event === 'trip_renamed') return sourceSurface === 'trip_workspace';
  if (event === 'trip_producer_added') return 'trip_add_flow|producer_drawer|trip_workspace'.includes(sourceSurface);
  if (event === 'trip_producer_removed' || event === 'trip_item_reordered' || event === 'trip_day_assigned') {
    return sourceSurface === 'trip_workspace';
  }
  if (event === 'trip_opened') return sourceSurface === 'my_trips' || sourceSurface === 'profile_menu';
  if (event === 'region_producers_view') return sourceSurface === 'region_drawer';
  if (event.startsWith('affiliate_')) return 'map_affiliate_banner|trip_preparation|region_planning'.includes(sourceSurface);
  if (event.startsWith('passport_')) return sourceSurface === 'producer_drawer' || sourceSurface === 'passport';
  if (event === 'producer_save') return sourceSurface !== 'favorites' && 'producer_drawer|favorites|producer_list_card|map_quick_card'.includes(sourceSurface);
  if (event === 'producer_unsave') return 'producer_drawer|favorites|producer_list_card|map_quick_card'.includes(sourceSurface);
  if (event === 'producer_view') {
    return 'producer_list_card|map_marker|map_quick_card|deep_link|favorites|passport|region_drawer|trip_workspace'.includes(sourceSurface);
  }
  if (event === 'producer_share' || event === 'directions_click') return 'producer_drawer|map_quick_card|trip_workspace'.includes(sourceSurface);
  return sourceSurface === 'producer_drawer' || sourceSurface === 'trip_workspace';
}

export function generateUuidV4(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 3) | 8).toString(16);
  });
}

function getSessionStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : null;
  } catch {
    return null;
  }
}

export function getAnalyticsSessionId(storage: Storage | null = getSessionStorage()): string {
  try {
    const sid = storage?.getItem(SESSION_ID_STORAGE_KEY);
    if (sid && UUID_V4_REGEX.test(sid)) return sid;
    const newSid = generateUuidV4();
    storage?.setItem(SESSION_ID_STORAGE_KEY, newSid);
    return newSid;
  } catch {
    return generateUuidV4();
  }
}

export function rotateAnalyticsSessionId(storage: Storage | null = getSessionStorage()): string {
  const newSid = generateUuidV4();
  try {
    storage?.setItem(SESSION_ID_STORAGE_KEY, newSid);
  } catch {}
  return newSid;
}

export interface IntentAnalyticsOptions {
  fetchImpl?: typeof fetch;
  apiBaseUrl?: string;
  storage?: Storage | null;
  getAuthToken?: () => Promise<string | null>;
  maxRetries?: number;
}

/**
 * Emits a narrow first-party intent event to the trusted server.
 * Never throws. Never blocks product UX.
 * Employs bounded retries (reusing clientEventId for idempotency).
 */
export async function trackIntent(
  params: TrackIntentParams,
  options: IntentAnalyticsOptions = {}
): Promise<TrackIntentResult> {
  const clientEventId = generateUuidV4();

  if (!isAllowedIntentSourceSurface(params.event, params.sourceSurface)) {
    return { success: false, clientEventId };
  }

  const sessionId = getAnalyticsSessionId(options.storage ?? getSessionStorage());
  const fetchFn = options.fetchImpl || fetch;
  const baseUrl = options.apiBaseUrl ?? resolveApiBaseUrl();
  const maxRetries = options.maxRetries ?? 2;

  const body = JSON.stringify({
    schemaVersion: 1,
    event: params.event,
    clientEventId,
    sessionId,
    producerId: params.producerId ?? null,
    destination: params.destination ?? null,
    sourceSurface: params.sourceSurface,
    affiliateCampaignId: params.affiliateCampaignId ?? null,
  });

  let token: string | null = null;
  try {
    token = options.getAuthToken ? await options.getAuthToken() : (await auth?.currentUser?.getIdToken()) ?? null;
  } catch {}

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const endpoint = `${baseUrl}/api/analytics/events`;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchFn(endpoint, {
        method: 'POST',
        headers,
        body,
        cache: 'no-store',
      });

      if (response.ok || response.status === 202) {
        return { success: true, clientEventId };
      }

      // If client error (4xx except 429), retrying won't help
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        return { success: false, clientEventId };
      }
    } catch {
      // Network failure; proceed to next retry attempt
    }

    // Delay before retry (jittered backoff)
    if (attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 300));
    }
  }

  return { success: false, clientEventId };
}
