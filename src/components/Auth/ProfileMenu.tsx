import React, { useEffect, useRef, useState } from 'react';
import {
  Award,
  BookOpen,
  Building2,
  Calendar,
  ChevronDown,
  Compass,
  Crown,
  Heart,
  HelpCircle,
  LogOut,
  Scale,
  Settings,
  ShieldCheck,
  User,
} from 'lucide-react';
import { UserProfile } from '../../types/auth';
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
  onOpenAccountSettings?: () => void;
  bookingsCount?: number;
  onOpenExplorerPass?: () => void;
  onOpenDigitalPass?: () => void;
  onOpenAbout?: () => void;
  onOpenFaq?: () => void;
  onOpenLegal?: (tab?: 'privacy' | 'terms' | 'licenses') => void;
  onOpenLoops?: () => void;
  isAdmin?: boolean;
  isPlatformOwner?: boolean;
  onOpenAdmin?: () => void;
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
  onOpenAccountSettings,
  bookingsCount = 0,
  onOpenExplorerPass,
  onOpenDigitalPass,
  onOpenAbout,
  onOpenFaq,
  onOpenLegal,
  onOpenLoops,
  isAdmin = false,
  isPlatformOwner = false,
  onOpenAdmin,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (event: Event) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsOpen(false);
    };
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
      <button type="button" onClick={() => onOpenAuth('traveler')} className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 text-xs font-bold transition shadow-md shadow-amber-500/20 shrink-0 cursor-pointer">
        <User className="w-3.5 h-3.5" />
        <span>Sign In</span>
      </button>
    );
  }

  const visitedCount = user.visitedProducers?.length ?? 0;
  const progressPercent = Math.min(100, Math.round((visitedCount / (totalProducersCount || 1)) * 100));
  const isHost = Boolean(user.producerIds?.length || user.isProducer);

  const runAndClose = (action?: () => void) => {
    setIsOpen(false);
    action?.();
  };

  return (
    <div ref={menuRef} className="relative z-40 shrink-0">
      <button type="button" onClick={(event) => { event.stopPropagation(); setIsOpen(value => !value); }} className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 rounded-xl bg-stone-900 hover:bg-stone-850 border border-amber-500/30 hover:border-amber-400/50 text-stone-200 transition active:scale-95 shrink-0 cursor-pointer group">
        <UserAvatar user={user} size="xs" className="ring-1 ring-amber-500/50" />
        <span className="text-xs font-bold text-white hidden md:inline truncate max-w-[90px] group-hover:text-amber-300 transition-colors">{user.name.split(' ')[0]}</span>
        <ChevronDown className={`w-3 h-3 text-stone-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div onClick={event => event.stopPropagation()} className="absolute right-0 mt-2 w-72 sm:w-80 bg-stone-950/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-3 animate-in fade-in slide-in-from-top-2 duration-150 text-xs z-50">
          <div className="pb-3 border-b border-white/10 mb-2.5">
            <div className="flex items-center gap-2.5">
              <UserAvatar user={user} size="md" className="ring-2 ring-amber-500/50 shadow-md" />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-white truncate text-sm">{user.name}</div>
                <div className="text-[10px] text-stone-400 truncate">{user.email}</div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 text-[10px]">
              {isAdmin ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1"><ShieldCheck className="w-3 h-3" />{isPlatformOwner ? 'Platform Owner' : 'TerroirTrail Admin'}</span>
              ) : isHost ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1"><Building2 className="w-3 h-3" />Verified Host</span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-stone-900 text-stone-300 font-bold border border-white/10">Traveler</span>
              )}
              <span className="text-stone-500">Member {user.memberSince}</span>
            </div>
          </div>

          <button type="button" onClick={() => runAndClose(onOpenPassport)} className="w-full text-left p-2.5 rounded-xl bg-stone-900/80 hover:bg-stone-850 border border-amber-500/20 hover:border-amber-400/40 transition mb-2 group cursor-pointer">
            <div className="flex items-center justify-between text-[11px] font-bold text-stone-200 group-hover:text-amber-300 mb-1.5"><span className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-amber-400" />Terroir Passport</span><span className="text-amber-400">{visitedCount} / {totalProducersCount}</span></div>
            <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full" style={{ width: `${progressPercent}%` }} /></div>
          </button>

          <div className="space-y-1">
            <button type="button" onClick={() => runAndClose(onOpenWishlist)} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/5 transition cursor-pointer"><Heart className="w-3.5 h-3.5 text-rose-400" />My saved producers</button>
            <button type="button" onClick={() => runAndClose(onOpenPassport)} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/5 transition cursor-pointer"><Compass className="w-3.5 h-3.5 text-amber-400" />Passport stamps & notes</button>

            {onOpenLoops && <button type="button" onClick={() => runAndClose(onOpenLoops)} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-stone-300 hover:text-amber-300 hover:bg-amber-500/10 transition cursor-pointer"><Compass className="w-3.5 h-3.5 text-amber-400" />Discovery Guides</button>}

            {onOpenMyBookings && (
              <button type="button" onClick={() => runAndClose(onOpenMyBookings)} className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/5 transition cursor-pointer">
                <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-amber-400" />My bookings</span>
                {bookingsCount > 0 && <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">{bookingsCount}</span>}
              </button>
            )}

            {onOpenExplorerPass && (
              <button type="button" onClick={() => runAndClose(user.hasExplorerPass && onOpenDigitalPass ? onOpenDigitalPass : onOpenExplorerPass)} className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-stone-300 hover:text-amber-300 hover:bg-amber-500/10 transition cursor-pointer">
                <span className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" />{user.hasExplorerPass ? 'Digital Explorer Pass' : 'Explorer Pass'}</span>
                {user.hasExplorerPass && <span className="text-[9px] font-bold text-emerald-300">Active</span>}
              </button>
            )}

            {isAdmin && onOpenAdmin && (
              <button type="button" onClick={() => runAndClose(onOpenAdmin)} className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 transition cursor-pointer font-bold"><span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" />Admin Requests & Controls</span><span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-400 text-stone-950 uppercase">{isPlatformOwner ? 'Owner' : 'Admin'}</span></button>
            )}

            {isAdmin && !isHost && onOpenProducerPortal && (
              <button type="button" onClick={() => runAndClose(onOpenProducerPortal)} className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl bg-sky-500/10 border border-sky-500/25 text-sky-200 cursor-pointer font-bold"><span className="flex items-center gap-2"><Building2 className="w-4 h-4" />Preview Producer Portal</span><span className="text-[9px] uppercase">Read only</span></button>
            )}

            {isHost && onOpenProducerPortal ? (
              <button type="button" onClick={() => runAndClose(onOpenProducerPortal)} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 cursor-pointer font-bold"><Building2 className="w-4 h-4" />My Producer Dashboard</button>
            ) : !isHost ? (
              <button type="button" onClick={() => { setIsOpen(false); onOpenAuth('producer'); }} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-white/5 transition cursor-pointer"><Building2 className="w-3.5 h-3.5" />Producer / Host access</button>
            ) : null}

            {onOpenAccountSettings && (
              <button type="button" onClick={() => runAndClose(onOpenAccountSettings)} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/5 transition cursor-pointer"><Settings className="w-3.5 h-3.5 text-sky-300" />Account & privacy</button>
            )}

            {onOpenAbout && <button type="button" onClick={() => runAndClose(onOpenAbout)} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-stone-300 hover:text-amber-300 hover:bg-white/5 transition cursor-pointer"><BookOpen className="w-3.5 h-3.5 text-amber-400" />About TerroirTrail</button>}
            {onOpenFaq && <button type="button" onClick={() => runAndClose(onOpenFaq)} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-stone-300 hover:text-amber-300 hover:bg-white/5 transition cursor-pointer"><HelpCircle className="w-3.5 h-3.5 text-amber-400" />FAQ & Guide</button>}
            {onOpenLegal && <button type="button" onClick={() => { setIsOpen(false); onOpenLegal('privacy'); }} className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/5 transition cursor-pointer"><span className="flex items-center gap-2"><Scale className="w-3.5 h-3.5" />Privacy & Legal</span><span className="text-[9px]">GDPR</span></button>}

            <div className="h-px bg-white/10 my-1" />
            <button type="button" onClick={() => runAndClose(onLogout)} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer"><LogOut className="w-3.5 h-3.5" />Sign Out</button>
          </div>
        </div>
      )}
    </div>
  );
};
