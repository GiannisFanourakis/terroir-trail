import React, { useEffect, useRef, useState } from 'react';
import { SponsorBanner } from './SponsorBanner';

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

interface GoogleAdSlotProps {
  /** Google AdSense Publisher Client ID (e.g. "ca-pub-1234567890123456") */
  client?: string;
  /** Google AdSense Slot ID (e.g. "1234567890") */
  slot?: string;
  /** Ad layout format */
  format?: 'auto' | 'horizontal' | 'rectangle';
  /** Whether the user has an active VIP Explorer Pass (if true, NO ads are shown) */
  hasExplorerPass?: boolean;
  /** Callback to trigger VIP Pass upgrade */
  onOpenExplorerPass?: () => void;
  className?: string;
}

export const GoogleAdSlot: React.FC<GoogleAdSlotProps> = ({
  client = import.meta.env.VITE_ADSENSE_CLIENT_ID,
  slot = import.meta.env.VITE_ADSENSE_SLOT_ID,
  format = 'auto',
  hasExplorerPass = false,
  onOpenExplorerPass,
  className = '',
}) => {
  // Passholders enjoy a completely ad-free pure experience
  if (hasExplorerPass) return null;

  const [adLoaded, setAdLoaded] = useState<boolean>(false);
  const [adError, setAdError] = useState<boolean>(false);
  const adRef = useRef<HTMLModElement | null>(null);

  // If no AdSense publisher ID is configured yet in environment, show the curated sponsor banner
  if (!client || !slot || adError) {
    return (
      <SponsorBanner
        hasExplorerPass={hasExplorerPass}
        onOpenExplorerPass={onOpenExplorerPass}
        className={className}
      />
    );
  }

  useEffect(() => {
    // 1. Inject AdSense library script if not already in document
    const scriptId = 'google-adsense-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onerror = () => setAdError(true);
      document.head.appendChild(script);
    }

    // 2. Request ad fill from Google
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setAdLoaded(true);
      }
    } catch (e) {
      console.warn('Google AdSense render fallback:', e);
      setAdError(true);
    }
  }, [client, slot]);

  return (
    <div className={`relative z-20 mx-auto w-full max-w-4xl px-3 py-1 text-center select-none ${className}`}>
      <div className="flex items-center justify-between pb-1 px-1">
        <span className="text-[9px] text-stone-500 uppercase tracking-widest font-mono">
          Advertisement
        </span>
        {onOpenExplorerPass && (
          <button
            type="button"
            onClick={onOpenExplorerPass}
            className="text-[10px] text-amber-400/80 hover:text-amber-300 transition hover:underline cursor-pointer"
          >
            Remove Ads with VIP Pass
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-stone-900/80 p-1 min-h-[60px] flex items-center justify-center">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
};
