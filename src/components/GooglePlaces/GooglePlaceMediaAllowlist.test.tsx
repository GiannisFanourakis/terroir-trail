import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { GooglePlaceMedia } from './GooglePlaceMedia';
import { CRETAN_PRODUCERS } from '../../data/producers';
import { GOOGLE_PLACES_PROTOTYPE_ITEMS } from '../../config/googlePlacesAllowlist';
import * as uiKitModule from '../../services/googlePlacesUiKit';

describe('Google Places integration for audited Crete producers', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('contains all 27 audited Crete records with verified Place IDs', () => {
    expect(CRETAN_PRODUCERS).toHaveLength(27);
    expect(GOOGLE_PLACES_PROTOTYPE_ITEMS).toHaveLength(27);

    const eligibleIds = new Set(
      GOOGLE_PLACES_PROTOTYPE_ITEMS.map((item) => item.producerId)
    );

    for (const producer of CRETAN_PRODUCERS) {
      expect(
        producer.googlePlaceId,
        `${producer.id} should have a verified Google Place ID`
      ).toBeTruthy();

      expect(
        producer.locationStatus === 'verified_location' ||
          producer.locationStatus === 'verified_entrance'
      ).toBe(true);

      expect(
        eligibleIds.has(producer.id),
        `${producer.id} should be Google-media eligible`
      ).toBe(true);
    }
  });

  it('renders all eligible producers using Place ID only', () => {
    vi.stubEnv('VITE_ENABLE_GOOGLE_PLACES_MEDIA', 'true');

    vi.spyOn(uiKitModule, 'useGooglePlacesUiKit').mockReturnValue({
      status: 'ready',
      isReady: true,
    });

    for (const producer of CRETAN_PRODUCERS) {
      expect(producer.googlePlaceId).toBeTruthy();
      if (!producer.googlePlaceId) continue;

      const html = renderToString(
        React.createElement(GooglePlaceMedia, { producer })
      );

      expect(html).toContain('gmp-place-details');
      expect(html).toContain(
        `place="places/${producer.googlePlaceId}"`
      );

      expect(html).not.toContain(
        'gmp-place-details-location-request'
      );

      expect(html).toContain('gmp-place-media');
      expect(html).toContain('gmp-place-attribution');
      expect(html).toContain('Photos from Google Maps');
      expect(html).toContain('Live Google Places');
    }
  });
});
