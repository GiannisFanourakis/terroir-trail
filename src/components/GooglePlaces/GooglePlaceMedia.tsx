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
 * Live producer imagery rendered through Places UI Kit.
 *
 * Google custom elements are created imperatively rather than through React JSX.
 * This avoids React/custom-element property upgrade edge cases and keeps failures
 * isolated to this media frame. If Google media cannot render, the fallback image
 * remains visible and the rest of TerroirTrail continues normally.
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
  const googleHostRef = useRef<HTMLDivElement>(null);
  const googlePlaceId = producer?.googlePlaceId?.trim();
  const isEligible = Boolean(
    producer && googlePlaceId && isGooglePlacesEligible(producer)
  );
  const isFeatureEnabled = runtimeConfig.googlePlacesMedia.enabled;
  const [shouldActivate, setShouldActivate] = useState(!deferUntilVisible);
  const [renderFailed, setRenderFailed] = useState(false);

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

  useEffect(() => {
    const host = googleHostRef.current;
    if (!host) return;

    host.replaceChildren();
    setRenderFailed(false);

    if (!shouldLoad || !isReady || status !== 'ready' || !googlePlaceId) {
      return;
    }

    try {
      const details = document.createElement('gmp-place-details-compact');
      details.setAttribute('orientation', 'vertical');
      details.setAttribute('truncation-preferred', '');
      details.style.width = '100%';
      details.style.maxWidth = 'none';
      details.style.margin = '0';
      details.style.padding = '0';
      details.style.border = '0';
      details.style.backgroundColor = 'transparent';
      details.style.colorScheme = 'dark';

      const request = document.createElement('gmp-place-details-place-request');
      request.setAttribute('place', googlePlaceId);

      const content = document.createElement('gmp-place-content-config');
      const placeMedia = document.createElement('gmp-place-media');
      placeMedia.setAttribute('lightbox-preferred', '');

      const attribution = document.createElement('gmp-place-attribution');
      attribution.setAttribute('light-scheme-color', 'gray');
      attribution.setAttribute('dark-scheme-color', 'white');

      content.append(placeMedia, attribution);
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
  }, [googlePlaceId, isReady, shouldLoad, status]);

  const showGoogle =
    shouldLoad &&
    isReady &&
    status === 'ready' &&
    Boolean(googlePlaceId) &&
    !renderFailed;

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

      <div
        ref={googleHostRef}
        className={`absolute inset-0 bg-stone-900 ${showGoogle ? '' : 'pointer-events-none opacity-0'}`}
        data-testid="google-places-ui-kit-host"
        aria-hidden={showGoogle ? undefined : true}
      />
    </div>
  );
};
