import { adminAuth, adminDb } from '../firebaseAdmin';
import { getTrustedAccountCapabilities } from './accountAuthorization';

export class AdminAccountError extends Error {
  constructor(
    public readonly code: 'bad_request' | 'forbidden' | 'not_found' | 'conflict',
    message: string
  ) {
    super(message);
    this.name = 'AdminAccountError';
  }
}

export interface AdminAccountSummary {
  uid: string;
  email?: string;
  displayName?: string;
  disabled: boolean;
  emailVerified: boolean;
  roles: Array<'traveler' | 'producer_host' | 'admin'>;
  adminLevel: 'owner' | 'admin' | null;
  isPlatformOwner: boolean;
  producerIds: string[];
  canDisable: boolean;
}

const cleanReason = (reason: unknown) => {
  const value = typeof reason === 'string' ? reason.trim() : '';
  if (value.length < 3) {
    throw new AdminAccountError('bad_request', 'Add a short reason for this account action.');
  }
  return value.slice(0, 1000);
};

const assertActorMayManageTarget = async (
  actorUid: string,
  targetUid: string,
  db: any
) => {
  const actor = await getTrustedAccountCapabilities(actorUid, db);
  if (!actor.canManageUserAccounts) {
    throw new AdminAccountError('forbidden', 'Admin authority is required to manage accounts.');
  }
  if (targetUid === actorUid) {
    throw new AdminAccountError('conflict', 'You cannot change your own account access from this panel.');
  }

  const target = await getTrustedAccountCapabilities(targetUid, db);
  if (target.isPlatformOwner) {
    throw new AdminAccountError('conflict', 'The Platform Owner account cannot be restricted here.');
  }
  if (target.isAdmin && !actor.isPlatformOwner) {
    throw new AdminAccountError('forbidden', 'Only the Platform Owner can act against another Admin.');
  }

  return { actor, target };
};

const toSummary = async (actorUid: string, user: any, db: any): Promise<AdminAccountSummary> => {
  const [actor, target] = await Promise.all([
    getTrustedAccountCapabilities(actorUid, db),
    getTrustedAccountCapabilities(user.uid, db),
  ]);
  const protectedTarget =
    user.uid === actorUid ||
    target.isPlatformOwner ||
    (target.isAdmin && !actor.isPlatformOwner);

  return {
    uid: user.uid,
    ...(user.email ? { email: user.email } : {}),
    ...(user.displayName ? { displayName: user.displayName } : {}),
    disabled: user.disabled === true,
    emailVerified: user.emailVerified === true,
    roles: target.roles,
    adminLevel: target.adminLevel,
    isPlatformOwner: target.isPlatformOwner,
    producerIds: target.producerIds,
    canDisable: !protectedTarget,
  };
};

/**
 * Search operational Firebase Auth/account authority only. This deliberately
 * does not read traveler favorites, Passport notes, journals or other private
 * profile content.
 */
export async function searchAdminAccounts(
  actorUid: string,
  query: string,
  db = adminDb(),
  auth = adminAuth()
): Promise<AdminAccountSummary[]> {
  const actor = await getTrustedAccountCapabilities(actorUid, db);
  if (!actor.canManageUserAccounts) {
    throw new AdminAccountError('forbidden', 'Admin authority is required to search accounts.');
  }

  const needle = String(query || '').trim().toLowerCase();
  if (needle.length < 2) {
    throw new AdminAccountError('bad_request', 'Enter at least 2 characters to search accounts.');
  }

  const matches: any[] = [];
  let pageToken: string | undefined;
  let pages = 0;
  do {
    const page = await auth.listUsers(1000, pageToken);
    for (const user of page.users) {
      const searchable = [user.uid, user.email || '', user.displayName || '']
        .join('\n')
        .toLowerCase();
      if (searchable.includes(needle)) matches.push(user);
      if (matches.length >= 25) break;
    }
    pageToken = page.pageToken;
    pages += 1;
  } while (pageToken && matches.length < 25 && pages < 5);

  return Promise.all(matches.slice(0, 25).map((user) => toSummary(actorUid, user, db)));
}

export async function setAccountDisabled(
  actorUid: string,
  targetUid: string,
  disabled: boolean,
  reason: string,
  db = adminDb(),
  auth = adminAuth()
) {
  const cleanTargetUid = String(targetUid || '').trim();
  if (!cleanTargetUid) throw new AdminAccountError('bad_request', 'Target account is required.');
  const cleanActionReason = cleanReason(reason);
  await assertActorMayManageTarget(actorUid, cleanTargetUid, db);

  let user;
  try {
    user = await auth.getUser(cleanTargetUid);
  } catch {
    throw new AdminAccountError('not_found', 'That TerroirTrail account could not be found.');
  }
  if (user.disabled === disabled) {
    throw new AdminAccountError('conflict', disabled ? 'That account is already disabled.' : 'That account is already enabled.');
  }

  await auth.updateUser(cleanTargetUid, { disabled });
  if (disabled) await auth.revokeRefreshTokens(cleanTargetUid);

  const occurredAt = new Date().toISOString();
  await db.collection('admin_audit').doc().set({
    eventType: disabled ? 'account_disabled' : 'account_reenabled',
    actorUid,
    targetUid: cleanTargetUid,
    reason: cleanActionReason,
    occurredAt,
    source: 'admin_api',
  });

  return { targetUid: cleanTargetUid, disabled, occurredAt };
}
