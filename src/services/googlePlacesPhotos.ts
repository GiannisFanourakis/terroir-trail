import { useState, useEffect, useCallback } from 'react';
import { Producer, PhotoCredit } from '../types/terroir';

/**
 * Local listing imagery service.
 *
 * Images remain separate from Google Places discovery media. Explicit photo
 * credits are preserved when present; uncredited listing images remain
 * explicitly uncredited and must not inherit producer authorship or source URLs.
 */

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

/**
 * Formats estate images with authentic photographer and license credits
 */
export function getCuratedFallback(producer: Producer): EstatePhotosResult {
  const images = [producer.coverImage, ...(producer.gallery || [])].filter(
    (img, index, self) => img && self.indexOf(img) === index
  );

  const defaultCredit: PhotoCredit | undefined = producer.photoCredit;
  const galleryCredits = producer.galleryCredits || [];
  const hasGenuineCredit = Boolean(producer.photoCredit || galleryCredits.length > 0);

  return {
    producerId: producer.id,
    displayName: producer.name,
    photos: images.map((url, idx) => {
      const credit = idx === 0 ? defaultCredit : (galleryCredits[idx - 1] || defaultCredit);

      const attributionLabel = credit?.author
        ? credit.author + (credit.source ? ' · ' + credit.source : '') + (credit.license ? ' (' + credit.license + ')' : '')
        : 'TerroirTrail listing image';

      return {
        url,
        thumbUrl: url,
        attributions: [
          {
            displayName: attributionLabel,
            uri: credit?.url,
          },
        ],
        credit,
      };
    }),
    source: hasGenuineCredit ? 'verified_estate_media' : 'curated_fallback',
  };
}

/**
 * React Hook for zero-latency estate imagery loading with transparent credits
 */
export function useProducerPhotos(producer: Producer | null) {
  const [photosResult, setPhotosResult] = useState<EstatePhotosResult | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);

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
  const activePhoto = photos[activePhotoIndex] || (producer ? {
    url: producer.coverImage,
    thumbUrl: producer.coverImage,
    attributions: [{
      displayName: producer.photoCredit?.author
        ? producer.photoCredit.author
        : 'TerroirTrail listing image',
      uri: producer.photoCredit?.url,
    }],
    credit: producer.photoCredit,
  } : null);

  const activeCredit: PhotoCredit | null = activePhoto?.credit || producer?.photoCredit || null;

  return {
    photos,
    activePhoto,
    activeCredit,
    activePhotoIndex,
    setActivePhotoIndex,
    isGooglePlaces: false, // Disabled to eliminate financial and ToS risk
    isVerifiedMedia: Boolean(photosResult?.source === 'verified_estate_media'),
    isLoading: false,
    displayName: photosResult?.displayName || producer?.name,
    refetch: () => producer && loadPhotos(producer),
  };
}
