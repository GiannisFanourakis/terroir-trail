import { describe, expect, it } from 'vitest';
import { mapRowToProducer } from '../services/producerService';
import { Producer } from '../types/terroir';
import { getProducerDisplaySpecialties } from './producerSpecialties';

const BASE_DAIRY: Producer = {
  id: 'test-dairy',
  name: 'Test Dairy',
  greekName: 'Test Dairy',
  category: 'cheese_dairy',
  destination: 'crete',
  country: 'Greece',
  countryCode: 'GR',
  region: 'Rethymno',
  village: 'Test Village',
  coordinates: [35.1, 24.7],
  coverImage: '',
  gallery: [],
  tagLine: '',
  description: '',
  story: '',
  indigenousVarieties: [],
  tastingHighlights: [],
  openingHours: '',
  ethos: [],
};

describe('Phase 13 dairy product taxonomy foundation', () => {
  it('maps source-backed product_specialties without abusing indigenous_varieties', () => {
    const producer = mapRowToProducer({
      id: 'mapped-dairy',
      name: 'Mapped Dairy',
      greek_name: 'Mapped Dairy',
      category: 'cheese_dairy',
      destination: 'crete',
      country: 'Greece',
      country_code: 'GR',
      region: 'Rethymno',
      village: 'Livadia',
      lat: 35.3,
      lng: 24.8,
      indigenous_varieties: [],
      product_specialties: ['Cretan Graviera', 'Xynomyzithra'],
      location_status: 'verified_location',
      visit_status: 'not_publicly_confirmed',
      road_access_status: 'not_publicly_confirmed',
    });

    expect(producer.productSpecialties).toEqual(['Cretan Graviera', 'Xynomyzithra']);
    expect(producer.indigenousVarieties).toEqual([]);
  });

  it('preserves unknown specialties as unknown instead of inventing an empty fact set', () => {
    const producer = mapRowToProducer({
      id: 'unknown-dairy',
      name: 'Unknown Dairy',
      category: 'cheese_dairy',
      destination: 'crete',
      region: 'Heraklion',
      village: 'Unknown',
      lat: 35,
      lng: 25,
    });

    expect(producer.productSpecialties).toBeUndefined();
  });

  it('prefers product specialties but retains legacy variety compatibility', () => {
    expect(
      getProducerDisplaySpecialties({
        ...BASE_DAIRY,
        indigenousVarieties: ['Legacy value'],
        productSpecialties: ['Graviera', 'Anthotyro'],
      })
    ).toEqual(['Graviera', 'Anthotyro']);

    expect(
      getProducerDisplaySpecialties({
        ...BASE_DAIRY,
        indigenousVarieties: ['Vidiano'],
      })
    ).toEqual(['Vidiano']);
  });
});
