import React, { useState } from 'react';
import { Producer } from '../../types/terroir';
import { ProducerCard } from './ProducerCard';
import { ArrowUpDown, SearchX } from 'lucide-react';

interface ProducerListProps {
  producers: Producer[];
  selectedProducer: Producer | null;
  onSelectProducer: (producer: Producer) => void;
  onResetFilters: () => void;
}

export const ProducerList: React.FC<ProducerListProps> = ({
  producers,
  selectedProducer,
  onSelectProducer,
  onResetFilters,
}) => {
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'name'>('rating');

  const sortedProducers = [...producers].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="flex flex-col h-full bg-stone-50/50 border-r border-stone-200 w-full sm:w-[360px] md:w-[400px] shrink-0 overflow-hidden">
      {/* Header bar with count and sort */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-stone-200 shrink-0">
        <span className="text-xs font-semibold text-stone-700">
          {producers.length} {producers.length === 1 ? 'Location' : 'Locations'} Found
        </span>

        <div className="flex items-center gap-1.5 text-xs text-stone-500">
          <ArrowUpDown className="w-3.5 h-3.5" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent border-none text-stone-800 font-medium text-xs focus:ring-0 cursor-pointer pr-1"
          >
            <option value="rating">Top Rated</option>
            <option value="reviews">Most Reviewed</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {sortedProducers.length > 0 ? (
          sortedProducers.map((producer) => (
            <ProducerCard
              key={producer.id}
              producer={producer}
              isSelected={selectedProducer?.id === producer.id}
              onSelect={onSelectProducer}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
              <SearchX className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-stone-800 mb-1">No Artisans Matched</h4>
            <p className="text-xs text-stone-500 max-w-xs mb-4">
              Try adjusting your category, road accessibility, or region filters.
            </p>
            <button
              onClick={onResetFilters}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-stone-950 font-semibold text-xs shadow hover:bg-amber-400 transition"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
