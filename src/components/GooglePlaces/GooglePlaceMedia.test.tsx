import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { GooglePlaceMedia } from './GooglePlaceMedia';
import { Producer } from '../../types/terroir';
import * as uiKitModule from '../../services/googlePlacesUiKit';

const mockAllowlistedProducer: Producer = {
  id: 'lyrarakis-winery',
  name: 'Lyrarakis Winery',
  greekName: 'Οινοποιείο Λυραράκη',
  village: 'Alagni',
  region: 'Heraklion',
  destination: 'crete',
  description: 'Pioneering Cretan estate.',
  openingHours: 'Mon-Sat 10:00 - 18:00',
  ethos: ['family_estate', 'indigenous_only'],
  gallery: [],
  coordinates: [35.183416, 25.176466],
  category: 'winery',
  tagLine: 'Pioneers of Cretan indigenous varieties',
  story: 'Preserving rare grapes in the mountains.',
  coverImage: 'https://images.unsplash.com/photo-test',
  indigenousVarieties: ['Vidiano', 'Dafni'],
  tastingHighlights: ['Estate vineyard tasting'],
  locationStatus: 'verified_location',
  roadAccessStatus: 'verified',
  roadAccess: 'paved',
  visitStatus: 'public_visits',
};

const mockUnlistedProducer: Producer = {
  id: 'some-other-winery',
  name: 'Other Winery',
  greekName: 'Άλλο Οινοποιείο',
  village: 'Peza',
  region: 'Heraklion',
  destination: 'crete',
  description: 'Another winery.',
  openingHours: 'By appointment',
  ethos: ['family_estate'],
  gallery: [],
  coordinates: [35.2, 25.2],
  category: 'winery',
  tagLine: 'A winery',
  story: 'A story',
  coverImage: 'https://images.unsplash.com/photo-other',
  indigenousVarieties: [],
  tastingHighlights: [],
  locationStatus: 'unreviewed',
  roadAccessStatus: 'unreviewed',
  visitStatus: 'unreviewed',
};

describe('GooglePlaceMedia Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders empty string when producer is null', () => {
    const html = renderToString(<GooglePlaceMedia producer={null} />);
    expect(html).toBe('');
  });

  it('renders empty string when producer is not in allowlist', () => {
    const html = renderToString(<GooglePlaceMedia producer={mockUnlistedProducer} />);
    expect(html).toBe('');
  });

  it('renders empty string when Google Maps API key is unavailable', () => {
    vi.spyOn(uiKitModule, 'useGooglePlacesUiKit').mockReturnValue({
      status: 'unavailable',
      isReady: false,
    });

    const html = renderToString(<GooglePlaceMedia producer={mockAllowlistedProducer} />);
    expect(html).toBe('');
  });

  it('renders section and loading state when status is loading', () => {
    vi.spyOn(uiKitModule, 'useGooglePlacesUiKit').mockReturnValue({
      status: 'loading',
      isReady: false,
    });

    const html = renderToString(<GooglePlaceMedia producer={mockAllowlistedProducer} />);
    expect(html).toContain('Photos from Google Maps');
    expect(html).toContain('Loading Google Maps media...');
    expect(html).toContain('Live Google Places');
    expect(html).toContain('Live imagery provided via Google Places UI Kit');
  });

  it('renders Google Places custom elements when isReady is true', () => {
    vi.spyOn(uiKitModule, 'useGooglePlacesUiKit').mockReturnValue({
      status: 'ready',
      isReady: true,
    });

    const html = renderToString(<GooglePlaceMedia producer={mockAllowlistedProducer} />);
    expect(html).toContain('Photos from Google Maps');
    expect(html).toContain('gmp-place-details');
    expect(html).toContain('gmp-place-details-location-request');
    expect(html).toContain('location="35.183416,25.176466"');
    expect(html).toContain('gmp-place-content-config');
    expect(html).toContain('gmp-place-media');
    expect(html).toContain('lightbox-preferred="true"');
    expect(html).toContain('gmp-place-attribution');
    expect(html).toContain('light-scheme-color="gray"');
    expect(html).toContain('dark-scheme-color="white"');
  });
});
