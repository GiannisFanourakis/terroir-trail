import React, { useState } from 'react';
import { UserProfile } from '../../types/auth';
import { startPassCheckout, isExplorerPassPurchasesEnabled } from '../../services/explorerPass';
import { 
  X, Award, CheckCircle2, Sparkles, ShieldCheck, 
  Wine, Gift, Compass, CreditCard, Apple, ArrowRight, Star, Lock, QrCode
} from 'lucide-react';

interface ExplorerPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onOpenAuth: (role?: 'traveler' | 'producer') => void;
  onOpenDigitalPass?: () => void;
}

export const ExplorerPassModal: React.FC<ExplorerPassModalProps> = ({
  isOpen,
  onClose,
  user,
  onOpenAuth,
  onOpenDigitalPass,
}) => {
  const [activeTab, setActiveTab] = useState<'upgrade' | 'compare'>('upgrade');
  const [selectedPlan, setSelectedPlan] = useState<'holiday' | 'annual'>('holiday');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const isPurchased = false;
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const purchasesEnabled = isExplorerPassPurchasesEnabled();

  if (!isOpen) return null;

  const perks = [
    {
      icon: '🎫',
      title: 'Digital Explorer Pass Entitlement',
      desc: '14-day holiday pass or 365-day annual pass entitlement linked to your verified account.',
    },
    {
      icon: '🛡️',
      title: 'Server-Verified QR Code',
      desc: 'Opaque Pass ID and server-verified QR code for check-in at partner cellar doors.',
    },
    {
      icon: '📱',
      title: 'Cross-Device Account Sync',
      desc: 'Access your active digital pass and saved records across mobile and desktop devices.',
    },
    {
      icon: '🍇',
      title: 'Agritourism Pilot Partner Privileges',
      desc: 'Partner privileges where available during partner pilots.',
    },
  ];

  const comparisonRows = [
    { feature: 'Interactive Artisanal Map & Directory', free: '✅ Included', pass: '✅ Included' },
    { feature: 'Direct Producer Reservation Inquiries', free: '✅ Included', pass: '✅ Included' },
    { feature: 'Digital Explorer Pass & Unique ID', free: '❌ None', pass: '⭐ 14-Day or 365-Day' },
    { feature: 'Cellar Door QR Verification', free: '❌ None', pass: '⭐ Server-Verified' },
    { feature: 'Cross-Device Pass Sync', free: 'Account Only', pass: '⭐ Full Pass Sync' },
    { feature: 'Pilot Partner Benefits', free: '❌ None', pass: '⭐ Where available during partner pilots' },
  ];

  const handlePurchase = async () => {
    // 1. Mandatory requirement: User must have an authenticated account to obtain a pass
    if (!user) {
      onClose();
      onOpenAuth('traveler');
      return;
    }

    setPurchaseError(null);
    setIsProcessing(true);
    try {
      const { url } = await startPassCheckout(selectedPlan);
      window.location.assign(url);
    } catch (e) {
      setPurchaseError(e instanceof Error ? e.message : 'Unable to start checkout. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg bg-stone-950 text-stone-100 rounded-3xl shadow-2xl border border-amber-500/30 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header with Glowing Gold Accent */}
        <div className="relative px-6 py-5 bg-gradient-to-br from-amber-950/80 via-stone-900 to-stone-950 border-b border-amber-500/30 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-700 text-stone-950 flex items-center justify-center text-xl font-bold shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/40">
                👑
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="font-serif-title text-lg sm:text-xl font-bold text-white leading-tight">
                    Terroir Explorer Pass
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 font-bold tracking-wider uppercase">
                    Pilot
                  </span>
                </div>
                <p className="text-xs text-amber-200/80 mt-0.5">
                  Digital agritourism pass for authentic Mediterranean estates
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition border border-white/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {purchaseError && <p role="alert" className="px-6 py-3 text-sm text-rose-300">{purchaseError}</p>}

        {/* Tab Toggle: Upgrade vs Comparison */}
        {!isPurchased && !user?.hasExplorerPass && (
          <div className="flex border-b border-white/10 bg-stone-900/70 px-6 pt-2 shrink-0">
            <button
              onClick={() => setActiveTab('upgrade')}
              className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition cursor-pointer ${
                activeTab === 'upgrade'
                  ? 'border-amber-400 text-amber-400 font-bold'
                  : 'border-transparent text-stone-400 hover:text-white'
              }`}
            >
              👑 Pass Overview
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition cursor-pointer ${
                activeTab === 'compare'
                  ? 'border-amber-400 text-amber-400 font-bold'
                  : 'border-transparent text-stone-400 hover:text-white'
              }`}
            >
              ⚖️ Free vs Pass Comparison
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-4 text-xs">
          
          {isPurchased || user?.hasExplorerPass ? (
            /* Activated Card */
            <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 text-amber-400 flex items-center justify-center mx-auto text-2xl shadow-xl shadow-amber-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif-title text-xl font-bold text-white">
                  Explorer Pass Activated!
                </h3>
                <p className="text-xs text-stone-300 max-w-sm mx-auto">
                  Welcome, <span className="text-amber-400 font-bold">{user?.name}</span>. Your Explorer Pass is active and verifiable where available during partner pilots.
                </p>
              </div>

              {/* Digital Member Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-tr from-amber-600/30 via-stone-900 to-amber-900/40 border-2 border-amber-400/50 shadow-2xl max-w-sm mx-auto text-left relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">👑</span>
                    <span className="font-serif-title font-bold text-white text-xs tracking-wider uppercase">
                      Terroir Explorer
                    </span>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold uppercase tracking-wider">
                    {user?.explorerPassPlan === 'annual' 
                      ? 'VALID · 365 DAYS' 
                      : 'VALID · 14 DAYS'}
                  </span>
                </div>

                <div className="space-y-1 my-3">
                  <div className="text-[10px] uppercase tracking-wider text-amber-200/70 font-semibold">Passholder</div>
                  <div className="font-bold text-white text-base">{user?.name}</div>
                  <div className="text-[10px] text-stone-400 font-mono">PASS #TR-2026-{user?.id.slice(-6).toUpperCase()}</div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-amber-300 font-medium">
                  <span>Show where available during partner pilots</span>
                  <span>Server-verified digital pass</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-sm mx-auto">
                {onOpenDigitalPass && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenDigitalPass();
                    }}
                    className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-xl transition active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Open Digital Pass & QR</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-2xl bg-stone-850 hover:bg-stone-800 text-stone-200 border border-white/10 font-bold text-xs transition active:scale-98 cursor-pointer"
                >
                  Start Exploring
                </button>
              </div>
            </div>
          ) : activeTab === 'compare' ? (
            /* Freemium Comparison Matrix View */
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="text-center pb-1">
                <h3 className="font-serif-title font-bold text-sm text-white">
                  Choose the Perfect Agritourism Experience
                </h3>
                <p className="text-[11px] text-stone-400">
                  Explore independent makers for free or add an optional Explorer Pass
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 overflow-hidden bg-stone-900/80 shadow-lg">
                <div className="grid grid-cols-12 bg-stone-900 p-2.5 border-b border-white/10 text-[11px] font-bold">
                  <div className="col-span-6 text-stone-400">Platform Feature</div>
                  <div className="col-span-3 text-center text-stone-300">Free (€0)</div>
                  <div className="col-span-3 text-center text-amber-400">Explorer Pass</div>
                </div>

                <div className="divide-y divide-white/5 text-[11px]">
                  {comparisonRows.map((row, i) => (
                    <div key={i} className="grid grid-cols-12 p-2.5 items-center hover:bg-white/5 transition">
                      <div className="col-span-6 font-medium text-stone-300">{row.feature}</div>
                      <div className="col-span-3 text-center text-stone-400 text-[10px]">{row.free}</div>
                      <div className="col-span-3 text-center text-amber-300 font-semibold text-[10px]">{row.pass}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('upgrade')}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg transition active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>View Explorer Pass Plans</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Purchase Flow */
            <div className="space-y-4">
              
              {/* Plan Selection Cards: Holiday vs Annual */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Holiday Pass (Primary recommended) */}
                <button
                  type="button"
                  onClick={() => setSelectedPlan('holiday')}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer relative overflow-hidden ${
                    selectedPlan === 'holiday'
                      ? 'bg-gradient-to-br from-amber-500/20 via-stone-900 to-stone-900 border-amber-400 shadow-lg shadow-amber-500/10'
                      : 'bg-stone-900/70 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                      14-Day Holiday Pass
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-stone-950 font-extrabold uppercase">
                      Most Popular
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-serif-title text-2xl font-bold text-white">€14.99</span>
                    <span className="text-[10px] text-stone-400">one-time</span>
                  </div>
                  <p className="text-[11px] text-stone-300 mt-1 leading-tight">
                    Perfect for your vacation. <strong>No subscription</strong>, no auto-renew.
                  </p>
                  <span className="mt-2 inline-block text-[10px] text-emerald-400 font-semibold">
                    ✓ 14 days active duration
                  </span>
                </button>

                {/* 2. Annual Pass */}
                <button
                  type="button"
                  onClick={() => setSelectedPlan('annual')}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer relative overflow-hidden ${
                    selectedPlan === 'annual'
                      ? 'bg-gradient-to-br from-amber-500/20 via-stone-900 to-stone-900 border-amber-400 shadow-lg shadow-amber-500/10'
                      : 'bg-stone-900/70 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                      Annual Pass
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-stone-800 text-stone-300 font-semibold uppercase">
                      365 Days
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-serif-title text-2xl font-bold text-white">€29.99</span>
                    <span className="text-[10px] text-stone-400">/year</span>
                  </div>
                  <p className="text-[11px] text-stone-300 mt-1 leading-tight">
                    For local residents, sommeliers & passionate travelers exploring authentic terroirs.
                  </p>
                  <span className="mt-2 inline-block text-[10px] text-amber-300 font-semibold">
                    ✓ 365 days active duration
                  </span>
                </button>
              </div>

              {/* Perks List */}
              <div className="space-y-2">
                <span className="text-stone-400 text-[11px] font-semibold block">
                  Included Pass Privileges
                </span>
                <div className="space-y-2">
                  {perks.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-stone-900/90 border border-white/5 flex items-start gap-3"
                    >
                      <span className="text-lg shrink-0">{p.icon}</span>
                      <div>
                        <span className="font-bold text-white text-xs block leading-tight">
                          {p.title}
                        </span>
                        <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">
                          {p.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Secure Checkout Trust Badge */}
              <div className="pt-3 border-t border-white/10 flex flex-col items-center justify-center text-center gap-1.5">
                <div className="flex items-center gap-1 text-[10px] text-stone-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Secure checkout powered by <strong className="text-white">Stripe Checkout</strong></span>
                </div>
                <p className="text-[10px] text-stone-400 max-w-xs">
                  Available payment methods are presented by Stripe during checkout. TerroirTrail does not store card details.
                </p>
              </div>

              {/* Pilot Notice when purchases are gated */}
              {!purchasesEnabled && (
                <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-3 text-left my-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="leading-snug">
                    <span className="font-bold text-white block">Explorer Pass Pilot</span>
                    <span className="text-[11px] text-stone-300">
                      Pass purchases are currently in private pilot validation while partner estate onboarding is underway. Existing pass holders can present active passes.
                    </span>
                  </div>
                </div>
              )}

              {/* Account Requirement Notice if not logged in */}
              {!user ? (
                <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-3 text-left my-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="leading-snug">
                    <span className="font-bold text-white block">Traveler Account Required (Free)</span>
                    <span className="text-[11px] text-stone-300">
                      Creating an account is free. An account is required so your digital pass can be securely linked and synced across your devices.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between gap-2 text-left my-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-[10px]">
                      Pass will link to: <strong className="text-white">{user.email || user.name}</strong>
                    </span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    Free Account
                  </span>
                </div>
              )}

              {/* CTA Button */}
              <button
                type="button"
                onClick={handlePurchase}
                disabled={isProcessing || !purchasesEnabled}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950 font-bold text-xs shadow-xl shadow-amber-500/25 transition transform active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                {!purchasesEnabled ? (
                  <span>Pass Purchases Closed (Pilot In Progress)</span>
                ) : isProcessing ? (
                  <span>Authorizing Explorer Pass...</span>
                ) : !user ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Sign In to Purchase Pass</span>
                  </>
                ) : (
                  <>
                    <span>
                      {selectedPlan === 'holiday'
                        ? 'Activate 14-Day Holiday Pass (€14.99)'
                        : 'Activate Annual Terroir Pass (€29.99)'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex flex-col items-center justify-center gap-1 text-[10px] text-stone-400 pt-1 text-center">
                <div className="flex items-center gap-1.5 text-stone-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Account registration is free · Explorer Pass is an optional upgrade</span>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
