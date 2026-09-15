import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref as storageRef,
  uploadBytes,
} from 'firebase/storage';
import type { ProducerOverride } from '../types/booking';
import type { ProducerUploadedImage } from '../types/producerMedia';
import { BASIC_HOST_MEDIA_LIMITS } from '../types/producerMedia';
import { runtimeConfig } from '../config/runtimeConfig';
import { logger } from './logger';

const extensionForMimeType = (mimeType: string): string => {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return 'bin';
  }
};

const validateBlobBeforeUpload = (blob: Blob): void => {
  if (!BASIC_HOST_MEDIA_LIMITS.allowedMimeTypes.includes(blob.type)) {
    throw new Error('Unsupported image format. Use JPEG, PNG, or WebP.');
  }
  if (blob.size > BASIC_HOST_MEDIA_LIMITS.maxFileSizeBytes) {
    throw new Error('Image exceeds the 8MB upload limit.');
  }
};

/**
 * Replaces temporary browser blob URLs in producer overrides with durable
 * Firebase Storage download URLs before the override is written to Firestore.
 * Storage Security Rules remain the final authority for producer ownership.
 */
export async function persistProducerOverrideMedia(
  app: FirebaseApp,
  auth: Auth,
  override: ProducerOverride
): Promise<ProducerOverride> {
  const images = override.uploadedImages || [];
  if (!images.some((image) => image.url.startsWith('blob:'))) {
    return override;
  }

  if (!auth.currentUser) {
    throw new Error('Authentication required to upload producer images.');
  }

  if (!runtimeConfig.firebase.storageBucket) {
    throw new Error('Producer image storage is not configured.');
  }

  const storage = getStorage(app);
  const ownerUid = auth.currentUser.uid;

  const uploadedImages = await Promise.all(
    images.map(async (image): Promise<ProducerUploadedImage> => {
      if (!image.url.startsWith('blob:')) return image;

      const response = await fetch(image.url);
      if (!response.ok) {
        throw new Error('Unable to read the selected image for upload.');
      }

      const blob = await response.blob();
      validateBlobBeforeUpload(blob);

      const extension = extensionForMimeType(blob.type);
      const storagePath = `producer-media/${override.producerId}/${image.id}.${extension}`;
      const destination = storageRef(storage, storagePath);

      await uploadBytes(destination, blob, {
        contentType: blob.type,
        cacheControl: 'public,max-age=31536000',
        customMetadata: {
          producerId: override.producerId,
          ownerUid,
          imageType: image.type,
          rightsConfirmed: image.rightsConfirmed ? 'true' : 'false',
        },
      });

      const url = await getDownloadURL(destination);
      return {
        ...image,
        url,
        thumbnailUrl: url,
        storagePath,
      };
    })
  );

  return {
    ...override,
    uploadedImages,
  };
}

/**
 * Best-effort cleanup for media removed or replaced by the producer. Metadata
 * is authoritative, so cleanup failure never resurrects a removed image.
 */
export async function cleanupRemovedProducerMedia(
  app: FirebaseApp,
  previousImages: ProducerUploadedImage[] = [],
  nextImages: ProducerUploadedImage[] = []
): Promise<void> {
  if (!runtimeConfig.firebase.storageBucket || previousImages.length === 0) return;

  const retainedPaths = new Set(
    nextImages
      .map((image) => image.storagePath)
      .filter((path): path is string => Boolean(path))
  );

  const stalePaths = previousImages
    .map((image) => image.storagePath)
    .filter((path): path is string => Boolean(path) && !retainedPaths.has(path));

  if (stalePaths.length === 0) return;

  const storage = getStorage(app);
  await Promise.all(
    stalePaths.map(async (path) => {
      try {
        await deleteObject(storageRef(storage, path));
      } catch (error) {
        logger.warn('Firebase', 'producer_media_cleanup_failed', {
          path,
          reason: error instanceof Error ? error.message : 'unknown',
        });
      }
    })
  );
}
