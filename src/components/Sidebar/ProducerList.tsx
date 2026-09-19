import React from 'react';
import { Producer } from '../../types/terroir';
import { ProducerCard } from './ProducerCard';
import { SearchX } from 'lucide-react';

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
  const sortedProducers = [...producers].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex flex-col h-full bg-stone-950 border-r border-white/10 w-[330px] xl:w-[360px] shrink-0 overflow-hidden select-none">
      {/* List Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-stone-900/60 border-b border-white/10 shrink-0">
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-stone-300">
          {producers.length} {producers.length === 1 ? 'Location' : 'Artisanal Locations'}
        </span>
        <span className="text-[10px] sm:text-[11px] text-stone-500 font-semibold" aria-label="Producer list sorted alphabetically">
          A–Z
        </span>
      </div>

      {/* Cards Scrollable Feed */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2 pb-4">
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
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center" role="status">
            <div className="w-14 h-14 rounded-2xl bg-stone-900 border border-white/10 flex items-center justify-center text-amber-400 mb-4 shadow-xl">
              <SearchX className="w-7 h-7" aria-hidden="true" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">No Makers Match Filters</h4>
            <p className="text-xs text-stone-400 max-w-xs mb-5">
              Try adjusting your category, road accessibility, or destination filters.
            </p>
            <button
              type="button"
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
