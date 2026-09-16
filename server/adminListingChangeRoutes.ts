import type { Express, NextFunction, Request, Response } from 'express';
import { adminAuth } from './firebaseAdmin';
import {
  listPendingProducerListingChanges,
  ProducerListingChangeError,
  reviewProducerListingChange,
} from './services/producerListingChangeService';

const defaults = {
  verifyToken: (token: string) => adminAuth().verifyIdToken(token, true),
  listPendingProducerListingChanges,
  reviewProducerListingChange,
};

type AdminListingChangeRouteDependencies = typeof defaults;

const errorStatus = (error: ProducerListingChangeError) =>
  error.code === 'bad_request' ? 400 :
  error.code === 'forbidden' ? 403 :
  error.code === 'not_found' ? 404 : 409;

export function registerAdminListingChangeRoutes(
  app: Express,
  overrides: Partial<AdminListingChangeRouteDependencies> = {}
) {
  const deps: AdminListingChangeRouteDependencies = { ...defaults, ...overrides };

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

  app.get('/api/admin/listing-changes', requireAuth, async (_req, res) => {
    try {
      const requests = await deps.listPendingProducerListingChanges(res.locals.identity.uid);
      res.json({ requests });
    } catch (error) {
      if (error instanceof ProducerListingChangeError) {
        res.status(errorStatus(error)).json({ error: error.message });
        return;
      }
      console.error('Producer listing change review queue unavailable:', error);
      res.status(503).json({ error: 'Producer listing change review is temporarily unavailable.' });
    }
  });

  app.post('/api/admin/listing-changes/:requestId/approve', requireAuth, async (req, res) => {
    try {
      const request = await deps.reviewProducerListingChange(
        res.locals.identity.uid,
        String(req.params.requestId),
        'approve',
        ''
      );
      res.json({ request });
    } catch (error) {
      if (error instanceof ProducerListingChangeError) {
        res.status(errorStatus(error)).json({ error: error.message });
        return;
      }
      console.error('Producer listing change approval unavailable:', error);
      res.status(503).json({ error: 'Producer listing change approval is temporarily unavailable.' });
    }
  });

  app.post('/api/admin/listing-changes/:requestId/reject', requireAuth, async (req, res) => {
    try {
      const request = await deps.reviewProducerListingChange(
        res.locals.identity.uid,
        String(req.params.requestId),
        'reject',
        typeof req.body?.reason === 'string' ? req.body.reason : ''
      );
      res.json({ request });
    } catch (error) {
      if (error instanceof ProducerListingChangeError) {
        res.status(errorStatus(error)).json({ error: error.message });
        return;
      }
      console.error('Producer listing change rejection unavailable:', error);
      res.status(503).json({ error: 'Producer listing change rejection is temporarily unavailable.' });
    }
  });
}
