import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Producer } from '../../types/terroir';
import { isGooglePlacesEligible } from '../../config/googlePlacesAllowlist';
import { runtimeConfig } from '../../config/runtimeConfig';
import { useGooglePlacesUiKit } from '../../services/googlePlacesUiKit';

interface GooglePhotoAttribution {
  displayName: string;
  uri?: string;
  photoURI?: string;
}

interface GoogleCarouselPhoto {
  uri: string;
  googleMapsURI?: string;
  authorAttributions: GooglePhotoAttribution[];
}

const mapModernPhotos = (
  photos: readonly google.maps.places.Photo[] | undefined,
  maxPhotos: number
): GoogleCarouselPhoto[] =>
  (photos ?? [])
    .slice(0, Math.max(1, maxPhotos))
    .map((photo) => ({
      uri: photo.getURI({ maxWidth: 1600, maxHeight: 1000 }),
      googleMapsURI: photo.googleMapsURI ?? undefined,
      authorAttributions: (photo.authorAttributions ?? []).map((author) => ({
        displayName: author.displayName,
        uri: author.uri ?? undefined,
        photoURI: author.photoURI ?? undefined,
      })),
    }))
    .filter((photo) => Boolean(photo.uri));

const parseLegacyAttribution = (
  htmlAttributions: readonly string[] | undefined
): GooglePhotoAttribution[] => {
  if (!htmlAttributions?.length || typeof document === 'undefined') return [];

  return htmlAttributions.reduce<GooglePhotoAttribution[]>((items, html) => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    const anchor = wrapper.querySelector('a');
    const displayName = (anchor?.textContent || wrapper.textContent || '').trim();

    if (!displayName) return items;

    items.push({
      displayName,
      ...(anchor?.href ? { uri: anchor.href } : {}),
    });
    return items;
  }, []);
};

const fetchLegacyPhotos = async (
  placeId: string,
  maxPhotos: number,
  googleMapsURI?: string
): Promise<GoogleCarouselPhoto[]> =>
  new Promise((resolve) => {
    try {
      const service = new google.maps.places.PlacesService(
        document.createElement('div')
      );
      service.getDetails(
        {
          placeId,
          fields: ['photos'],
        },
        (result, status) => {
          if (
            status !== google.maps.places.PlacesServiceStatus.OK ||
            !result?.photos?.length
          ) {
            resolve([]);
            return;
          }

          resolve(
            result.photos
              .slice(0, Math.max(1, maxPhotos))
              .map((photo) => ({
                uri: photo.getUrl({ maxWidth: 1600, maxHeight: 1000 }),
                googleMapsURI,
                authorAttributions: parseLegacyAttribution(
                  photo.html_attributions
                ),
              }))
              .filter((photo) => Boolean(photo.uri))
          );
        }
      );
    } catch {
      resolve([]);
    }
  });

interface GooglePlacePhotoCarouselProps {
  producer: Producer | null;
  className?: string;
  imageClassName?: string;
  fallbackUrl?: string;
  fallbackAlt?: string;
  maxPhotos?: number;
  autoPlay?: boolean;
  intervalMs?: number;
  showControls?: boolean;
  showCounter?: boolean;
  showDots?: boolean;
  showAttribution?: boolean;
  pauseOnHover?: boolean;
  onAvailabilityChange?: (hasPhotos: boolean) => void;
}

/**
 * Live Google Places photo carousel.
 *
 * Compliance invariants:
 * - Photo URIs are obtained fresh from a Place object via Maps JavaScript API.
 * - Google photo URIs / photo objects are never persisted, cached, proxied, or stored.
 * - Google Maps attribution remains visible in the same visual container.
 * - Photo author attribution is displayed whenever Google provides it.
 * - A manually audited Google Place ID and verified TerroirTrail location are required.
 */
export const GooglePlacePhotoCarousel: React.FC<
  GooglePlacePhotoCarouselProps
