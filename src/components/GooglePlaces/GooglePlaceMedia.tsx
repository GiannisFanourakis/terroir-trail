import React, { useEffect, useRef, useState } from 'react';
import { Producer } from '../../types/terroir';
import { isGooglePlacesEligible } from '../../config/googlePlacesAllowlist';
import { useGooglePlacesUiKit } from '../../services/googlePlacesUiKit';
import { runtimeConfig } from '../../config/runtimeConfig';
import { Camera, Info } from 'lucide-react';
import { GooglePlacePhotoCarousel } from './GooglePlacePhotoCarousel';

interface GooglePlaceMediaProps {
  producer: Producer | null;
  className?: string;
  variant?: 'detail' | 'card';
}

/**
 * Google Places media component.
 *
 * Compliance & Trust Invariants:
 * - Card media remains rendered by Google's compact Places UI Kit element.
 * - Detail/gallery media is fetched fresh from a Place object and never persisted or cached.
 * - Google Maps and photo-author attributions remain visible with gallery imagery.
 * - Editorial TerroirTrail data (visit status, road safety, reviews) remains completely separate.
 * - A manually audited Google Place ID is required; coordinates are never used as a fallback lookup.
 */
export const GooglePlaceMedia: React.FC<GooglePlaceMediaProps> = ({
  producer,
  className = '',
  variant = 'detail',
}) => {
  const googlePlaceId = producer?.googlePlaceId?.trim();
  const isEligible = Boolean(
    producer && googlePlaceId && isGooglePlacesEligible(producer.id)
  );
  const isFeatureEnabled = runtimeConfig.googlePlacesMedia.enabled;
  const { isReady, status } = useGooglePlacesUiKit(
    isEligible && isFeatureEnabled
  );
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const [cardRenderFailed, setCardRenderFailed] = useState(false);

  useEffect(() => {
    if (
      variant !== 'card' ||
      !isReady ||
      !googlePlaceId ||
      !cardContainerRef.current
    ) {
      return;
    }

    const host = cardContainerRef.current;
    host.replaceChildren();
    setCardRenderFailed(false);

    try {
      const compact = document.createElement('gmp-place-details-compact');

      compact.setAttribute('orientation', 'vertical');
      compact.setAttribute('truncation-preferred', '');
      compact.style.width = '100%';
      compact.style.margin = '0';
      compact.style.padding = '0';
      compact.style.border = '0';
      compact.style.backgroundColor = 'transparent';
      compact.style.colorScheme = 'dark';

      const request = document.createElement('gmp-place-details-place-request');
      request.setAttribute('place', `places/${googlePlaceId}`);

      const content = document.createElement('gmp-place-content-config');
      const media = document.createElement('gmp-place-media');
      const attribution = document.createElement('gmp-place-attribution');
      attribution.setAttribute('light-scheme-color', 'gray');
      attribution.setAttribute('dark-scheme-color', 'white');

      content.append(media, attribution);
      compact.append(request, content);
      host.append(compact);
    } catch (error) {
      console.warn('[GooglePlaceMedia] Compact card media failed:', error);
      host.replaceChildren();
      setCardRenderFailed(true);
    }

    return () => {
      host.replaceChildren();
    };
  }, [variant, isReady, googlePlaceId]);

  // Fail closed unless the producer is allowlisted and has a verified persistent Place ID.
  if (!producer || !googlePlaceId || !isFeatureEnabled || !isEligible) {
    return null;
  }

  // If no API key is configured or loader failed, fail silently without breaking the drawer.
  if (status === 'unavailable' || status === 'error') {
    return null;
  }

  if (variant === 'card') {
    if (cardRenderFailed) {
      return null;
    }

    return (
      <div
        ref={cardContainerRef}
        className={`w-full bg-stone-950 overflow-hidden ${className}`}
        data-testid="google-place-media-card"
      >
        {!isReady && (
          <div className="h-40 w-full flex items-center justify-center bg-stone-900">
            <div className="w-5 h-5 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin" />
          </div>
        )}
      </div>
    );
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
            Photos from Google Maps
          </h4>
        </div>
        <span className="text-[10px] font-medium text-stone-400 bg-stone-800/80 px-2 py-0.5 rounded-full border border-white/5 flex items-center gap-1">
          <span>Live Google Places</span>
        </span>
      </div>

      <p className="text-xs text-stone-400 leading-relaxed">
        Live imagery is loaded fresh from Google Maps for discovery reference.
        Photos remain attributed to their Google Maps contributors and do not
        represent official TerroirTrail photography or verified access
        guarantees.
      </p>

      <div
        className="w-full min-h-[220px] rounded-xl overflow-hidden bg-stone-950 border border-white/5 flex flex-col justify-center items-center"
        data-testid="google-places-container"
      >
        {isReady ? (
          <GooglePlacePhotoCarousel
            producer={producer}
            className="w-full h-72 sm:h-80"
            imageClassName="w-full h-full object-cover"
            maxPhotos={10}
            autoPlay
            intervalMs={5200}
            showControls
            showCounter
            showAttribution
          />
        ) : (
          <div className="py-8 flex flex-col items-center gap-2 text-stone-500">
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
