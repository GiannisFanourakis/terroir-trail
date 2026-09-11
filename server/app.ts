import express, { Request, Response } from 'express';
import cors from 'cors';
import { createProductAndPrice } from './services/productService';
import { createCheckoutSession } from './services/checkoutService';
import { handleWebhookEvent } from './services/webhookService';
import { datastore } from './datastore';

export const app = express();

app.use(cors());

// Webhook endpoint requires raw body for signature verification
app.post(
  '/api/webhook',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response): Promise<void> => {
    const signature = req.headers['stripe-signature'] as string | undefined;

    try {
      const result = await handleWebhookEvent(req.body, signature);
      res.status(200).json({ received: true, ...result });
    } catch (err: any) {
      console.error('Webhook processing error:', err.message);
      res.status(400).send(Webhook Error: );
    }
  }
);

// JSON body parser for regular API routes
app.use(express.json());

// 1. Create Product & Price endpoint
app.post('/api/create-product', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, currency, unitAmount } = req.body || {};
    const product = await createProductAndPrice({ name, currency, unitAmount });
    res.status(201).json(product);
  } catch (err: any) {
    console.error('Error creating product:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 2. Create Checkout Session endpoint
app.post('/api/create-checkout-session', async (req: Request, res: Response): Promise<void> => {
  try {
    const { priceId, successUrl, cancelUrl } = req.body || {};
    const session = await createCheckoutSession({ priceId, successUrl, cancelUrl });
    res.status(200).json(session);
  } catch (err: any) {
    console.error('Error creating checkout session:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Retrieve single checkout session status
app.get('/api/checkout-session/:id', (req: Request, res: Response): void => {
  const session = datastore.getCheckoutSession(req.params.id);
  if (!session) {
    res.status(404).json({ error: 'Checkout session not found' });
    return;
  }
  res.status(200).json(session);
});

// Retrieve default product info
app.get('/api/product', async (_req: Request, res: Response): Promise<void> => {
  try {
    const product = await createProductAndPrice();
    res.status(200).json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response): void => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
