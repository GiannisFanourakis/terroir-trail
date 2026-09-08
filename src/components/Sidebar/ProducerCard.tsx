import React from 'react';
import { Producer } from '../../types/terroir';
import { MapPin, Star, Sparkles, Navigation, Check } from 'lucide-react';

interface ProducerCardProps {
  producer: Producer;
  isSelected: boolean;
  onSelect: (producer: Producer) => void;
}

export const ProducerCard: React.FC<ProducerCardProps> = ({
  producer,
  isSelected,
  onSelect,
}) => {
  const getCategoryBadge = (cat: Producer['category']) => {
    switch (cat) {
      case 'winery':
        return { label: 'Winery', icon: '🍇', bg: 'bg-rose-50 text-rose-800 border-rose-200' };
      case 'kazani':
        return { label: 'Rakokazano', icon: '🏺', bg: 'bg-amber-50 text-amber-900 border-amber-200' };
      case 'olive_mill':
        return { label: 'Olive Mill', icon: '🫒', bg: 'bg-emerald-50 text-emerald-900 border-emerald-200' };
      case 'cheese_dairy':
        return { label: 'Shepherd Dairy', icon: '🧀', bg: 'bg-yellow-50 text-yellow-900 border-yellow-200' };
      case 'apiary':
        return { label: 'Honey & Herbs', icon: '🍯', bg: 'bg-orange-50 text-orange-900 border-orange-200' };
    }
  };

  const getRoadBadge = (access: Producer['roadAccess']) => {
    switch (access) {
      case 'paved':
        return { text: 'Paved Road', color: 'text-stone-500' };
      case 'gravel_ok':
        return { text: 'Gravel Road', color: 'text-amber-700 font-medium' };
      case '4x4_required':
        return { text: '4x4 Required', color: 'text-rose-700 font-medium' };
    }
  };

  const badge = getCategoryBadge(producer.category);
  const road = getRoadBadge(producer.roadAccess);

  return (
    <div
      onClick={() => onSelect(producer)}
      className={`group relative flex flex-col bg-white rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
        isSelected
          ? 'border-amber-500 ring-2 ring-amber-500/30 shadow-lg translate-y-[-2px]'
          : 'border-stone-200 hover:border-stone-300 hover:shadow-md'
      }`}
    >
      {/* Card Header Image */}
      <div className="relative h-36 w-full overflow-hidden bg-stone-100">
        <img
          src={producer.coverImage}
          alt={producer.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className={`flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-semibold border backdrop-blur-md shadow-xs ${badge.bg}`}>
            <span>{badge.icon}</span>
            <span>{badge.label}</span>
          </span>
        </div>

        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-xs font-semibold">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span>{producer.rating}</span>
          <span className="text-stone-400 text-[10px]">({producer.reviewCount})</span>
        </div>

        {/* Bottom overlay text */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-end justify-between">
          <div className="flex items-center gap-1 text-stone-200 text-xs font-medium">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{producer.village}, {producer.region.toUpperCase()}</span>
          </div>
          <span className="text-xs font-mono font-bold text-amber-300 bg-black/50 px-1.5 py-0.5 rounded">
            {producer.priceLevel}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3.5 flex flex-col gap-2">
        <div>
          <div className="flex items-baseline justify-between gap-1">
            <h3 className="font-serif-title font-bold text-base text-stone-900 group-hover:text-amber-800 transition line-clamp-1">
              {producer.name}
            </h3>
          </div>
          <p className="text-[11px] text-stone-400 font-medium line-clamp-1">
            {producer.greekName}
          </p>
        </div>

        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
          {producer.tagLine}
        </p>

        {/* Varieties & Tags */}
        <div className="flex flex-wrap items-center gap-1 pt-1">
          {producer.indigenousVarieties.slice(0, 3).map((v, i) => (
            <span
              key={i}
              className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium"
            >
              {v}
            </span>
          ))}
          {producer.ethos.includes('organic') && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-medium border border-emerald-200">
              Bio
            </span>
          )}
          {producer.ethos.includes('amphora') && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 font-medium border border-amber-200">
              Amphora
            </span>
          )}
        </div>

        {/* Footer info: road access and walk-in */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px] text-stone-500">
          <span className={road.color}>{road.text}</span>
          <span className="text-amber-600 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
            Explore Story →
          </span>
        </div>
      </div>
    </div>
  );
};
