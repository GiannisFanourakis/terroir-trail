import React, { useState, useEffect } from 'react';
import { Producer } from '../../types/terroir';
import { MapPin, Star, ArrowUpRight, Car, Heart, Crown } from 'lucide-react';
import { getCategoryFallbackImage } from '../../utils/imageFallbacks';

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
  const [imgSrc, setImgSrc] = useState<string>(producer.coverImage);

  useEffect(() => {
    setImgSrc(producer.coverImage);
  }, [producer.coverImage]);

  const handleImageError = () => {
    const fallback = getCategoryFallbackImage(producer.category);
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
    }
  };

  const getCategoryBadge = (cat: Producer['category']) => {
    switch (cat) {
      case 'winery':
        return { label: 'Winery', icon: '🍇', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
      case 'brewery':
        return { label: 'Microbrewery', icon: '🍺', bg: 'bg-amber-400/25 text-amber-300 border-amber-400/40' };
      case 'kazani':
        return { label: 'Rakokazano', icon: '🏺', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'olive_mill':
        return { label: 'Olive Mill', icon: '🫒', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'cheese_dairy':
        return { label: 'Shepherd Dairy', icon: '🧀', bg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' };
      case 'apiary':
        return { label: 'Honey & Herbs', icon: '🍯', bg: 'bg-orange-500/20 text-orange-300 border-orange-500/30' };
    }
  };

  const badge = getCategoryBadge(producer.category);

  return (
    <div
      onClick={() => onSelect(producer)}
      className={`group relative flex flex-col bg-stone-900/90 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
        isSelected
          ? 'border-amber-500 ring-2 ring-amber-500/40 shadow-2xl translate-y-[-2px]'
          : 'border-white/10 hover:border-amber-500/50 hover:shadow-xl hover:translate-y-[-1px]'
      }`}
    >
      {/* Cover Image */}
      <div className="relative h-40 w-full overflow-hidden bg-stone-950">
        <img
          src={imgSrc}
          alt={producer.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          decoding="async"
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-bold border backdrop-blur-md ${badge.bg}`}>
            <span>{badge.icon}</span>
            <span>{badge.label}</span>
          </span>
          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold border backdrop-blur-md bg-black/60 text-amber-300 border-amber-400/30">
            <Crown className="w-3 h-3 text-amber-400" />
            <span>VIP</span>
          </span>
        </div>

        {/* Top Right: Favorite Button & Rating */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(producer.id);
            }}
            className={`p-1.5 rounded-full backdrop-blur-md border transition ${
              isFavorite
                ? 'bg-rose-600 text-white border-rose-500 shadow-md scale-105'
                : 'bg-black/60 text-stone-300 hover:text-white border-white/10'
            }`}
            title={isFavorite ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white' : ''}`} />
          </button>
          <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md text-white px-2 py-1 rounded-full text-xs font-bold border border-white/10">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>{producer.rating}</span>
          </div>
        </div>

        {/* Bottom Location Overlay */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
          <div className="flex items-center gap-1.5 text-stone-300 text-xs font-medium">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">
              {producer.countryCode === 'IT' ? '🇮🇹 ' : ''}
              {producer.village}, {producer.region.toUpperCase()}
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-amber-300 bg-black/60 px-2 py-0.5 rounded border border-white/10">
            {producer.priceLevel}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col gap-2.5">
        <div>
          <h3 className="font-serif-title font-bold text-base text-white group-hover:text-amber-400 transition-colors line-clamp-1">
            {producer.name}
          </h3>
          <p className="text-[11px] text-stone-400 font-medium line-clamp-1">
            {producer.greekName}
          </p>
        </div>

        <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
          {producer.tagLine}
        </p>

        {/* Varieties & Ethos Tags */}
        <div className="flex flex-wrap items-center gap-1 pt-0.5">
          {producer.indigenousVarieties.slice(0, 3).map((v, i) => (
            <span
              key={i}
              className="text-[10px] px-2 py-0.5 rounded-lg bg-stone-800 text-stone-300 font-medium border border-white/5"
            >
              {v}
            </span>
          ))}
          {producer.ethos.includes('unpasteurized') && (
            <span className="text-[10px] px-2 py-0.5 rounded-lg bg-amber-400/20 text-amber-300 font-medium border border-amber-400/30">
              Fresh Draft
            </span>
          )}
          {producer.ethos.includes('organic') && (
            <span className="text-[10px] px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
              Bio
            </span>
          )}
          {producer.ethos.includes('amphora') && (
            <span className="text-[10px] px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30">
              Amphora
            </span>
          )}
        </div>

        {/* VIP Passholder Callout */}
        <div className="flex items-center gap-1.5 text-[10px] text-amber-300/90 font-medium pt-1">
          <Crown className="w-3 h-3 text-amber-400 shrink-0" />
          <span className="truncate">VIP Pass: Welcome pour · Free meze · 10% off</span>
        </div>

        {/* Card Footer */}
        <div className="flex items-center justify-between pt-2.5 border-t border-white/5 text-[11px]">
          <span className={`flex items-center gap-1 ${
            producer.roadAccess === 'paved'
              ? 'text-stone-400'
              : producer.roadAccess === 'gravel_ok'
              ? 'text-amber-400'
              : 'text-rose-400'
          }`}>
            <Car className="w-3 h-3" />
            {producer.roadAccess === 'paved' ? 'Paved Road' : producer.roadAccess === 'gravel_ok' ? 'Gravel OK' : '4x4 Required'}
          </span>

          <span className="text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
            <span>View Story</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
