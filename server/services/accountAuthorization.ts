import { adminDb } from '../firebaseAdmin';

export type TrustedAccountRole = 'traveler' | 'producer_host' | 'admin';

export interface TrustedAccountCapabilities {
  uid: string;
  roles: TrustedAccountRole[];
  primaryRole: TrustedAccountRole;
  isAdmin: boolean;
  producerIds: string[];
  canManageOwnedListings: boolean;
  canReviewProducerClaims: boolean;
  canAssignProducerOwnership: boolean;
  canModerateProducerContent: boolean;
}

/**
 * Resolve account authority exclusively from server-trusted records.
 *
 * - Traveler access is the baseline for every authenticated account.
 * - Host authority comes only from active producer_owners records.
 * - Admin authority comes only from an active admin_users/{uid} record.
 *
 * Client profile fields such as role/isProducer/claimedProducerId are never
 * consulted here and therefore cannot grant privileged capabilities.
 */
export async function getTrustedAccountCapabilities(
  uid: string,
  db = adminDb()
): Promise<TrustedAccountCapabilities> {
  if (!uid) {
    throw new Error('Authenticated uid is required to resolve account capabilities.');
  }

  const [adminDoc, ownerships] = await Promise.all([
    db.collection('admin_users').doc(uid).get(),
    db.collection('producer_owners').where('ownerUid', '==', uid).get(),
  ]);

  const adminData = adminDoc.exists ? adminDoc.data() : undefined;
  const isAdmin = Boolean(
    adminDoc.exists &&
      adminData?.userId === uid &&
      adminData?.status === 'active'
  );

  const producerIds = ownerships.docs
    .map((doc) => ({ id: doc.id, data: doc.data() }))
    .filter(({ data }) => data.ownerUid === uid && data.status === 'active')
    .map(({ id, data }) => String(data.producerId || id))
    .filter((producerId, index, all) => Boolean(producerId) && all.indexOf(producerId) === index);

  const roles: TrustedAccountRole[] = ['traveler'];
  if (producerIds.length > 0) roles.push('producer_host');
  if (isAdmin) roles.push('admin');

  return {
    uid,
    roles,
    primaryRole: isAdmin ? 'admin' : producerIds.length > 0 ? 'producer_host' : 'traveler',
    isAdmin,
    producerIds,
    canManageOwnedListings: producerIds.length > 0,
    canReviewProducerClaims: isAdmin,
    canAssignProducerOwnership: isAdmin,
    canModerateProducerContent: isAdmin,
  };
}

export async function isActiveAdmin(uid: string, db = adminDb()): Promise<boolean> {
  const capabilities = await getTrustedAccountCapabilities(uid, db);
  return capabilities.isAdmin;
}
