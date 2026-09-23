import type { Express, NextFunction, Request, Response } from 'express';
import { adminAuth } from './firebaseAdmin';
import { getExplorerPass } from './services/passService';
import {
  createTripPack,
  type TripPackFormat,
} from './services/tripPackService';
import {
  TripServiceError,
  addProducerToTrip,
  assignTripItemDay,
  createTrip,
  deleteTrip,
  getTrip,
  getTripProducerStates,
  listTrips,
  removeProducerFromTrip,
  reorderTripItems,
  updateTrip,
} from './services/tripService';

const defaults = {
  verifyToken: (token: string) => adminAuth().verifyIdToken(token, true),
  listTrips,
  getTrip,
  getTripProducerStates,
  createTrip,
  updateTrip,
  deleteTrip,
  addProducerToTrip,
  removeProducerFromTrip,
  reorderTripItems,
  assignTripItemDay,
  getExplorerPass,
  createTripPack,
};

type TripRouteDependencies = typeof defaults;

const statusFor = (error: TripServiceError) =>
  error.code === 'bad_request'
    ? 400
    : error.code === 'forbidden'
      ? 403
      : error.code === 'not_found'
        ? 404
        : error.code === 'conflict'
          ? 409
          : 503;

const assertOnlyKeys = (body: unknown, allowed: readonly string[]) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new TripServiceError(
      'bad_request',
      'Request body must be a JSON object.'
    );
  }
  const allowedKeys = new Set(allowed);
  const unexpected = Object.keys(body as Record<string, unknown>).find(
    (key) => !allowedKeys.has(key)
  );
  if (unexpected) {
    throw new TripServiceError(
      'bad_request',
      `Unrecognized property: ${unexpected}`
    );
  }
};

export function registerTripRoutes(
  app: Express,
  overrides: Partial<TripRouteDependencies> = {}
) {
  const deps: TripRouteDependencies = { ...defaults, ...overrides };

  const requireAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const bearer = req.get('authorization');
    if (!bearer?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Sign in to use My Trips.' });
      return;
    }
    try {
      res.locals.identity = await deps.verifyToken(bearer.slice(7));
      next();
    } catch {
      res
        .status(401)
        .json({ error: 'Your session has expired. Please sign in again.' });
    }
  };

  const run = async (res: Response, action: () => Promise<unknown>) => {
    try {
      res.json(await action());
    } catch (error) {
      if (error instanceof TripServiceError) {
        res
          .status(statusFor(error))
          .json({ error: error.message, code: error.code });
        return;
      }
      console.error('My Trips API unavailable:', error);
      res.status(503).json({ error: 'My Trips is temporarily unavailable.' });
    }
  };

  app.get('/api/trips', requireAuth, async (_req, res) => {
    await run(res, async () => ({
      trips: await deps.listTrips(res.locals.identity.uid),
    }));
  });

  app.post('/api/trips', requireAuth, async (req, res) => {
    await run(res, async () => {
      assertOnlyKeys(req.body, ['title', 'startDate', 'endDate']);
      return {
        trip: await deps.createTrip(res.locals.identity.uid, {
          title: req.body?.title,
          startDate: req.body?.startDate,
          endDate: req.body?.endDate,
        }),
      };
    });
  });

  app.get('/api/trips/:tripId', requireAuth, async (req, res) => {
    await run(res, async () => ({
      trip: await deps.getTrip(
        res.locals.identity.uid,
        String(req.params.tripId)
      ),
    }));
  });

  app.get(
    '/api/trips/:tripId/producer-states',
    requireAuth,
    async (req, res) => {
      await run(res, async () => ({
        producerStates: await deps.getTripProducerStates(
          res.locals.identity.uid,
          String(req.params.tripId)
        ),
      }));
    }
  );

  app.get('/api/trips/:tripId/export', requireAuth, async (req, res) => {
    const format = req.query.format;
    if (format !== 'html' && format !== 'ics') {
      res.status(400).json({
        error: 'Choose html or ics export format.',
        code: 'bad_request',
      });
      return;
    }

    try {
      const uid = res.locals.identity.uid;
      const pass = await deps.getExplorerPass(uid);
      if (!pass) {
        res.status(403).json({
          error: 'An active Explorer Pass is required for Trip Pack exports.',
          code: 'explorer_pass_required',
        });
        return;
      }

      const output = await deps.createTripPack(
        uid,
        String(req.params.tripId),
        format as TripPackFormat
      );
      res.set('Content-Type', output.contentType);
      res.set(
        'Content-Disposition',
        `attachment; filename="${output.filename}"`
      );
      res.status(200).send(output.body);
    } catch (error) {
      if (error instanceof TripServiceError) {
        res
          .status(statusFor(error))
          .json({ error: error.message, code: error.code });
        return;
      }
      console.error('Trip Pack export unavailable:', error);
      res.status(503).json({
        error: 'Trip Pack export is temporarily unavailable.',
        code: 'service_unavailable',
      });
    }
  });

  app.patch('/api/trips/:tripId', requireAuth, async (req, res) => {
    await run(res, async () => {
      assertOnlyKeys(req.body, [
        'expectedRevision',
        'title',
        'startDate',
        'endDate',
      ]);
      return {
        trip: await deps.updateTrip(
          res.locals.identity.uid,
          String(req.params.tripId),
          {
            expectedRevision: req.body?.expectedRevision,
            title: req.body?.title,
            startDate: req.body?.startDate,
            endDate: req.body?.endDate,
          }
        ),
      };
    });
  });

  app.delete('/api/trips/:tripId', requireAuth, async (req, res) => {
    await run(res, async () => {
      assertOnlyKeys(req.body, ['expectedRevision']);
      return deps.deleteTrip(
        res.locals.identity.uid,
        String(req.params.tripId),
        req.body?.expectedRevision
      );
    });
  });

  app.post('/api/trips/:tripId/items', requireAuth, async (req, res) => {
    await run(res, async () => {
      assertOnlyKeys(req.body, ['producerId', 'expectedRevision']);
      return {
        trip: await deps.addProducerToTrip(
          res.locals.identity.uid,
          String(req.params.tripId),
          {
            producerId: req.body?.producerId,
            expectedRevision: req.body?.expectedRevision,
          }
        ),
      };
    });
  });

  app.delete(
    '/api/trips/:tripId/items/:producerId',
    requireAuth,
    async (req, res) => {
      await run(res, async () => {
        assertOnlyKeys(req.body, ['expectedRevision']);
        return {
          trip: await deps.removeProducerFromTrip(
            res.locals.identity.uid,
            String(req.params.tripId),
            String(req.params.producerId),
            req.body?.expectedRevision
          ),
        };
      });
    }
  );

  app.post('/api/trips/:tripId/reorder', requireAuth, async (req, res) => {
    await run(res, async () => {
      assertOnlyKeys(req.body, ['producerIds', 'expectedRevision']);
      return {
        trip: await deps.reorderTripItems(
          res.locals.identity.uid,
          String(req.params.tripId),
          req.body?.producerIds,
          req.body?.expectedRevision
        ),
      };
    });
  });

  app.patch(
    '/api/trips/:tripId/items/:producerId/day',
    requireAuth,
    async (req, res) => {
      await run(res, async () => {
        assertOnlyKeys(req.body, ['dayNumber', 'expectedRevision']);
        return {
          trip: await deps.assignTripItemDay(
            res.locals.identity.uid,
            String(req.params.tripId),
            String(req.params.producerId),
            req.body?.dayNumber,
            req.body?.expectedRevision
          ),
        };
      });
    }
  );
}
