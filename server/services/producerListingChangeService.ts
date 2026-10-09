import { adminDb } from '../firebaseAdmin';
import { getSupabaseAdmin } from './analyticsIngestionService';
import type { ProducerListingChanges } from '../../src/types/producerListingChange';
import type { Category, ProducerProductSection } from '../../src/types/terroir';
import { isProducerCategory, PRODUCER_CATEGORIES } from '../../src/utils/producerCategory';
import { getTrustedAccountCapabilities } from './accountAuthorization';

export type ProducerListingChangeStatus = 'pending_review' | 'approved' | 'rejected';
export type ProducerListingReviewDecision = 'approve' | 'reject';

export type { ProducerListingChanges } from '../../src/types/producerListingChange';

export interface ProducerListingChangeRequest {
  id: string;
  producerId: string;
  producerName: string;
  requesterUid: string;
  requesterEmail?: string;
  status: ProducerListingChangeStatus;
  changes: ProducerListingChanges;
  submittedAt: string;
  classificationPrimaryCategory?: Category;
  reviewedAt?: string;
  reviewedByUid?: string;
  rejectionReason?: string;
}

export class ProducerListingChangeError extends Error {
  constructor(
    public readonly code: 'forbidden' | 'not_found' | 'conflict' | 'bad_request' | 'service_unavailable',
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
  'additionalCategories',
  'productSections',
  'classificationSourceUrl',
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

  if ('additionalCategories' in raw || 'productSections' in raw || 'classificationSourceUrl' in raw) {
    if (!Array.isArray(raw.additionalCategories) || !Array.isArray(raw.productSections)) {
      throw new ProducerListingChangeError('bad_request', 'Submit additional categories and grouped products together.');
    }
    if (raw.additionalCategories.length >= PRODUCER_CATEGORIES.length ||
        raw.additionalCategories.some(value => !isProducerCategory(value))) {
      throw new ProducerListingChangeError('bad_request', 'Choose only recognized maker categories.');
    }
    changes.additionalCategories = [...new Set(raw.additionalCategories)] as Category[];
    if (raw.productSections.length > PRODUCER_CATEGORIES.length) {
      throw new ProducerListingChangeError('bad_request', 'Use at most one product group per maker category.');
    }
    const seen = new Set<Category>();
    changes.productSections = raw.productSections.map((section: unknown): ProducerProductSection => {
      if (!section || typeof section !== 'object' || Array.isArray(section)) {
        throw new ProducerListingChangeError('bad_request', 'Each product group must contain a maker category and product lists.');
      }
      const group = section as Record<string, unknown>;
      if (!isProducerCategory(group.category) || seen.has(group.category) ||
          Object.keys(group).some(key => !['category', 'specialties', 'varieties', 'highlights'].includes(key))) {
        throw new ProducerListingChangeError('bad_request', 'Product groups must use unique, recognized maker categories.');
      }
      seen.add(group.category);
      const list = (field: string, required = false): string[] => {
        const values = group[field];
        if (values === undefined && !required) return [];
        if (!Array.isArray(values) || values.length > 20) {
          throw new ProducerListingChangeError('bad_request', 'Use at most 20 text items in each product list.');
        }
        return [...new Set(values.map((item, index) => {
          const value = cleanString(item, 140, `Product ${index + 1}`);
          if (!value) throw new ProducerListingChangeError('bad_request', 'Product groups cannot contain blank rows.');
          return value;
        }))];
      };
      const specialties = list('specialties', true);
      const varieties = list('varieties');
      const highlights = list('highlights');
      if (!specialties.length && !varieties.length && !highlights.length) {
        throw new ProducerListingChangeError('bad_request', 'Leave empty product groups out of the request.');
      }
      return { category: group.category, specialties,
        ...(varieties.length ? { varieties } : {}), ...(highlights.length ? { highlights } : {}) };
    });
    const source = cleanString(raw.classificationSourceUrl, 500, 'Official source');
    if (!source) throw new ProducerListingChangeError('bad_request', 'Add an official source for category and grouped-product changes.');
    validateWebsite(source);
    changes.classificationSourceUrl = source;
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

export function validateListingClassification(changes: ProducerListingChanges, primary: Category): void {
  if (!changes.additionalCategories) return;
  if (changes.additionalCategories.includes(primary)) {
    throw new ProducerListingChangeError('bad_request', 'The primary category is fixed and cannot be repeated as an additional category.');
  }
  const categories = new Set([primary, ...changes.additionalCategories]);
  if (changes.productSections?.some(section => !categories.has(section.category))) {
    throw new ProducerListingChangeError('bad_request', 'Every product group must belong to one of the proposed maker categories.');
  }
}

async function loadClassificationCategory(producerId: string): Promise<Category> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new ProducerListingChangeError('service_unavailable', 'Live catalogue verification is temporarily unavailable.');
  const { data, error } = await supabase.from('producers').select('category')
    .eq('id', producerId).eq('is_active', true).maybeSingle();
  if (error) throw new ProducerListingChangeError('service_unavailable', 'Live catalogue verification is temporarily unavailable.');
  if (!data || !isProducerCategory(data.category)) {
    throw new ProducerListingChangeError('not_found', 'This producer is not available in the active catalogue.');
  }
  return data.category;
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
    ...(isProducerCategory(data.classificationPrimaryCategory)
      ? { classificationPrimaryCategory: data.classificationPrimaryCategory } : {}),
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
  db = adminDb(),
  categoryLoader = loadClassificationCategory
): Promise<ProducerListingChangeRequest> {
  const cleanProducerId = producerId.trim();
  if (!cleanProducerId) {
    throw new ProducerListingChangeError('bad_request', 'Producer ID is required.');
  }

  const capabilities = await getTrustedAccountCapabilities(actorUid, db);
  if (!capabilities.producerIds.includes(cleanProducerId)) {
    throw new ProducerListingChangeError('forbidden', 'You are not an approved owner of this producer listing.');
  }

  const changes = sanitizeProducerListingChanges(requestedChanges);
  const classificationPrimaryCategory = changes.additionalCategories !== undefined
    ? await categoryLoader(cleanProducerId) : undefined;
  if (classificationPrimaryCategory) validateListingClassification(changes, classificationPrimaryCategory);
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
    ...(classificationPrimaryCategory ? { classificationPrimaryCategory } : {}),
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
  db = adminDb(),
  categoryLoader = loadClassificationCategory
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
  const previewDoc = await requestRef.get();
  const preview = previewDoc.exists ? previewDoc.data() || {} : {};
  const primary = decision === 'approve' && preview.changes?.additionalCategories !== undefined
    ? await categoryLoader(String(preview.producerId || '')) : undefined;

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
    if (decision === 'approve' && changes.additionalCategories !== undefined) {
      if (!primary || primary !== request.classificationPrimaryCategory) {
        throw new ProducerListingChangeError('conflict', 'The canonical category changed after submission. Submit a fresh category and product review.');
      }
      validateListingClassification(changes, primary);
    }
    const occurredAt = new Date().toISOString();

    if (decision === 'approve') {
      const overrideRef = db.collection('producer_overrides').doc(producerId);
      transaction.set(overrideRef, {
        producerId,
        ...changes,
        ...(primary ? { classificationPrimaryCategory: primary } : {}),
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
