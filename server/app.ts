import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import cors from 'cors';
import { adminAuth } from './firebaseAdmin';
import {
  createPassBillingPortal,
  createPassCheckout,
  fulfillPass,
  getExplorerPass,
  verifyExplorerPass,
} from './services/passService';
import { isActiveProducerOwner } from './services/producerAuthorization';
import { getTrustedAccountCapabilities } from './services/accountAuthorization';
import {
  AdminAuthorityError,
  changeAdminAuthority,
} from './services/adminAuthorityService';
import {
  AdminClaimError,
  listPendingProducerClaims,
  approveProducerClaim,
  rejectProducerClaim,
} from './services/adminClaimsService';
import {
  AdminOwnershipError,
  listActiveProducerOwnerships,
  reassignProducerOwnership,
  revokeProducerOwnership,
} from './services/adminOwnershipService';
import {
  AdminMetricsError,
  getAdminDashboardMetrics,
} from './services/adminMetricsService';
import {
  ProducerVerificationError,
  completeProducerContactVerification,
  runProducerVerification,
} from './services/producerVerificationService';
import {
  sendProducerApprovalEmail,
  sendTravelerWelcomeEmail,
} from './services/transactionalEmailTransport';
import { handleWebhookEvent } from './services/webhookService';

const defaults = {
  verifyToken: (token: string) => adminAuth().verifyIdToken(token, true),
  isActiveProducerOwner,
  getTrustedAccountCapabilities,
  changeAdminAuthority,
  listPendingProducerClaims,
  approveProducerClaim,
  rejectProducerClaim,
  listActiveProducerOwnerships,
  reassignProducerOwnership,
  revokeProducerOwnership,
  getAdminDashboardMetrics,
  runProducerVerification,
  completeProducerContactVerification,
  sendProducerApprovalEmail,
  sendTravelerWelcomeEmail,
  createPassCheckout,
  createPassBillingPortal,
  fulfillPass,
  getExplorerPass,
  verifyExplorerPass,
  handleWebhookEvent,
};

type AppDependencies = typeof defaults;

