import { afterEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { readFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import { ProducerDetailDrawer } from '../Drawer/ProducerDetailDrawer';
import { runtimeConfig } from '../../config/runtimeConfig';
import { Producer } from '../../types/terroir';
import { ProducerOverride } from '../../types/booking';

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

describe('Host-Managed Producer Imagery Integration', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('ProducerPortalModal — Profile Photos Tab Gating', () => {
    it('fails closed when both legacy prototype and durable uploads are disabled', () => {
      vi.stubEnv('VITE_ENABLE_HOST_MEDIA_PROTOTYPE', 'false');
      vi.stubEnv('VITE_ENABLE_HOST_MEDIA_UPLOADS', 'false');

      expect(runtimeConfig.hostMediaPrototype.enabled).toBe(false);

      const portalSource = readFileSync(
        'src/components/Portal/ProducerPortalModal.tsx',
        'utf8'
      );
      expect(portalSource).toContain('runtimeConfig.hostMediaPrototype.enabled &&');
      expect(portalSource).toContain('Profile Photos');
    });

    it('enables the photos surface for either explicit prototype testing or durable production uploads', () => {
      vi.stubEnv('VITE_ENABLE_HOST_MEDIA_PROTOTYPE', 'true');
      vi.stubEnv('VITE_ENABLE_HOST_MEDIA_UPLOADS', 'false');
      expect(runtimeConfig.hostMediaPrototype.enabled).toBe(true);

      vi.stubEnv('VITE_ENABLE_HOST_MEDIA_PROTOTYPE', 'false');
      vi.stubEnv('VITE_ENABLE_HOST_MEDIA_UPLOADS', 'true');
      expect(runtimeConfig.hostMediaPrototype.enabled).toBe(true);
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
