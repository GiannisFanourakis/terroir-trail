import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Producer } from '../types/terroir';
import { ProducerOverride } from '../types/booking';
import { resolveProducerCover, resolveProducerGallery } from './producerMediaResolver';
import { validateImageUpload, getProducerMediaLimits } from '../types/producerMedia';

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
  photoCredit: {
    author: 'Elena K.',
    source: 'Wikimedia Commons',
    license: 'CC BY-SA 4.0',
  },
  gallery: [
    'https://images.unsplash.com/photo-vineyard',
    'https://images.unsplash.com/photo-cellar',
  ],
  galleryCredits: [
    { author: 'Nikos P.', source: 'Terroir Archive' },
  ],
  indigenousVarieties: ['Vidiano'],
  tastingHighlights: ['Estate tasting'],
  locationStatus: 'verified_location',
  roadAccessStatus: 'verified',
  roadAccess: 'paved',
  visitStatus: 'public_visits',
};

describe('Producer Media Resolver & Tier Validation', () => {
  describe('Cover Image Resolution Hierarchy', () => {
    it('prioritizes approved host-uploaded cover image over curated cover and fallback', () => {
      const override: ProducerOverride = {
        producerId: 'lyrarakis-winery',
        isAcceptingBookings: true,
        updatedAt: new Date().toISOString(),
        uploadedImages: [
          {
            id: 'host-img-1',
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

      const resolved = resolveProducerCover(mockProducer, override);
      expect(resolved.url).toBe('https://storage.supabase.co/producer-media/lyrarakis-winery/cover.webp');
      expect(resolved.source).toBe('host_upload');
      expect(resolved.provenanceLabel).toBe('Provided by the producer');
      expect(resolved.isHostManaged).toBe(true);
      expect(resolved.author).toBe(mockProducer.name);
    });

    it('ignores pending_review host cover and falls back to curated cover', () => {
      const override: ProducerOverride = {
        producerId: 'lyrarakis-winery',
        isAcceptingBookings: true,
        updatedAt: new Date().toISOString(),
        uploadedImages: [
          {
            id: 'host-img-pending',
            producerId: 'lyrarakis-winery',
            url: 'https://storage.supabase.co/producer-media/lyrarakis-winery/pending.webp',
            type: 'cover',
            status: 'pending_review',
            rightsConfirmed: true,
            source: 'host_upload',
            uploadedAt: new Date().toISOString(),
          },
        ],
      };

      const resolved = resolveProducerCover(mockProducer, override);
      expect(resolved.url).toBe(mockProducer.coverImage);
      expect(resolved.source).toBe('curated_estate');
      expect(resolved.isHostManaged).toBe(false);
      expect(resolved.author).toBe('Elena K.');
    });

    it('quarantines uncredited stock/listing cover imagery', () => {
      const uncreditedProducer: Producer = {
        ...mockProducer,
        photoCredit: undefined,
      };

      const resolved = resolveProducerCover(uncreditedProducer);

      expect(resolved.source).toBe('category_fallback');
      expect(resolved.provenanceLabel).toBe(
        'Neutral category placeholder'
      );
      expect(resolved.url).toContain('data:image/svg+xml');
      expect(resolved.url).not.toBe(uncreditedProducer.coverImage);
    });

    it('ignores host blob URLs when host media prototype is disabled', () => {
      vi.stubEnv('VITE_ENABLE_HOST_MEDIA_PROTOTYPE', 'false');

      const overrideWithBlob: ProducerOverride = {
        producerId: 'lyrarakis-winery',
        isAcceptingBookings: true,
        updatedAt: new Date().toISOString(),
        uploadedImages: [
          {
            id: 'blob-cover',
            producerId: 'lyrarakis-winery',
            url: 'blob:http://localhost:5173/mock-blob-uuid',
            type: 'cover',
            status: 'approved',
            rightsConfirmed: true,
            source: 'host_upload',
            uploadedAt: new Date().toISOString(),
          },
        ],
      };

      const resolved = resolveProducerCover(mockProducer, overrideWithBlob);
      // Falls back to curated cover since blob is ignored
      expect(resolved.url).toBe(mockProducer.coverImage);
      expect(resolved.source).toBe('curated_estate');

      vi.unstubAllEnvs();
    });

    it('accepts host blob URLs when host media prototype is enabled', () => {
      vi.stubEnv('VITE_ENABLE_HOST_MEDIA_PROTOTYPE', 'true');

      const overrideWithBlob: ProducerOverride = {
        producerId: 'lyrarakis-winery',
        isAcceptingBookings: true,
        updatedAt: new Date().toISOString(),
        uploadedImages: [
          {
            id: 'blob-cover',
            producerId: 'lyrarakis-winery',
            url: 'blob:http://localhost:5173/mock-blob-uuid',
            type: 'cover',
            status: 'approved',
            rightsConfirmed: true,
            source: 'host_upload',
            uploadedAt: new Date().toISOString(),
          },
        ],
      };

      const resolved = resolveProducerCover(mockProducer, overrideWithBlob);
      expect(resolved.url).toBe('blob:http://localhost:5173/mock-blob-uuid');
      expect(resolved.source).toBe('host_upload');

      vi.unstubAllEnvs();
    });

    it('falls back to category image if producer cover is empty', () => {
      const producerWithoutCover: Producer = {
        ...mockProducer,
        coverImage: '',
      };

      const resolved = resolveProducerCover(producerWithoutCover);
      expect(resolved.source).toBe('category_fallback');
      expect(resolved.isHostManaged).toBe(false);
      expect(resolved.url).toContain('data:image/svg+xml');
    });
  });

  describe('Gallery Image Resolution', () => {
    it('combines approved host images first with curated estate gallery images', () => {
      const override: ProducerOverride = {
        producerId: 'lyrarakis-winery',
        isAcceptingBookings: true,
        updatedAt: new Date().toISOString(),
        uploadedImages: [
          {
            id: 'host-gal-1',
            producerId: 'lyrarakis-winery',
            url: 'https://storage.supabase.co/producer-media/lyrarakis-winery/host-1.webp',
            type: 'gallery',
            status: 'approved',
            rightsConfirmed: true,
            source: 'host_upload',
            uploadedAt: new Date().toISOString(),
          },
          {
            id: 'host-gal-pending',
            producerId: 'lyrarakis-winery',
            url: 'https://storage.supabase.co/producer-media/lyrarakis-winery/pending-gal.webp',
            type: 'gallery',
            status: 'pending_review',
            rightsConfirmed: true,
            source: 'host_upload',
            uploadedAt: new Date().toISOString(),
          },
        ],
      };

      const gallery = resolveProducerGallery(mockProducer, override);
      // host-gal-1 + 2 curated gallery items
      expect(gallery).toHaveLength(3);
      expect(gallery[0].url).toBe('https://storage.supabase.co/producer-media/lyrarakis-winery/host-1.webp');
      expect(gallery[0].source).toBe('host_upload');
      expect(gallery[0].provenanceLabel).toBe('Provided by the producer');

      expect(gallery[1].url).toBe(mockProducer.gallery[0]);
      expect(gallery[1].source).toBe('curated_estate');
      expect(gallery[1].provenanceLabel).toBe('Credited listing image');
      expect(gallery[1].author).toBe('Nikos P.');

      // Second gallery item inherits the explicit producer-level credit.
      expect(gallery[2].url).toBe(mockProducer.gallery[1]);
      expect(gallery[2].source).toBe('curated_estate');
      expect(gallery[2].provenanceLabel).toBe(
        'Credited listing image'
      );
      expect(gallery[2].author).toBe('Elena K.');
    });

    it('ignores host blob gallery images when prototype is disabled', () => {
      vi.stubEnv('VITE_ENABLE_HOST_MEDIA_PROTOTYPE', 'false');

      const override: ProducerOverride = {
        producerId: 'lyrarakis-winery',
        isAcceptingBookings: true,
        updatedAt: new Date().toISOString(),
        uploadedImages: [
          {
            id: 'blob-gal-1',
            producerId: 'lyrarakis-winery',
            url: 'blob:http://localhost:5173/gallery-blob-1',
            type: 'gallery',
            status: 'approved',
            rightsConfirmed: true,
            source: 'host_upload',
            uploadedAt: new Date().toISOString(),
          },
        ],
      };

      const gallery = resolveProducerGallery(mockProducer, override);
      // Blob is ignored, only the 2 curated gallery items remain
      expect(gallery).toHaveLength(2);
      expect(gallery.some((g) => g.url.startsWith('blob:'))).toBe(false);

      vi.unstubAllEnvs();
    });
  });

  describe('Upload Validation & Tier Limits', () => {
    it('requires rights confirmation checkbox', () => {
      const result = validateImageUpload(
        { type: 'image/jpeg', size: 1024 * 100 },
        0,
        false,
        false // unconfirmed
      );
      expect(result.isValid).toBe(false);
      expect(result.error?.field).toBe('rights');
    });

    it('rejects unsupported file types (SVG, executables, scripts)', () => {
      const invalidTypes = ['image/svg+xml', 'application/javascript', 'application/octet-stream', 'image/gif'];
      for (const mime of invalidTypes) {
        const result = validateImageUpload(
          { type: mime, size: 1024 * 100 },
          0,
          false,
          true
        );
        expect(result.isValid).toBe(false);
        expect(result.error?.field).toBe('type');
      }
    });

    it('accepts JPEG, PNG, and WebP formats under 8MB', () => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      for (const mime of validTypes) {
        const result = validateImageUpload(
          { type: mime, size: 2 * 1024 * 1024 },
          0,
          false,
          true
        );
        expect(result.isValid).toBe(true);
      }
    });

    it('rejects files exceeding 8MB size limit', () => {
      const result = validateImageUpload(
        { type: 'image/jpeg', size: 9 * 1024 * 1024 },
        0,
        false,
        true
      );
      expect(result.isValid).toBe(false);
      expect(result.error?.field).toBe('size');
      expect(result.error?.message).toContain('8MB');
    });

    it('enforces 3-gallery limit on Basic Host and up to 10 on Host Pro', () => {
      const basicLimits = getProducerMediaLimits(false);
      expect(basicLimits.maxGalleryImages).toBe(3);

      const proLimits = getProducerMediaLimits(true);
      expect(proLimits.maxGalleryImages).toBe(10);

      // Attempting 4th image on basic
      const basicCheck = validateImageUpload(
        { type: 'image/jpeg', size: 500 * 1024 },
        3, // already 3
        false, // gallery image
        true,
        false // not pro
      );
      expect(basicCheck.isValid).toBe(false);
      expect(basicCheck.error?.field).toBe('limit');
      expect(basicCheck.error?.message).toContain('Basic limit reached');

      // Attempting 4th image on Host Pro (allowed)
      const proCheck = validateImageUpload(
        { type: 'image/jpeg', size: 500 * 1024 },
        3,
        false,
        true,
        true // is pro
      );
      expect(proCheck.isValid).toBe(true);
    });
  });
});
