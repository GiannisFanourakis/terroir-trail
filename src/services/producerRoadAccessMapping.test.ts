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

  it('keeps reviewed-but-unconfirmed access unclassified', () => {
    const producer = mapRowToProducer({
      id: 'reviewed-access',
      name: 'Reviewed Access Producer',
      greek_name: 'Reviewed Access Producer',
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
      road_access_status: 'not_publicly_confirmed',
      road_access_source_url: 'https://producer.example/contact',
      road_access_notes: 'Official location reviewed; road type not published.',
      location_status: 'verified_location',
    });

    expect(producer.roadAccess).toBeUndefined();
    expect(producer.roadAccessStatus).toBe('not_publicly_confirmed');
    expect(producer.roadAccessSourceUrl).toBe('https://producer.example/contact');
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
      road_access: 'unpaved_passable',
      road_access_status: 'verified',
      road_access_source_url: 'https://producer.example/access',
      road_access_notes: 'Producer publishes a passable unpaved approach road.',
      location_status: 'verified_location',
    });

    expect(producer.roadAccess).toBe('unpaved_passable');
    expect(producer.roadAccessStatus).toBe('verified');
    expect(producer.roadAccessSourceUrl).toBe('https://producer.example/access');
    expect(producer.roadAccessNotes).toBe(
      'Producer publishes a passable unpaved approach road.'
    );
  });
});
