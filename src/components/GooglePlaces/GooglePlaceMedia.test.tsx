import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { GooglePlaceMedia } from './GooglePlaceMedia';
import type { Producer } from '../../types/terroir';
import * as uiKitModule from '../../services/googlePlacesUiKit';

const producer: Producer = {
  id: 'lyrarakis-winery',
  name: 'Lyrarakis Winery',
  greekName: 'Οινοποιείο Λυραράκη',
  village: 'Alagni',
  region: 'Heraklion',
  destination: 'crete',
  description: 'Pioneering Cretan estate.',
  openingHours: 'Mon-Sat 10:00 - 18:00',
  ethos: [],
  gallery: [],
  coordinates: [35.183416, 25.176466],
  category: 'winery',
  tagLine: 'Pioneers of Cretan indigenous varieties',
  story: 'Preserving rare grapes in the mountains.',
  coverImage: '',
  indigenousVarieties: [],
  tastingHighlights: [],
  locationStatus: 'verified_location',
  roadAccessStatus: 'verified',
  roadAccess: 'paved',
  visitStatus: 'public_visits',
  googlePlaceId: 'ChIJa95IFTf0mhQRY5TF5uhxJoU',
};

describe('GooglePlaceMedia', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_ENABLE_GOOGLE_PLACES_MEDIA', 'true');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('renders only imagery UI and no standalone Google photo section copy', () => {
    vi.spyOn(uiKitModule, 'useGooglePlacesUiKit').mockReturnValue({
      status: 'ready',
      isReady: true,
    });

    const html = renderToString(
      <GooglePlaceMedia
        producer={producer}
        fallbackUrl="/images/placeholders/winery.svg"
      />
    );

    expect(html).toContain('google-place-media-frame');
    expect(html).toContain('gmp-place-details');
    expect(html).toContain('gmp-place-media');
    expect(html).toContain('gmp-place-attribution');
    expect(html).toContain(producer.googlePlaceId);
    expect(html).not.toContain('Photos from Google Maps');
    expect(html).not.toContain('Live Google Places');
  });

  it('keeps the fallback image when Google media is unavailable', () => {
    vi.spyOn(uiKitModule, 'useGooglePlacesUiKit').mockReturnValue({
      status: 'unavailable',
      isReady: false,
    });

    const html = renderToString(
      <GooglePlaceMedia
        producer={producer}
        fallbackUrl="/images/placeholders/winery.svg"
      />
    );

    expect(html).toContain('/images/placeholders/winery.svg');
    expect(html).not.toContain('gmp-place-details');
  });
});
