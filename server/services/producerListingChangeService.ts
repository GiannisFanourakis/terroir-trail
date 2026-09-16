import { adminDb } from '../firebaseAdmin';
import { getTrustedAccountCapabilities } from './accountAuthorization';

export type ProducerListingChangeStatus = 'pending_review' | 'approved' | 'rejected';
export type ProducerListingReviewDecision = 'approve' | 'reject';

export interface ProducerListingChanges {
  tagLine?: string;
  description?: string;
  story?: string;
  tastingHighlights?: string[];
  website?: string;
  foodOption?: 'full_taverna' | 'tasting_board' | 'dakos_snacks' | 'brewery_taproom' | 'byo_picnic' | null;
  dogFriendly?: boolean;
  kidFriendly?: boolean;
  walkIn?: boolean;
  campervanFriendly?: boolean;
}

export interface ProducerListingChangeRequest {
  id: string;
  producerId: string;
  producerName: string;
  requesterUid: string;
  requesterEmail?: string;
  status: ProducerListingChangeStatus;
  changes: ProducerListingChanges;
  submittedAt: string;
  reviewedAt?: string;
  reviewedByUid?: string;
  rejectionReason?: string;
}

export class ProducerListingChangeError extends Error {
  constructor(
    public readonly code: 'forbidden' | 'not_found' | 'conflict' | 'bad_request',
    message: string
  ) {
    super(message);
    this.name = 'ProducerListingChangeError';
  }
}

const STRING_LIMITS = {
  tagLine: 180,
  description: 1600,
  story: 6000,
  website: 500,
} as const;

const BOOLEAN_FIELDS = ['dogFriendly', 'kidFriendly', 'walkIn', 'campervanFriendly'] as const;
const ALLOWED_FIELDS = new Set([
  ...Object.keys(STRING_LIMITS),
  'tastingHighlights',
  'foodOption',
  ...BOOLEAN_FIELDS,
]);
const FOOD_OPTIONS = new Set([
  'full_taverna',
  'tasting_board',
  'dakos_snacks',
  'brewery_taproom',
  'byo_picnic',
]);

const cleanString = (value: unknown, maxLength: number, label: string): string => {
  if (typeof value !== 'string') {
    throw new ProducerListingChangeError('bad_request', `${label} must be text.`);
  }
  const cleaned = value.trim();
  if (cleaned.length > maxLength) {
    throw new ProducerListingChangeError('bad_request', `${label} is too long.`);
  }
  return cleaned;
};

const validateWebsite = (value: string) => {
  if (!value) return;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') throw new Error('protocol');
  } catch {
    throw new ProducerListingChangeError('bad_request', 'Website must be a valid http or https URL, or left blank.');
  }
};

export function sanitizeProducerListingChanges(input: unknown): ProducerListingChanges {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new ProducerListingChangeError('bad_request', 'Listing changes must be supplied as an object.');
  }

  const raw = input as Record<string, unknown>;
  const unsupported = Object.keys(raw).filter(key => !ALLOWED_FIELDS.has(key));
  if (unsupported.length > 0) {
    throw new ProducerListingChangeError(
      'bad_request',
      `These listing fields cannot be changed by a Host: ${unsupported.join(', ')}.`
    );
  }

  const changes: ProducerListingChanges = {};
  for (const [field, maxLength] of Object.entries(STRING_LIMITS)) {
    if (!(field in raw)) continue;
    const value = cleanString(raw[field], maxLength, field === 'tagLine' ? 'Tagline' : field[0].toUpperCase() + field.slice(1));
    if (field === 'website') validateWebsite(value);
    (changes as Record<string, unknown>)[field] = value;
  }

  if ('tastingHighlights' in raw) {
    if (!Array.isArray(raw.tastingHighlights)) {
      throw new ProducerListingChangeError('bad_request', 'Products / highlights must be supplied as a list.');
    }
    if (raw.tastingHighlights.length > 20) {
      throw new ProducerListingChangeError('bad_request', 'Use at most 20 products / highlights.');
    }
    changes.tastingHighlights = raw.tastingHighlights.map((item, index) => {
      const value = cleanString(item, 140, `Product / highlight ${index + 1}`);
      if (!value) {
        throw new ProducerListingChangeError('bad_request', 'Products / highlights cannot contain blank rows.');
      }
      return value;
    });
  }

  if ('foodOption' in raw) {
    if (raw.foodOption !== null && (typeof raw.foodOption !== 'string' || !FOOD_OPTIONS.has(raw.foodOption))) {
      throw new ProducerListingChangeError('bad_request', 'Food option is not recognized.');
    }
    changes.foodOption = raw.foodOption as ProducerListingChanges['foodOption'];
  }

  for (const field of BOOLEAN_FIELDS) {
    if (!(field in raw)) continue;
    if (typeof raw[field] !== 'boolean') {
      throw new ProducerListingChangeError('bad_request', `${field} must be true or false.`);
    }
    changes[field] = raw[field] as boolean;
  }

  if (Object.keys(changes).length === 0) {
    throw new ProducerListingChangeError('bad_request', 'Choose at least one public listing field to submit for review.');
  }
  return changes;
}

