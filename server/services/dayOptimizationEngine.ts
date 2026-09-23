import { randomUUID } from 'node:crypto';
import type { RouteMatrixV1 } from './routeMatrix';

export const MAX_OPTIMIZE_DAY_STOPS_V1 = 8;
export const MIN_MEANINGFUL_SAVINGS_SECONDS_V1 = 60;

export type DayOptimizationErrorCode =
  | 'bad_request'
  | 'insufficient_stops'
  | 'route_unavailable'
  | 'no_feasible_solution';

export class DayOptimizationError extends Error {
  constructor(
    public readonly code: DayOptimizationErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'DayOptimizationError';
  }
}

export type VisitDurationSourceV1 =
  | 'producer_verified_duration'
  | 'experience_duration'
  | 'category_default_estimate'
  | 'traveler_override';

export interface RoutePointV1 {
  id: string;
  latitude: number;
  longitude: number;
}

export interface OptimizationStopV1 {
  producerId: string;
  coordinates: [number, number];
  lockedPosition: number | null;
  confirmedArrivalTime: string | null;
  earliestArrival: string | null;
  latestArrival: string | null;
  visitDurationMinutes: number | null;
  visitDurationSource: VisitDurationSourceV1 | null;
}

export interface DayOptimizationInputV1 {
  contractVersion: 1;
  tripId: string;
  dayNumber: number;
  tripRevision: number;
  objective: 'MIN_DRIVE_TIME';
  startLocation: RoutePointV1 | null;
  endLocation: RoutePointV1 | null;
  stops: OptimizationStopV1[];
}
export interface OptimizationWarningV1 {
  code: string;
  message: string;
  producerId?: string;
}

export interface OptimizationProposalV1 {
  contractVersion: 1;
  proposalId: string;
  tripId: string;
  dayNumber: number;
  basedOnRevision: number;
  originalOrder: string[];
  proposedOrder: string[];
  estimatedDriveMinutesBefore: number | null;
  estimatedDriveMinutesAfter: number | null;
  estimatedMinutesSaved: number | null;
  estimatedDistanceKmBefore: number | null;
  estimatedDistanceKmAfter: number | null;
  warnings: OptimizationWarningV1[];
  unresolvedConstraints: string[];
  routingProvider: string;
  engineVersion: 'ts-v1';
  generatedAt: string;
}

export interface DayOptimizationEngine {
  optimize(
    input: DayOptimizationInputV1,
    matrix: RouteMatrixV1
  ): OptimizationProposalV1;
}

interface EngineOptions {
  now?: () => Date;
  proposalId?: () => string;
}

const fail = (code: DayOptimizationErrorCode, message: string): never => {
  throw new DayOptimizationError(code, message);
};
const validateInput = (input: DayOptimizationInputV1) => {
  if (
    input.contractVersion !== 1 ||
    input.objective !== 'MIN_DRIVE_TIME' ||
    !input.tripId ||
    !Number.isInteger(input.dayNumber) ||
    input.dayNumber < 1 ||
    !Number.isInteger(input.tripRevision) ||
    input.tripRevision < 1
  ) {
    fail('bad_request', 'Optimization request is invalid.');
  }

  if (input.startLocation || input.endLocation) {
    fail(
      'bad_request',
      'Custom start and end locations are not supported in Optimize My Day V1.'
    );
  }

  if (!Array.isArray(input.stops) || input.stops.length < 2) {
    fail(
      'insufficient_stops',
      'At least two assigned stops are required to optimize this day.'
    );
  }

  if (input.stops.length > MAX_OPTIMIZE_DAY_STOPS_V1) {
    fail(
      'bad_request',
      `Optimize My Day V1 supports up to ${MAX_OPTIMIZE_DAY_STOPS_V1} stops per day.`
    );
  }

  const ids = input.stops.map((stop) => stop.producerId);
  if (
    ids.some((id) => !id || typeof id !== 'string') ||
    new Set(ids).size !== ids.length
  ) {
    fail('bad_request', 'Optimization stops must have unique producer IDs.');
  }

  const locked = new Set<number>();
  input.stops.forEach((stop, index) => {
    const [longitude, latitude] = stop.coordinates;
    if (
      !Number.isFinite(longitude) ||
      !Number.isFinite(latitude) ||
      longitude < -180 ||
      longitude > 180 ||
      latitude < -90 ||
      latitude > 90
    ) {
      fail('bad_request', 'Optimization stop coordinates are invalid.');
    }

    if (
      stop.confirmedArrivalTime !== null ||
      stop.earliestArrival !== null ||
      stop.latestArrival !== null
    ) {
      fail(
        'bad_request',
        'Time-window constraints are not supported in Optimize My Day V1.'
      );
    }

    if (stop.lockedPosition !== null) {
      if (
        !Number.isInteger(stop.lockedPosition) ||
        stop.lockedPosition !== index ||
        locked.has(stop.lockedPosition)
      ) {
        fail(
          'bad_request',
          'Locked stops must remain in their current unique position.'
        );
      }
      locked.add(stop.lockedPosition);
    }
  });
};
const validateMatrix = (
  input: DayOptimizationInputV1,
  matrix: RouteMatrixV1
) => {
  const ids = input.stops.map((stop) => stop.producerId);
  if (
    matrix.pointIds.length !== ids.length ||
    matrix.pointIds.some((id, index) => id !== ids[index]) ||
    matrix.durationsSeconds.length !== ids.length ||
    matrix.distancesMeters.length !== ids.length
  ) {
    fail(
      'bad_request',
      'Route matrix does not match the current day stop order.'
    );
  }

  for (let row = 0; row < ids.length; row += 1) {
    if (
      !Array.isArray(matrix.durationsSeconds[row]) ||
      matrix.durationsSeconds[row].length !== ids.length ||
      !Array.isArray(matrix.distancesMeters[row]) ||
      matrix.distancesMeters[row].length !== ids.length
    ) {
      fail('bad_request', 'Route matrix dimensions are invalid.');
    }

    for (let col = 0; col < ids.length; col += 1) {
      const duration = matrix.durationsSeconds[row][col];
      const distance = matrix.distancesMeters[row][col];
      if (
        duration === null ||
        distance === null ||
        !Number.isFinite(duration) ||
        duration < 0 ||
        !Number.isFinite(distance) ||
        distance < 0
      ) {
        fail(
          'route_unavailable',
          "We couldn't reliably calculate this day's route."
        );
      }
    }
  }
};

