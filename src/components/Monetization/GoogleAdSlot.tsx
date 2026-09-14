import React, { useEffect, useRef, useState } from 'react';
import { runtimeConfig } from '../../config/runtimeConfig';

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
  /** Private-pilot pass state. Public Explorer Pass sales remain disabled. */
  hasExplorerPass?: boolean;
  className?: string;
}

export const GoogleAdSlot: React.FC<GoogleAdSlotProps> = ({
  client = runtimeConfig.advertising.client,
  slot = runtimeConfig.advertising.slot,
  format = 'auto',
  hasExplorerPass = false,
  className = '',
}) => {
  const [adError, setAdError] = useState<boolean>(false);
  const adRef = useRef<HTMLModElement | null>(null);

  // Advertising enablement strictly comes from the central runtime config gate.
  // Callers cannot override the gate, and IDs alone never activate ads.
  const canRenderAd = Boolean(
    runtimeConfig.advertising.enabled &&
      !hasExplorerPass &&
      client &&
      slot &&
      !adError
  );

  useEffect(() => {
    if (!canRenderAd) return;

    const existingScript = document.querySelector('script[src*="pagead2.googlesyndication.com"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-adsense-script';
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onerror = () => setAdError(true);
      document.head.appendChild(script);
    }

    try {
      if (typeof window !== 'undefined' && adRef.current) {
        const isProcessed = adRef.current.getAttribute('data-adsbygoogle-status');
        if (!isProcessed) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      }
    } catch (error) {
      console.warn('Google AdSense render fallback:', error);
      setAdError(true);
    }
  }, [canRenderAd, client]);

  if (!canRenderAd) return null;

  return (
    <div className={`relative z-20 mx-auto w-full max-w-4xl px-3 py-1 text-center select-none ${className}`}>
      <div className="flex items-center justify-between pb-1 px-1">
        <span className="text-[9px] text-stone-500 uppercase tracking-widest font-mono">
          Advertisement
        </span>
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
