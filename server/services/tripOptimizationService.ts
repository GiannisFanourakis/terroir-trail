import { getSupabaseAdmin } from './analyticsIngestionService';
import {
  DayOptimizationError,
  MAX_OPTIMIZE_DAY_STOPS_V1,
  tsV1DayOptimizationEngine,
  type DayOptimizationEngine,
  type OptimizationProposalV1,
  type OptimizationStopV1,
} from './dayOptimizationEngine';
import { mapboxRouteMatrixProvider } from './mapboxRouteMatrixProvider';
import {
  RouteMatrixProviderError,
  type RouteMatrixProvider,
} from './routeMatrix';
import { getTrip, TripServiceError, type TripWithItems } from './tripService';

export type TripOptimizationErrorCode =
  | 'bad_request'
  | 'not_found'
  | 'conflict'
  | 'insufficient_stops'
  | 'producer_unavailable'
  | 'location_unverified'
  | 'route_unavailable'
  | 'no_feasible_solution'
  | 'service_unavailable';

export class TripOptimizationServiceError extends Error {
  constructor(
    public readonly code: TripOptimizationErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'TripOptimizationServiceError';
  }
}

export interface TripStopConstraintV1 {
  producerId: string;
  locked: true;
}

export interface OptimizeTripDayRequestV1 {
  contractVersion: 1;
  dayNumber: number;
  expectedRevision: number;
  constraints: TripStopConstraintV1[];
}

export interface OptimizationProducerRowV1 {
  id: string;
  lat: number | null;
  lng: number | null;
  location_status: string | null;
  visit_booking_requirement?: string | null;
  road_access_status?: string | null;
}
type LoadTrip = (uid: string, tripId: string) => Promise<TripWithItems>;
type LoadProducers = (
  producerIds: string[]
) => Promise<OptimizationProducerRowV1[]>;

interface TripOptimizationDependencies {
  loadTrip: LoadTrip;
  loadProducers: LoadProducers;
  routeMatrixProvider: RouteMatrixProvider;
  optimizationEngine: DayOptimizationEngine;
}

const PRODUCER_ID_RE = /^[a-z0-9][a-z0-9-]{0,127}$/;

const fail = (code: TripOptimizationErrorCode, message: string): never => {
  throw new TripOptimizationServiceError(code, message);
};

export const parseOptimizeTripDayRequest = (
  input: unknown
): OptimizeTripDayRequestV1 => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    fail('bad_request', 'Optimization request must be a JSON object.');
  }

  const body = input as Record<string, unknown>;
  if (body.contractVersion !== 1) {
    fail('bad_request', 'Unsupported optimization contract version.');
  }

  if (!Number.isInteger(body.dayNumber) || Number(body.dayNumber) < 1) {
    fail('bad_request', 'dayNumber must be a positive integer.');
  }

  if (
    !Number.isInteger(body.expectedRevision) ||
    Number(body.expectedRevision) < 1
  ) {
    fail('bad_request', 'expectedRevision must be a positive integer.');
  }

  const rawConstraints: unknown[] =
    body.constraints === undefined
      ? []
      : Array.isArray(body.constraints)
        ? body.constraints
        : (() => {
            throw new TripOptimizationServiceError(
              'bad_request',
              'Optimization constraints are invalid.'
            );
          })();

  if (rawConstraints.length > MAX_OPTIMIZE_DAY_STOPS_V1) {
    throw new TripOptimizationServiceError(
      'bad_request',
      'Optimization constraints are invalid.'
    );
  }

  const constraints: TripStopConstraintV1[] = rawConstraints.map((value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      fail('bad_request', 'Optimization constraints are invalid.');
    }
    const constraint = value as Record<string, unknown>;
    const keys = Object.keys(constraint);
    const producerId = constraint.producerId;
    if (
      keys.some((key) => key !== 'producerId' && key !== 'locked') ||
      typeof producerId !== 'string' ||
      !PRODUCER_ID_RE.test(producerId) ||
      constraint.locked !== true
    ) {
      throw new TripOptimizationServiceError(
        'bad_request',
        'Optimization constraints are invalid.'
      );
    }
    return {
      producerId,
      locked: true,
    };
  });

  if (
    new Set(constraints.map((constraint) => constraint.producerId)).size !==
    constraints.length
  ) {
    fail('bad_request', 'A producer can be locked only once.');
  }

  return {
    contractVersion: 1,
    dayNumber: Number(body.dayNumber),
    expectedRevision: Number(body.expectedRevision),
    constraints,
  };
};
export async function loadOptimizationProducers(
  producerIds: string[]
): Promise<OptimizationProducerRowV1[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new TripOptimizationServiceError(
      'service_unavailable',
      'Live producer locations are temporarily unavailable.'
    );
  }

  try {
    const { data, error } = await supabase
      .from('producers')
      .select(
        'id, lat, lng, location_status, visit_booking_requirement, road_access_status'
      )
      .in('id', producerIds)
      .eq('is_active', true);

    if (error) {
      throw new TripOptimizationServiceError(
        'service_unavailable',
        'Live producer locations are temporarily unavailable.'
      );
    }

    return (data || []) as unknown as OptimizationProducerRowV1[];
  } catch (error) {
    if (error instanceof TripOptimizationServiceError) throw error;
    throw new TripOptimizationServiceError(
      'service_unavailable',
      'Live producer locations are temporarily unavailable.'
    );
  }
}