const requestFromDoc = (doc: any, producerName?: string): ProducerListingChangeRequest => {
  const data = doc.data() || {};
  return {
    id: doc.id,
    producerId: String(data.producerId || ''),
    producerName: producerName || String(data.producerName || data.producerId || ''),
    requesterUid: String(data.requesterUid || ''),
    ...(data.requesterEmail ? { requesterEmail: String(data.requesterEmail) } : {}),
    status: data.status as ProducerListingChangeStatus,
    changes: data.changes || {},
    submittedAt: String(data.submittedAt || ''),
    ...(data.reviewedAt ? { reviewedAt: String(data.reviewedAt) } : {}),
    ...(data.reviewedByUid ? { reviewedByUid: String(data.reviewedByUid) } : {}),
    ...(data.rejectionReason ? { rejectionReason: String(data.rejectionReason) } : {}),
  };
};

async function producerNameFor(producerId: string, db: any): Promise<string> {
  const registration = await db.collection('producer_registrations').doc(producerId).get();
  const data = registration.exists ? registration.data() || {} : {};
  return String(data.tradeBrandName || data.producerName || producerId);
}

export async function submitProducerListingChanges(
  actorUid: string,
  actorEmail: string | undefined,
  producerId: string,
  requestedChanges: unknown,
  db = adminDb()
): Promise<ProducerListingChangeRequest> {
  const cleanProducerId = producerId.trim();
  if (!cleanProducerId) {
    throw new ProducerListingChangeError('bad_request', 'Producer ID is required.');
  }

  const capabilities = await getTrustedAccountCapabilities(actorUid, db);
  if (!capabilities.producerIds.includes(cleanProducerId)) {
    throw new ProducerListingChangeError('forbidden', 'You are not an approved owner of this producer listing.');
  }
  if (!capabilities.canManageOwnedListings) {
    throw new ProducerListingChangeError('forbidden', 'Host editing is temporarily unavailable while this account is under review.');
  }

  const changes = sanitizeProducerListingChanges(requestedChanges);
  const existing = await db.collection('producer_listing_change_requests')
    .where('producerId', '==', cleanProducerId)
    .get();
  if (existing.docs.some((doc: any) => doc.data()?.status === 'pending_review')) {
    throw new ProducerListingChangeError('conflict', 'This listing already has a change request awaiting Admin review.');
  }

  const producerName = await producerNameFor(cleanProducerId, db);
  const submittedAt = new Date().toISOString();
  const requestRef = db.collection('producer_listing_change_requests').doc();
  const auditRef = db.collection('admin_audit').doc();
  const data = {
    producerId: cleanProducerId,
    producerName,
    requesterUid: actorUid,
    ...(actorEmail ? { requesterEmail: actorEmail } : {}),
    status: 'pending_review' as const,
    changes,
    submittedAt,
  };

  await db.runTransaction(async (transaction: any) => {
    transaction.set(requestRef, data);
    transaction.set(auditRef, {
      eventType: 'producer_listing_change_submitted',
      actorUid,
      producerId: cleanProducerId,
      requestId: requestRef.id,
      changedFields: Object.keys(changes),
      occurredAt: submittedAt,
      source: 'host_api',
    });
  });

  return { id: requestRef.id, ...data };
}

