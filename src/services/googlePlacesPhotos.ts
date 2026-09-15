import { useState, useEffect, useCallback } from 'react';
import { Producer, PhotoCredit } from '../types/terroir';
import { getCategoryFallbackImage } from '../utils/imageFallbacks';
import { getEffectiveProducerCategory } from '../utils/producerCategory';

export interface PhotoAuthorAttribution {
  displayName: string;
  uri?: string;
  photoURI?: string;
}

export interface EstatePlacePhoto {
  url: string;
  thumbUrl: string;
  attributions: PhotoAuthorAttribution[];
  credit?: PhotoCredit;
}

export interface EstatePhotosResult {
  producerId: string;
  placeId?: string;
  displayName?: string;
  photos: EstatePlacePhoto[];
  source: 'verified_estate_media' | 'curated_fallback';
}

function toListingPhoto(
  url: string,
  credit: PhotoCredit
): EstatePlacePhoto {
  return {
    url,
    thumbUrl: url,
    attributions: [
      {
        displayName:
          credit.author +
          (credit.source ? ` · ${credit.source}` : '') +
          (credit.license ? ` (${credit.license})` : ''),
        uri: credit.url,
      },
    ],
    credit,
  };
}

/**
 * Only explicitly credited/provenanced listing imagery is exposed.
 * Uncredited stock/listing images are quarantined.
 */
export function getCuratedFallback(
  producer: Producer
): EstatePhotosResult {
  const photos: EstatePlacePhoto[] = [];
  const seen = new Set<string>();

  if (
    producer.coverImage &&
    producer.photoCredit?.author &&
    !seen.has(producer.coverImage)
  ) {
    photos.push(
      toListingPhoto(producer.coverImage, producer.photoCredit)
    );
    seen.add(producer.coverImage);
  }

  const gallery = producer.gallery || [];
  const galleryCredits = producer.galleryCredits || [];

  gallery.forEach((url, idx) => {
    if (!url || seen.has(url)) return;

    const credit = galleryCredits[idx] || producer.photoCredit;
    if (!credit?.author) return;

    photos.push(toListingPhoto(url, credit));
    seen.add(url);
  });

  return {
    producerId: producer.id,
    displayName: producer.name,
    photos,
    source:
      photos.length > 0
        ? 'verified_estate_media'
        : 'curated_fallback',
  };
}

export function useProducerPhotos(producer: Producer | null) {
  const [photosResult, setPhotosResult] =
    useState<EstatePhotosResult | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] =
    useState<number>(0);

  const loadPhotos = useCallback((p: Producer) => {
    setPhotosResult(getCuratedFallback(p));
    setActivePhotoIndex(0);
  }, []);

  useEffect(() => {
    if (producer) {
      loadPhotos(producer);
    } else {
      setPhotosResult(null);
      setActivePhotoIndex(0);
    }
  }, [producer, loadPhotos]);

  const photos = photosResult?.photos || [];

  const placeholder = producer
    ? getCategoryFallbackImage(
        getEffectiveProducerCategory(producer)
      )
    : '';

  const activePhoto =
    photos[activePhotoIndex] ||
    (producer
      ? {
          url: placeholder,
          thumbUrl: placeholder,
          attributions: [
            {
              displayName:
                'Neutral category placeholder · producer photo pending',
            },
          ],
        }
      : null);

  const activeCredit: PhotoCredit | null =
    activePhoto && 'credit' in activePhoto && activePhoto.credit
      ? activePhoto.credit
      : null;

  return {
    photos,
    activePhoto,
    activeCredit,
    activePhotoIndex,
    setActivePhotoIndex,
    isGooglePlaces: false,
    isVerifiedMedia:
      photosResult?.source === 'verified_estate_media',
    isLoading: false,
    displayName:
      photosResult?.displayName || producer?.name,
    refetch: () => producer && loadPhotos(producer),
  };
}
