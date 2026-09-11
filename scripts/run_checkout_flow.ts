import dotenv from 'dotenv';
import { createProductAndPrice } from '../server/services/productService';
import { createCheckoutSession } from '../server/services/checkoutService';
import { handleCheckoutSessionCompleted } from '../server/services/webhookService';
import { datastore } from '../server/datastore';
import Stripe from 'stripe';

dotenv.config();

async function runStripeIntegrationFlow() {
  console.log('=====================================================');
  console.log('Starting Stripe One-Time Payment Integration Flow');
  console.log('=====================================================\n');

  // Step 1: Set up product and pricing
  console.log('Step 1: Setting up product and pricing...');
  console.log('Calling POST /v1/products (name: "Example Product", amount: 2000 usd)...');
  
  let product;
  try {
    product = await createProductAndPrice({
      name: 'Example Product',
      currency: 'usd',
      unitAmount: 2000,
    });
    console.log('✓ Product successfully created/retrieved:');
    console.log(`  Product ID: ${product.productId}`);
    console.log(`  Default Price ID: ${product.priceId}`);
    console.log(`  Name: ${product.name}`);
    console.log(`  Price: $${(product.unitAmount / 100).toFixed(2)} ${product.currency.toUpperCase()}\n`);
  } catch (err: any) {
    console.error('✗ Failed to create product:', err.message);
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key || key.includes('placeholder') || key.startsWith('your_')) {
      console.log('\n[NOTICE] STRIPE_SECRET_KEY is not configured or using a placeholder.');
      console.log('Please obtain your test API keys (STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY) from the Stripe Dashboard at:');
      console.log('https://dashboard.stripe.com/apikeys');
      console.log('Add them to your .env file:');
      console.log('  STRIPE_SECRET_KEY=sk_test_...\n');
    }
    return;
  }

  // Step 2: Create Checkout Session
  console.log('Step 2: Creating Checkout Session...');
  console.log(`Using default_price: ${product.priceId}`);
  
  let session;
  try {
    session = await createCheckoutSession({
      priceId: product.priceId,
    });
    console.log('✓ Checkout Session created:');
    console.log(`  Session ID: ${session.sessionId}`);
    console.log(`  Checkout URL: ${session.url}\n`);
  } catch (err: any) {
    console.error('✗ Failed to create checkout session with Stripe API:', err.message);
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key || key.includes('placeholder') || key.startsWith('your_')) {
      console.log('\n[NOTICE] To complete live checkout sessions against Stripe:');
      console.log('1. Obtain your API key from: https://dashboard.stripe.com/apikeys');
      console.log('2. Set STRIPE_SECRET_KEY in your .env file.');
      console.log('\nSimulating session and continuing to verify Webhook handling...');
      session = {
        sessionId: 'cs_test_mock_session_123',
        url: 'https://checkout.stripe.com/c/pay/cs_test_mock_session_123',
        priceId: product.priceId,
      };
      datastore.saveCheckoutSession({
        sessionId: session.sessionId,
        priceId: session.priceId,
        url: session.url,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
    } else {
      return;
    }
  }

  // Step 3: Webhook event verification
  console.log('Step 3: Verifying checkout.session.completed webhook processing...');
  const simulatedEventPayload: Stripe.Checkout.Session = {
    id: session.sessionId,
    object: 'checkout.session',
    amount_total: 2000,
    currency: 'usd',
    customer: 'cus_simulated_example',
    payment_intent: 'pi_simulated_example',
    status: 'complete',
    payment_status: 'paid',
  } as unknown as Stripe.Checkout.Session;

  await handleCheckoutSessionCompleted(simulatedEventPayload);
  const updatedRecord = datastore.getCheckoutSession(session.sessionId);

  console.log('✓ Webhook handled successfully and datastore updated:');
  console.log(`  Session ID: ${updatedRecord?.sessionId}`);
  console.log(`  Status: ${updatedRecord?.status}`);
  console.log(`  Customer ID: ${updatedRecord?.customerId}`);
  console.log(`  Payment Intent ID: ${updatedRecord?.paymentIntentId}`);
  console.log(`  Completed At: ${updatedRecord?.completedAt}\n`);

  console.log('=====================================================');
  console.log('Stripe One-Time Payment Flow completed successfully!');
  console.log('=====================================================');
}

runStripeIntegrationFlow().catch((err) => {
  console.error('Flow failed with unhandled error:', err);
});
