import React, { useEffect, useRef, useState } from 'react';
import { Producer } from '../../types/terroir';
import { isGooglePlacesEligible } from '../../config/googlePlacesAllowlist';
import { useGooglePlacesUiKit } from '../../services/googlePlacesUiKit';
import { runtimeConfig } from '../../config/runtimeConfig';

interface GooglePlaceMediaProps {
  producer: Producer | null;
  className?: string;
  imageClassName?: string;
  fallbackUrl?: string;
  fallbackAlt?: string;
  deferUntilVisible?: boolean;
}

/**
 * Live producer imagery rendered exclusively through Places UI Kit.
 *
 * The component is intentionally presentation-only: no Google headings,
 * explanatory copy, ratings, hours, reviews, or other Place fields are shown.
 * TerroirTrail never persists, proxies, caches, or rehosts the Google image.
 */
export const GooglePlaceMedia: React.FC<GooglePlaceMediaProps> = ({
  producer,
  className = '',
  imageClassName = 'w-full h-full object-cover',
  fallbackUrl,
  fallbackAlt,
  deferUntilVisible = false,
}) => {
  const frameRef = useRef<HTMLDivElement>(null);
  const googlePlaceId = producer?.googlePlaceId?.trim();
  const isEligible = Boolean(
    producer && googlePlaceId && isGooglePlacesEligible(producer)
  );
  const isFeatureEnabled = runtimeConfig.googlePlacesMedia.enabled;
  const [shouldActivate, setShouldActivate] = useState(!deferUntilVisible);

  useEffect(() => {
    if (!deferUntilVisible) {
      setShouldActivate(true);
      return;
    }

    setShouldActivate(false);

    if (!isFeatureEnabled || !isEligible) return;

    const element = frameRef.current;
    if (!element) return;

    if (typeof IntersectionObserver === 'undefined') {
      setShouldActivate(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldActivate(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [deferUntilVisible, isEligible, isFeatureEnabled, producer?.id]);

  const shouldLoad =
    Boolean(googlePlaceId) &&
    isFeatureEnabled &&
    isEligible &&
    shouldActivate;

  const { isReady, status } = useGooglePlacesUiKit(shouldLoad);
  const showGoogle =
    shouldLoad && isReady && status === 'ready' && Boolean(googlePlaceId);

  return (
    <div
      ref={frameRef}
      className={`relative overflow-hidden bg-stone-900 ${className}`}
      data-testid="google-place-media-frame"
    >
      {fallbackUrl && (
        <img
          src={fallbackUrl}
          alt={fallbackAlt || producer?.name || 'Producer'}
          className={imageClassName}
          loading="lazy"
          decoding="async"
        />
      )}

      {showGoogle && googlePlaceId && (
        <div
          className="absolute inset-0 bg-stone-900"
          data-testid="google-places-ui-kit-host"
        >
          <gmp-place-details-compact
            orientation="vertical"
            truncation-preferred
            style={{
              width: '100%',
              height: '100%',
              maxWidth: 'none',
              margin: 0,
              padding: 0,
              border: 0,
              backgroundColor: 'transparent',
              colorScheme: 'dark',
            }}
          >
            <gmp-place-details-place-request place={googlePlaceId} />
            <gmp-place-content-config>
              <gmp-place-media
                lightbox-preferred
                preferred-size="large"
              />
              <gmp-place-attribution
                light-scheme-color="gray"
                dark-scheme-color="white"
              />
            </gmp-place-content-config>
          </gmp-place-details-compact>
        </div>
      )}
    </div>
  );
};
