import { Producer } from '../types/terroir';

/**
 * Individual producer links remain location links, not a road-safety promise.
 * This helper is used to decide whether an explicit road-access warning should
 * accompany the link.
 */
export function getProducerRoadAccessWarning(producer: Producer): string | undefined {
  if (producer.roadAccessStatus === 'current_access_uncertain') {
    return 'Current road access is uncertain. Confirm conditions with the producer before driving.';
  }
  if (producer.roadAccessStatus === 'not_publicly_confirmed') {
    return 'Road conditions were reviewed but are not publicly confirmed. Use the producer’s official directions and confirm access if needed.';
  }
  if (producer.roadAccessStatus !== 'verified' || !producer.roadAccess) {
    return 'Road conditions have not yet been independently verified. Use the producer’s official access instructions and drive conservatively.';
  }
  if (producer.roadAccess === 'unpaved_passable') {
    return 'Verified passable unpaved access. This does not imply rental-car suitability; check your rental terms and current conditions.';
  }
  if (producer.roadAccess === 'high_clearance_recommended') {
    return 'High-clearance vehicle recommended. Check current conditions before driving.';
  }
  if (producer.roadAccess === '4x4_required') {
    return '4x4 access required. Do not attempt this approach in a standard rental car.';
  }
  return undefined;
}
