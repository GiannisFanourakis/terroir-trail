import React from 'react';
import { Destination } from '../../types/terroir';
import { Compass, Search, X, Heart } from 'lucide-react';

interface HeaderProps {
  selectedDestination: Destination | 'all';
  onSelectDestination: (dest: Destination | 'all') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenLoops: () => void;
  totalFilteredCount: number;
  viewMode: 'map' | 'list';
  onToggleViewMode: () => void;
  savedCount: number;
  favoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDestination,
  onSelectDestination,
  searchQuery,
  onSearchChange,
  onOpenLoops,
  totalFilteredCount,
  viewMode,
  onToggleViewMode,
  savedCount,
  favoritesOnly,
  onToggleFavoritesOnly,
}) => {
  const destinations: { id: Destination | 'all'; label: string; flag: string }[] = [
    { id: 'all', label: 'All Terroir', flag: '🇬🇷' },
    { id: 'crete', label: 'Crete', flag: '🌿' },
    { id: 'santorini', label: 'Santorini', flag: '🌋' },
    { id: 'peloponnese', label: 'Peloponnese', flag: '🏛️' },
    { id: 'northern_greece', label: 'N. Greece', flag: '🏔️' },
  ];

  return (
    <header className="relative z-30 shrink-0 bg-stone-950 border-b border-white/10 px-3 sm:px-6 py-2 sm:py-2.5 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-3">
        
        {/* Brand & Subtitle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-600 to-amber-700 flex items-center justify-center text-lg sm:text-xl shadow-lg shadow-amber-500/20 ring-1 ring-white/20 shrink-0">
              🍇
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-serif-title text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1">
                  Terroir<span className="text-amber-400 font-sans font-light">Trail</span>
                </h1>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-400 font-bold border border-amber-400/30">
                  Greece
                </span>
              </div>
              <p className="text-[10px] text-stone-400 font-medium hidden lg:block">
                Curated Wineries, Craft Breweries, Rakokazana & Mountain Dairies
              </p>
            </div>
          </div>

          {/* Small Screen Quick Buttons */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={onToggleFavoritesOnly}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-xl border transition ${
                favoritesOnly
                  ? 'bg-rose-500 text-white border-rose-400 shadow-md'
                  : 'bg-stone-900 text-stone-300 border-white/10'
              }`}
              title="Saved spots"
            >
              <Heart className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-white' : 'text-rose-400'}`} />
              <span>{savedCount}</span>
            </button>
            <button
              onClick={onOpenLoops}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-amber-500 text-stone-950 rounded-xl shadow-md"
              title="Day-Trip Circuits"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Circuits</span>
            </button>
          </div>
        </div>

        {/* Center/Right: Destination Switcher & Search */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
          {/* Destination Selector */}
          <div className="flex items-center bg-stone-900/90 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border border-white/10 overflow-x-auto scrollbar-none shrink-0">
            {destinations.map((d) => {
              const isActive = selectedDestination === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => onSelectDestination(d.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                      : 'text-stone-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-xs">{d.flag}</span>
                  <span>{d.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[150px] sm:min-w-[190px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search maker, grape..."
              className="w-full bg-stone-900/90 border border-white/10 text-stone-100 text-xs rounded-xl pl-8 pr-7 py-1.5 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 placeholder:text-stone-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Saved / Wishlist Button (Desktop) */}
          <button
            onClick={onToggleFavoritesOnly}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all shrink-0 ${
              favoritesOnly
                ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/30'
                : 'bg-stone-900 hover:bg-stone-850 text-stone-300 hover:text-white border-white/10'
            }`}
            title="Show saved spots"
          >
            <Heart className={`w-3.5 h-3.5 ${favoritesOnly || savedCount > 0 ? 'text-rose-400 fill-rose-400' : 'text-stone-400'}`} />
            <span>Saved</span>
            {savedCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono">
                {savedCount}
              </span>
            )}
          </button>

          {/* Curated Day Loops CTA (Desktop) */}
          <button
            onClick={onOpenLoops}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 rounded-xl shadow-lg shadow-amber-500/20 transition transform active:scale-95 shrink-0"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Circuits</span>
          </button>
        </div>

      </div>
    </header>
  );
};
