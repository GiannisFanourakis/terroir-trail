import type { Express, NextFunction, Request, Response } from 'express';
import { adminAuth } from './firebaseAdmin';
import {
  ProducerMediaSubmissionError,
  replaceOwnedProducerMedia,
} from './services/producerMediaSubmissionService';

const defaults = {
  verifyToken: (token: string) => adminAuth().verifyIdToken(token, true),
  replaceOwnedProducerMedia,
};

type ProducerMediaRouteDependencies = typeof defaults;

const errorStatus = (error: ProducerMediaSubmissionError) =>
  error.code === 'bad_request' ? 400 :
  error.code === 'forbidden' ? 403 : 404;

export function registerProducerMediaRoutes(
  app: Express,
  overrides: Partial<ProducerMediaRouteDependencies> = {}
) {
  const deps: ProducerMediaRouteDependencies = { ...defaults, ...overrides };

  const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    const bearer = req.get('authorization');
    if (!bearer?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Sign in with an approved producer account to manage photos.' });
      return;
    }
    try {
      res.locals.identity = await deps.verifyToken(bearer.slice(7));
      next();
    } catch {
      res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
    }
  };

  app.put('/api/producer/media/:producerId', requireAuth, async (req, res) => {
    try {
      const result = await deps.replaceOwnedProducerMedia(
        res.locals.identity.uid,
        String(req.params.producerId),
        Array.isArray(req.body?.images) ? req.body.images : req.body?.images
      );
      res.json({ media: result });
    } catch (error) {
      if (error instanceof ProducerMediaSubmissionError) {
        res.status(errorStatus(error)).json({ error: error.message });
        return;
      }
      console.error('Producer media submission unavailable:', error);
      res.status(503).json({ error: 'Producer photo submission is temporarily unavailable.' });
    }
  });
}
