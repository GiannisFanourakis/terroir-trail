import React, { useState, useEffect, useRef } from 'react';
import { Producer } from '../../types/terroir';
import { MapPin, ArrowUpRight, Car, Heart } from 'lucide-react';
import { getCategoryFallbackImage } from '../../utils/imageFallbacks';
import { getEffectiveProducerCategory } from '../../utils/producerCategory';
import { resolveProducerCover } from '../../utils/producerMediaResolver';
import { GooglePlacePhotoCarousel } from '../GooglePlaces/GooglePlacePhotoCarousel';
import { isGooglePlacesEligible } from '../../config/googlePlacesAllowlist';
import { runtimeConfig } from '../../config/runtimeConfig';
import { ProducerCategoryIcon } from '../Common/ProducerCategoryIcon';

interface ProducerCardProps {
  producer: Producer;
  isSelected: boolean;
  onSelect: (producer: Producer) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export const ProducerCard: React.FC<ProducerCardProps> = ({
  producer,
  isSelected,
  onSelect,
  isFavorite,
  onToggleFavorite,
}) => {
  const resolvedCover = resolveProducerCover(producer);

  const hasTrustedLocalPhoto =
    resolvedCover.source === 'host_upload' ||
    resolvedCover.source === 'curated_estate';

  const canUseGoogleMedia =
    !hasTrustedLocalPhoto &&
    runtimeConfig.googlePlacesMedia.enabled &&
    Boolean(producer.googlePlaceId?.trim()) &&
    isGooglePlacesEligible(producer);

  const [imgSrc, setImgSrc] = useState<string>(resolvedCover.url);
  const mediaHostRef = useRef<HTMLDivElement>(null);
  const [shouldLoadGoogleMedia, setShouldLoadGoogleMedia] = useState(false);

  useEffect(() => {
    setImgSrc(resolvedCover.url);
  }, [resolvedCover.url]);

  useEffect(() => {
    if (!canUseGoogleMedia) {
      setShouldLoadGoogleMedia(false);
      return;
    }

    const element = mediaHostRef.current;
    if (!element) return;

    if (typeof IntersectionObserver === 'undefined') {
      setShouldLoadGoogleMedia(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadGoogleMedia(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '300px 0px',
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [canUseGoogleMedia, producer.id]);

  const handleImageError = () => {
    const fallback = getCategoryFallbackImage(
      getEffectiveProducerCategory(producer)
    );
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
    }
  };

  const getCategoryBadge = (p: Producer) => {
    switch (getEffectiveProducerCategory(p)) {
      case 'winery':
        return {
          label: 'Winery',
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        };
      case 'brewery':
        return {
          label: 'Brewery',
          bg: 'bg-amber-400/25 text-amber-300 border-amber-400/40',
        };
      case 'distillery':
        return {
          label: 'Distillery',
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        };
      case 'cidery':
        return {
          label: 'Cidery',
          bg: 'bg-lime-500/20 text-lime-300 border-lime-500/30',
        };
      case 'confectionery':
        return {
          label: 'Confectionery Producer',
          bg: 'bg-amber-700/20 text-amber-200 border-amber-700/30',
        };
      case 'oil_mill':
        return {
          label: 'Oil Mill',
          bg: 'bg-yellow-600/20 text-yellow-300 border-yellow-600/30',
        };
      case 'herb_farm':
        return {
          label: 'Herb Farm',
          bg: 'bg-green-600/20 text-green-300 border-green-600/30',
        };
      case 'mushroom_farm':
        return {
          label: 'Mushroom Farm',
          bg: 'bg-stone-600/20 text-stone-300 border-stone-600/30',
        };
      case 'olive_mill':
        return {
          label: 'Olive Mill',
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        };
      case 'olive_oil_producer':
        return {
          label: 'Olive Oil Producer',
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        };
      case 'cheese_dairy':
        return {
          label: 'Dairy',
          bg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        };
      case 'apiary':
        return {
          label: 'Apiary / Honey',
          bg: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
        };
      case 'farm':
        return {
          label: 'Farm',
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        };
      default:
        return {
          label: 'Producer',
          bg: 'bg-stone-500/20 text-stone-300 border-white/10',
        };
    }
  };

  const getVisitBadge = (p: Producer) => {
    switch (p.visitStatus) {
      case 'public_visits':
        return {
          label:
            p.walkInFriendly === true ? 'Walk-ins welcome' : 'Visitors welcome',
          className: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
        };
      case 'seasonal_public':
        return {
          label: p.bestSeason
            ? `Seasonal (${p.bestSeason})`
            : 'Seasonal visits',
          className: 'text-amber-300 bg-amber-500/10 border-amber-500/25',
        };
      case 'appointment_only':
        return {
          label: 'By appointment',
          className: 'text-amber-300 bg-amber-500/10 border-amber-500/25',
        };
      case 'not_publicly_confirmed':
        return {
          label: 'Visits unconfirmed',
          className: 'text-stone-400 bg-stone-500/10 border-white/10',
        };
      case 'current_access_uncertain':
        return {
          label: 'Access uncertain',
          className: 'text-orange-400 bg-orange-500/10 border-orange-500/25',
        };
      case 'unreviewed':
      default:
        return {
          label: 'Visit status unreviewed',
          className: 'text-stone-400 bg-stone-500/10 border-white/10',
        };
    }
  };

  const getRoadBadge = (p: Producer) => {
    if (p.roadAccessStatus !== 'verified' || !p.roadAccess) return null;

    switch (p.roadAccess) {
      case 'paved':
        return { label: 'Paved road', className: 'text-stone-400' };
      case 'narrow_paved':
        return { label: 'Narrow paved road', className: 'text-amber-400' };
      case 'gravel_ok':
        return { label: 'Gravel access', className: 'text-amber-400' };
      case 'unpaved_passable':
        return { label: 'Unpaved access', className: 'text-amber-400' };
      case 'high_clearance_recommended':
        return {
          label: 'High-clearance recommended',
          className: 'text-orange-400',
        };
      case '4x4_required':
        return { label: '4x4 required', className: 'text-rose-400' };
    }
  };

  const badge = getCategoryBadge(producer);
  const visitBadge = getVisitBadge(producer);
  const roadBadge = getRoadBadge(producer);

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
      className={`group relative flex flex-col bg-stone-900/90 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
        isSelected
          ? 'border-amber-500 ring-2 ring-amber-500/40 shadow-2xl translate-y-[-2px]'
          : 'border-white/10 hover:border-amber-500/50 hover:shadow-xl hover:translate-y-[-1px]'
      }`}
    >
      <div
        ref={mediaHostRef}
        className="relative h-40 w-full overflow-hidden bg-stone-950"
      >
        {canUseGoogleMedia && shouldLoadGoogleMedia ? (
          <GooglePlacePhotoCarousel
            producer={producer}
            className="w-full h-full"
            imageClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            fallbackUrl={imgSrc}
            fallbackAlt={producer.name}
            maxPhotos={5}
            autoPlay
            intervalMs={6200}
            showControls={false}
            showCounter={false}
            showDots={false}
            showAttribution
            pauseOnHover={false}
          />
        ) : (
          <img
            src={imgSrc}
            alt={producer.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            decoding="async"
            onError={handleImageError}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent pointer-events-none" />

        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
          <span
            className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-bold border backdrop-blur-md ${badge.bg}`}
          >
            <ProducerCategoryIcon
              category={getEffectiveProducerCategory(producer)}
              className="w-3.5 h-3.5"
            />
            <span>{badge.label}</span>
          </span>
          {producer.publicPointType === 'producer_shop' && (
            <span className="text-[10px] px-2 py-1 rounded-full font-semibold border backdrop-blur-md bg-sky-500/15 text-sky-200 border-sky-400/30">
              Public point: Producer Shop
            </span>
          )}
        </div>

        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(producer.id);
            }}
            className={`p-1.5 rounded-full backdrop-blur-md border transition ${
              isFavorite
                ? 'bg-rose-600 text-white border-rose-500 shadow-md scale-105'
                : 'bg-black/60 text-stone-300 hover:text-white border-white/10'
            }`}
            title={isFavorite ? 'Remove from saved places' : 'Save place'}
            aria-label={
              isFavorite
                ? `Remove ${producer.name} from saved places`
                : `Save ${producer.name}`
            }
          >
            <Heart
              className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white' : ''}`}
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="absolute bottom-8 left-3 right-3 flex items-end justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 text-stone-300 text-xs font-medium min-w-0">
            <MapPin
              className="w-3.5 h-3.5 text-amber-400 shrink-0"
              aria-hidden="true"
            />
            <span className="truncate">
              {producer.countryCode === 'IT' ? '🇮🇹 ' : ''}
              {producer.village}, {producer.region.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2.5">
        <div>
          <h3 className="font-serif-title font-bold text-base text-white group-hover:text-amber-400 transition-colors line-clamp-1">
            {producer.name}
          </h3>
          {producer.greekName && producer.greekName !== producer.name && (
            <p className="text-[11px] text-stone-400 font-medium line-clamp-1">
              {producer.greekName}
            </p>
          )}
        </div>

        {producer.tagLine && (
          <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
            {producer.tagLine}
          </p>
        )}

        <div className="flex items-center gap-1.5 pt-0.5">
          <span
            className={`text-[10px] px-2.5 py-0.5 rounded-md font-medium border ${visitBadge.className}`}
          >
            {visitBadge.label}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2.5 border-t border-white/5 text-[11px] gap-2">
          {roadBadge ? (
            <span
              className={`flex items-center gap-1 min-w-0 ${roadBadge.className}`}
            >
              <Car className="w-3 h-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{roadBadge.label}</span>
            </span>
          ) : (
            <span className="text-stone-500">Access not classified</span>
          )}

          <span className="text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 shrink-0">
            <span>View Story</span>
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </div>
  );
};
