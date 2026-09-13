import { describe, expect, it } from 'vitest';
import { mapRowToProducer } from './producerService';

describe('Phase 6 road access mapping', () => {
  it('preserves unknown access as unknown instead of inventing paved access', () => {
    const producer = mapRowToProducer({
      id: 'unknown-access',
      name: 'Unknown Access Producer',
      greek_name: 'Unknown Access Producer',
      category: 'winery',
      destination: 'crete',
      region: 'Heraklion',
      village: 'Village',
      lat: 35.2,
      lng: 25.1,
      gallery: [],
      indigenous_varieties: [],
      tasting_highlights: [],
      ethos: [],
      road_access: null,
      road_access_status: 'unreviewed',
      location_status: 'verified_location',
    });

    expect(producer.roadAccess).toBeUndefined();
    expect(producer.roadAccessStatus).toBe('unreviewed');
  });

  it('maps evidence-backed road access fields without synthesizing details', () => {
    const producer = mapRowToProducer({
      id: 'verified-access',
      name: 'Verified Access Producer',
      greek_name: 'Verified Access Producer',
      category: 'winery',
      destination: 'crete',
      region: 'Heraklion',
      village: 'Village',
      lat: 35.2,
      lng: 25.1,
      gallery: [],
      indigenous_varieties: [],
      tasting_highlights: [],
      ethos: [],
      road_access: 'narrow_paved',
      road_access_status: 'verified',
      road_access_source_url: 'https://producer.example/access',
      road_access_notes: 'Producer publishes a narrow paved approach road.',
      location_status: 'verified_location',
    });

    expect(producer.roadAccess).toBe('narrow_paved');
    expect(producer.roadAccessStatus).toBe('verified');
    expect(producer.roadAccessSourceUrl).toBe('https://producer.example/access');
    expect(producer.roadAccessNotes).toBe('Producer publishes a narrow paved approach road.');
  });
});
