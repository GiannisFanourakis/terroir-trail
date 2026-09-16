import type { Express, NextFunction, Request, Response } from 'express';
import { adminAuth } from './firebaseAdmin';
import {
  AdminAccountError,
  searchAdminAccounts,
  setAccountDisabled,
  setHostEditingFrozen,
} from './services/adminAccountService';

const defaults = {
  verifyToken: (token: string) => adminAuth().verifyIdToken(token, true),
  searchAdminAccounts,
  setAccountDisabled,
  setHostEditingFrozen,
};

type AdminAccountRouteDependencies = typeof defaults;

const errorStatus = (error: AdminAccountError) =>
  error.code === 'bad_request' ? 400 :
  error.code === 'forbidden' ? 403 :
  error.code === 'not_found' ? 404 : 409;

export function registerAdminAccountRoutes(
  app: Express,
  overrides: Partial<AdminAccountRouteDependencies> = {}
) {
  const deps: AdminAccountRouteDependencies = { ...defaults, ...overrides };

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

  app.get('/api/admin/accounts', requireAuth, async (req, res) => {
    try {
      const accounts = await deps.searchAdminAccounts(
        res.locals.identity.uid,
        typeof req.query.q === 'string' ? req.query.q : ''
      );
      res.json({ accounts });
    } catch (error) {
      if (error instanceof AdminAccountError) {
        res.status(errorStatus(error)).json({ error: error.message });
        return;
      }
      console.error('Admin account search unavailable:', error);
      res.status(503).json({ error: 'Account administration is temporarily unavailable.' });
    }
  });

  app.post('/api/admin/accounts/:uid/access', requireAuth, async (req, res) => {
    try {
      if (typeof req.body?.disabled !== 'boolean') {
        res.status(400).json({ error: 'Account access state is required.' });
        return;
      }
      const account = await deps.setAccountDisabled(
        res.locals.identity.uid,
        String(req.params.uid),
        req.body.disabled,
        typeof req.body?.reason === 'string' ? req.body.reason : ''
      );
      res.json({ account });
    } catch (error) {
      if (error instanceof AdminAccountError) {
        res.status(errorStatus(error)).json({ error: error.message });
        return;
      }
      console.error('Admin account access update unavailable:', error);
      res.status(503).json({ error: 'Account access management is temporarily unavailable.' });
    }
  });

  app.post('/api/admin/accounts/:uid/host-freeze', requireAuth, async (req, res) => {
    try {
      if (typeof req.body?.frozen !== 'boolean') {
        res.status(400).json({ error: 'Host editing state is required.' });
        return;
      }
      const account = await deps.setHostEditingFrozen(
        res.locals.identity.uid,
        String(req.params.uid),
        req.body.frozen,
        typeof req.body?.reason === 'string' ? req.body.reason : ''
      );
      res.json({ account });
    } catch (error) {
      if (error instanceof AdminAccountError) {
        res.status(errorStatus(error)).json({ error: error.message });
        return;
      }
      console.error('Host editing freeze update unavailable:', error);
      res.status(503).json({ error: 'Host dispute controls are temporarily unavailable.' });
    }
  });
}
