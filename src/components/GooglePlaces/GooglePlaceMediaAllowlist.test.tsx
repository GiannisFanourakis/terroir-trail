import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { GooglePlaceMedia } from './GooglePlaceMedia';
import { producers } from '../../data/producers';
import { GOOGLE_PLACES_PROTOTYPE_ITEMS } from '../../config/googlePlacesAllowlist';
import * as uiKitModule from '../../services/googlePlacesUiKit';

describe('Manual Google Prototype Allowlist Test for 5 Producers', () => {
  it('verifies all 5 allowlisted producers render gmp-place-details with exact attribution', () => {
    vi.spyOn(uiKitModule, 'useGooglePlacesUiKit').mockReturnValue({
      status: 'ready',
      isReady: true,
    });

    for (const item of GOOGLE_PLACES_PROTOTYPE_ITEMS) {
      const producer = producers.find((p) => p.id === item.producerId);
      expect(producer, `Producer ${item.producerId} should exist in producers`).toBeDefined();

      if (!producer) continue;

      const html = renderToString(React.createElement(GooglePlaceMedia, { producer }));

      // 1. Component rendered: gmp-place-details (Essentials / Query tier)
      expect(html).toContain('gmp-place-details');
      expect(html).not.toContain('gmp-advanced-place-details'); // Invariant: Not Pro/Advanced tier
      expect(html).toContain('gmp-place-details-location-request');

      // 2. Exact coordinates
      const [lat, lng] = producer.coordinates;
      expect(html).toContain(`location="${lat},${lng}"`);

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

      console.log(`[PASS] ${item.producerId} | ${producer.name} | category: ${producer.category} | coords: [${lat}, ${lng}]`);
    }
  });
});
