import type { Producer } from '../types/terroir';
import type { TripProducerState } from '../services/tripApi';

export type TripReadinessBucket = 'ready' | 'contact' | 'gap' | 'unavailable';

export interface TripStopReadiness {
  bucket: TripReadinessBucket;
  reasons: string[];
}

const isVerifiedLocation = (producer: Producer): boolean =>
  producer.locationStatus === 'verified_entrance' ||
  producer.locationStatus === 'verified_location';

const hasReviewedRoadAccess = (producer: Producer): boolean =>
  producer.roadAccessStatus === 'verified' && Boolean(producer.roadAccess);

const hasKnownVisitPolicy = (producer: Producer): boolean =>
  producer.visitStatus === 'public_visits' ||
  producer.visitStatus === 'seasonal_public' ||
  producer.visitStatus === 'appointment_only';

const hasKnownArrivalWindow = (producer: Producer): boolean =>
  Boolean(producer.openingHours?.trim()) ||
  (Array.isArray(producer.visitorHours)
    ? producer.visitorHours.length > 0
    : Boolean(producer.visitorHours && Object.keys(producer.visitorHours).length > 0));

export function classifyTripStopReadiness(
  producer: Producer | undefined,
  producerState: TripProducerState | undefined,
  catalogueIsLive: boolean
): TripStopReadiness {
  if (producerState === 'no_longer_listed' || producerState === 'unavailable') {
    return {
      bucket: 'unavailable',
      reasons: [
        producerState === 'no_longer_listed'
          ? 'Producer is no longer listed on TerroirTrail.'
          : 'Producer is not currently available on TerroirTrail.',
      ],
    };
  }

  if (!catalogueIsLive || !producer) {
    return {
      bucket: 'gap',
      reasons: ['Current producer details are temporarily unavailable.'],
    };
  }

  const gaps: string[] = [];

  if (!isVerifiedLocation(producer)) {
    gaps.push('Exact visitor location is not fully verified.');
  }
  if (!hasKnownVisitPolicy(producer)) {
    gaps.push('Current public-visit status is not confirmed.');
  }
  if (!hasReviewedRoadAccess(producer)) {
    gaps.push('Road/access suitability is not fully verified.');
  }
  if (!hasKnownArrivalWindow(producer)) {
    gaps.push('Visitor hours are not confirmed.');
  }
  if (!producer.visitabilityReviewedAt) {
    gaps.push('Visitability review freshness is unavailable.');
  }
  if (!producer.visitBookingRequirement && !producer.walkInStatus) {
    gaps.push('Booking or walk-in policy is not confirmed.');
  }

  if (gaps.length > 0) {
    return { bucket: 'gap', reasons: gaps };
  }

  const contactReasons: string[] = [];

  if (producer.visitStatus === 'appointment_only') {
    contactReasons.push('Visits are by appointment.');
  }
  if (producer.visitStatus === 'seasonal_public') {
    contactReasons.push('Public access is seasonal; confirm before departure.');
  }
  if (producer.visitBookingRequirement === 'required') {
    contactReasons.push('Booking is required.');
  } else if (producer.visitBookingRequirement === 'recommended') {
    contactReasons.push('Booking is recommended.');
  }
  if (producer.walkInStatus === 'not_accepted') {
    contactReasons.push('Walk-ins are not accepted.');
  } else if (producer.walkInStatus === 'subject_to_availability') {
    contactReasons.push('Walk-ins are subject to availability.');
  }

  if (contactReasons.length > 0) {
    return { bucket: 'contact', reasons: contactReasons };
  }

  return {
    bucket: 'ready',
    reasons: ['Current TerroirTrail evidence supports straightforward visit preparation.'],
  };
}

export function getTripDayLabel(
  dayNumber: number,
  startDate?: string | null,
  includeYear = false
): string {
  if (!startDate) return `Day ${dayNumber}`;

  const [year, month, day] = startDate.split('-').map(Number);
  const base = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(base.getTime())) return `Day ${dayNumber}`;

  base.setUTCDate(base.getUTCDate() + dayNumber - 1);
  const dateLabel = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    ...(includeYear ? { year: 'numeric' } : {}),
    timeZone: 'UTC',
  }).format(base);

  return `Day ${dayNumber} · ${dateLabel}`;
}
