import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ProducerDetailDrawer } from './Drawer/ProducerDetailDrawer';
import { ProducerCard } from './Sidebar/ProducerCard';
import { Producer } from '../types/terroir';

// Mock googlePlacesPhotos so it returns curated photos safely without network
vi.mock('../services/googlePlacesPhotos', () => ({
  useProducerPhotos: (producer: Producer) => ({
    photos: [{ url: producer.coverImage, thumbUrl: producer.coverImage, attributions: [] }],
    activeCredit: producer.photoCredit,
    source: 'curated_fallback',
  }),
}));

const baseTestProducer: Producer = {
  id: 'test-producer-alpha',
  name: 'Test Estate Alpha',
  greekName: 'Δοκιμαστικό Κτήμα',
  category: 'winery',
  destination: 'crete',
  region: 'Heraklion',
  village: 'Archanes',
  description: 'A test artisan producer.',
  story: 'Generations of traditional craftsmanship in Crete.',
  coverImage: '/images/estates/boutari-skalani.jpg',
  coordinates: [35.23, 25.16],
  indigenousVarieties: ['Vidiano', 'Liatiko'],
  tastingHighlights: ['Estate Reserve Flight'],
  ethos: ['organic'],
  tagLine: 'Authentic Mountain Craft',
  gallery: [],
  openingHours: 'Mon-Sat 10:00 - 18:00',
};

