import React from 'react';
import { Category, RoadAccess, Ethos, FoodOption, FilterState } from '../../types/terroir';
import { Wine, Flame, Sparkles, Filter, RotateCcw, Dog, Footprints, Caravan } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onResetFilters: () => void;
  totalFiltered: number;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalFiltered,
  totalCount,
}) => {
  const categories: { id: Category | 'all'; label: string; icon: string; badgeColor: string }[] = [
    { id: 'all', label: 'All Terroir', icon: '🏛️', badgeColor: 'bg-stone-100 text-stone-800' },
    { id: 'winery', label: 'Wineries', icon: '🍇', badgeColor: 'bg-rose-50 text-rose-800 border-rose-200' },
    { id: 'kazani', label: 'Rakokazana', icon: '🏺', badgeColor: 'bg-amber-50 text-amber-900 border-amber-200' },
    { id: 'olive_mill', label: 'Olive Mills', icon: '🫒', badgeColor: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
    { id: 'cheese_dairy', label: 'Shepherd Dairies', icon: '🧀', badgeColor: 'bg-yellow-50 text-yellow-900 border-yellow-200' },
    { id: 'apiary', label: 'Honey & Herbs', icon: '🍯', badgeColor: 'bg-orange-50 text-orange-900 border-orange-200' },
  ];

  const roadAccessOptions: { id: RoadAccess | 'all'; label: string }[] = [
    { id: 'all', label: 'All Roads' },
    { id: 'paved', label: '🚗 Paved Road Only' },
    { id: 'gravel_ok', label: '🚙 Gravel OK' },
    { id: '4x4_required', label: '⛰️ 4x4 Required' },
  ];

  const ethosOptions: { id: Ethos | 'all'; label: string }[] = [
    { id: 'all', label: 'All Ethos' },
    { id: 'organic', label: '🌿 Certified Organic' },
    { id: 'indigenous_only', label: '🧬 Indigenous Varieties' },
    { id: 'amphora', label: '🏺 Amphora Aging' },
    { id: 'wood_fired', label: '🪵 Wood-Fired Still' },
    { id: 'ancient_groves', label: '🌳 Ancient Groves' },
    { id: 'raw_milk', label: '🥛 Raw-Milk Tradition' },
  ];

  const foodOptions: { id: FoodOption | 'all'; label: string }[] = [
    { id: 'all', label: 'Any Food' },
    { id: 'full_taverna', label: '🍽️ Full Taverna On-Site' },
    { id: 'tasting_board', label: '🧀 Tasting Board' },
    { id: 'dakos_snacks', label: '🥖 Dakos & Bread' },
  ];

  const isFiltered =
    filters.category !== 'all' ||
    filters.region !== 'all' ||
    filters.roadAccess !== 'all' ||
    filters.ethos !== 'all' ||
    filters.foodOption !== 'all' ||
    filters.searchQuery !== '' ||
    filters.dogFriendlyOnly ||
    filters.walkInOnly ||
    filters.campervanOnly;

  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs px-4 sm:px-6 py-2.5 z-20 shrink-0">
      <div className="max-w-7xl mx-auto flex flex-col gap-2.5">
        
        {/* Top Category Tabs */}
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {categories.map((cat) => {
              const isSelected = filters.category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onFilterChange('category', cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 whitespace-nowrap ${
                    isSelected
                      ? 'bg-stone-900 text-amber-400 font-semibold shadow-sm ring-2 ring-stone-900 ring-offset-1'
                      : 'bg-stone-100/80 text-stone-700 hover:bg-stone-200/70 border border-stone-200/60'
                  }`}
                >
                  <span className="text-sm leading-none">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Counter & Clear Filters */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-medium text-stone-500 hidden lg:inline">
              Showing <strong className="text-stone-900">{totalFiltered}</strong> of {totalCount} artisans
            </span>
            {isFiltered && (
              <button
                onClick={onResetFilters}
                className="flex items-center gap-1 text-xs text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-full font-medium transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Secondary Sub-filters: Road, Ethos, Food & Quick Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Road Access Dropdown */}
            <div className="flex items-center">
              <select
                value={filters.roadAccess}
                onChange={(e) => onFilterChange('roadAccess', e.target.value as RoadAccess | 'all')}
                className="bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-stone-400 cursor-pointer"
              >
                {roadAccessOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Ethos Dropdown */}
            <div className="flex items-center">
              <select
                value={filters.ethos}
                onChange={(e) => onFilterChange('ethos', e.target.value as Ethos | 'all')}
                className="bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-stone-400 cursor-pointer"
              >
                {ethosOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Food Option Dropdown */}
            <div className="flex items-center">
              <select
                value={filters.foodOption}
                onChange={(e) => onFilterChange('foodOption', e.target.value as FoodOption | 'all')}
                className="bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-stone-400 cursor-pointer"
              >
                {foodOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Feature Toggles */}
            <div className="hidden sm:flex items-center gap-1.5 border-l border-stone-200 pl-2">
              <button
                onClick={() => onFilterChange('dogFriendlyOnly', !filters.dogFriendlyOnly)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition ${
                  filters.dogFriendlyOnly
                    ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <Dog className="w-3 h-3" />
                <span>Dog Friendly</span>
              </button>

              <button
                onClick={() => onFilterChange('walkInOnly', !filters.walkInOnly)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition ${
                  filters.walkInOnly
                    ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <Footprints className="w-3 h-3" />
                <span>Walk-in OK</span>
              </button>

              <button
                onClick={() => onFilterChange('campervanOnly', !filters.campervanOnly)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition ${
                  filters.campervanOnly
                    ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <Caravan className="w-3 h-3" />
                <span>Campervan</span>
              </button>
            </div>

          </div>

          <div className="text-[11px] text-stone-400 italic">
            Focusing on ancient & independent Cretan makers
          </div>
        </div>

      </div>
    </div>
  );
};
