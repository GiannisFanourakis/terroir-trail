import 'dotenv/config';
import { adminDb } from '../server/firebaseAdmin';

export type AdminAuthorityAction = 'grant' | 'revoke';

interface AdminAuthorityResult {
  action: AdminAuthorityAction;
  userId: string;
  actorUid: string;
  occurredAt: string;
}

/**
 * Operator-only Admin SDK routine for granting or revoking TerroirTrail admin authority.
 * Possession of Admin SDK credentials is required to run this command.
 *
 * Authority lives in admin_users/{uid}; ordinary clients cannot write that collection.
 * Every change is accompanied by an immutable-style admin_audit event so sensitive
 * authority changes have an operator trail from day one.
 */
export async function setAdminAuthority(
  action: AdminAuthorityAction,
  userId: string,
  actorUid: string
): Promise<AdminAuthorityResult> {
  if (action !== 'grant' && action !== 'revoke') {
    throw new Error("Action must be 'grant' or 'revoke'.");
  }
  if (!userId || !actorUid) {
    throw new Error('Both target userId and actorUid are required.');
  }

  const db = adminDb();
  const occurredAt = new Date().toISOString();
  const authorityRef = db.collection('admin_users').doc(userId);
  const auditRef = db.collection('admin_audit').doc();
  const batch = db.batch();

  if (action === 'grant') {
    batch.set(authorityRef, {
      userId,
      status: 'active',
      grantedAt: occurredAt,
      grantedBy: actorUid,
      updatedAt: occurredAt,
    });
  } else {
    const current = await authorityRef.get();
    if (!current.exists || current.data()?.status !== 'active') {
      throw new Error(`User '${userId}' does not currently have active admin authority.`);
    }
    batch.set(
      authorityRef,
      {
        userId,
        status: 'revoked',
        revokedAt: occurredAt,
        revokedBy: actorUid,
        updatedAt: occurredAt,
      },
      { merge: true }
    );
  }

  batch.set(auditRef, {
    eventType: action === 'grant' ? 'admin_authority_granted' : 'admin_authority_revoked',
    actorUid,
    targetUid: userId,
    occurredAt,
    source: 'operator_cli',
  });

  await batch.commit();

  return { action, userId, actorUid, occurredAt };
}

if (
  process.argv[1] &&
  (process.argv[1].endsWith('setAdminAuthority.ts') ||
    process.argv[1].endsWith('setAdminAuthority.js'))
) {
  const action = process.argv[2] as AdminAuthorityAction | undefined;
  const userId = process.argv[3];
  const actorUid = process.argv[4];

  if ((action !== 'grant' && action !== 'revoke') || !userId || !actorUid) {
    console.error(
      'Usage: tsx scripts/setAdminAuthority.ts <grant|revoke> <target-user-uid> <operator-uid>'
    );
    process.exit(1);
  }

  setAdminAuthority(action, userId, actorUid)
    .then((result) => {
      console.log(
        `[TerroirTrail Operator] Admin authority ${result.action} completed for '${result.userId}' by '${result.actorUid}' at ${result.occurredAt}`
      );
      process.exit(0);
    })
    .catch((error) => {
      console.error(`[TerroirTrail Operator Error] Admin authority change failed: ${error.message}`);
      process.exit(1);
    });
}
