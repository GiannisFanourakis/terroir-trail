import assert from 'node:assert/strict';
import { config as loadEnv } from 'dotenv';
import { deleteApp, initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, type Auth } from 'firebase/auth';
import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  where,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore';

for (const path of ['.env.smoke.local', '.env.local', '.env']) {
  loadEnv({ path, override: false, quiet: true });
}

const SMOKE_PREFIX = '[TerroirTrail Phase 11 smoke]';
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS || 20000);
const publicOrigin = (process.env.SMOKE_PUBLIC_ORIGIN || 'https://terroir-trail.web.app').replace(/\/+$/, '');
const producerId = requiredEnv('SMOKE_PRODUCER_ID');

const firebaseConfig: FirebaseOptions = {
  apiKey: requiredEnv('VITE_FIREBASE_API_KEY'),
  authDomain: requiredEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: requiredEnv('VITE_FIREBASE_PROJECT_ID'),
  ...(process.env.VITE_FIREBASE_STORAGE_BUCKET
    ? { storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET }
    : {}),
  ...(process.env.VITE_FIREBASE_MESSAGING_SENDER_ID
    ? { messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID }
    : {}),
  ...(process.env.VITE_FIREBASE_APP_ID ? { appId: process.env.VITE_FIREBASE_APP_ID } : {}),
};

const credentials = {
  travelerA: {
    email: requiredEnv('SMOKE_TRAVELER_A_EMAIL'),
    password: requiredEnv('SMOKE_TRAVELER_A_PASSWORD'),
  },
  travelerB: {
    email: requiredEnv('SMOKE_TRAVELER_B_EMAIL'),
    password: requiredEnv('SMOKE_TRAVELER_B_PASSWORD'),
  },
  host: {
    email: requiredEnv('SMOKE_HOST_EMAIL'),
    password: requiredEnv('SMOKE_HOST_PASSWORD'),
  },
  admin: {
    email: requiredEnv('SMOKE_ADMIN_EMAIL'),
    password: requiredEnv('SMOKE_ADMIN_PASSWORD'),
  },
};

type Credential = { email: string; password: string };

type SmokeSession = {
  label: string;
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  uid: string;
  credential: Credential;
};

type AccountCapabilities = {
  uid: string;
  isAdmin: boolean;
  producerIds: string[];
  canManageOwnedListings: boolean;
  canModerateProducerContent: boolean;
};

type PublicReview = {
  id: string;
  producerId: string;
  travelerName: string;
  rating: number;
  comment: string;
  verifiedVisit: boolean;
  isOwnReview: boolean;
  hostReply?: {
    comment: string;
    createdAt?: string;
    updatedAt?: string;
  };
};

type PendingReviewReport = {
  reportId: string;
  reviewId: string;
  producerId: string;
  reason: string;
};

type ApiResult<T = unknown> = {
  status: number;
  body: T | null;
  rawBody: string;
};

type ProfileSnapshot = {
  exists: boolean;
  data: DocumentData;
};

const sessions: SmokeSession[] = [];
let travelerA: SmokeSession | null = null;
let travelerB: SmokeSession | null = null;
let host: SmokeSession | null = null;
let admin: SmokeSession | null = null;
let travelerAOriginalProfile: ProfileSnapshot | null = null;
let travelerBOriginalProfile: ProfileSnapshot | null = null;
let travelerAProfileTouched = false;
let reviewTouched = false;
let reviewId: string | null = null;

function requiredEnv(name: string): string {
  const value = String(process.env[name] || '').trim();
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.smoke.example to .env.smoke.local and fill the dedicated smoke-test accounts.`
    );
  }
  return value;
}

function ensure(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function hasOwn(data: DocumentData, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(data, key);
}

function safeBody(value: unknown): string {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return text.length > 600 ? `${text.slice(0, 600)}…` : text;
}

async function step<T>(label: string, action: () => Promise<T>): Promise<T> {
  process.stdout.write(`- ${label} ... `);
  try {
    const result = await action();
    console.log('PASS');
    return result;
  } catch (error) {
    console.log('FAIL');
    throw error;
  }
}

async function login(label: string, credential: Credential): Promise<SmokeSession> {
  const app = initializeApp(
    firebaseConfig,
    `production-smoke-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );
  const auth = getAuth(app);
  const signedIn = await signInWithEmailAndPassword(auth, credential.email, credential.password);
  const session: SmokeSession = {
    label,
    app,
    auth,
    db: getFirestore(app),
    uid: signedIn.user.uid,
    credential,
  };
  sessions.push(session);
  return session;
}

