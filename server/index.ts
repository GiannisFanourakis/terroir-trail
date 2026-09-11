import dotenv from 'dotenv';
import { app } from './app';

dotenv.config();

const PORT = process.env.PORT || 4242;

app.listen(PORT, () => {
  console.log(Stripe server listening on http://localhost:);
  console.log(- Product endpoint: http://localhost:/api/create-product);
  console.log(- Checkout session: http://localhost:/api/create-checkout-session);
  console.log(- Webhook endpoint: http://localhost:/api/webhook);
});
