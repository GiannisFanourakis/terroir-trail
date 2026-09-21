import { FieldValue } from 'firebase-admin/firestore';
import type { Auth } from 'firebase-admin/auth';
import { adminAuth, adminDb } from '../firebaseAdmin';
import { getTrustedAccountCapabilities } from './accountAuthorization';
import {
  deleteIntentEventsForFirebaseUid,
  exportIntentEventsForFirebaseUid,
} from './analyticsIngestionService';

export class AccountSelfServiceError extends Error {
  constructor(
    public readonly code: 'forbidden' | 'not_found' | 'bad_request',
    message: string
  ) {
    super(message);
    this.name = 'AccountSelfServiceError';
  }
}

const mapDocs = (snapshot: any) => snapshot.docs.map((item: any) => ({
  id: item.id,
  ...item.data(),
}));

async function exportTrips(uid: string, db: any) {
  const trips = await db.collection('users').doc(uid).collection('trips').get();
  return Promise.all(
    trips.docs.map(async (trip: any) => {
      const items = await trip.ref.collection('items').get();
      return {
        id: trip.id,
        ...trip.data(),
        items: mapDocs(items).sort((a: any, b: any) => Number(a.position || 0) - Number(b.position || 0)),
      };
    })
  );
}

async function deleteTrips(uid: string, db: any) {
  const trips = await db.collection('users').doc(uid).collection('trips').get();
  let deletedTrips = 0;
  let deletedTripItems = 0;

  for (const trip of trips.docs) {
    const items = await trip.ref.collection('items').get();
    const batch = db.batch();
    for (const item of items.docs) {
      batch.delete(item.ref);
      deletedTripItems += 1;
    }
    batch.delete(trip.ref);
    await batch.commit();
    deletedTrips += 1;
  }

  return { deletedTrips, deletedTripItems };
}

