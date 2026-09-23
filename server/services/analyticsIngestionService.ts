import { createHmac } from 'node:crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

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
  | 'affiliate_click'
  | 'partner_impression'
  | 'partner_open'
  | 'partner_save'
  | 'partner_trip_add'
  | 'partner_contact_action';

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

export type PartnerPlacement = 'region_discovery' | 'trip_preparation';
export type PartnerAction = 'website' | 'phone' | 'email' | 'directions';

export const FROZEN_EVENT_NAMES = new Set<IntentEventName>([
  'producer_view',
  'producer_share',
  'region_open',
  'region_producers_view',
  'producer_save',
  'producer_unsave',
  'producer_website_click',
  'producer_phone_click',
  'producer_email_click',
  'directions_click',
  'trip_created',
  'trip_renamed',
  'trip_producer_added',
  'trip_producer_removed',
  'trip_item_reordered',
  'trip_day_assigned',
  'trip_opened',
  'passport_stamp_added',
  'passport_stamp_removed',
  'affiliate_impression',
  'affiliate_click',
  'partner_impression',
  'partner_open',
  'partner_save',
  'partner_trip_add',
  'partner_contact_action',
]);

export const FROZEN_SOURCE_SURFACES = new Set<SourceSurface>([
  'producer_list_card',
  'map_canvas',
  'map_marker',
  'map_quick_card',
  'producer_drawer',
  'deep_link',
  'favorites',
  'passport',
  'region_drawer',
  'header_region_picker',
  'profile_menu',
  'trip_add_flow',
  'my_trips',
  'trip_workspace',
  'map_affiliate_banner',
  'trip_preparation',
  'region_planning',
]);

export const AFFILIATE_CAMPAIGN_ALLOWLIST = new Set<AffiliateCampaignId>([
  'klook-experiences',
  'localrent-cars',
  'welcome-pickups',
  'gettransfer-rides',
  'yesim-esim',
]);

export const EVENT_ALLOWED_SURFACES: Record<IntentEventName, ReadonlySet<SourceSurface>> = {
  producer_view: new Set([
    'producer_list_card',
    'map_marker',
    'map_quick_card',
    'deep_link',
    'favorites',
    'passport',
    'region_drawer',
    'trip_workspace',
  ]),
  producer_share: new Set([
    'producer_drawer',
    'map_quick_card',
    'trip_workspace',
  ]),
  region_open: new Set([
    'map_canvas',
    'header_region_picker',
  ]),
  region_producers_view: new Set([
    'region_drawer',
  ]),
  producer_save: new Set([
    'producer_drawer',
    'producer_list_card',
    'map_quick_card',
  ]),
  producer_unsave: new Set([
    'producer_drawer',
    'favorites',
    'producer_list_card',
    'map_quick_card',
  ]),
  producer_website_click: new Set([
    'producer_drawer',
    'trip_workspace',
  ]),
  producer_phone_click: new Set([
    'producer_drawer',
    'trip_workspace',
  ]),
  producer_email_click: new Set([
    'producer_drawer',
    'trip_workspace',
  ]),
  directions_click: new Set([
    'producer_drawer',
    'map_quick_card',
    'trip_workspace',
  ]),
  trip_created: new Set([
    'trip_add_flow',
    'my_trips',
    'profile_menu',
  ]),
  trip_renamed: new Set([
    'trip_workspace',
  ]),
  trip_producer_added: new Set([
    'trip_add_flow',
    'producer_drawer',
    'trip_workspace',
  ]),
  trip_producer_removed: new Set([
    'trip_workspace',
  ]),
  trip_item_reordered: new Set([
    'trip_workspace',
  ]),
  trip_day_assigned: new Set([
    'trip_workspace',
  ]),
  trip_opened: new Set([
    'my_trips',
    'profile_menu',
  ]),
  passport_stamp_added: new Set([
    'producer_drawer',
    'passport',
  ]),
  passport_stamp_removed: new Set([
    'producer_drawer',
    'passport',
  ]),
  affiliate_impression: new Set([
    'map_affiliate_banner',
    'trip_preparation',
    'region_planning',
  ]),
  affiliate_click: new Set([
    'map_affiliate_banner',
    'trip_preparation',
    'region_planning',
  ]),
  partner_impression: new Set([
    'region_planning',
    'trip_preparation',
  ]),
  partner_open: new Set([
    'region_planning',
    'trip_preparation',
  ]),
  partner_save: new Set([
    'producer_drawer',
  ]),
  partner_trip_add: new Set([
    'trip_add_flow',
  ]),
  partner_contact_action: new Set([
    'producer_drawer',
    'trip_workspace',
  ]),
};

