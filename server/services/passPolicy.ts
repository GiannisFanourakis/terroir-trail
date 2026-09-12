import type Stripe from 'stripe';

export type PassPlan = 'holiday' | 'annual';
export interface PassRecord {
  passId: string;
  sessionId: string;
  userId: string;
  name: string;
  plan: PassPlan;
  expiresAt: string;
}

export function getPassPlan(plan: unknown): { plan: PassPlan; priceId: string; days: number; amount: number } {
  if (plan !== 'holiday' && plan !== 'annual') throw new Error('Invalid pass plan.');
  const priceId = process.env[plan === 'holiday' ? 'STRIPE_HOLIDAY_PRICE_ID' : 'STRIPE_ANNUAL_PRICE_ID'];
  if (!priceId?.startsWith('price_')) throw new Error('Pass purchases are not configured.');
  return { plan, priceId, days: plan === 'holiday' ? 14 : 365, amount: plan === 'holiday' ? 1499 : 2999 };
}

// Only sessions created by our authenticated checkout endpoint can issue a pass.
export function validatePassPayment(session: Stripe.Checkout.Session, expectedUserId?: string) {
  if (session.metadata?.purpose !== 'explorer_pass' || !session.metadata.userId ||
      session.client_reference_id !== session.metadata.userId ||
      (expectedUserId && session.metadata.userId !== expectedUserId)) {
    throw new Error('This checkout does not belong to the signed-in explorer.');
  }
  const plan = getPassPlan(session.metadata.plan);
  const items = session.line_items;
  const intent = session.payment_intent;
  const charge = intent && typeof intent !== 'string' ? intent.latest_charge : null;
  if (session.mode !== 'payment' || session.status !== 'complete' || session.payment_status !== 'paid' ||
      session.currency !== 'eur' || session.amount_total !== plan.amount ||
      !items || items.has_more || items.data.length !== 1 ||
      items.data[0].price?.id !== plan.priceId || items.data[0].quantity !== 1 ||
      !charge || typeof charge === 'string' || !charge.paid || charge.refunded ||
      charge.amount_refunded > 0 || charge.disputed) {
    throw new Error('Payment is pending, invalid, refunded, or disputed.');
  }
  return plan;
}

export function isPassActive(pass: PassRecord, now = Date.now()) {
  return Number.isFinite(Date.parse(pass.expiresAt)) && Date.parse(pass.expiresAt) > now;
}

export function publicPass(pass: PassRecord) {
  return { passId: pass.passId, name: pass.name, plan: pass.plan, expiresAt: pass.expiresAt };
}
