import type { Express, Request, Response } from 'express';
import {
  ACQUISITION_CAMPAIGN_REGEX,
  ACQUISITION_CHANNELS,
  ACQUISITION_METHODS,
  ACQUISITION_SOURCES,
  deriveSessionKey,
  getAnalyticsHmacSecret,
  ingestSessionAcquisition,
  isConsistentAcquisition,
  type AcquisitionChannel,
  type AcquisitionMethod,
  type AcquisitionSource,
  type IngestSessionAcquisitionParams,
} from './services/sessionAcquisitionService';

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ALLOWED_REQUEST_KEYS = new Set([
  'schemaVersion',
  'sessionId',
  'source',
  'channel',
  'campaign',
  'attributionMethod',
]);

const defaults = {
  getHmacSecret: getAnalyticsHmacSecret,
  deriveSessionKey,
  ingestAcquisition: ingestSessionAcquisition,
};

export type SessionAcquisitionRouteDependencies = typeof defaults;

export function registerSessionAcquisitionRoutes(
  app: Express,
  overrides: Partial<SessionAcquisitionRouteDependencies> = {}
) {
  const deps: SessionAcquisitionRouteDependencies = { ...defaults, ...overrides };

  const rateLimitBuckets = new Map<
    string,
    { count: number; resetAt: number }
  >();
  const RATE_LIMIT_WINDOW_MS = 60_000;
  const RATE_LIMIT_MAX_PER_WINDOW = 60;

  app.post(
    '/api/analytics/session-acquisition',
    async (req: Request, res: Response): Promise<void> => {
      const forwardedFor = req.get('x-forwarded-for')?.split(',')[0]?.trim();
      const ip = forwardedFor || req.ip || req.socket.remoteAddress || 'unknown';
      const now = Date.now();
      const bucket = rateLimitBuckets.get(ip);

      if (!bucket || bucket.resetAt <= now) {
        rateLimitBuckets.set(ip, {
          count: 1,
          resetAt: now + RATE_LIMIT_WINDOW_MS,
        });
      } else if (bucket.count >= RATE_LIMIT_MAX_PER_WINDOW) {
        res.status(429).json({ error: 'Too many analytics requests. Please slow down.' });
        return;
      } else {
        bucket.count += 1;
      }

      if (!req.is('application/json') && req.headers['content-type'] !== 'application/json') {
        res.status(400).json({ error: 'Request body must be application/json.' });
        return;
      }

      const body = req.body;
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        res.status(400).json({ error: 'Invalid JSON request body.' });
        return;
      }

      for (const key of Object.keys(body)) {
        if (!ALLOWED_REQUEST_KEYS.has(key)) {
          res.status(400).json({ error: 'Unrecognized acquisition property.' });
          return;
        }
      }

      if (body.schemaVersion !== 1) {
        res.status(400).json({ error: 'Unsupported schemaVersion. Expected 1.' });
        return;
      }

      const sessionId =
        typeof body.sessionId === 'string' ? body.sessionId.trim() : '';
      if (!UUID_V4_REGEX.test(sessionId)) {
        res.status(400).json({ error: 'Invalid sessionId. Must be a valid UUID v4.' });
        return;
      }

      const source = body.source as AcquisitionSource;
      const channel = body.channel as AcquisitionChannel;
      const attributionMethod = body.attributionMethod as AcquisitionMethod;

      if (!ACQUISITION_SOURCES.has(source)) {
        res.status(400).json({ error: 'Invalid acquisition source.' });
        return;
      }
      if (!ACQUISITION_CHANNELS.has(channel)) {
        res.status(400).json({ error: 'Invalid acquisition channel.' });
        return;
      }
      if (!ACQUISITION_METHODS.has(attributionMethod)) {
        res.status(400).json({ error: 'Invalid attribution method.' });
        return;
      }

      let campaign: string | null = null;
      if (body.campaign !== null && body.campaign !== undefined) {
        if (
          typeof body.campaign !== 'string' ||
          !ACQUISITION_CAMPAIGN_REGEX.test(body.campaign)
        ) {
          res.status(400).json({ error: 'Invalid acquisition campaign.' });
          return;
        }
        campaign = body.campaign;
      }

      if (
        !isConsistentAcquisition(
          source,
          channel,
          campaign,
          attributionMethod
        )
      ) {
        res.status(400).json({ error: 'Inconsistent acquisition attribution.' });
        return;
      }

      const hmacSecret = deps.getHmacSecret();
      if (!hmacSecret) {
        console.error(
          'ANALYTICS_HMAC_SECRET is missing. Session acquisition cannot proceed.'
        );
        res
          .status(503)
          .json({ error: 'Analytics service is temporarily unavailable.' });
        return;
      }

      const params: IngestSessionAcquisitionParams = {
        sessionKey: deps.deriveSessionKey(sessionId, hmacSecret),
        source,
        channel,
        campaign,
        attributionMethod,
      };

      const result = await deps.ingestAcquisition(params);
      if (!result.success) {
        console.error(
          'Session acquisition warehouse ingestion failed:',
          result.error
        );
        res
          .status(503)
          .json({ error: 'Analytics warehouse is temporarily unavailable.' });
        return;
      }

      res.status(200).json({
        accepted: true,
        inserted: Boolean(result.inserted),
      });
    }
  );
}
