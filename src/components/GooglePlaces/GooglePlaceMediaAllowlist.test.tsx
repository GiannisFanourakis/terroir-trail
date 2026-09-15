import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { GooglePlaceMedia } from './GooglePlaceMedia';
import { CRETAN_PRODUCERS } from '../../data/producers';
import { SANTORINI_PRODUCERS } from '../../data/santoriniProducers';
import { PHASE10B_PRODUCERS } from '../../data/phase10bProducers';
import { GOOGLE_PLACES_PROTOTYPE_ITEMS } from '../../config/googlePlacesAllowlist';
import * as uiKitModule from '../../services/googlePlacesUiKit';

const PHASE10B_GOOGLE_MEDIA_PRODUCERS = PHASE10B_PRODUCERS.filter(
  (producer) =>
    Boolean(producer.googlePlaceId?.trim()) &&
    (producer.locationStatus === 'verified_location' ||
      producer.locationStatus === 'verified_entrance')
);

const AUDITED_GOOGLE_MEDIA_PRODUCERS = [
  ...CRETAN_PRODUCERS,
  ...SANTORINI_PRODUCERS,
  ...PHASE10B_GOOGLE_MEDIA_PRODUCERS,
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

  it('contains every audited record that has both a verified location and persistent Place ID', () => {
    expect(CRETAN_PRODUCERS).toHaveLength(27);
    expect(SANTORINI_PRODUCERS).toHaveLength(9);
    expect(PHASE10B_PRODUCERS).toHaveLength(19);
    expect(PHASE10B_GOOGLE_MEDIA_PRODUCERS).toHaveLength(14);
    expect(GOOGLE_PLACES_PROTOTYPE_ITEMS).toHaveLength(
      AUDITED_GOOGLE_MEDIA_PRODUCERS.length
    );

    const eligibleIds = new Set(
      GOOGLE_PLACES_PROTOTYPE_ITEMS.map((item) => item.producerId)
    );

    for (const producer of AUDITED_GOOGLE_MEDIA_PRODUCERS) {
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

    for (const producer of AUDITED_GOOGLE_MEDIA_PRODUCERS) {
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
