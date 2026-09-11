import assert from 'assert';
import { handleCheckoutSessionCompleted } from '../server/services/webhookService';
import { datastore } from '../server/datastore';
import Stripe from 'stripe';

async function runUnitTests() {
  console.log('Running Stripe integration contract tests...\n');

  // Test 1: Datastore Product Record Persistence
  console.log('Test 1: Datastore product persistence');
  const mockProduct = {
    productId: 'prod_test_123',
    priceId: 'price_test_123',
    name: 'Example Product',
    currency: 'usd',
    unitAmount: 2000,
    createdAt: new Date().toISOString(),
  };
  datastore.saveProduct(mockProduct);
  const retrievedProduct = datastore.getProduct();
  assert.strictEqual(retrievedProduct?.productId, 'prod_test_123');
  assert.strictEqual(retrievedProduct?.priceId, 'price_test_123');
  assert.strictEqual(retrievedProduct?.name, 'Example Product');
  assert.strictEqual(retrievedProduct?.unitAmount, 2000);
  console.log('✓ Test 1 passed: Product persisted and retrieved correctly.');

  // Test 2: Checkout Session Datastore Persistence
  console.log('\nTest 2: Datastore checkout session persistence');
  const mockSession = {
    sessionId: 'cs_test_abc123',
    priceId: 'price_test_123',
    url: 'https://checkout.stripe.com/c/pay/cs_test_abc123',
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  };
  datastore.saveCheckoutSession(mockSession);
  const retrievedSession = datastore.getCheckoutSession('cs_test_abc123');
  assert.strictEqual(retrievedSession?.sessionId, 'cs_test_abc123');
  assert.strictEqual(retrievedSession?.status, 'pending');
  console.log('✓ Test 2 passed: Checkout session saved with pending status.');

  // Test 3: Webhook Event checkout.session.completed Handler
  console.log('\nTest 3: Webhook event handling for checkout.session.completed');
  const completedEventObject: Stripe.Checkout.Session = {
    id: 'cs_test_abc123',
    object: 'checkout.session',
    amount_total: 2000,
    currency: 'usd',
    customer: 'cus_test_cust999',
    payment_intent: 'pi_test_intent888',
    status: 'complete',
    payment_status: 'paid',
  } as unknown as Stripe.Checkout.Session;

  await handleCheckoutSessionCompleted(completedEventObject);
  const updatedSession = datastore.getCheckoutSession('cs_test_abc123');
  assert.strictEqual(updatedSession?.status, 'completed');
  assert.strictEqual(updatedSession?.customerId, 'cus_test_cust999');
  assert.strictEqual(updatedSession?.paymentIntentId, 'pi_test_intent888');
  assert.strictEqual(updatedSession?.amountTotal, 2000);
  assert.ok(updatedSession?.completedAt);
  console.log('✓ Test 3 passed: checkout.session.completed successfully marked session as completed.');

  console.log('\n=================================================');
  console.log('All Stripe integration contract tests passed! (3/3)');
  console.log('=================================================');
}

runUnitTests().catch((err) => {
  console.error('Test failure:', err);
  process.exit(1);
});
