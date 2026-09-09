import React from 'react';
import { Destination } from '../../types/terroir';
import { UserProfile } from '../../types/auth';
import { ProfileMenu } from '../Auth/ProfileMenu';
import { Compass, Search, X, Heart, Building2, Calendar, Crown, Package, Sparkles } from 'lucide-react';

interface HeaderProps {
  selectedDestination: Destination | 'all';
  onSelectDestination: (dest: Destination | 'all') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenLoops: () => void;
  onOpenExperiences?: () => void;
  totalFilteredCount: number;
  viewMode: 'map' | 'list';
  onToggleViewMode: () => void;
  savedCount: number;
  favoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onOpenPassport: () => void;
  onLogout: () => void;
  totalProducersCount: number;
  onOpenMyBookings?: () => void;
  onOpenProducerPortal?: () => void;
  bookingsCount?: number;
  onOpenExplorerPass?: () => void;
  onOpenWineBoxes?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDestination,
  onSelectDestination,
  searchQuery,
  onSearchChange,
  onOpenLoops,
  onOpenExperiences,
  totalFilteredCount,
  viewMode,
  onToggleViewMode,
  savedCount,
  favoritesOnly,
  onToggleFavoritesOnly,
  user,
  onOpenAuth,
  onOpenPassport,
  onLogout,
  totalProducersCount,
  onOpenMyBookings,
  onOpenProducerPortal,
  bookingsCount = 0,
  onOpenExplorerPass,
  onOpenWineBoxes,
}) => {
  const destinations: { id: Destination | 'all'; label: string; flag: string }[] = [
    { id: 'all', label: 'All Terroir', flag: '🍇' },
    { id: 'crete', label: 'Crete', flag: '🌿' },
    { id: 'santorini', label: 'Santorini', flag: '🌋' },
    { id: 'peloponnese', label: 'Peloponnese', flag: '🏛️' },
    { id: 'northern_greece', label: 'N. Greece', flag: '🏔️' },
    { id: 'tuscany', label: 'Tuscany', flag: '🇮🇹' },
  ];

  return (
    <header className="relative z-30 shrink-0 bg-stone-950 border-b border-white/10 px-3 sm:px-6 py-2 sm:py-2.5 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col gap-2">
        
        {/* Row 1: Brand & Top Action Center (Always Visible, Never Scrolled Away) */}
        <div className="flex items-center justify-between gap-2">
          
          {/* Brand & Subtitle */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-600 to-amber-700 flex items-center justify-center text-lg sm:text-xl shadow-lg shadow-amber-500/20 ring-1 ring-white/20 shrink-0">
              🍇
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-serif-title text-base sm:text-xl font-bold tracking-tight text-white flex items-center gap-1 shrink-0">
                  Terroir<span className="text-amber-400 font-sans font-light">Trail</span>
                </h1>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-400 font-bold border border-amber-400/30 shrink-0">
                  Greece
                </span>
              </div>
              <p className="text-[10px] text-stone-400 font-medium hidden md:block truncate">
                Curated Wineries, Craft Breweries, Rakokazana & Mountain Dairies
              </p>
            </div>
          </div>

          {/* Right Action Bar (Saved, Circuits, VIP status, Host, Wine & Clear Login) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Saved / Wishlist */}
            <button
              onClick={onToggleFavoritesOnly}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-bold rounded-xl border transition shrink-0 cursor-pointer ${
                favoritesOnly
                  ? 'bg-rose-500 text-white border-rose-400 shadow-md'
                  : 'bg-stone-900 hover:bg-stone-850 text-stone-300 border-white/10'
              }`}
              title="Saved spots"
            >
              <Heart className={`w-3.5 h-3.5 shrink-0 ${favoritesOnly || savedCount > 0 ? 'fill-rose-400 text-rose-400' : 'text-stone-400'}`} />
              <span className="hidden sm:inline">Saved</span>
              {savedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Day-Trip Loops / Circuits */}
            <button
              onClick={onOpenLoops}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl shadow-md transition transform active:scale-95 shrink-0 cursor-pointer"
              title="Day-Trip Circuits"
            >
              <Compass className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Circuits</span>
            </button>

            {/* 135+ Curated Terroir Experiences */}
            {onOpenExperiences && (
              <button
                onClick={onOpenExperiences}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold bg-stone-900 hover:bg-stone-850 text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-400/50 rounded-xl shadow-sm transition transform active:scale-95 shrink-0 cursor-pointer"
                title="Explore 135+ Curated Terroir & Tasting Experiences"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Experiences</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                  135+
                </span>
              </button>
            )}

            {/* Freemium Plan Status & VIP Upgrade (sm and up) */}
            {onOpenExplorerPass && (
              <button
                onClick={onOpenExplorerPass}
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl border transition shrink-0 cursor-pointer ${
                  user?.hasExplorerPass
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/40 shadow-sm'
                    : 'bg-stone-900 hover:bg-stone-850 text-stone-300 hover:text-white border-amber-500/30'
                }`}
                title={user?.hasExplorerPass ? 'VIP Pass Active' : 'Free Plan · Upgrade to VIP (€19.99)'}
              >
                <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                {user?.hasExplorerPass ? (
                  <span className="flex items-center gap-1 font-bold text-amber-300">
                    <span>VIP</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px]">
                    <span className="hidden md:inline text-stone-400 font-medium">Free</span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                      VIP Pass
                    </span>
                  </span>
                )}
              </button>
            )}

            {/* Host Portal (lg and up) */}
            {onOpenProducerPortal && (
              <button
                onClick={onOpenProducerPortal}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl border border-white/10 hover:border-emerald-400/50 bg-stone-900 hover:bg-stone-850 text-stone-300 hover:text-emerald-300 transition shrink-0 cursor-pointer"
                title="Winery & Brewery Host Portal"
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Host Portal</span>
              </button>
            )}

            {/* Wine Delivery (xl and up) */}
            {onOpenWineBoxes && (
              <button
                onClick={onOpenWineBoxes}
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl border border-rose-500/30 hover:border-rose-400 bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 transition shrink-0 cursor-pointer"
                title="International Wine Delivery (EU/UK/US)"
              >
                <Package className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Wine Boxes</span>
              </button>
            )}

            {/* Primary Profile / Log In Button (ALWAYS Pinned Right & Prominently Visible) */}
            <ProfileMenu
              user={user}
              onOpenAuth={onOpenAuth}
              onOpenPassport={onOpenPassport}
              onOpenWishlist={onToggleFavoritesOnly}
              onLogout={onLogout}
              totalProducersCount={totalProducersCount}
              onOpenMyBookings={onOpenMyBookings}
              onOpenProducerPortal={onOpenProducerPortal}
              bookingsCount={bookingsCount}
              onOpenExplorerPass={onOpenExplorerPass}
              onOpenWineBoxes={onOpenWineBoxes}
            />
          </div>
        </div>

        {/* Row 2: Destination Switcher & Search Bar */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
          {/* Destination Selector */}
          <div className="flex items-center bg-stone-900/90 p-0.5 sm:p-1 rounded-xl border border-white/10 overflow-x-auto scrollbar-none shrink-0 max-w-[62%] sm:max-w-none">
            {destinations.map((d) => {
              const isActive = selectedDestination === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => onSelectDestination(d.id)}
                  className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                      : 'text-stone-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-xs shrink-0">{d.flag}</span>
                  <span>{d.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[120px] sm:min-w-[200px] max-w-sm shrink-0">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none shrink-0" />
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
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white cursor-pointer"
                title="Clear search"
              >
                <X className="w-3 h-3 shrink-0" />
              </button>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
