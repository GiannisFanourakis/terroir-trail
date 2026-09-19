import React, { useEffect, useRef, useState } from 'react';
import { Producer } from '../../types/terroir';
import { isGooglePlacesEligible } from '../../config/googlePlacesAllowlist';
import { useGooglePlacesUiKit } from '../../services/googlePlacesUiKit';
import { runtimeConfig } from '../../config/runtimeConfig';
import { Camera, Info } from 'lucide-react';

interface GooglePlaceMediaProps {
  producer: Producer | null;
  className?: string;
}

/**
 * Google Places media rendered exclusively through Places UI Kit.
 *
 * Compliance & trust invariants:
 * - Google media is rendered only by Places UI Kit, not custom photo fetch code.
 * - Google renders the media and attribution inside its own UI Kit component.
 * - TerroirTrail never persists, proxies, caches, or rehosts Google photo content.
 * - Editorial TerroirTrail data (visit status, road safety, reviews) remains separate.
 * - A manually audited Google Place ID plus verified TT location is required.
 * - Coordinates are never used as a fallback lookup.
 */
export const GooglePlaceMedia: React.FC<GooglePlaceMediaProps> = ({
  producer,
  className = '',
}) => {
  const googlePlaceId = producer?.googlePlaceId?.trim();
  const isEligible = Boolean(
    producer && googlePlaceId && isGooglePlacesEligible(producer)
  );
  const isFeatureEnabled = runtimeConfig.googlePlacesMedia.enabled;
  const { isReady, status } = useGooglePlacesUiKit(
    isEligible && isFeatureEnabled
  );
  const hostRef = useRef<HTMLDivElement>(null);
  const [renderFailed, setRenderFailed] = useState(false);

  useEffect(() => {
    if (!isReady || !googlePlaceId || !hostRef.current) return;

    const host = hostRef.current;
    host.replaceChildren();
    setRenderFailed(false);

    try {
      const details = document.createElement('gmp-place-details');
      details.style.width = '100%';
      details.style.maxWidth = '400px';
      details.style.margin = '0 auto';
      details.style.border = '0';
      details.style.backgroundColor = 'transparent';
      details.style.colorScheme = 'dark';

      const request = document.createElement('gmp-place-details-place-request');
      request.setAttribute('place', googlePlaceId);

      const content = document.createElement('gmp-place-content-config');
      const media = document.createElement('gmp-place-media');
      media.setAttribute('lightbox-preferred', '');

      const attribution = document.createElement('gmp-place-attribution');
      attribution.setAttribute('light-scheme-color', 'gray');
      attribution.setAttribute('dark-scheme-color', 'white');

      content.append(media, attribution);
      details.append(request, content);
      host.append(details);
    } catch (error) {
      console.warn('[GooglePlaceMedia] Places UI Kit render failed:', error);
      host.replaceChildren();
      setRenderFailed(true);
    }

    return () => {
      host.replaceChildren();
    };
  }, [googlePlaceId, isReady]);

  if (!producer || !googlePlaceId || !isFeatureEnabled || !isEligible) {
    return null;
  }

  if (status === 'unavailable' || status === 'error' || renderFailed) {
    return null;
  }

  return (
    <section
      className={`rounded-2xl bg-stone-900/90 border border-white/10 p-4 sm:p-5 space-y-3.5 ${className}`}
      aria-labelledby="google-place-media-heading"
      data-testid="google-place-media-section"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-amber-400 shrink-0" />
          <h4
            id="google-place-media-heading"
            className="text-sm font-bold text-white tracking-wide"
          >
            Photo from Google Maps
          </h4>
        </div>
        <span className="text-[10px] font-medium text-stone-400 bg-stone-800/80 px-2 py-0.5 rounded-full border border-white/5 flex items-center gap-1">
          <span>Live Google Places</span>
        </span>
      </div>

      <p className="text-xs text-stone-400 leading-relaxed">
        Live imagery is loaded fresh from Google Maps for discovery reference.
        Google renders the media and its attribution through Places UI Kit;
        TerroirTrail does not store or rehost the image.
      </p>

      <div
        className="relative w-full min-h-[220px] rounded-xl overflow-hidden bg-stone-950 border border-white/5 flex flex-col justify-center items-center"
        data-testid="google-places-container"
      >
        <div
          ref={hostRef}
          className="w-full min-h-[220px] flex items-center justify-center"
          data-testid="google-places-ui-kit-host"
        />
        {!isReady && (
          <div className="absolute inset-0 py-8 flex flex-col items-center justify-center gap-2 text-stone-500">
            <div className="w-5 h-5 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin" />
            <span className="text-xs">Loading Google Maps media...</span>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-white/5 flex items-start gap-1.5 text-[11px] text-stone-400">
        <Info className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
        <span>
          A Google photo does not establish road safety, rental-vehicle
          passability, or current public opening hours. Consult the verified
          TerroirTrail status fields above.
        </span>
      </div>
    </section>
  );
};
