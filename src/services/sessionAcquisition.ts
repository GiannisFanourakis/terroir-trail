import { resolveApiBaseUrl } from './apiOrigin';
import { getAnalyticsSessionId } from './intentAnalytics';

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

export interface SessionAcquisition {
  source: AcquisitionSource;
  channel: AcquisitionChannel;
  campaign: string | null;
  attributionMethod: AcquisitionMethod;
}

export interface CaptureSessionAcquisitionOptions {
  fetchImpl?: typeof fetch;
  apiBaseUrl?: string;
  storage?: Storage | null;
  href?: string;
  referrer?: string;
  maxRetries?: number;
}

const CAMPAIGN_SLUG_REGEX = /^[a-z0-9][a-z0-9_-]{0,63}$/;

const SOCIAL_SOURCES = new Set<AcquisitionSource>([
  'instagram',
  'facebook',
  'threads',
  'tiktok',
  'reddit',
  'youtube',
  'linkedin',
  'pinterest',
  'x',
]);

const SEARCH_SOURCES = new Set<AcquisitionSource>([
  'google',
  'bing',
  'duckduckgo',
]);

function getSessionStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : null;
  } catch {
    return null;
  }
}

function normalizeCampaign(value: string | null): string | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return CAMPAIGN_SLUG_REGEX.test(normalized) ? normalized : null;
}

function normalizeUtmSource(value: string | null): AcquisitionSource {
  const source = (value || '').trim().toLowerCase();

  if (source === 'instagram' || source === 'ig') return 'instagram';
  if (source === 'facebook' || source === 'fb') return 'facebook';
  if (source === 'threads') return 'threads';
  if (source === 'tiktok') return 'tiktok';
  if (source === 'reddit') return 'reddit';
  if (source === 'youtube' || source === 'yt') return 'youtube';
  if (source === 'linkedin') return 'linkedin';
  if (source === 'pinterest') return 'pinterest';
  if (source === 'twitter' || source === 'x') return 'x';
  if (source === 'google') return 'google';
  if (source === 'bing') return 'bing';
  if (source === 'duckduckgo' || source === 'ddg') return 'duckduckgo';
  if (source === 'email' || source === 'newsletter') return 'email';

  return 'other';
}

function deriveUtmChannel(
  source: AcquisitionSource,
  mediumValue: string | null
): AcquisitionChannel {
  const medium = (mediumValue || '').trim().toLowerCase();

  // Known sources determine the coarse channel first. This keeps attribution
  // internally consistent even when a campaign uses generic media labels such
  // as "cpc" for a paid social placement.
  if (SOCIAL_SOURCES.has(source)) return 'social';
  if (SEARCH_SOURCES.has(source)) return 'search';
  if (source === 'email') return 'email';

  if (
    ['social', 'social-organic', 'organic_social', 'organic-social', 'paid_social', 'paid-social'].includes(
      medium
    )
  ) {
    return 'social';
  }
  if (['email', 'newsletter'].includes(medium)) return 'email';
  if (medium === 'referral') return 'referral';
  if (['organic', 'search', 'cpc', 'ppc', 'sem'].includes(medium)) return 'search';

  return 'other';
}

function hostMatches(hostname: string, domain: string): boolean {
  return hostname === domain || hostname.endsWith('.' + domain);
}