const translateTripError = (error: TripServiceError): never => {
  if (error.code === 'not_found') {
    throw new TripOptimizationServiceError('not_found', error.message);
  }
  if (error.code === 'conflict') {
    throw new TripOptimizationServiceError('conflict', error.message);
  }
  if (error.code === 'bad_request') {
    throw new TripOptimizationServiceError('bad_request', error.message);
  }
  throw new TripOptimizationServiceError(
    'service_unavailable',
    'Trip planning is temporarily unavailable.'
  );
};

const translateEngineError = (error: DayOptimizationError): never => {
  if (
    error.code === 'bad_request' ||
    error.code === 'insufficient_stops' ||
    error.code === 'route_unavailable' ||
    error.code === 'no_feasible_solution'
  ) {
    throw new TripOptimizationServiceError(error.code, error.message);
  }
  throw new TripOptimizationServiceError(
    'service_unavailable',
    'Trip optimization is temporarily unavailable.'
  );
};

const warningRows = (rows: OptimizationProducerRowV1[]) => {
  const warnings: OptimizationProposalV1['warnings'] = [];
  for (const row of rows) {
    if (row.visit_booking_requirement === 'required') {
      warnings.push({
        code: 'booking_required',
        producerId: row.id,
        message: 'Booking or direct confirmation is required for this stop.',
      });
    }
    if (row.road_access_status !== 'verified') {
      warnings.push({
        code: 'road_access_unverified',
        producerId: row.id,
        message:
          'Road/access information is not verified; check the live listing before travel.',
      });
    }
  }
  return warnings;
};
const defaultDependencies: TripOptimizationDependencies = {
  loadTrip: (uid, tripId) => getTrip(uid, tripId),
  loadProducers: loadOptimizationProducers,
  routeMatrixProvider: mapboxRouteMatrixProvider,
  optimizationEngine: tsV1DayOptimizationEngine,
};

