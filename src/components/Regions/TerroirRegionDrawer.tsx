import React from 'react';
import {
  Compass,
  ExternalLink,
  Landmark,
  MapPin,
  Mountain,
  Music2,
  Utensils,
  X,
} from 'lucide-react';
import type { TerroirRegion, TerroirRegionSection } from '../../data/terroirRegions';
import { trackIntent } from '../../services/intentAnalytics';
import { ContextualAffiliateSection } from '../Monetization/ContextualAffiliateSection';
import { PartnerPlacementSlot } from '../Monetization/PartnerPlacement';
import type { Producer } from '../../types/terroir';

interface TerroirRegionDrawerProps {
  region: TerroirRegion;
  producerCount: number;
  categoryCount: number;
  isOpen: boolean;
  hasExplorerPass?: boolean;
  onClose: () => void;
  onShowProducers: () => void;
  onOpenProducer: (producer: Producer) => void;
}

const sectionIcon = (section: TerroirRegionSection) => {
  switch (section.id) {
    case 'landscape':
      return Mountain;
    case 'history':
      return Landmark;
    case 'culture':
      return Music2;
    case 'food':
      return Utensils;
    case 'explore':
      return Compass;
    default:
      return MapPin;
  }
};

export const TerroirRegionDrawer: React.FC<TerroirRegionDrawerProps> = ({
  region,
  producerCount,
  categoryCount,
  isOpen,
  hasExplorerPass = false,
  onClose,
  onShowProducers,
  onOpenProducer,
}) => {
  if (!isOpen) return null;

  return (
    <aside
      className="absolute inset-y-0 right-0 z-40 w-[94%] sm:w-[430px] max-w-[430px] border-l border-white/10 bg-stone-950/78 backdrop-blur-2xl shadow-[-24px_0_60px_rgba(0,0,0,0.38)] animate-in slide-in-from-right duration-300"
      role="dialog"
      aria-modal="false"
      aria-label={`Explore ${region.name}`}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute bottom-20 -left-24 h-56 w-56 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <div className="relative h-full overflow-y-auto overscroll-contain">
        <header className="sticky top-0 z-10 border-b border-white/10 bg-stone-950/72 backdrop-blur-2xl px-5 pt-5 pb-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">
                {region.eyebrow}
              </div>
              <h2 className="mt-1 font-serif-title text-3xl font-bold leading-none text-white">
                Explore {region.name}
              </h2>
              <p className="mt-2 max-w-[34rem] text-xs leading-relaxed text-stone-300">
                {region.summary}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-xl border border-white/10 bg-white/5 p-2 text-stone-300 transition hover:bg-white/10 hover:text-white"
              aria-label={`Close ${region.name} guide`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 text-[10px] text-stone-300">
            <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 font-semibold text-amber-200">
              {producerCount} producer{producerCount === 1 ? '' : 's'}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
              {categoryCount} categor{categoryCount === 1 ? 'y' : 'ies'}
            </span>
          </div>
        </header>

        <div className="space-y-3 px-5 py-5 sm:px-6">
          {region.sections.map((section) => {
            const Icon = sectionIcon(section);
            return (
              <section
                key={section.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/10"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10">
                    <Icon className="h-4 w-4 text-amber-300" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-amber-400/90">
                      {section.eyebrow}
                    </div>
                    <h3 className="mt-0.5 text-sm font-bold leading-snug text-white">
                      {section.title}
                    </h3>
                  </div>
                </div>

                <p className="mt-3 text-[12px] leading-[1.65] text-stone-300">
                  {section.body}
                </p>

                {section.highlights && section.highlights.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {section.highlights.map((highlight) => (
                      <span
                        key={highlight}
                        className="rounded-lg border border-white/10 bg-black/15 px-2 py-1 text-[9px] font-medium text-stone-300"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                )}
              </section>
            );
          })}

          <PartnerPlacementSlot
            placement="region_discovery"
            destination={region.destination}
            sourceSurface="region_planning"
            onOpenProducer={onOpenProducer}
          />

          <section className="rounded-2xl border border-white/10 bg-black/15 p-4">
            <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-stone-500">
              Sources
            </div>
            <div className="mt-2 grid gap-1.5">
              {region.sources.map((source) => (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-3 rounded-xl px-2 py-1.5 text-[10px] text-stone-400 transition hover:bg-white/5 hover:text-stone-200"
                >
                  <span>{source.label}</span>
                  <ExternalLink className="h-3 w-3 shrink-0 opacity-60 transition group-hover:opacity-100" aria-hidden="true" />
                </a>
              ))}
            </div>
          </section>

          <ContextualAffiliateSection
            sourceSurface="region_planning"
            hasExplorerPass={hasExplorerPass}
            destination={region.destination}
            className="mt-4"
          />
        </div>

        <div className="sticky bottom-0 border-t border-white/10 bg-stone-950/76 px-5 py-4 backdrop-blur-2xl sm:px-6">
          <button
            type="button"
            onClick={() => {
              void trackIntent({
                event: 'region_producers_view',
                destination: region.destination,
                sourceSurface: 'region_drawer',
              });
              onShowProducers();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-3 text-xs font-bold text-stone-950 shadow-xl transition hover:bg-amber-400 active:scale-[0.99]"
          >
            <MapPin className="h-4 w-4" aria-hidden="true" />
            View {region.name} producers on the map
          </button>
        </div>
      </div>
    </aside>
  );
};