export function createApp(overrides: Partial<AppDependencies> = {}) {
  const deps: AppDependencies = { ...defaults, ...overrides };
  const app = express();
  const origins = (
    process.env.ALLOWED_ORIGINS ||
    'http://localhost:5173,https://localhost,capacitor://localhost'
  )
    .split(',')
    .map((origin) => origin.trim());
  if (process.env.APP_URL) origins.push(new URL(process.env.APP_URL).origin);
  app.use(cors({ origin: origins }));
  app.use('/api', (_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  app.post(
    '/api/webhook',
    express.raw({ type: 'application/json', limit: '256kb' }),
    async (req, res) => {
      try {
        const result = await deps.handleWebhookEvent(
          req.body,
          req.get('stripe-signature')
        );
        res.json({ received: true, ...result });
      } catch (error) {
        console.error('Webhook rejected:', error);
        res
          .status(400)
          .json({ error: 'Webhook could not be verified or processed.' });
      }
    }
  );

  app.use(express.json({ limit: '16kb' }));
  const telemetryBuckets = new Map<
    string,
    { count: number; resetAt: number }
  >();
  const TELEMETRY_WINDOW_MS = 60_000;
  const TELEMETRY_MAX_PER_WINDOW = 20;
  const sensitiveKey =
    /password|passwd|secret|token|credential|authorization|bearer|email|phone|telephone|mobile|tel|vat|note/i;
  const redactText = (value: string) =>
    value
      .replace(
        /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g,
        '[REDACTED_EMAIL]'
      )
      .replace(/Bearer\s+[a-zA-Z0-9._~+/-]+=*/gi, 'Bearer [REDACTED]')
      .slice(0, 1000);
  const sanitizeDiagnosticValue = (value: unknown, depth = 0): unknown => {
    if (depth > 2) return '[TRUNCATED]';
    if (
      value === null ||
      value === undefined ||
      typeof value === 'boolean' ||
      typeof value === 'number'
    )
      return value;
    if (typeof value === 'string') return redactText(value);
    if (Array.isArray(value)) {
      return value
        .slice(0, 10)
        .map((item) => sanitizeDiagnosticValue(item, depth + 1));
    }
    if (typeof value === 'object') {
      const result: Record<string, unknown> = {};
      for (const [key, nested] of Object.entries(
        value as Record<string, unknown>
      ).slice(0, 30)) {
        result[key] = sensitiveKey.test(key)
          ? '[REDACTED]'
          : sanitizeDiagnosticValue(nested, depth + 1);
      }
      return result;
    }
    return String(typeof value);
  };

  app.post('/api/client-errors', (req, res) => {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const bucket = telemetryBuckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      telemetryBuckets.set(key, {
        count: 1,
        resetAt: now + TELEMETRY_WINDOW_MS,
      });
    } else if (bucket.count >= TELEMETRY_MAX_PER_WINDOW) {
      res.status(429).json({ accepted: false });
      return;
    } else {
      bucket.count += 1;
    }

    const scope =
      typeof req.body?.scope === 'string'
        ? redactText(req.body.scope).slice(0, 80)
        : 'Client';
    const event =
      typeof req.body?.event === 'string'
        ? redactText(req.body.event).slice(0, 100)
        : 'unknown_error';
    const buildId =
      typeof req.body?.buildId === 'string'
        ? redactText(req.body.buildId).slice(0, 160)
        : 'unknown';
    const path =
      typeof req.body?.path === 'string'
        ? redactText(req.body.path).slice(0, 240)
        : '/';

    const diagnostic = {
      scope,
      event,
      buildId,
      path,
      deviceClass: ['phone', 'tablet', 'desktop', 'unknown'].includes(
        req.body?.deviceClass
      )
        ? req.body.deviceClass
        : 'unknown',
      standalone: Boolean(req.body?.standalone),
      online:
        typeof req.body?.online === 'boolean' ? req.body.online : undefined,
      error: sanitizeDiagnosticValue(req.body?.error),
      metadata: sanitizeDiagnosticValue(req.body?.metadata),
      receivedAt: new Date().toISOString(),
    };

    console.error('[ClientDiagnostics]', JSON.stringify(diagnostic));
    res.status(202).json({ accepted: true });
  });

  const requireAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const bearer = req.get('authorization');
    if (!bearer?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Sign in to manage your Explorer pass.' });
      return;
    }
    try {
      res.locals.identity = await deps.verifyToken(bearer.slice(7));
      next();
    } catch {
      res
        .status(401)
        .json({ error: 'Your session has expired. Please sign in again.' });
    }
  };

  const requireActiveProducerOwner = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!(await deps.isActiveProducerOwner(res.locals.identity.uid))) {
        res.status(403).json({
          error:
            'Verified producer access is required to verify Explorer passes.',
        });
        return;
      }
      next();
    } catch (error) {
      console.error('Producer authorization unavailable:', error);
      res
        .status(503)
        .json({ error: 'Pass verification is temporarily unavailable.' });
    }
  };

  const producerVerificationErrorStatus = (error: ProducerVerificationError) =>
    error.code === 'bad_request'
      ? 400
      : error.code === 'forbidden'
        ? 403
        : error.code === 'not_found'
          ? 404
          : 409;

  app.get('/api/account/capabilities', requireAuth, async (_req, res) => {
    try {
      const capabilities = await deps.getTrustedAccountCapabilities(
        res.locals.identity.uid
      );
      res.json({ capabilities });
    } catch (error) {
      console.error('Account capability lookup unavailable:', error);
      res
        .status(503)
        .json({ error: 'Account permissions are temporarily unavailable.' });
    }
  });

  app.post('/api/account/welcome-email', requireAuth, async (req, res) => {
    try {
      const delivery = await deps.sendTravelerWelcomeEmail({
        uid: res.locals.identity.uid,
        preferredName:
          typeof req.body?.name === 'string' ? req.body.name.trim() : undefined,
      });
      res.json({ delivery });
    } catch (error) {
      console.error('Traveler welcome email unavailable:', error);
      res
        .status(503)
        .json({ error: 'Welcome email delivery is temporarily unavailable.' });
    }
  });

  app.post(
    '/api/account/producer-claims/:producerId/verify',
    requireAuth,
    async (req, res) => {
      try {
        const verification = await deps.runProducerVerification(
          res.locals.identity.uid,
          String(req.params.producerId)
        );
        res.json({ verification });
      } catch (error) {
        if (error instanceof ProducerVerificationError) {
          res
            .status(producerVerificationErrorStatus(error))
            .json({ error: error.message });
          return;
        }
        console.error('Producer verification unavailable:', error);
        res
          .status(503)
          .json({ error: 'Producer verification is temporarily unavailable.' });
      }
    }
  );

  app.get('/api/account/producer-contact-verification', async (req, res) => {
    const publicAppUrl = (
      process.env.APP_URL || 'https://terroir-trail.web.app'
    ).replace(/\/$/, '');
    const token = typeof req.query.token === 'string' ? req.query.token : '';
    try {
      const result = await deps.completeProducerContactVerification(token);
      res.redirect(
        303,
        `${publicAppUrl}/?producerVerification=success&producer=${encodeURIComponent(result.producerId)}`
      );
    } catch (error) {
      if (!(error instanceof ProducerVerificationError)) {
        console.error('Producer contact verification unavailable:', error);
      }
      res.redirect(303, `${publicAppUrl}/?producerVerification=failed`);
    }
  });

  app.get('/api/admin/metrics', requireAuth, async (_req, res) => {
    try {
      const metrics = await deps.getAdminDashboardMetrics(
        res.locals.identity.uid
      );
      res.json({ metrics });
    } catch (error) {
      if (error instanceof AdminMetricsError && error.code === 'forbidden') {
        res.status(403).json({ error: error.message });
        return;
      }
      console.error('Admin metrics unavailable:', error);
      res
        .status(503)
        .json({ error: 'Administrative metrics are temporarily unavailable.' });
    }
  });

  app.post('/api/admin/authority', requireAuth, async (req, res) => {
    const action = req.body?.action;
    const target = {
      userId:
        typeof req.body?.userId === 'string'
          ? req.body.userId.trim()
          : undefined,
      email:
        typeof req.body?.email === 'string' ? req.body.email.trim() : undefined,
    };

    try {
      const result = await deps.changeAdminAuthority(
        res.locals.identity.uid,
        action,
        target
      );
      res.json({ authority: result });
    } catch (error) {
      if (error instanceof AdminAuthorityError) {
        const status =
          error.code === 'bad_request'
            ? 400
            : error.code === 'forbidden'
              ? 403
              : error.code === 'not_found'
                ? 404
                : 409;
        res.status(status).json({ error: error.message });
        return;
      }
      console.error('Admin authority change unavailable:', error);
      res.status(503).json({
        error: 'Admin authority management is temporarily unavailable.',
      });
    }
  });

  app.get('/api/admin/ownerships', requireAuth, async (_req, res) => {
    try {
      const ownerships = await deps.listActiveProducerOwnerships(
        res.locals.identity.uid
      );
      res.json({ ownerships });
    } catch (error) {
      if (error instanceof AdminOwnershipError) {
        const status =
          error.code === 'bad_request'
            ? 400
            : error.code === 'forbidden'
              ? 403
              : error.code === 'not_found'
                ? 404
                : 409;
        res.status(status).json({ error: error.message });
        return;
      }
      console.error('Producer ownership list unavailable:', error);
      res.status(503).json({
        error: 'Producer ownership management is temporarily unavailable.',
      });
    }
  });

  app.post(
    '/api/admin/ownerships/:producerId/revoke',
    requireAuth,
    async (req, res) => {
      try {
        const ownership = await deps.revokeProducerOwnership(
          res.locals.identity.uid,
          String(req.params.producerId),
          typeof req.body?.reason === 'string' ? req.body.reason : ''
        );
        res.json({ ownership });
      } catch (error) {
        if (error instanceof AdminOwnershipError) {
          const status =
            error.code === 'bad_request'
              ? 400
              : error.code === 'forbidden'
                ? 403
                : error.code === 'not_found'
                  ? 404
                  : 409;
          res.status(status).json({ error: error.message });
          return;
        }
        console.error('Producer ownership revoke unavailable:', error);
        res.status(503).json({
          error: 'Producer ownership management is temporarily unavailable.',
        });
      }
    }
  );

  app.post(
    '/api/admin/ownerships/:producerId/reassign',
    requireAuth,
    async (req, res) => {
      try {
        const ownership = await deps.reassignProducerOwnership(
          res.locals.identity.uid,
          String(req.params.producerId),
          typeof req.body?.email === 'string' ? req.body.email : '',
          typeof req.body?.reason === 'string' ? req.body.reason : ''
        );
        res.json({ ownership });
      } catch (error) {
        if (error instanceof AdminOwnershipError) {
          const status =
            error.code === 'bad_request'
              ? 400
              : error.code === 'forbidden'
                ? 403
                : error.code === 'not_found'
                  ? 404
                  : 409;
          res.status(status).json({ error: error.message });
          return;
        }
        console.error('Producer ownership reassignment unavailable:', error);
        res.status(503).json({
          error: 'Producer ownership management is temporarily unavailable.',
        });
      }
    }
  );

  app.get('/api/admin/claims', requireAuth, async (_req, res) => {
    try {
      const claims = await deps.listPendingProducerClaims(
        res.locals.identity.uid
      );
      res.json({ claims });
    } catch (error) {
      if (error instanceof AdminClaimError && error.code === 'forbidden') {
        res.status(403).json({ error: error.message });
        return;
      }
      console.error('Producer claim queue unavailable:', error);
      res
        .status(503)
        .json({ error: 'Producer request queue is temporarily unavailable.' });
    }
  });

  app.post(
    '/api/admin/claims/:producerId/verify',
    requireAuth,
    async (req, res) => {
      try {
        const verification = await deps.runProducerVerification(
          res.locals.identity.uid,
          String(req.params.producerId)
        );
        res.json({ verification });
      } catch (error) {
        if (error instanceof ProducerVerificationError) {
          res
            .status(producerVerificationErrorStatus(error))
            .json({ error: error.message });
          return;
        }
        console.error('Admin producer verification unavailable:', error);
        res
          .status(503)
          .json({ error: 'Producer verification is temporarily unavailable.' });
      }
    }
  );

  app.post(
    '/api/admin/claims/:producerId/approve',
    requireAuth,
    async (req, res) => {
      try {
        const result = await deps.approveProducerClaim(
          res.locals.identity.uid,
          String(req.params.producerId)
        );

        let emailDelivery;
        try {
          emailDelivery = await deps.sendProducerApprovalEmail({
            actorUid: res.locals.identity.uid,
            ownerUid: result.ownerUid,
            producerId: result.producerId,
          });
        } catch (error) {
          console.error(
            'Producer approval email failed after approval:',
            error
          );
          emailDelivery = {
            status: 'failed' as const,
            occurredAt: new Date().toISOString(),
            reason:
              'Approval succeeded, but the notification email could not be sent.',
          };
        }

        res.json({ claim: result, emailDelivery });
      } catch (error) {
        if (error instanceof AdminClaimError) {
          const status =
            error.code === 'bad_request'
              ? 400
              : error.code === 'forbidden'
                ? 403
                : error.code === 'not_found'
                  ? 404
                  : 409;
          res.status(status).json({ error: error.message });
          return;
        }
        console.error('Producer claim approval unavailable:', error);
        res.status(503).json({
          error: 'Producer request approval is temporarily unavailable.',
        });
      }
    }
  );

  app.post(
    '/api/admin/claims/:producerId/reject',
    requireAuth,
    async (req, res) => {
      try {
        const result = await deps.rejectProducerClaim(
          res.locals.identity.uid,
          String(req.params.producerId),
          typeof req.body?.reason === 'string' ? req.body.reason : ''
        );
        res.json({ claim: result });
      } catch (error) {
        if (error instanceof AdminClaimError) {
          const status =
            error.code === 'bad_request'
              ? 400
              : error.code === 'forbidden'
                ? 403
                : error.code === 'not_found'
                  ? 404
                  : 409;
          res.status(status).json({ error: error.message });
          return;
        }
        console.error('Producer claim rejection unavailable:', error);
        res.status(503).json({
          error: 'Producer request rejection is temporarily unavailable.',
        });
      }
    }
  );

  app.post('/api/passes/checkout', requireAuth, async (req, res) => {
    if (req.body?.plan !== 'holiday' && req.body?.plan !== 'annual') {
      res.status(400).json({ error: 'Choose a holiday or annual pass.' });
      return;
    }
    const consumerConsent = req.body?.consumerConsent;
    if (
      consumerConsent?.ageConfirmed !== true ||
      consumerConsent?.termsAccepted !== true ||
      consumerConsent?.immediatePerformanceRequested !== true
    ) {
      res.status(400).json({
        error:
          'Confirm that you are 18+, accept the Terms, and request immediate activation before checkout.',
        code: 'consumer_consent_required',
      });
      return;
    }
    try {
      const identity = res.locals.identity;
      const activePass = await deps.getExplorerPass(identity.uid);
      if (activePass) {
        res.status(409).json({
          error:
            'You already have an active Explorer Pass. You can purchase another Holiday Pass after the current pass expires.',
          code: 'active_explorer_pass',
        });
        return;
      }
      res.json(
        await deps.createPassCheckout(
          identity.uid,
          identity.name || 'Explorer',
          req.body.plan,
          typeof identity.email === 'string' ? identity.email : null,
          consumerConsent
        )
      );
    } catch (error) {
      console.error('Pass checkout unavailable:', error);
      res.status(503).json({
        error:
          'Pass checkout is currently unavailable. Please try again later.',
      });
    }
  });

  app.post('/api/passes/portal', requireAuth, async (_req, res) => {
    try {
      res.json(await deps.createPassBillingPortal(res.locals.identity.uid));
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      const noSubscription = message.startsWith(
        'No active annual Explorer subscription'
      );
      console.error('Explorer billing portal unavailable:', error);
      res.status(noSubscription ? 409 : 503).json({
        error: noSubscription
          ? message
          : 'Explorer billing management is temporarily unavailable.',
      });
    }
  });

  app.post('/api/passes/confirm', requireAuth, async (req, res) => {
    if (typeof req.body?.sessionId !== 'string') {
      res.status(400).json({ error: 'A checkout session is required.' });
      return;
    }
    try {
      res.json({
        pass: await deps.fulfillPass(
          req.body.sessionId,
          res.locals.identity.uid
        ),
      });
    } catch (error) {
      console.error('Pass confirmation failed:', error);
      res.status(409).json({
        error:
          'Payment is not verified yet. Your pass will appear once payment is confirmed.',
      });
    }
  });

  app.get('/api/passes/me', requireAuth, async (_req, res) => {
    try {
      res.json({ pass: await deps.getExplorerPass(res.locals.identity.uid) });
    } catch (error) {
      console.error('Pass lookup unavailable:', error);
      res.status(503).json({
        error: 'Unable to check your pass. Please try again when connected.',
      });
    }
  });

  app.get(
    '/api/passes/verify/:passId',
    requireAuth,
    requireActiveProducerOwner,
    async (req, res) => {
      try {
        const pass = await deps.verifyExplorerPass(String(req.params.passId));
        if (!pass) {
          res.status(404).json({ error: 'This pass is invalid or expired.' });
          return;
        }
        res.json({ pass });
      } catch {
        res.status(503).json({
          error:
            'This pass could not be verified. Do not accept it until verification succeeds.',
        });
      }
    }
  );
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  return app;
}

export const app = createApp();
