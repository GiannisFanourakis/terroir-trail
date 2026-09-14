import { Producer } from '../types/terroir';
import { ProducerOverride } from '../types/booking';
import { getEffectiveProducerCategory } from './producerCategory';
import { getCategoryFallbackImage } from './imageFallbacks';

export interface ResolvedProducerMedia {
  url: string;
  thumbnailUrl?: string;
  source: 'host_upload' | 'curated_estate' | 'category_fallback';
  provenanceLabel: string;
  author?: string;
  license?: string;
  isHostManaged: boolean;
  status?: 'approved' | 'pending_review';
}

/**
 * Strict imagery hierarchy:
 * 1. Approved host-uploaded image ("Provided by the producer")
 * 2. Curated TerroirTrail photo (with genuine photographer / estate credit)
 * 3. Neutral category fallback (never Google)
 *
 * Invariant: Google Places discovery imagery is NEVER returned by this resolver.
 */
export function resolveProducerCover(
  producer: Producer,
  override?: ProducerOverride
): ResolvedProducerMedia {
  // 1. Check for approved host-uploaded cover image
  const hostCover = override?.uploadedImages?.find(
    (img) => img.type === 'cover' && img.status === 'approved'
  );

  if (hostCover) {
    return {
      url: hostCover.url,
      thumbnailUrl: hostCover.thumbnailUrl || hostCover.url,
      source: 'host_upload',
      provenanceLabel: 'Provided by the producer',
      author: producer.name,
      isHostManaged: true,
      status: 'approved',
    };
  }

  // 2. Check for curated producer cover
  if (producer.coverImage && producer.coverImage.trim().length > 0) {
    const isCuratedCredit = Boolean(producer.photoCredit);
    return {
      url: producer.coverImage,
      thumbnailUrl: producer.coverImage,
      source: 'curated_estate',
      provenanceLabel: isCuratedCredit ? 'Verified TerroirTrail media' : 'Curated estate media',
      author: producer.photoCredit?.author || producer.name,
      license: producer.photoCredit?.license,
      isHostManaged: false,
    };
  }

  // 3. Fallback to neutral category image
  const fallbackUrl = getCategoryFallbackImage(getEffectiveProducerCategory(producer));
  return {
    url: fallbackUrl,
    thumbnailUrl: fallbackUrl,
    source: 'category_fallback',
    provenanceLabel: 'Category reference image',
    isHostManaged: false,
  };
}

export function resolveProducerGallery(
  producer: Producer,
  override?: ProducerOverride
): ResolvedProducerMedia[] {
  const result: ResolvedProducerMedia[] = [];

  // 1. Approved host-uploaded gallery images first
  const approvedHostGallery = (override?.uploadedImages || []).filter(
    (img) => img.type === 'gallery' && img.status === 'approved'
  );

  for (const hostImg of approvedHostGallery) {
    result.push({
      url: hostImg.url,
      thumbnailUrl: hostImg.thumbnailUrl || hostImg.url,
      source: 'host_upload',
      provenanceLabel: 'Provided by the producer',
      author: producer.name,
      isHostManaged: true,
      status: 'approved',
    });
  }

  // 2. Curated gallery images from producer definition
  const gallery = producer.gallery || [];
  const galleryCredits = producer.galleryCredits || [];

  gallery.forEach((url, idx) => {
    if (result.some((r) => r.url === url)) return;

    const credit = galleryCredits[idx];
    result.push({
      url,
      thumbnailUrl: url,
      source: 'curated_estate',
      provenanceLabel: credit?.author ? 'Verified TerroirTrail media' : 'Curated estate media',
      author: credit?.author || producer.name,
      license: credit?.license,
      isHostManaged: false,
    });
  });

  return result;
}
