import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ProducerCard } from './Sidebar/ProducerCard';
import { ProducerDetailDrawer } from './Drawer/ProducerDetailDrawer';
import { Producer, Category } from '../types/terroir';
import { readFileSync } from 'node:fs';

// Mock googlePlacesPhotos so it returns curated photos safely without network
vi.mock('../services/googlePlacesPhotos', () => ({
  useProducerPhotos: (producer: Producer) => ({
    photos: [{ url: producer.coverImage, thumbUrl: producer.coverImage, attributions: [] }],
    activeCredit: producer.photoCredit,
    source: 'curated_fallback',
  }),
}));

const createTestProducer = (category: Category, overrides: Partial<Producer> = {}): Producer => ({
  id: `test-${category}-producer`,
  name: `Authentic ${category} Producer`,
  greekName: 'Αυθεντικός Παραγωγός',
  category,
  destination: 'crete',
  region: 'Heraklion',
  village: 'Archanes',
  description: `A traditional ${category} in Crete.`,
  story: `Generations of authentic ${category} craft.`,
  coverImage: '/images/estates/boutari-skalani.jpg',
  coordinates: [35.23, 25.16],
  indigenousVarieties: ['Heirloom Variety A', 'Local Variety B'],
  tastingHighlights: ['Signature Experience'],
  ethos: ['organic'],
  tagLine: 'Pure terroir and genuine craftsmanship',
  gallery: [],
  openingHours: 'Mon-Sat 10:00 - 18:00',
  phone: '+30 2810 123456',
  website: 'https://example.com',
  roadAccess: 'paved',
  roadAccessStatus: 'verified',
  visitStatus: 'public_visits',
  ...overrides,
});

