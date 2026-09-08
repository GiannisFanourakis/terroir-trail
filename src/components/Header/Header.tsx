import React from 'react';
import { Region } from '../../types/terroir';
import { Compass, Search, MapPin, X } from 'lucide-react';

interface HeaderProps {
  selectedRegion: Region | 'all';
  onSelectRegion: (region: Region | 'all') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenLoops: () => void;
  totalFilteredCount: number;
  viewMode: 'map' | 'list';
  onToggleViewMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedRegion,
  onSelectRegion,
  searchQuery,
  onSearchChange,
  onOpenLoops,
  totalFilteredCount,
  viewMode,
  onToggleViewMode,
}) => {
  const regions: { id: Region | 'all'; label: string; greekLabel: string }[] = [
    { id: 'all', label: 'All Crete', greekLabel: 'Όλη η Κρήτη' },
    { id: 'chania', label: 'Chania', greekLabel: 'Χανιά' },
    { id: 'rethymno', label: 'Rethymno', greekLabel: 'Ρέθυμνο' },
    { id: 'heraklion', label: 'Heraklion', greekLabel: 'Ηράκλειο' },
    { id: 'lasithi', label: 'Lasithi', greekLabel: 'Λασίθι' },
  ];

  return (
    <header className="bg-stone-900 text-stone-100 border-b border-stone-800 shrink-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Brand Logo & Tagline */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shadow-inner">
                🍇
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <h1 className="font-serif-title text-xl sm:text-2xl font-bold tracking-tight text-stone-100">
                    Terroir<span className="text-amber-400 font-sans font-light">Trail</span>
                  </h1>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-medium border border-amber-400/30">
                    Crete
                  </span>
                </div>
                <p className="text-xs text-stone-400 hidden sm:block">
                  Curated Wineries, Rakokazana, Stone Mills & Mountain Mitata
                </p>
              </div>
            </div>

            {/* Mobile View Toggle & Loops CTA */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={onOpenLoops}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-500 text-stone-950 rounded-lg shadow hover:bg-amber-400 transition"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Loops</span>
              </button>
              <button
                onClick={onToggleViewMode}
                className="px-3 py-1.5 text-xs font-medium bg-stone-800 border border-stone-700 text-stone-200 rounded-lg hover:bg-stone-700 transition"
              >
                {viewMode === 'map' ? 'List View' : 'Map View'}
              </button>
            </div>
          </div>

          {/* Region Tabs & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            {/* Region Pills */}
            <div className="flex items-center bg-stone-950 p-1 rounded-xl border border-stone-800 overflow-x-auto text-xs scrollbar-none">
              {regions.map((r) => {
                const isActive = selectedRegion === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => onSelectRegion(r.id)}
                    className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all duration-150 ${
                      isActive
                        ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>

            {/* Live Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search Vidiano, Dafnes, olive mill..."
                className="w-full bg-stone-950 border border-stone-800 text-stone-200 text-xs rounded-xl pl-9 pr-8 py-2 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder:text-stone-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Desktop Curated Loops Button */}
            <button
              onClick={onOpenLoops}
              className="hidden md:flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 rounded-xl shadow-md transition transform active:scale-95"
            >
              <Compass className="w-4 h-4" />
              <span>Day-Trip Loops</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
