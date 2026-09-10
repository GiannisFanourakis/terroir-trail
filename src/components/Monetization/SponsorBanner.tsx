import React, { useState, useEffect } from 'react';
import { ExternalLink, Crown, Sparkles, Plane, Car, Home } from 'lucide-react';

interface SponsorBannerProps {
  hasExplorerPass?: boolean;
  onOpenExplorerPass?: () => void;
  className?: string;
}

interface SponsorCampaign {
  id: string;
  tag: string;
  title: string;
  desc: string;
  ctaText: string;
  ctaUrl: string;
  iconType: 'flight' | 'car' | 'villa' | 'gastronomy';
  accentColor: string;
}

const SPONSOR_CAMPAIGNS: SponsorCampaign[] = [
  {
    id: 'aegean-routes',
    tag: 'Official Partner · Island Travel',
    title: 'Fly to the Terroir: Direct Routes to Crete & Tuscany',
    desc: 'Boutique flights with dedicated regional wine & olive oil luggage allowances.',
    ctaText: 'View Flight Fares',
    ctaUrl: 'https://en.aegeanair.com',
    iconType: 'flight',
    accentColor: 'from-sky-500/20 via-stone-900 to-stone-950 border-sky-500/30',
  },
  {
    id: 'hybrid-car-rentals',
    tag: 'Partner · Terroir Mobility',
    title: 'All-Terrain Hybrid Rentals for Mountain Wine Trails',
    desc: 'Navigate rural mountain switchbacks with zero-excess insurance and instant pickup.',
    ctaText: 'Check Island Rates',
    ctaUrl: 'https://www.rentalcars.com',
    iconType: 'car',
    accentColor: 'from-emerald-500/20 via-stone-900 to-stone-950 border-emerald-500/30',
  },
  {
    id: 'agriturismo-stays',
    tag: 'Partner · Vineyard Lodging',
    title: 'Stay in Restored Olive Mills & Vineyard Stone Villas',
    desc: 'Authentic agritourism farmhouses nestled directly next to independent producers.',
    ctaText: 'Discover Stays',
    ctaUrl: 'https://www.agriturismo.it',
    iconType: 'villa',
    accentColor: 'from-amber-500/20 via-stone-900 to-stone-950 border-amber-500/30',
  },
];

export const SponsorBanner: React.FC<SponsorBannerProps> = ({
  hasExplorerPass = false,
  onOpenExplorerPass,
  className = '',
}) => {
  // If the user is a VIP Passholder, they enjoy an entirely ad-free experience!
  if (hasExplorerPass) return null;

  const [currentIdx, setCurrentIdx] = useState<number>(0);

  // Rotate sponsor every 14 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % SPONSOR_CAMPAIGNS.length);
    }, 14000);
    return () => clearInterval(timer);
  }, []);

  const sponsor = SPONSOR_CAMPAIGNS[currentIdx];

  const renderIcon = (sizeClass = 'w-3.5 h-3.5') => {
    switch (sponsor.iconType) {
      case 'flight':
        return <Plane className={`${sizeClass} text-sky-400`} />;
      case 'car':
        return <Car className={`${sizeClass} text-emerald-400`} />;
      case 'villa':
        return <Home className={`${sizeClass} text-amber-400`} />;
      default:
        return <Sparkles className={`${sizeClass} text-amber-400`} />;
    }
  };

  return (
    <div
      className={`relative z-20 mx-auto w-full max-w-3xl px-2 sm:px-3 py-1 transition-all animate-in fade-in slide-in-from-top-1 duration-300 ${className}`}
    >
      {/* ── Mobile View (< sm): Sleek, ultra-compact glass pill badge that NEVER obscures Android controls ── */}
      <div className="flex sm:hidden items-center justify-between gap-2 px-3 py-1 rounded-full bg-stone-950/90 backdrop-blur-xl border border-white/15 shadow-xl text-[11px] max-w-[92vw] mx-auto">
        <a
          href={sponsor.ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 min-w-0 flex-1 truncate text-stone-200 hover:text-white"
        >
          <span className="shrink-0">{renderIcon('w-3 h-3')}</span>
          <span className="text-[8px] font-bold text-amber-400 uppercase tracking-wider shrink-0 bg-amber-400/10 px-1 py-0.2 rounded border border-amber-400/25">
            Partner
          </span>
          <span className="truncate text-[11px] font-medium text-stone-200">{sponsor.title}</span>
          <ExternalLink className="w-2.5 h-2.5 text-stone-400 shrink-0 ml-0.5" />
        </a>

        {onOpenExplorerPass && (
          <button
            type="button"
            onClick={onOpenExplorerPass}
            className="flex items-center gap-1 text-[9px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 px-2 py-0.5 rounded-full shrink-0 transition cursor-pointer"
            title="Remove ads with Terroir Holiday Pass (€14.99)"
          >
            <Crown className="w-2.5 h-2.5 text-amber-400 shrink-0" />
            <span>VIP</span>
          </button>
        )}
      </div>

      {/* ── Desktop View (≥ sm): Full rich sponsor card in top-middle of web app ── */}
      <div
        className={`hidden sm:flex relative flex-row items-center justify-between gap-3 px-3.5 py-2 rounded-2xl bg-gradient-to-r ${sponsor.accentColor} border shadow-lg backdrop-blur-xl`}
      >
        {/* Left: Sponsor Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-xl bg-stone-900/90 border border-white/10 flex items-center justify-center shrink-0 shadow-sm">
            {renderIcon('w-4 h-4')}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-white/10 text-stone-300 uppercase tracking-wider">
                Ad · Sponsored
              </span>
              <span className="text-[10px] text-stone-400 font-medium truncate">
                {sponsor.tag}
              </span>
            </div>
            <div className="text-xs font-bold text-white truncate hover:underline">
              <a href={sponsor.ctaUrl} target="_blank" rel="noopener noreferrer">
                {sponsor.title}
              </a>
            </div>
            <p className="text-[10px] text-stone-300 line-clamp-1">
              {sponsor.desc}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 justify-end">
          {/* External Sponsor Link */}
          <a
            href={sponsor.ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-900/90 hover:bg-stone-850 text-stone-200 border border-white/10 hover:border-white/20 text-[11px] font-semibold transition active:scale-95 cursor-pointer shadow-sm"
          >
            <span>{sponsor.ctaText}</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </a>

          {/* Ad-Free Upgrade Hook for VIP Pass */}
          {onOpenExplorerPass && (
            <button
              type="button"
              onClick={onOpenExplorerPass}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition active:scale-95 cursor-pointer"
              title="Upgrade to Terroir Holiday Pass (€14.99) for a 100% Ad-Free Experience"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Ad-Free VIP</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
