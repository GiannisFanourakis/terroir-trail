import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ProducerPortalModal } from './ProducerPortalModal';
import { ProducerDetailDrawer } from '../Drawer/ProducerDetailDrawer';
import { Producer } from '../../types/terroir';
import { ProducerOverride } from '../../types/booking';
import { UserProfile } from '../../types/auth';

const mockProducer: Producer = {
  id: 'lyrarakis-winery',
  name: 'Lyrarakis Winery',
  greekName: 'Οινοποιείο Λυραράκη',
  village: 'Alagni',
  region: 'Heraklion',
  destination: 'crete',
  description: 'Pioneering Cretan estate.',
  openingHours: 'Mon-Sat 10:00 - 18:00',
  ethos: ['family_estate', 'indigenous_only'],
  coordinates: [35.183416, 25.176466],
  category: 'winery',
  tagLine: 'Pioneers of Cretan indigenous varieties',
  story: 'Preserving rare grapes in the mountains.',
  coverImage: 'https://images.unsplash.com/photo-estate-cover',
  gallery: ['https://images.unsplash.com/photo-gallery-1'],
  indigenousVarieties: ['Vidiano'],
  tastingHighlights: ['Estate tasting'],
  locationStatus: 'verified_location',
  roadAccessStatus: 'verified',
  roadAccess: 'paved',
  visitStatus: 'public_visits',
};

const mockHostUser: UserProfile = {
  id: 'host-user-123',
  name: 'Elena Lyraraki',
  email: 'host@lyrarakis.com',
  role: 'producer',
  isProducer: true,
  producerIds: ['lyrarakis-winery'],
  claimedProducerId: 'lyrarakis-winery',
  claimStatus: 'verified_host',
  travelerType: 'wine_enthusiast',
  visitedProducers: [],
  personalNotes: {},
  memberSince: '2026-01-01',
};

describe('Host-Managed Producer Imagery Integration', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('ProducerPortalModal — Profile Photos Tab Gating', () => {
    it('hides Profile Photos tab button by default when prototype is disabled', () => {
      vi.stubEnv('VITE_ENABLE_HOST_MEDIA_PROTOTYPE', 'false');

      const html = renderToString(
        React.createElement(ProducerPortalModal, {
          isOpen: true,
          onClose: () => {},
          user: mockHostUser,
          producers: [mockProducer],
          bookings: [],
          onUpdateBookingStatus: async () => {},
          onSaveProducerOverride: async () => {},
          getProducerOverride: () => undefined,
        })
      );

      expect(html).not.toContain('Profile Photos');
      expect(html).toContain('Lyrarakis Winery');
      expect(html).toContain('Verified Host');
    });

    it('renders Profile Photos tab button and prototype banner when prototype is enabled', () => {
      vi.stubEnv('VITE_ENABLE_HOST_MEDIA_PROTOTYPE', 'true');

      const html = renderToString(
        React.createElement(ProducerPortalModal, {
          isOpen: true,
          onClose: () => {},
          user: mockHostUser,
          producers: [mockProducer],
          bookings: [],
          onUpdateBookingStatus: async () => {},
          onSaveProducerOverride: async () => {},
          getProducerOverride: () => ({
            producerId: 'lyrarakis-winery',
            isAcceptingBookings: true,
            updatedAt: new Date().toISOString(),
            uploadedImages: [
              {
                id: 'img-1',
                producerId: 'lyrarakis-winery',
                url: 'https://storage.supabase.co/producer-media/lyrarakis-winery/cover.webp',
                type: 'cover' as const,
                status: 'approved' as const,
                rightsConfirmed: true,
                source: 'host_upload' as const,
                uploadedAt: new Date().toISOString(),
              },
            ],
          }),
        })
      );

      // Button exists with photo counter
      expect(html).toContain('Profile Photos');
      expect(html).toContain('1'); // image count badge
    });
  });

  describe('ProducerDetailDrawer — Host Media Provenance Display', () => {
    it('renders "Provided by the producer" badge when approved host cover is present', () => {
      const hostOverride: ProducerOverride = {
        producerId: 'lyrarakis-winery',
        isAcceptingBookings: true,
        updatedAt: new Date().toISOString(),
        uploadedImages: [
          {
            id: 'host-cover-1',
            producerId: 'lyrarakis-winery',
            url: 'https://storage.supabase.co/producer-media/lyrarakis-winery/cover.webp',
            type: 'cover',
            status: 'approved',
            rightsConfirmed: true,
            source: 'host_upload',
            uploadedAt: new Date().toISOString(),
          },
        ],
      };

      const html = renderToString(
        React.createElement(ProducerDetailDrawer, {
          producer: mockProducer,
          onClose: () => {},
          producerOverride: hostOverride,
        })
      );

      expect(html).toContain('Provided by the producer');
      expect(html).toContain('Host verified');
    });

    it('renders default media attribution when no host-managed imagery exists', () => {
      const html = renderToString(
        React.createElement(ProducerDetailDrawer, {
          producer: mockProducer,
          onClose: () => {},
          producerOverride: undefined,
        })
      );

      expect(html).not.toContain('Provided by the producer');
      expect(html).not.toContain('Host verified');
    });
  });
});
