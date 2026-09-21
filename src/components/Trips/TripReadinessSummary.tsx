import React from 'react';
import {
  Calendar,
  Car,
  Clock,
  Footprints,
  Info,
  MapPin,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import type { Producer } from '../../types/terroir';
import { getProducerRoadAccessWarning } from '../../utils/producerAccess';

interface TripReadinessSummaryProps {
  producer: Producer;
  compact?: boolean;
}

export const TripReadinessSummary: React.FC<TripReadinessSummaryProps> = ({
  producer,
  compact = false,
}) => {
  const roadWarning = getProducerRoadAccessWarning(producer);
  const roadAccessBlocksDirections =
    producer.roadAccessStatus === 'current_access_uncertain' ||
    producer.roadAccess === 'high_clearance_recommended' ||
    producer.roadAccess === '4x4_required';
  const isUnresolvedLocation = producer.locationStatus === 'unresolved';

  const bookingLabel =
    producer.visitBookingRequirement === 'required'
      ? 'Booking required'
      : producer.visitBookingRequirement === 'recommended'
      ? 'Booking recommended'
      : producer.visitBookingRequirement === 'not_required'
      ? 'No booking required'
      : null;

  const walkInLabel =
    producer.walkInStatus === 'accepted'
      ? 'Walk-ins accepted'
      : producer.walkInStatus === 'not_accepted'
      ? 'No walk-ins'
      : producer.walkInStatus === 'subject_to_availability'
      ? 'Walk-ins subject to availability'
      : null;

  const parkingLabel =
    producer.parkingStatus === 'available'
      ? 'Dedicated parking'
      : producer.parkingStatus === 'limited'
      ? 'Limited parking'
      : producer.parkingStatus === 'no_dedicated_parking'
      ? 'No dedicated parking'
      : 'Parking not confirmed';

  const visitStatusLabel = (() => {
    switch (producer.visitStatus) {
      case 'public_visits':
        return 'Public visits';
      case 'seasonal_public':
        return 'Seasonal public visits';
      case 'appointment_only':
        return 'Appointment only';
      case 'current_access_uncertain':
        return 'Access uncertain';
      case 'not_publicly_confirmed':
        return 'Visits not publicly confirmed';
      default:
        return 'Visit status unreviewed';
    }
  })();

  const visitStatusBadgeClass = (() => {
    switch (producer.visitStatus) {
      case 'public_visits':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'seasonal_public':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'appointment_only':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      case 'current_access_uncertain':
        return 'bg-orange-500/15 text-orange-300 border-orange-500/30';
      default:
        return 'bg-stone-500/15 text-stone-300 border-stone-500/30';
    }
  })();

  const roadAccessBadge = (() => {
    if (producer.roadAccessStatus === 'current_access_uncertain') {
      return {
        label: 'Road access uncertain',
        className: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
      };
    }
    if (producer.roadAccessStatus === 'not_publicly_confirmed') {
      return {
        label: 'Road access not publicly confirmed',
        className: 'bg-stone-500/15 text-stone-300 border-stone-500/30',
      };
    }
    if (producer.roadAccessStatus !== 'verified' || !producer.roadAccess) {
      return {
        label: 'Road access unverified',
        className: 'bg-stone-500/15 text-stone-300 border-stone-500/30',
      };
    }
    if (producer.roadAccess === '4x4_required') {
      return {
        label: '4x4 required',
        className: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      };
    }
    if (producer.roadAccess === 'high_clearance_recommended') {
      return {
        label: 'High-clearance recommended',
        className: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      };
    }
    if (producer.roadAccess === 'unpaved_passable') {
      return {
        label: 'Passable unpaved access',
        className: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      };
    }
    return {
      label: 'Verified road access',
      className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    };
  })();

  const reviewedDateLabel = (() => {
    if (!producer.visitabilityReviewedAt) return null;
    const date = new Date(producer.visitabilityReviewedAt);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  })();

  const locationConfidenceBadge = (() => {
    if (producer.locationStatus === 'verified_entrance') {
      return {
        label: 'Verified entrance',
        className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      };
    }
    if (producer.locationStatus === 'verified_location') {
      return {
        label: 'Verified location',
        className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      };
    }
    return {
      label: 'Location pending verification',
      className: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    };
  })();

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full border font-semibold ${visitStatusBadgeClass}`}
        >
          {visitStatusLabel}
        </span>
        {bookingLabel && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-white/10">
            {bookingLabel}
          </span>
        )}
        {roadWarning && (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium"
            title={roadWarning}
          >
            <Car className="w-3 h-3 shrink-0" />
            <span className="truncate max-w-[140px]">
              {roadAccessBlocksDirections ? 'Access check needed' : 'Access note'}
            </span>
          </span>
        )}
        {isUnresolvedLocation && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-white/10">
            <MapPin className="w-3 h-3 text-amber-400/70 shrink-0" />
            <span>Navigation pending</span>
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2 text-xs">
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${visitStatusBadgeClass}`}
        >
          <ShieldCheck className="w-3 h-3" />
          <span>{visitStatusLabel}</span>
        </span>

        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${locationConfidenceBadge.className}`}
        >
          <MapPin className="w-3 h-3" />
          <span>{locationConfidenceBadge.label}</span>
        </span>

        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${roadAccessBadge.className}`}
        >
          <Car className="w-3 h-3" />
          <span>{roadAccessBadge.label}</span>
        </span>

        {bookingLabel ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-800/80 text-stone-300 border border-white/10 text-[11px]">
            <Calendar className="w-3 h-3 text-amber-400" />
            <span>{bookingLabel}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-800/80 text-stone-400 border border-white/10 text-[11px]">
            <Calendar className="w-3 h-3 text-stone-500" />
            <span>Booking requirement not confirmed</span>
          </span>
        )}

        {walkInLabel ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-800/80 text-stone-300 border border-white/10 text-[11px]">
            <Footprints className="w-3 h-3 text-amber-400" />
            <span>{walkInLabel}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-800/80 text-stone-400 border border-white/10 text-[11px]">
            <Footprints className="w-3 h-3 text-stone-500" />
            <span>Walk-in status not confirmed</span>
          </span>
        )}

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-800/80 text-stone-300 border border-white/10 text-[11px]">
          <Info className="w-3 h-3 text-stone-400" />
          <span>{parkingLabel}</span>
        </span>
      </div>

      {roadWarning && (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs flex items-start gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-snug text-[11px]">{roadWarning}</p>
        </div>
      )}

      {isUnresolvedLocation && (
        <div className="p-2 rounded-xl bg-stone-800/80 border border-white/10 text-stone-400 text-[11px] flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
          <span>Exact entrance point still undergoing verification. Navigation is currently withheld.</span>
        </div>
      )}

      {producer.openingHours ? (
        <div className="flex items-center gap-1.5 text-[11px] text-stone-300">
          <Clock className="w-3 h-3 text-amber-400/80 shrink-0" />
          <span className="truncate">{producer.openingHours}</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
          <Clock className="w-3 h-3 text-stone-600 shrink-0" />
          <span>Opening hours not confirmed</span>
        </div>
      )}

      {reviewedDateLabel ? (
        <div className="text-[10px] text-stone-400">
          {`Visitability verified on ${reviewedDateLabel}`}
        </div>
      ) : (
        <div className="text-[10px] text-stone-500">
          Visitability review date unrecorded
        </div>
      )}
    </div>
  );
};
