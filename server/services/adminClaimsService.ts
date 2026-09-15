import { adminDb } from '../firebaseAdmin';
import { getTrustedAccountCapabilities } from './accountAuthorization';
import type {
  ProducerBusinessVerificationStatus,
  ProducerContactVerificationStatus,
} from './producerVerificationService';

export class AdminClaimError extends Error {
  constructor(
    public readonly code: 'forbidden' | 'not_found' | 'conflict' | 'bad_request',
    message: string
  ) {
    super(message);
    this.name = 'AdminClaimError';
  }
}

export interface PendingProducerClaim {
  producerId: string;
  tradeBrandName: string;
  producerCategory?: string;
  officialEmail: string;
  representativeName?: string;
  representativeRole?: string;
  countryCode?: string;
  submittedAt?: string;
  notesFromProducer?: string;
  legalBusinessName?: string;
  vatNumber?: string;
  registeredAddress?: string;
  businessVerificationStatus?: ProducerBusinessVerificationStatus;
  businessVerificationProvider?: 'vies' | 'manual';
  businessVerificationCheckedAt?: string;
  businessVerificationVatValid?: boolean | null;
  businessVerificationRegistryName?: string;
  businessVerificationRegistryAddress?: string;
  businessVerificationNameMatch?: 'match' | 'mismatch' | 'unavailable';
  businessVerificationReason?: string;
  contactVerificationStatus?: ProducerContactVerificationStatus;
  contactVerifiedAt?: string;
  verificationReadyForAdminReview?: boolean;
}

async function requireClaimAdmin(uid: string, db: any) {
  const capabilities = await getTrustedAccountCapabilities(uid, db);
  if (!capabilities.canReviewProducerClaims) {
    throw new AdminClaimError('forbidden', 'Admin authority is required to review producer requests.');
  }
  return capabilities;
}

export async function listPendingProducerClaims(
  actorUid: string,
  db = adminDb()
): Promise<PendingProducerClaim[]> {
  await requireClaimAdmin(actorUid, db);
  const snapshot = await db
    .collection('producer_registrations')
    .where('status', '==', 'pending_verification')
    .get();

  return snapshot.docs
    .map((doc: any) => {
      const data = doc.data() || {};
      return {
        producerId: String(data.producerId || doc.id),
        tradeBrandName: String(data.tradeBrandName || data.producerName || 'Unnamed producer'),
        producerCategory: data.producerCategory ? String(data.producerCategory) : undefined,
        officialEmail: String(data.officialEmail || ''),
        representativeName: data.representativeName ? String(data.representativeName) : undefined,
        representativeRole: data.representativeRole ? String(data.representativeRole) : undefined,
        countryCode: data.countryCode ? String(data.countryCode) : undefined,
        submittedAt: data.submittedAt ? String(data.submittedAt) : undefined,
        notesFromProducer: data.notesFromProducer ? String(data.notesFromProducer) : undefined,
        legalBusinessName: data.legalBusinessName ? String(data.legalBusinessName) : undefined,
        vatNumber: data.vatNumber ? String(data.vatNumber) : undefined,
        registeredAddress: data.registeredAddress ? String(data.registeredAddress) : undefined,
        businessVerificationStatus: data.businessVerificationStatus || undefined,
        businessVerificationProvider: data.businessVerificationProvider || undefined,
        businessVerificationCheckedAt: data.businessVerificationCheckedAt || undefined,
        businessVerificationVatValid:
          typeof data.businessVerificationVatValid === 'boolean'
            ? data.businessVerificationVatValid
            : data.businessVerificationVatValid === null
              ? null
              : undefined,
        businessVerificationRegistryName: data.businessVerificationRegistryName || undefined,
        businessVerificationRegistryAddress: data.businessVerificationRegistryAddress || undefined,
        businessVerificationNameMatch: data.businessVerificationNameMatch || undefined,
        businessVerificationReason: data.businessVerificationReason || undefined,
        contactVerificationStatus: data.contactVerificationStatus || undefined,
        contactVerifiedAt: data.contactVerifiedAt || undefined,
        verificationReadyForAdminReview: data.verificationReadyForAdminReview === true,
      } satisfies PendingProducerClaim;
    })
    .sort((a: PendingProducerClaim, b: PendingProducerClaim) =>
      String(b.submittedAt || '').localeCompare(String(a.submittedAt || ''))
    );
}

