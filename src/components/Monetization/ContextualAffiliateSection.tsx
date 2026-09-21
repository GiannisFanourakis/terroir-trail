import React, { useEffect, useRef } from 'react';
import { ExternalLink, Car, Navigation, Wifi } from 'lucide-react';
import {
  trackIntent,
  type AffiliateCampaignId,
} from '../../services/intentAnalytics';

export type ContextualAffiliateSurface = 'trip_preparation' | 'region_planning';

export interface ContextualCampaign {
  id: AffiliateCampaignId;
  name: string;
  category: string;
  tagline: string;
  ctaText: string;
  ctaUrl: string;
  subId: string;
  iconType: 'car' | 'transfer' | 'esim';
}

export const CONTEXTUAL_AFFILIATE_CAMPAIGNS: readonly ContextualCampaign[] = [
  {
    id: 'localrent-cars',
    name: 'Localrent',
    category: 'Car Rental',
    tagline: 'Compare local car rentals for rural routes',
    ctaText: 'Compare Cars',
    ctaUrl: 'https://localrent.tpx.lv/tgiqwQZQ',
    subId: 'terroir_banner_localrent',
    iconType: 'car',
  },
  {
    id: 'welcome-pickups',
    name: 'Welcome Pickups',
    category: 'Airport & City Transfers',
    tagline: 'Pre-book airport & city arrival rides',
    ctaText: 'Browse Transfers',
    ctaUrl: 'https://tpx.lv/75XqHdHY',
    subId: 'terroir_banner_welcome',
    iconType: 'transfer',
  },
  {
    id: 'gettransfer-rides',
    name: 'GetTransfer',
    category: 'Private Transfers',
    tagline: 'Compare intercity rides & private drivers',
    ctaText: 'Compare Rides',
    ctaUrl: 'https://gettransfer.tpx.lv/PB1EGU6f',
    subId: 'terroir_banner_gettransfer',
    iconType: 'transfer',
  },
  {
    id: 'yesim-esim',
    name: 'Yesim',
    category: 'Travel eSIM',
    tagline: 'Prepaid data for GPS and country roads',
    ctaText: 'Browse eSIMs',
    ctaUrl: 'https://yesim.tpx.lv/xKgaRoiL',
    subId: 'terroir_banner_yesim',
    iconType: 'esim',
  },
] as const;

export const isTravelAffiliatesEnabled = (): boolean =>
  import.meta.env.VITE_ENABLE_TRAVEL_AFFILIATES === 'true';

export const withSubId = (url: string, subId: string): string => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}sub_id=${encodeURIComponent(subId)}`;
};

export const recordAffiliateClick = async (
  campaignId: AffiliateCampaignId,
  sourceSurface: ContextualAffiliateSurface,
  destination?: string | null
) => {
  return trackIntent({
    event: 'affiliate_click',
    sourceSurface,
    affiliateCampaignId: campaignId,
    destination: destination ?? undefined,
  });
};

export const recordAffiliateImpression = async (
  campaignId: AffiliateCampaignId,
  sourceSurface: ContextualAffiliateSurface,
  destination?: string | null
) => {
  return trackIntent({
    event: 'affiliate_impression',
    sourceSurface,
    affiliateCampaignId: campaignId,
    destination: destination ?? undefined,
  });
};

export interface ContextualAffiliateSectionProps {
  sourceSurface: ContextualAffiliateSurface;
  hasExplorerPass?: boolean;
  destination?: string | null;
  className?: string;
}

export const ContextualAffiliateSection: React.FC<ContextualAffiliateSectionProps> = ({
  sourceSurface,
  hasExplorerPass = false,
  destination,
  className = '',
}) => {
  const affiliateEnabled = isTravelAffiliatesEnabled();
  const sectionRef = useRef<HTMLElement>(null);
  const impressedCampaignsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!affiliateEnabled || hasExplorerPass || !sectionRef.current) return undefined;

    let dwellTimer: number | null = null;

    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry && entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            if (dwellTimer === null) {
              dwellTimer = window.setTimeout(() => {
                for (const campaign of CONTEXTUAL_AFFILIATE_CAMPAIGNS) {
                  if (!impressedCampaignsRef.current.has(campaign.id)) {
                    impressedCampaignsRef.current.add(campaign.id);
                    void recordAffiliateImpression(campaign.id, sourceSurface, destination);
                  }
                }
              }, 1000);
            }
          } else {
            if (dwellTimer !== null) {
              window.clearTimeout(dwellTimer);
              dwellTimer = null;
            }
          }
        },
        { threshold: [0, 0.5, 1.0] }
      );

      observer.observe(sectionRef.current);
      return () => {
        if (dwellTimer !== null) window.clearTimeout(dwellTimer);
        observer.disconnect();
      };
    }
  }, [affiliateEnabled, hasExplorerPass, sourceSurface, destination]);

  if (!affiliateEnabled || hasExplorerPass) return null;

  const handleItemClick = (campaignId: AffiliateCampaignId) => {
    void recordAffiliateClick(campaignId, sourceSurface, destination);
  };

  const renderIcon = (type: ContextualCampaign['iconType']) => {
    switch (type) {
      case 'car':
        return <Car className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />;
      case 'transfer':
        return <Navigation className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />;
      case 'esim':
        return <Wifi className="w-3.5 h-3.5 text-cyan-400 shrink-0" aria-hidden="true" />;
      default:
        return <Navigation className="w-3.5 h-3.5 text-stone-400 shrink-0" aria-hidden="true" />;
    }
  };

  return (
    <section
      ref={sectionRef}
      className={`rounded-2xl border border-white/10 bg-stone-900/40 p-4 space-y-3 ${className}`}
      aria-label="Travel logistics and affiliate utility"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
              Affiliate · Travel Utility
            </span>
          </div>
          <h4 className="text-xs font-bold text-white">
            {sourceSurface === 'trip_preparation'
              ? 'Trip Logistics & Connectivity'
              : 'Regional Travel Logistics'}
          </h4>
        </div>
        <span className="text-[10px] text-stone-500 font-mono">
          4 services
        </span>
      </div>

      <p className="text-[10px] text-stone-400 leading-relaxed">
        Optional travel services for independent exploration. TerroirTrail may earn a partner commission at no extra cost to you. Affiliate links never affect producer selection, visit facts, road ratings, or ranking.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {CONTEXTUAL_AFFILIATE_CAMPAIGNS.map((campaign) => {
          const affiliateUrl = withSubId(campaign.ctaUrl, campaign.subId);
          return (
            <a
              key={campaign.id}
              href={affiliateUrl}
              target="_blank"
              rel="sponsored noopener noreferrer"
              onClick={() => handleItemClick(campaign.id)}
              className="group flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-950/60 hover:bg-stone-900 border border-white/10 hover:border-amber-500/30 transition-all text-left"
              data-campaign-id={campaign.id}
            >
              <div className="w-7 h-7 rounded-lg bg-stone-900 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-amber-500/40 transition-colors">
                {renderIcon(campaign.iconType)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-stone-200 group-hover:text-amber-300 transition-colors truncate">
                    {campaign.name}
                  </span>
                  <ExternalLink className="w-3 h-3 text-stone-500 group-hover:text-amber-400 transition-colors shrink-0" aria-hidden="true" />
                </div>
                <div className="text-[10px] font-semibold text-stone-400 truncate">
                  {campaign.category}
                </div>
                <p className="text-[10px] text-stone-500 line-clamp-1 mt-0.5">
                  {campaign.tagline}
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
};