function classifyReferrer(
  referrer: string,
  currentOrigin: string
): SessionAcquisition {
  if (!referrer) {
    return {
      source: 'direct',
      channel: 'direct',
      campaign: null,
      attributionMethod: 'direct',
    };
  }

  try {
    const referrerUrl = new URL(referrer);
    if (referrerUrl.origin === currentOrigin) {
      return {
        source: 'direct',
        channel: 'direct',
        campaign: null,
        attributionMethod: 'direct',
      };
    }

    const host = referrerUrl.hostname.toLowerCase();

    if (hostMatches(host, 'instagram.com')) {
      return { source: 'instagram', channel: 'social', campaign: null, attributionMethod: 'referrer' };
    }
    if (hostMatches(host, 'facebook.com')) {
      return { source: 'facebook', channel: 'social', campaign: null, attributionMethod: 'referrer' };
    }
    if (hostMatches(host, 'threads.net')) {
      return { source: 'threads', channel: 'social', campaign: null, attributionMethod: 'referrer' };
    }
    if (hostMatches(host, 'tiktok.com')) {
      return { source: 'tiktok', channel: 'social', campaign: null, attributionMethod: 'referrer' };
    }
    if (hostMatches(host, 'reddit.com')) {
      return { source: 'reddit', channel: 'social', campaign: null, attributionMethod: 'referrer' };
    }
    if (hostMatches(host, 'youtube.com') || hostMatches(host, 'youtu.be')) {
      return { source: 'youtube', channel: 'social', campaign: null, attributionMethod: 'referrer' };
    }
    if (hostMatches(host, 'linkedin.com')) {
      return { source: 'linkedin', channel: 'social', campaign: null, attributionMethod: 'referrer' };
    }
    if (hostMatches(host, 'pinterest.com')) {
      return { source: 'pinterest', channel: 'social', campaign: null, attributionMethod: 'referrer' };
    }
    if (
      hostMatches(host, 'x.com') ||
      hostMatches(host, 'twitter.com') ||
      hostMatches(host, 't.co')
    ) {
      return { source: 'x', channel: 'social', campaign: null, attributionMethod: 'referrer' };
    }
    if (hostMatches(host, 'google.com') || host.startsWith('www.google.')) {
      return { source: 'google', channel: 'search', campaign: null, attributionMethod: 'referrer' };
    }
    if (hostMatches(host, 'bing.com')) {
      return { source: 'bing', channel: 'search', campaign: null, attributionMethod: 'referrer' };
    }
    if (hostMatches(host, 'duckduckgo.com')) {
      return { source: 'duckduckgo', channel: 'search', campaign: null, attributionMethod: 'referrer' };
    }

    return {
      source: 'other',
      channel: 'referral',
      campaign: null,
      attributionMethod: 'referrer',
    };
  } catch {
    return {
      source: 'direct',
      channel: 'direct',
      campaign: null,
      attributionMethod: 'direct',
    };
  }
}

export function deriveSessionAcquisition(
  href: string,
  referrer = ''
): SessionAcquisition {
  try {
    const url = new URL(href);
    const utmSource = url.searchParams.get('utm_source');
    const utmMedium = url.searchParams.get('utm_medium');
    const utmCampaign = url.searchParams.get('utm_campaign');

    if (utmSource || utmMedium) {
      const source = normalizeUtmSource(utmSource);
      return {
        source,
        channel: deriveUtmChannel(source, utmMedium),
        campaign: normalizeCampaign(utmCampaign),
        attributionMethod: 'utm',
      };
    }

    return classifyReferrer(referrer, url.origin);
  } catch {
    return {
      source: 'direct',
      channel: 'direct',
      campaign: null,
      attributionMethod: 'direct',
    };
  }
}

/**
 * Records first-touch acquisition for the current analytics session.
 * The server persists only the HMAC-pseudonymous session key plus coarse,
 * allowlisted attribution dimensions. Raw referrer URLs are never sent.
 *
 * This function never throws and never blocks app startup.
 */
export async function captureSessionAcquisition(
  options: CaptureSessionAcquisitionOptions = {}
): Promise<boolean> {
  const href =
    options.href ??
    (typeof window !== 'undefined' ? window.location.href : 'https://terroir-trail.web.app/');
  const referrer =
    options.referrer ??
    (typeof document !== 'undefined' ? document.referrer : '');
  const attribution = deriveSessionAcquisition(href, referrer);
  const sessionId = getAnalyticsSessionId(options.storage ?? getSessionStorage());
  const fetchFn = options.fetchImpl || fetch;
  const baseUrl = options.apiBaseUrl ?? resolveApiBaseUrl();
  const maxRetries = options.maxRetries ?? 1;

  const body = JSON.stringify({
    schemaVersion: 1,
    sessionId,
    source: attribution.source,
    channel: attribution.channel,
    campaign: attribution.campaign,
    attributionMethod: attribution.attributionMethod,
  });

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchFn(baseUrl + '/api/analytics/session-acquisition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        cache: 'no-store',
        keepalive: true,
      });

      if (response.ok || response.status === 202) return true;
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        return false;
      }
    } catch {
      // Network failure; retry below.
    }

    if (attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 250));
    }
  }

  return false;
}
