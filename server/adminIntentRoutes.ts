import type { Express, NextFunction, Request, Response } from 'express';
import { adminAuth } from './firebaseAdmin';
import {
  AdminIntentMetricsError,
  getAdminIntentMetrics,
} from './services/adminIntentMetricsService';

const defaults = {
  verifyToken: (token: string) => adminAuth().verifyIdToken(token, true),
  getAdminIntentMetrics,
};

type AdminIntentRouteDependencies = typeof defaults;

export function registerAdminIntentRoutes(
  app: Express,
  overrides: Partial<AdminIntentRouteDependencies> = {}
) {
  const deps: AdminIntentRouteDependencies = { ...defaults, ...overrides };

  const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    const bearer = req.get('authorization');
    if (!bearer?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Sign in to access intent reporting.' });
      return;
    }
    try {
      res.locals.identity = await deps.verifyToken(bearer.slice(7));
      next();
    } catch {
      res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
    }
  };

  app.get('/api/admin/intent-metrics', requireAuth, async (req, res) => {
    const days = Number(req.query.days ?? 30);
    try {
      const metrics = await deps.getAdminIntentMetrics(res.locals.identity.uid, days);
      res.json({ metrics });
    } catch (error) {
      if (error instanceof AdminIntentMetricsError) {
        const status =
          error.code === 'bad_request' ? 400 :
          error.code === 'forbidden' ? 403 : 503;
        res.status(status).json({ error: error.message });
        return;
      }
      console.error('Admin intent metrics unavailable:', error);
      res.status(503).json({ error: 'Intent analytics are temporarily unavailable.' });
    }
  });
}