> = ({
  producer,
  className = '',
  imageClassName = 'w-full h-full object-cover',
  fallbackUrl,
  fallbackAlt,
  maxPhotos = 10,
  autoPlay = true,
  intervalMs = 5500,
  showControls = true,
  showCounter = true,
  showDots = true,
  showAttribution = true,
  pauseOnHover = true,
  onAvailabilityChange,
}) => {
  const googlePlaceId = producer?.googlePlaceId?.trim();
  const isEligible = Boolean(
    producer && googlePlaceId && isGooglePlacesEligible(producer)
  );
  const isFeatureEnabled = runtimeConfig.googlePlacesMedia.enabled;
  const shouldLoad = isEligible && isFeatureEnabled;
  const { isReady, status } = useGooglePlacesUiKit(shouldLoad);

  const [photos, setPhotos] = useState<GoogleCarouselPhoto[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [hasCompletedPhotoFetch, setHasCompletedPhotoFetch] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    setPhotos([]);
    setActiveIndex(0);
    setLoadFailed(false);
    setHasCompletedPhotoFetch(false);
    onAvailabilityChange?.(false);

    if (!shouldLoad || !isReady || !googlePlaceId) {
      return () => {
        cancelled = true;
      };
    }

    const loadPhotos = async () => {
      try {
        const placesLibrary = (await window.google.maps.importLibrary(
          'places'
        )) as google.maps.PlacesLibrary;

        const place = new placesLibrary.Place({ id: googlePlaceId });
        await place.fetchFields({
          fields: ['displayName', 'photos'],
        });

        if (cancelled) return;

        let freshPhotos = mapModernPhotos(place.photos, maxPhotos);

        // Some legacy-backed business records still expose photos through
        // PlacesService even when the modern Place.photos result is empty.
        if (freshPhotos.length === 0) {
          freshPhotos = await fetchLegacyPhotos(
            googlePlaceId,
            maxPhotos,
            producer?.googleMapsUrl
          );
        }

        if (cancelled) return;

        setPhotos(freshPhotos);
        setLoadFailed(false);
        setHasCompletedPhotoFetch(true);
        onAvailabilityChange?.(freshPhotos.length > 0);
      } catch (error) {
        if (cancelled) return;

        // A modern Place request can fail for a stale/legacy record while the
        // legacy details service can still resolve its photos. Try that path
        // before falling back to category imagery.
        const legacyPhotos = await fetchLegacyPhotos(
          googlePlaceId,
          maxPhotos,
          producer?.googleMapsUrl
        );

        if (cancelled) return;

        if (legacyPhotos.length > 0) {
          setPhotos(legacyPhotos);
          setLoadFailed(false);
          setHasCompletedPhotoFetch(true);
          onAvailabilityChange?.(true);
          return;
        }

        console.warn('[GooglePlacePhotoCarousel] Photo fetch failed:', error);
        setPhotos([]);
        setLoadFailed(true);
        setHasCompletedPhotoFetch(true);
        onAvailabilityChange?.(false);
      }
    };

    void loadPhotos();

    return () => {
      cancelled = true;
    };
  }, [googlePlaceId, isReady, maxPhotos, onAvailabilityChange, producer?.googleMapsUrl, shouldLoad]);

  useEffect(() => {
    if (!autoPlay || isPaused || photos.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % photos.length);
    }, Math.max(2500, intervalMs));

    return () => window.clearInterval(timer);
  }, [autoPlay, intervalMs, isPaused, photos.length]);

  useEffect(() => {
    if (activeIndex >= photos.length && photos.length > 0) {
      setActiveIndex(0);
    }
  }, [activeIndex, photos.length]);

  const activePhoto = photos[activeIndex];
  const primaryAuthor = activePhoto?.authorAttributions?.[0];

  const fallback = useMemo(() => {
    if (!fallbackUrl) return null;
    return (
      <img
        src={fallbackUrl}
        alt={fallbackAlt || producer?.name || 'Producer'}
        className={imageClassName}
        loading="lazy"
        decoding="async"
      />
    );
  }, [fallbackAlt, fallbackUrl, imageClassName, producer?.name]);

  const goPrevious = () => {
    if (photos.length <= 1) return;
    setActiveIndex((current) =>
      current === 0 ? photos.length - 1 : current - 1
    );
  };

  const goNext = () => {
    if (photos.length <= 1) return;
    setActiveIndex((current) => (current + 1) % photos.length);
  };

  if (
    !producer ||
    !googlePlaceId ||
    !isFeatureEnabled ||
    !isEligible ||
    status === 'unavailable' ||
    status === 'error' ||
    loadFailed
  ) {
    return fallback;
  }

  // Do not flash the neutral category placeholder while an eligible producer's
  // live Google Places media is still loading. On slower mobile connections the
  // previous behavior made the placeholder look like the final producer image.
  if (
    status === 'loading' ||
    (shouldLoad && isReady && !hasCompletedPhotoFetch)
  ) {
    return (
      <div
        className={`relative overflow-hidden bg-stone-900 ${className}`}
        data-testid="google-place-photo-carousel-loading"
        role="status"
        aria-live="polite"
        aria-label={`Loading Google Maps photos for ${producer.name}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-[10px] font-semibold text-stone-200 backdrop-blur-sm">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-amber-400/35 border-t-amber-400" />
            <span>Loading Google Maps photos…</span>
          </div>
        </div>
      </div>
    );
  }

  if (!activePhoto && hasCompletedPhotoFetch) {
    return fallback;
  }

  return (
    <div
      className={`relative overflow-hidden bg-stone-950 ${className}`}
      data-testid="google-place-photo-carousel"
      onMouseEnter={() => {
        if (pauseOnHover) setIsPaused(true);
      }}
      onMouseLeave={() => {
        if (pauseOnHover) setIsPaused(false);
      }}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      onTouchStart={(event) => {
        touchStartXRef.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const start = touchStartXRef.current;
        const end = event.changedTouches[0]?.clientX;
        touchStartXRef.current = null;
        if (start == null || end == null) return;
        const distance = end - start;
        if (Math.abs(distance) < 45) return;
        if (distance > 0) goPrevious();
        else goNext();
      }}
    >
      <img
        key={activePhoto.uri}
        src={activePhoto.uri}
        alt={`${producer.name} — Google Maps photo ${activeIndex + 1}`}
        className={`${imageClassName} transition-opacity duration-500`}
        decoding="async"
      />

      {photos.length > 1 && showControls && (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              goPrevious();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white border border-white/15 backdrop-blur-md flex items-center justify-center transition"
            aria-label="Previous Google Maps photo"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              goNext();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white border border-white/15 backdrop-blur-md flex items-center justify-center transition"
            aria-label="Next Google Maps photo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {photos.length > 1 && showCounter && (
        <div className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-medium text-white">
          {activeIndex + 1} / {photos.length}
        </div>
      )}

      {photos.length > 1 && showDots && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 max-w-[70%]">
          {photos.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setActiveIndex(index);
              }}
              className={`h-1.5 rounded-full transition-all ${
                index === activeIndex
                  ? 'w-5 bg-amber-400'
                  : 'w-1.5 bg-white/55 hover:bg-white/80'
              }`}
              aria-label={`Show Google Maps photo ${index + 1}`}
              aria-current={index === activeIndex ? 'true' : undefined}
            />
          ))}
        </div>
      )}

      {showAttribution && (
        <div className="absolute inset-x-0 bottom-0 z-20 min-h-7 px-2 py-1 bg-black/75 backdrop-blur-md flex items-center justify-between gap-2 text-[9px] text-stone-200">
          <div className="min-w-0 flex items-center gap-1.5">
            {primaryAuthor?.photoURI && (
              <img
                src={primaryAuthor.photoURI}
                alt=""
                className="w-4 h-4 rounded-full object-cover shrink-0"
                decoding="async"
              />
            )}
            {primaryAuthor ? (
              primaryAuthor.uri ? (
                <a
                  href={primaryAuthor.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate hover:text-white hover:underline"
                  onClick={(event) => event.stopPropagation()}
                >
                  Photo: {primaryAuthor.displayName}
                </a>
              ) : (
                <span className="truncate">
                  Photo: {primaryAuthor.displayName}
                </span>
              )
            ) : (
              <span className="truncate">Google Maps photo</span>
            )}
          </div>

          {activePhoto.googleMapsURI ? (
            <a
              href={activePhoto.googleMapsURI}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-1 text-white hover:text-amber-300"
              onClick={(event) => event.stopPropagation()}
              aria-label="Open photo on Google Maps"
            >
              <span translate="no">Google Maps</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          ) : (
            <span className="shrink-0 text-white" translate="no">
              Google Maps
            </span>
          )}
        </div>
      )}
    </div>
  );
};
