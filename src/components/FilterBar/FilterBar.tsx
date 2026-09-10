import React, { useState } from 'react';
import { Category, RoadAccess, Ethos, FoodOption, FilterState } from '../../types/terroir';
import { RotateCcw, Dog, Footprints, Caravan, SlidersHorizontal, Compass } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onResetFilters: () => void;
  totalFiltered: number;
  totalCount: number;
  onOpenLoops?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalFiltered,
  totalCount,
  onOpenLoops,
}) => {
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState<boolean>(false);

  const categories: { id: Category | 'all'; label: string; icon: string; activeColor: string }[] = [
    { id: 'all', label: 'All Terroir', icon: '🏛️', activeColor: 'bg-amber-500 text-stone-950 shadow-amber-500/20' },
    { id: 'winery', label: 'Wineries', icon: '🍇', activeColor: 'bg-rose-500 text-white shadow-rose-500/30' },
    { id: 'brewery', label: 'Microbreweries', icon: '🍺', activeColor: 'bg-amber-400 text-stone-950 shadow-amber-400/30' },
    { id: 'kazani', label: 'Rakokazana', icon: '🏺', activeColor: 'bg-amber-600 text-white shadow-amber-600/30' },
    { id: 'olive_mill', label: 'Olive Mills', icon: '🫒', activeColor: 'bg-emerald-600 text-white shadow-emerald-600/30' },
    { id: 'cheese_dairy', label: 'Shepherd Dairies', icon: '🧀', activeColor: 'bg-yellow-500 text-stone-950 shadow-yellow-500/30' },
    { id: 'apiary', label: 'Honey & Herbs', icon: '🍯', activeColor: 'bg-orange-500 text-white shadow-orange-500/30' },
  ];

  const roadAccessOptions: { id: RoadAccess | 'all'; label: string }[] = [
    { id: 'all', label: 'All Road Types' },
    { id: 'paved', label: '🚗 Paved Road Only' },
    { id: 'gravel_ok', label: '🚙 Gravel Road OK' },
    { id: '4x4_required', label: '⛰️ 4x4 Required' },
  ];

  const ethosOptions: { id: Ethos | 'all'; label: string }[] = [
    { id: 'all', label: 'All Ethos' },
    { id: 'unpasteurized', label: '🍺 Unpasteurized Craft Beer' },
    { id: 'organic', label: '🌿 Certified Organic' },
    { id: 'indigenous_only', label: '🧬 Indigenous Varieties' },
    { id: 'amphora', label: '🏺 Amphora Fermentation' },
    { id: 'wood_fired', label: '🪵 Wood-Fired Still' },
    { id: 'ancient_groves', label: '🌳 Ancient Groves' },
    { id: 'raw_milk', label: '🥛 Raw-Milk Tradition' },
  ];

  const foodOptions: { id: FoodOption | 'all'; label: string }[] = [
    { id: 'all', label: 'Any Dining' },
    { id: 'brewery_taproom', label: '🍻 Brewery Taproom & Meze' },
    { id: 'full_taverna', label: '🍽️ Full Taverna On-Site' },
    { id: 'tasting_board', label: '🧀 Tasting Board' },
    { id: 'dakos_snacks', label: '🥖 Dakos & Bread' },
  ];

  const activeSecondaryCount = [
    filters.roadAccess !== 'all',
    filters.ethos !== 'all',
    filters.foodOption !== 'all',
    filters.dogFriendlyOnly,
    filters.walkInOnly,
    filters.campervanOnly,
  ].filter(Boolean).length;

  const isFiltered =
    filters.category !== 'all' ||
    filters.destination !== 'all' ||
    activeSecondaryCount > 0 ||
    filters.searchQuery !== '' ||
    filters.favoritesOnly;

  return (
    <div className="relative z-20 shrink-0 bg-stone-900/95 backdrop-blur-xl border-b border-white/10 px-3 sm:px-6 lg:px-8 py-2 shadow-md w-full">
      <div className="w-full flex flex-col gap-1.5">
        
        {/* Top Category Buttons & Pinned Action Controls */}
        <div className="flex items-center justify-between gap-2">
          {/* Scrollable Categories List */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none min-w-0 flex-1 py-0.5">
            {categories.map((cat) => {
              const isSelected = filters.category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onFilterChange('category', cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition-all duration-200 whitespace-nowrap shadow-sm shrink-0 cursor-pointer ${
                    isSelected
                      ? `${cat.activeColor} shadow-lg scale-105 ring-2 ring-white/20 font-bold`
                      : 'bg-stone-800/80 text-stone-300 hover:text-white hover:bg-stone-700/80 border border-white/5'
                  }`}
                >
                  <span className="text-xs sm:text-sm leading-none shrink-0">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Actions: Always Pinned & Visible, Never Scrolled Away! */}
          <div className="flex items-center gap-1.5 shrink-0 pl-1.5 border-l border-white/10">
            <span className="text-[11px] font-semibold text-stone-400 hidden xl:inline">
              <span className="text-amber-400 font-bold">{totalFiltered}</span> of {totalCount} makers
            </span>

            {/* Curated Routes */}
            {onOpenLoops && (
              <button
                type="button"
                onClick={onOpenLoops}
                className="flex items-center gap-1.5 text-[11px] sm:text-xs px-2.5 py-1 rounded-full font-bold border border-amber-500/40 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent hover:border-amber-400 text-amber-300 hover:text-white transition shrink-0 cursor-pointer shadow-sm active:scale-95"
                title="Curated driving routes with turn-by-turn navigation"
              >
                <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Routes</span>
              </button>
            )}

            {/* Filter Toggle Button */}
            <button
              onClick={() => setIsMoreFiltersOpen((prev) => !prev)}
              className={`flex items-center gap-1 text-[11px] sm:text-xs px-2.5 py-1 rounded-full font-medium border transition shrink-0 cursor-pointer ${
                isMoreFiltersOpen || activeSecondaryCount > 0
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-stone-800 text-stone-400 hover:text-white border-white/10'
              }`}
              title="More filter options"
            >
              <SlidersHorizontal className="w-3 h-3 shrink-0" />
              <span>Filters</span>
              {activeSecondaryCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 font-bold text-[9px] flex items-center justify-center shrink-0">
                  {activeSecondaryCount}
                </span>
              )}
            </button>

            {isFiltered && (
              <button
                onClick={onResetFilters}
                className="flex items-center gap-1 text-[11px] sm:text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-2.5 py-1 rounded-full font-medium transition shrink-0 cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3 shrink-0" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Secondary Sub-filters (Collapsible on smaller screens) */}
        <div className={`${isMoreFiltersOpen ? 'flex' : 'hidden lg:flex'} flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-white/5 text-xs animate-in fade-in duration-200`}>
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Road Access Dropdown */}
            <select
              value={filters.roadAccess}
              onChange={(e) => onFilterChange('roadAccess', e.target.value as RoadAccess | 'all')}
              className="bg-stone-800 border border-white/10 text-stone-200 text-xs rounded-xl px-3 py-1 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {roadAccessOptions.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-stone-900 text-white">{opt.label}</option>
              ))}
            </select>

            {/* Ethos Dropdown */}
            <select
              value={filters.ethos}
              onChange={(e) => onFilterChange('ethos', e.target.value as Ethos | 'all')}
              className="bg-stone-800 border border-white/10 text-stone-200 text-xs rounded-xl px-3 py-1 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {ethosOptions.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-stone-900 text-white">{opt.label}</option>
              ))}
            </select>

            {/* Food Option Dropdown */}
            <select
              value={filters.foodOption}
              onChange={(e) => onFilterChange('foodOption', e.target.value as FoodOption | 'all')}
              className="bg-stone-800 border border-white/10 text-stone-200 text-xs rounded-xl px-3 py-1 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {foodOptions.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-stone-900 text-white">{opt.label}</option>
              ))}
            </select>

            {/* Quick Feature Toggles */}
            <div className="hidden sm:flex items-center gap-1.5 border-l border-white/10 pl-2">
              <button
                onClick={() => onFilterChange('dogFriendlyOnly', !filters.dogFriendlyOnly)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition text-xs shrink-0 cursor-pointer ${
                  filters.dogFriendlyOnly
                    ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold'
                    : 'bg-stone-800 text-stone-400 border-white/10 hover:text-white'
                }`}
              >
                <Dog className="w-3 h-3 shrink-0" />
                <span>Dog Friendly</span>
              </button>

              <button
                onClick={() => onFilterChange('walkInOnly', !filters.walkInOnly)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition text-xs shrink-0 cursor-pointer ${
                  filters.walkInOnly
                    ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold'
                    : 'bg-stone-800 text-stone-400 border-white/10 hover:text-white'
                }`}
              >
                <Footprints className="w-3 h-3 shrink-0" />
                <span>Walk-in</span>
              </button>

              <button
                onClick={() => onFilterChange('campervanOnly', !filters.campervanOnly)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition text-xs shrink-0 cursor-pointer ${
                  filters.campervanOnly
                    ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold'
                    : 'bg-stone-800 text-stone-400 border-white/10 hover:text-white'
                }`}
              >
                <Caravan className="w-3 h-3 shrink-0" />
                <span>Campervan</span>
              </button>
            </div>

          </div>

          <div className="text-[11px] text-stone-400 hidden md:block">
            Unfiltered Craft Beers · Ancient Vineyards · Family Olive Groves
          </div>
        </div>

      </div>
    </div>
  );
};
