import type { Express, NextFunction, Request, Response } from 'express';
import { adminAuth } from './firebaseAdmin';
import {
  CommercialPartnerError,
  createCommercialPartnerCampaign,
  getAdminCommercialState,
  getOwnedCommercialState,
  setCommercialPartnerStatus,
  transitionCommercialPartnerCampaign,
} from './services/commercialPartnerService';
import {
  getActivePartnerPlacements,
  PartnerPlacementError,
} from './services/partnerPlacementService';

const defaults = {
  verifyToken: (token: string) => adminAuth().verifyIdToken(token, true),
  getOwnedCommercialState,
  getAdminCommercialState,
  setCommercialPartnerStatus,
  createCommercialPartnerCampaign,
  transitionCommercialPartnerCampaign,
  getActivePartnerPlacements,
};

type CommercialPartnerRouteDependencies = typeof defaults;

const errorStatus = (error: CommercialPartnerError) =>
  error.code === 'bad_request' ? 400 :
  error.code === 'forbidden' ? 403 :
  error.code === 'not_found' ? 404 :
  error.code === 'conflict' ? 409 : 503;

export function registerCommercialPartnerRoutes(
  app: Express,
  overrides: Partial<CommercialPartnerRouteDependencies> = {}
) {
  const deps: CommercialPartnerRouteDependencies = { ...defaults, ...overrides };

  const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    const bearer = req.get('authorization');
    if (!bearer?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Sign in to access Partner features.' });
      return;
    }

    try {
      res.locals.identity = await deps.verifyToken(bearer.slice(7));
      next();
    } catch {
      res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
    }
  };

  const handleError = (
    error: unknown,
    res: Response,
    fallbackMessage: string
  ) => {
    if (error instanceof CommercialPartnerError) {
      res.status(errorStatus(error)).json({ error: error.message });
      return;
    }
    if (error instanceof PartnerPlacementError) {
      res.status(error.code === 'bad_request' ? 400 : 503).json({ error: error.message });
      return;
    }
    console.error(fallbackMessage, error);
    res.status(503).json({ error: 'Commercial Partner services are temporarily unavailable.' });
  };

  app.get('/api/commercial/placements', async (req, res) => {
    try {
      const placements = await deps.getActivePartnerPlacements({
        placement: typeof req.query.placement === 'string' ? req.query.placement : '',
        destination: typeof req.query.destination === 'string' ? req.query.destination : '',
        category: typeof req.query.category === 'string' ? req.query.category : null,
        limit: typeof req.query.limit === 'string' ? Number(req.query.limit) : 3,
      });
      res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
      res.json({ placements });
    } catch (error) {
      handleError(error, res, 'Public Partner placement lookup unavailable:');
    }
  });

  app.get('/api/producer/commercial', requireAuth, async (_req, res) => {
    try {
      const state = await deps.getOwnedCommercialState(res.locals.identity.uid);
      res.json({ state });
    } catch (error) {
      handleError(error, res, 'Host commercial state unavailable:');
    }
  });

  app.get('/api/admin/commercial', requireAuth, async (_req, res) => {
    try {
      const state = await deps.getAdminCommercialState(res.locals.identity.uid);
      res.json({ state });
    } catch (error) {
      handleError(error, res, 'Admin commercial state unavailable:');
    }
  });

  app.post('/api/admin/commercial/partners/:producerId/status', requireAuth, async (req, res) => {
    try {
      const partner = await deps.setCommercialPartnerStatus(
        res.locals.identity.uid,
        String(req.params.producerId || ''),
        {
          status: typeof req.body?.status === 'string' ? req.body.status : '',
          activationSource:
            typeof req.body?.activationSource === 'string'
              ? req.body.activationSource
              : undefined,
          reason: typeof req.body?.reason === 'string' ? req.body.reason : null,
        }
      );
      res.json({ partner });
    } catch (error) {
      handleError(error, res, 'Partner status change unavailable:');
    }
  });

  app.post('/api/admin/commercial/campaigns', requireAuth, async (req, res) => {
    try {
      const result = await deps.createCommercialPartnerCampaign(
        res.locals.identity.uid,
        {
          producerId: typeof req.body?.producerId === 'string' ? req.body.producerId : '',
          campaignType: typeof req.body?.campaignType === 'string' ? req.body.campaignType : '',
          headline: typeof req.body?.headline === 'string' ? req.body.headline : '',
          message: typeof req.body?.message === 'string' ? req.body.message : null,
          destination: typeof req.body?.destination === 'string' ? req.body.destination : null,
          category: typeof req.body?.category === 'string' ? req.body.category : null,
          startsAt: typeof req.body?.startsAt === 'string' ? req.body.startsAt : null,
          endsAt: typeof req.body?.endsAt === 'string' ? req.body.endsAt : null,
          placements: Array.isArray(req.body?.placements)
            ? req.body.placements.filter((value: unknown): value is string => typeof value === 'string')
            : [],
        }
      );
      res.status(201).json(result);
    } catch (error) {
      handleError(error, res, 'Partner campaign creation unavailable:');
    }
  });

  app.post('/api/admin/commercial/campaigns/:campaignId/status', requireAuth, async (req, res) => {
    try {
      const result = await deps.transitionCommercialPartnerCampaign(
        res.locals.identity.uid,
        String(req.params.campaignId || ''),
        {
          status: typeof req.body?.status === 'string' ? req.body.status : '',
          reason: typeof req.body?.reason === 'string' ? req.body.reason : null,
        }
      );
      res.json(result);
    } catch (error) {
      handleError(error, res, 'Partner campaign transition unavailable:');
    }
  });
}
