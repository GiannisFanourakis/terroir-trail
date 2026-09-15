import { adminAuth, adminDb } from '../firebaseAdmin';
import { getTrustedAccountCapabilities } from './accountAuthorization';

export type AdminAuthorityAction = 'grant' | 'revoke';

export class AdminAuthorityError extends Error {
  constructor(
    public readonly code: 'bad_request' | 'forbidden' | 'not_found' | 'conflict',
    message: string
  ) {
    super(message);
    this.name = 'AdminAuthorityError';
  }
}

export interface AdminAuthorityTarget {
  userId?: string;
  email?: string;
}

export interface AdminAuthorityChangeResult {
  action: AdminAuthorityAction;
  actorUid: string;
  targetUid: string;
  level: 'admin';
  status: 'active' | 'revoked';
  occurredAt: string;
}

/**
 * Platform-owner-only authority management.
 *
 * This routine re-checks the actor against trusted server-side authority on
 * every call. A client-provided role, profile field or UI state is never enough.
 * Ordinary admins cannot create or revoke other admins.
 */
export async function changeAdminAuthority(
  actorUid: string,
  action: AdminAuthorityAction,
  target: AdminAuthorityTarget,
  db = adminDb(),
  auth = adminAuth()
): Promise<AdminAuthorityChangeResult> {
  if (!actorUid) {
    throw new AdminAuthorityError('forbidden', 'Authenticated platform owner is required.');
  }
  if (action !== 'grant' && action !== 'revoke') {
    throw new AdminAuthorityError('bad_request', "Action must be 'grant' or 'revoke'.");
  }
  if ((!target.userId && !target.email) || (target.userId && target.email)) {
    throw new AdminAuthorityError('bad_request', 'Provide exactly one target userId or email.');
  }

  const actorCapabilities = await getTrustedAccountCapabilities(actorUid, db);
  if (!actorCapabilities.canManageAdmins) {
    throw new AdminAuthorityError('forbidden', 'Platform Owner authority is required to manage admins.');
  }

  let targetUser;
  try {
    targetUser = target.userId
      ? await auth.getUser(target.userId)
      : await auth.getUserByEmail(String(target.email).trim().toLowerCase());
  } catch {
    throw new AdminAuthorityError('not_found', 'That TerroirTrail account could not be found.');
  }

  const targetUid = targetUser.uid;
  const authorityRef = db.collection('admin_users').doc(targetUid);
  const current = await authorityRef.get();
  const currentData = current.exists ? current.data() : undefined;

  if (currentData?.level === 'owner' && currentData?.status === 'active') {
    throw new AdminAuthorityError('conflict', 'Platform Owner authority cannot be changed from the admin panel.');
  }
  if (targetUid === actorUid) {
    throw new AdminAuthorityError('conflict', 'The Platform Owner cannot change their own authority here.');
  }

  if (action === 'grant' && currentData?.level === 'admin' && currentData?.status === 'active') {
    throw new AdminAuthorityError('conflict', 'That account is already an active Admin.');
  }
  if (action === 'revoke' && !(currentData?.level === 'admin' && currentData?.status === 'active')) {
    throw new AdminAuthorityError('conflict', 'That account is not currently an active Admin.');
  }

  const occurredAt = new Date().toISOString();
  const auditRef = db.collection('admin_audit').doc();
  const batch = db.batch();

  if (action === 'grant') {
    batch.set(authorityRef, {
      userId: targetUid,
      level: 'admin',
      status: 'active',
      grantedAt: occurredAt,
      grantedBy: actorUid,
      updatedAt: occurredAt,
    });
  } else {
    batch.set(
      authorityRef,
      {
        userId: targetUid,
        level: 'admin',
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
    targetUid,
    occurredAt,
    source: 'admin_api',
  });

  await batch.commit();

  return {
    action,
    actorUid,
    targetUid,
    level: 'admin',
    status: action === 'grant' ? 'active' : 'revoked',
    occurredAt,
  };
}
