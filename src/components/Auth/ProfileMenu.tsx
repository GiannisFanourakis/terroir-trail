import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../../types/auth';
import { User, LogOut, Compass, Heart, Award, ChevronDown, Calendar, Building2, Crown, Package, LogIn } from 'lucide-react';

interface ProfileMenuProps {
  user: UserProfile | null;
  onOpenAuth: () => void;
  onOpenPassport: () => void;
  onOpenWishlist: () => void;
  onLogout: () => void;
  totalProducersCount: number;
  onOpenMyBookings?: () => void;
  onOpenProducerPortal?: () => void;
  bookingsCount?: number;
  onOpenExplorerPass?: () => void;
  onOpenWineBoxes?: () => void;
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
  onOpenWineBoxes,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!user) {
    return (
      <button
        onClick={onOpenAuth}
        className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md shadow-amber-500/25 border border-amber-400/80 transition-all transform active:scale-95 shrink-0 cursor-pointer"
        title="Sign in / Explorer Account"
      >
        <LogIn className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
        <span className="font-bold tracking-tight whitespace-nowrap">Log In</span>
      </button>
    );
  }

  const visitedCount = user.visitedProducers.length;
  const progressPercent = Math.round((visitedCount / (totalProducersCount || 1)) * 100);

  const getBadgeLabel = (type: UserProfile['travelerType']) => {
    switch (type) {
      case 'crete_local': return 'Crete Local';
      case 'wine_enthusiast': return 'Sommelier';
      case 'craft_beer_explorer': return 'Brewer';
      case 'culinary_nomad': return 'Agritourist';
    }
  };

  return (
    <div ref={menuRef} className="relative z-30 shrink-0">
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 rounded-xl bg-stone-900 hover:bg-stone-850 border border-amber-500/30 hover:border-amber-400/50 text-stone-200 transition active:scale-95 shrink-0 cursor-pointer"
      >
        <span className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
          {user.avatar?.startsWith('http') ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            user.avatar || '🧭'
          )}
        </span>
        <span className="text-xs font-bold text-white hidden md:inline truncate max-w-[90px]">
          {user.name.split(' ')[0]}
        </span>
        <ChevronDown className="w-3 h-3 text-stone-400 shrink-0" />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-stone-950/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-3 animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
          
          {/* User Info */}
          <div className="pb-3 border-b border-white/10 mb-2.5">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-sm shrink-0 overflow-hidden">
                {user.avatar?.startsWith('http') ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.avatar || '🧭'
                )}
              </span>
              <div className="min-w-0">
                <div className="font-bold text-white truncate">{user.name}</div>
                <div className="text-[10px] text-stone-400 truncate">{user.email}</div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2 pt-1 text-[10px]">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                {getBadgeLabel(user.travelerType)}
              </span>
              <span className="text-stone-400 font-medium">Member {user.memberSince}</span>
            </div>
          </div>

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

            {onOpenExplorerPass && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenExplorerPass();
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-stone-300 hover:text-amber-300 hover:bg-amber-500/10 transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>{user.hasExplorerPass ? 'VIP Pass Active' : 'VIP Explorer Pass'}</span>
                </span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                  {user.hasExplorerPass ? 'VIP' : '€19.99'}
                </span>
              </button>
            )}

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
                  <span>Wine Delivery</span>
                </span>
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                  EU/US
                </span>
              </button>
            )}

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

            {onOpenProducerPortal && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenProducerPortal();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/5 transition cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Host / Producer Portal</span>
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
