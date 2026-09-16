import type { Express, NextFunction, Request, Response } from 'express';
import { adminAuth } from './firebaseAdmin';
import {
  AdminReviewModerationError,
  dismissReviewReport,
  listPendingReviewReports,
  moderateProducerReview,
} from './services/adminReviewModerationService';

const defaults = {
  verifyToken: (token: string) => adminAuth().verifyIdToken(token, true),
  listPendingReviewReports,
  moderateProducerReview,
  dismissReviewReport,
};

type AdminReviewRouteDependencies = typeof defaults;

const errorStatus = (error: AdminReviewModerationError) =>
  error.code === 'bad_request' ? 400 :
  error.code === 'forbidden' ? 403 :
  error.code === 'not_found' ? 404 : 409;

export function registerAdminReviewRoutes(
  app: Express,
  overrides: Partial<AdminReviewRouteDependencies> = {}
) {
  const deps: AdminReviewRouteDependencies = { ...defaults, ...overrides };

  const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    const bearer = req.get('authorization');
    if (!bearer?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Sign in to access review moderation.' });
      return;
    }
    try {
      res.locals.identity = await deps.verifyToken(bearer.slice(7));
      next();
    } catch {
      res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
    }
  };

  app.get('/api/admin/review-reports', requireAuth, async (_req, res) => {
    try {
      const reports = await deps.listPendingReviewReports(res.locals.identity.uid);
      res.json({ reports });
    } catch (error) {
      if (error instanceof AdminReviewModerationError) {
        res.status(errorStatus(error)).json({ error: error.message });
        return;
      }
      console.error('Review moderation queue unavailable:', error);
      res.status(503).json({ error: 'Review moderation is temporarily unavailable.' });
    }
  });

  app.post('/api/admin/reviews/:reviewId/moderation', requireAuth, async (req, res) => {
    try {
      const review = await deps.moderateProducerReview(
        res.locals.identity.uid,
        String(req.params.reviewId),
        req.body?.action,
        req.body?.reason
      );
      res.json({ review });
    } catch (error) {
      if (error instanceof AdminReviewModerationError) {
        res.status(errorStatus(error)).json({ error: error.message });
        return;
      }
      console.error('Review moderation action unavailable:', error);
      res.status(503).json({ error: 'The review moderation action could not be completed.' });
    }
  });

  app.post('/api/admin/review-reports/:reportId/dismiss', requireAuth, async (req, res) => {
    try {
      const report = await deps.dismissReviewReport(
        res.locals.identity.uid,
        String(req.params.reportId),
        req.body?.reason
      );
      res.json({ report });
    } catch (error) {
      if (error instanceof AdminReviewModerationError) {
        res.status(errorStatus(error)).json({ error: error.message });
        return;
      }
      console.error('Review report dismissal unavailable:', error);
      res.status(503).json({ error: 'The review report could not be resolved.' });
    }
  });
}
