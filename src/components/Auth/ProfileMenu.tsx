import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../../types/auth';
import { User, LogOut, Compass, Heart, Award, ChevronDown, Calendar, Building2, Crown, Package, LogIn, BookOpen, HelpCircle, Scale, Sparkles, ShieldCheck } from 'lucide-react';
import { UserAvatar } from '../Common/UserAvatar';

interface ProfileMenuProps {
  user: UserProfile | null;
  onOpenAuth: (role?: 'traveler' | 'producer') => void;
  onOpenPassport: () => void;
  onOpenWishlist: () => void;
  onLogout: () => void;
  totalProducersCount: number;
  onOpenMyBookings?: () => void;
  onOpenProducerPortal?: () => void;
  bookingsCount?: number;
  onOpenExplorerPass?: () => void;
  onOpenDigitalPass?: () => void;
  onOpenWineBoxes?: () => void;
  onOpenAbout?: () => void;
  onOpenFaq?: () => void;
  onOpenLegal?: (tab?: 'privacy' | 'terms' | 'licenses') => void;
  onOpenLoops?: () => void;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({
  user,
  onOpenAuth,
  onOpenPassport,
  onOpenWishlist,
  onLogout,
  totalProducersCount,
  onOpenMyBookings,
  onOpenProducerPortal,
  bookingsCount = 0,
  onOpenExplorerPass,
  onOpenDigitalPass,
  onOpenWineBoxes,
  onOpenAbout,
  onOpenFaq,
  onOpenLegal,
  onOpenLoops,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleOutside = (e: Event) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    // Small delay ensures the opening tap doesn't immediately dismiss the popover
    const timer = setTimeout(() => {
      document.addEventListener('pointerdown', handleOutside);
      document.addEventListener('click', handleOutside);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('pointerdown', handleOutside);
      document.removeEventListener('click', handleOutside);
    };
  }, [isOpen]);

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => onOpenAuth('traveler')}
        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 text-xs font-bold transition shadow-md shadow-amber-500/20 shrink-0 cursor-pointer"
      >
        <User className="w-3.5 h-3.5" />
        <span>Sign In</span>
      </button>
    );
  }

  const visitedCount = user.visitedProducers.length;
  const progressPercent = Math.min(100, Math.round((visitedCount / (totalProducersCount || 1)) * 100));

  const getBadgeLabel = (type: string) => {
    switch (type) {
      case 'crete_local': return 'Crete Local Explorer';
      case 'wine_enthusiast': return 'Heritage Wine Enthusiast';
      case 'craft_beer_explorer': return 'Craft Beer Explorer';
      case 'culinary_nomad': return 'Artisan Culinary Nomad';
      default: return 'Terroir Explorer';
    }
  };

  return (
    <div ref={menuRef} className="relative z-40 shrink-0">
      {/* Avatar Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 rounded-xl bg-stone-900 hover:bg-stone-850 border border-amber-500/30 hover:border-amber-400/50 text-stone-200 transition active:scale-95 shrink-0 cursor-pointer group"
      >
        <UserAvatar user={user} size="xs" className="ring-1 ring-amber-500/50" />
        <span className="text-xs font-bold text-white hidden md:inline truncate max-w-[90px] group-hover:text-amber-300 transition-colors">
          {user.name.split(' ')[0]}
        </span>
        <ChevronDown className={`w-3 h-3 text-stone-400 shrink-0 group-hover:text-amber-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 mt-2 w-72 sm:w-80 bg-stone-950/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-3 animate-in fade-in slide-in-from-top-2 duration-150 text-xs z-50"
        >
          
          {/* User Info */}
          <div className="pb-3 border-b border-white/10 mb-2.5">
            <div className="flex items-center gap-2.5 mb-1">
              <UserAvatar user={user} size="md" className="ring-2 ring-amber-500/50 shadow-md" />
              <div className="min-w-0">
                <div className="font-bold text-white truncate text-sm">{user.name}</div>
                <div className="text-[10px] text-stone-400 truncate">{user.email}</div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2 pt-1 text-[10px]">
              {user.isProducer ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
                  <span>🏛️</span>
                  <span>{user.producerName || 'Verified Host'}</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {getBadgeLabel(user.travelerType || '')}
                </span>
              )}
              <span className="text-stone-400 font-medium">Member {user.memberSince}</span>
            </div>
          </div>

          {/* DEDICATED VIP PASS CARD (BEHIND LOGIN) */}
          {user.isProducer ? (
            /* PRODUCER VIP PASS: HOST PRO TIER */
            <div className="mb-2.5 p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 via-stone-900 to-stone-950 border border-amber-400/40 shadow-lg shadow-amber-500/10 text-left">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-white text-xs">Host Pro VIP Tier</span>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  €199/yr
                </span>
              </div>
              <p className="text-[10px] text-stone-300 mb-2 leading-relaxed">
                Gold glowing map marker, direct bottle shop button & 0% tasting commission. 100% Tax Deductible (myDATA).
              </p>
              {onOpenProducerPortal && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenProducerPortal();
                  }}
                  className="w-full py-1.5 rounded-xl text-[11px] font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Building2 className="w-3 h-3" />
                  <span>Manage Host Pro & Invoices</span>
                </button>
              )}
            </div>
          ) : (
            /* TRAVELLER VIP PASS: 14-DAY EXPLORER PASS */
            <div className={`mb-2.5 p-3 rounded-2xl border transition relative overflow-hidden text-left ${
              user.hasExplorerPass
                ? 'bg-gradient-to-br from-amber-500/25 via-stone-900 to-stone-950 border-amber-400/50 shadow-lg shadow-amber-500/10'
                : 'bg-stone-900/90 border-white/10 hover:border-amber-500/30'
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Crown className={`w-4 h-4 ${user.hasExplorerPass ? 'text-amber-400 animate-pulse' : 'text-stone-400'}`} />
                  <span className="font-bold text-white text-xs">
                    {user.hasExplorerPass ? 'VIP Explorer Pass' : 'VIP Holiday Pass (Optional)'}
                  </span>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  user.hasExplorerPass 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                    : 'bg-stone-800 text-stone-300 border border-stone-700'
                }`}>
                  {user.hasExplorerPass ? 'Active' : 'Free Tier · No Pass'}
                </span>
              </div>
              <p className="text-[10px] text-stone-300 mb-2 leading-relaxed">
                {user.hasExplorerPass
                  ? '100% Ad-Free active · Complimentary pours, artisan discounts & VIP map filters unlocked.'
                  : 'You are on the Free Explorer Tier. Upgrade to the optional 14-day VIP Pass (€14.99) for ad-free exploration, complimentary pours & 10% cellar discounts.'}
              </p>
              {onOpenExplorerPass && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    if (user.hasExplorerPass && onOpenDigitalPass) {
                      onOpenDigitalPass();
                    } else {
                      onOpenExplorerPass();
                    }
                  }}
                  className={`w-full py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    user.hasExplorerPass
                      ? 'bg-stone-800 hover:bg-stone-750 text-amber-300 border border-amber-400/30 shadow-md'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-md font-extrabold'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{user.hasExplorerPass ? 'View Digital VIP Pass & QR' : 'Get 14-Day VIP Pass (€14.99)'}</span>
                </button>
              )}
            </div>
          )}

          {/* Terroir Passport Progress */}
          <button
            onClick={() => {
              setIsOpen(false);
              onOpenPassport();
            }}
            className="w-full text-left p-2.5 rounded-xl bg-stone-900/80 hover:bg-stone-850 border border-amber-500/20 hover:border-amber-400/40 transition mb-2 group"
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-stone-200 group-hover:text-amber-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Terroir Passport</span>
              </span>
              <span className="text-amber-400">{visitedCount} / {totalProducersCount}</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[9px] text-stone-400 mt-1">Tap to view your collection stamps</p>
          </button>

          {/* Menu Actions */}
          <div className="space-y-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenWishlist();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/5 transition"
            >
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>My Saved Wishlist</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenPassport();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/5 transition cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Terroir Passport Stamps</span>
            </button>

            {onOpenLoops && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenLoops();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-stone-300 hover:text-amber-300 hover:bg-amber-500/10 transition cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Curated Terroir Routes</span>
              </button>
            )}

            {onOpenExplorerPass && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  if (user.hasExplorerPass && onOpenDigitalPass) {
                    onOpenDigitalPass();
                  } else {
                    onOpenExplorerPass();
                  }
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-stone-300 hover:text-amber-300 hover:bg-amber-500/10 transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>{user.hasExplorerPass ? 'Digital VIP Pass & QR' : 'VIP Pass (Optional)'}</span>
                </span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  user.hasExplorerPass 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {user.hasExplorerPass ? 'Active' : '€14.99'}
                </span>
              </button>
            )}

            {/* Artisan Boxes commented out until clientbase and shipping logistics are established */}
            {/*
            {onOpenWineBoxes && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenWineBoxes();
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-stone-300 hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Package className="w-3.5 h-3.5 text-rose-400" />
                  <span>Artisan Boxes</span>
                </span>
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                  Greek Terroir
                </span>
              </button>
            )}
            */}

            {onOpenMyBookings && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenMyBookings();
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/5 transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>My Tasting Bookings</span>
                </span>
                {bookingsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                    {bookingsCount}
                  </span>
                )}
              </button>
            )}

            {user.isProducer ? (
              onOpenProducerPortal && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenProducerPortal();
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-rose-500/15 hover:from-amber-500/30 hover:to-rose-500/25 border border-amber-500/30 text-amber-300 transition cursor-pointer font-bold"
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span>My Estate Dashboard</span>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-stone-950 font-extrabold uppercase">
                    Host
                  </span>
                </button>
              )
            ) : (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenAuth('producer');
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-white/5 transition cursor-pointer text-[11px]"
              >
                <Building2 className="w-3.5 h-3.5 text-stone-500" />
                <span>Producer & Estate Login</span>
              </button>
            )}

            {onOpenAbout && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenAbout();
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-stone-300 hover:text-amber-300 hover:bg-white/5 transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>About Us & Story</span>
                </span>
              </button>
            )}

            {onOpenFaq && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenFaq();
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-stone-300 hover:text-amber-300 hover:bg-white/5 transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>FAQ & Guide</span>
                </span>
                <span className="px-1.5 py-0.2 rounded-full bg-stone-800 text-stone-400 text-[10px] font-mono">
                  14
                </span>
              </button>
            )}

            {onOpenLegal && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenLegal('privacy');
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/5 transition cursor-pointer text-xs"
              >
                <span className="flex items-center gap-2">
                  <Scale className="w-3.5 h-3.5 text-stone-400" />
                  <span>Privacy & Legal Terms</span>
                </span>
                <span className="text-[10px] text-stone-500 font-mono">GDPR</span>
              </button>
            )}

            <div className="h-[1px] bg-white/10 my-1" />

            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
