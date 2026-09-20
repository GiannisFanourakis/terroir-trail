import { auth } from './firebase';
import { resolveApiBaseUrl } from './apiOrigin';
import { logger } from './logger';

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
  let allowed: string;
  if (event === 'producer_view') {
    allowed = 'producer_list_card|map_marker|map_quick_card|deep_link|favorites|passport|region_drawer|trip_workspace';
  } else if (event === 'producer_share') {
    allowed = 'producer_drawer|map_quick_card|trip_workspace';
  } else if (event === 'region_open') {
    allowed = 'map_canvas|header_region_picker';
  } else if (event === 'region_producers_view') {
    allowed = 'region_drawer';
  } else if (event === 'producer_save') {
    allowed = 'producer_drawer|producer_list_card|map_quick_card';
  } else if (event === 'producer_unsave') {
    allowed = 'producer_drawer|favorites|producer_list_card|map_quick_card';
  } else if (event === 'directions_click') {
    allowed = 'producer_drawer|map_quick_card|trip_workspace';
  } else if (event.startsWith('passport_')) {
    allowed = 'producer_drawer|passport';
  } else if (event.startsWith('affiliate_')) {
    allowed = 'map_affiliate_banner|trip_preparation|region_planning';
  } else {
    allowed = 'producer_drawer|trip_workspace';
  }
  return `|${allowed}|`.includes(`|${sourceSurface}|`);
}

export function generateUuidV4(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getSessionStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function getAnalyticsSessionId(storage: Storage | null = getSessionStorage()): string {
  if (!storage) return generateUuidV4();
  try {
    let sid = storage.getItem(SESSION_ID_STORAGE_KEY);
    if (!sid || !UUID_V4_REGEX.test(sid)) {
      sid = generateUuidV4();
      storage.setItem(SESSION_ID_STORAGE_KEY, sid);
    }
    return sid;
  } catch {
    return generateUuidV4();
  }
}

export function rotateAnalyticsSessionId(storage: Storage | null = getSessionStorage()): string {
  const newSid = generateUuidV4();
  if (storage) {
    try {
      storage.setItem(SESSION_ID_STORAGE_KEY, newSid);
    } catch {
      // Storage unavailable or quota exceeded
    }
  }
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
  const baseUrl = options.apiBaseUrl !== undefined ? options.apiBaseUrl : resolveApiBaseUrl();
  const maxRetries = options.maxRetries ?? 2;

  const payload = {
    schemaVersion: 1,
    event: params.event,
    clientEventId,
    sessionId,
    producerId: params.producerId ?? null,
    destination: params.destination ?? null,
    sourceSurface: params.sourceSurface,
    affiliateCampaignId: params.affiliateCampaignId ?? null,
  };

  const body = JSON.stringify(payload);

  let token: string | null = null;
  try {
    if (options.getAuthToken) {
      token = await options.getAuthToken();
    } else if (auth?.currentUser) {
      token = await auth.currentUser.getIdToken();
    }
  } catch {
    // Gracefully proceed without token if token fetch fails
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

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
        logger.warn('Analytics', 'intent_analytics_rejected', {
          event: params.event,
          status: response.status,
        });
        return { success: false, clientEventId };
      }
    } catch (networkError) {
      if (attempt === maxRetries) {
        logger.warn('Analytics', 'intent_analytics_network_failed', {
          event: params.event,
          attempt,
          error: networkError instanceof Error ? networkError.message : String(networkError),
        });
      }
    }

    // Delay before retry (jittered backoff)
    if (attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 300));
    }
  }

  return { success: false, clientEventId };
}
