import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { config as loadEnv } from 'dotenv';
import { deleteApp, initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
} from 'firebase/auth';
import { doc, getFirestore, setDoc } from 'firebase/firestore';

for (const path of ['.env.smoke.local', '.env.local', '.env']) {
  loadEnv({ path, override: false, quiet: true });
}

const publicOrigin = (process.env.SMOKE_PUBLIC_ORIGIN || 'https://terroir-trail.web.app').replace(/\/+$/, '');
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS || 20000);
const producerId = String(process.env.SMOKE_PRODUCER_ID || 'anoskeli-estate').trim();

function requiredEnv(name: string): string {
  const value = String(process.env[name] || '').trim();
  if (!value) {
    throw new Error(`Missing ${name}. Add it to .env.smoke.local.`);
  }
  return value;
}

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

requiredEnv('SMOKE_ADMIN_EMAIL');
requiredEnv('SMOKE_ADMIN_PASSWORD');

type TempTraveler = {
  label: 'traveler-a' | 'traveler-b';
  email: string;
  password: string;
};

function namedApp(prefix: string): FirebaseApp {
  return initializeApp(
    firebaseConfig,
    `${prefix}-${Date.now()}-${randomBytes(4).toString('hex')}`
  );
}

async function callAccountDelete(auth: Auth): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) return;
  const response = await fetch(`${publicOrigin}/api/account`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${await currentUser.getIdToken(true)}`,
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok && response.status !== 404) {
    const body = await response.text();
    throw new Error(`Temporary Traveler cleanup returned HTTP ${response.status}: ${body.slice(0, 500)}`);
  }
}

async function createTemporaryTraveler(label: TempTraveler['label']): Promise<TempTraveler> {
  const app = namedApp(`production-smoke-bootstrap-${label}`);
  const auth = getAuth(app);
  const suffix = `${Date.now()}-${randomBytes(5).toString('hex')}`;
  const email = `terroir.smoke.${label}.${suffix}@example.com`;
  const password = `TT!${randomBytes(24).toString('base64url')}`;
  let created = false;

  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    created = true;
    const now = new Date().toISOString();
    await setDoc(doc(getFirestore(app), 'users', credential.user.uid), {
      name: label === 'traveler-a' ? 'Smoke Traveler A' : 'Smoke Traveler B',
      email,
      favoriteProducerIds: [],
      visitedProducers: [],
      personalNotes: {},
      memberSince: now,
      updatedAt: now,
    });
    return { label, email, password };
  } catch (error) {
    if (created) {
      try {
        await callAccountDelete(auth);
      } catch (cleanupError) {
        console.error(`WARNING: failed to remove partially created ${label} account: ${String(cleanupError)}`);
      }
    }
    throw error;
  } finally {
    try {
      await signOut(auth);
    } catch {
      // App disposal below is the important local cleanup.
    }
    await deleteApp(app);
  }
}

async function deleteTemporaryTraveler(traveler: TempTraveler): Promise<void> {
  const app = namedApp(`production-smoke-cleanup-${traveler.label}`);
  const auth = getAuth(app);
  try {
    await signInWithEmailAndPassword(auth, traveler.email, traveler.password);
    await callAccountDelete(auth);
  } catch (error) {
    const code = String((error as { code?: string })?.code || '');
    if (!code.includes('user-not-found') && !code.includes('invalid-credential')) {
      throw error;
    }
  } finally {
    try {
      await signOut(auth);
    } catch {
      // Account may already have been deleted successfully.
    }
    await deleteApp(app);
  }
}

async function main(): Promise<void> {
  console.log('\nTerroirTrail automated Phase 11 production smoke');
  console.log(`Target: ${publicOrigin}`);
  console.log(`Producer: ${producerId}`);
  console.log('Mode: Traveler/Admin. Host checks are skipped until a verified producer exists.');
  console.log('Two disposable Traveler accounts will be created and deleted automatically.\n');

  const temporaryTravelers: TempTraveler[] = [];
  let smokeExitCode = 1;
  const cleanupErrors: string[] = [];

  try {
    const travelerA = await createTemporaryTraveler('traveler-a');
    temporaryTravelers.push(travelerA);
    const travelerB = await createTemporaryTraveler('traveler-b');
    temporaryTravelers.push(travelerB);

    const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const child = spawnSync(npx, ['tsx', 'scripts/production_account_smoke_no_host.ts'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        SMOKE_PRODUCER_ID: producerId,
        SMOKE_TRAVELER_A_EMAIL: travelerA.email,
        SMOKE_TRAVELER_A_PASSWORD: travelerA.password,
        SMOKE_TRAVELER_B_EMAIL: travelerB.email,
        SMOKE_TRAVELER_B_PASSWORD: travelerB.password,
      },
      shell: false,
    });

    if (child.error) throw child.error;
    smokeExitCode = child.status ?? 1;
  } finally {
    for (const traveler of temporaryTravelers.reverse()) {
      try {
        await deleteTemporaryTraveler(traveler);
      } catch (error) {
        cleanupErrors.push(`${traveler.label}: ${String(error)}`);
      }
    }
  }

  if (cleanupErrors.length > 0) {
    console.error('\nWARNING: temporary Traveler cleanup was incomplete:');
    for (const error of cleanupErrors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log('\nTemporary Traveler accounts deleted.');
  process.exitCode = smokeExitCode;
}

main().catch((error) => {
  console.error('\nAutomated production smoke setup failed.');
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
