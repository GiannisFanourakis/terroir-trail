import { randomUUID } from 'node:crypto';
import { adminDb } from '../firebaseAdmin';
import { stripe } from '../stripeClient';
import { getPassPlan, isPassActive, publicPass, validatePassPayment, type PassRecord } from './passPolicy';

const passes = () => adminDb().collection('explorerPasses');

function appUrl() {
  const url = new URL(process.env.APP_URL || 'http://localhost:5173');
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && url.hostname === 'localhost')) {
    throw new Error('APP_URL must use HTTPS (except localhost).');
  }
  url.search = '';
  url.hash = '';
  return url;
}

export async function createPassCheckout(userId: string, name: string, requestedPlan: unknown) {
  const { plan, priceId } = getPassPlan(requestedPlan);
  const success = appUrl();
  success.search = '?checkout_session_id={CHECKOUT_SESSION_ID}';
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: userId,
    metadata: { purpose: 'explorer_pass', userId, name: name.slice(0, 100), plan },
    success_url: success.toString().replace('%7BCHECKOUT_SESSION_ID%7D', '{CHECKOUT_SESSION_ID}'),
    cancel_url: appUrl().toString(),
  });
  if (!session.url) throw new Error('Checkout is unavailable.');
  return { url: session.url };
}

async function paidSession(sessionId: string, expectedUserId?: string) {
  if (!/^cs_[a-zA-Z0-9_]+$/.test(sessionId) || sessionId.length > 255) throw new Error('Invalid checkout session.');
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items.data.price', 'payment_intent.latest_charge'],
  });
  validatePassPayment(session, expectedUserId);
  return session;
}

export async function fulfillPass(sessionId: string, expectedUserId?: string) {
  const session = await paidSession(sessionId, expectedUserId);
  const { days, plan } = getPassPlan(session.metadata!.plan);
  const ref = passes().doc(session.id);
  // A replay or simultaneous webhook/return request must never extend validity.
  const pass = await adminDb().runTransaction(async transaction => {
    const existing = await transaction.get(ref);
    if (existing.exists) return existing.data() as PassRecord;
    const record: PassRecord = {
      passId: randomUUID(), sessionId: session.id, userId: session.metadata!.userId,
      name: session.metadata!.name || 'Explorer', plan,
      expiresAt: new Date((session.created + days * 86400) * 1000).toISOString(),
    };
    transaction.create(ref, record);
    return record;
  });
  return isPassActive(pass) ? publicPass(pass) : null;
}

export async function getExplorerPass(userId: string) {
  const snapshot = await passes().where('userId', '==', userId).get();
  const candidates = snapshot.docs.map(doc => doc.data() as PassRecord)
    .filter(pass => isPassActive(pass))
    .sort((a, b) => Date.parse(b.expiresAt) - Date.parse(a.expiresAt));
  for (const pass of candidates) {
    try {
      await paidSession(pass.sessionId, userId);
      return publicPass(pass);
    } catch (error) {
      // Refunds/disputes invalidate the pass. Infrastructure failures fail closed.
      if (!(error instanceof Error) || error.message !== 'Payment is pending, invalid, refunded, or disputed.') throw error;
    }
  }
  return null;
}

export async function verifyExplorerPass(passId: string) {
  if (!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(passId)) return null;
  const snapshot = await passes().where('passId', '==', passId).limit(1).get();
  if (snapshot.empty) return null;
  const pass = snapshot.docs[0].data() as PassRecord;
  if (!isPassActive(pass)) return null;
  await paidSession(pass.sessionId, pass.userId);
  return publicPass(pass);
}