describe('Producer Verification and Visitability UI Integrity', () => {
  describe('Case 1: public_visits', () => {
    it('renders Visitors Welcome badge and public visiting details with adaptive category terminology', () => {
      const producer: Producer = {
        ...baseTestProducer,
        category: 'olive_mill',
        visitStatus: 'public_visits',
        visitNotes: 'Tasting terrace open daily from April to October',
        visitSourceUrl: 'https://example.com/olive-mill-visits',
        phone: '+30 2810 123456',
        website: 'https://example.com',
      };

      const html = renderToString(
        React.createElement(ProducerDetailDrawer, {
          producer,
          onClose: () => {},
          initialTab: 'tastings',
        })
      );

      // Badge and visiting style
      expect(html).toContain('Visitors Welcome');
      expect(html).toContain('publicly welcomes visitors');
      // Category adapted visiting title
      expect(html).toContain('Mill &amp; Visiting');
      // Visit notes
      expect(html).toContain('Tasting terrace open daily from April to October');
      // Category adapted direct call action
      expect(html).toContain('Call Olive Mill');
    });
  });

  describe('Case 2: appointment_only', () => {
    it('renders Visits by Appointment badge and does not fabricate walk-in status when undefined', () => {
      const producer: Producer = {
        ...baseTestProducer,
        category: 'winery',
        visitStatus: 'appointment_only',
        visitNotes: 'Private cellar appointments required 48h in advance',
        walkInFriendly: undefined,
        phone: '+30 2810 999999',
      };

      const html = renderToString(
        React.createElement(ProducerDetailDrawer, {
          producer,
          onClose: () => {},
          initialTab: 'tastings',
        })
      );

      expect(html).toContain('Visits by Appointment');
      expect(html).toContain('by appointment only');
      expect(html).toContain('Private cellar appointments required 48h in advance');
      expect(html).toContain('Call Cellar Door');

      // Now check Tab 3 (visiting/access): must not render Walk-in Welcome
      const htmlTab3 = renderToString(
        React.createElement(ProducerDetailDrawer, {
          producer,
          onClose: () => {},
          initialTab: 'visit',
        })
      );

      expect(htmlTab3).not.toContain('Walk-in Welcome');
    });
  });

  describe('Case 3: not_publicly_confirmed', () => {
    it('renders Public Visits Not Confirmed badge and informs traveler that visiting is not confirmed', () => {
      const producer: Producer = {
        ...baseTestProducer,
        category: 'cheese_dairy',
        visitStatus: 'not_publicly_confirmed',
        phone: '+30 2831 555555',
      };

      const html = renderToString(
        React.createElement(ProducerDetailDrawer, {
          producer,
          onClose: () => {},
          initialTab: 'tastings',
        })
      );

      expect(html).toContain('Public Visits Not Confirmed');
      expect(html).toContain('Public visits not currently confirmed');
      expect(html).toContain('Dairy &amp; Visiting');
      expect(html).toContain('Call Dairy');
    });
  });

  describe('Case 4: current_access_uncertain', () => {
    it('renders Access Uncertain badge and neutral cautionary language', () => {
      const producer: Producer = {
        ...baseTestProducer,
        category: 'kazani',
        visitStatus: 'current_access_uncertain',
        visitNotes: 'Distillery undergoing renovation; contact maker before traveling',
        phone: '+30 2810 777777',
      };

      const html = renderToString(
        React.createElement(ProducerDetailDrawer, {
          producer,
          onClose: () => {},
          initialTab: 'tastings',
        })
      );

      expect(html).toContain('Access Uncertain');
      expect(html).toContain('Current visitor access should be confirmed directly with the producer before travelling');
      expect(html).toContain('Distillery undergoing renovation; contact maker before traveling');
      expect(html).toContain('Call Distillery');
    });
  });

  describe('Case 5: location_status = unresolved', () => {
    it('displays verification warning in Tab 3 and suppresses Directions button in sticky footer', () => {
      const producer: Producer = {
        ...baseTestProducer,
        locationStatus: 'unresolved',
        googleMapsUrl: undefined,
        phone: '+30 2810 888888',
      };

      // Check Tab 3: Shows exact navigation point verification notice
      const htmlTab3 = renderToString(
        React.createElement(ProducerDetailDrawer, {
          producer,
          onClose: () => {},
          initialTab: 'visit',
        })
      );

      expect(htmlTab3).toContain('Exact Navigation Point Under Verification');
      expect(htmlTab3).toContain('The precise visitor entrance for this producer is still being verified');

      // Check Sticky Footer: Must NOT render a link pointing to Google Maps directions
      expect(htmlTab3).toContain('Navigation Pending');
      expect(htmlTab3).not.toContain('href="https://www.google.com/maps');
    });
  });

  describe('Case 6: Null / undefined database fields', () => {
    it('does not render fabricated badges or defaults in ProducerDetailDrawer', () => {
      const sparseProducer: Producer = {
        ...baseTestProducer,
        rating: undefined,
        priceLevel: undefined,
        roadAccess: undefined,
        foodOption: undefined,
        dogFriendly: undefined,
        kidFriendly: undefined,
        campervanFriendly: undefined,
        walkInFriendly: undefined,
        googleMapsUrl: undefined,
      };

      // Render Tab 1 (Story)
      const htmlStory = renderToString(
        React.createElement(ProducerDetailDrawer, {
          producer: sparseProducer,
          onClose: () => {},
          initialTab: 'story',
        })
      );

      // Top metrics bar (rating & price level) must be absent
      expect(htmlStory).not.toContain('5.0');
      expect(htmlStory).not.toContain('Reviews');

      // Render Tab 3 (Visit & Access)
      const htmlVisit = renderToString(
        React.createElement(ProducerDetailDrawer, {
          producer: sparseProducer,
          onClose: () => {},
          initialTab: 'visit',
        })
      );

      // Must NOT fabricate negative or positive claims
      expect(htmlVisit).not.toContain('No Pets');
      expect(htmlVisit).not.toContain('Dog Friendly');
      expect(htmlVisit).not.toContain('No Campervans');
      expect(htmlVisit).not.toContain('Campervan Friendly');
      expect(htmlVisit).not.toContain('Adults Only');
      expect(htmlVisit).not.toContain('Family Friendly');
      expect(htmlVisit).not.toContain('Walk-in Welcome');
      expect(htmlVisit).not.toContain('4x4 Required');
      expect(htmlVisit).not.toContain('Paved Road');
    });

    it('does not render fabricated rating or road access on ProducerCard', () => {
      const sparseProducer: Producer = {
        ...baseTestProducer,
        rating: undefined,
        priceLevel: undefined,
        roadAccess: undefined,
      };

      const htmlCard = renderToString(
        React.createElement(ProducerCard, {
          producer: sparseProducer,
          isSelected: false,
          isFavorite: false,
          onSelect: () => {},
          onToggleFavorite: () => {},
        })
      );

      expect(htmlCard).not.toContain('5.0');
      expect(htmlCard).not.toContain('4x4 Required');
      expect(htmlCard).not.toContain('Paved Road');
    });
  });
});
