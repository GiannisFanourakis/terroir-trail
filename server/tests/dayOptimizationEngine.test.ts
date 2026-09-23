import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DayOptimizationError,
  MAX_OPTIMIZE_DAY_STOPS_V1,
  TsV1DayOptimizationEngine,
  type DayOptimizationInputV1,
  type OptimizationStopV1,
} from '../services/dayOptimizationEngine';
import type { RouteMatrixV1 } from '../services/routeMatrix';

const stop = (
  producerId: string,
  lockedPosition: number | null = null
): OptimizationStopV1 => ({
  producerId,
  coordinates: [25, 35],
  lockedPosition,
  confirmedArrivalTime: null,
  earliestArrival: null,
  latestArrival: null,
  visitDurationMinutes: null,
  visitDurationSource: null,
});

const input = (stops: OptimizationStopV1[]): DayOptimizationInputV1 => ({
  contractVersion: 1,
  tripId: 'trip-1',
  dayNumber: 2,
  tripRevision: 7,
  objective: 'MIN_DRIVE_TIME',
  startLocation: null,
  endLocation: null,
  stops,
});

const matrix = (
  pointIds: string[],
  durationsSeconds: Array<Array<number | null>>,
  distancesMeters?: Array<Array<number | null>>
): RouteMatrixV1 => ({
  pointIds,
  durationsSeconds,
  distancesMeters:
    distancesMeters ??
    durationsSeconds.map((row) =>
      row.map((value) => (value === null ? null : value * 10))
    ),
  provider: 'test-routing',
  profile: 'driving',
  generatedAt: '2026-09-23T18:00:00.000Z',
});

const engine = () =>
  new TsV1DayOptimizationEngine({
    now: () => new Date('2026-09-23T18:30:00Z'),
    proposalId: () => 'proposal-fixed',
  });
test('ts-v1 finds the lowest-drive-time order without mutating input order', () => {
  const stops = [stop('a'), stop('b'), stop('c')];
  const routeMatrix = matrix(
    ['a', 'b', 'c'],
    [
      [0, 600, 1000],
      [100, 0, 600],
      [1000, 100, 0],
    ]
  );

  const result = engine().optimize(input(stops), routeMatrix);

  assert.deepEqual(result.originalOrder, ['a', 'b', 'c']);
  assert.deepEqual(result.proposedOrder, ['c', 'b', 'a']);
  assert.deepEqual(
    stops.map((entry) => entry.producerId),
    ['a', 'b', 'c']
  );
  assert.equal(result.estimatedDriveMinutesBefore, 20);
  assert.equal(result.estimatedDriveMinutesAfter, 3);
  assert.equal(result.estimatedMinutesSaved, 17);
  assert.equal(result.estimatedDistanceKmBefore, 12);
  assert.equal(result.estimatedDistanceKmAfter, 2);
  assert.equal(result.proposalId, 'proposal-fixed');
  assert.equal(result.basedOnRevision, 7);
  assert.equal(result.routingProvider, 'test-routing');
  assert.equal(result.engineVersion, 'ts-v1');
  assert.equal(result.generatedAt, '2026-09-23T18:30:00.000Z');
});
test('locked stops remain in their current day slot', () => {
  const stops = [stop('a'), stop('b', 1), stop('c'), stop('d')];
  const routeMatrix = matrix(
    ['a', 'b', 'c', 'd'],
    [
      [0, 600, 1000, 1000],
      [1000, 0, 100, 600],
      [100, 1000, 0, 1000],
      [1000, 100, 1000, 0],
    ]
  );

  const result = engine().optimize(input(stops), routeMatrix);

  assert.deepEqual(result.proposedOrder, ['d', 'b', 'c', 'a']);
  assert.equal(result.proposedOrder[1], 'b');
  assert.equal(result.estimatedDriveMinutesBefore, 28);
  assert.equal(result.estimatedDriveMinutesAfter, 5);
});

