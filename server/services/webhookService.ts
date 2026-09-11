import Stripe from 'stripe';
import { stripe } from '../stripeClient';
import { datastore, StripeCheckoutSessionRecord } from '../datastore';

export interface WebhookProcessingResult {
  processed: boolean;
  eventType: string;
  sessionId?: string;
  record?: StripeCheckoutSessionRecord;
}

/**
 * Handles incoming Stripe webhook events.
 * Specifically listens for checkout.session.completed and confirms payment success.
 */
export async function handleWebhookEvent(
  rawBody: Buffer | string,
  signatureHeader?: string
): Promise<WebhookProcessingResult> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  if (webhookSecret && signatureHeader) {
    try {
      event = stripe.webhooks.constructEvent(rawBody, signatureHeader, webhookSecret);
    } catch (err: any) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }
  } else {
    // When testing or if webhook secret is not set, parse payload directly
    const bodyString = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf-8');
    event = JSON.parse(bodyString);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const updated = await handleCheckoutSessionCompleted(session);
    return {
      processed: true,
      eventType: event.type,
      sessionId: session.id,
      record: updated,
    };
  }

  return {
    processed: false,
    eventType: event.type,
  };
}

/**
 * Processes checkout.session.completed event and updates the datastore.
 */
export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
): Promise<StripeCheckoutSessionRecord | undefined> {
  const customerId = typeof session.customer === 'string'
    ? session.customer
    : session.customer?.id;

  const paymentIntentId = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id;

  return datastore.updateCheckoutSessionStatus(session.id, {
    status: 'completed',
    customerId,
    paymentIntentId,
    amountTotal: session.amount_total || undefined,
    currency: session.currency || undefined,
    completedAt: new Date().toISOString(),
  });
}
