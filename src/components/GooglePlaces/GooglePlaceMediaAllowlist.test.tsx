import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { readFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import { GooglePlaceMedia } from './GooglePlaceMedia';
import { AUDITED_PRODUCERS } from '../../data/auditedProducers';
import { PHASE13_DAIRY_PRODUCERS } from '../../data/phase13DairyProducers';
import {
  GOOGLE_PLACES_PROTOTYPE_ITEMS,
  isGooglePlacesEligible,
} from '../../config/googlePlacesAllowlist';
import * as uiKitModule from '../../services/googlePlacesUiKit';

const AUDITED_GOOGLE_MEDIA_PRODUCERS = AUDITED_PRODUCERS.filter(
  (producer) =>
    Boolean(producer.googlePlaceId?.trim()) &&
    (producer.locationStatus === 'verified_location' ||
      producer.locationStatus === 'verified_entrance')
);

const PHASE13_GOOGLE_MEDIA_PRODUCERS = PHASE13_DAIRY_PRODUCERS.filter(
  (producer) =>
    Boolean(producer.googlePlaceId?.trim()) &&
    (producer.locationStatus === 'verified_location' ||
      producer.locationStatus === 'verified_entrance')
);

describe('Google Places integration for audited regional producers', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('contains every audited record that has both a verified location and persistent Place ID', () => {
    expect(AUDITED_PRODUCERS).toHaveLength(62);
    expect(PHASE13_DAIRY_PRODUCERS).toHaveLength(7);
    expect(PHASE13_GOOGLE_MEDIA_PRODUCERS).toHaveLength(5);
    expect(AUDITED_GOOGLE_MEDIA_PRODUCERS).toHaveLength(62);
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

  it('includes the five Phase 13 dairies whose Place IDs are stored directly in the raw Phase 13 batch', () => {
    expect(
      PHASE13_GOOGLE_MEDIA_PRODUCERS.map((producer) => producer.id).sort()
    ).toEqual(
      [
        'arvanitis-dairy-neochorouda',
        'baladinos-dairy-varipetro',
        'christakis-patria-feta-proastio',
        'elatos-kapetanou-schinochori',
        'stamatogiorgis-dairy-smari',
      ].sort()
    );

    for (const producer of PHASE13_GOOGLE_MEDIA_PRODUCERS) {
      expect(isGooglePlacesEligible(producer.id)).toBe(true);
    }
  });

  it('keeps the two post-import dairy Place ID fixes eligible through the audited fallback layer', () => {
    const syncedDairyIds = [
      'argogal-koromichi-kefalari',
      'psiloritis-cheese-dairy-livadia',
    ];

    for (const id of syncedDairyIds) {
      const producer = AUDITED_PRODUCERS.find((candidate) => candidate.id === id);
      expect(producer?.googlePlaceId).toBeTruthy();
      expect(producer?.locationStatus).toBe('verified_location');
      expect(isGooglePlacesEligible(id)).toBe(true);
    }
  });

  it('accepts live Supabase producers only when both Place ID and location audit are verified', () => {
    expect(
      isGooglePlacesEligible({
        id: 'phase13-live-dairy',
        googlePlaceId: 'ChIJverifiedPhase13',
        locationStatus: 'verified_location',
      })
    ).toBe(true);

    expect(
      isGooglePlacesEligible({
        id: 'phase13-live-dairy-no-place',
        googlePlaceId: null,
        locationStatus: 'verified_location',
      })
    ).toBe(false);

    expect(
      isGooglePlacesEligible({
        id: 'phase13-live-dairy-unverified-location',
        googlePlaceId: 'ChIJunverifiedPhase13',
        locationStatus: 'approximate',
      })
    ).toBe(false);
  });

  it('routes eligible producers through Places UI Kit by Place ID only', () => {
    vi.stubEnv('VITE_ENABLE_GOOGLE_PLACES_MEDIA', 'true');

    vi.spyOn(uiKitModule, 'useGooglePlacesUiKit').mockReturnValue({
      status: 'ready',
      isReady: true,
    });

    const producer = AUDITED_GOOGLE_MEDIA_PRODUCERS[0];
    expect(producer?.googlePlaceId).toBeTruthy();

    const html = renderToString(
      React.createElement(GooglePlaceMedia, { producer })
    );

    expect(html).toContain('google-place-media-frame');
    expect(html).not.toContain('gmp-place-details-location-request');
    expect(html).not.toContain('location=');

    const source = readFileSync(
      'src/components/GooglePlaces/GooglePlaceMedia.tsx',
      'utf8'
    );
    expect(source).toContain('<gmp-place-details');
    expect(source).toContain('<gmp-place-details-place-request');
    expect(source).toContain('place={googlePlaceId}');
    expect(source).not.toContain('fetchFields(');
    expect(source).not.toContain('PlacesService');
    expect(source).not.toContain('getURI(');
    expect(source).not.toContain('getUrl(');
    expect(source).not.toContain('Photos from Google Maps');
  });

});
