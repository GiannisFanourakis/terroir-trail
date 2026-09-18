import React, { useRef, useState } from 'react';
import { Destination } from '../../types/terroir';
import { UserProfile } from '../../types/auth';
import { ProfileMenu } from '../Auth/ProfileMenu';
import { UserAvatar } from '../Common/UserAvatar';
import { Compass, Search, X, Heart, Building2, Calendar, Sparkles, BookOpen, Menu, Award, LogOut, User, ChevronDown, Download, Share2, Plus, Smartphone } from 'lucide-react';
import {
  COUNTRY_LAYERS,
  CountryScope,
  getActiveCountryScope,
  getDestinationCountry,
  setActiveCountryScope,
} from '../../config/geography';
import { usePwaInstall } from '../../hooks/usePwaInstall';

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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [destMenuOpen, setDestMenuOpen] = useState(false);
  const [installHelpOpen, setInstallHelpOpen] = useState(false);
  const {
    canInstall,
    isIos,
    isIosSafari,
    requestInstall,
  } = usePwaInstall();
  const menuSwipeStart = useRef<{ x: number; y: number } | null>(null);
  const closeMenu = () => setMenuOpen(false);

  const handleInstallApp = async () => {
    closeMenu();
    const result = await requestInstall();

    if (result === 'ios-instructions') {
      setInstallHelpOpen(true);
    }
  };

  const handleMenuTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;
    menuSwipeStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleMenuTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = menuSwipeStart.current;
    const touch = event.changedTouches[0];
    menuSwipeStart.current = null;
    if (!start || !touch) return;

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    if (deltaX > 72 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25) {
      closeMenu();
    }
  };
  const isHost = Boolean(user?.producerIds?.length || user?.isProducer);

  const destinations: { id: Destination; label: string }[] = [
    // Greece
    { id: 'crete', label: 'Crete' },
    { id: 'santorini', label: 'Santorini' },
    { id: 'peloponnese', label: 'Peloponnese' },
    { id: 'thessaly', label: 'Thessaly' },
    { id: 'northern_greece', label: 'Macedonia, Greece' },
    // Italy
    { id: 'tuscany', label: 'Tuscany' },
    { id: 'piedmont', label: 'Piedmont' },
    { id: 'puglia', label: 'Puglia' },
    { id: 'sicily', label: 'Sicily' },
    { id: 'south_tyrol', label: 'South Tyrol' },
    // France
    { id: 'provence', label: "Provence-Alpes-Côte d'Azur" },
    // Spain
    { id: 'catalonia', label: 'Catalonia' },
    // Portugal
    { id: 'alentejo', label: 'Alentejo' },
    // Croatia
    { id: 'istria', label: 'Istria' },
    // Slovenia
    { id: 'pomurska', label: 'Pomurska' },
    { id: 'southeast_slovenia', label: 'Southeast Slovenia' },
    { id: 'central_slovenia', label: 'Central Slovenia' },
    { id: 'goriska', label: 'Goriška' },
    // Norway
    { id: 'trondelag', label: 'Trøndelag' },
    { id: 'more_og_romsdal', label: 'Møre og Romsdal' },
    { id: 'buskerud', label: 'Buskerud' },
    { id: 'vestland', label: 'Vestland' },
  ];

  const countryScope: CountryScope = selectedDestination === 'all'
    ? getActiveCountryScope()
    : getDestinationCountry(selectedDestination);

  const visibleDestinations = countryScope === 'all'
    ? []
    : destinations.filter((destination) => getDestinationCountry(destination.id) === countryScope);
  const activeCountry = COUNTRY_LAYERS.find((country) => country.id === countryScope) || COUNTRY_LAYERS[0];
  const activeDestObj = selectedDestination === 'all'
    ? activeCountry
    : destinations.find((destination) => destination.id === selectedDestination) || activeCountry;

  const selectCountry = (country: CountryScope) => {
    setActiveCountryScope(country);
    onSelectDestination('all');
  };

  const selectDestination = (destination: Destination) => {
    const country = getDestinationCountry(destination);
    setActiveCountryScope(country);
    onSelectDestination(destination);
  };

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
        {/* Mobile View: Progressive Disclosure */}
        {mobileSearchOpen ? (
          <div className="flex sm:hidden items-center gap-2 w-full py-0.5 animate-in fade-in duration-150">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search maker, grape, village..."
                className="w-full bg-stone-900 border border-amber-400/50 text-stone-100 text-base sm:text-xs rounded-xl pl-9 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-amber-400/30 min-h-[44px]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-white cursor-pointer"
                  aria-label="Clear search query"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => { setMobileSearchOpen(false); }}
              className="px-3 py-2 text-xs font-semibold text-stone-300 hover:text-white rounded-xl bg-stone-900 border border-white/10 min-h-[44px] shrink-0 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex sm:hidden items-center justify-between gap-1.5 w-full py-0.5">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 min-w-0 text-left bg-transparent border-none p-0 cursor-pointer group focus:outline-none select-none shrink-0"
              title="Refresh TerroirTrail"
            >
              <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="TerroirTrail Emblem"
                  className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                />
              </div>
              <h1 className="font-serif-title text-sm font-bold tracking-tight text-white flex items-center gap-0.5 shrink-0">
                Terroir<span className="text-amber-400 font-sans font-light">Trail</span>
              </h1>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setDestMenuOpen((prev) => !prev)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-900 border border-white/10 text-stone-200 text-xs font-semibold hover:border-amber-400/40 min-h-[44px] cursor-pointer"
                aria-label="Select geography"
                aria-expanded={destMenuOpen}
              >                <span className="font-bold text-amber-300 max-w-[92px] truncate">{activeDestObj.label}</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              </button>
              {destMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs" onClick={() => setDestMenuOpen(false)} />
                  <div className="absolute left-0 top-full mt-1.5 z-50 bg-stone-950 border border-white/15 rounded-2xl p-1.5 shadow-2xl flex flex-col gap-1 min-w-[220px] max-h-[calc(100dvh-5.5rem)] overflow-y-auto overscroll-contain touch-pan-y mobile-scroll backdrop-blur-xl">
                    <div className="px-2 pt-1 pb-0.5 text-[9px] uppercase tracking-[0.18em] font-bold text-stone-500">Country</div>
                    {COUNTRY_LAYERS.map((country) => (
                      <button
                        key={country.id}
                        type="button"
                        onClick={() => {
                          selectCountry(country.id);
                          if (country.id === 'all') setDestMenuOpen(false);
                        }}
                        className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-xl text-left min-h-[44px] cursor-pointer transition ${
                          selectedDestination === 'all' && countryScope === country.id
                            ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                            : 'text-stone-300 hover:text-white hover:bg-white/10'
                        }`}
                      >                        <span>{country.label}</span>
                      </button>
                    ))}

                    {visibleDestinations.length > 0 && (
                      <>
                        <div className="mx-2 my-1 h-px bg-white/10" />
                        <div className="px-2 pt-0.5 pb-0.5 text-[9px] uppercase tracking-[0.18em] font-bold text-stone-500">Terroir regions</div>
                        {visibleDestinations.map((destination) => (
                          <button
                            key={destination.id}
                            type="button"
                            onClick={() => {
                              selectDestination(destination.id);
                              setDestMenuOpen(false);
                            }}
                            className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-xl text-left min-h-[44px] cursor-pointer transition ${
                              selectedDestination === destination.id
                                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                                : 'text-stone-300 hover:text-white hover:bg-white/10'
                            }`}
                          >                            <span>{destination.label}</span>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setMobileSearchOpen(true)}
                className={`w-11 h-11 flex items-center justify-center rounded-xl border transition cursor-pointer min-h-[44px] min-w-[44px] ${
                  searchQuery
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-stone-900 text-stone-300 border-white/10 hover:text-white'
                }`}
                title="Search"
                aria-label="Search"
              >
                <Search className="w-4 h-4 text-amber-400" />
              </button>

              <button
                type="button"
                onClick={onToggleFavoritesOnly}
                className={`flex items-center justify-center gap-1 px-2.5 h-11 rounded-xl border transition shrink-0 cursor-pointer min-h-[44px] min-w-[44px] ${
                  favoritesOnly
                    ? 'bg-rose-500 text-white border-rose-400 shadow-md'
                    : 'bg-stone-900 text-stone-300 border-white/10'
                }`}
                aria-label="Saved places"
              >
                <Heart
                  className={`w-4 h-4 shrink-0 ${
                    favoritesOnly || savedCount > 0 ? 'fill-rose-400 text-rose-400' : 'text-stone-400'
                  }`}
                />
                {savedCount > 0 && <span className="text-[10px] font-mono text-rose-300">{savedCount}</span>}
              </button>

              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="flex items-center justify-center w-11 h-11 rounded-xl bg-stone-900 border border-white/10 text-stone-300 hover:text-white hover:border-amber-400/40 transition cursor-pointer min-h-[44px] min-w-[44px]"
                title="Menu"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Desktop View (sm: and above) */}
        <div className="hidden sm:flex flex-col gap-2 w-full">
          <div className="flex items-center justify-between gap-2">
            <button type="button" onClick={() => window.location.reload()} className="flex items-center gap-2.5 sm:gap-3 min-w-0 text-left bg-transparent border-none p-0 cursor-pointer group focus:outline-none select-none" title="Refresh TerroirTrail">
              <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center"><img src="/logo.png" alt="TerroirTrail Emblem" className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-105 duration-200" /></div>
              <div className="min-w-0">
                <h1 className="font-serif-title text-base sm:text-xl font-bold tracking-tight text-white flex items-center gap-1 shrink-0 group-hover:text-amber-200 transition-colors">Terroir<span className="text-amber-400 font-sans font-light">Trail</span></h1>
                <p className="text-[10px] text-stone-400 font-medium hidden md:block truncate group-hover:text-stone-300 transition-colors">Independent Producer &amp; Agritourism Guide</p>
              </div>
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
            <div className="flex items-center bg-stone-900/90 p-0.5 sm:p-1 rounded-xl border border-white/10 overflow-x-auto scrollbar-none shrink-0 max-w-[70%] sm:max-w-none">
              {COUNTRY_LAYERS.map((country) => {
                const isActive = selectedDestination === 'all' && countryScope === country.id;
                return (
                  <button
                    key={country.id}
                    onClick={() => selectCountry(country.id)}
                    className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${isActive ? 'bg-amber-500 text-stone-950 shadow-md font-bold' : 'text-stone-400 hover:text-white hover:bg-white/5'}`}
                  >                    <span>{country.label}</span>
                  </button>
                );
              })}

              {visibleDestinations.length > 0 && <span className="h-4 w-px bg-white/15 mx-1 shrink-0" aria-hidden="true" />}

              {visibleDestinations.map((destination) => {
                const isActive = selectedDestination === destination.id;
                return (
                  <button
                    key={destination.id}
                    onClick={() => selectDestination(destination.id)}
                    className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${isActive ? 'bg-amber-500 text-stone-950 shadow-md font-bold' : 'text-stone-400 hover:text-white hover:bg-white/5'}`}
                  >                    <span>{destination.label}</span>
                  </button>
                );
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
          <div
            className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-stone-950 border-l border-white/10 shadow-2xl flex flex-col sm:hidden"
            style={{ paddingTop: 'env(safe-area-inset-top)' }}
            onTouchStart={handleMenuTouchStart}
            onTouchEnd={handleMenuTouchEnd}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10"><span className="text-sm font-bold text-white">Menu</span><button onClick={closeMenu} className="w-8 h-8 flex items-center justify-center rounded-lg bg-stone-900 border border-white/10 text-stone-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button></div>
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y mobile-scroll p-4 pb-[max(1rem,env(safe-area-inset-bottom))] flex flex-col gap-2">
              {onOpenAbout && <button onClick={() => { onOpenAbout(); closeMenu(); }} className="flex items-center gap-3 w-full px-3 py-3 text-sm font-semibold text-stone-200 hover:text-white bg-stone-900 rounded-xl border border-white/10 cursor-pointer"><BookOpen className="w-4 h-4 text-amber-400" />About & FAQ</button>}

              {isHost ? (
                onOpenProducerPortal && <button onClick={() => { onOpenProducerPortal(); closeMenu(); }} className="flex items-center gap-3 w-full px-3 py-3 text-sm font-semibold text-amber-300 bg-amber-500/15 rounded-xl border border-amber-500/30 cursor-pointer"><Building2 className="w-4 h-4 text-amber-400" />Host Portal</button>
              ) : (
                <button onClick={() => { onOpenAuth('producer'); closeMenu(); }} className="flex items-center gap-3 w-full px-3 py-3 text-sm font-semibold text-amber-400 bg-amber-500/10 rounded-xl border border-amber-500/30 cursor-pointer"><Building2 className="w-4 h-4 text-amber-400" />Host Portal</button>
              )}

              <button onClick={() => { onOpenPassport(); closeMenu(); }} className="flex items-center gap-3 w-full px-3 py-3 text-sm font-semibold text-stone-200 bg-stone-900 rounded-xl border border-white/10 cursor-pointer"><Award className="w-4 h-4 text-amber-400" />Terroir Passport</button>
              <button onClick={() => { onOpenLoops(); closeMenu(); }} className="flex items-center gap-3 w-full px-3 py-3 text-sm font-semibold text-stone-200 bg-stone-900 rounded-xl border border-white/10 cursor-pointer"><Compass className="w-4 h-4 text-amber-400" />Discovery Guides</button>
              {onOpenExperiences && <button onClick={() => { onOpenExperiences(); closeMenu(); }} className="flex items-center gap-3 w-full px-3 py-3 text-sm font-semibold text-stone-200 bg-stone-900 rounded-xl border border-white/10 cursor-pointer"><Sparkles className="w-4 h-4 text-amber-400" />Curated Experiences</button>}

              {canInstall && (
                <button
                  onClick={() => { void handleInstallApp(); }}
                  className="flex items-center gap-3 w-full px-3 py-3 text-left bg-amber-500/12 hover:bg-amber-500/18 rounded-xl border border-amber-500/30 cursor-pointer transition"
                >
                  <span className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
                    <Download className="w-4 h-4 text-amber-400" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-amber-200">
                      Install TerroirTrail
                    </span>
                    <span className="block mt-0.5 text-[10px] leading-4 text-stone-400">
                      Add it to your Home Screen · no app store required
                    </span>
                  </span>
                </button>
              )}

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

      {installHelpOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm sm:hidden"
            aria-label="Close install instructions"
            onClick={() => setInstallHelpOpen(false)}
          />
          <section
            className="fixed inset-x-0 bottom-0 z-[71] sm:hidden rounded-t-3xl border-t border-white/10 bg-stone-950 px-5 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-stone-100 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-terroirtrail-title"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-stone-700" />
            <div className="flex items-start gap-3">
              <span className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 text-amber-400" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 id="install-terroirtrail-title" className="text-base font-bold text-white">
                  Add TerroirTrail to your Home Screen
                </h2>
                <p className="mt-1 text-xs leading-5 text-stone-400">
                  Keep the guide one tap away while travelling. It opens like an app and stays connected to the latest web version.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInstallHelpOpen(false)}
                className="w-8 h-8 rounded-xl bg-stone-900 border border-white/10 text-stone-400 hover:text-white flex items-center justify-center"
                aria-label="Close install instructions"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIos && !isIosSafari && (
              <div className="mt-4 rounded-2xl border border-sky-400/20 bg-sky-500/10 px-3.5 py-3 text-xs leading-5 text-sky-100">
                Open TerroirTrail in Safari first, then follow the steps below.
              </div>
            )}

            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-3 rounded-2xl bg-stone-900/90 border border-white/10 px-3.5 py-3">
                <span className="w-9 h-9 rounded-xl bg-stone-950 border border-white/10 flex items-center justify-center shrink-0">
                  <Share2 className="w-4 h-4 text-amber-400" />
                </span>
                <div>
                  <div className="text-xs font-bold text-white">1. Tap Share</div>
                  <div className="mt-0.5 text-[11px] text-stone-400">
                    Use Safari's Share button at the bottom of the screen.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-stone-900/90 border border-white/10 px-3.5 py-3">
                <span className="w-9 h-9 rounded-xl bg-stone-950 border border-white/10 flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4 text-amber-400" />
                </span>
                <div>
                  <div className="text-xs font-bold text-white">2. Add to Home Screen</div>
                  <div className="mt-0.5 text-[11px] text-stone-400">
                    Choose “Add to Home Screen”, then tap Add.
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setInstallHelpOpen(false)}
              className="mt-5 w-full rounded-2xl bg-amber-500 hover:bg-amber-400 px-4 py-3 text-sm font-bold text-stone-950 transition"
            >
              Got it
            </button>
          </section>
        </>
      )}
    </>
  );
};
