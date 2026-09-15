import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { adminAuth } from './firebaseAdmin';
import { createPassCheckout, fulfillPass, getExplorerPass, verifyExplorerPass } from './services/passService';
import { isActiveProducerOwner } from './services/producerAuthorization';
import { getTrustedAccountCapabilities } from './services/accountAuthorization';
import { AdminAuthorityError, changeAdminAuthority } from './services/adminAuthorityService';
import {
  AdminClaimError,
  listPendingProducerClaims,
  approveProducerClaim,
  rejectProducerClaim,
} from './services/adminClaimsService';
import { AdminMetricsError, getAdminDashboardMetrics } from './services/adminMetricsService';
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
  getAdminDashboardMetrics,
  sendProducerApprovalEmail,
  sendTravelerWelcomeEmail,
  createPassCheckout,
  fulfillPass,
  getExplorerPass,
  verifyExplorerPass,
  handleWebhookEvent,
};

type AppDependencies = typeof defaults;

export function createApp(overrides: Partial<AppDependencies> = {}) {
  const deps: AppDependencies = { ...defaults, ...overrides };
  const app = express();
  const origins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,https://localhost,capacitor://localhost')
    .split(',').map(origin => origin.trim());
  if (process.env.APP_URL) origins.push(new URL(process.env.APP_URL).origin);
  app.use(cors({ origin: origins }));
  app.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

  app.post('/api/webhook', express.raw({ type: 'application/json', limit: '256kb' }), async (req, res) => {
    try {
      const result = await deps.handleWebhookEvent(req.body, req.get('stripe-signature'));
      res.json({ received: true, ...result });
    } catch (error) {
      console.error('Webhook rejected:', error);
      res.status(400).json({ error: 'Webhook could not be verified or processed.' });
    }
  });

  app.use(express.json({ limit: '16kb' }));
  const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    const bearer = req.get('authorization');
    if (!bearer?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Sign in to manage your Explorer pass.' });
      return;
    }
    try {
      res.locals.identity = await deps.verifyToken(bearer.slice(7));
      next();
    } catch {
      res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
    }
  };

  const requireActiveProducerOwner = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      if (!(await deps.isActiveProducerOwner(res.locals.identity.uid))) {
        res.status(403).json({ error: 'Verified producer access is required to verify Explorer passes.' });
        return;
      }
      next();
    } catch (error) {
      console.error('Producer authorization unavailable:', error);
      res.status(503).json({ error: 'Pass verification is temporarily unavailable.' });
    }
  };

  app.get('/api/account/capabilities', requireAuth, async (_req, res) => {
    try {
      const capabilities = await deps.getTrustedAccountCapabilities(res.locals.identity.uid);
      res.json({ capabilities });
    } catch (error) {
      console.error('Account capability lookup unavailable:', error);
      res.status(503).json({ error: 'Account permissions are temporarily unavailable.' });
    }
  });

  app.post('/api/account/welcome-email', requireAuth, async (req, res) => {
    try {
      const delivery = await deps.sendTravelerWelcomeEmail({
        uid: res.locals.identity.uid,
        preferredName: typeof req.body?.name === 'string' ? req.body.name.trim() : undefined,
      });
      res.json({ delivery });
    } catch (error) {
      console.error('Traveler welcome email unavailable:', error);
      res.status(503).json({ error: 'Welcome email delivery is temporarily unavailable.' });
    }
  });

  app.get('/api/admin/metrics', requireAuth, async (_req, res) => {
    try {
      const metrics = await deps.getAdminDashboardMetrics(res.locals.identity.uid);
      res.json({ metrics });
    } catch (error) {
      if (error instanceof AdminMetricsError && error.code === 'forbidden') {
        res.status(403).json({ error: error.message });
        return;
      }
      console.error('Admin metrics unavailable:', error);
      res.status(503).json({ error: 'Administrative metrics are temporarily unavailable.' });
    }
  });

  app.post('/api/admin/authority', requireAuth, async (req, res) => {
    const action = req.body?.action;
    const target = {
      userId: typeof req.body?.userId === 'string' ? req.body.userId.trim() : undefined,
      email: typeof req.body?.email === 'string' ? req.body.email.trim() : undefined,
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
          error.code === 'bad_request' ? 400 :
          error.code === 'forbidden' ? 403 :
          error.code === 'not_found' ? 404 : 409;
        res.status(status).json({ error: error.message });
        return;
      }
      console.error('Admin authority change unavailable:', error);
      res.status(503).json({ error: 'Admin authority management is temporarily unavailable.' });
    }
  });

  app.get('/api/admin/claims', requireAuth, async (_req, res) => {
    try {
      const claims = await deps.listPendingProducerClaims(res.locals.identity.uid);
      res.json({ claims });
    } catch (error) {
      if (error instanceof AdminClaimError && error.code === 'forbidden') {
        res.status(403).json({ error: error.message });
        return;
      }
      console.error('Producer claim queue unavailable:', error);
      res.status(503).json({ error: 'Producer request queue is temporarily unavailable.' });
    }
  });

  app.post('/api/admin/claims/:producerId/approve', requireAuth, async (req, res) => {
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
        console.error('Producer approval email failed after approval:', error);
        emailDelivery = {
          status: 'failed' as const,
          occurredAt: new Date().toISOString(),
          reason: 'Approval succeeded, but the notification email could not be sent.',
        };
      }

      res.json({ claim: result, emailDelivery });
    } catch (error) {
      if (error instanceof AdminClaimError) {
        const status =
          error.code === 'bad_request' ? 400 :
          error.code === 'forbidden' ? 403 :
          error.code === 'not_found' ? 404 : 409;
        res.status(status).json({ error: error.message });
        return;
      }
      console.error('Producer claim approval unavailable:', error);
      res.status(503).json({ error: 'Producer request approval is temporarily unavailable.' });
    }
  });

  app.post('/api/admin/claims/:producerId/reject', requireAuth, async (req, res) => {
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
          error.code === 'bad_request' ? 400 :
          error.code === 'forbidden' ? 403 :
          error.code === 'not_found' ? 404 : 409;
        res.status(status).json({ error: error.message });
        return;
      }
      console.error('Producer claim rejection unavailable:', error);
      res.status(503).json({ error: 'Producer request rejection is temporarily unavailable.' });
    }
  });

  app.post('/api/passes/checkout', requireAuth, async (req, res) => {
    if (req.body?.plan !== 'holiday' && req.body?.plan !== 'annual') {
      res.status(400).json({ error: 'Choose a holiday or annual pass.' });
      return;
    }
    try {
      const identity = res.locals.identity;
      res.json(await deps.createPassCheckout(identity.uid, identity.name || 'Explorer', req.body.plan));
    } catch (error) {
      console.error('Pass checkout unavailable:', error);
      res.status(503).json({ error: 'Pass checkout is currently unavailable. Please try again later.' });
    }
  });

  app.post('/api/passes/confirm', requireAuth, async (req, res) => {
    if (typeof req.body?.sessionId !== 'string') {
      res.status(400).json({ error: 'A checkout session is required.' });
      return;
    }
    try {
      res.json({ pass: await deps.fulfillPass(req.body.sessionId, res.locals.identity.uid) });
    } catch (error) {
      console.error('Pass confirmation failed:', error);
      res.status(409).json({ error: 'Payment is not verified yet. Your pass will appear once payment is confirmed.' });
    }
  });

  app.get('/api/passes/me', requireAuth, async (_req, res) => {
    try { res.json({ pass: await deps.getExplorerPass(res.locals.identity.uid) }); }
    catch (error) {
      console.error('Pass lookup unavailable:', error);
      res.status(503).json({ error: 'Unable to check your pass. Please try again when connected.' });
    }
  });

  app.get('/api/passes/verify/:passId', requireAuth, requireActiveProducerOwner, async (req, res) => {
    try {
      const pass = await deps.verifyExplorerPass(String(req.params.passId));
      if (!pass) { res.status(404).json({ error: 'This pass is invalid or expired.' }); return; }
      res.json({ pass });
    } catch {
      res.status(503).json({ error: 'This pass could not be verified. Do not accept it until verification succeeds.' });
    }
  });
  app.get('/api/health', (_req, res) => { res.json({ status: 'ok' }); });
  return app;
}

export const app = createApp();
