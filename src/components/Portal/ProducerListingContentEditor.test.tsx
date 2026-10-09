import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { LIVE_CATALOGUE_PRODUCERS } from '../../data/liveCatalogue.generated';
import { ProducerListingContentEditor } from './ProducerListingContentEditor';

vi.mock('../../services/producerListingChangeApi', () => ({
  fetchLatestProducerListingChange: vi.fn(async () => ({ request: null })),
  submitProducerListingChanges: vi.fn(),
}));

const producer = LIVE_CATALOGUE_PRODUCERS.find(value => value.id === 'la-vinyeta-catalonia')!;

describe('reviewed category and grouped-product editor', () => {
  it('renders all four existing groups and official evidence input while keeping primary fixed', () => {
    const html = renderToString(<ProducerListingContentEditor producer={producer} />);
    for (const category of ['winery', 'olive_oil_producer', 'cheese_dairy', 'apiary']) {
      expect(html).toContain(`data-product-editor-category="${category}"`);
    }
    expect(html).toContain('Primary category: ');
    expect(html).toContain('Estate-made cheese');
    expect(html).toContain('Estate-made honey');
    expect(html).toContain('Official source for these changes');
    expect(html).toContain('Submit changes for review');
    expect(html).not.toContain('value="museum"');
  });

  it('keeps the admin preview read-only', () => {
    const html = renderToString(<ProducerListingContentEditor producer={producer} readOnly />);
    expect(html).toContain('<fieldset disabled=""');
    expect(html).toContain('Admin preview is read-only');
  });
});
