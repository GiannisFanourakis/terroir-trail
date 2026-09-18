import { afterEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { GooglePlacePhotoCarousel } from './GooglePlacePhotoCarousel';
import type { Producer } from '../../types/terroir';
import * as uiKitModule from '../../services/googlePlacesUiKit';

const gangstad: Producer = {
  id: 'gangstad-gardsysteri-trondelag',
  name: 'Gangstad Gårdsysteri',
  greekName: 'Gangstad Gårdsysteri',
  village: 'Inderøy',
  region: 'Trøndelag',
  destination: 'trondelag',
  description: 'Family farm dairy.',
  openingHours: 'Mon-Fri',
  ethos: [],
  gallery: [],
  coordinates: [63.95987, 11.337862],
  category: 'cheese_dairy',
  tagLine: 'Farmstead cheese in Inderøy',
  story: 'A Norwegian family farm dairy.',
  coverImage: '',
  indigenousVarieties: [],
  tastingHighlights: [],
  locationStatus: 'verified_location',
  roadAccessStatus: 'not_publicly_confirmed',
  visitStatus: 'public_visits',
  googlePlaceId: 'ChIJL1gYYSOcckYRC4BXQPmZuV0',
};

describe('GooglePlacePhotoCarousel loading behavior', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('shows a Google loading state instead of the category fallback while an eligible live producer is loading', () => {
    vi.stubEnv('VITE_ENABLE_GOOGLE_PLACES_MEDIA', 'true');
    vi.spyOn(uiKitModule, 'useGooglePlacesUiKit').mockReturnValue({
      status: 'loading',
      isReady: false,
    });

    const html = renderToString(
      <GooglePlacePhotoCarousel
        producer={gangstad}
        fallbackUrl="/images/placeholders/dairy.svg"
      />
    );

    expect(html).toContain('google-place-photo-carousel-loading');
    expect(html).toContain('Loading Google Maps photos');
    expect(html).not.toContain('/images/placeholders/dairy.svg');
  });
});