describe('Phase 8 Producer Card + Detail Hierarchy', () => {
  describe('ProducerCard Primary Hierarchy & Simplification', () => {
    it('renders all 7 categories with distinct category badges and icons', () => {
      const categories: { cat: Category; label: string; icon: string }[] = [
        { cat: 'winery', label: 'Winery', icon: '🍇' },
        { cat: 'brewery', label: 'Brewery', icon: '🍺' },
        { cat: 'olive_mill', label: 'Olive Mill', icon: '🫒' },
        { cat: 'cheese_dairy', label: 'Dairy', icon: '🧀' },
        { cat: 'apiary', label: 'Apiary / Honey', icon: '🍯' },
        { cat: 'distillery', label: 'Distillery', icon: '🥃' },
        { cat: 'farm', label: 'Farm', icon: '🌿' },
      ];

      for (const { cat, label, icon } of categories) {
        const p = createTestProducer(cat);
        const html = renderToString(
          React.createElement(ProducerCard, {
            producer: p,
            isSelected: false,
            isFavorite: false,
            onSelect: () => {},
            onToggleFavorite: () => {},
          })
        );

        expect(html).toContain(label);
        expect(html).toContain(icon);
        expect(html).toContain(p.name);
        expect(html).toContain(p.village);
      }
    });

    it('prioritizes primary hierarchy: name, category, location, visitability, road access', () => {
      const p = createTestProducer('farm', {
        visitStatus: 'public_visits',
        walkInFriendly: true,
        roadAccess: 'unpaved_passable',
        roadAccessStatus: 'verified',
      });

      const html = renderToString(
        React.createElement(ProducerCard, {
          producer: p,
          isSelected: false,
          isFavorite: false,
          onSelect: () => {},
          onToggleFavorite: () => {},
        })
      );

      // 1. Name
      expect(html).toContain(p.name);
      // 2. Category
      expect(html).toContain('Farm');
      expect(html).toContain('🌿');
      // 3. Location
      expect(html).toContain('Archanes');
      expect(html).toContain('HERAKLION');
      // 4. Visitability signal
      expect(html).toContain('Walk-ins welcome');
      // 5. Road/access signal
      expect(html).toContain('Unpaved access');
      // 6. View Story action
      expect(html).toContain('View Story');
    });

    it('reduces visual clutter on the card by not displaying secondary variety or price tags', () => {
      const p = createTestProducer('winery', {
        indigenousVarieties: ['Vidiano', 'Liatiko'],
        priceLevel: '€€',
        rating: 4.9,
      });

      const html = renderToString(
        React.createElement(ProducerCard, {
          producer: p,
          isSelected: false,
          isFavorite: false,
          onSelect: () => {},
          onToggleFavorite: () => {},
        })
      );

      // Clutter removed from card (deferred to detail drawer)
      expect(html).not.toContain('Vidiano');
      expect(html).not.toContain('Liatiko');
      expect(html).not.toContain('€€');
    });

    it('preserves honest unknown road access state without positive fabrication', () => {
      const p = createTestProducer('distillery', {
        roadAccessStatus: 'unreviewed',
        roadAccess: undefined,
      });

      const html = renderToString(
        React.createElement(ProducerCard, {
          producer: p,
          isSelected: false,
          isFavorite: false,
          onSelect: () => {},
          onToggleFavorite: () => {},
        })
      );

      expect(html).toContain('Access not classified');
      expect(html).not.toContain('Paved road');
      expect(html).not.toContain('4x4 required');
    });
  });

  describe('ProducerDetailDrawer Standardized Hierarchy', () => {
    it('adapts "What They Make" and "Visiting" terminology across all 7 categories without forcing wine terms', () => {
      const expectations: {
        cat: Category;
        whatTheyMake: string;
        specialties: string;
        visiting: string;
        callAction: string;
      }[] = [
        {
          cat: 'winery',
          whatTheyMake: 'Wines &amp; Indigenous Grape Varieties',
          specialties: 'Indigenous Grape Varieties',
          visiting: 'Cellar Door &amp; Visiting',
          callAction: 'Call Cellar Door',
        },
        {
          cat: 'brewery',
          whatTheyMake: 'Craft Beers &amp; Seasonal Brews',
          specialties: 'Beer Styles &amp; Hop Profiles',
          visiting: 'Brewery &amp; Visiting',
          callAction: 'Call Brewery',
        },
        {
          cat: 'olive_mill',
          whatTheyMake: 'Extra Virgin Olive Oils &amp; Harvests',
          specialties: 'Olive Cultivars &amp; Pressings',
          visiting: 'Mill &amp; Visiting',
          callAction: 'Call Olive Mill',
        },
        {
          cat: 'cheese_dairy',
          whatTheyMake: 'Cheeses &amp; Dairy Products',
          specialties: 'Products &amp; Specialties',
          visiting: 'Dairy &amp; Visiting',
          callAction: 'Call Dairy',
        },
        {
          cat: 'apiary',
          whatTheyMake: 'Honeys &amp; Bee Products',
          specialties: 'Honey Botanicals &amp; Nectars',
          visiting: 'Apiary &amp; Visiting',
          callAction: 'Call Apiary',
        },
        {
          cat: 'distillery',
          whatTheyMake: 'Distillates &amp; Traditional Spirits',
          specialties: 'Spirits &amp; Alembic Distillations',
          visiting: 'Distillery &amp; Visiting',
          callAction: 'Call Distillery',
        },
        {
          cat: 'farm',
          whatTheyMake: 'Farm Produce &amp; Agricultural Harvests',
          specialties: 'Cultivations &amp; Crops',
          visiting: 'Farm &amp; Visiting',
          callAction: 'Call Farm',
        },
      ];

      for (const item of expectations) {
        const p = createTestProducer(item.cat);
        const makeHtml = renderToString(
          React.createElement(ProducerDetailDrawer, {
            producer: p,
            onClose: () => {},
            initialTab: 'tastings',
          })
        );
        const visitHtml = renderToString(
          React.createElement(ProducerDetailDrawer, {
            producer: p,
            onClose: () => {},
            initialTab: 'visit',
          })
        );

        expect(makeHtml).toContain(item.whatTheyMake);
        expect(makeHtml).toContain(item.specialties);
        expect(makeHtml).not.toContain(item.visiting);
        expect(visitHtml).toContain(item.visiting);
        expect(visitHtml).toContain(item.callAction);
      }
    });

    it('clearly distinguishes between visiting and access in the drawer', () => {
      const p = createTestProducer('farm', {
        visitStatus: 'public_visits',
        visitNotes: 'Tours available on weekdays',
        roadAccess: 'unpaved_passable',
        roadAccessStatus: 'verified',
        roadAccessNotes: 'Passable unpaved track suitable for standard cars with care',
      });

      const html = renderToString(
        React.createElement(ProducerDetailDrawer, {
          producer: p,
          onClose: () => {},
          initialTab: 'visit',
        })
      );

      // Section C: Visiting
      expect(html).toContain('Farm &amp; Visiting');
      expect(html).toContain('Visitors Welcome');
      expect(html).toContain('Tours available on weekdays');
      expect(html).toContain('Call Farm');

      // Section D: Access (distinct header & invariant)
      expect(html).toContain('Road &amp; Navigation Access');
      expect(html).toContain('Passable unpaved road access');
      expect(html).toContain('Passable unpaved track suitable for standard cars with care');
      expect(html).toContain('Route Safety Notice');
      expect(html).toContain('does not by itself establish road conditions or the location of every production asset');
    });

    it('preserves unknown road access without making positive claims', () => {
      const p = createTestProducer('winery', {
        roadAccessStatus: 'unreviewed',
        roadAccess: undefined,
      });

      const html = renderToString(
        React.createElement(ProducerDetailDrawer, {
          producer: p,
          onClose: () => {},
          initialTab: 'visit',
        })
      );

      expect(html).toContain('Road Access Not Independently Classified');
      expect(html).toContain('have not been independently confirmed');
      expect(html).not.toContain('Paved road access');
      expect(html).not.toContain('4x4 access required');
    });

    it('has zero Peskesi-specific conditional taxonomy logic', () => {
      const helperSource = readFileSync('src/utils/producerCategory.ts', 'utf8');
      expect(helperSource).not.toContain('peskesi-farm-kazani');
      expect(helperSource).not.toContain('LEGACY_PESKESI_FARM_ID');
    });
  });

  describe('Visitability Trust & Neutral Category Descriptors', () => {
    it('does not infer public visitability or walk-in claims when visitStatus is unreviewed', () => {
      const p = createTestProducer('farm', {
        visitStatus: 'unreviewed',
        walkInFriendly: true,
      });

      const cardHtml = renderToString(
        React.createElement(ProducerCard, {
          producer: p,
          isSelected: false,
          isFavorite: false,
          onSelect: () => {},
          onToggleFavorite: () => {},
        })
      );

      // Card must remain neutral and not claim walk-ins welcome
      expect(cardHtml).toContain('Visit status unreviewed');
      expect(cardHtml).not.toContain('Walk-ins welcome');

      const drawerHtml = renderToString(
        React.createElement(ProducerDetailDrawer, {
          producer: p,
          onClose: () => {},
          initialTab: 'visit',
        })
      );

      // Drawer must remain neutral and not claim walk-in welcome
      expect(drawerHtml).toContain('Visit Status Unreviewed');
      expect(drawerHtml).not.toContain('Walk-in Welcome');
      expect(drawerHtml).not.toContain('Walk-ins welcome');
    });

    it('allows walkInFriendly to refine wording only when visitStatus is public_visits', () => {
      const p = createTestProducer('farm', {
        visitStatus: 'public_visits',
        walkInFriendly: true,
      });

      const cardHtml = renderToString(
        React.createElement(ProducerCard, {
          producer: p,
          isSelected: false,
          isFavorite: false,
          onSelect: () => {},
          onToggleFavorite: () => {},
        })
      );

      expect(cardHtml).toContain('Walk-ins welcome');

      const drawerHtml = renderToString(
        React.createElement(ProducerDetailDrawer, {
          producer: p,
          onClose: () => {},
          initialTab: 'visit',
        })
      );

      expect(drawerHtml).toContain('Visitors Welcome');
      expect(drawerHtml).toContain('Walk-ins welcome');
      expect(drawerHtml).toContain('Walk-in Welcome');
    });

    it('removes speculative category-wide qualifiers such as "nomadic" and "regenerative"', () => {
      const drawerSource = readFileSync('src/components/Drawer/ProducerDetailDrawer.tsx', 'utf8');

      // Category terminology must not assume philosophical or movement styles for all members
      expect(drawerSource).not.toContain('nomadic beekeeper');
      expect(drawerSource).not.toContain('regenerative farmer');
      expect(drawerSource).not.toContain('nomadic thyme honey');
      expect(drawerSource).toContain('beekeeper or apiary owner');
      expect(drawerSource).toContain('farmer or grower');

      const apiary = createTestProducer('apiary');
      const apiaryHtml = renderToString(
        React.createElement(ProducerDetailDrawer, {
          producer: apiary,
          onClose: () => {},
          initialTab: 'tastings',
        })
      );
      expect(apiaryHtml).not.toContain('nomadic');
      expect(apiaryHtml).toContain('Honeys &amp; Bee Products');

      const farm = createTestProducer('farm');
      const farmHtml = renderToString(
        React.createElement(ProducerDetailDrawer, {
          producer: farm,
          onClose: () => {},
          initialTab: 'tastings',
        })
      );
      expect(farmHtml).not.toContain('regenerative');
    });
  });

  it('does not describe generic review counts as verified visits', () => {
    const drawer = readFileSync(
      'src/components/Drawer/ProducerDetailDrawer.tsx',
      'utf8'
    );

    expect(drawer).not.toContain('verified visits');
    expect(drawer).toContain('({producer.reviewCount} reviews)');
  });

});