export async function approveProducerClaim(
  actorUid: string,
  producerId: string,
  db = adminDb()
) {
  const capabilities = await requireClaimAdmin(actorUid, db);
  if (!capabilities.canAssignProducerOwnership) {
    throw new AdminClaimError('forbidden', 'Admin authority is required to assign producer ownership.');
  }
  if (!producerId) throw new AdminClaimError('bad_request', 'Producer ID is required.');

  const registrationRef = db.collection('producer_registrations').doc(producerId);
  const ownerRef = db.collection('producer_owners').doc(producerId);
  const auditRef = db.collection('admin_audit').doc();

  return db.runTransaction(async (transaction: any) => {
    const registrationDoc = await transaction.get(registrationRef);
    if (!registrationDoc.exists) {
      throw new AdminClaimError('not_found', 'Producer request was not found.');
    }

    const registration = registrationDoc.data();
    if (registration?.status !== 'pending_verification') {
      throw new AdminClaimError('conflict', 'This producer request is no longer pending.');
    }
    if (!registration?.userId) {
      throw new AdminClaimError('conflict', 'This producer request has no valid applicant account.');
    }

    const existingOwner = await transaction.get(ownerRef);
    if (existingOwner.exists && existingOwner.data()?.status === 'active') {
      throw new AdminClaimError('conflict', 'This producer already has an active owner.');
    }

    const existingApplicantOwnerships = await transaction.get(
      db.collection('producer_owners')
        .where('ownerUid', '==', registration.userId)
        .where('status', '==', 'active')
    );
    const conflicting = existingApplicantOwnerships.docs.find((doc: any) => doc.id !== producerId);
    if (conflicting) {
      throw new AdminClaimError('conflict', 'This applicant already owns another active producer listing.');
    }

    const occurredAt = new Date().toISOString();
    transaction.set(ownerRef, {
      producerId,
      ownerUid: registration.userId,
      status: 'active',
      approvedAt: occurredAt,
      approvedBy: actorUid,
    });
    transaction.update(registrationRef, {
      status: 'verified_active',
      approvedAt: occurredAt,
      approvedBy: actorUid,
      updatedAt: occurredAt,
    });
    transaction.set(auditRef, {
      eventType: 'producer_claim_approved',
      actorUid,
      targetUid: registration.userId,
      producerId,
      occurredAt,
      source: 'admin_api',
      verificationReadyForAdminReview: registration.verificationReadyForAdminReview === true,
      businessVerificationStatus: registration.businessVerificationStatus || null,
      contactVerificationStatus: registration.contactVerificationStatus || null,
    });

    return { producerId, ownerUid: registration.userId, status: 'verified_active' as const, occurredAt };
  });
}

export async function rejectProducerClaim(
  actorUid: string,
  producerId: string,
  reason: string,
  db = adminDb()
) {
  await requireClaimAdmin(actorUid, db);
  if (!producerId) throw new AdminClaimError('bad_request', 'Producer ID is required.');
  const cleanReason = reason.trim();
  if (cleanReason.length < 3 || cleanReason.length > 500) {
    throw new AdminClaimError('bad_request', 'Provide a rejection reason between 3 and 500 characters.');
  }

  const registrationRef = db.collection('producer_registrations').doc(producerId);
  const auditRef = db.collection('admin_audit').doc();

  return db.runTransaction(async (transaction: any) => {
    const registrationDoc = await transaction.get(registrationRef);
    if (!registrationDoc.exists) {
      throw new AdminClaimError('not_found', 'Producer request was not found.');
    }
    const registration = registrationDoc.data();
    if (registration?.status !== 'pending_verification') {
      throw new AdminClaimError('conflict', 'This producer request is no longer pending.');
    }

    const occurredAt = new Date().toISOString();
    transaction.update(registrationRef, {
      status: 'rejected',
      rejectedAt: occurredAt,
      rejectedBy: actorUid,
      rejectionReason: cleanReason,
      updatedAt: occurredAt,
    });
    transaction.set(auditRef, {
      eventType: 'producer_claim_rejected',
      actorUid,
      targetUid: registration?.userId || null,
      producerId,
      reason: cleanReason,
      occurredAt,
      source: 'admin_api',
    });

    return { producerId, status: 'rejected' as const, occurredAt };
  });
}