export async function getLatestProducerListingChange(
  actorUid: string,
  producerId: string,
  db = adminDb()
): Promise<ProducerListingChangeRequest | null> {
  const cleanProducerId = producerId.trim();
  const capabilities = await getTrustedAccountCapabilities(actorUid, db);
  if (!capabilities.producerIds.includes(cleanProducerId)) {
    throw new ProducerListingChangeError('forbidden', 'You are not an approved owner of this producer listing.');
  }

  const snapshot = await db.collection('producer_listing_change_requests')
    .where('producerId', '==', cleanProducerId)
    .get();
  const docs = [...snapshot.docs].sort((a: any, b: any) =>
    String(b.data()?.submittedAt || '').localeCompare(String(a.data()?.submittedAt || ''))
  );
  return docs[0] ? requestFromDoc(docs[0]) : null;
}

async function requireContentModerator(actorUid: string, db: any) {
  const capabilities = await getTrustedAccountCapabilities(actorUid, db);
  if (!capabilities.canModerateProducerContent) {
    throw new ProducerListingChangeError('forbidden', 'Admin authority is required to review producer listing changes.');
  }
}

export async function listPendingProducerListingChanges(
  actorUid: string,
  db = adminDb()
): Promise<ProducerListingChangeRequest[]> {
  await requireContentModerator(actorUid, db);
  const snapshot = await db.collection('producer_listing_change_requests')
    .where('status', '==', 'pending_review')
    .get();

  const requests = await Promise.all(snapshot.docs.map(async (doc: any) => {
    const data = doc.data() || {};
    const producerId = String(data.producerId || '');
    return requestFromDoc(doc, data.producerName || await producerNameFor(producerId, db));
  }));
  return requests.sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
}

export async function reviewProducerListingChange(
  actorUid: string,
  requestId: string,
  decision: ProducerListingReviewDecision,
  reason: string = '',
  db = adminDb()
) {
  await requireContentModerator(actorUid, db);
  const cleanRequestId = requestId.trim();
  if (!cleanRequestId) {
    throw new ProducerListingChangeError('bad_request', 'Change request ID is required.');
  }
  if (decision !== 'approve' && decision !== 'reject') {
    throw new ProducerListingChangeError('bad_request', 'Choose approve or reject for this listing change request.');
  }
  const cleanReason = reason.trim();
  if (decision === 'reject' && (cleanReason.length < 3 || cleanReason.length > 500)) {
    throw new ProducerListingChangeError('bad_request', 'Provide a rejection reason between 3 and 500 characters.');
  }

  const requestRef = db.collection('producer_listing_change_requests').doc(cleanRequestId);
  const auditRef = db.collection('admin_audit').doc();

  return db.runTransaction(async (transaction: any) => {
    const requestDoc = await transaction.get(requestRef);
    if (!requestDoc.exists) {
      throw new ProducerListingChangeError('not_found', 'Producer listing change request was not found.');
    }
    const request = requestDoc.data() || {};
    if (request.status !== 'pending_review') {
      throw new ProducerListingChangeError('conflict', 'This producer listing change request is no longer pending review.');
    }

    const producerId = String(request.producerId || '').trim();
    if (!producerId) {
      throw new ProducerListingChangeError('conflict', 'Producer listing change request has invalid listing metadata.');
    }
    const changes = sanitizeProducerListingChanges(request.changes);
    const occurredAt = new Date().toISOString();

    if (decision === 'approve') {
      const overrideRef = db.collection('producer_overrides').doc(producerId);
      transaction.set(overrideRef, {
        producerId,
        ...changes,
        listingContentReviewedAt: occurredAt,
        updatedAt: occurredAt,
      }, { merge: true });
    }

    transaction.update(requestRef, {
      status: decision === 'approve' ? 'approved' : 'rejected',
      reviewedAt: occurredAt,
      reviewedByUid: actorUid,
      rejectionReason: decision === 'reject' ? cleanReason : null,
    });
    transaction.set(auditRef, {
      eventType: decision === 'approve' ? 'producer_listing_change_approved' : 'producer_listing_change_rejected',
      actorUid,
      producerId,
      requestId: cleanRequestId,
      changedFields: Object.keys(changes),
      reason: decision === 'reject' ? cleanReason : null,
      occurredAt,
      source: 'admin_api',
    });

    return {
      requestId: cleanRequestId,
      producerId,
      status: decision === 'approve' ? 'approved' as const : 'rejected' as const,
      occurredAt,
    };
  });
}