async function relogin(session: SmokeSession): Promise<void> {
  await signOut(session.auth);
  const signedIn = await signInWithEmailAndPassword(
    session.auth,
    session.credential.email,
    session.credential.password
  );
  assert.equal(signedIn.user.uid, session.uid, `${session.label} signed back into a different account.`);
}

async function apiRequest<T = unknown>(
  session: SmokeSession | null,
  method: string,
  path: string,
  body?: unknown
): Promise<ApiResult<T>> {
  const headers = new Headers({ Accept: 'application/json' });
  if (session) {
    const currentUser = session.auth.currentUser;
    ensure(currentUser && currentUser.uid === session.uid, `${session.label} is no longer signed in.`);
    headers.set('Authorization', `Bearer ${await currentUser.getIdToken(true)}`);
  }
  if (body !== undefined) headers.set('Content-Type', 'application/json');

  const response = await fetch(`${publicOrigin}/api${path}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    cache: 'no-store',
    signal: AbortSignal.timeout(timeoutMs),
  });
  const rawBody = await response.text();
  let parsed: T | null = null;
  if (rawBody) {
    try {
      parsed = JSON.parse(rawBody) as T;
    } catch {
      parsed = null;
    }
  }
  return { status: response.status, body: parsed, rawBody };
}

async function apiExpect<T>(
  session: SmokeSession | null,
  method: string,
  path: string,
  expectedStatus: number,
  body?: unknown
): Promise<T> {
  const result = await apiRequest<T>(session, method, path, body);
  if (result.status !== expectedStatus) {
    throw new Error(
      `${method} ${path} returned HTTP ${result.status}; expected ${expectedStatus}. ` +
        safeBody(result.body ?? result.rawBody)
    );
  }
  return (result.body ?? {}) as T;
}

async function fetchCapabilities(session: SmokeSession): Promise<AccountCapabilities> {
  const response = await apiExpect<{ capabilities: AccountCapabilities }>(
    session,
    'GET',
    '/account/capabilities',
    200
  );
  return response.capabilities;
}

async function fetchReviews(session: SmokeSession | null): Promise<PublicReview[]> {
  const response = await apiExpect<{ reviews: PublicReview[] }>(
    session,
    'GET',
    `/producers/${encodeURIComponent(producerId)}/reviews`,
    200
  );
  return response.reviews;
}

async function getOwnProfile(session: SmokeSession): Promise<ProfileSnapshot> {
  const snapshot = await getDoc(doc(session.db, 'users', session.uid));
  return {
    exists: snapshot.exists(),
    data: snapshot.exists() ? snapshot.data() : {},
  };
}

function privateTravelerState(data: DocumentData) {
  return {
    favoriteProducerIds: hasOwn(data, 'favoriteProducerIds') ? data.favoriteProducerIds : undefined,
    visitedProducers: hasOwn(data, 'visitedProducers') ? data.visitedProducers : undefined,
    personalNotes: hasOwn(data, 'personalNotes') ? data.personalNotes : undefined,
  };
}

function restoreField(original: DocumentData, key: string) {
  return hasOwn(original, key) ? original[key] : deleteField();
}

async function restoreTravelerAProfile(): Promise<void> {
  if (!travelerA || !travelerAOriginalProfile || !travelerAProfileTouched) return;
  const original = travelerAOriginalProfile.data;
  await setDoc(
    doc(travelerA.db, 'users', travelerA.uid),
    {
      favoriteProducerIds: restoreField(original, 'favoriteProducerIds'),
      visitedProducers: restoreField(original, 'visitedProducers'),
      personalNotes: restoreField(original, 'personalNotes'),
      updatedAt: restoreField(original, 'updatedAt'),
    },
    { merge: true }
  );
  travelerAProfileTouched = false;
}

async function expectPermissionDenied(action: () => Promise<unknown>, label: string): Promise<void> {
  try {
    await action();
  } catch (error) {
    const code = String((error as { code?: string })?.code || '');
    if (code.includes('permission-denied')) return;
    throw new Error(`${label} failed for an unexpected reason: ${String(error)}`);
  }
  throw new Error(`${label} unexpectedly succeeded.`);
}

async function hasCompletedBookingForProducer(session: SmokeSession): Promise<boolean> {
  const snapshot = await getDocs(
    query(collection(session.db, 'bookings'), where('userId', '==', session.uid))
  );
  return snapshot.docs.some((booking) => {
    const data = booking.data();
    return data.producerId === producerId && data.status === 'completed';
  });
}

async function dismissPendingSmokeReports(): Promise<void> {
  if (!admin || !reviewId) return;
  const result = await apiRequest<{ reports: PendingReviewReport[] }>(
    admin,
    'GET',
    '/admin/review-reports'
  );
  if (result.status !== 200 || !result.body?.reports) return;

  const pending = result.body.reports.filter((report) => report.reviewId === reviewId);
  for (const report of pending) {
    await apiRequest(
      admin,
      'POST',
      `/admin/review-reports/${encodeURIComponent(report.reportId)}/dismiss`,
      { reason: `${SMOKE_PREFIX} cleanup after interrupted smoke run` }
    );
  }
}

async function cleanup(): Promise<string[]> {
  const errors: string[] = [];

  if (reviewTouched && travelerA && reviewId) {
    try {
      await dismissPendingSmokeReports();
    } catch (error) {
      errors.push(`could not resolve pending smoke report: ${String(error)}`);
    }
    try {
      const result = await apiRequest(
        travelerA,
        'DELETE',
        `/producers/${encodeURIComponent(producerId)}/reviews/me`
      );
      if (result.status !== 200 && result.status !== 404) {
        errors.push(`could not delete smoke review (HTTP ${result.status})`);
      }
    } catch (error) {
      errors.push(`could not delete smoke review: ${String(error)}`);
    }
    reviewTouched = false;
  }

  try {
    await restoreTravelerAProfile();
  } catch (error) {
    errors.push(`could not restore Traveler A profile: ${String(error)}`);
  }

  for (const session of [...sessions].reverse()) {
    try {
      await signOut(session.auth);
    } catch {
      // App disposal below is the important local cleanup.
    }
    try {
      await deleteApp(session.app);
    } catch (error) {
      errors.push(`could not dispose ${session.label} Firebase app: ${String(error)}`);
    }
  }

  return errors;
}

async function runSmoke(): Promise<void> {
  console.log('\nTerroirTrail Phase 11 production smoke');
  console.log(`Target: ${publicOrigin}`);
  console.log(`Producer: ${producerId}`);
  console.log('Credentials are read from local environment files and are never printed.\n');

  await step('public production app responds', async () => {
    const response = await fetch(publicOrigin, {
      cache: 'no-store',
      signal: AbortSignal.timeout(timeoutMs),
    });
    assert.equal(response.status, 200, `Production app returned HTTP ${response.status}.`);
  });

  await step('four dedicated role accounts can sign in', async () => {
    travelerA = await login('traveler-a', credentials.travelerA);
    travelerB = await login('traveler-b', credentials.travelerB);
    host = await login('host', credentials.host);
    admin = await login('admin', credentials.admin);
    assert.equal(
      new Set(sessions.map((session) => session.uid)).size,
      4,
      'Smoke accounts must be four different users.'
    );
  });

  await step('server-trusted capabilities separate Traveler, Host and Admin roles', async () => {
    ensure(travelerA && travelerB && host && admin, 'Smoke sessions are not initialized.');
    const [a, b, h, adm] = await Promise.all([
      fetchCapabilities(travelerA),
      fetchCapabilities(travelerB),
      fetchCapabilities(host),
      fetchCapabilities(admin),
    ]);
    assert.equal(a.isAdmin, false, 'Traveler A unexpectedly has Admin authority.');
    assert.equal(b.isAdmin, false, 'Traveler B unexpectedly has Admin authority.');
    assert.deepEqual(a.producerIds, [], 'Traveler A unexpectedly owns a producer listing.');
    assert.deepEqual(b.producerIds, [], 'Traveler B unexpectedly owns a producer listing.');
    assert.equal(h.isAdmin, false, 'The dedicated Host account should not also be an Admin.');
    assert.equal(h.producerIds.includes(producerId), true, 'Host does not own SMOKE_PRODUCER_ID.');
    assert.equal(h.canManageOwnedListings, true, 'Host ownership is active but management capability is missing.');
    assert.equal(adm.isAdmin, true, 'Admin account does not have trusted Admin authority.');
    assert.equal(adm.canModerateProducerContent, true, 'Admin cannot moderate producer/community content.');
  });

  await step('dedicated Traveler A has no real review that would be overwritten', async () => {
    ensure(travelerA, 'Traveler A is not signed in.');
    const own = (await fetchReviews(travelerA)).find((review) => review.isOwnReview);
    if (!own) return;
    if (!own.comment.startsWith(SMOKE_PREFIX)) {
      throw new Error(
        'Traveler A already has a real review on the smoke producer. Use a dedicated test account or another producer.'
      );
    }
    await apiExpect(
      travelerA,
      'DELETE',
      `/producers/${encodeURIComponent(producerId)}/reviews/me`,
      200
    );
  });

  await step('Traveler private profiles exist before reversible mutations', async () => {
    ensure(travelerA && travelerB, 'Traveler sessions are not initialized.');
    travelerAOriginalProfile = await getOwnProfile(travelerA);
    travelerBOriginalProfile = await getOwnProfile(travelerB);
    assert.equal(
      travelerAOriginalProfile.exists,
      true,
      'Traveler A has no Firestore profile. Open the app once with this dedicated account before running the smoke.'
    );
    assert.equal(
      travelerBOriginalProfile.exists,
      true,
      'Traveler B has no Firestore profile. Open the app once with this dedicated account before running the smoke.'
    );
  });

  await step('Traveler A cannot read or write Traveler B private state', async () => {
    ensure(travelerA && travelerB, 'Traveler sessions are not initialized.');
    await expectPermissionDenied(
      () => getDoc(doc(travelerA!.db, 'users', travelerB!.uid)),
      'cross-user profile read'
    );
    await expectPermissionDenied(
      () =>
        setDoc(
          doc(travelerA!.db, 'users', travelerB!.uid),
          { hometown: `${SMOKE_PREFIX} forbidden write` },
          { merge: true }
        ),
      'cross-user profile write'
    );
  });

  await step('Favorites, Passport stamp and private note persist through sign-out/sign-in', async () => {
    ensure(travelerA && travelerAOriginalProfile, 'Traveler A profile is not initialized.');
    const original = travelerAOriginalProfile.data;
    const originalFavorites = Array.isArray(original.favoriteProducerIds)
      ? original.favoriteProducerIds.filter((value): value is string => typeof value === 'string')
      : [];
    const originalVisited = Array.isArray(original.visitedProducers)
      ? original.visitedProducers.filter((value): value is string => typeof value === 'string')
      : [];
    const originalNotes =
      original.personalNotes && typeof original.personalNotes === 'object' && !Array.isArray(original.personalNotes)
        ? { ...original.personalNotes }
        : {};
    const nextFavorites = originalFavorites.includes(producerId)
      ? originalFavorites.filter((id) => id !== producerId)
      : [...originalFavorites, producerId];
    const nextVisited = originalVisited.includes(producerId)
      ? [...originalVisited]
      : [...originalVisited, producerId];
    const smokeNote = `${SMOKE_PREFIX} ${new Date().toISOString()}`;

    await setDoc(
      doc(travelerA.db, 'users', travelerA.uid),
      {
        favoriteProducerIds: nextFavorites,
        visitedProducers: nextVisited,
        personalNotes: { ...originalNotes, [producerId]: smokeNote },
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    travelerAProfileTouched = true;

    await relogin(travelerA);
    const afterRelogin = await getOwnProfile(travelerA);
    assert.deepEqual(afterRelogin.data.favoriteProducerIds || [], nextFavorites, 'Favorites did not persist.');
    assert.equal(
      Array.isArray(afterRelogin.data.visitedProducers) && afterRelogin.data.visitedProducers.includes(producerId),
      true,
      'Passport visited stamp did not persist.'
    );
    assert.equal(afterRelogin.data.personalNotes?.[producerId], smokeNote, 'Private tasting note did not persist.');
  });

  await step('Traveler B state is unchanged by Traveler A cloud mutations', async () => {
    ensure(travelerB && travelerBOriginalProfile, 'Traveler B profile snapshot is missing.');
    const current = await getOwnProfile(travelerB);
    assert.deepEqual(
      privateTravelerState(current.data),
      privateTravelerState(travelerBOriginalProfile.data),
      'Traveler B private state changed while Traveler A was being tested.'
    );
  });

  let expectedVerifiedVisit = false;
  await step('Verified Visit expectation comes from completed bookings, not Passport stamps', async () => {
    ensure(travelerA, 'Traveler A is not signed in.');
    expectedVerifiedVisit = await hasCompletedBookingForProducer(travelerA);
  });

  await step('Host cannot rate the producer listing they own', async () => {
    ensure(host, 'Host is not signed in.');
    const attempt = await apiRequest(
      host,
      'PUT',
      `/producers/${encodeURIComponent(producerId)}/reviews/me`,
      { rating: 5, comment: `${SMOKE_PREFIX} Host self-rating must be rejected.` }
    );
    if (attempt.status === 200) {
      await apiRequest(host, 'DELETE', `/producers/${encodeURIComponent(producerId)}/reviews/me`);
    }
    assert.equal(attempt.status, 403, `Host self-review returned HTTP ${attempt.status} instead of 403.`);
  });

  await step('Traveler creates a review and Verified Visit matches booking evidence', async () => {
    ensure(travelerA, 'Traveler A is not signed in.');
    const response = await apiExpect<{ review: PublicReview }>(
      travelerA,
      'PUT',
      `/producers/${encodeURIComponent(producerId)}/reviews/me`,
      200,
      { rating: 4, comment: `${SMOKE_PREFIX} initial production review.` }
    );
    reviewId = response.review.id;
    reviewTouched = true;
    assert.equal(response.review.producerId, producerId);
    assert.equal(response.review.rating, 4);
    assert.equal(response.review.verifiedVisit, expectedVerifiedVisit);
    assert.equal(response.review.isOwnReview, true);
    assert.equal('travelerUid' in response.review, false, 'Public review leaked travelerUid.');
  });

  await step('Traveler edits the same review rather than creating a duplicate', async () => {
    ensure(travelerA && reviewId, 'Traveler review was not created.');
    const response = await apiExpect<{ review: PublicReview }>(
      travelerA,
      'PUT',
      `/producers/${encodeURIComponent(producerId)}/reviews/me`,
      200,
      { rating: 5, comment: `${SMOKE_PREFIX} edited production review.` }
    );
    assert.equal(response.review.id, reviewId);
    assert.equal(response.review.rating, 5);
    const reviews = await fetchReviews(travelerA);
    assert.equal(
      reviews.filter((review) => review.isOwnReview).length,
      1,
      'Traveler has more than one active review for the producer.'
    );
  });

  await step('non-owner Traveler cannot publish an official Host reply', async () => {
    ensure(travelerB && reviewId, 'Review or Traveler B is not initialized.');
    const attempt = await apiRequest(
      travelerB,
      'PUT',
      `/reviews/${encodeURIComponent(reviewId)}/host-reply`,
      { comment: `${SMOKE_PREFIX} unauthorized reply` }
    );
    assert.equal(attempt.status, 403, `Non-owner reply returned HTTP ${attempt.status} instead of 403.`);
  });

  const hostReplyText = `${SMOKE_PREFIX} official Host reply.`;
  await step('verified Host can reply to a review on the owned producer', async () => {
    ensure(host && reviewId, 'Host or review is not initialized.');
    const response = await apiExpect<{ review: PublicReview }>(
      host,
      'PUT',
      `/reviews/${encodeURIComponent(reviewId)}/host-reply`,
      200,
      { comment: hostReplyText }
    );
    assert.equal(response.review.hostReply?.comment, hostReplyText);
    assert.equal('hostUid' in (response.review.hostReply || {}), false, 'Public Host reply leaked hostUid.');
  });

  await step('public review feed shows edited rating and Host reply without private IDs', async () => {
    ensure(reviewId, 'Review was not created.');
    const review = (await fetchReviews(null)).find((item) => item.id === reviewId);
    ensure(review, 'Public review feed does not contain the smoke review.');
    assert.equal(review.rating, 5);
    assert.equal(review.hostReply?.comment, hostReplyText);
    assert.equal('travelerUid' in review, false, 'Public review leaked travelerUid.');
  });

  await step('Traveler can report a review but cannot access Admin moderation', async () => {
    ensure(travelerA && travelerB && reviewId, 'Review sessions are not initialized.');
    await apiExpect(
      travelerB,
      'POST',
      `/reviews/${encodeURIComponent(reviewId)}/report`,
      201,
      { reason: 'other' }
    );
    const unauthorized = await apiRequest(travelerA, 'GET', '/admin/review-reports');
    assert.equal(
      unauthorized.status,
      403,
      `Traveler moderation access returned HTTP ${unauthorized.status} instead of 403.`
    );
  });

  let reportId = '';
  await step('Admin sees the reported review in the moderation queue', async () => {
    ensure(admin && reviewId, 'Admin or review is not initialized.');
    const response = await apiExpect<{ reports: PendingReviewReport[] }>(
      admin,
      'GET',
      '/admin/review-reports',
      200
    );
    const report = response.reports.find((item) => item.reviewId === reviewId);
    ensure(report, 'Admin moderation queue does not contain the smoke review report.');
    assert.equal(report.producerId, producerId);
    reportId = report.reportId;
  });

  await step('Admin can hide the review and remove it from public discovery', async () => {
    ensure(admin && reviewId, 'Admin or review is not initialized.');
    await apiExpect(
      admin,
      'POST',
      `/admin/reviews/${encodeURIComponent(reviewId)}/moderation`,
      200,
      { action: 'hide', reason: `${SMOKE_PREFIX} moderation hide test` }
    );
    assert.equal(
      (await fetchReviews(null)).some((review) => review.id === reviewId),
      false,
      'Hidden review is still public.'
    );
    const queue = await apiExpect<{ reports: PendingReviewReport[] }>(
      admin,
      'GET',
      '/admin/review-reports',
      200
    );
    assert.equal(
      queue.reports.some((report) => report.reportId === reportId),
      false,
      'Moderated report remained pending.'
    );
  });

  await step('Admin can restore the review and its Host reply', async () => {
    ensure(admin && reviewId, 'Admin or review is not initialized.');
    await apiExpect(
      admin,
      'POST',
      `/admin/reviews/${encodeURIComponent(reviewId)}/moderation`,
      200,
      { action: 'restore', reason: `${SMOKE_PREFIX} moderation restore test` }
    );
    const restored = (await fetchReviews(null)).find((review) => review.id === reviewId);
    ensure(restored, 'Restored review did not return to the public feed.');
    assert.equal(restored.rating, 5);
    assert.equal(restored.hostReply?.comment, hostReplyText);
  });

  await step('Traveler can delete the review cleanly', async () => {
    ensure(travelerA && reviewId, 'Traveler review is not initialized.');
    await apiExpect(
      travelerA,
      'DELETE',
      `/producers/${encodeURIComponent(producerId)}/reviews/me`,
      200
    );
    reviewTouched = false;
    assert.equal(
      (await fetchReviews(null)).some((review) => review.id === reviewId),
      false,
      'Deleted review is still public.'
    );
  });

  await step('Traveler A private profile is restored to its exact pre-smoke state', async () => {
    ensure(travelerA && travelerAOriginalProfile, 'Traveler A profile snapshot is missing.');
    await restoreTravelerAProfile();
    const restored = await getOwnProfile(travelerA);
    assert.deepEqual(
      privateTravelerState(restored.data),
      privateTravelerState(travelerAOriginalProfile.data),
      'Traveler A Favorites/Passport/notes were not restored after the smoke.'
    );
  });

  console.log('\nPASS: Phase 11 production account/community smoke completed successfully.');
  console.log(
    `Verified Visit state: ${expectedVerifiedVisit ? 'verified (completed booking exists)' : 'not verified (no completed booking)'}.`
  );
  console.log('All reversible profile/review mutations were restored or deleted.');
}

async function main() {
  let primaryError: unknown = null;
  try {
    await runSmoke();
  } catch (error) {
    primaryError = error;
  }

  const cleanupErrors = await cleanup();
  if (cleanupErrors.length > 0) {
    console.error('\nCleanup warnings:');
    cleanupErrors.forEach((message) => console.error(`- ${message}`));
  }

  if (primaryError) throw primaryError;
  if (cleanupErrors.length > 0) {
    throw new Error('Smoke assertions passed, but production cleanup was incomplete.');
  }
}

main().catch((error) => {
  console.error('\nFAIL: Phase 11 production smoke did not complete.');
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
