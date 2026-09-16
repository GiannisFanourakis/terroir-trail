import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { SponsorBanner } from './SponsorBanner';

describe('SponsorBanner - Travelpayouts affiliate carousel', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it('fails closed when the travel affiliate feature flag is disabled', () => {
    vi.stubEnv('VITE_ENABLE_TRAVEL_AFFILIATES', 'false');

    const html = renderToString(
      React.createElement(SponsorBanner, { hasExplorerPass: false })
    );

    expect(html).toBe('');
  });

  it('renders one disclosed Travelpayouts offer with a placement SubID when enabled', () => {
    vi.stubEnv('VITE_ENABLE_TRAVEL_AFFILIATES', 'true');

    const html = renderToString(
      React.createElement(SponsorBanner, { hasExplorerPass: false })
    );

    expect(html).toContain('Affiliate');
    expect(html).toContain('TerroirTrail may earn a commission');
    expect(html).toContain('klook.tpx.lv');
    expect(html).toContain('sub_id=terroir_banner_klook');
    expect(html).toContain('rel="sponsored noopener noreferrer"');
  });

  it('renders nothing for an active ad-free traveler pass, including the annual plan entitlement', () => {
    vi.stubEnv('VITE_ENABLE_TRAVEL_AFFILIATES', 'true');

    const html = renderToString(
      React.createElement(SponsorBanner, { hasExplorerPass: true })
    );

    expect(html).toBe('');
  });
});
