import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, MapPin, Megaphone } from 'lucide-react';
import type { Producer } from '../../types/terroir';
import { producerService } from '../../services/producerService';
import {
  fetchActivePartnerPlacements,
  type ActivePartnerPlacement,
} from '../../services/partnerPlacementApi';
import {
  recordPartnerImpression,
  recordPartnerOpen,
} from '../../services/partnerAttribution';
import type { PartnerPlacement } from '../../services/intentAnalytics';
import { ProducerCategoryIcon } from '../Common/ProducerCategoryIcon';

type PartnerSourceSurface = 'region_planning' | 'trip_preparation';

interface PartnerPlacementCardProps {
  campaign: ActivePartnerPlacement;
  producer: Producer;
  sourceSurface: PartnerSourceSurface;
  onOpenProducer: (producer: Producer) => void;
  className?: string;
}

const categoryLabel = (value: string) =>
  value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const PartnerPlacementCard: React.FC<PartnerPlacementCardProps> = ({
  campaign,
  producer,
  sourceSurface,
  onOpenProducer,
  className = '',
}) => {
  const ref = useRef<HTMLElement>(null);
  const impressedRef = useRef(false);

  useEffect(() => {
    if (!ref.current || impressedRef.current) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      impressedRef.current = true;
      void recordPartnerImpression(campaign, sourceSurface);
      return undefined;
    }

    let dwellTimer: number | null = null;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && entry.intersectionRatio >= 0.5) {
          if (dwellTimer === null) {
            dwellTimer = window.setTimeout(() => {
              dwellTimer = null;
              if (!impressedRef.current) {
                impressedRef.current = true;
                void recordPartnerImpression(campaign, sourceSurface);
              }
            }, 1000);
          }
        } else if (dwellTimer !== null) {
          window.clearTimeout(dwellTimer);
          dwellTimer = null;
        }
      },
      { threshold: [0, 0.5, 1] }
    );

    observer.observe(ref.current);
    return () => {
      if (dwellTimer !== null) window.clearTimeout(dwellTimer);
      observer.disconnect();
    };
  }, [campaign, sourceSurface]);

  const openProducer = () => {
    void recordPartnerOpen(campaign, sourceSurface);
    onOpenProducer(producer);
  };

  return (
    <section
      ref={ref}
      className={`rounded-2xl border border-amber-400/25 bg-amber-400/[0.07] p-4 shadow-lg shadow-black/10 ${className}`}
      aria-label={`Featured Partner: ${producer.name}`}
      data-partner-campaign-id={campaign.campaignId}
      data-partner-placement={campaign.placement}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-400/10">
          <ProducerCategoryIcon category={producer.category} className="h-4 w-4 text-amber-300" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/25 bg-amber-400/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-amber-300">
              <Megaphone className="h-3 w-3" aria-hidden="true" />
              Featured Partner
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-stone-500">
              Paid placement
            </span>
          </div>

          <h3 className="mt-2 text-sm font-bold text-white">{producer.name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-stone-400">
            <span>{categoryLabel(producer.category)}</span>
            {producer.village && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-amber-400/80" aria-hidden="true" />
                  {producer.village}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-white/10 bg-black/15 p-3">
        <div className="text-xs font-bold text-stone-100">{campaign.headline}</div>
        {campaign.message && (
          <p className="mt-1 text-[11px] leading-relaxed text-stone-400">
            {campaign.message}
          </p>
        )}
      </div>

      <p className="mt-3 text-[9px] leading-relaxed text-stone-500">
        This producer paid for this clearly labelled placement. Payment does not change TerroirTrail verification, visitability, road/access facts, or organic producer ordering.
      </p>

      <button
        type="button"
        onClick={openProducer}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-amber-400/25 bg-amber-500 px-3 py-2.5 text-xs font-bold text-stone-950 transition hover:bg-amber-400 active:scale-[0.99]"
      >
        View producer
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </section>
  );
};

interface PartnerPlacementSlotProps {
  placement: PartnerPlacement;
  destination?: string | null;
  category?: string | null;
  excludedProducerIds?: string[];
  sourceSurface: PartnerSourceSurface;
  onOpenProducer: (producer: Producer) => void;
  className?: string;
}

export const PartnerPlacementSlot: React.FC<PartnerPlacementSlotProps> = ({
  placement,
  destination,
  category,
  excludedProducerIds = [],
  sourceSurface,
  onOpenProducer,
  className = '',
}) => {
  const [selection, setSelection] = useState<{
    campaign: ActivePartnerPlacement;
    producer: Producer;
  } | null>(null);
  const excludedKey = excludedProducerIds.join('|');

  useEffect(() => {
    let cancelled = false;
    setSelection(null);

    if (!destination) return () => { cancelled = true; };

    void (async () => {
      const campaigns = await fetchActivePartnerPlacements({
        placement,
        destination,
        category,
        limit: 5,
      });
      if (cancelled) return;

      const excluded = new Set(excludedKey ? excludedKey.split('|') : []);
      for (const campaign of campaigns) {
        if (excluded.has(campaign.producerId)) continue;
        const producer = await producerService.getProducerById(campaign.producerId);
        if (cancelled) return;
        if (producer && producer.destination === campaign.destination) {
          setSelection({ campaign, producer });
          return;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [placement, destination, category, excludedKey]);

  if (!selection) return null;

  return (
    <PartnerPlacementCard
      campaign={selection.campaign}
      producer={selection.producer}
      sourceSurface={sourceSurface}
      onOpenProducer={onOpenProducer}
      className={className}
    />
  );
};
