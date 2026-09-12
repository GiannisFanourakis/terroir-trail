import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { adminAuth } from './firebaseAdmin';
import { createPassCheckout, fulfillPass, getExplorerPass, verifyExplorerPass } from './services/passService';
import { handleWebhookEvent } from './services/webhookService';

const defaults = {
  verifyToken: (token: string) => adminAuth().verifyIdToken(token, true),
  createPassCheckout, fulfillPass, getExplorerPass, verifyExplorerPass, handleWebhookEvent,
};

export function createApp(deps = defaults) {
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

  app.get('/api/passes/verify/:passId', async (req, res) => {
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
