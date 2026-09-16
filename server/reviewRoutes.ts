import type { Express, NextFunction, Request, Response } from 'express';
import { adminAuth } from './firebaseAdmin';
import {
  deleteTravelerReview,
  listProducerReviews,
  ProducerReviewError,
  reportProducerReview,
  upsertHostReviewReply,
  upsertTravelerReview,
} from './services/reviewService';

const defaults = {
  verifyToken: (token: string) => adminAuth().verifyIdToken(token, true),
  listProducerReviews,
  upsertTravelerReview,
  deleteTravelerReview,
  upsertHostReviewReply,
  reportProducerReview,
};

type ReviewRouteDependencies = typeof defaults;

const errorStatus = (error: ProducerReviewError) =>
  error.code === 'bad_request' ? 400 :
  error.code === 'forbidden' ? 403 :
  error.code === 'not_found' ? 404 : 409;

export function registerReviewRoutes(
  app: Express,
  overrides: Partial<ReviewRouteDependencies> = {}
) {
  const deps: ReviewRouteDependencies = { ...defaults, ...overrides };

  const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    const bearer = req.get('authorization');
    if (!bearer?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Sign in to participate in community reviews.' });
      return;
    }
    try {
      res.locals.identity = await deps.verifyToken(bearer.slice(7));
      next();
    } catch {
      res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
    }
  };

  const optionalIdentity = async (req: Request, res: Response, next: NextFunction) => {
    const bearer = req.get('authorization');
    if (!bearer?.startsWith('Bearer ')) {
      res.locals.identity = null;
      next();
      return;
    }
    try {
      res.locals.identity = await deps.verifyToken(bearer.slice(7));
      next();
    } catch {
      res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
    }
  };

  app.get('/api/producers/:producerId/reviews', optionalIdentity, async (req, res) => {
    try {
      const reviews = await deps.listProducerReviews(
        String(req.params.producerId),
        res.locals.identity?.uid
      );
      res.json({ reviews });
    } catch (error) {
      if (error instanceof ProducerReviewError) {
        res.status(errorStatus(error)).json({ error: error.message });
        return;
      }
      console.error('Producer reviews unavailable:', error);
      res.status(503).json({ error: 'Community reviews are temporarily unavailable.' });
    }
  });

  app.put('/api/producers/:producerId/reviews/me', requireAuth, async (req, res) => {
    try {
      const review = await deps.upsertTravelerReview(
        res.locals.identity.uid,
        String(req.params.producerId),
        req.body?.rating,
        req.body?.comment
      );
      res.json({ review });
    } catch (error) {
      if (error instanceof ProducerReviewError) {
        res.status(errorStatus(error)).json({ error: error.message });
        return;
      }
      console.error('Traveler review submission unavailable:', error);
      res.status(503).json({ error: 'Your review could not be saved right now.' });
    }
  });

  app.delete('/api/producers/:producerId/reviews/me', requireAuth, async (req, res) => {
    try {
      const result = await deps.deleteTravelerReview(
        res.locals.identity.uid,
        String(req.params.producerId)
      );
      res.json(result);
    } catch (error) {
      if (error instanceof ProducerReviewError) {
        res.status(errorStatus(error)).json({ error: error.message });
        return;
      }
      console.error('Traveler review deletion unavailable:', error);
      res.status(503).json({ error: 'Your review could not be deleted right now.' });
    }
  });

  app.put('/api/reviews/:reviewId/host-reply', requireAuth, async (req, res) => {
    try {
      const review = await deps.upsertHostReviewReply(
        res.locals.identity.uid,
        String(req.params.reviewId),
        req.body?.comment
      );
      res.json({ review });
    } catch (error) {
      if (error instanceof ProducerReviewError) {
        res.status(errorStatus(error)).json({ error: error.message });
        return;
      }
      console.error('Host review reply unavailable:', error);
      res.status(503).json({ error: 'The Host reply could not be saved right now.' });
    }
  });

  app.post('/api/reviews/:reviewId/report', requireAuth, async (req, res) => {
    try {
      const report = await deps.reportProducerReview(
        res.locals.identity.uid,
        String(req.params.reviewId),
        req.body?.reason
      );
      res.status(201).json({ report });
    } catch (error) {
      if (error instanceof ProducerReviewError) {
        res.status(errorStatus(error)).json({ error: error.message });
        return;
      }
      console.error('Review report unavailable:', error);
      res.status(503).json({ error: 'The review report could not be submitted right now.' });
    }
  });
}
