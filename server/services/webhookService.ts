import type Stripe from 'stripe';
import { stripe } from '../stripeClient';
import { fulfillPass } from './passService';

export async function handleWebhookEvent(
  rawBody: Buffer | string,
  signatureHeader?: string,
  fulfill = fulfillPass,
) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) throw new Error('Webhook signature and secret are required.');
  const event = stripe.webhooks.constructEvent(rawBody, signatureHeader, secret);
  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.metadata?.purpose === 'explorer_pass' && session.payment_status === 'paid') {
      await fulfill(session.id);
      return { processed: true, eventType: event.type };
    }
  }
  return { processed: false, eventType: event.type };
}