export async function exportAccountData(
  uid: string,
  db = adminDb(),
  authClient: Auth = adminAuth(),
  exportIntentEvents: (uid: string) => Promise<unknown[]> = exportIntentEventsForFirebaseUid
) {
  if (!uid) throw new AccountSelfServiceError('bad_request', 'Authenticated user ID is required.');

  const [
    authUser,
    userDoc,
    bookings,
    ownerships,
    registrations,
    passes,
    authoredReviews,
    reviewReports,
    hostReplyReviews,
    trips,
    intentAnalytics,
  ] = await Promise.all([
    authClient.getUser(uid),
    db.collection('users').doc(uid).get(),
    db.collection('bookings').where('userId', '==', uid).get(),
    db.collection('producer_owners').where('ownerUid', '==', uid).get(),
    db.collection('producer_registrations').where('userId', '==', uid).get(),
    db.collection('explorerPasses').where('userId', '==', uid).get(),
    db.collection('producer_reviews').where('travelerUid', '==', uid).get(),
    db.collection('review_reports').where('reporterUid', '==', uid).get(),
    db.collection('producer_reviews').where('hostReply.hostUid', '==', uid).get(),
    exportTrips(uid, db),
    exportIntentEvents(uid),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    account: {
      uid,
      email: authUser.email || null,
      displayName: authUser.displayName || null,
      createdAt: authUser.metadata.creationTime || null,
      lastSignInAt: authUser.metadata.lastSignInTime || null,
      disabled: authUser.disabled,
      providers: authUser.providerData.map(provider => provider.providerId),
    },
    profile: userDoc.exists ? userDoc.data() : null,
    producerOwnerships: mapDocs(ownerships),
    producerRegistrations: mapDocs(registrations),
    bookings: mapDocs(bookings),
    explorerPasses: mapDocs(passes),
    communityReviews: mapDocs(authoredReviews),
    reviewReports: mapDocs(reviewReports),
    hostReviewReplies: hostReplyReviews.docs.map((item: any) => ({
      reviewId: item.id,
      producerId: item.data()?.producerId,
      hostReply: item.data()?.hostReply,
    })),
    trips,
    intentAnalytics,
  };
}

async function deleteSnapshotDocs(snapshot: any, db: any) {
  let batch = db.batch();
  let pending = 0;
  let deleted = 0;
  for (const item of snapshot.docs) {
    batch.delete(item.ref);
    pending += 1;
    deleted += 1;
    if (pending >= 400) {
      await batch.commit();
      batch = db.batch();
      pending = 0;
    }
  }
  if (pending > 0) await batch.commit();
  return deleted;
}

async function removeHostReplies(uid: string, db: any) {
  const snapshot = await db.collection('producer_reviews').where('hostReply.hostUid', '==', uid).get();
  let batch = db.batch();
  let pending = 0;
  let removed = 0;
  for (const item of snapshot.docs) {
    batch.update(item.ref, { hostReply: FieldValue.delete() });
    pending += 1;
    removed += 1;
    if (pending >= 400) {
      await batch.commit();
      batch = db.batch();
      pending = 0;
    }
  }
  if (pending > 0) await batch.commit();
  return removed;
}

async function anonymizeAuditEvents(uid: string, db: any) {
  const snapshot = await db.collection('admin_audit').where('actorUid', '==', uid).get();
  let batch = db.batch();
  let pending = 0;
  let changed = 0;
  for (const item of snapshot.docs) {
    batch.update(item.ref, {
      actorUid: 'deleted_account',
      actorEmail: FieldValue.delete(),
      actorDisplayName: FieldValue.delete(),
      accountAnonymizedAt: new Date().toISOString(),
    });
    pending += 1;
    changed += 1;
    if (pending >= 400) {
      await batch.commit();
      batch = db.batch();
      pending = 0;
    }
  }
  if (pending > 0) await batch.commit();
  return changed;
}

/**
 * Permanently removes a normal traveler/host account. Public producer catalogue
 * entries are intentionally untouched. Trusted ownership assignments are
 * removed so the listings become unassigned. Public traveler reviews and Host
 * review replies authored by the deleted account are removed with that account.
 * Admin accounts must first be demoted by the Platform Owner; this prevents
 * accidental governance lockout.
 */
export async function deleteOwnAccount(
  uid: string,
  db = adminDb(),
  authClient: Auth = adminAuth(),
  deleteIntentEvents: (uid: string) => Promise<number> = deleteIntentEventsForFirebaseUid
) {
  if (!uid) throw new AccountSelfServiceError('bad_request', 'Authenticated user ID is required.');

  const capabilities = await getTrustedAccountCapabilities(uid, db);
  if (capabilities.isAdmin) {
    throw new AccountSelfServiceError(
      'forbidden',
      capabilities.isPlatformOwner
        ? 'The Platform Owner account cannot be deleted through self-service account deletion.'
        : 'Admin access must be revoked by the Platform Owner before this account can be deleted.'
    );
  }

  // Remove retained account-linked raw intent telemetry before destructive account
  // deletion begins. Non-identifying daily aggregates intentionally remain.
  const deletedIntentEvents = await deleteIntentEvents(uid);

  const [bookings, ownerships, registrations, passes, authoredReviews, reviewReports] = await Promise.all([
    db.collection('bookings').where('userId', '==', uid).get(),
    db.collection('producer_owners').where('ownerUid', '==', uid).get(),
    db.collection('producer_registrations').where('userId', '==', uid).get(),
    db.collection('explorerPasses').where('userId', '==', uid).get(),
    db.collection('producer_reviews').where('travelerUid', '==', uid).get(),
    db.collection('review_reports').where('reporterUid', '==', uid).get(),
  ]);

  const producerIds = ownerships.docs
    .map((item: any) => String(item.data()?.producerId || item.id))
    .filter(Boolean);

  const [
    deletedBookings,
    deletedOwnerships,
    deletedRegistrations,
    deletedPasses,
    deletedReviews,
    deletedReviewReports,
    removedHostReplies,
    anonymizedAudits,
    tripDeletion,
  ] = await Promise.all([
    deleteSnapshotDocs(bookings, db),
    deleteSnapshotDocs(ownerships, db),
    deleteSnapshotDocs(registrations, db),
    deleteSnapshotDocs(passes, db),
    deleteSnapshotDocs(authoredReviews, db),
    deleteSnapshotDocs(reviewReports, db),
    removeHostReplies(uid, db),
    anonymizeAuditEvents(uid, db),
    deleteTrips(uid, db),
  ]);

  await db.collection('users').doc(uid).delete();

  // Keep only a non-identifying operational record that an account deletion
  // occurred and which public producer listings were unassigned.
  await db.collection('admin_audit').add({
    eventType: 'account_self_deleted',
    actorUid: 'deleted_account',
    producerIds,
    deletedBookings,
    deletedOwnerships,
    deletedRegistrations,
    deletedPasses,
    deletedReviews,
    deletedReviewReports,
    removedHostReplies,
    anonymizedAudits,
    deletedTrips: tripDeletion.deletedTrips,
    deletedTripItems: tripDeletion.deletedTripItems,
    deletedIntentEvents,
    occurredAt: new Date().toISOString(),
    source: 'self_service',
  });

  await authClient.deleteUser(uid);

  return {
    deleted: true,
    producerIdsUnassigned: producerIds,
    deletedTrips: tripDeletion.deletedTrips,
    deletedTripItems: tripDeletion.deletedTripItems,
    deletedIntentEvents,
  };
}
