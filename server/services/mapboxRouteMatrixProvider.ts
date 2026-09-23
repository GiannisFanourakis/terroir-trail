import {
  RouteMatrixProviderError,
  assertRouteMatrixPoint,
  assertSquareMatrix,
  type RouteMatrixProvider,
  type RouteMatrixRequestV1,
  type RouteMatrixV1,
} from './routeMatrix';

const MAPBOX_MATRIX_BASE =
  'https://api.mapbox.com/directions-matrix/v1/mapbox/driving';
const MAPBOX_MATRIX_MAX_POINTS = 25;

type FetchLike = typeof fetch;

interface MapboxRouteMatrixProviderOptions {
  accessToken?: string;
  fetchImpl?: FetchLike;
  timeoutMs?: number;
  now?: () => Date;
}

interface MapboxMatrixResponse {
  code?: unknown;
  durations?: unknown;
  distances?: unknown;
}
export class MapboxRouteMatrixProvider implements RouteMatrixProvider {
  private readonly accessToken: string;
  private readonly fetchImpl: FetchLike;
  private readonly timeoutMs: number;
  private readonly now: () => Date;

  constructor(options: MapboxRouteMatrixProviderOptions = {}) {
    this.accessToken =
      options.accessToken ?? process.env.MAPBOX_ACCESS_TOKEN?.trim() ?? '';
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.timeoutMs = options.timeoutMs ?? 8000;
    this.now = options.now ?? (() => new Date());
  }

  async getMatrix(input: RouteMatrixRequestV1): Promise<RouteMatrixV1> {
    if (!this.accessToken) {
      throw new RouteMatrixProviderError(
        'not_configured',
        'Route calculation is not configured.'
      );
    }

    if (
      !Array.isArray(input.points) ||
      input.points.length < 2 ||
      input.points.length > MAPBOX_MATRIX_MAX_POINTS
    ) {
      throw new RouteMatrixProviderError(
        'invalid_input',
        `Route matrix requires between 2 and ${MAPBOX_MATRIX_MAX_POINTS} points.`
      );
    }
    for (const point of input.points) assertRouteMatrixPoint(point);

    const coordinates = input.points
      .map((point) => `${point.longitude},${point.latitude}`)
      .join(';');
    const url = new URL(`${MAPBOX_MATRIX_BASE}/${coordinates}`);
    url.searchParams.set('annotations', 'duration,distance');
    url.searchParams.set('access_token', this.accessToken);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
    } catch {
      throw new RouteMatrixProviderError(
        'provider_unavailable',
        'Route calculation is temporarily unavailable.'
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      throw new RouteMatrixProviderError(
        'provider_unavailable',
        'Route calculation is temporarily unavailable.'
      );
    }
    let body: MapboxMatrixResponse;
    try {
      body = (await response.json()) as MapboxMatrixResponse;
    } catch {
      throw new RouteMatrixProviderError(
        'invalid_response',
        'Routing provider returned an invalid response.'
      );
    }

    if (body.code !== 'Ok') {
      throw new RouteMatrixProviderError(
        'provider_unavailable',
        'Route calculation is temporarily unavailable.'
      );
    }

    const size = input.points.length;
    const durationsSeconds = assertSquareMatrix(
      body.durations,
      size,
      'duration'
    );
    const distancesMeters = assertSquareMatrix(
      body.distances,
      size,
      'distance'
    );

    return {
      pointIds: input.points.map((point) => point.id),
      durationsSeconds,
      distancesMeters,
      provider: 'mapbox',
      profile: 'driving',
      generatedAt: this.now().toISOString(),
    };
  }
}

export const mapboxRouteMatrixProvider = new MapboxRouteMatrixProvider();
