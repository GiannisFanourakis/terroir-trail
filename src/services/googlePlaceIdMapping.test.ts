import { describe, expect, it } from 'vitest';
import { mapRowToProducer } from './producerService';

const baseRow = {
  id: 'test-producer',
  name: 'Test Producer',
  greek_name: 'Test Producer',
  category: 'winery',
  destination: 'crete',
  region: 'Heraklion',
  village: 'Test Village',
  lat: 35.1,
  lng: 25.1,
};

describe('verified Google Place ID mapping', () => {
  it('maps and trims an audited google_place_id from Supabase', () => {
    const producer = mapRowToProducer({
      ...baseRow,
      google_place_id: '  ChIJa95IFTf0mhQRY5TF5uhxJoU  ',
    });

    expect(producer.googlePlaceId).toBe('ChIJa95IFTf0mhQRY5TF5uhxJoU');
  });

  it('keeps missing or blank google_place_id unknown', () => {
    expect(mapRowToProducer(baseRow).googlePlaceId).toBeUndefined();
    expect(mapRowToProducer({ ...baseRow, google_place_id: '   ' }).googlePlaceId).toBeUndefined();
  });
});
