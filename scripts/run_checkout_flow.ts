import 'dotenv/config';
import { adminAuth } from '../server/firebaseAdmin';
import { createPassCheckout } from '../server/services/passService';

// Optional manual smoke test. Never simulates successful payment or writes a pass.
async function run() {
  if (!process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) {
    throw new Error('This manual checkout flow requires a Stripe test-mode key.');
  }
  const token = process.env.TEST_FIREBASE_ID_TOKEN;
  if (!token) throw new Error('Set TEST_FIREBASE_ID_TOKEN to a Firebase ID token for your test account.');
  const identity = await adminAuth().verifyIdToken(token, true);
  const result = await createPassCheckout(identity.uid, identity.name || 'Explorer', process.env.TEST_PASS_PLAN || 'holiday');
  console.log('Complete payment using Stripe test details at: ' + result.url);
  console.log('The signed webhook or authenticated return flow will verify payment and issue the pass.');
}
run().catch(error => { console.error(error.message); process.exitCode = 1; });
