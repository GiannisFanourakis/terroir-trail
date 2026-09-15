export type ProducerImageType = 'cover' | 'gallery';
export type ProducerImageStatus = 'pending_review' | 'approved' | 'rejected';

export interface ProducerUploadedImage {
  id: string;
  producerId: string;
  url: string;
  thumbnailUrl?: string;
  storagePath?: string;
  type: ProducerImageType;
  status: ProducerImageStatus;
  caption?: string;
  uploadedAt: string;
  rightsConfirmed: boolean;
  source: 'host_upload';
  moderationNotes?: string;
}

export interface ProducerMediaLimits {
  maxCoverImages: number;
  maxGalleryImages: number;
  maxFileSizeBytes: number;
  allowedMimeTypes: readonly string[];
}

export const BASIC_HOST_MEDIA_LIMITS: ProducerMediaLimits = Object.freeze({
  maxCoverImages: 1,
  maxGalleryImages: 3,
  maxFileSizeBytes: 8 * 1024 * 1024, // 8MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
});

export const PRO_HOST_MEDIA_LIMITS: ProducerMediaLimits = Object.freeze({
  maxCoverImages: 1,
  maxGalleryImages: 10,
  maxFileSizeBytes: 8 * 1024 * 1024, // 8MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
});

export function getProducerMediaLimits(isProTier: boolean = false): ProducerMediaLimits {
  return isProTier ? PRO_HOST_MEDIA_LIMITS : BASIC_HOST_MEDIA_LIMITS;
}

export interface ImageValidationError {
  field: 'type' | 'size' | 'rights' | 'limit';
  message: string;
}

export function validateImageUpload(
  file: { type: string; size: number },
  currentGalleryCount: number,
  isCover: boolean,
  rightsConfirmed: boolean,
  isProTier: boolean = false
): { isValid: boolean; error?: ImageValidationError } {
  if (!rightsConfirmed) {
    return {
      isValid: false,
      error: {
        field: 'rights',
        message: 'You must confirm ownership or express license before uploading images.',
      },
    };
  }

  const limits = getProducerMediaLimits(isProTier);

  // Validate MIME type
  if (!limits.allowedMimeTypes.includes(file.type)) {
    return {
      isValid: false,
      error: {
        field: 'type',
        message: 'Unsupported format. Allowed formats: JPEG, PNG, and WebP (SVG and executables rejected).',
      },
    };
  }

  // Validate file size
  if (file.size > limits.maxFileSizeBytes) {
    return {
      isValid: false,
      error: {
        field: 'size',
        message: `File exceeds maximum allowed size of ${Math.round(limits.maxFileSizeBytes / (1024 * 1024))}MB.`,
      },
    };
  }

  // Validate gallery limit (only for gallery images)
  if (!isCover && currentGalleryCount >= limits.maxGalleryImages) {
    return {
      isValid: false,
      error: {
        field: 'limit',
        message: isProTier
          ? `Host Pro gallery limit reached (${limits.maxGalleryImages} images max).`
          : `Basic limit reached (${limits.maxGalleryImages} gallery images). Upgrade to Host Pro for up to 10 images.`,
      },
    };
  }

  return { isValid: true };
}
