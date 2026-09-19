import React from 'react';
import { Producer } from '../../types/terroir';
import { ArrowUpRight, Car, Heart, MapPin } from 'lucide-react';
import { getEffectiveProducerCategory } from '../../utils/producerCategory';
import { ProducerCategoryIcon } from '../Common/ProducerCategoryIcon';

interface ProducerCardProps {
  producer: Producer;
  isSelected: boolean;
  onSelect: (producer: Producer) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

const getCategoryLabel = (producer: Producer): string => {
  switch (getEffectiveProducerCategory(producer)) {
    case 'winery':
      return 'Winery';
    case 'brewery':
      return 'Brewery';
    case 'distillery':
      return 'Distillery';
    case 'cidery':
      return 'Cidery';
    case 'confectionery':
      return 'Confectionery';
    case 'oil_mill':
      return 'Oil Mill';
    case 'herb_farm':
      return 'Herb Farm';
    case 'mushroom_farm':
      return 'Mushroom Farm';
    case 'olive_mill':
      return 'Olive Mill';
    case 'olive_oil_producer':
      return 'Olive Oil Producer';
    case 'cheese_dairy':
      return 'Dairy';
    case 'apiary':
      return 'Apiary / Honey';
    case 'farm':
      return 'Farm';
    default:
      return 'Producer';
  }
};

const getVisitLabel = (producer: Producer): string => {
  switch (producer.visitStatus) {
    case 'public_visits':
      return producer.walkInFriendly === true
        ? 'Walk-ins welcome'
        : 'Visitors welcome';
    case 'seasonal_public':
      return producer.bestSeason
        ? `Seasonal · ${producer.bestSeason}`
        : 'Seasonal visits';
    case 'appointment_only':
      return 'By appointment';
    case 'current_access_uncertain':
      return 'Access uncertain';
    case 'not_publicly_confirmed':
      return 'Visits unconfirmed';
    default:
      return 'Visit status unreviewed';
  }
};

const getRoadLabel = (producer: Producer): string | null => {
  if (producer.roadAccessStatus !== 'verified' || !producer.roadAccess) {
    return null;
  }

  switch (producer.roadAccess) {
    case 'paved':
      return 'Paved';
    case 'narrow_paved':
      return 'Narrow paved';
    case 'gravel_ok':
      return 'Gravel';
    case 'unpaved_passable':
      return 'Unpaved';
    case 'high_clearance_recommended':
      return 'High-clearance';
    case '4x4_required':
      return '4x4 required';
  }
};

export const ProducerCard: React.FC<ProducerCardProps> = ({
  producer,
  isSelected,
  onSelect,
  isFavorite,
  onToggleFavorite,
}) => {
  const categoryLabel = getCategoryLabel(producer);
  const visitLabel = getVisitLabel(producer);
  const roadLabel = getRoadLabel(producer);

  const selectProducer = () => onSelect(producer);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open ${producer.name}`}
      onClick={selectProducer}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectProducer();
        }
      }}
      className={`group rounded-xl border px-3 py-2.5 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
        isSelected
          ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-950/20'
          : 'border-white/10 bg-stone-900/75 hover:border-amber-500/45 hover:bg-stone-900'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-stone-950/70 text-amber-400">
          <ProducerCategoryIcon
            category={getEffectiveProducerCategory(producer)}
            className="h-4 w-4"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-amber-400">
                <span className="shrink-0">{categoryLabel}</span>
                <span className="text-stone-600" aria-hidden="true">·</span>
                <span className="truncate text-stone-500">
                  {producer.village || producer.region}
                </span>
              </div>
              <h3 className="mt-0.5 truncate font-serif-title text-sm font-bold text-white group-hover:text-amber-300">
                {producer.name}
              </h3>
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onToggleFavorite(producer.id);
              }}
              className={`shrink-0 rounded-full p-1.5 transition ${
                isFavorite
                  ? 'text-rose-400 bg-rose-500/10'
                  : 'text-stone-500 hover:bg-white/5 hover:text-white'
              }`}
              title={isFavorite ? 'Remove from saved places' : 'Save place'}
              aria-label={
                isFavorite
                  ? `Remove ${producer.name} from saved places`
                  : `Save ${producer.name}`
              }
            >
              <Heart
                className={`h-3.5 w-3.5 ${isFavorite ? 'fill-current' : ''}`}
                aria-hidden="true"
              />
            </button>
          </div>

          {producer.tagLine && (
            <p className="mt-1 line-clamp-1 text-[11px] leading-relaxed text-stone-400">
              {producer.tagLine}
            </p>
          )}

          <div className="mt-2 flex items-center gap-2 border-t border-white/5 pt-2 text-[10px]">
            <span className="min-w-0 truncate font-medium text-emerald-400">
              {visitLabel}
            </span>

            {roadLabel ? (
              <span className="flex min-w-0 items-center gap-1 truncate text-stone-500">
                <Car className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span className="truncate">{roadLabel}</span>
              </span>
            ) : (
              <span className="flex min-w-0 items-center gap-1 truncate text-stone-600">
                <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span className="truncate">Access not classified</span>
              </span>
            )}

            <span className="ml-auto flex shrink-0 items-center gap-0.5 font-bold text-amber-400">
              <span>Story</span>
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
