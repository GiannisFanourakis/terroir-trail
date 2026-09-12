import 'dotenv/config';
import { adminDb } from '../server/firebaseAdmin';

export interface ApprovalResult {
  producerId: string;
  ownerUid: string;
  status: 'active';
  approvedAt: string;
}

/**
 * Operator-only Admin SDK approval routine.
 * Transactionally:
 * 1. Validates a pending registration in producer_registrations/{producerId}.
 * 2. Rejects ownership conflicts (if the producer is already owned or applicant owns another producer).
 * 3. Creates the ownership record in producer_owners/{producerId}.
 * 4. Marks the registration approved (status: 'verified_active', isVatVerified: true, approvedAt).
 */
export async function approveProducerRegistration(producerId: string): Promise<ApprovalResult> {
  if (!producerId || typeof producerId !== 'string') {
    throw new Error('Valid producerId is required for approval.');
  }

  const db = adminDb();
  const registrationRef = db.collection('producer_registrations').doc(producerId);
  const ownerRef = db.collection('producer_owners').doc(producerId);

  return await db.runTransaction(async (transaction) => {
    const regDoc = await transaction.get(registrationRef);
    if (!regDoc.exists) {
      throw new Error(`Registration for producer '${producerId}' not found.`);
    }

    const regData = regDoc.data();
    if (!regData || !regData.userId) {
      throw new Error(`Registration for producer '${producerId}' has no valid applicant userId.`);
    }

    if (regData.status !== 'pending_verification') {
      throw new Error(`Registration status is '${regData.status}', expected 'pending_verification'.`);
    }

    // 1. Conflict check: Does this producer already have an active owner?
    const ownerDoc = await transaction.get(ownerRef);
    if (ownerDoc.exists) {
      const ownerData = ownerDoc.data();
      if (ownerData?.status === 'active') {
        throw new Error(`Ownership conflict: Producer '${producerId}' already has an active owner (${ownerData.ownerUid}).`);
      }
    }

    // 2. Conflict check: Does this applicant already own an active producer?
    const existingUserOwnerships = await transaction.get(
      db.collection('producer_owners')
        .where('ownerUid', '==', regData.userId)
        .where('status', '==', 'active')
    );
    if (!existingUserOwnerships.empty) {
      const conflictingProducer = existingUserOwnerships.docs[0].id;
      if (conflictingProducer !== producerId) {
        throw new Error(`Ownership conflict: User '${regData.userId}' already owns producer '${conflictingProducer}'.`);
      }
    }

    const approvedAt = new Date().toISOString();

    // 3. Create ownership record
    transaction.set(ownerRef, {
      producerId,
      ownerUid: regData.userId,
      status: 'active',
      approvedAt,
    });

    // 4. Mark registration approved
    transaction.update(registrationRef, {
      status: 'verified_active',
      isVatVerified: true,
      approvedAt,
      updatedAt: approvedAt,
    });

    return {
      producerId,
      ownerUid: regData.userId,
      status: 'active',
      approvedAt,
    };
  });
}

// CLI entrypoint
if (
  process.argv[1] &&
  (process.argv[1].endsWith('approveProducerRegistration.ts') ||
    process.argv[1].endsWith('approveProducerRegistration.js'))
) {
  const targetId = process.argv[2];
  if (!targetId) {
    console.error('Usage: tsx scripts/approveProducerRegistration.ts <producerId>');
    process.exit(1);
  }

  approveProducerRegistration(targetId)
    .then((result) => {
      console.log(`[TerroirTrail Operator] Approved producer '${result.producerId}' for owner '${result.ownerUid}' at ${result.approvedAt}`);
      process.exit(0);
    })
    .catch((err) => {
      console.error(`[TerroirTrail Operator Error] Approval failed: ${err.message}`);
      process.exit(1);
    });
}
