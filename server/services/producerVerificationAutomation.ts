import { adminDb } from '../firebaseAdmin';
import { runProducerVerification, type ProducerVerificationResult } from './producerVerificationService';

/**
 * A producer claim is written before the existing welcome-email request runs.
 * Use that authenticated account request as the server-side trigger for any
 * pending claim owned by the new account. Ordinary traveler signups simply
 * return an empty result.
 */
export async function runPendingProducerVerificationsForUser(
  uid: string,
  db = adminDb()
): Promise<ProducerVerificationResult[]> {
  if (!uid) return [];

  const snapshot = await db
    .collection('producer_registrations')
    .where('userId', '==', uid)
    .where('status', '==', 'pending_verification')
    .get();

  const results: ProducerVerificationResult[] = [];
  for (const doc of snapshot.docs) {
    const data = doc.data() || {};
    if (
      data.businessVerificationCheckedAt &&
      (data.contactVerificationStatus === 'pending' || data.contactVerificationStatus === 'verified')
    ) {
      continue;
    }

    const producerId = String(data.producerId || doc.id);
    results.push(await runProducerVerification(uid, producerId, db));
  }
  return results;
}
