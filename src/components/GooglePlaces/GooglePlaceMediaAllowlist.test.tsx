import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { GooglePlaceMedia } from './GooglePlaceMedia';
import { CRETAN_PRODUCERS } from '../../data/producers';
import { SANTORINI_PRODUCERS } from '../../data/santoriniProducers';
import { GOOGLE_PLACES_PROTOTYPE_ITEMS } from '../../config/googlePlacesAllowlist';
import * as uiKitModule from '../../services/googlePlacesUiKit';

const AUDITED_REGIONAL_PRODUCERS = [
  ...CRETAN_PRODUCERS,
  ...SANTORINI_PRODUCERS,
];

vi.mock('./GooglePlacePhotoCarousel', () => ({
  GooglePlacePhotoCarousel: ({ producer }: { producer: { googlePlaceId?: string } }) => (
    <div
      data-testid="google-place-photo-carousel-mock"
      data-place-id={producer.googlePlaceId}
    />
  ),
}));

describe('Google Places integration for audited regional producers', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('contains all audited Crete and Santorini records with verified Place IDs', () => {
    expect(CRETAN_PRODUCERS).toHaveLength(27);
    expect(SANTORINI_PRODUCERS).toHaveLength(9);
    expect(GOOGLE_PLACES_PROTOTYPE_ITEMS).toHaveLength(36);

    const eligibleIds = new Set(
      GOOGLE_PLACES_PROTOTYPE_ITEMS.map((item) => item.producerId)
    );

    for (const producer of AUDITED_REGIONAL_PRODUCERS) {
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

  it('routes all eligible regional producers into the live carousel by Place ID only', () => {
    vi.stubEnv('VITE_ENABLE_GOOGLE_PLACES_MEDIA', 'true');

    vi.spyOn(uiKitModule, 'useGooglePlacesUiKit').mockReturnValue({
      status: 'ready',
      isReady: true,
    });

    for (const producer of AUDITED_REGIONAL_PRODUCERS) {
      expect(producer.googlePlaceId).toBeTruthy();
      if (!producer.googlePlaceId) continue;

      const html = renderToString(
        React.createElement(GooglePlaceMedia, { producer })
      );

      expect(html).toContain('google-place-photo-carousel-mock');
      expect(html).toContain(`data-place-id="${producer.googlePlaceId}"`);
      expect(html).not.toContain('gmp-place-details-location-request');
      expect(html).not.toContain('location=');
      expect(html).toContain('Photos from Google Maps');
      expect(html).toContain('Live Google Places');
    }
  });
});
