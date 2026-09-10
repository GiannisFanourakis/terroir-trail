import React, { useState } from 'react';
import { UserProfile } from '../../types/auth';
import { 
  X, Award, CheckCircle2, Sparkles, ShieldCheck, 
  Wine, Gift, Compass, CreditCard, Apple, ArrowRight, Star, Lock
} from 'lucide-react';

interface ExplorerPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onActivatePass: (days?: number) => Promise<void> | void;
  onOpenAuth: (role?: 'traveler' | 'producer') => void;
}

export const ExplorerPassModal: React.FC<ExplorerPassModalProps> = ({
  isOpen,
  onClose,
  user,
  onActivatePass,
  onOpenAuth,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'upgrade' | 'compare'>('upgrade');
  const [selectedPlan, setSelectedPlan] = useState<'holiday' | 'annual'>('holiday');
  const [paymentMethod, setPaymentMethod] = useState<'apple' | 'google' | 'card'>('apple');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isPurchased, setIsPurchased] = useState<boolean>(false);

  const perks = [
    {
      icon: '🍷',
      title: 'Complimentary Welcome Pours',
      desc: 'An extra cellar-reserve glass at participating boutique wineries.',
    },
    {
      icon: '🧀',
      title: 'Free Artisan Meze Platter',
      desc: 'Complimentary sheep graviera cheese & organic olives with any tasting.',
    },
    {
      icon: '🏷️',
      title: '10% Cellar-Door Bottle Discount',
      desc: 'Direct savings on bottle purchases to pack in your suitcase or cellar.',
    },
    {
      icon: '🛂',
      title: 'Unlimited Terroir Passport & Cellar Journal',
      desc: 'Collect unlimited digital artisan stamps and record sommelier tasting notes.',
    },
    {
      icon: '🛡️',
      title: '100% Ad-Free Pure Experience',
      desc: 'Explore the map, directory, and estate profiles completely free of sponsor ads.',
    },
    {
      icon: '✨',
      title: 'VIP Estate Host Welcome',
      desc: 'Recognized guest status and personalized hospitality with family makers.',
    },
  ];

  const comparisonRows = [
    { feature: 'Interactive Artisanal Map & GPS', free: '✅ Included', vip: '✅ Included' },
    { feature: 'Verified Family Producer Directory', free: '✅ Included', vip: '✅ Included' },
    { feature: 'Welcome Pour of Library Wine', free: '❌ Standard Tasting', vip: '⭐ Complimentary Glass' },
    { feature: 'Artisanal Meze Pairing', free: '❌ Extra Charge', vip: '⭐ Free Graviera & Olives' },
    { feature: 'Direct Cellar Bottle Purchases', free: '❌ 0% Discount', vip: '⭐ 10% Off All Bottles' },
    { feature: 'Passport Stamps & Journal', free: 'Up to 3 Stamps', vip: '⭐ Unlimited Stamps' },
    { feature: 'Sponsor & Partner Ads', free: 'Standard Ads', vip: '⭐ 100% Ad-Free' },
    { feature: 'Digital Holographic Wallet Pass', free: '❌ None', vip: '⭐ Instant Apple/Google Pass' },
  ];

  const handlePurchase = async () => {
    // 1. Mandatory requirement: User must have an authenticated account to obtain a pass
    if (!user) {
      onClose();
      onOpenAuth('traveler');
      return;
    }

    const stripeUrl = selectedPlan === 'holiday'
      ? import.meta.env.VITE_STRIPE_EXPLORER_PASS_URL
      : import.meta.env.VITE_STRIPE_ANNUAL_PASS_URL || import.meta.env.VITE_STRIPE_EXPLORER_PASS_URL;

    if (stripeUrl) {
      setIsProcessing(true);
      try {
        const targetUrl = new URL(stripeUrl);
        if (user?.email) targetUrl.searchParams.set('prefilled_email', user.email);
        if (user?.id) targetUrl.searchParams.set('client_reference_id', user.id);
        window.location.href = targetUrl.toString();
        return;
      } catch {
        window.location.href = stripeUrl;
        return;
      }
    }

    setIsProcessing(true);
    try {
      // Fallback: simulated activation if no Stripe link configured yet
      await new Promise((res) => setTimeout(res, 900));
      await onActivatePass(selectedPlan === 'holiday' ? 14 : 365);
      setIsPurchased(true);
    } catch (e) {
      console.error('Pass activation failed:', e);
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
                    VIP 2026
                  </span>
                </div>
                <p className="text-xs text-amber-200/80 mt-0.5">
                  The ultimate 14-day holiday pass for authentic Mediterranean agritourism
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
              👑 Holiday Pass (€14.99)
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition cursor-pointer ${
                activeTab === 'compare'
                  ? 'border-amber-400 text-amber-400 font-bold'
                  : 'border-transparent text-stone-400 hover:text-white'
              }`}
            >
              ⚖️ Free vs VIP Comparison
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
                  VIP Explorer Pass Activated!
                </h3>
                <p className="text-xs text-stone-300 max-w-sm mx-auto">
                  Welcome, <span className="text-amber-400 font-bold">{user?.name}</span>. Your VIP pass is active across all participating estates and artisan destinations.
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
                    VALID · 14 DAYS
                  </span>
                </div>

                <div className="space-y-1 my-3">
                  <div className="text-[10px] uppercase tracking-wider text-amber-200/70 font-semibold">Passholder</div>
                  <div className="font-bold text-white text-base">{user?.name}</div>
                  <div className="text-[10px] text-stone-400 font-mono">PASS #TR-2026-{user?.id.slice(-6).toUpperCase()}</div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-amber-300 font-medium">
                  <span>Show at estate cellar doors</span>
                  <span>10% Off Bottles & Free Meze</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full max-w-sm py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-xl transition active:scale-98 cursor-pointer mx-auto block"
              >
                Start Exploring with VIP Pass
              </button>
            </div>
          ) : activeTab === 'compare' ? (
            /* Freemium Comparison Matrix View */
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="text-center pb-1">
                <h3 className="font-serif-title font-bold text-sm text-white">
                  Choose the Perfect Agritourism Experience
                </h3>
                <p className="text-[11px] text-stone-400">
                  Explore basic makers for free or upgrade to the full VIP agritourism trail
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 overflow-hidden bg-stone-900/80 shadow-lg">
                <div className="grid grid-cols-12 bg-stone-900 p-2.5 border-b border-white/10 text-[11px] font-bold">
                  <div className="col-span-6 text-stone-400">Platform Feature</div>
                  <div className="col-span-3 text-center text-stone-300">Free (€0)</div>
                  <div className="col-span-3 text-center text-amber-400">VIP Pass</div>
                </div>

                <div className="divide-y divide-white/5 text-[11px]">
                  {comparisonRows.map((row, i) => (
                    <div key={i} className="grid grid-cols-12 p-2.5 items-center hover:bg-white/5 transition">
                      <div className="col-span-6 font-medium text-stone-300">{row.feature}</div>
                      <div className="col-span-3 text-center text-stone-400 text-[10px]">{row.free}</div>
                      <div className="col-span-3 text-center text-amber-300 font-semibold text-[10px]">{row.vip}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('upgrade')}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg transition active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Get Terroir Holiday Pass (€14.99)</span>
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
                    ✓ Pays for itself at 1st winery
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
                    ✓ Year-round perks & harvest invites
                  </span>
                </button>
              </div>

              {/* Perks List */}
              <div className="space-y-2">
                <span className="text-stone-400 text-[11px] font-semibold block">
                  Included VIP Privileges
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
              <div className="pt-3 border-t border-white/10 flex flex-col items-center justify-center text-center gap-2">
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-stone-200 font-mono text-[10px] font-bold">
                    Pay
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-stone-200 font-mono text-[10px] font-bold">
                    GPay
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-stone-200 font-mono text-[10px] font-bold">
                    Visa
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-stone-200 font-mono text-[10px] font-bold">
                    Mastercard
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-stone-200 font-mono text-[10px] font-bold">
                    AMEX
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-stone-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>256-Bit Encrypted Checkout Powered by <strong className="text-white">Stripe</strong></span>
                </div>
              </div>

              {/* Account Requirement Notice if not logged in */}
              {!user ? (
                <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-3 text-left my-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="leading-snug">
                    <span className="font-bold text-white block">Traveler Account Required</span>
                    <span className="text-[11px] text-stone-300">
                      You must sign in or create a traveler account to link and activate your VIP Pass across all devices.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 text-left my-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-[10px]">
                    Pass will be linked to: <strong className="text-white">{user.email || user.name}</strong>
                  </span>
                </div>
              )}

              {/* CTA Button */}
              <button
                type="button"
                onClick={handlePurchase}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950 font-bold text-xs shadow-xl shadow-amber-500/25 transition transform active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                {isProcessing ? (
                  <span>Authorizing VIP Pass...</span>
                ) : !user ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Sign In to Get VIP Pass (€14.99)</span>
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

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>100% Guaranteed · Refundable if unused within 48 hours</span>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
