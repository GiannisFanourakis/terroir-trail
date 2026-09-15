import type { Express, NextFunction, Request, Response } from 'express';
import { adminAuth } from './firebaseAdmin';
import {
  AdminMediaError,
  listPendingProducerMedia,
  moderateProducerMedia,
} from './services/adminMediaService';

const defaults = {
  verifyToken: (token: string) => adminAuth().verifyIdToken(token, true),
  listPendingProducerMedia,
  moderateProducerMedia,
};

type AdminMediaRouteDependencies = typeof defaults;

const errorStatus = (error: AdminMediaError) =>
  error.code === 'bad_request' ? 400 :
  error.code === 'forbidden' ? 403 :
  error.code === 'not_found' ? 404 : 409;

export function registerAdminMediaRoutes(
  app: Express,
  overrides: Partial<AdminMediaRouteDependencies> = {}
) {
  const deps: AdminMediaRouteDependencies = { ...defaults, ...overrides };

  const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    const bearer = req.get('authorization');
    if (!bearer?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Sign in to access account administration.' });
      return;
    }
    try {
      res.locals.identity = await deps.verifyToken(bearer.slice(7));
      next();
    } catch {
      res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
    }
  };

  app.get('/api/admin/media', requireAuth, async (_req, res) => {
    try {
      const media = await deps.listPendingProducerMedia(res.locals.identity.uid);
      res.json({ media });
    } catch (error) {
      if (error instanceof AdminMediaError) {
        res.status(errorStatus(error)).json({ error: error.message });
        return;
      }
      console.error('Producer media moderation queue unavailable:', error);
      res.status(503).json({ error: 'Producer photo review is temporarily unavailable.' });
    }
  });

  app.post('/api/admin/media/:producerId/:imageId/approve', requireAuth, async (req, res) => {
    try {
      const media = await deps.moderateProducerMedia(
        res.locals.identity.uid,
        String(req.params.producerId),
        String(req.params.imageId),
        'approve',
        ''
      );
      res.json({ media });
    } catch (error) {
      if (error instanceof AdminMediaError) {
        res.status(errorStatus(error)).json({ error: error.message });
        return;
      }
      console.error('Producer photo approval unavailable:', error);
      res.status(503).json({ error: 'Producer photo approval is temporarily unavailable.' });
    }
  });

  app.post('/api/admin/media/:producerId/:imageId/reject', requireAuth, async (req, res) => {
    try {
      const media = await deps.moderateProducerMedia(
        res.locals.identity.uid,
        String(req.params.producerId),
        String(req.params.imageId),
        'reject',
        typeof req.body?.reason === 'string' ? req.body.reason : ''
      );
      res.json({ media });
    } catch (error) {
      if (error instanceof AdminMediaError) {
        res.status(errorStatus(error)).json({ error: error.message });
        return;
      }
      console.error('Producer photo rejection unavailable:', error);
      res.status(503).json({ error: 'Producer photo rejection is temporarily unavailable.' });
    }
  });
}
