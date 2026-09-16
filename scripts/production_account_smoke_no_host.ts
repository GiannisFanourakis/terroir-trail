import assert from 'node:assert/strict';
import { config as loadEnv } from 'dotenv';
import { deleteApp, initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, type Auth } from 'firebase/auth';
import {
  doc,
  getDoc,
  getFirestore,
  setDoc,
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
  hostReply?: { comment: string };
};
type PendingReviewReport = {
  reportId: string;
  reviewId: string;
  producerId: string;
  reason: string;
};
type ApiResult<T = unknown> = { status: number; body: T | null; rawBody: string };

const sessions: SmokeSession[] = [];
let travelerA: SmokeSession | null = null;
let travelerB: SmokeSession | null = null;
let admin: SmokeSession | null = null;
let reviewId: string | null = null;
let reviewCreated = false;

function requiredEnv(name: string): string {
  const value = String(process.env[name] || '').trim();
  if (!value) throw new Error(`Missing ${name}.`);
  return value;
}

function ensure(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
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
    `production-smoke-no-host-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
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
  assert.equal(signedIn.user.uid, session.uid, `${session.label} signed into a different account.`);
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
    ensure(currentUser && currentUser.uid === session.uid, `${session.label} is not signed in.`);
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
      `${method} ${path} returned HTTP ${result.status}; expected ${expectedStatus}. ${safeBody(result.body ?? result.rawBody)}`
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

async function cleanup(): Promise<string[]> {
  const errors: string[] = [];
  if (reviewCreated && travelerA) {
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
      errors.push(`could not dispose ${session.label} app: ${String(error)}`);
    }
  }
  return errors;
}

async function run(): Promise<void> {
  console.log('\nTerroirTrail Phase 11 production smoke — Traveler/Admin mode');
  console.log(`Target: ${publicOrigin}`);
  console.log(`Producer: ${producerId}`);
  console.log('Host-specific assertions are skipped because no active Host-owned producer is configured.\n');

  await step('public production app responds', async () => {
    const response = await fetch(publicOrigin, { cache: 'no-store', signal: AbortSignal.timeout(timeoutMs) });
    assert.equal(response.status, 200, `Production app returned HTTP ${response.status}.`);
  });

  await step('two disposable Travelers and Admin can sign in', async () => {
    travelerA = await login('traveler-a', credentials.travelerA);
    travelerB = await login('traveler-b', credentials.travelerB);
    admin = await login('admin', credentials.admin);
    assert.equal(new Set(sessions.map((session) => session.uid)).size, 3, 'Smoke accounts must be distinct users.');
  });

  await step('server-trusted capabilities separate Travelers and Admin', async () => {
    ensure(travelerA && travelerB && admin, 'Sessions not initialized.');
    const [a, b, adm] = await Promise.all([
      fetchCapabilities(travelerA),
      fetchCapabilities(travelerB),
      fetchCapabilities(admin),
    ]);
    assert.equal(a.isAdmin, false, 'Traveler A unexpectedly has Admin authority.');
    assert.equal(b.isAdmin, false, 'Traveler B unexpectedly has Admin authority.');
    assert.deepEqual(a.producerIds, [], 'Traveler A unexpectedly owns a producer listing.');
    assert.deepEqual(b.producerIds, [], 'Traveler B unexpectedly owns a producer listing.');
    assert.equal(adm.isAdmin, true, 'Admin account lacks trusted Admin authority.');
    assert.equal(adm.canModerateProducerContent, true, 'Admin lacks review moderation authority.');
  });

  await step('Traveler profile isolation blocks cross-account read and write', async () => {
    ensure(travelerA && travelerB, 'Traveler sessions not initialized.');
    await assert.doesNotReject(() => getDoc(doc(travelerA.db, 'users', travelerA.uid)));
    await assert.doesNotReject(() => getDoc(doc(travelerB.db, 'users', travelerB.uid)));
    await expectPermissionDenied(
      () => getDoc(doc(travelerA.db, 'users', travelerB.uid)),
      'Traveler A reading Traveler B private profile'
    );
    await expectPermissionDenied(
      () => setDoc(doc(travelerA.db, 'users', travelerB.uid), { personalNotes: { [producerId]: 'leak attempt' } }, { merge: true }),
      'Traveler A writing Traveler B private profile'
    );
  });

  await step('Favorites, Passport and private notes persist through sign-out/sign-in', async () => {
    ensure(travelerA && travelerB, 'Traveler sessions not initialized.');
    const marker = `${SMOKE_PREFIX} ${Date.now()}`;
    await setDoc(
      doc(travelerA.db, 'users', travelerA.uid),
      {
        favoriteProducerIds: [producerId],
        visitedProducers: [producerId],
        personalNotes: { [producerId]: marker },
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    await relogin(travelerA);
    const a = await getDoc(doc(travelerA.db, 'users', travelerA.uid));
    const b = await getDoc(doc(travelerB.db, 'users', travelerB.uid));
    assert.equal(a.exists(), true, 'Traveler A profile disappeared after re-login.');
    assert.deepEqual(a.data()?.favoriteProducerIds, [producerId]);
    assert.deepEqual(a.data()?.visitedProducers, [producerId]);
    assert.equal(a.data()?.personalNotes?.[producerId], marker);
    assert.deepEqual(b.data()?.favoriteProducerIds ?? [], [], 'Traveler B inherited Traveler A favorites.');
    assert.deepEqual(b.data()?.visitedProducers ?? [], [], 'Traveler B inherited Traveler A Passport stamps.');
    assert.equal(b.data()?.personalNotes?.[producerId], undefined, 'Traveler B inherited Traveler A private note.');
  });

  await step('Traveler A can create a review and public payload hides private UID', async () => {
    ensure(travelerA, 'Traveler A not signed in.');
    const response = await apiExpect<{ review: PublicReview }>(
      travelerA,
      'PUT',
      `/producers/${encodeURIComponent(producerId)}/reviews/me`,
      200,
      { rating: 5, comment: `${SMOKE_PREFIX} first review` }
    );
    reviewId = response.review.id;
    reviewCreated = true;
    assert.equal(response.review.rating, 5);
    assert.equal(response.review.isOwnReview, true);
    assert.equal((response.review as unknown as { travelerUid?: string }).travelerUid, undefined);
    assert.equal(response.review.verifiedVisit, false, 'Disposable Traveler unexpectedly received Verified Visit without a completed booking.');

    const publicReview = (await fetchReviews(null)).find((review) => review.id === reviewId);
    ensure(publicReview, 'New review did not appear in the public list.');
    assert.equal((publicReview as unknown as { travelerUid?: string }).travelerUid, undefined);
    assert.equal(publicReview.verifiedVisit, false);
  });

  await step('Passport self-stamp does not create Verified Visit', async () => {
    ensure(travelerA && reviewId, 'Review state not initialized.');
    await setDoc(doc(travelerA.db, 'users', travelerA.uid), { visitedProducers: [producerId] }, { merge: true });
    const review = (await fetchReviews(travelerA)).find((item) => item.id === reviewId);
    ensure(review, 'Review disappeared after Passport stamp.');
    assert.equal(review.verifiedVisit, false, 'Passport self-stamp incorrectly created Verified Visit.');
  });

  await step('Traveler A can edit the same review rather than creating a duplicate', async () => {
    ensure(travelerA && reviewId, 'Review state not initialized.');
    const response = await apiExpect<{ review: PublicReview }>(
      travelerA,
      'PUT',
      `/producers/${encodeURIComponent(producerId)}/reviews/me`,
      200,
      { rating: 4, comment: `${SMOKE_PREFIX} edited review` }
    );
    assert.equal(response.review.id, reviewId, 'Editing created a second review document.');
    assert.equal(response.review.rating, 4);
    assert.equal(response.review.comment, `${SMOKE_PREFIX} edited review`);
    const matches = (await fetchReviews(null)).filter((review) => review.id === reviewId);
    assert.equal(matches.length, 1, 'Public list contains duplicate copies of the edited review.');
  });

  await step('Traveler B can report Traveler A review', async () => {
    ensure(travelerB && reviewId, 'Report state not initialized.');
    const response = await apiExpect<{ report: { reportId: string; reviewId: string } }>(
      travelerB,
      'POST',
      `/reviews/${encodeURIComponent(reviewId)}/report`,
      201,
      { reason: 'spam' }
    );
    assert.equal(response.report.reviewId, reviewId);
  });

  await step('Admin can see report, hide review, then restore it', async () => {
    ensure(admin && reviewId, 'Admin moderation state not initialized.');
    const queue = await apiExpect<{ reports: PendingReviewReport[] }>(admin, 'GET', '/admin/review-reports', 200);
    const report = queue.reports.find((item) => item.reviewId === reviewId);
    ensure(report, 'Smoke review report did not enter the Admin moderation queue.');

    await apiExpect(
      admin,
      'POST',
      `/admin/reviews/${encodeURIComponent(reviewId)}/moderation`,
      200,
      { action: 'hide', reason: `${SMOKE_PREFIX} moderation hide check` }
    );
    assert.equal((await fetchReviews(null)).some((review) => review.id === reviewId), false, 'Hidden review is still public.');

    await apiExpect(
      admin,
      'POST',
      `/admin/reviews/${encodeURIComponent(reviewId)}/moderation`,
      200,
      { action: 'restore', reason: `${SMOKE_PREFIX} moderation restore check` }
    );
    assert.equal((await fetchReviews(null)).some((review) => review.id === reviewId), true, 'Restored review did not return to the public list.');
  });

  await step('Traveler A can delete own review', async () => {
    ensure(travelerA && reviewId, 'Delete state not initialized.');
    await apiExpect(travelerA, 'DELETE', `/producers/${encodeURIComponent(producerId)}/reviews/me`, 200);
    assert.equal((await fetchReviews(null)).some((review) => review.id === reviewId), false, 'Deleted review is still public.');
    reviewCreated = false;
  });

  console.log('\nSKIP: Host self-review prevention and Host official reply ownership were not exercised because no active Host-owned producer exists.');
  console.log('PASS: Traveler/account isolation, review lifecycle, reporting, Admin moderation, and Verified Visit safeguards passed in production.');
}

let failure: unknown = null;
try {
  await run();
} catch (error) {
  failure = error;
  console.error('\nProduction smoke failed.');
  console.error(error instanceof Error ? error.message : String(error));
}

const cleanupErrors = await cleanup();
if (cleanupErrors.length > 0) {
  console.error('\nSmoke cleanup warnings:');
  for (const error of cleanupErrors) console.error(`- ${error}`);
}
if (failure || cleanupErrors.length > 0) process.exitCode = 1;
