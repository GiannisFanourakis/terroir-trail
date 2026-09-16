import type { Express, NextFunction, Request, Response } from 'express';
import { adminAuth } from './firebaseAdmin';
import {
  getLatestProducerListingChange,
  ProducerListingChangeError,
  submitProducerListingChanges,
} from './services/producerListingChangeService';

const defaults = {
  verifyToken: (token: string) => adminAuth().verifyIdToken(token, true),
  getLatestProducerListingChange,
  submitProducerListingChanges,
};

type ProducerListingChangeRouteDependencies = typeof defaults;

const errorStatus = (error: ProducerListingChangeError) =>
  error.code === 'bad_request' ? 400 :
  error.code === 'forbidden' ? 403 :
  error.code === 'not_found' ? 404 : 409;

export function registerProducerListingChangeRoutes(
  app: Express,
  overrides: Partial<ProducerListingChangeRouteDependencies> = {}
) {
  const deps: ProducerListingChangeRouteDependencies = { ...defaults, ...overrides };

  const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    const bearer = req.get('authorization');
    if (!bearer?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Sign in with your verified Host account.' });
      return;
    }
    try {
      res.locals.identity = await deps.verifyToken(bearer.slice(7));
      next();
    } catch {
      res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
    }
  };

  app.get('/api/producer/listing-changes/:producerId', requireAuth, async (req, res) => {
    try {
      const request = await deps.getLatestProducerListingChange(
        res.locals.identity.uid,
        String(req.params.producerId)
      );
      res.json({ request });
    } catch (error) {
      if (error instanceof ProducerListingChangeError) {
        res.status(errorStatus(error)).json({ error: error.message });
        return;
      }
      console.error('Producer listing change status unavailable:', error);
      res.status(503).json({ error: 'Producer listing change status is temporarily unavailable.' });
    }
  });

  app.post('/api/producer/listing-changes/:producerId', requireAuth, async (req, res) => {
    try {
      const request = await deps.submitProducerListingChanges(
        res.locals.identity.uid,
        typeof res.locals.identity.email === 'string' ? res.locals.identity.email : undefined,
        String(req.params.producerId),
        req.body?.changes
      );
      res.status(201).json({ request });
    } catch (error) {
      if (error instanceof ProducerListingChangeError) {
        res.status(errorStatus(error)).json({ error: error.message });
        return;
      }
      console.error('Producer listing change submission unavailable:', error);
      res.status(503).json({ error: 'Producer listing change submission is temporarily unavailable.' });
    }
  });
}
