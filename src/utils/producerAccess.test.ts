import { describe, expect, it } from 'vitest';
import { Producer } from '../types/terroir';
import { getProducerRoadAccessWarning } from './producerAccess';

function mockProducer(overrides: Partial<Producer> = {}): Producer {
  return {
    id: 'test-producer',
    name: 'Test Producer',
    greekName: 'Δοκιμαστικός Παραγωγός',
    destination: 'crete',
    region: 'Heraklion',
    category: 'winery',
    coordinates: [35.2, 25.1] as [number, number],
    description: 'Test producer description',
    locationStatus: 'verified_location',
    roadAccessStatus: 'verified',
    roadAccess: 'paved',
    ...overrides,
  } as Producer;
}

describe('getProducerRoadAccessWarning', () => {
  it('returns warning when road access is uncertain', () => {
    const warning = getProducerRoadAccessWarning(
      mockProducer({ roadAccessStatus: 'current_access_uncertain' })
    );
    expect(warning).toContain('Current road access is uncertain');
  });

  it('returns warning when road access is reviewed but not publicly confirmed', () => {
    const warning = getProducerRoadAccessWarning(
      mockProducer({ roadAccessStatus: 'not_publicly_confirmed' })
    );
    expect(warning).toContain('Road conditions were reviewed but are not publicly confirmed');
  });

  it('returns warning when road access is unreviewed or missing classification', () => {
    const warningUnreviewed = getProducerRoadAccessWarning(
      mockProducer({ roadAccessStatus: 'unreviewed' })
    );
    expect(warningUnreviewed).toContain('Road conditions have not yet been independently verified');

    const warningMissingAccess = getProducerRoadAccessWarning(
      mockProducer({ roadAccessStatus: 'verified', roadAccess: undefined })
    );
    expect(warningMissingAccess).toContain('Road conditions have not yet been independently verified');
  });

  it('returns rental warning for unpaved passable road access', () => {
    const warning = getProducerRoadAccessWarning(
      mockProducer({ roadAccess: 'unpaved_passable' })
    );
    expect(warning).toContain('Verified passable unpaved access');
    expect(warning).toContain('rental terms');
  });

  it('returns warning for high-clearance vehicle recommendation', () => {
    const warning = getProducerRoadAccessWarning(
      mockProducer({ roadAccess: 'high_clearance_recommended' })
    );
    expect(warning).toContain('High-clearance vehicle recommended');
  });

  it('returns strict warning for 4x4 requirement', () => {
    const warning = getProducerRoadAccessWarning(
      mockProducer({ roadAccess: '4x4_required' })
    );
    expect(warning).toContain('4x4 access required');
    expect(warning).toContain('Do not attempt this approach in a standard rental car');
  });

  it('returns undefined for standard verified road access', () => {
    expect(getProducerRoadAccessWarning(mockProducer({ roadAccess: 'paved' }))).toBeUndefined();
    expect(getProducerRoadAccessWarning(mockProducer({ roadAccess: 'narrow_paved' }))).toBeUndefined();
    expect(getProducerRoadAccessWarning(mockProducer({ roadAccess: 'gravel_ok' }))).toBeUndefined();
  });
});
