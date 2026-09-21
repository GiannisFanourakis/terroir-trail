import type { Express, Request, Response } from 'express';
import { adminAuth } from './firebaseAdmin';
import {
  AFFILIATE_CAMPAIGN_ALLOWLIST,
  AFFILIATE_EVENTS,
  AUTH_REQUIRED_EVENTS,
  CANONICAL_DESTINATIONS,
  DESTINATION_COUNTRY_MAP,
  EVENT_ALLOWED_SURFACES,
  FROZEN_EVENT_NAMES,
  FROZEN_SOURCE_SURFACES,
  getAnalyticsHmacSecret,
  deriveActorKey,
  deriveSessionKey,
  ingestIntentEvent,
  lookupCanonicalProducer,
  PRODUCER_REQUIRED_EVENTS,
  REGION_EVENTS,
  type IntentEventName,
  type SourceSurface,
  type AffiliateCampaignId,
} from './services/analyticsIngestionService';

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_CONTEXT_STRING_LENGTH = 128;

const ALLOWED_REQUEST_KEYS = new Set([
  'schemaVersion',
  'event',
  'clientEventId',
  'sessionId',
  'producerId',
  'destination',
  'sourceSurface',
  'affiliateCampaignId',
]);

const defaults = {
  verifyToken: (token: string) => adminAuth().verifyIdToken(token, true),
  lookupProducer: lookupCanonicalProducer,
  ingestEvent: ingestIntentEvent,
  getHmacSecret: getAnalyticsHmacSecret,
  deriveActorKey,
  deriveSessionKey,
};

export type AnalyticsRouteDependencies = typeof defaults;

