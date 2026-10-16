import { describe, expect, it } from 'vitest';
import { CRETAN_PRODUCERS } from '../data/producers';

const EXPECTED_PHASE9B_PLACE_IDS: Record<string, string> = {
  'lafkas-brewery': 'ChIJSSvI3YiHnBQRBtbO7K4u444',
  'anoskeli-estate': 'ChIJQwdI8aeMnBQRZAI_Lg6tC08',
  'aerakis-dairy-anogeia': 'ChIJK7sRuXvvmhQRcLM1MwiaRXU',
  'tzourmpakis-dairy-amari': 'ChIJfxev5WBtmxQRdwfwJ2hO8Cg',
};

describe('Phase 9B verified Google Place IDs', () => {
  it('preserves all manually verified Place IDs in the fallback catalogue', () => {
    for (const [producerId, googlePlaceId] of Object.entries(EXPECTED_PHASE9B_PLACE_IDS)) {
      const producer = CRETAN_PRODUCERS.find((item) => item.id === producerId);
      expect(producer, producerId).toBeDefined();
      expect(producer?.googlePlaceId, producerId).toBe(googlePlaceId);
    }
  });

  it('does not reinstate the withdrawn Wild Herbs listing', () => {
    expect(CRETAN_PRODUCERS.some((p) => p.id === 'wild-herbs-kallikratis')).toBe(false);
  });
});
