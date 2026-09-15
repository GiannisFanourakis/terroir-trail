import { Producer } from '../types/terroir';
import { ProducerOverride } from '../types/booking';
import { getEffectiveProducerCategory } from './producerCategory';
import { getCategoryFallbackImage } from './imageFallbacks';
import { isHostMediaPrototypeEnabled } from '../config/runtimeConfig';

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
 * 1. Approved producer-uploaded image.
 * 2. Listing image with explicit genuine photo provenance.
 * 3. Neutral non-photographic category placeholder.
 *
 * Google Places imagery remains live-rendered separately.
 */
export function resolveProducerCover(
  producer: Producer,
  override?: ProducerOverride
): ResolvedProducerMedia {
  const isPrototype = isHostMediaPrototypeEnabled();

  const hostCover = override?.uploadedImages?.find(
    (img) =>
      img.type === 'cover' &&
      img.status === 'approved' &&
      (isPrototype || !img.url.startsWith('blob:'))
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

  if (
    producer.coverImage &&
    producer.coverImage.trim().length > 0 &&
    producer.photoCredit?.author
  ) {
    return {
      url: producer.coverImage,
      thumbnailUrl: producer.coverImage,
      source: 'curated_estate',
      provenanceLabel: 'Credited listing image',
      author: producer.photoCredit.author,
      license: producer.photoCredit.license,
      isHostManaged: false,
    };
  }

  const fallbackUrl = getCategoryFallbackImage(
    getEffectiveProducerCategory(producer)
  );

  return {
    url: fallbackUrl,
    thumbnailUrl: fallbackUrl,
    source: 'category_fallback',
    provenanceLabel: 'Neutral category placeholder',
    isHostManaged: false,
  };
}

export function resolveProducerGallery(
  producer: Producer,
  override?: ProducerOverride
): ResolvedProducerMedia[] {
  const result: ResolvedProducerMedia[] = [];
  const isPrototype = isHostMediaPrototypeEnabled();

  const approvedHostGallery = (override?.uploadedImages || []).filter(
    (img) =>
      img.type === 'gallery' &&
      img.status === 'approved' &&
      (isPrototype || !img.url.startsWith('blob:'))
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

  const gallery = producer.gallery || [];
  const galleryCredits = producer.galleryCredits || [];

  gallery.forEach((url, idx) => {
    if (!url || result.some((r) => r.url === url)) return;

    const credit = galleryCredits[idx] || producer.photoCredit;

    // Legacy/uncredited stock imagery is deliberately quarantined.
    if (!credit?.author) return;

    result.push({
      url,
      thumbnailUrl: url,
      source: 'curated_estate',
      provenanceLabel: 'Credited listing image',
      author: credit.author,
      license: credit.license,
      isHostManaged: false,
    });
  });

  return result;
}
