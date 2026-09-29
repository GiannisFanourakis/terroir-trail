import { adminDb } from '../firebaseAdmin';
import { runProducerVerification, type ProducerVerificationResult } from './producerVerificationService';
import { notifyAdmins } from './adminNotificationService';

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
    await notifyAdmins({
      eventType: 'producer_claim_submitted',
      idempotencyKey: `claim:${producerId}:${String(data.submittedAt || data.updatedAt || '')}`,
      subject: `New producer claim: ${String(data.tradeBrandName || data.producerName || producerId)}`,
      summary: 'A producer has submitted a request to manage an existing TerroirTrail listing.',
      details: [
        ['Producer', String(data.tradeBrandName || data.producerName || producerId)],
        ['Producer ID', producerId],
        ['Representative', data.representativeName],
        ['Official email', data.officialEmail],
        ['Submitted at', data.submittedAt],
      ],
      actorUid: uid,
      producerId,
      actionUrl: process.env.APP_URL || 'https://terroir-trail.web.app',
    }, db);
    results.push(await runProducerVerification(uid, producerId, db));
  }
  return results;
}
