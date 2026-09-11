import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_key';

// Initialize Stripe without specifying apiVersion unless blueprint specifies otherwise
export const stripe = new Stripe(stripeSecretKey);
