import React, { useRef } from 'react';
import { Producer } from '../../types/terroir';
import { isGooglePlacesEligible } from '../../config/googlePlacesAllowlist';
import { useGooglePlacesUiKit } from '../../services/googlePlacesUiKit';
import { Camera, Info } from 'lucide-react';

interface GooglePlaceMediaProps {
  producer: Producer | null;
  className?: string;
}

/**
 * Google Places UI Kit Essentials Media Prototype Component
 *
 * Compliance & Trust Invariants:
 * - Rendered directly by Google Maps Platform Web Components (<gmp-place-details>).
 * - ZERO downloading, caching, or database storage of Google image assets.
 * - Google's mandatory attribution and disclosures are preserved natively.
 * - Editorial TerroirTrail data (visit status, road safety, reviews) remains completely separate.
 */
export const GooglePlaceMedia: React.FC<GooglePlaceMediaProps> = ({ producer, className = '' }) => {
  if (!producer) return null;

  const isEligible = isGooglePlacesEligible(producer.id);
  const { isReady, status } = useGooglePlacesUiKit(isEligible);
  const containerRef = useRef<HTMLDivElement>(null);

  // If producer is not on the prototype allow-list, render nothing
  if (!isEligible) {
    return null;
  }

  // If no API key is configured or loader failed, fail silently without breaking the drawer
  if (status === 'unavailable' || status === 'error') {
    return null;
  }

  const [lat, lng] = producer.coordinates;
  const locationString = `${lat},${lng}`;

  return (
    <section
      className={`rounded-2xl bg-stone-900/90 border border-white/10 p-4 sm:p-5 space-y-3.5 ${className}`}
      aria-labelledby="google-place-media-heading"
      data-testid="google-place-media-section"
    >
      {/* Section Header with Provenance Notice */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-amber-400 shrink-0" />
          <h4 id="google-place-media-heading" className="text-sm font-bold text-white tracking-wide">
            Photos from Google Maps
          </h4>
        </div>
        <span className="text-[10px] font-medium text-stone-400 bg-stone-800/80 px-2 py-0.5 rounded-full border border-white/5 flex items-center gap-1">
          <span>Live Google Places</span>
        </span>
      </div>

      <p className="text-xs text-stone-400 leading-relaxed">
        Live imagery provided via Google Places UI Kit for discovery reference. Images belong to their respective Google Maps contributors and do not represent official TerroirTrail photography or verified access guarantees.
      </p>

      {/* Google Places Web Component Container */}
      <div
        ref={containerRef}
        className="w-full min-h-[180px] rounded-xl overflow-hidden bg-stone-950 border border-white/5 flex flex-col justify-center items-center"
        data-testid="google-places-container"
      >
        {isReady ? (
          <div className="w-full max-w-full overflow-x-auto p-1">
            <gmp-place-details
              style={{
                width: '100%',
                display: 'block',
                '--gmp-mat-color-surface': '#0c0a09',
                '--gmp-mat-color-on-surface': '#f5f5f4',
                '--gmp-mat-color-on-surface-variant': '#a8a29e',
                '--gmp-mat-color-outline-decorative': 'rgba(255, 255, 255, 0.08)',
              } as React.CSSProperties}
            >
              <gmp-place-details-location-request location={locationString} />
              <gmp-place-content-config>
                <gmp-place-media lightbox-preferred="true" />
              </gmp-place-content-config>
            </gmp-place-details>
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center gap-2 text-stone-500">
            <div className="w-5 h-5 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin" />
            <span className="text-xs">Loading Google Maps media...</span>
          </div>
        )}
      </div>

      {/* Trust Reminder footer */}
      <div className="pt-2 border-t border-white/5 flex items-start gap-1.5 text-[11px] text-stone-400">
        <Info className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
        <span>
          A Google photo does not establish road safety, rental-vehicle passability, or current public opening hours. Consult the verified TerroirTrail status fields above.
        </span>
      </div>
    </section>
  );
};
