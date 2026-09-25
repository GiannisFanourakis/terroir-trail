import type { SupabaseClient } from '@supabase/supabase-js';
import {
  deriveSessionKey,
  getAnalyticsHmacSecret,
  getSupabaseAdmin,
} from './analyticsIngestionService';

export type AcquisitionSource =
  | 'direct'
  | 'instagram'
  | 'facebook'
  | 'threads'
  | 'tiktok'
  | 'reddit'
  | 'youtube'
  | 'linkedin'
  | 'pinterest'
  | 'x'
  | 'google'
  | 'bing'
  | 'duckduckgo'
  | 'email'
  | 'other';

export type AcquisitionChannel =
  | 'direct'
  | 'social'
  | 'search'
  | 'email'
  | 'referral'
  | 'other';

export type AcquisitionMethod = 'utm' | 'referrer' | 'direct';

export const ACQUISITION_SOURCES = new Set<AcquisitionSource>([
  'direct',
  'instagram',
  'facebook',
  'threads',
  'tiktok',
  'reddit',
  'youtube',
  'linkedin',
  'pinterest',
  'x',
  'google',
  'bing',
  'duckduckgo',
  'email',
  'other',
]);

export const ACQUISITION_CHANNELS = new Set<AcquisitionChannel>([
  'direct',
  'social',
  'search',
  'email',
  'referral',
  'other',
]);

export const ACQUISITION_METHODS = new Set<AcquisitionMethod>([
  'utm',
  'referrer',
  'direct',
]);

export const ACQUISITION_CAMPAIGN_REGEX =
  /^[a-z0-9][a-z0-9_-]{0,63}$/;

export interface IngestSessionAcquisitionParams {
  sessionKey: string;
  source: AcquisitionSource;
  channel: AcquisitionChannel;
  campaign: string | null;
  attributionMethod: AcquisitionMethod;
}

export function isConsistentAcquisition(
  source: AcquisitionSource,
  channel: AcquisitionChannel,
  campaign: string | null,
  attributionMethod: AcquisitionMethod
): boolean {
  if (attributionMethod === 'direct') {
    return source === 'direct' && channel === 'direct' && campaign === null;
  }

  if (source === 'direct' || channel === 'direct') return false;
  if (attributionMethod === 'referrer' && campaign !== null) return false;

  if (
    [
      'instagram',
      'facebook',
      'threads',
      'tiktok',
      'reddit',
      'youtube',
      'linkedin',
      'pinterest',
      'x',
    ].includes(source)
  ) {
    return channel === 'social';
  }

  if (['google', 'bing', 'duckduckgo'].includes(source)) {
    return channel === 'search';
  }

  if (source === 'email') return channel === 'email';

  return true;
}

export async function ingestSessionAcquisition(
  params: IngestSessionAcquisitionParams,
  supabase: SupabaseClient | null = getSupabaseAdmin()
): Promise<{ success: boolean; inserted?: boolean; error?: string }> {
  if (!supabase) {
    return {
      success: false,
      error: 'Analytics warehouse is unavailable (missing credentials).',
    };
  }

  try {
    const { data, error } = await supabase.rpc('ingest_session_acquisition_v1', {
      p_session_key: params.sessionKey,
      p_external_source: params.source,
      p_external_channel: params.channel,
      p_campaign: params.campaign,
      p_attribution_method: params.attributionMethod,
    });

    if (error) {
      console.error('Supabase ingest_session_acquisition_v1 error:', error);
      return { success: false, error: error.message };
    }

    const first = Array.isArray(data) ? data[0] : data;
    return {
      success: true,
      inserted: Boolean(first?.inserted),
    };
  } catch (error) {
    console.error('Session acquisition RPC invocation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export { deriveSessionKey, getAnalyticsHmacSecret };
