import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { TerroirRegionDrawer } from './TerroirRegionDrawer';
import { CRETE_TERROIR_REGION } from '../../data/terroirRegions';

describe('TerroirRegionDrawer - Phase 14.7 Contextual Affiliate Pilot', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders contextual travel utility separated after sources in the region drawer', () => {
    vi.stubEnv('VITE_ENABLE_TRAVEL_AFFILIATES', 'true');

    const html = renderToString(
      <TerroirRegionDrawer
        region={CRETE_TERROIR_REGION}
        producerCount={12}
        categoryCount={4}
        isOpen={true}
        hasExplorerPass={false}
        onClose={vi.fn()}
        onShowProducers={vi.fn()}
      />
    );

    // Region content intact
    expect(html).toContain('Crete');
    expect(html).toContain('Sources');

    // Affiliate section present with region_planning surface label
    expect(html).toContain('Affiliate · Travel Utility');
    expect(html).toContain('Regional Travel Logistics');
    expect(html).toContain('4 services');

    // All 4 allowed utilities present
    expect(html).toContain('Localrent');
    expect(html).toContain('Welcome Pickups');
    expect(html).toContain('GetTransfer');
    expect(html).toContain('Yesim');

    // Offers are placed after Sources section
    const sourcesPos = html.indexOf('Sources');
    const affiliatePos = html.indexOf('Regional Travel Logistics');
    expect(sourcesPos).toBeGreaterThan(-1);
    expect(affiliatePos).toBeGreaterThan(sourcesPos);

    // Excluded campaign check
    expect(html).not.toContain('klook');
  });

  it('suppresses contextual affiliate section when user has Explorer Pass', () => {
    vi.stubEnv('VITE_ENABLE_TRAVEL_AFFILIATES', 'true');

    const html = renderToString(
      <TerroirRegionDrawer
        region={CRETE_TERROIR_REGION}
        producerCount={12}
        categoryCount={4}
        isOpen={true}
        hasExplorerPass={true}
        onClose={vi.fn()}
        onShowProducers={vi.fn()}
      />
    );

    // Sources still render
    expect(html).toContain('Sources');

    // Affiliate section is suppressed
    expect(html).not.toContain('Affiliate · Travel Utility');
    expect(html).not.toContain('Regional Travel Logistics');
  });

  it('returns null when drawer is closed', () => {
    const html = renderToString(
      <TerroirRegionDrawer
        region={CRETE_TERROIR_REGION}
        producerCount={12}
        categoryCount={4}
        isOpen={false}
        hasExplorerPass={false}
        onClose={vi.fn()}
        onShowProducers={vi.fn()}
      />
    );

    expect(html).toBe('');
  });
});
