import { adminDb } from '../firebaseAdmin';
import { getTrustedAccountCapabilities } from './accountAuthorization';

export interface HostProducerMediaInput {
  id: string;
  producerId: string;
  url: string;
  thumbnailUrl?: string;
  storagePath?: string;
  type: 'cover' | 'gallery';
  status?: string;
  caption?: string;
  uploadedAt: string;
  rightsConfirmed: boolean;
  source: 'host_upload';
}

export class ProducerMediaSubmissionError extends Error {
  constructor(
    public readonly code: 'forbidden' | 'not_found' | 'bad_request',
    message: string
  ) {
    super(message);
    this.name = 'ProducerMediaSubmissionError';
  }
}

const cleanOptionalText = (value: unknown, maxLength: number): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const cleaned = value.trim();
  if (!cleaned) return undefined;
  return cleaned.slice(0, maxLength);
};

const isFirebaseDownloadUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && (
      parsed.hostname === 'firebasestorage.googleapis.com' ||
      parsed.hostname.endsWith('.firebasestorage.app') ||
      parsed.hostname === 'storage.googleapis.com'
    );
  } catch {
    return false;
  }
};

const validateStoragePath = (producerId: string, storagePath: string | undefined) => {
  if (!storagePath) {
    throw new ProducerMediaSubmissionError('bad_request', 'Uploaded producer photos must include a storage path.');
  }
  const prefix = `producer-media/${producerId}/`;
  if (!storagePath.startsWith(prefix) || storagePath.includes('..') || storagePath.length > 500) {
    throw new ProducerMediaSubmissionError('bad_request', 'Producer photo storage path is invalid.');
  }
};

/**
 * Writes producer-controlled media metadata through the trusted API instead of
 * allowing hosts to rewrite moderation fields in Firestore directly.
 *
 * New image IDs are always forced to pending_review. Existing image IDs retain
 * their immutable media identity and moderation state, so replacing the bytes
 * behind an already-approved image cannot inherit approval. A host may remove
 * one of their own images by omitting it from the submitted set.
 */
export async function replaceOwnedProducerMedia(
  actorUid: string,
  producerId: string,
  requestedImages: HostProducerMediaInput[],
  db = adminDb()
) {
  const cleanProducerId = producerId.trim();
  if (!cleanProducerId) {
    throw new ProducerMediaSubmissionError('bad_request', 'Producer ID is required.');
  }
  if (!Array.isArray(requestedImages)) {
    throw new ProducerMediaSubmissionError('bad_request', 'Producer photos must be supplied as a list.');
  }

  const capabilities = await getTrustedAccountCapabilities(actorUid, db);
  if (!capabilities.producerIds.includes(cleanProducerId)) {
    throw new ProducerMediaSubmissionError('forbidden', 'You are not an approved owner of this producer listing.');
  }
  if (!capabilities.canManageOwnedListings) {
    throw new ProducerMediaSubmissionError('forbidden', 'Host editing is temporarily unavailable while this account is under review.');
  }

  const overrideRef = db.collection('producer_overrides').doc(cleanProducerId);
  const auditRef = db.collection('admin_audit').doc();

  return db.runTransaction(async (transaction: any) => {
    const overrideDoc = await transaction.get(overrideRef);
    const existingOverride = overrideDoc.exists ? overrideDoc.data() || {} : {};
    const existingImages = Array.isArray(existingOverride.uploadedImages)
      ? existingOverride.uploadedImages
      : [];
    const existingById = new Map(existingImages.map((image: any) => [String(image?.id || ''), image]));

    const isProTier = existingOverride.isProTier === true;
    const galleryLimit = isProTier ? 10 : 3;
    const seenIds = new Set<string>();
    let coverCount = 0;
    let galleryCount = 0;

    const nextImages = requestedImages.map((input: any) => {
      if (!input || typeof input !== 'object') {
        throw new ProducerMediaSubmissionError('bad_request', 'Producer photo metadata is invalid.');
      }

      const id = typeof input.id === 'string' ? input.id.trim() : '';
      if (!id || id.length > 160 || seenIds.has(id)) {
        throw new ProducerMediaSubmissionError('bad_request', 'Each producer photo must have a unique image ID.');
      }
      seenIds.add(id);

      if (input.producerId !== cleanProducerId || input.source !== 'host_upload') {
        throw new ProducerMediaSubmissionError('bad_request', 'Producer photo ownership metadata does not match this listing.');
      }
      if (input.type !== 'cover' && input.type !== 'gallery') {
        throw new ProducerMediaSubmissionError('bad_request', 'Producer photo type must be cover or gallery.');
      }
      if (input.rightsConfirmed !== true) {
        throw new ProducerMediaSubmissionError('bad_request', 'Image rights must be confirmed before submission.');
      }
      if (typeof input.url !== 'string' || !isFirebaseDownloadUrl(input.url)) {
        throw new ProducerMediaSubmissionError('bad_request', 'Producer photo URL must reference Firebase Storage.');
      }
      validateStoragePath(cleanProducerId, input.storagePath);

      if (input.type === 'cover') coverCount += 1;
      else galleryCount += 1;

      const existing = existingById.get(id) as any;
      if (existing) {
        // Preserve media identity and all review-controlled fields. A host may
        // edit/remove only the caption for an existing image. Build a fresh
        // object without undefined values because Firestore rejects them.
        const { caption: _oldCaption, ...immutableExisting } = existing;
        const caption = cleanOptionalText(input.caption, 300);
        return {
          ...immutableExisting,
          ...(caption ? { caption } : {}),
        };
      }

      const uploadedAt = typeof input.uploadedAt === 'string' && input.uploadedAt
        ? input.uploadedAt
        : new Date().toISOString();
      const caption = cleanOptionalText(input.caption, 300);

      return {
        id,
        producerId: cleanProducerId,
        url: input.url,
        ...(typeof input.thumbnailUrl === 'string' && isFirebaseDownloadUrl(input.thumbnailUrl)
          ? { thumbnailUrl: input.thumbnailUrl }
          : {}),
        storagePath: input.storagePath,
        type: input.type,
        status: 'pending_review',
        ...(caption ? { caption } : {}),
        uploadedAt,
        rightsConfirmed: true,
        source: 'host_upload',
      };
    });

    if (coverCount > 1 || galleryCount > galleryLimit) {
      throw new ProducerMediaSubmissionError(
        'bad_request',
        `Producer photo limit exceeded (1 cover and ${galleryLimit} gallery images).`
      );
    }

    const occurredAt = new Date().toISOString();
    transaction.set(overrideRef, {
      producerId: cleanProducerId,
      uploadedImages: nextImages,
      mediaSubmittedAt: occurredAt,
    }, { merge: true });
    transaction.set(auditRef, {
      eventType: 'producer_media_set_updated',
      actorUid,
      producerId: cleanProducerId,
      imageCount: nextImages.length,
      occurredAt,
      source: 'host_api',
    });

    return {
      producerId: cleanProducerId,
      images: nextImages,
      occurredAt,
    };
  });
}
