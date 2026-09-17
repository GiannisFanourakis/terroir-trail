import React, { useState } from 'react';
import { Destination } from '../../types/terroir';
import { UserProfile } from '../../types/auth';
import { ProfileMenu } from '../Auth/ProfileMenu';
import { UserAvatar } from '../Common/UserAvatar';
import { Compass, Search, X, Heart, Building2, Calendar, Sparkles, BookOpen, Menu, Award, LogOut, User } from 'lucide-react';

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
  onOpenAuth: (role?: 'traveler' | 'producer') => void;
  onOpenPassport: () => void;
  onLogout: () => void;
  totalProducersCount: number;
  onOpenMyBookings?: () => void;
  onOpenProducerPortal?: () => void;
  onOpenAccountSettings?: () => void;
  bookingsCount?: number;
  onOpenExplorerPass?: () => void;
  onOpenDigitalPass?: () => void;
  onOpenAbout?: () => void;
  onOpenFaq?: () => void;
  onOpenLegal?: (tab?: 'privacy' | 'terms' | 'licenses') => void;
  isAdmin?: boolean;
  isPlatformOwner?: boolean;
  onOpenAdmin?: () => void;
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
  onOpenAccountSettings,
  bookingsCount = 0,
  onOpenExplorerPass,
  onOpenDigitalPass,
  onOpenAbout,
  onOpenFaq,
  onOpenLegal,
  isAdmin = false,
  isPlatformOwner = false,
  onOpenAdmin,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const isHost = Boolean(user?.producerIds?.length || user?.isProducer);

  const destinations: { id: Destination | 'all'; label: string; flag: string }[] = [
    { id: 'all', label: 'All Terroir', flag: '🍇' },
    { id: 'crete', label: 'Crete', flag: '🌿' },
    { id: 'santorini', label: 'Santorini', flag: '🌋' },
    { id: 'peloponnese', label: 'Peloponnese', flag: '🏛️' },
    { id: 'northern_greece', label: 'Macedonia, Greece', flag: '🏔️' },
    { id: 'tuscany', label: 'Tuscany', flag: '🇮🇹' },
  ];

  const profileMenu = (
    <ProfileMenu
      user={user}
      onOpenAuth={onOpenAuth}
      onOpenPassport={onOpenPassport}
      onOpenWishlist={onToggleFavoritesOnly}
      onLogout={onLogout}
      totalProducersCount={totalProducersCount}
      onOpenMyBookings={onOpenMyBookings}
      onOpenProducerPortal={onOpenProducerPortal}
      onOpenAccountSettings={onOpenAccountSettings}
      bookingsCount={bookingsCount}
      onOpenExplorerPass={onOpenExplorerPass}
      onOpenDigitalPass={onOpenDigitalPass}
      onOpenAbout={onOpenAbout}
      onOpenFaq={onOpenFaq}
      onOpenLegal={onOpenLegal}
      onOpenLoops={onOpenLoops}
      isAdmin={isAdmin}
      isPlatformOwner={isPlatformOwner}
      onOpenAdmin={onOpenAdmin}
    />
  );

  return (
    <>
      <header className="relative z-30 shrink-0 bg-stone-950 border-b border-white/10 px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 shadow-2xl w-full header-safe-top">
        <div className="w-full flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <button type="button" onClick={() => window.location.reload()} className="flex items-center gap-2.5 sm:gap-3 min-w-0 text-left bg-transparent border-none p-0 cursor-pointer group focus:outline-none select-none" title="Refresh TerroirTrail">
              <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center"><img src="/logo.png" alt="TerroirTrail Emblem" className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-105 duration-200" /></div>
              <div className="min-w-0">
                <h1 className="font-serif-title text-base sm:text-xl font-bold tracking-tight text-white flex items-center gap-1 shrink-0 group-hover:text-amber-200 transition-colors">Terroir<span className="text-amber-400 font-sans font-light">Trail</span></h1>
                <p className="text-[10px] text-stone-400 font-medium hidden md:block truncate group-hover:text-stone-300 transition-colors">Independent Producer &amp; Agritourism Guide</p>
              </div>
            </button>

            <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button onClick={onToggleFavoritesOnly} className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-bold rounded-xl border transition shrink-0 cursor-pointer ${favoritesOnly ? 'bg-rose-500 text-white border-rose-400 shadow-md' : 'bg-stone-900 hover:bg-stone-850 text-stone-300 border-white/10'}`} title="Saved spots">
                <Heart className={`w-3.5 h-3.5 shrink-0 ${favoritesOnly || savedCount > 0 ? 'fill-rose-400 text-rose-400' : 'text-stone-400'}`} /><span className="hidden sm:inline">Saved</span>{savedCount > 0 && <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono">{savedCount}</span>}
              </button>

              <button onClick={onOpenLoops} className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold bg-stone-900 hover:bg-stone-850 text-stone-300 hover:text-amber-300 border border-white/10 hover:border-amber-400/40 rounded-xl transition shrink-0 cursor-pointer shadow-sm" title="Discovery guides use verified stops; driving access is checked separately"><Compass className="w-3.5 h-3.5 text-amber-400 shrink-0" /><span>Discovery Guides</span></button>

              {onOpenAbout && <button onClick={onOpenAbout} className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold bg-stone-900 hover:bg-stone-850 text-stone-300 hover:text-white border border-white/10 hover:border-amber-400/40 rounded-xl transition shrink-0 cursor-pointer"><BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" /><span>About & FAQ</span></button>}

              {isHost ? (
                onOpenProducerPortal && <button onClick={onOpenProducerPortal} className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-stone-900 to-rose-500/10 hover:border-amber-400 text-amber-300 transition shrink-0 cursor-pointer shadow-sm"><Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" /><span className="truncate max-w-[130px]">{user?.producerName || 'Producer Host'}</span><span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-950 font-extrabold uppercase">Host</span></button>
              ) : (
                <button onClick={() => onOpenAuth('producer')} className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl border border-white/10 hover:border-amber-400/50 bg-stone-900 hover:bg-stone-850 text-stone-300 hover:text-amber-300 transition shrink-0 cursor-pointer"><Building2 className="w-3.5 h-3.5 text-amber-400/80 shrink-0" /><span>Host Portal</span></button>
              )}

              {profileMenu}
            </div>

            <div className="flex sm:hidden items-center gap-1.5 shrink-0">
              {profileMenu}
              <button onClick={onToggleFavoritesOnly} className={`flex items-center gap-1 px-2 py-1.5 text-xs font-bold rounded-xl border transition shrink-0 cursor-pointer ${favoritesOnly ? 'bg-rose-500 text-white border-rose-400 shadow-md' : 'bg-stone-900 text-stone-300 border-white/10'}`}><Heart className={`w-3.5 h-3.5 shrink-0 ${favoritesOnly || savedCount > 0 ? 'fill-rose-400 text-rose-400' : 'text-stone-400'}`} />{savedCount > 0 && <span className="text-[10px] font-mono text-rose-300">{savedCount}</span>}</button>
              <button onClick={() => setMenuOpen(true)} className="flex items-center justify-center w-9 h-9 rounded-xl bg-stone-900 border border-white/10 text-stone-300 hover:text-white hover:border-amber-400/40 transition cursor-pointer" title="Menu"><Menu className="w-4.5 h-4.5" /></button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
            <div className="flex items-center bg-stone-900/90 p-0.5 sm:p-1 rounded-xl border border-white/10 overflow-x-auto scrollbar-none shrink-0 max-w-[62%] sm:max-w-none">
              {destinations.map(destination => {
                const isActive = selectedDestination === destination.id;
                return <button key={destination.id} onClick={() => onSelectDestination(destination.id)} className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${isActive ? 'bg-amber-500 text-stone-950 shadow-md font-bold' : 'text-stone-400 hover:text-white hover:bg-white/5'}`}><span className="text-xs shrink-0">{destination.flag}</span><span>{destination.label}</span></button>;
              })}
            </div>

            <div className="relative flex-1 min-w-[120px] sm:min-w-[200px] max-w-sm sm:max-w-md shrink-0">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none shrink-0" />
              <input type="text" value={searchQuery} onChange={event => onSearchChange(event.target.value)} placeholder="Search maker, grape..." className="w-full bg-stone-900/90 border border-white/10 text-stone-100 text-xs rounded-xl pl-8 pr-7 py-1.5 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 placeholder:text-stone-500 transition" />
              {searchQuery && <button onClick={() => onSearchChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white cursor-pointer"><X className="w-3 h-3 shrink-0" /></button>}
            </div>
          </div>
        </div>
      </header>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm sm:hidden" onClick={closeMenu} />
          <div className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-stone-950 border-l border-white/10 shadow-2xl flex flex-col sm:hidden" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10"><span className="text-sm font-bold text-white">Menu</span><button onClick={closeMenu} className="w-8 h-8 flex items-center justify-center rounded-lg bg-stone-900 border border-white/10 text-stone-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button></div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {onOpenAbout && <button onClick={() => { onOpenAbout(); closeMenu(); }} className="flex items-center gap-3 w-full px-3 py-3 text-sm font-semibold text-stone-200 hover:text-white bg-stone-900 rounded-xl border border-white/10 cursor-pointer"><BookOpen className="w-4 h-4 text-amber-400" />About & FAQ</button>}

              {isHost ? (
                onOpenProducerPortal && <button onClick={() => { onOpenProducerPortal(); closeMenu(); }} className="flex items-center gap-3 w-full px-3 py-3 text-sm font-semibold text-amber-300 bg-amber-500/15 rounded-xl border border-amber-500/30 cursor-pointer"><Building2 className="w-4 h-4 text-amber-400" />Host Portal</button>
              ) : (
                <button onClick={() => { onOpenAuth('producer'); closeMenu(); }} className="flex items-center gap-3 w-full px-3 py-3 text-sm font-semibold text-amber-400 bg-amber-500/10 rounded-xl border border-amber-500/30 cursor-pointer"><Building2 className="w-4 h-4 text-amber-400" />Host Portal</button>
              )}

              <button onClick={() => { onOpenPassport(); closeMenu(); }} className="flex items-center gap-3 w-full px-3 py-3 text-sm font-semibold text-stone-200 bg-stone-900 rounded-xl border border-white/10 cursor-pointer"><Award className="w-4 h-4 text-amber-400" />Terroir Passport</button>
              <button onClick={() => { onOpenLoops(); closeMenu(); }} className="flex items-center gap-3 w-full px-3 py-3 text-sm font-semibold text-stone-200 bg-stone-900 rounded-xl border border-white/10 cursor-pointer"><Compass className="w-4 h-4 text-amber-400" />Discovery Guides</button>
              {onOpenExperiences && <button onClick={() => { onOpenExperiences(); closeMenu(); }} className="flex items-center gap-3 w-full px-3 py-3 text-sm font-semibold text-stone-200 bg-stone-900 rounded-xl border border-white/10 cursor-pointer"><Sparkles className="w-4 h-4 text-amber-400" />Curated Experiences</button>}

              {user ? (
                <div className="mt-2 p-3.5 rounded-2xl bg-stone-900/90 border border-white/10 flex flex-col gap-3">
                  <div className="flex items-center gap-3"><UserAvatar user={user} size="md" className="ring-2 ring-amber-500/50" /><div className="min-w-0 flex-1"><div className="font-bold text-white text-sm truncate">{user.name}</div><div className="text-[11px] text-stone-400 truncate">{user.email}</div></div></div>
                  {onOpenAccountSettings && <button onClick={() => { onOpenAccountSettings(); closeMenu(); }} className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-semibold text-sky-200 bg-sky-500/10 rounded-xl border border-sky-500/20 cursor-pointer">Account & privacy</button>}
                  {onOpenMyBookings && <button onClick={() => { onOpenMyBookings(); closeMenu(); }} className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-stone-200 bg-stone-950 rounded-xl border border-white/5 cursor-pointer"><span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-amber-400" />My Bookings</span>{bookingsCount > 0 && <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">{bookingsCount}</span>}</button>}
                  <button onClick={() => { onLogout(); closeMenu(); }} className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-bold text-rose-400 bg-rose-500/10 rounded-xl border border-rose-500/20 cursor-pointer"><LogOut className="w-3.5 h-3.5" />Sign Out</button>
                </div>
              ) : (
                <button onClick={() => { onOpenAuth('traveler'); closeMenu(); }} className="flex items-center justify-center gap-2 w-full mt-2 px-4 py-3 rounded-xl bg-amber-500 text-stone-950 font-bold text-sm cursor-pointer"><User className="w-4 h-4" />Sign In / Create Account</button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};
