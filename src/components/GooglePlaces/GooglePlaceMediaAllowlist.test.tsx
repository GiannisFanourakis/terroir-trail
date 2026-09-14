import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { GooglePlaceMedia } from './GooglePlaceMedia';
import { producers } from '../../data/producers';
import { GOOGLE_PLACES_PROTOTYPE_ITEMS } from '../../config/googlePlacesAllowlist';
import * as uiKitModule from '../../services/googlePlacesUiKit';

const VERIFIED_PLACE_IDS: Record<string, string> = {
  'lyrarakis-winery': 'ChIJa95IFTf0mhQRY5TF5uhxJoU',
  'peskesi-farm-kazani': 'ChIJg4hwRwthmhQRBF4b9YPGsZU',
  'cretan-brewery-charma': 'ChIJQ7fRzLOLnBQRWaCt5UX2izE',
  'biolea-estate': 'ChIJ_U9uyrr0nBQRPiI3ZYRHH2M',
  'stathakis-honey-park': 'ChIJ-bttLbr1nBQRqwEUhZIfplM',
};

describe('Google Place ID allowlist integration for 5 producers', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders all 5 audited producers by verified Place ID with exact attribution', () => {
    vi.stubEnv('VITE_ENABLE_GOOGLE_PLACES_MEDIA', 'true');
    vi.spyOn(uiKitModule, 'useGooglePlacesUiKit').mockReturnValue({
      status: 'ready',
      isReady: true,
    });

    for (const item of GOOGLE_PLACES_PROTOTYPE_ITEMS) {
      const producer = producers.find((p) => p.id === item.producerId);
      expect(producer, `Producer ${item.producerId} should exist in producers`).toBeDefined();

      const googlePlaceId = VERIFIED_PLACE_IDS[item.producerId];
      expect(googlePlaceId, `Producer ${item.producerId} should have an audited test Place ID`).toBeTruthy();
      if (!producer || !googlePlaceId) continue;

      const html = renderToString(
        React.createElement(GooglePlaceMedia, {
          producer: { ...producer, googlePlaceId },
        })
      );

      // 1. Component rendered: gmp-place-details (Essentials / Query tier)
      expect(html).toContain('gmp-place-details');
      expect(html).not.toContain('gmp-advanced-place-details');
      expect(html).toContain('gmp-place-details-place-request');

      // 2. Verified Place ID is the only Google business lookup key
      expect(html).toContain(`place="places/${googlePlaceId}"`);
      expect(html).not.toContain('gmp-place-details-location-request');

      // 3. Media & Lightbox
      expect(html).toContain('gmp-place-content-config');
      expect(html).toContain('gmp-place-media');
      expect(html).toContain('lightbox-preferred="true"');

      // 4. Attribution element with styling
      expect(html).toContain('gmp-place-attribution');
      expect(html).toContain('light-scheme-color="gray"');
      expect(html).toContain('dark-scheme-color="white"');

      // 5. Section and provenance disclosures
      expect(html).toContain('Photos from Google Maps');
      expect(html).toContain('Live Google Places');
      expect(html).toContain('A Google photo does not establish road safety');
    }
  });
});