export const AUTH_REQUIRED_EVENTS = new Set<IntentEventName>([
  'producer_save',
  'producer_unsave',
  'trip_created',
  'trip_renamed',
  'trip_producer_added',
  'trip_producer_removed',
  'trip_item_reordered',
  'trip_day_assigned',
  'trip_opened',
  'passport_stamp_added',
  'passport_stamp_removed',
  'partner_save',
  'partner_trip_add',
]);

export const PRODUCER_REQUIRED_EVENTS = new Set<IntentEventName>([
  'producer_view',
  'producer_share',
  'producer_save',
  'producer_unsave',
  'producer_website_click',
  'producer_phone_click',
  'producer_email_click',
  'directions_click',
  'trip_producer_added',
  'trip_producer_removed',
  'passport_stamp_added',
  'passport_stamp_removed',
  'partner_impression',
  'partner_open',
  'partner_save',
  'partner_trip_add',
  'partner_contact_action',
]);

export const REGION_EVENTS = new Set<IntentEventName>([
  'region_open',
  'region_producers_view',
]);

export const AFFILIATE_EVENTS = new Set<IntentEventName>([
  'affiliate_impression',
  'affiliate_click',
]);

export const PARTNER_EVENTS = new Set<IntentEventName>([
  'partner_impression',
  'partner_open',
  'partner_save',
  'partner_trip_add',
  'partner_contact_action',
]);

export const DESTINATION_COUNTRY_MAP: Record<string, string> = {
  crete: 'GR',
  santorini: 'GR',
  peloponnese: 'GR',
  thessaly: 'GR',
  northern_greece: 'GR',
  tuscany: 'IT',
  piedmont: 'IT',
  puglia: 'IT',
  sicily: 'IT',
  south_tyrol: 'IT',
  provence: 'FR',
  catalonia: 'ES',
  alentejo: 'PT',
  istria: 'HR',
  pomurska: 'SI',
  southeast_slovenia: 'SI',
  central_slovenia: 'SI',
  goriska: 'SI',
  trondelag: 'NO',
  more_og_romsdal: 'NO',
  buskerud: 'NO',
  vestland: 'NO',
};

export const CANONICAL_DESTINATIONS = new Set(Object.keys(DESTINATION_COUNTRY_MAP));

export class AnalyticsServiceError extends Error {
  constructor(
    public readonly code: 'bad_request' | 'unauthorized' | 'forbidden' | 'service_unavailable',
    message: string
  ) {
    super(message);
    this.name = 'AnalyticsServiceError';
  }
}

export interface ProducerLookupRow {
  id: string;
  destination: string;
  country?: string;
  country_code?: string;
  countryCode?: string;
  category: string;
}

let supabaseAdminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (supabaseAdminClient) return supabaseAdminClient;

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return null;
  }

  supabaseAdminClient = createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseAdminClient;
}

export function resetSupabaseAdminClient(): void {
  supabaseAdminClient = null;
}

export function getAnalyticsHmacSecret(): string {
  const secret = process.env.ANALYTICS_HMAC_SECRET || '';
  return secret.length >= 32 ? secret : '';
}

