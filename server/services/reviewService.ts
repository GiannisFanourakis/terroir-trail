import { createHash } from 'node:crypto';
import type { Auth } from 'firebase-admin/auth';
import { adminAuth, adminDb } from '../firebaseAdmin';
import { getTrustedAccountCapabilities } from './accountAuthorization';

export type ReviewReportReason = 'spam' | 'abuse' | 'privacy' | 'other';

export interface PublicHostReply {
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicProducerReview {
  id: string;
  producerId: string;
  travelerName: string;
  rating: number;
  comment: string;
  verifiedVisit: boolean;
  createdAt: string;
  updatedAt: string;
  hostReply?: PublicHostReply;
  isOwnReview: boolean;
}

export class ProducerReviewError extends Error {
  constructor(
    public readonly code: 'bad_request' | 'forbidden' | 'not_found' | 'conflict',
    message: string
  ) {
    super(message);
    this.name = 'ProducerReviewError';
  }
}

const cleanProducerId = (value: unknown) => {
  const producerId = typeof value === 'string' ? value.trim() : '';
  if (!producerId || producerId.length > 200) {
    throw new ProducerReviewError('bad_request', 'A valid producer is required.');
  }
  return producerId;
};

const cleanComment = (value: unknown, maxLength: number, label: string) => {
  const comment = typeof value === 'string' ? value.trim() : '';
  if (comment.length < 3 || comment.length > maxLength) {
    throw new ProducerReviewError(
      'bad_request',
      `${label} must be between 3 and ${maxLength} characters.`
    );
  }
  return comment;
};

const cleanRating = (value: unknown) => {
  const rating = Number(value);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new ProducerReviewError('bad_request', 'Choose a rating from 1 to 5 stars.');
  }
  return rating;
};

const reviewIdFor = (producerId: string, uid: string) =>
  createHash('sha256').update(`${producerId}:${uid}`).digest('hex');

const reportIdFor = (reviewId: string, uid: string) =>
  createHash('sha256').update(`${reviewId}:${uid}`).digest('hex');

const toIso = (value: unknown) => {
  if (typeof value === 'string') return value;
  if (value && typeof (value as any).toDate === 'function') {
    return (value as any).toDate().toISOString();
  }
  return '';
};

const publicReview = (
  id: string,
  data: Record<string, any>,
  viewerUid?: string
): PublicProducerReview => {
  const hostReply = data.hostReply && typeof data.hostReply === 'object'
    ? {
        comment: String(data.hostReply.comment || ''),
        createdAt: toIso(data.hostReply.createdAt),
        updatedAt: toIso(data.hostReply.updatedAt),
      }
    : undefined;

  return {
    id,
    producerId: String(data.producerId || ''),
    travelerName: String(data.travelerName || 'Terroir traveler'),
    rating: Number(data.rating || 0),
    comment: String(data.comment || ''),
    verifiedVisit: data.verifiedVisit === true,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
    ...(hostReply?.comment ? { hostReply } : {}),
    isOwnReview: Boolean(viewerUid && data.travelerUid === viewerUid),
  };
};

async function resolveTravelerName(uid: string, db: any, authClient: Auth) {
  const [profileDoc, authUser] = await Promise.all([
    db.collection('users').doc(uid).get(),
    authClient.getUser(uid),
  ]);
  const profileName = profileDoc.exists ? profileDoc.data()?.name : undefined;
  const fallback = authUser.displayName || authUser.email?.split('@')[0] || 'Terroir traveler';
  return String(profileName || fallback).trim().slice(0, 80) || 'Terroir traveler';
}

async function hasVerifiedVisit(uid: string, producerId: string, db: any) {
  const bookings = await db.collection('bookings').where('userId', '==', uid).get();
  return bookings.docs.some((item: any) => {
    const data = item.data();
    return data?.producerId === producerId && data?.status === 'completed';
  });
}

export async function listProducerReviews(
  producerIdInput: unknown,
  viewerUid?: string,
  db = adminDb()
): Promise<PublicProducerReview[]> {
  const producerId = cleanProducerId(producerIdInput);
  const snapshot = await db.collection('producer_reviews').where('producerId', '==', producerId).get();

  return snapshot.docs
    .map((item: any) => ({ id: item.id, data: item.data() }))
    .filter(({ data }: any) => data?.status !== 'hidden')
    .map(({ id, data }: any) => publicReview(id, data, viewerUid))
    .sort((a: PublicProducerReview, b: PublicProducerReview) =>
      b.updatedAt.localeCompare(a.updatedAt)
    );
}

