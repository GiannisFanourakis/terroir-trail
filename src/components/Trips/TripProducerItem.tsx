import React from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Calendar,
  ChevronDown,
  MapPin,
  Navigation,
  Trash2,
} from 'lucide-react';
import type { TripItemRecordV1, TripProducerState } from '../../services/tripApi';
import type { Producer } from '../../types/terroir';
import { ProducerCategoryIcon } from '../Common/ProducerCategoryIcon';
import { TripReadinessSummary } from './TripReadinessSummary';

interface TripProducerItemProps {
  item: TripItemRecordV1;
  position: number;
  totalCount: number;
  producerState?: TripProducerState;
  producer?: Producer;
  isStateLoading?: boolean;
  isStateError?: boolean;
  maxDays?: number;
  onMoveUp: (producerId: string) => void;
  onMoveDown: (producerId: string) => void;
  onAssignDay: (producerId: string, dayNumber: number | null) => void;
  onRemove: (producerId: string) => void;
  onSelectProducer: (producer: Producer) => void;
  disabled?: boolean;
}

export const TripProducerItem: React.FC<TripProducerItemProps> = ({
  item,
  position,
  totalCount,
  producerState = 'active',
  producer,
  isStateLoading = false,
  isStateError = false,
  maxDays,
  onMoveUp,
  onMoveDown,
  onAssignDay,
  onRemove,
  onSelectProducer,
  disabled = false,
}) => {
  const isFirst = position === 0;
  const isLast = position === totalCount - 1;

  // Day options: Unassigned, and Days 1..N
  const dayOptionsCount = maxDays && maxDays > 0 ? maxDays : 14;

  const roadAccessBlocksDirections =
    producer?.roadAccessStatus === 'current_access_uncertain' ||
    producer?.roadAccess === 'high_clearance_recommended' ||
    producer?.roadAccess === '4x4_required';
  const hasVerifiedStandardRoad =
    producer?.roadAccessStatus === 'verified' &&
    (producer.roadAccess === 'paved' ||
      producer.roadAccess === 'narrow_paved' ||
      producer.roadAccess === 'gravel_ok');
  const canOfferDirections =
    Boolean(producer?.googleMapsUrl) &&
    producer?.locationStatus !== 'unresolved' &&
    !roadAccessBlocksDirections;

  return (
    <div className="group relative rounded-2xl bg-stone-900/80 hover:bg-stone-900 border border-white/10 hover:border-white/20 transition-all p-3.5 sm:p-4 text-stone-200 shadow-md">
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Order index pill & reorder buttons */}
        <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
          <span className="w-6 h-6 rounded-full bg-stone-800 border border-white/15 text-[11px] font-mono font-bold text-amber-400 flex items-center justify-center">
            {position + 1}
          </span>
          <div className="flex flex-col items-center gap-0.5">
            <button
              type="button"
              onClick={() => onMoveUp(item.producerId)}
              disabled={isFirst || disabled}
              className="p-1 rounded-md text-stone-400 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
              title="Move up"
              aria-label={`Move item ${position + 1} up`}
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onMoveDown(item.producerId)}
              disabled={isLast || disabled}
              className="p-1 rounded-md text-stone-400 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
              title="Move down"
              aria-label={`Move item ${position + 1} down`}
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Item Content by state */}
        <div className="flex-1 min-w-0">
          {isStateError ? (
            <div className="p-3 rounded-xl bg-stone-800/70 border border-white/10 text-stone-300">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-200">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Producer details are temporarily unavailable.</span>
              </div>
              <p className="mt-1 text-[11px] text-stone-400">
                Your trip item is preserved. Live producer information will reload when connectivity is restored.
              </p>
            </div>
          ) : isStateLoading ? (
            <div className="p-3 rounded-xl bg-stone-800/40 animate-pulse text-stone-400 text-xs">
              Resolving producer status…
            </div>
          ) : producerState === 'no_longer_listed' ? (
            <div className="p-3 rounded-xl bg-stone-950/80 border border-red-500/20 text-stone-300">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-200">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>Producer no longer listed on TerroirTrail</span>
              </div>
              <p className="mt-1 text-[11px] text-stone-400">
                This producer has opted out or been delisted from the public catalogue. Historical operational details are no longer exposed.
              </p>
            </div>
          ) : producerState === 'unavailable' ? (
            <div className="p-3 rounded-xl bg-stone-950/80 border border-amber-500/20 text-stone-300">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Producer currently unavailable on TerroirTrail.</span>
              </div>
              <p className="mt-1 text-[11px] text-stone-400">
                This point is temporarily not active in the public directory. Your planning reference is retained.
              </p>
            </div>
          ) : producer ? (
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelectProducer(producer)}
                  className="text-left group/title focus:outline-none cursor-pointer"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-white group-hover/title:text-amber-300 transition-colors">
                      {producer.name}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      <ProducerCategoryIcon category={producer.category} className="w-3 h-3" />
                      <span className="capitalize">{producer.category.replace(/_/g, ' ')}</span>
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-stone-400 flex items-center gap-1.5 flex-wrap">
                    <span className="capitalize">{producer.destination.replace(/_/g, ' ')}</span>
                    {producer.region && <span>· {producer.region}</span>}
                    {producer.village && <span>· {producer.village}</span>}
                  </div>
                </button>

                {canOfferDirections && (
                  <a
                    href={producer.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-amber-300 border border-white/10 transition shrink-0"
                    title={hasVerifiedStandardRoad ? 'Get directions' : 'Open in Google Maps'}
                    aria-label={`Open ${producer.name} on map`}
                  >
                    {hasVerifiedStandardRoad ? (
                      <Navigation className="w-3.5 h-3.5" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5" />
                    )}
                  </a>
                )}
              </div>

              {producer.tagLine && (
                <p className="text-xs text-stone-300 line-clamp-2 italic">
                  &ldquo;{producer.tagLine}&rdquo;
                </p>
              )}

              <TripReadinessSummary producer={producer} compact />
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-stone-800/70 border border-white/10 text-stone-300">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-200">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Producer details are temporarily unavailable.</span>
              </div>
              <p className="mt-1 text-[11px] text-stone-400">
                Catalogue record is syncing. Your planned stop remains in this trip.
              </p>
            </div>
          )}

          {/* Controls: Day assignment & Remove */}
          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-[11px] text-stone-400">
                <Calendar className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="sr-only">Assigned Day</span>
                <div className="relative">
                  <select
                    value={item.dayNumber ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      onAssignDay(item.producerId, val === '' ? null : Number(val));
                    }}
                    disabled={disabled}
                    className="appearance-none bg-stone-800 border border-white/10 rounded-lg pl-2 pr-6 py-1 text-xs text-stone-200 font-medium hover:border-amber-400/40 focus:outline-none focus:border-amber-400 cursor-pointer disabled:opacity-40"
                    aria-label={`Day assignment for item ${position + 1}`}
                  >
                    <option value="">Unassigned</option>
                    {Array.from({ length: dayOptionsCount }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day}>
                        {`Day ${day}`}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-stone-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </label>
            </div>

            <button
              type="button"
              onClick={() => onRemove(item.producerId)}
              disabled={disabled}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 text-[11px] font-medium transition cursor-pointer disabled:opacity-40"
              title="Remove from trip"
              aria-label={producer && producerState === 'active' ? `Remove ${producer.name} from trip` : 'Remove producer from trip'}
            >
              <Trash2 className="w-3 h-3" />
              <span>Remove</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
