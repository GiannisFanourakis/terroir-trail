import type { Express, NextFunction, Request, Response } from 'express';
import { adminAuth } from './firebaseAdmin';
import {
  AccountSelfServiceError,
  deleteOwnAccount,
  exportAccountData,
} from './services/accountSelfService';

const RECENT_AUTH_SECONDS = 5 * 60;

const defaults = {
  verifyToken: (token: string) => adminAuth().verifyIdToken(token, true),
  exportAccountData,
  deleteOwnAccount,
};

type AccountSelfRouteDependencies = typeof defaults;

const serviceErrorStatus = (error: AccountSelfServiceError) =>
  error.code === 'bad_request' ? 400 : error.code === 'forbidden' ? 403 : 404;

export function registerAccountSelfRoutes(
  app: Express,
  overrides: Partial<AccountSelfRouteDependencies> = {}
) {
  const deps: AccountSelfRouteDependencies = { ...defaults, ...overrides };

  const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    const bearer = req.get('authorization');
    if (!bearer?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Sign in to manage your account.' });
      return;
    }
    try {
      res.locals.identity = await deps.verifyToken(bearer.slice(7));
      next();
    } catch {
      res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
    }
  };

  app.get('/api/account/export', requireAuth, async (_req, res) => {
    try {
      const data = await deps.exportAccountData(res.locals.identity.uid);
      res.json({ data });
    } catch (error) {
      if (error instanceof AccountSelfServiceError) {
        res.status(serviceErrorStatus(error)).json({ error: error.message });
        return;
      }
      console.error('Account export unavailable:', error);
      res.status(503).json({ error: 'Account export is temporarily unavailable.' });
    }
  });

  app.delete('/api/account', requireAuth, async (_req, res) => {
    const authTime = Number(res.locals.identity.auth_time || 0);
    const tokenAge = Math.floor(Date.now() / 1000) - authTime;
    if (!authTime || tokenAge < 0 || tokenAge > RECENT_AUTH_SECONDS) {
      res.status(401).json({
        code: 'recent_auth_required',
        error: 'For your security, sign in again and then retry account deletion.',
      });
      return;
    }

    try {
      const result = await deps.deleteOwnAccount(res.locals.identity.uid);
      res.json(result);
    } catch (error) {
      if (error instanceof AccountSelfServiceError) {
        res.status(serviceErrorStatus(error)).json({ error: error.message });
        return;
      }
      console.error('Account deletion unavailable:', error);
      res.status(503).json({ error: 'Account deletion is temporarily unavailable.' });
    }
  });
}
