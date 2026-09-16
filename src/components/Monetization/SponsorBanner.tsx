import React, { useEffect, useState } from 'react';
import { ExternalLink, Sparkles, Car, Wine, Wifi } from 'lucide-react';

interface SponsorBannerProps {
  hasExplorerPass?: boolean;
  className?: string;
}

interface SponsorCampaign {
  id: string;
  tag: string;
  title: string;
  desc: string;
  ctaText: string;
  ctaUrl: string;
  subId: string;
  iconType: 'car' | 'gastronomy' | 'esim';
  accentColor: string;
}

const SPONSOR_CAMPAIGNS: SponsorCampaign[] = [
  {
    id: 'klook-experiences',
    tag: 'Affiliate · Experiences',
    title: 'Browse Food, Culture & Day-Trip Experiences',
    desc: 'Compare bookable activities and tours from Klook.',
    ctaText: 'Browse Experiences',
    ctaUrl: 'https://klook.tpx.lv/evzPnWq1',
    subId: 'terroir_banner_klook',
    iconType: 'gastronomy',
    accentColor: 'from-rose-500/20 via-stone-900 to-stone-950 border-rose-500/30',
  },
  {
    id: 'localrent-cars',
    tag: 'Affiliate · Car Rental',
    title: 'Compare Car Rental Options for Your Road Trip',
    desc: 'Browse rental-car options for independent travel between rural destinations.',
    ctaText: 'Compare Cars',
    ctaUrl: 'https://localrent.tpx.lv/tgiqwQZQ',
    subId: 'terroir_banner_localrent',
    iconType: 'car',
    accentColor: 'from-emerald-500/20 via-stone-900 to-stone-950 border-emerald-500/30',
  },
  {
    id: 'welcome-pickups',
    tag: 'Affiliate · Transfers',
    title: 'Pre-Book Airport & City Transfers',
    desc: 'Browse transfer options for arrivals, departures, and onward travel.',
    ctaText: 'Browse Transfers',
    ctaUrl: 'https://tpx.lv/75XqHdHY',
    subId: 'terroir_banner_welcome',
    iconType: 'car',
    accentColor: 'from-amber-500/20 via-stone-900 to-stone-950 border-amber-500/30',
  },
  {
    id: 'gettransfer-rides',
    tag: 'Affiliate · Transfers',
    title: 'Compare Private Transfer Options',
    desc: 'Browse private and group-transfer options for longer routes.',
    ctaText: 'Compare Transfers',
    ctaUrl: 'https://gettransfer.tpx.lv/PB1EGU6f',
    subId: 'terroir_banner_gettransfer',
    iconType: 'car',
    accentColor: 'from-emerald-500/20 via-stone-900 to-stone-950 border-emerald-500/30',
  },
  {
    id: 'yesim-esim',
    tag: 'Affiliate · Connectivity',
    title: 'Travel eSIMs for Data on the Road',
    desc: 'Browse eSIM data plans for supported travel destinations.',
    ctaText: 'Browse eSIMs',
    ctaUrl: 'https://yesim.tpx.lv/xKgaRoiL',
    subId: 'terroir_banner_yesim',
    iconType: 'esim',
    accentColor: 'from-cyan-500/20 via-stone-900 to-stone-950 border-cyan-500/30',
  },
];

const isTravelAffiliatesEnabled = (): boolean =>
  import.meta.env.VITE_ENABLE_TRAVEL_AFFILIATES === 'true';

const withSubId = (url: string, subId: string): string => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}sub_id=${encodeURIComponent(subId)}`;
};

export const SponsorBanner: React.FC<SponsorBannerProps> = ({
  hasExplorerPass = false,
  className = '',
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const affiliateEnabled = isTravelAffiliatesEnabled();

  useEffect(() => {
    if (!affiliateEnabled || hasExplorerPass) return undefined;

    const timer = window.setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % SPONSOR_CAMPAIGNS.length);
    }, 14000);

    return () => window.clearInterval(timer);
  }, [affiliateEnabled, hasExplorerPass]);

  if (!affiliateEnabled || hasExplorerPass) return null;

  const sponsor = SPONSOR_CAMPAIGNS[currentIdx];
  const affiliateUrl = withSubId(sponsor.ctaUrl, sponsor.subId);

  const renderIcon = (sizeClass = 'w-3.5 h-3.5') => {
    switch (sponsor.iconType) {
      case 'car':
        return <Car className={`${sizeClass} text-emerald-400`} />;
      case 'gastronomy':
        return <Wine className={`${sizeClass} text-rose-400`} />;
      case 'esim':
        return <Wifi className={`${sizeClass} text-cyan-400`} />;
      default:
        return <Sparkles className={`${sizeClass} text-amber-400`} />;
    }
  };

  return (
    <div
      className={`relative z-20 mx-auto w-full max-w-3xl px-2 sm:px-3 py-1 transition-all animate-in fade-in slide-in-from-top-1 duration-300 ${className}`}
      aria-label="Sponsored travel affiliate offer"
    >
      <div className="flex sm:hidden items-center justify-between gap-2 px-3 py-1 rounded-full bg-stone-950/90 backdrop-blur-xl border border-white/15 shadow-xl text-[11px] max-w-[92vw] mx-auto">
        <a
          href={affiliateUrl}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="flex items-center gap-1.5 min-w-0 flex-1 truncate text-stone-200 hover:text-white"
          title="Affiliate link — TerroirTrail may earn a commission"
        >
          <span className="shrink-0">{renderIcon('w-3 h-3')}</span>
          <span className="text-[8px] font-bold text-amber-400 uppercase tracking-wider shrink-0 bg-amber-400/10 px-1 py-0.2 rounded border border-amber-400/25">
            Affiliate
          </span>
          <span className="truncate text-[11px] font-medium text-stone-200">{sponsor.title}</span>
          <ExternalLink className="w-2.5 h-2.5 text-stone-400 shrink-0 ml-0.5" />
        </a>
      </div>

      <div
        className={`hidden sm:flex relative flex-row items-center justify-between gap-3 px-3.5 py-2 rounded-2xl bg-gradient-to-r ${sponsor.accentColor} border shadow-lg backdrop-blur-xl`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-xl bg-stone-900/90 border border-white/10 flex items-center justify-center shrink-0 shadow-sm">
            {renderIcon('w-4 h-4')}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-white/10 text-stone-300 uppercase tracking-wider">
                Affiliate · Sponsored
              </span>
              <span className="text-[10px] text-stone-400 font-medium truncate">
                {sponsor.tag}
              </span>
            </div>
            <div className="text-xs font-bold text-white truncate hover:underline">
              <a
                href={affiliateUrl}
                target="_blank"
                rel="sponsored noopener noreferrer"
              >
                {sponsor.title}
              </a>
            </div>
            <p className="text-[10px] text-stone-300 line-clamp-1">
              {sponsor.desc} TerroirTrail may earn a commission.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 justify-end">
          <a
            href={affiliateUrl}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-900/90 hover:bg-stone-850 text-stone-200 border border-white/10 hover:border-white/20 text-[11px] font-semibold transition active:scale-95 cursor-pointer shadow-sm"
          >
            <span>{sponsor.ctaText}</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </a>
        </div>
      </div>
    </div>
  );
};
