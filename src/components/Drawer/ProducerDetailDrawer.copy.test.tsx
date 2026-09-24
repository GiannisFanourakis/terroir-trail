import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { Producer } from '../../types/terroir';
import { ProducerDetailDrawer } from './ProducerDetailDrawer';

vi.mock('../../services/googlePlacesPhotos', () => ({
  useProducerPhotos: (producer: Producer) => ({
    photos: [{ url: producer.coverImage, thumbUrl: producer.coverImage, attributions: [] }],
    activeCredit: producer.photoCredit,
    source: 'curated_fallback',
  }),
}));

const mockProducer: Producer = {
  id: 'sigalas-test',
  name: 'Domaine Sigalas',
  greekName: 'Κτήμα Σιγάλα',
  category: 'winery',
  destination: 'santorini',
  region: 'Cyclades',
  village: 'Oia',
  coordinates: [36.462, 25.375],
  description: 'Volcanic wines of Santorini.',
  story: 'Cultivating native vines in black volcanic pumice.',
  coverImage: '/images/estates/sigalas.jpg',
  gallery: [],
  indigenousVarieties: ['Assyrtiko'],
  tastingHighlights: ['Volcanic Assyrtiko Flight'],
  ethos: ['organic'],
  tagLine: 'Volcanic wines of Santorini',
  openingHours: 'Mon-Sat 10:00 - 18:00',
  visitStatus: 'public_visits',
  roadAccessStatus: 'verified',
  roadAccess: 'paved',
};

describe('ProducerDetailDrawer copy and action disambiguation', () => {
  it('renders "Save place" for unfavorited producer and never uses ambiguous "Save to My Trip"', () => {
    const html = renderToString(
      <ProducerDetailDrawer
        producer={mockProducer}
        onClose={vi.fn()}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
        onAddToTrip={vi.fn()}
      />
    );

    // Unambiguous favorite copy
    expect(html).toContain('title="Save place"');
    expect(html).toContain('aria-label="Save place"');
    // Ensure old ambiguous phrase is not present
    expect(html).not.toContain('Save to My Trip');
  });

  it('renders "Remove from Saved" when producer is already favorited', () => {
    const html = renderToString(
      <ProducerDetailDrawer
        producer={mockProducer}
        onClose={vi.fn()}
        isFavorite={true}
        onToggleFavorite={vi.fn()}
        onAddToTrip={vi.fn()}
      />
    );

    expect(html).toContain('title="Remove from Saved"');
    expect(html).toContain('aria-label="Remove from Saved"');
    expect(html).not.toContain('Save to My Trip');
  });

  it('renders distinct "Add to trip" actions in top bar and drawer body when onAddToTrip is provided', () => {
    const html = renderToString(
      <ProducerDetailDrawer
        producer={mockProducer}
        onClose={vi.fn()}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
        onAddToTrip={vi.fn()}
      />
    );

    // Top action bar button
    expect(html).toContain('title="Add to trip"');
    expect(html).toContain('aria-label="Add to trip"');
    // Drawer body button
    expect(html).toContain('<span>Add to trip</span>');
  });

  it('does not render "Add to trip" buttons when onAddToTrip is omitted', () => {
    const html = renderToString(
      <ProducerDetailDrawer
        producer={mockProducer}
        onClose={vi.fn()}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
      />
    );

    expect(html).not.toContain('title="Add to trip"');
    expect(html).not.toContain('aria-label="Add to trip"');
    expect(html).not.toContain('<span>Add to trip</span>');
  });

  it('labels independent listings and exposes a free correction channel', () => {
    const html = renderToString(
      <ProducerDetailDrawer
        producer={mockProducer}
        onClose={vi.fn()}
        initialTab="visit"
      />
    );

    expect(html).toContain('Independent TerroirTrail listing');
    expect(html).toContain('Report or correct this listing');
    expect(html).toContain('Corrections and legal/privacy requests are free');
    expect(html).toContain('mailto:terroirtrail@gmail.com');
  });
});
