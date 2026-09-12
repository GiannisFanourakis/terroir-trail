import React from 'react';
import { CheckCircle2, Crown, Sparkles, X, Wine, Award } from 'lucide-react';

export interface VerifiedPassInfo {
  passId: string;
  name: string;
  tier: string;
  expiresAt: string;
}

interface HostVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  guestInfo: VerifiedPassInfo | null;
}

export const HostVerificationModal: React.FC<HostVerificationModalProps> = ({
  isOpen,
  onClose,
  guestInfo,
}) => {
  if (!isOpen || !guestInfo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md bg-stone-950 text-stone-100 rounded-3xl shadow-2xl border-2 border-emerald-500/60 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 text-left">
        
        {/* Verified Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-950/80 via-stone-900 to-stone-950 border-b border-emerald-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block font-mono">
                  Estate Host Verification
                </span>
                <h3 className="font-serif-title font-bold text-white text-base">
                  Authentic Passholder
                </h3>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          
          {/* Guest Identity Card */}
          <div className="p-4 rounded-2xl bg-stone-900 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-stone-400 uppercase font-semibold">Guest Name</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 uppercase">
                VALID PASS
              </span>
            </div>
            <div className="text-xl font-bold font-serif-title text-white">
              {guestInfo.name}
            </div>
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-stone-300 font-mono">
              <span>{guestInfo.passId}</span>
              <span className="text-amber-400 font-sans font-semibold">{guestInfo.tier}</span>
            </div>
            <p className="text-stone-400 text-[10px]">Verified online · Expires {new Date(guestInfo.expiresAt).toLocaleString()}</p>
          </div>

          {/* Planned Pilot Privileges Checklist */}
          <div className="space-y-2">
            <span className="text-stone-300 font-bold text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Planned Pilot Benefits (Where Participating):</span>
            </span>

            <div className="space-y-1.5 text-stone-300">
              <div className="p-2.5 rounded-xl bg-stone-900/80 border border-white/5 flex items-center gap-2.5">
                <span className="text-base">🍷</span>
                <div>
                  <strong className="text-white block">Welcome Tasting Pour</strong>
                  <span className="text-stone-400 text-[10px]">Complimentary reserve vintage sample</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-900/80 border border-white/5 flex items-center gap-2.5">
                <span className="text-base">🧀</span>
                <div>
                  <strong className="text-white block">Artisanal Meze Platter</strong>
                  <span className="text-stone-400 text-[10px]">Complimentary graviera cheese & olives with tasting</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-900/80 border border-white/5 flex items-center gap-2.5">
                <span className="text-base">🏷️</span>
                <div>
                  <strong className="text-white block">10% Bottle Discount</strong>
                  <span className="text-stone-400 text-[10px]">Apply to direct cellar door bottle sales</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-900/80 border border-white/5 flex items-center gap-2.5">
                <span className="text-base">🛂</span>
                <div>
                  <strong className="text-white block">Terroir Digital Stamp</strong>
                  <span className="text-stone-400 text-[10px]">Guest is collecting their passport stamp</span>
                </div>
              </div>
            </div>
          </div>

          {/* Host Note */}
          <div className="p-3 rounded-xl bg-stone-900/50 border border-white/5 text-[10px] text-stone-400 leading-relaxed">
            💡 <em>Host Notice:</em> Zero booking commissions are taken on direct reservation requests. 100% of tasting fees remain with your artisan estate.
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer"
          >
            Confirm & Welcome Guest
          </button>

        </div>

      </div>
    </div>
  );
};
