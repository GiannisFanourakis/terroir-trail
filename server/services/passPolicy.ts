import type Stripe from 'stripe';

export type PassPlan = 'holiday' | 'annual';

export interface PassRecord {
  passId: string;
  sessionId: string;
  subscriptionId?: string;
  customerId?: string;
  userId: string;
  name: string;
  plan: PassPlan;
  expiresAt: string;
  consumerConsentAt?: string;
  consumerTermsVersion?: string;
}

export interface PassPlanConfig {
  plan: PassPlan;
  priceId: string;
  days: number;
  amount: number;
  checkoutMode: 'payment' | 'subscription';
}

const stripeStringId = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim()) return value;
  if (
    value &&
    typeof value === 'object' &&
    typeof (value as any).id === 'string'
  ) {
    return (value as any).id;
  }
  return null;
};
export function getPassPlan(plan: unknown): PassPlanConfig {
  if (plan !== 'holiday' && plan !== 'annual') {
    throw new Error('Invalid pass plan.');
  }
  const priceId =
    process.env[
      plan === 'holiday' ? 'STRIPE_HOLIDAY_PRICE_ID' : 'STRIPE_ANNUAL_PRICE_ID'
    ];
  if (!priceId?.startsWith('price_')) {
    throw new Error('Pass purchases are not configured.');
  }
  return {
    plan,
    priceId,
    days: plan === 'holiday' ? 14 : 365,
    amount: plan === 'holiday' ? 999 : 2499,
    checkoutMode: plan === 'holiday' ? 'payment' : 'subscription',
  };
}

const commonCheckoutIsValid = (
  session: Stripe.Checkout.Session,
  plan: PassPlanConfig,
  expectedUserId?: string
) =>
  session.metadata?.purpose === 'explorer_pass' &&
  Boolean(session.metadata.userId) &&
  session.client_reference_id === session.metadata?.userId &&
  (!expectedUserId || session.metadata?.userId === expectedUserId) &&
  session.status === 'complete' &&
  session.payment_status === 'paid' &&
  session.currency === 'eur' &&
  session.amount_total === plan.amount &&
  Boolean(session.line_items) &&
  session.line_items?.has_more === false &&
  session.line_items?.data.length === 1 &&
  session.line_items?.data[0].price?.id === plan.priceId &&
  session.line_items?.data[0].quantity === 1;
export function validatePassPayment(
  session: Stripe.Checkout.Session,
  expectedUserId?: string
): PassPlanConfig {
  if (
    session.metadata?.purpose !== 'explorer_pass' ||
    !session.metadata.userId ||
    session.client_reference_id !== session.metadata.userId ||
    (expectedUserId && session.metadata.userId !== expectedUserId)
  ) {
    throw new Error('This checkout does not belong to the signed-in explorer.');
  }

  const plan = getPassPlan(session.metadata.plan);
  if (
    !commonCheckoutIsValid(session, plan) ||
    session.mode !== plan.checkoutMode
  ) {
    throw new Error('Payment is pending, invalid, refunded, or disputed.');
  }

  if (plan.plan === 'holiday') {
    const intent = session.payment_intent;
    const charge =
      intent && typeof intent !== 'string' ? intent.latest_charge : null;
    if (
      !charge ||
      typeof charge === 'string' ||
      !charge.paid ||
      charge.refunded ||
      charge.amount_refunded > 0 ||
      charge.disputed
    ) {
      throw new Error('Payment is pending, invalid, refunded, or disputed.');
    }
  } else if (!stripeStringId(session.subscription)) {
    throw new Error('Payment is pending, invalid, refunded, or disputed.');
  }

  return plan;
}
const subscriptionPeriodEndSeconds = (
  subscription: Stripe.Subscription
): number | null => {
  const raw = subscription as any;
  if (typeof raw.current_period_end === 'number') {
    return raw.current_period_end;
  }
  for (const item of raw.items?.data || []) {
    if (typeof item?.current_period_end === 'number') {
      return item.current_period_end;
    }
  }
  return null;
};

export function validateAnnualSubscription(
  subscription: Stripe.Subscription,
  expectedUserId?: string
): { expiresAt: string; customerId: string } {
  const config = getPassPlan('annual');
  const metadata = subscription.metadata || {};
  const hasPrice = (subscription.items?.data || []).some(
    (item: any) => stripeStringId(item?.price) === config.priceId
  );
  const customerId = stripeStringId(subscription.customer);
  const periodEnd = subscriptionPeriodEndSeconds(subscription);

  if (
    metadata.purpose !== 'explorer_pass' ||
    metadata.plan !== 'annual' ||
    !metadata.userId ||
    (expectedUserId && metadata.userId !== expectedUserId) ||
    subscription.status !== 'active' ||
    !hasPrice ||
    !customerId ||
    !periodEnd
  ) {
    throw new Error('Payment is pending, invalid, refunded, or disputed.');
  }

  const expiresAt = new Date(periodEnd * 1000).toISOString();
  if (
    !Number.isFinite(Date.parse(expiresAt)) ||
    Date.parse(expiresAt) <= Date.now()
  ) {
    throw new Error('Payment is pending, invalid, refunded, or disputed.');
  }
  return { expiresAt, customerId };
}
export function isPassActive(pass: PassRecord, now = Date.now()) {
  return (
    Number.isFinite(Date.parse(pass.expiresAt)) &&
    Date.parse(pass.expiresAt) > now
  );
}

export function publicPass(pass: PassRecord) {
  return {
    passId: pass.passId,
    name: pass.name,
    plan: pass.plan,
    expiresAt: pass.expiresAt,
  };
}
