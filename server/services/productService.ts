import { stripe } from '../stripeClient';
import { datastore, StripeProductRecord } from '../datastore';

export interface CreateProductParams {
  name?: string;
  currency?: string;
  unitAmount?: number;
}

/**
 * Creates a product with default pricing according to the blueprint.
 * Reuses existing product from datastore if already created.
 */
export async function createProductAndPrice(params?: CreateProductParams): Promise<StripeProductRecord> {
  const existing = datastore.getProduct();
  if (existing) {
    try {
      await stripe.products.retrieve(existing.productId);
      return existing;
    } catch {
      // Product does not exist on this Stripe account (e.g., switched from test to live or mock), recreate
    }
  }

  const productName = params?.name || 'Example Product';
  const currency = params?.currency || 'usd';
  const unitAmount = params?.unitAmount ?? 2000;

  const product = await stripe.products.create({
    name: productName,
    default_price_data: {
      currency,
      unit_amount: unitAmount,
    },
  });

  const priceId = typeof product.default_price === 'string'
    ? product.default_price
    : product.default_price?.id || '';

  const record: StripeProductRecord = {
    productId: product.id,
    priceId,
    name: product.name,
    currency,
    unitAmount,
    createdAt: new Date().toISOString(),
  };

  datastore.saveProduct(record);
  return record;
}
