import React, { useRef, useState } from 'react';
import { Category, RoadAccess, FilterState } from '../../types/terroir';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import { ProducerCategoryIcon } from '../Common/ProducerCategoryIcon';

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
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState<boolean>(false);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState<boolean>(false);
  const mobilePanelSwipeStart = useRef<{ x: number; y: number; canDismiss: boolean } | null>(null);

  const handleMobilePanelTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;

    mobilePanelSwipeStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      canDismiss: event.currentTarget.scrollTop <= 0,
    };
  };

  const handleMobilePanelTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = mobilePanelSwipeStart.current;
    const touch = event.changedTouches[0];
    mobilePanelSwipeStart.current = null;
    if (!start?.canDismiss || !touch) return;

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    if (deltaY > 72 && Math.abs(deltaY) > Math.abs(deltaX) * 1.25) {
      setIsMobilePanelOpen(false);
    }
  };

  const categories: { id: Category | 'all'; label: string; activeColor: string }[] = [
    { id: 'all', label: 'All Terroir', activeColor: 'bg-amber-500 text-stone-950 shadow-amber-500/20' },
    { id: 'winery', label: 'Wineries', activeColor: 'bg-rose-500 text-white shadow-rose-500/30' },
    { id: 'brewery', label: 'Microbreweries', activeColor: 'bg-amber-400 text-stone-950 shadow-amber-400/30' },
    { id: 'distillery', label: 'Distilleries', activeColor: 'bg-amber-600 text-white shadow-amber-600/30' },
    { id: 'cidery', label: 'Cideries', activeColor: 'bg-lime-600 text-white shadow-lime-600/30' },
    { id: 'olive_mill', label: 'Olive Mills', activeColor: 'bg-emerald-600 text-white shadow-emerald-600/30' },
    { id: 'olive_oil_producer', label: 'Olive Oil Producers', activeColor: 'bg-emerald-500 text-stone-950 shadow-emerald-500/30' },
    { id: 'oil_mill', label: 'Other Oil Mills', activeColor: 'bg-yellow-600 text-white shadow-yellow-600/30' },
    { id: 'cheese_dairy', label: 'Shepherd Dairies', activeColor: 'bg-yellow-500 text-stone-950 shadow-yellow-500/30' },
    { id: 'apiary', label: 'Apiaries & Honey', activeColor: 'bg-orange-500 text-white shadow-orange-500/30' },
    { id: 'confectionery', label: 'Confectioners', activeColor: 'bg-amber-700 text-white shadow-amber-700/30' },
    { id: 'herb_farm', label: 'Herb Farms', activeColor: 'bg-green-600 text-white shadow-green-600/30' },
    { id: 'mushroom_farm', label: 'Mushroom Farms', activeColor: 'bg-stone-600 text-white shadow-stone-600/30' },
    { id: 'farm', label: 'Farms', activeColor: 'bg-emerald-500 text-stone-950 shadow-emerald-500/30' },
  ];

  const roadAccessOptions: { id: RoadAccess | 'all'; label: string }[] = [
    { id: 'all', label: 'All Verified Road Types' },
    { id: 'paved', label: 'Standard Paved' },
    { id: 'narrow_paved', label: 'Narrow Paved' },
    { id: 'gravel_ok', label: 'Passable Gravel' },
    { id: 'unpaved_passable', label: 'Passable Unpaved / Dirt' },
    { id: 'high_clearance_recommended', label: 'High Clearance Recommended' },
    { id: '4x4_required', label: '4x4 Required' },
  ];


  const activeSecondaryCount = [
    filters.roadAccess !== 'all',
  ].filter(Boolean).length;

  const activeCategory = categories.find((cat) => cat.id === filters.category) || categories[0];
  const totalActiveFilterCount = (filters.category !== 'all' ? 1 : 0) + activeSecondaryCount;

  const isFiltered =
    filters.category !== 'all' ||
    filters.destination !== 'all' ||
    activeSecondaryCount > 0 ||
    filters.searchQuery !== '' ||
    filters.favoritesOnly;

  return (
    <div className="relative z-20 shrink-0 bg-stone-900/95 backdrop-blur-xl border-b border-white/10 px-3 sm:px-6 lg:px-8 py-2 shadow-md w-full">
      <div className="w-full flex flex-col gap-1.5">

        {/* Mobile View (< sm): Progressive disclosure with compact trigger */}
        <div className="flex sm:hidden items-center justify-between gap-2 w-full">
          <button
            type="button"
            onClick={() => setIsMobilePanelOpen((prev) => !prev)}
            aria-expanded={isMobilePanelOpen}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer min-h-[44px] flex-1 min-w-0 ${
              isMobilePanelOpen || totalActiveFilterCount > 0
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                : 'bg-stone-800/90 text-stone-200 border-white/10 hover:text-white'
            }`}
            title="Open categories and filters"
          >
            <ProducerCategoryIcon category={activeCategory.id} className="w-4 h-4" />
            <span className="truncate font-medium">
              {filters.category !== 'all' ? activeCategory.label : 'Categories & Filters'}
            </span>
            {totalActiveFilterCount > 0 && (
              <span className="ml-auto w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-bold text-[10px] flex items-center justify-center shrink-0">
                {totalActiveFilterCount}
              </span>
            )}
            <SlidersHorizontal
              className={`w-3.5 h-3.5 shrink-0 ml-1 transition-transform duration-200 ${
                isMobilePanelOpen ? 'rotate-90 text-amber-300' : 'text-stone-400'
              }`}
            />
          </button>

          {isFiltered && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/30 px-3 py-2 rounded-xl font-medium transition shrink-0 cursor-pointer min-h-[44px]"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Mobile Expandable Panel */}
        {isMobilePanelOpen && (
          <div
            className="flex sm:hidden flex-col gap-3 max-h-[calc(100dvh-10rem)] min-h-0 overflow-y-auto overscroll-contain touch-pan-y mobile-scroll pt-2.5 pb-2 pr-1 border-t border-white/10 text-xs animate-in fade-in slide-in-from-top-2 duration-200"
            onTouchStart={handleMobilePanelTouchStart}
            onTouchEnd={handleMobilePanelTouchEnd}
          >
            {/* Category choices */}
            <div>
              <div className="flex items-center justify-between mb-1.5 px-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Select Category
                </span>
                <span className="text-[11px] text-amber-400 font-semibold">
                  {totalFiltered} of {totalCount} makers
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {categories.map((cat) => {
                  const isSelected = filters.category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => { onFilterChange('category', cat.id); setIsMobilePanelOpen(false); }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer min-h-[44px] text-left ${
                        isSelected
                          ? `${cat.activeColor} ring-2 ring-white/20 font-bold shadow-md`
                          : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700/80 border border-white/5'
                      }`}
                    >
                      <ProducerCategoryIcon category={cat.id} className="w-4 h-4" />
                      <span className="truncate">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Secondary filters */}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-0.5">
                Access Filter
              </span>

              <div className="grid grid-cols-1 gap-2">
                <select
                  value={filters.roadAccess}
                  onChange={(e) => { onFilterChange('roadAccess', e.target.value as RoadAccess | 'all'); setIsMobilePanelOpen(false); }}
                  className="bg-stone-800 border border-white/10 text-stone-200 text-xs rounded-xl px-3 py-2 min-h-[44px] focus:outline-none focus:border-amber-400 cursor-pointer w-full"
                >
                  {roadAccessOptions.map((opt) => (
                    <option key={opt.id} value={opt.id} className="bg-stone-900 text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsMobilePanelOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition cursor-pointer min-h-[44px] flex items-center justify-center"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop View (sm: and up): Rich category chip strip */}
        <div className="hidden sm:flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none min-w-0 flex-1 py-0.5">
            {categories.map((cat) => {
              const isSelected = filters.category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onFilterChange('category', cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap shadow-sm shrink-0 cursor-pointer min-h-[44px] lg:min-h-[32px] lg:py-1.5 ${
                    isSelected
                      ? `${cat.activeColor} shadow-lg scale-105 ring-2 ring-white/20 font-bold`
                      : 'bg-stone-800/80 text-stone-300 hover:text-white hover:bg-stone-700/80 border border-white/5'
                  }`}
                >
                  <ProducerCategoryIcon category={cat.id} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 pl-1.5 border-l border-white/10">
            <span className="text-[11px] font-semibold text-stone-400 hidden xl:inline">
              <span className="text-amber-400 font-bold">{totalFiltered}</span> of {totalCount} makers
            </span>

            <button
              onClick={() => setIsMoreFiltersOpen((prev) => !prev)}
              className={`flex items-center gap-1 text-[11px] sm:text-xs px-3 py-2 sm:px-2.5 sm:py-1 rounded-full font-medium border transition shrink-0 cursor-pointer min-h-[44px] lg:min-h-[32px] ${
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
                className="flex items-center gap-1 text-[11px] sm:text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-3 py-2 sm:px-2.5 sm:py-1 rounded-full font-medium transition shrink-0 cursor-pointer min-h-[44px] sm:min-h-[32px]"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3 shrink-0" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Desktop Secondary Filters Panel */}
        <div className={`hidden sm:${isMoreFiltersOpen ? 'flex' : 'hidden lg:flex'} flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-white/5 text-xs animate-in fade-in duration-200`}>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filters.roadAccess}
              onChange={(e) => onFilterChange('roadAccess', e.target.value as RoadAccess | 'all')}
              className="bg-stone-800 border border-white/10 text-stone-200 text-xs rounded-xl px-3 py-2 sm:py-1 min-h-[44px] sm:min-h-[32px] focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {roadAccessOptions.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-stone-900 text-white">{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="text-[11px] text-stone-400 hidden md:block">
            Unknown access stays unknown until independently verified
          </div>
        </div>
      </div>
    </div>
  );
};
