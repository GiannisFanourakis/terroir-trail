import { adminDb } from '../firebaseAdmin';
import { getTrustedAccountCapabilities } from './accountAuthorization';

export class AdminReviewModerationError extends Error {
  constructor(
    public readonly code: 'bad_request' | 'forbidden' | 'not_found' | 'conflict',
    message: string
  ) {
    super(message);
    this.name = 'AdminReviewModerationError';
  }
}

export interface PendingReviewReport {
  reportId: string;
  reviewId: string;
  producerId: string;
  reason: string;
  reportedAt: string;
  review: {
    travelerName: string;
    rating: number;
    comment: string;
    verifiedVisit: boolean;
    status: 'published' | 'hidden';
    hostReply?: {
      comment: string;
      createdAt?: string;
      updatedAt?: string;
    };
  };
}

const requireModerator = async (uid: string, db: any) => {
  const capabilities = await getTrustedAccountCapabilities(uid, db);
  if (!capabilities.canModerateProducerContent) {
    throw new AdminReviewModerationError(
      'forbidden',
      'Admin authority is required to moderate community reviews.'
    );
  }
  return capabilities;
};

const cleanReason = (value: unknown) => {
  const reason = typeof value === 'string' ? value.trim() : '';
  if (reason.length < 3 || reason.length > 1000) {
    throw new AdminReviewModerationError(
      'bad_request',
      'Add a moderation reason between 3 and 1000 characters.'
    );
  }
  return reason;
};

const cleanId = (value: unknown, label: string) => {
  const id = typeof value === 'string' ? value.trim() : '';
  if (!id || id.length > 200) {
    throw new AdminReviewModerationError('bad_request', `${label} is required.`);
  }
  return id;
};

export async function listPendingReviewReports(
  actorUid: string,
  db = adminDb()
): Promise<PendingReviewReport[]> {
  await requireModerator(actorUid, db);
  const reports = await db.collection('review_reports').where('status', '==', 'pending').get();
  const items: PendingReviewReport[] = [];

  for (const reportDoc of reports.docs) {
    const report = reportDoc.data() || {};
    const reviewId = String(report.reviewId || '');
    if (!reviewId) continue;

    const reviewDoc = await db.collection('producer_reviews').doc(reviewId).get();
    if (!reviewDoc.exists) continue;
    const review = reviewDoc.data() || {};

    const rawHostReply = review.hostReply && typeof review.hostReply === 'object'
      ? review.hostReply
      : null;
    const hostReply: PendingReviewReport['review']['hostReply'] = rawHostReply?.comment
      ? {
          comment: String(rawHostReply.comment),
          ...(typeof rawHostReply.createdAt === 'string'
            ? { createdAt: rawHostReply.createdAt }
            : {}),
          ...(typeof rawHostReply.updatedAt === 'string'
            ? { updatedAt: rawHostReply.updatedAt }
            : {}),
        }
      : undefined;

    items.push({
      reportId: String(reportDoc.id),
      reviewId,
      producerId: String(review.producerId || report.producerId || ''),
      reason: String(report.reason || 'other'),
      reportedAt: String(report.createdAt || ''),
      review: {
        travelerName: String(review.travelerName || 'Terroir traveler'),
        rating: Number(review.rating || 0),
        comment: String(review.comment || ''),
        verifiedVisit: review.verifiedVisit === true,
        status: review.status === 'hidden' ? 'hidden' : 'published',
        ...(hostReply ? { hostReply } : {}),
      },
    });
  }

  return items.sort((a, b) => b.reportedAt.localeCompare(a.reportedAt));
}

async function resolveReportsForReview(
  reviewId: string,
  actorUid: string,
  resolution: 'review_hidden' | 'review_restored',
  db: any
) {
  const snapshot = await db.collection('review_reports').where('reviewId', '==', reviewId).get();
  let batch = db.batch();
  let pending = 0;
  const occurredAt = new Date().toISOString();
  for (const report of snapshot.docs) {
    if (report.data()?.status !== 'pending') continue;
    batch.update(report.ref, {
      status: 'resolved',
      resolution,
      resolvedBy: actorUid,
      resolvedAt: occurredAt,
    });
    pending += 1;
    if (pending >= 400) {
      await batch.commit();
      batch = db.batch();
      pending = 0;
    }
  }
  if (pending > 0) await batch.commit();
}

export async function moderateProducerReview(
  actorUid: string,
  reviewIdInput: unknown,
  actionInput: unknown,
  reasonInput: unknown,
  db = adminDb()
) {
  await requireModerator(actorUid, db);
  const reviewId = cleanId(reviewIdInput, 'Review ID');
  const action = actionInput === 'hide' || actionInput === 'restore' ? actionInput : null;
  if (!action) {
    throw new AdminReviewModerationError('bad_request', 'Choose hide or restore.');
  }
  const reason = cleanReason(reasonInput);

  const ref = db.collection('producer_reviews').doc(reviewId);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new AdminReviewModerationError('not_found', 'Review not found.');
  const review = snapshot.data() || {};
  const nextStatus = action === 'hide' ? 'hidden' : 'published';
  const occurredAt = new Date().toISOString();

  await ref.set({
    status: nextStatus,
    moderation: {
      action,
      reason,
      actorUid,
      occurredAt,
    },
  }, { merge: true });

  await resolveReportsForReview(
    reviewId,
    actorUid,
    action === 'hide' ? 'review_hidden' : 'review_restored',
    db
  );

  await db.collection('admin_audit').add({
    eventType: action === 'hide' ? 'community_review_hidden' : 'community_review_restored',
    actorUid,
    reviewId,
    producerId: review.producerId || null,
    reason,
    occurredAt,
  });

  return {
    reviewId,
    producerId: String(review.producerId || ''),
    status: nextStatus,
    occurredAt,
  };
}

export async function dismissReviewReport(
  actorUid: string,
  reportIdInput: unknown,
  reasonInput: unknown,
  db = adminDb()
) {
  await requireModerator(actorUid, db);
  const reportId = cleanId(reportIdInput, 'Report ID');
  const reason = cleanReason(reasonInput);
  const ref = db.collection('review_reports').doc(reportId);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new AdminReviewModerationError('not_found', 'Review report not found.');
  const report = snapshot.data() || {};
  if (report.status !== 'pending') {
    throw new AdminReviewModerationError('conflict', 'This review report has already been resolved.');
  }
  const occurredAt = new Date().toISOString();

  await ref.set({
    status: 'resolved',
    resolution: 'dismissed',
    resolutionReason: reason,
    resolvedBy: actorUid,
    resolvedAt: occurredAt,
  }, { merge: true });

  await db.collection('admin_audit').add({
    eventType: 'community_review_report_dismissed',
    actorUid,
    reportId,
    reviewId: report.reviewId || null,
    producerId: report.producerId || null,
    reason,
    occurredAt,
  });

  return { reportId, status: 'resolved' as const, occurredAt };
}
