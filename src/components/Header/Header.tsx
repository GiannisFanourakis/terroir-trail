import React from 'react';
import { Region } from '../../types/terroir';
import { Compass, Search, MapPin, X, Layers, Sparkles } from 'lucide-react';

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
    <header className="relative z-30 shrink-0 bg-stone-950 border-b border-white/10 px-4 sm:px-6 py-3 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Brand & Identity */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-xl shadow-lg shadow-amber-500/20 ring-1 ring-white/20">
              🍇
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif-title text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-1">
                  Terroir<span className="text-amber-400 font-sans font-normal">Trail</span>
                </h1>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 font-bold border border-amber-400/20">
                  Crete
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-medium hidden sm:block">
                The Curated Map for Ancient Vineyards, Rakokazana & High-Mountain Mitata
              </p>
            </div>
          </div>

          {/* Mobile Buttons */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenLoops}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-amber-500 text-stone-950 rounded-xl shadow-md"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Loops</span>
            </button>
            <button
              onClick={onToggleViewMode}
              className="px-3 py-1.5 text-xs font-semibold bg-stone-900 border border-white/10 text-stone-200 rounded-xl"
            >
              {viewMode === 'map' ? 'List' : 'Map'}
            </button>
          </div>
        </div>

        {/* Center: Prefecture Region Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          <div className="flex items-center bg-stone-900/90 p-1 rounded-2xl border border-white/10 overflow-x-auto scrollbar-none">
            {regions.map((r) => {
              const isActive = selectedRegion === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => onSelectRegion(r.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                      : 'text-stone-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[210px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search Vidiano, Dafnes, olive mill..."
              className="w-full bg-stone-900/90 border border-white/10 text-stone-100 text-xs rounded-2xl pl-9 pr-8 py-2 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 placeholder:text-stone-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Curated Day Loops CTA */}
          <button
            onClick={onOpenLoops}
            className="hidden md:flex items-center gap-2 px-4 py-2 text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 rounded-2xl shadow-lg shadow-amber-500/20 transition transform active:scale-95 shrink-0"
          >
            <Compass className="w-4 h-4" />
            <span>Day-Trip Loops</span>
          </button>
        </div>

      </div>
    </header>
  );
};