export function deriveActorKey(uid: string, secret: string): string {
  return 'v1:' + createHmac('sha256', secret).update(`actor:${uid}`).digest('hex');
}

export function deriveSessionKey(sessionId: string, secret: string): string {
  return 'v1:' + createHmac('sha256', secret).update(`session:${sessionId}`).digest('hex');
}

export async function lookupCanonicalProducer(
  producerId: string,
  supabase: SupabaseClient | null = getSupabaseAdmin()
): Promise<ProducerLookupRow | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('producers')
      .select('id, destination, country, country_code, category')
      .eq('id', producerId)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) return null;
    return data as ProducerLookupRow;
  } catch (error) {
    console.error('Producer lookup error:', error);
    return null;
  }
}

export interface IngestIntentEventParams {
  clientEventId: string;
  eventName: string;
  actorScope: 'anonymous' | 'authenticated';
  actorKey: string | null;
  sessionKey: string;
  producerId: string | null;
  destination: string | null;
  countryCode: string | null;
  category: string | null;
  sourceSurface: string;
  affiliateCampaign: string | null;
  partnerCampaignId?: string | null;
  partnerPlacement?: PartnerPlacement | null;
  partnerAction?: PartnerAction | null;
  schemaVersion?: number;
}

export async function ingestIntentEvent(
  params: IngestIntentEventParams,
  supabase: SupabaseClient | null = getSupabaseAdmin()
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Analytics warehouse is unavailable (missing credentials).' };
  }

  try {
    // V2 extends the established event contract only with Partner campaign
    // attribution fields. country/category remain database-derived trusted
    // dimensions and are never accepted from the browser.
    const { error } = await supabase.rpc('ingest_intent_event_v2', {
      p_schema_version: params.schemaVersion ?? 1,
      p_client_event_id: params.clientEventId,
      p_event_name: params.eventName,
      p_actor_scope: params.actorScope,
      p_actor_key: params.actorKey,
      p_session_key: params.sessionKey,
      p_producer_id: params.producerId,
      p_destination: params.destination,
      p_source_surface: params.sourceSurface,
      p_affiliate_campaign: params.affiliateCampaign,
      p_partner_campaign_id: params.partnerCampaignId ?? null,
      p_partner_placement: params.partnerPlacement ?? null,
      p_partner_action: params.partnerAction ?? null,
    });

    if (error) {
      console.error('Supabase ingest_intent_event_v2 error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('RPC invocation error:', err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}


export async function exportIntentEventsForFirebaseUid(
  uid: string,
  supabase: SupabaseClient | null = getSupabaseAdmin(),
  secret: string = getAnalyticsHmacSecret()
): Promise<unknown[]> {
  if (!uid) throw new Error('Authenticated user ID is required for analytics export.');
  if (!supabase || !secret) throw new Error('Analytics privacy export is unavailable.');

  const actorKey = deriveActorKey(uid, secret);
  const { data, error } = await supabase.rpc('export_intent_events_v1', {
    p_actor_key: actorKey,
  });

  if (error) {
    throw new Error(`Analytics privacy export failed: ${error.message}`);
  }

  return Array.isArray(data) ? data : data == null ? [] : [data];
}

export async function deleteIntentEventsForFirebaseUid(
  uid: string,
  supabase: SupabaseClient | null = getSupabaseAdmin(),
  secret: string = getAnalyticsHmacSecret()
): Promise<number> {
  if (!uid) throw new Error('Authenticated user ID is required for analytics deletion.');
  if (!supabase || !secret) throw new Error('Analytics privacy deletion is unavailable.');

  const actorKey = deriveActorKey(uid, secret);
  const { data, error } = await supabase.rpc('delete_intent_actor_v1', {
    p_actor_key: actorKey,
  });

  if (error) {
    throw new Error(`Analytics privacy deletion failed: ${error.message}`);
  }

  const deleted = Number(data ?? 0);
  return Number.isFinite(deleted) ? deleted : 0;
}