const routeTotals = (
  order: string[],
  indexById: Map<string, number>,
  matrix: RouteMatrixV1
) => {
  let durationSeconds = 0;
  let distanceMeters = 0;

  for (let i = 0; i < order.length - 1; i += 1) {
    const fromId = order[i];
    const toId = order[i + 1];
    if (!fromId || !toId) {
      fail('bad_request', 'Optimization order contains an invalid stop.');
    }
    const from = indexById.get(fromId);
    if (from === undefined) {
      throw new DayOptimizationError(
        'bad_request',
        'Optimization order contains an unknown stop.'
      );
    }
    const to = indexById.get(toId);
    if (to === undefined) {
      throw new DayOptimizationError(
        'bad_request',
        'Optimization order contains an unknown stop.'
      );
    }
    const durationRow = matrix.durationsSeconds[from];
    const distanceRow = matrix.distancesMeters[from];
    const duration = durationRow?.[to];
    const distance = distanceRow?.[to];
    if (typeof duration !== 'number' || typeof distance !== 'number') {
      throw new DayOptimizationError(
        'route_unavailable',
        "We couldn't reliably calculate this day's route."
      );
    }
    durationSeconds += duration;
    distanceMeters += distance;
  }

  return { durationSeconds, distanceMeters };
};
function* permutations(values: string[]): Generator<string[]> {
  if (values.length <= 1) {
    yield values.slice();
    return;
  }

  for (let i = 0; i < values.length; i += 1) {
    const head = values[i];
    const rest = values.slice(0, i).concat(values.slice(i + 1));
    for (const tail of permutations(rest)) yield [head, ...tail];
  }
}

const buildCandidate = (
  originalOrder: string[],
  lockedPositions: Map<number, string>,
  movableOrder: string[]
) => {
  const candidate = new Array<string>(originalOrder.length);
  for (const [position, producerId] of lockedPositions) {
    candidate[position] = producerId;
  }
  let movableIndex = 0;
  for (let position = 0; position < candidate.length; position += 1) {
    if (!candidate[position]) {
      candidate[position] = movableOrder[movableIndex];
      movableIndex += 1;
    }
  }
  return candidate;
};

const minutes = (seconds: number) => Math.round(seconds / 60);
const kilometers = (meters: number) => Math.round((meters / 1000) * 10) / 10;

export class TsV1DayOptimizationEngine implements DayOptimizationEngine {
  private readonly now: () => Date;
  private readonly proposalId: () => string;

  constructor(options: EngineOptions = {}) {
    this.now = options.now ?? (() => new Date());
    this.proposalId = options.proposalId ?? randomUUID;
  }

  optimize(
    input: DayOptimizationInputV1,
    matrix: RouteMatrixV1
  ): OptimizationProposalV1 {
    validateInput(input);
    validateMatrix(input, matrix);

    const originalOrder = input.stops.map((stop) => stop.producerId);
    const indexById = new Map(
      originalOrder.map((producerId, index) => [producerId, index])
    );
    const lockedPositions = new Map<number, string>();
    const movable: string[] = [];

    input.stops.forEach((stop, index) => {
      if (stop.lockedPosition === null) movable.push(stop.producerId);
      else lockedPositions.set(index, stop.producerId);
    });

    const before = routeTotals(originalOrder, indexById, matrix);
    let bestOrder = originalOrder.slice();
    let best = before;

    for (const movableOrder of permutations(movable)) {
      const candidate = buildCandidate(
        originalOrder,
        lockedPositions,
        movableOrder
      );
      const totals = routeTotals(candidate, indexById, matrix);
      if (totals.durationSeconds < best.durationSeconds) {
        bestOrder = candidate;
        best = totals;
      }
    }

    const secondsSaved = before.durationSeconds - best.durationSeconds;
    if (secondsSaved < MIN_MEANINGFUL_SAVINGS_SECONDS_V1) {
      bestOrder = originalOrder.slice();
      best = before;
    }

    return {
      contractVersion: 1,
      proposalId: this.proposalId(),
      tripId: input.tripId,
      dayNumber: input.dayNumber,
      basedOnRevision: input.tripRevision,
      originalOrder,
      proposedOrder: bestOrder,
      estimatedDriveMinutesBefore: minutes(before.durationSeconds),
      estimatedDriveMinutesAfter: minutes(best.durationSeconds),
      estimatedMinutesSaved: minutes(
        before.durationSeconds - best.durationSeconds
      ),
      estimatedDistanceKmBefore: kilometers(before.distanceMeters),
      estimatedDistanceKmAfter: kilometers(best.distanceMeters),
      warnings: [],
      unresolvedConstraints: [],
      routingProvider: matrix.provider,
      engineVersion: 'ts-v1',
      generatedAt: this.now().toISOString(),
    };
  }
}

export const tsV1DayOptimizationEngine = new TsV1DayOptimizationEngine();