export function registerAnalyticsRoutes(
  app: Express,
  overrides: Partial<AnalyticsRouteDependencies> = {}
) {
  const deps: AnalyticsRouteDependencies = { ...defaults, ...overrides };

  // Lightweight in-memory rate limiting: max 120 events per minute per IP
  const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();
  const RATE_LIMIT_WINDOW_MS = 60_000;
  const RATE_LIMIT_MAX_PER_WINDOW = 120;

  app.post('/api/analytics/events', async (req: Request, res: Response): Promise<void> => {
    // 1. In-memory abuse prevention
    // Firebase Hosting/Cloud Run forwards the originating address in X-Forwarded-For.
    // This value is used transiently for abuse control only and is never persisted.
    const forwardedFor = req.get('x-forwarded-for')?.split(',')[0]?.trim();
    const ip = forwardedFor || req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const bucket = rateLimitBuckets.get(ip);
    if (!bucket || bucket.resetAt <= now) {
      rateLimitBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    } else if (bucket.count >= RATE_LIMIT_MAX_PER_WINDOW) {
      res.status(429).json({ error: 'Too many analytics events. Please slow down.' });
      return;
    } else {
      bucket.count += 1;
    }

    // 2. Reject non-JSON requests
    if (!req.is('application/json') && req.headers['content-type'] !== 'application/json') {
      res.status(400).json({ error: 'Request body must be application/json.' });
      return;
    }

    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      res.status(400).json({ error: 'Invalid JSON request body.' });
      return;
    }

    // 3. Reject any unrecognized top-level properties
    const bodyKeys = Object.keys(body);
    for (const key of bodyKeys) {
      if (!ALLOWED_REQUEST_KEYS.has(key)) {
        res.status(400).json({ error: `Unrecognized property: ${key}` });
        return;
      }
    }

    // 4. Validate schemaVersion === 1
    if (body.schemaVersion !== 1) {
      res.status(400).json({ error: 'Unsupported schemaVersion. Expected 1.' });
      return;
    }

    // 5. Validate clientEventId as UUID
    const clientEventId = typeof body.clientEventId === 'string' ? body.clientEventId.trim() : '';
    if (!clientEventId || !UUID_V4_REGEX.test(clientEventId)) {
      res.status(400).json({ error: 'Invalid clientEventId. Must be a valid UUID v4.' });
      return;
    }

    // 6. Validate sessionId as UUID
    const sessionId = typeof body.sessionId === 'string' ? body.sessionId.trim() : '';
    if (!sessionId || !UUID_V4_REGEX.test(sessionId)) {
      res.status(400).json({ error: 'Invalid sessionId. Must be a valid UUID v4.' });
      return;
    }

    // 7. Validate event in frozen vocabulary
    const eventName = body.event as IntentEventName;
    if (!eventName || !FROZEN_EVENT_NAMES.has(eventName)) {
      res.status(400).json({ error: `Invalid event name: ${String(body.event)}` });
      return;
    }

    // 8. Validate sourceSurface in frozen vocabulary
    const sourceSurface = body.sourceSurface as SourceSurface;
    if (!sourceSurface || !FROZEN_SOURCE_SURFACES.has(sourceSurface)) {
      res.status(400).json({ error: `Invalid sourceSurface: ${String(body.sourceSurface)}` });
      return;
    }

    // Validate event/sourceSurface combination
    const allowedSurfaces = EVENT_ALLOWED_SURFACES[eventName];
    if (!allowedSurfaces || !allowedSurfaces.has(sourceSurface)) {
      res.status(400).json({
        error: `sourceSurface "${sourceSurface}" is not allowed for event "${eventName}".`,
      });
      return;
    }

    // 9. Validate event-specific properties and resolve dimensions
    const normalizeOptionalString = (value: unknown, fieldName: string): string | null => {
      if (value == null) return null;
      if (typeof value !== 'string') {
        res.status(400).json({ error: `${fieldName} must be a string when supplied.` });
        return '__INVALID__';
      }
      const normalized = value.trim();
      if (normalized.length > MAX_CONTEXT_STRING_LENGTH) {
        res.status(400).json({ error: `${fieldName} exceeds the maximum allowed length.` });
        return '__INVALID__';
      }
      return normalized;
    };

    const rawProducerId = normalizeOptionalString(body.producerId, 'producerId');
    if (rawProducerId === '__INVALID__') return;
    const rawDestination = normalizeOptionalString(body.destination, 'destination');
    if (rawDestination === '__INVALID__') return;
    const rawAffiliateCampaignId = normalizeOptionalString(body.affiliateCampaignId, 'affiliateCampaignId');
    if (rawAffiliateCampaignId === '__INVALID__') return;

    let derivedProducerId: string | null = null;
    let derivedDestination: string | null = null;
    let derivedCountryCode: string | null = null;
    let derivedCategory: string | null = null;
    let derivedAffiliateCampaign: string | null = null;

    if (PRODUCER_REQUIRED_EVENTS.has(eventName)) {
      if (!rawProducerId) {
        res.status(400).json({ error: `producerId is required for event "${eventName}".` });
        return;
      }
      if (rawDestination !== null) {
        res.status(400).json({ error: `destination must not be client-supplied for event "${eventName}".` });
        return;
      }
      if (rawAffiliateCampaignId !== null) {
        res.status(400).json({ error: `affiliateCampaignId is not permitted for event "${eventName}".` });
        return;
      }

      // Resolve producer from catalogue
      const producer = await deps.lookupProducer(rawProducerId);
      if (!producer) {
        res.status(400).json({ error: `Producer "${rawProducerId}" not found in canonical catalogue.` });
        return;
      }

      derivedProducerId = producer.id;
      derivedDestination = producer.destination;
      const cc = producer.country_code || producer.countryCode || DESTINATION_COUNTRY_MAP[producer.destination];
      derivedCountryCode = cc ? cc.toUpperCase() : null;
      derivedCategory = producer.category;
    } else if (REGION_EVENTS.has(eventName)) {
      if (rawProducerId !== null) {
        res.status(400).json({ error: `producerId is not permitted for event "${eventName}".` });
        return;
      }
      if (!rawDestination || !CANONICAL_DESTINATIONS.has(rawDestination)) {
        res.status(400).json({ error: `Valid destination is required for event "${eventName}".` });
        return;
      }
      if (rawAffiliateCampaignId !== null) {
        res.status(400).json({ error: `affiliateCampaignId is not permitted for event "${eventName}".` });
        return;
      }

      derivedDestination = rawDestination;
      derivedCountryCode = DESTINATION_COUNTRY_MAP[rawDestination] || null;
    } else if (AFFILIATE_EVENTS.has(eventName)) {
      if (rawProducerId !== null) {
        res.status(400).json({ error: `producerId is not permitted for event "${eventName}".` });
        return;
      }
      if (!rawAffiliateCampaignId || !AFFILIATE_CAMPAIGN_ALLOWLIST.has(rawAffiliateCampaignId as AffiliateCampaignId)) {
        res.status(400).json({ error: `Valid affiliateCampaignId is required for event "${eventName}".` });
        return;
      }
      if (rawDestination !== null) {
        if (!CANONICAL_DESTINATIONS.has(rawDestination)) {
          res.status(400).json({ error: `Invalid destination context: "${rawDestination}".` });
          return;
        }
        derivedDestination = rawDestination;
        derivedCountryCode = DESTINATION_COUNTRY_MAP[rawDestination] || null;
      }

      derivedAffiliateCampaign = rawAffiliateCampaignId;
    } else {
      // Context-free trip events must remain context-free. Private trip IDs,
      // titles, dates, ordering and itinerary details are never accepted here.
      if (rawProducerId !== null || rawDestination !== null || rawAffiliateCampaignId !== null) {
        res.status(400).json({ error: `Context fields are not permitted for event "${eventName}".` });
        return;
      }
    }

    // 10. Authentication check
    const authHeader = req.get('authorization');
    let authenticatedUid: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      try {
        const decoded = await deps.verifyToken(token);
        authenticatedUid = decoded.uid;
      } catch {
        res.status(401).json({ error: 'Invalid or expired authentication token.' });
        return;
      }
    }

    if (AUTH_REQUIRED_EVENTS.has(eventName) && !authenticatedUid) {
      res.status(401).json({ error: `Authentication is required for event "${eventName}".` });
      return;
    }

    // 11. Pseudonym derivation via HMAC
    const hmacSecret = deps.getHmacSecret();
    if (!hmacSecret) {
      console.error('ANALYTICS_HMAC_SECRET is missing. Ingestion cannot proceed.');
      res.status(503).json({ error: 'Analytics service is temporarily unavailable.' });
      return;
    }

    const actorScope = authenticatedUid ? 'authenticated' : 'anonymous';
    const actorKey = authenticatedUid ? deps.deriveActorKey(authenticatedUid, hmacSecret) : null;
    const sessionKey = deps.deriveSessionKey(sessionId, hmacSecret);

    // 12. Supabase ingestion
    const result = await deps.ingestEvent({
      clientEventId,
      eventName,
      actorScope,
      actorKey,
      sessionKey,
      producerId: derivedProducerId,
      destination: derivedDestination,
      countryCode: derivedCountryCode,
      category: derivedCategory,
      sourceSurface,
      affiliateCampaign: derivedAffiliateCampaign,
      schemaVersion: 1,
    });

    if (!result.success) {
      console.error('Analytics warehouse ingestion error:', result.error);
      res.status(503).json({ error: 'Analytics warehouse is temporarily unavailable.' });
      return;
    }

    // 13. Minimal success response (never echo keys or internal tokens)
    res.status(200).json({ accepted: true, clientEventId });
  });
}