export async function createTripOptimizationProposal(
  uid: string,
  tripId: string,
  rawRequest: unknown,
  overrides: Partial<TripOptimizationDependencies> = {}
): Promise<OptimizationProposalV1> {
  if (!uid || !tripId) {
    fail('bad_request', 'Authenticated trip context is required.');
  }

  const request = parseOptimizeTripDayRequest(rawRequest);
  const deps = { ...defaultDependencies, ...overrides };

  let trip: TripWithItems;
  try {
    trip = await deps.loadTrip(uid, tripId);
  } catch (error) {
    if (error instanceof TripServiceError) translateTripError(error);
    if (error instanceof TripOptimizationServiceError) throw error;
    throw new TripOptimizationServiceError(
      'service_unavailable',
      'Trip planning is temporarily unavailable.'
    );
  }

  if (trip.revision !== request.expectedRevision) {
    fail(
      'conflict',
      'This trip changed after the optimization request was prepared. Reload it before trying again.'
    );
  }

  const dayItems = trip.items
    .filter((item) => item.dayNumber === request.dayNumber)
    .sort((a, b) => a.position - b.position);

  if (dayItems.length < 2) {
    fail(
      'insufficient_stops',
      'At least two assigned stops are required to optimize this day.'
    );
  }
  if (dayItems.length > MAX_OPTIMIZE_DAY_STOPS_V1) {
    fail(
      'bad_request',
      `Optimize My Day V1 supports up to ${MAX_OPTIMIZE_DAY_STOPS_V1} stops per day.`
    );
  }

  const dayIds = new Set(dayItems.map((item) => item.producerId));
  for (const constraint of request.constraints) {
    if (!dayIds.has(constraint.producerId)) {
      fail('bad_request', 'Locked stops must belong to the selected trip day.');
    }
  }

  const producerIds = dayItems.map((item) => item.producerId);
  const rows = await deps.loadProducers(producerIds);
  const rowsById = new Map(rows.map((row) => [row.id, row]));

  if (
    rowsById.size !== producerIds.length ||
    producerIds.some((producerId) => !rowsById.has(producerId))
  ) {
    fail(
      'producer_unavailable',
      'One or more stops are no longer available for route optimization.'
    );
  }

  const lockedIds = new Set(
    request.constraints.map((constraint) => constraint.producerId)
  );
  const stops: OptimizationStopV1[] = dayItems.map((item, index) => {
    const row = rowsById.get(item.producerId);
    if (!row) {
      throw new TripOptimizationServiceError(
        'producer_unavailable',
        'One or more stops are no longer available for route optimization.'
      );
    }

    const lat = row.lat;
    const lng = row.lng;
    if (
      row.location_status === 'unresolved' ||
      typeof lat !== 'number' ||
      typeof lng !== 'number' ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      throw new TripOptimizationServiceError(
        'location_unverified',
        'One or more stops do not have a verified routable location.'
      );
    }

    return {
      producerId: item.producerId,
      coordinates: [lng, lat],
      lockedPosition: lockedIds.has(item.producerId) ? index : null,
      confirmedArrivalTime: null,
      earliestArrival: null,
      latestArrival: null,
      visitDurationMinutes: null,
      visitDurationSource: null,
    };
  });

  let matrix;
  try {
    matrix = await deps.routeMatrixProvider.getMatrix({
      points: stops.map((stop) => ({
        id: stop.producerId,
        longitude: stop.coordinates[0],
        latitude: stop.coordinates[1],
      })),
    });
  } catch (error) {
    if (error instanceof TripOptimizationServiceError) throw error;
    if (error instanceof RouteMatrixProviderError) {
      throw new TripOptimizationServiceError(
        'service_unavailable',
        'Route calculation is temporarily unavailable.'
      );
    }
    throw new TripOptimizationServiceError(
      'service_unavailable',
      'Route calculation is temporarily unavailable.'
    );
  }

  let proposal: OptimizationProposalV1;
  try {
    proposal = deps.optimizationEngine.optimize(
      {
        contractVersion: 1,
        tripId: trip.id,
        dayNumber: request.dayNumber,
        tripRevision: trip.revision,
        objective: 'MIN_DRIVE_TIME',
        startLocation: null,
        endLocation: null,
        stops,
      },
      matrix
    );
  } catch (error) {
    if (error instanceof DayOptimizationError) translateEngineError(error);
    if (error instanceof TripOptimizationServiceError) throw error;
    throw new TripOptimizationServiceError(
      'service_unavailable',
      'Trip optimization is temporarily unavailable.'
    );
  }

  return {
    ...proposal,
    warnings: [...proposal.warnings, ...warningRows(rows)],
  };
}
