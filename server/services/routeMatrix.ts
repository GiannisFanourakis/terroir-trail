export type RouteMatrixProviderCode =
  | 'not_configured'
  | 'invalid_input'
  | 'provider_unavailable'
  | 'invalid_response';

export class RouteMatrixProviderError extends Error {
  constructor(
    public readonly code: RouteMatrixProviderCode,
    message: string
  ) {
    super(message);
    this.name = 'RouteMatrixProviderError';
  }
}

export interface RouteMatrixPointV1 {
  id: string;
  latitude: number;
  longitude: number;
}

export interface RouteMatrixRequestV1 {
  points: RouteMatrixPointV1[];
}
export interface RouteMatrixV1 {
  pointIds: string[];
  durationsSeconds: Array<Array<number | null>>;
  distancesMeters: Array<Array<number | null>>;
  provider: string;
  profile: string;
  generatedAt: string;
}

export interface RouteMatrixProvider {
  getMatrix(input: RouteMatrixRequestV1): Promise<RouteMatrixV1>;
}

export const assertRouteMatrixPoint = (point: RouteMatrixPointV1) => {
  if (!point.id.trim() || point.id.length > 200) {
    throw new RouteMatrixProviderError(
      'invalid_input',
      'Route matrix point ID is invalid.'
    );
  }
  if (
    !Number.isFinite(point.latitude) ||
    !Number.isFinite(point.longitude) ||
    point.latitude < -90 ||
    point.latitude > 90 ||
    point.longitude < -180 ||
    point.longitude > 180
  ) {
    throw new RouteMatrixProviderError(
      'invalid_input',
      'Route matrix coordinates are invalid.'
    );
  }
};
export const assertSquareMatrix = (
  matrix: unknown,
  size: number,
  fieldName: string
): Array<Array<number | null>> => {
  if (
    !Array.isArray(matrix) ||
    matrix.length !== size ||
    matrix.some(
      (row) =>
        !Array.isArray(row) ||
        row.length !== size ||
        row.some(
          (value) =>
            value !== null &&
            (typeof value !== 'number' || !Number.isFinite(value) || value < 0)
        )
    )
  ) {
    throw new RouteMatrixProviderError(
      'invalid_response',
      `Routing provider returned an invalid ${fieldName} matrix.`
    );
  }

  return matrix as Array<Array<number | null>>;
};