test('savings below one minute keep the current order', () => {
  const routeMatrix = matrix(
    ['a', 'b', 'c'],
    [
      [0, 100, 100],
      [100, 0, 100],
      [100, 51, 0],
    ]
  );

  const result = engine().optimize(
    input([stop('a'), stop('b'), stop('c')]),
    routeMatrix
  );

  assert.deepEqual(result.proposedOrder, ['a', 'b', 'c']);
  assert.equal(result.estimatedMinutesSaved, 0);
  assert.equal(
    result.estimatedDriveMinutesAfter,
    result.estimatedDriveMinutesBefore
  );
});
test('equal-cost alternatives preserve the traveler current order', () => {
  const routeMatrix = matrix(
    ['a', 'b', 'c'],
    [
      [0, 100, 100],
      [100, 0, 100],
      [100, 100, 0],
    ]
  );

  const result = engine().optimize(
    input([stop('a'), stop('b'), stop('c')]),
    routeMatrix
  );

  assert.deepEqual(result.proposedOrder, ['a', 'b', 'c']);
});

test('unreachable matrix edges fail closed instead of optimizing a partial graph', () => {
  const routeMatrix = matrix(
    ['a', 'b'],
    [
      [0, null],
      [100, 0],
    ]
  );

  assert.throws(
    () => engine().optimize(input([stop('a'), stop('b')]), routeMatrix),
    (error: unknown) =>
      error instanceof DayOptimizationError &&
      error.code === 'route_unavailable'
  );
});
test('future hard constraints are rejected rather than silently ignored', () => {
  const constrained = stop('a');
  constrained.confirmedArrivalTime = '10:00';

  assert.throws(
    () =>
      engine().optimize(
        input([constrained, stop('b')]),
        matrix(
          ['a', 'b'],
          [
            [0, 100],
            [100, 0],
          ]
        )
      ),
    (error: unknown) =>
      error instanceof DayOptimizationError && error.code === 'bad_request'
  );
});

test('locked position must describe the stop current position', () => {
  assert.throws(
    () =>
      engine().optimize(
        input([stop('a', 1), stop('b')]),
        matrix(
          ['a', 'b'],
          [
            [0, 100],
            [100, 0],
          ]
        )
      ),
    (error: unknown) =>
      error instanceof DayOptimizationError && error.code === 'bad_request'
  );
});

test('V1 rejects days above the validated exhaustive-search bound', () => {
  const stops = Array.from(
    { length: MAX_OPTIMIZE_DAY_STOPS_V1 + 1 },
    (_, index) => stop(`p-${index}`)
  );
  const count = stops.length;
  const durations = Array.from({ length: count }, (_, row) =>
    Array.from({ length: count }, (_, col) => (row === col ? 0 : 100))
  );

  assert.throws(
    () =>
      engine().optimize(
        input(stops),
        matrix(
          stops.map((entry) => entry.producerId),
          durations
        )
      ),
    (error: unknown) =>
      error instanceof DayOptimizationError && error.code === 'bad_request'
  );
});

test('matrix point order must match the current normalized stop order', () => {
  assert.throws(
    () =>
      engine().optimize(
        input([stop('a'), stop('b')]),
        matrix(
          ['b', 'a'],
          [
            [0, 100],
            [100, 0],
          ]
        )
      ),
    (error: unknown) =>
      error instanceof DayOptimizationError && error.code === 'bad_request'
  );
});
test('two-stop days are valid and remain unchanged when reversal is not better', () => {
  const result = engine().optimize(
    input([stop('a'), stop('b')]),
    matrix(
      ['a', 'b'],
      [
        [0, 100],
        [200, 0],
      ]
    )
  );

  assert.deepEqual(result.proposedOrder, ['a', 'b']);
  assert.equal(result.estimatedDriveMinutesBefore, 2);
  assert.equal(result.estimatedDriveMinutesAfter, 2);
  assert.equal(result.estimatedMinutesSaved, 0);
});
