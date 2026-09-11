import { stripe } from '../stripeClient';
import { datastore, StripeCheckoutSessionRecord } from '../datastore';
import { createProductAndPrice } from './productService';

export interface CreateCheckoutSessionParams {
  priceId?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CreateCheckoutSessionResult {
  sessionId: string;
  url: string;
  priceId: string;
}

/**
 * Creates a Stripe Checkout Session for a one-time payment using the product default price.
 */
export async function createCheckoutSession(
  params?: CreateCheckoutSessionParams
): Promise<CreateCheckoutSessionResult> {
  let priceId = params?.priceId;

  // If no priceId provided, reuse or create the default product & price from step 1
  if (!priceId) {
    const productRecord = await createProductAndPrice();
    priceId = productRecord.priceId;
  }

  const successUrl =
    params?.successUrl ||
    'https://dashboard.stripe.com/workbench/blueprints/one-time-payment/checkout-chapter?confirmation-redirect=create-checkout-session';

  const cancelUrl =
    params?.cancelUrl ||
    'https://dashboard.stripe.com/workbench/blueprints/one-time-payment/checkout-chapter?confirmation-redirect=create-checkout-session';

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  if (!session.url) {
    throw new Error('Stripe Checkout Session did not return a valid URL.');
  }

  const record: StripeCheckoutSessionRecord = {
    sessionId: session.id,
    priceId,
    url: session.url,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  datastore.saveCheckoutSession(record);

  return {
    sessionId: session.id,
    url: session.url,
    priceId,
  };
}
