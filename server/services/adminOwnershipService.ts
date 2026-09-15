import { adminAuth, adminDb } from '../firebaseAdmin';
import { getTrustedAccountCapabilities } from './accountAuthorization';

export class AdminOwnershipError extends Error {
  constructor(
    public readonly code: 'forbidden' | 'not_found' | 'conflict' | 'bad_request',
    message: string
  ) {
    super(message);
    this.name = 'AdminOwnershipError';
  }
}

export interface ActiveProducerOwnership {
  producerId: string;
  producerName: string;
  ownerUid: string;
  ownerEmail?: string;
  ownerDisplayName?: string;
  approvedAt?: string;
  assignedAt?: string;
}

const cleanReason = (reason: string) => {
  const value = reason.trim();
  if (value.length < 3 || value.length > 500) {
    throw new AdminOwnershipError('bad_request', 'Provide a reason between 3 and 500 characters.');
  }
  return value;
};

async function requireOwnershipAdmin(uid: string, db: any) {
  const capabilities = await getTrustedAccountCapabilities(uid, db);
  if (!capabilities.canAssignProducerOwnership) {
    throw new AdminOwnershipError('forbidden', 'Admin authority is required to manage producer ownership.');
  }
  return capabilities;
}

export async function listActiveProducerOwnerships(
  actorUid: string,
  db = adminDb(),
  auth = adminAuth()
): Promise<ActiveProducerOwnership[]> {
  await requireOwnershipAdmin(actorUid, db);
  const snapshot = await db.collection('producer_owners').where('status', '==', 'active').get();

  const ownerships = await Promise.all(
    snapshot.docs.map(async (doc: any) => {
      const data = doc.data() || {};
      const producerId = String(data.producerId || doc.id);
      const ownerUid = String(data.ownerUid || '');
      const [registration, owner] = await Promise.all([
        db.collection('producer_registrations').doc(producerId).get(),
        ownerUid
          ? auth.getUser(ownerUid).catch(() => null)
          : Promise.resolve(null),
      ]);
      const registrationData = registration?.exists ? registration.data() || {} : {};

      return {
        producerId,
        producerName: String(
          registrationData.tradeBrandName || registrationData.producerName || producerId
        ),
        ownerUid,
        ownerEmail: owner?.email ? String(owner.email) : undefined,
        ownerDisplayName: owner?.displayName ? String(owner.displayName) : undefined,
        approvedAt: data.approvedAt ? String(data.approvedAt) : undefined,
        assignedAt: data.assignedAt ? String(data.assignedAt) : undefined,
      } satisfies ActiveProducerOwnership;
    })
  );

  return ownerships.sort((a, b) => a.producerName.localeCompare(b.producerName));
}

export async function revokeProducerOwnership(
  actorUid: string,
  producerId: string,
  reason: string,
  db = adminDb()
) {
  await requireOwnershipAdmin(actorUid, db);
  if (!producerId) throw new AdminOwnershipError('bad_request', 'Producer ID is required.');
  const rationale = cleanReason(reason);

  const ownerRef = db.collection('producer_owners').doc(producerId);
  const registrationRef = db.collection('producer_registrations').doc(producerId);
  const auditRef = db.collection('admin_audit').doc();

  return db.runTransaction(async (transaction: any) => {
    const [ownerDoc, registrationDoc] = await Promise.all([
      transaction.get(ownerRef),
      transaction.get(registrationRef),
    ]);

    if (!ownerDoc.exists || ownerDoc.data()?.status !== 'active') {
      throw new AdminOwnershipError('not_found', 'This producer has no active owner to revoke.');
    }

    const owner = ownerDoc.data() || {};
    const previousOwnerUid = String(owner.ownerUid || '');
    const occurredAt = new Date().toISOString();

    transaction.update(ownerRef, {
      status: 'revoked',
      revokedAt: occurredAt,
      revokedBy: actorUid,
      revocationReason: rationale,
    });

    if (registrationDoc.exists) {
      transaction.update(registrationRef, {
        status: 'verified_unassigned',
        assignedOwnerUid: null,
        ownershipUpdatedAt: occurredAt,
        updatedAt: occurredAt,
      });
    }

    transaction.set(auditRef, {
      eventType: 'producer_ownership_revoked',
      actorUid,
      targetUid: previousOwnerUid || null,
      producerId,
      reason: rationale,
      occurredAt,
      source: 'admin_api',
    });

    return {
      producerId,
      previousOwnerUid,
      status: 'revoked' as const,
      occurredAt,
    };
  });
}

