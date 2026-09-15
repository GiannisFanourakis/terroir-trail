import 'dotenv/config';
import { adminAuth, adminDb } from '../server/firebaseAdmin';

/**
 * One-time Platform Owner bootstrap.
 *
 * Run only with trusted Admin SDK credentials. After bootstrap, the Platform
 * Owner can grant/revoke ordinary Admin access through the authenticated admin
 * API/UI; clients can never self-assign this authority.
 */
export async function bootstrapPlatformOwner(identifier: string) {
  if (!identifier) {
    throw new Error('A Firebase user UID or email is required.');
  }

  const db = adminDb();
  const auth = adminAuth();
  const normalized = identifier.trim();
  const targetUser = normalized.includes('@')
    ? await auth.getUserByEmail(normalized.toLowerCase())
    : await auth.getUser(normalized);

  const existingOwners = await db.collection('admin_users').where('level', '==', 'owner').get();
  const activeOwner = existingOwners.docs.find((doc) => doc.data()?.status === 'active');
  if (activeOwner && activeOwner.id !== targetUser.uid) {
    throw new Error(`A Platform Owner already exists (${activeOwner.id}).`);
  }

  const occurredAt = new Date().toISOString();
  const authorityRef = db.collection('admin_users').doc(targetUser.uid);
  const auditRef = db.collection('admin_audit').doc();
  const batch = db.batch();

  batch.set(
    authorityRef,
    {
      userId: targetUser.uid,
      level: 'owner',
      status: 'active',
      grantedAt: occurredAt,
      grantedBy: 'bootstrap_operator',
      updatedAt: occurredAt,
    },
    { merge: true }
  );

  batch.set(auditRef, {
    eventType: 'platform_owner_bootstrapped',
    actorUid: 'bootstrap_operator',
    targetUid: targetUser.uid,
    occurredAt,
    source: 'operator_cli',
  });

  await batch.commit();
  return { userId: targetUser.uid, occurredAt };
}

if (
  process.argv[1] &&
  (process.argv[1].endsWith('setAdminAuthority.ts') ||
    process.argv[1].endsWith('setAdminAuthority.js'))
) {
  const command = process.argv[2];
  const identifier = process.argv[3];

  if (command !== 'bootstrap-owner' || !identifier) {
    console.error(
      'Usage: tsx scripts/setAdminAuthority.ts bootstrap-owner <firebase-user-uid-or-email>'
    );
    process.exit(1);
  }

  bootstrapPlatformOwner(identifier)
    .then((result) => {
      console.log(
        `[TerroirTrail Operator] Platform Owner '${result.userId}' bootstrapped at ${result.occurredAt}`
      );
      process.exit(0);
    })
    .catch((error) => {
      console.error(`[TerroirTrail Operator Error] Platform Owner bootstrap failed: ${error.message}`);
      process.exit(1);
    });
}
