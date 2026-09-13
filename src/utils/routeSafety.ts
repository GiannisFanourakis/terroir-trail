import { DayTripLoop, Producer, RoadAccess } from '../types/terroir';

export type RouteNavigationIssueCode =
  | 'route_not_verified'
  | 'missing_producer'
  | 'location_not_verified'
  | 'invalid_coordinates'
  | 'road_access_unreviewed'
  | 'road_access_uncertain'
  | 'special_vehicle_required';

export interface RouteNavigationIssue {
  code: RouteNavigationIssueCode;
  producerId?: string;
  message: string;
}

export interface RouteNavigationEvaluation {
  isSafe: boolean;
  url?: string;
  issues: RouteNavigationIssue[];
}

const STANDARD_ROUTE_ACCESS = new Set<RoadAccess>([
  'paved',
  'narrow_paved',
  'gravel_ok',
]);

function hasValidCoordinates(producer: Producer): boolean {
  const [lat, lng] = producer.coordinates || [];
  return (
    typeof lat === 'number' &&
    Number.isFinite(lat) &&
    lat >= -90 &&
    lat <= 90 &&
    typeof lng === 'number' &&
    Number.isFinite(lng) &&
    lng >= -180 &&
    lng <= 180
  );
}

function buildGoogleMapsRouteUrl(coordsList: string[]): string {
  if (coordsList.length === 0) return '';
  if (coordsList.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${coordsList[0]}`;
  }

  const origin = coordsList[0];
  const destination = coordsList[coordsList.length - 1];
  const waypoints = coordsList.slice(1, -1).join('|');

  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
  if (waypoints) {
    url += `&waypoints=${waypoints}`;
  }
  return url;
}

/**
 * Curated multi-stop driving navigation is deliberately stricter than an
 * individual producer map link. A route is only generated after the route
 * itself is marked verified and every stop has:
 * - a verified location/entrance,
 * - valid coordinates,
 * - a verified road/access classification suitable for a normal road trip.
 *
 * Missing or unknown data is never silently skipped.
 */
export function evaluateRouteNavigation(
  loop: DayTripLoop,
  producers: Producer[]
): RouteNavigationEvaluation {
  const issues: RouteNavigationIssue[] = [];
  const producerMap = new Map(producers.map((producer) => [producer.id, producer]));
  const coordsList: string[] = [];

  if (loop.verificationStatus !== 'verified') {
    issues.push({
      code: 'route_not_verified',
      message: 'This curated route has not yet completed the location and road-access audit.',
    });
  }

  for (const stop of loop.stops) {
    const producer = producerMap.get(stop.producerId);

    if (!producer) {
      issues.push({
        code: 'missing_producer',
        producerId: stop.producerId,
        message: `Route stop ${stop.producerId} is not present in the current producer catalogue.`,
      });
      continue;
    }

    if (
      producer.locationStatus !== 'verified_location' &&
      producer.locationStatus !== 'verified_entrance'
    ) {
      issues.push({
        code: 'location_not_verified',
        producerId: producer.id,
        message: `${producer.name} does not have a verified navigation location.`,
      });
    }

    if (!hasValidCoordinates(producer)) {
      issues.push({
        code: 'invalid_coordinates',
        producerId: producer.id,
        message: `${producer.name} does not have valid route coordinates.`,
      });
    }

    if (producer.roadAccessStatus === 'current_access_uncertain') {
      issues.push({
        code: 'road_access_uncertain',
        producerId: producer.id,
        message: `${producer.name} has currently uncertain road access.`,
      });
    } else if (
      producer.roadAccessStatus !== 'verified' ||
      !producer.roadAccess
    ) {
      issues.push({
        code: 'road_access_unreviewed',
        producerId: producer.id,
        message: `${producer.name} does not yet have verified road-access evidence.`,
      });
    } else if (!STANDARD_ROUTE_ACCESS.has(producer.roadAccess)) {
      issues.push({
        code: 'special_vehicle_required',
        producerId: producer.id,
        message: `${producer.name} requires or recommends a special/high-clearance vehicle.`,
      });
    }

    if (hasValidCoordinates(producer)) {
      coordsList.push(`${producer.coordinates[0]},${producer.coordinates[1]}`);
    }
  }

  if (issues.length > 0) {
    return { isSafe: false, issues };
  }

  const url = buildGoogleMapsRouteUrl(coordsList);
  if (!url) {
    return {
      isSafe: false,
      issues: [
        {
          code: 'invalid_coordinates',
          message: 'The route does not contain usable navigation coordinates.',
        },
      ],
    };
  }

  return { isSafe: true, url, issues: [] };
}

/**
 * Individual producer links remain location links, not a road-safety promise.
 * This helper is used to decide whether an explicit road-access warning should
 * accompany the link.
 */
export function getProducerRoadAccessWarning(producer: Producer): string | undefined {
  if (producer.roadAccessStatus === 'current_access_uncertain') {
    return 'Current road access is uncertain. Confirm conditions with the producer before driving.';
  }
  if (producer.roadAccessStatus !== 'verified' || !producer.roadAccess) {
    return 'Road conditions have not yet been independently verified. Use the producer’s official access instructions and drive conservatively.';
  }
  if (producer.roadAccess === 'high_clearance_recommended') {
    return 'High-clearance vehicle recommended. Check current conditions before driving.';
  }
  if (producer.roadAccess === '4x4_required') {
    return '4x4 access required. Do not attempt this approach in a standard rental car.';
  }
  return undefined;
}