export async function reassignProducerOwnership(
  actorUid: string,
  producerId: string,
  targetEmail: string,
  reason: string,
  db = adminDb(),
  auth = adminAuth()
) {
  await requireOwnershipAdmin(actorUid, db);
  if (!producerId) throw new AdminOwnershipError('bad_request', 'Producer ID is required.');
  const email = targetEmail.trim().toLowerCase();
  if (!email || !email.includes('@')) {
    throw new AdminOwnershipError('bad_request', 'Enter the email address of an existing TerroirTrail account.');
  }
  const rationale = cleanReason(reason);

  let targetUser: any;
  try {
    targetUser = await auth.getUserByEmail(email);
  } catch {
    throw new AdminOwnershipError('not_found', 'No TerroirTrail account was found for that email address.');
  }

  const targetUid = String(targetUser.uid || '');
  if (!targetUid) {
    throw new AdminOwnershipError('not_found', 'No TerroirTrail account was found for that email address.');
  }

  const ownerRef = db.collection('producer_owners').doc(producerId);
  const registrationRef = db.collection('producer_registrations').doc(producerId);
  const auditRef = db.collection('admin_audit').doc();
  const targetOwnerships = db
    .collection('producer_owners')
    .where('ownerUid', '==', targetUid)
    .where('status', '==', 'active');

  return db.runTransaction(async (transaction: any) => {
    const [ownerDoc, registrationDoc, existingTargetOwnerships] = await Promise.all([
      transaction.get(ownerRef),
      transaction.get(registrationRef),
      transaction.get(targetOwnerships),
    ]);

    if (!ownerDoc.exists || ownerDoc.data()?.status !== 'active') {
      throw new AdminOwnershipError('not_found', 'This producer has no active owner to reassign.');
    }

    const currentOwnerUid = String(ownerDoc.data()?.ownerUid || '');
    if (currentOwnerUid === targetUid) {
      throw new AdminOwnershipError('conflict', 'That account already owns this producer listing.');
    }

    const conflicting = existingTargetOwnerships.docs.find((doc: any) => doc.id !== producerId);
    if (conflicting) {
      throw new AdminOwnershipError('conflict', 'That account already owns another active producer listing.');
    }

    const occurredAt = new Date().toISOString();
    transaction.update(ownerRef, {
      ownerUid: targetUid,
      status: 'active',
      previousOwnerUid: currentOwnerUid || null,
      assignedAt: occurredAt,
      assignedBy: actorUid,
      reassignedAt: occurredAt,
      reassignedBy: actorUid,
      reassignmentReason: rationale,
      revokedAt: null,
      revokedBy: null,
      revocationReason: null,
    });

    if (registrationDoc.exists) {
      transaction.update(registrationRef, {
        status: 'verified_active',
        assignedOwnerUid: targetUid,
        ownershipUpdatedAt: occurredAt,
        updatedAt: occurredAt,
      });
    }

    transaction.set(auditRef, {
      eventType: 'producer_ownership_reassigned',
      actorUid,
      targetUid,
      previousOwnerUid: currentOwnerUid || null,
      producerId,
      reason: rationale,
      occurredAt,
      source: 'admin_api',
    });

    return {
      producerId,
      previousOwnerUid: currentOwnerUid,
      ownerUid: targetUid,
      ownerEmail: email,
      status: 'active' as const,
      occurredAt,
    };
  });
}