export async function upsertTravelerReview(
  uid: string,
  producerIdInput: unknown,
  ratingInput: unknown,
  commentInput: unknown,
  db = adminDb(),
  authClient: Auth = adminAuth()
): Promise<PublicProducerReview> {
  if (!uid) throw new ProducerReviewError('forbidden', 'Sign in to leave a review.');
  const producerId = cleanProducerId(producerIdInput);
  const rating = cleanRating(ratingInput);
  const comment = cleanComment(commentInput, 2000, 'Review');

  const capabilities = await getTrustedAccountCapabilities(uid, db);
  if (capabilities.producerIds.includes(producerId)) {
    throw new ProducerReviewError(
      'forbidden',
      'Hosts cannot rate a producer listing they manage. You can reply to traveler reviews instead.'
    );
  }

  const [travelerName, verifiedVisit] = await Promise.all([
    resolveTravelerName(uid, db, authClient),
    hasVerifiedVisit(uid, producerId, db),
  ]);

  const id = reviewIdFor(producerId, uid);
  const ref = db.collection('producer_reviews').doc(id);
  const existing = await ref.get();
  const existingData = existing.exists ? existing.data() : undefined;
  const now = new Date().toISOString();

  await ref.set({
    producerId,
    travelerUid: uid,
    travelerName,
    rating,
    comment,
    verifiedVisit,
    status: existingData?.status === 'hidden' ? 'hidden' : 'published',
    createdAt: existingData?.createdAt || now,
    updatedAt: now,
  }, { merge: true });

  const saved = await ref.get();
  return publicReview(id, saved.data() || {}, uid);
}

export async function deleteTravelerReview(
  uid: string,
  producerIdInput: unknown,
  db = adminDb()
) {
  if (!uid) throw new ProducerReviewError('forbidden', 'Sign in to delete your review.');
  const producerId = cleanProducerId(producerIdInput);
  const id = reviewIdFor(producerId, uid);
  const ref = db.collection('producer_reviews').doc(id);
  const existing = await ref.get();
  if (!existing.exists) {
    throw new ProducerReviewError('not_found', 'Review not found.');
  }
  if (existing.data()?.travelerUid !== uid) {
    throw new ProducerReviewError('forbidden', 'You can delete only your own review.');
  }
  await ref.delete();
  return { deleted: true, reviewId: id };
}

export async function upsertHostReviewReply(
  uid: string,
  reviewIdInput: unknown,
  commentInput: unknown,
  db = adminDb()
): Promise<PublicProducerReview> {
  if (!uid) throw new ProducerReviewError('forbidden', 'Sign in with a verified Host account.');
  const reviewId = typeof reviewIdInput === 'string' ? reviewIdInput.trim() : '';
  if (!reviewId) throw new ProducerReviewError('bad_request', 'Review ID is required.');
  const comment = cleanComment(commentInput, 1200, 'Host reply');

  const ref = db.collection('producer_reviews').doc(reviewId);
  const existing = await ref.get();
  if (!existing.exists) throw new ProducerReviewError('not_found', 'Review not found.');
  const review = existing.data() || {};
  if (review.status === 'hidden') {
    throw new ProducerReviewError('conflict', 'A hidden review cannot receive a public Host reply.');
  }

  const capabilities = await getTrustedAccountCapabilities(uid, db);
  const ownsListing = capabilities.producerIds.includes(String(review.producerId || ''));
  if (!ownsListing) {
    throw new ProducerReviewError(
      'forbidden',
      'Only a verified Host for this producer may publish the official reply.'
    );
  }

  const now = new Date().toISOString();
  await ref.set({
    hostReply: {
      hostUid: uid,
      comment,
      createdAt: review.hostReply?.createdAt || now,
      updatedAt: now,
    },
  }, { merge: true });

  const saved = await ref.get();
  return publicReview(reviewId, saved.data() || {}, uid);
}

export async function reportProducerReview(
  uid: string,
  reviewIdInput: unknown,
  reasonInput: unknown,
  db = adminDb()
) {
  if (!uid) throw new ProducerReviewError('forbidden', 'Sign in to report a review.');
  const reviewId = typeof reviewIdInput === 'string' ? reviewIdInput.trim() : '';
  if (!reviewId) throw new ProducerReviewError('bad_request', 'Review ID is required.');

  const allowedReasons: ReviewReportReason[] = ['spam', 'abuse', 'privacy', 'other'];
  const reason = typeof reasonInput === 'string' ? reasonInput.trim() as ReviewReportReason : 'other';
  if (!allowedReasons.includes(reason)) {
    throw new ProducerReviewError('bad_request', 'Choose a valid report reason.');
  }

  const review = await db.collection('producer_reviews').doc(reviewId).get();
  if (!review.exists) throw new ProducerReviewError('not_found', 'Review not found.');

  const id = reportIdFor(reviewId, uid);
  await db.collection('review_reports').doc(id).set({
    reviewId,
    producerId: review.data()?.producerId,
    reporterUid: uid,
    reason,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }, { merge: true });

  return { reported: true, reviewId };
}
