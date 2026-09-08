import React, { useState } from 'react';
import { Producer } from '../../types/terroir';
import { ProducerCard } from './ProducerCard';
import { ArrowUpDown, SearchX, Heart } from 'lucide-react';

interface ProducerListProps {
  producers: Producer[];
  selectedProducer: Producer | null;
  onSelectProducer: (producer: Producer) => void;
  onResetFilters: () => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
}

export const ProducerList: React.FC<ProducerListProps> = ({
  producers,
  selectedProducer,
  onSelectProducer,
  onResetFilters,
  isFavorite,
  onToggleFavorite,
}) => {
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'name'>('rating');

  const sortedProducers = [...producers].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="flex flex-col h-full bg-stone-950 border-r border-white/10 w-full lg:w-[380px] xl:w-[420px] shrink-0 overflow-hidden select-none">
      {/* List Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-stone-900/60 border-b border-white/10 shrink-0">
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-stone-300">
          {producers.length} {producers.length === 1 ? 'Location' : 'Artisanal Locations'}
        </span>

        <div className="flex items-center gap-1.5 text-xs text-stone-400 bg-stone-800/80 px-2.5 py-1 rounded-xl border border-white/5">
          <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent border-none text-stone-200 font-semibold text-xs focus:ring-0 cursor-pointer pr-1"
          >
            <option value="rating" className="bg-stone-900 text-white">Top Rated</option>
            <option value="reviews" className="bg-stone-900 text-white">Most Reviewed</option>
            <option value="name" className="bg-stone-900 text-white">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Cards Scrollable Feed */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 pb-24 lg:pb-4">
        {sortedProducers.length > 0 ? (
          sortedProducers.map((producer) => (
            <ProducerCard
              key={producer.id}
              producer={producer}
              isSelected={selectedProducer?.id === producer.id}
              onSelect={onSelectProducer}
              isFavorite={isFavorite(producer.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-stone-900 border border-white/10 flex items-center justify-center text-amber-400 mb-4 shadow-xl">
              <SearchX className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">No Makers Match Filters</h4>
            <p className="text-xs text-stone-400 max-w-xs mb-5">
              Try adjusting your category, road accessibility, or destination filters.
            </p>
            <button
              onClick={onResetFilters}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg transition"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
