import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { checkVatAgainstVies } from './viesService';

describe('VIES Tax & VAT verification', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('marks synthetic demo numbers as demo with test entity data', async () => {
    const result = await checkVatAgainstVies('EL999999991', 'GR');
    expect(result.isValid).toBe(true);
    expect(result.status).toBe('demo');
    expect(result.source).toBe('synthetic_demo_registry');
    expect(result.name).toContain('ARTISAN HERITAGE');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('marks Extra-EU entities as not_applicable requiring manual review', async () => {
    const usResult = await checkVatAgainstVies('12-3456789', 'US');
    expect(usResult.isValid).toBe(false);
    expect(usResult.status).toBe('not_applicable');
    expect(usResult.userError).toContain('manual review required');
    expect(fetchMock).not.toHaveBeenCalled();

    const gbResult = await checkVatAgainstVies('GB123456789', 'GB');
    expect(gbResult.isValid).toBe(false);
    expect(gbResult.status).toBe('not_applicable');
    expect(gbResult.userError).toContain('manual review required');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('verifies valid EU VAT numbers against live VIES response', async () => {
    fetchMock.mockResolvedValueOnce(Response.json({
      isValid: true,
      name: 'WINERY KTIMA S.A.',
      address: 'VILLAGE ROAD 10, CRETE',
      requestDate: '2026-09-12T00:00:00Z',
    }));

    const result = await checkVatAgainstVies('EL094000000', 'GR');
    expect(result.isValid).toBe(true);
    expect(result.status).toBe('verified');
    expect(result.source).toBe('eu_vies_live');
    expect(result.name).toBe('WINERY KTIMA S.A.');
    expect(result.address).toBe('VILLAGE ROAD 10, CRETE');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('reports invalid EU VAT numbers accurately without claiming validity', async () => {
    fetchMock.mockResolvedValueOnce(Response.json({
      isValid: false,
      userError: 'INVALID_INPUT',
    }));

    const result = await checkVatAgainstVies('EL111111111', 'GR');
    expect(result.isValid).toBe(false);
    expect(result.status).toBe('invalid');
    expect(result.source).toBe('eu_vies_live');
  });

  it('fails closed when network or CORS prevents VIES access', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const result = await checkVatAgainstVies('EL123456789', 'GR');
    expect(result.isValid).toBe(false);
    expect(result.status).toBe('unavailable');
    expect(result.userError).toContain('unavailable');
    expect(result.source).toBe('offline_fallback');
  });
});
