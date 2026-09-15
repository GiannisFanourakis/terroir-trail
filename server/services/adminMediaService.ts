import { adminDb } from '../firebaseAdmin';
import { getTrustedAccountCapabilities } from './accountAuthorization';

export type ProducerMediaReviewDecision = 'approve' | 'reject';

export interface PendingProducerMediaItem {
  producerId: string;
  producerName: string;
  imageId: string;
  url: string;
  thumbnailUrl?: string;
  storagePath?: string;
  type: 'cover' | 'gallery';
  caption?: string;
  uploadedAt: string;
  rightsConfirmed: boolean;
}

export class AdminMediaError extends Error {
  constructor(
    public readonly code: 'forbidden' | 'not_found' | 'conflict' | 'bad_request',
    message: string
  ) {
    super(message);
    this.name = 'AdminMediaError';
  }
}

async function requireMediaModerator(uid: string, db: any) {
  const capabilities = await getTrustedAccountCapabilities(uid, db);
  if (!capabilities.canModerateProducerContent) {
    throw new AdminMediaError('forbidden', 'Admin authority is required to review producer photos.');
  }
  return capabilities;
}

const isPendingHostImage = (image: any) =>
  image &&
  image.source === 'host_upload' &&
  image.status === 'pending_review' &&
  (image.type === 'cover' || image.type === 'gallery') &&
  typeof image.id === 'string' &&
  typeof image.url === 'string';

export async function listPendingProducerMedia(
  actorUid: string,
  db = adminDb()
): Promise<PendingProducerMediaItem[]> {
  await requireMediaModerator(actorUid, db);

  const overrides = await db.collection('producer_overrides').get();
  const pendingByProducer = new Map<string, any[]>();

  for (const doc of overrides.docs) {
    const data = doc.data() || {};
    const producerId = String(data.producerId || doc.id);
    const pending = Array.isArray(data.uploadedImages)
      ? data.uploadedImages.filter(isPendingHostImage)
      : [];
    if (pending.length > 0) pendingByProducer.set(producerId, pending);
  }

  const producerIds = [...pendingByProducer.keys()];
  const registrations = await Promise.all(
    producerIds.map(async (producerId) => {
      const registration = await db.collection('producer_registrations').doc(producerId).get();
      const data = registration.exists ? registration.data() || {} : {};
      return [
        producerId,
        String(data.tradeBrandName || data.producerName || producerId),
      ] as const;
    })
  );
  const producerNames = new Map(registrations);

  return producerIds
    .flatMap((producerId) =>
      (pendingByProducer.get(producerId) || []).map((image: any) => ({
        producerId,
        producerName: producerNames.get(producerId) || producerId,
        imageId: String(image.id),
        url: String(image.url),
        thumbnailUrl: image.thumbnailUrl ? String(image.thumbnailUrl) : undefined,
        storagePath: image.storagePath ? String(image.storagePath) : undefined,
        type: image.type as 'cover' | 'gallery',
        caption: image.caption ? String(image.caption) : undefined,
        uploadedAt: String(image.uploadedAt || ''),
        rightsConfirmed: image.rightsConfirmed === true,
      }))
    )
    .sort((a, b) => String(b.uploadedAt).localeCompare(String(a.uploadedAt)));
}

export async function moderateProducerMedia(
  actorUid: string,
  producerId: string,
  imageId: string,
  decision: ProducerMediaReviewDecision,
  reason: string = '',
  db = adminDb()
) {
  await requireMediaModerator(actorUid, db);

  const cleanProducerId = producerId.trim();
  const cleanImageId = imageId.trim();
  if (!cleanProducerId || !cleanImageId) {
    throw new AdminMediaError('bad_request', 'Producer ID and image ID are required.');
  }
  if (decision !== 'approve' && decision !== 'reject') {
    throw new AdminMediaError('bad_request', 'Choose approve or reject for this producer photo.');
  }

  const cleanReason = reason.trim();
  if (decision === 'reject' && (cleanReason.length < 3 || cleanReason.length > 500)) {
    throw new AdminMediaError('bad_request', 'Provide a rejection reason between 3 and 500 characters.');
  }

  const overrideRef = db.collection('producer_overrides').doc(cleanProducerId);
  const auditRef = db.collection('admin_audit').doc();

  return db.runTransaction(async (transaction: any) => {
    const overrideDoc = await transaction.get(overrideRef);
    if (!overrideDoc.exists) {
      throw new AdminMediaError('not_found', 'Producer photo submission was not found.');
    }

    const override = overrideDoc.data() || {};
    const images = Array.isArray(override.uploadedImages) ? override.uploadedImages : [];
    const imageIndex = images.findIndex((image: any) => image?.id === cleanImageId);
    if (imageIndex < 0) {
      throw new AdminMediaError('not_found', 'Producer photo submission was not found.');
    }

    const image = images[imageIndex];
    if (image.status !== 'pending_review') {
      throw new AdminMediaError('conflict', 'This producer photo is no longer pending review.');
    }
    if (image.source !== 'host_upload') {
      throw new AdminMediaError('conflict', 'Only producer-uploaded photos can be moderated here.');
    }
    if (image.producerId && String(image.producerId) !== cleanProducerId) {
      throw new AdminMediaError('conflict', 'Producer photo metadata does not match this listing.');
    }
    if (image.rightsConfirmed !== true) {
      throw new AdminMediaError('conflict', 'This producer photo has no confirmed image-rights declaration.');
    }

    const occurredAt = new Date().toISOString();
    const {
      moderationNotes: _previousModerationNotes,
      reviewedAt: _previousReviewedAt,
      reviewedBy: _previousReviewedBy,
      ...imageWithoutReview
    } = image;
    const reviewedImage = {
      ...imageWithoutReview,
      status: decision === 'approve' ? 'approved' : 'rejected',
      reviewedAt: occurredAt,
      reviewedBy: actorUid,
      ...(decision === 'reject' ? { moderationNotes: cleanReason } : {}),
    };
    const updatedImages = [...images];
    updatedImages[imageIndex] = reviewedImage;

    transaction.update(overrideRef, {
      uploadedImages: updatedImages,
      mediaReviewedAt: occurredAt,
    });
    transaction.set(auditRef, {
      eventType: decision === 'approve' ? 'producer_media_approved' : 'producer_media_rejected',
      actorUid,
      producerId: cleanProducerId,
      imageId: cleanImageId,
      imageType: image.type || null,
      reason: decision === 'reject' ? cleanReason : null,
      occurredAt,
      source: 'admin_api',
    });

    return {
      producerId: cleanProducerId,
      imageId: cleanImageId,
      status: reviewedImage.status as 'approved' | 'rejected',
      occurredAt,
    };
  });
}
