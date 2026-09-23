import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, Clock3, HelpCircle, PhoneCall } from 'lucide-react';
import type { Producer } from '../../types/terroir';
import type {
  TripItemRecordV1,
  TripProducerState,
} from '../../services/tripApi';
import {
  classifyTripStopReadiness,
  getTripDayLabel,
  type TripReadinessBucket,
} from '../../utils/tripReadiness';

interface TripPreparationPanelProps {
  items: TripItemRecordV1[];
  producers: Producer[];
  producerStates: Record<string, TripProducerState>;
  catalogueIsLive: boolean;
  startDate?: string | null;
}

const bucketMeta: Record<
  TripReadinessBucket,
  {
    label: string;
    className: string;
    icon: React.ReactNode;
  }
> = {
  ready: {
    label: 'Ready',
    className: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200',
    icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />,
  },
  contact: {
    label: 'Contact first',
    className: 'border-sky-500/25 bg-sky-500/10 text-sky-200',
    icon: <PhoneCall className="h-3.5 w-3.5 text-sky-400" />,
  },
  gap: {
    label: 'Information gap',
    className: 'border-amber-500/25 bg-amber-500/10 text-amber-200',
    icon: <HelpCircle className="h-3.5 w-3.5 text-amber-400" />,
  },
  unavailable: {
    label: 'Unavailable',
    className: 'border-rose-500/25 bg-rose-500/10 text-rose-200',
    icon: <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />,
  },
};

export const TripPreparationPanel: React.FC<TripPreparationPanelProps> = ({
  items,
  producers,
  producerStates,
  catalogueIsLive,
  startDate,
}) => {
  const producerMap = useMemo(
    () => new Map(producers.map((producer) => [producer.id, producer])),
    [producers]
  );

  const stops = useMemo(
    () =>
      [...items]
        .sort((a, b) => a.position - b.position)
        .map((item, index) => {
          const state = producerStates[item.producerId];
          const producer =
            catalogueIsLive && state === 'active'
              ? producerMap.get(item.producerId)
              : undefined;
          const readiness = classifyTripStopReadiness(
            producer,
            state,
            catalogueIsLive
          );

          return {
            item,
            index,
            producer,
            state,
            readiness,
          };
        }),
    [catalogueIsLive, items, producerMap, producerStates]
  );

  const counts = useMemo(() => {
    const result: Record<TripReadinessBucket, number> = {
      ready: 0,
      contact: 0,
      gap: 0,
      unavailable: 0,
    };
    for (const stop of stops) result[stop.readiness.bucket] += 1;
    return result;
  }, [stops]);

  if (items.length === 0) return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-stone-900/50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xs font-bold text-white">Trip readiness</h3>
          <p className="mt-0.5 text-[10px] leading-relaxed text-stone-400">
            Derived only from current TerroirTrail visitability, location, and access evidence. This is preparation guidance, not live availability.
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-white/10 bg-stone-950 px-2 py-1 text-[10px] font-mono text-stone-400">
          {items.length} {items.length === 1 ? 'stop' : 'stops'}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(['ready', 'contact', 'gap', 'unavailable'] as TripReadinessBucket[]).map(
          (bucket) => (
            <div
              key={bucket}
              className={`rounded-xl border px-3 py-2 ${bucketMeta[bucket].className}`}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide">
                {bucketMeta[bucket].icon}
                <span>{bucketMeta[bucket].label}</span>
              </div>
              <div className="mt-1 text-lg font-bold">{counts[bucket]}</div>
            </div>
          )
        )}
      </div>

      <details className="group mt-3 rounded-xl border border-white/10 bg-stone-950/50">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-[11px] font-bold text-stone-200">
          <span className="flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5 text-amber-400" />
            Preparation checklist
          </span>
          <span className="text-[10px] font-medium text-stone-500 group-open:hidden">
            Review
          </span>
          <span className="hidden text-[10px] font-medium text-stone-500 group-open:inline">
            Hide
          </span>
        </summary>

        <div className="space-y-2 border-t border-white/10 p-3">
          {stops.map((stop) => {
            const meta = bucketMeta[stop.readiness.bucket];
            const safeName =
              stop.producer?.name ||
              (stop.state === 'no_longer_listed'
                ? 'Producer no longer listed'
                : `Planned stop ${stop.index + 1}`);

            return (
              <div
                key={stop.item.producerId}
                className="rounded-xl border border-white/10 bg-stone-900/70 px-3 py-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-[11px] font-bold text-stone-200">
                      {stop.index + 1}. {safeName}
                    </div>
                    {stop.item.dayNumber && (
                      <div className="mt-0.5 text-[10px] text-stone-500">
                        {getTripDayLabel(stop.item.dayNumber, startDate)}
                      </div>
                    )}
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold ${meta.className}`}
                  >
                    {meta.icon}
                    {meta.label}
                  </span>
                </div>

                <ul className="mt-1.5 space-y-1 text-[10px] leading-relaxed text-stone-400">
                  {stop.readiness.reasons.slice(0, 3).map((reason) => (
                    <li key={reason}>• {reason}</li>
                  ))}
                  {stop.readiness.reasons.length > 3 && (
                    <li>• {stop.readiness.reasons.length - 3} more readiness checks are incomplete.</li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </details>
    </section>
  );
};
